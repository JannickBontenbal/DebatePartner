<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);

if (!is_array($input)) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid JSON body']);
  exit;
}

$system = $input['system'] ?? '';
$messages = $input['messages'] ?? [];

if (!is_array($messages)) {
  http_response_code(400);
  echo json_encode(['error' => 'messages must be an array']);
  exit;
}

// Flatten system + chat history to the single `message` field expected by apifreellm.
$promptParts = [];
if (!empty($system)) {
  $promptParts[] = "System:\n" . $system;
}

foreach ($messages as $m) {
  $role = isset($m['role']) ? $m['role'] : 'user';
  $content = isset($m['content']) ? $m['content'] : '';
  $promptParts[] = $role . ":\n" . $content;
}

$prompt = implode("\n\n", $promptParts);
$apiUrl = getenv('FREE_LLM_API_URL') ?: 'https://apifreellm.com/api/v1/chat';
$apiKey = getenv('FREE_LLM_API_KEY');

// Shared hosting fallback: load credentials from local config file.
$configPath = __DIR__ . DIRECTORY_SEPARATOR . 'config.php';
if ((!$apiKey || trim($apiKey) === '') && file_exists($configPath)) {
  $cfg = include $configPath;
  if (is_array($cfg)) {
    if (!$apiKey && !empty($cfg['FREE_LLM_API_KEY'])) $apiKey = $cfg['FREE_LLM_API_KEY'];
    if (!empty($cfg['FREE_LLM_API_URL'])) $apiUrl = $cfg['FREE_LLM_API_URL'];
  }
}

if (!$apiKey) {
  http_response_code(500);
  echo json_encode(['error' => 'Missing server key FREE_LLM_API_KEY']);
  exit;
}

$payload = ['message' => $prompt];
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json',
  'Authorization: Bearer ' . $apiKey,
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_TIMEOUT, 45);

$response = curl_exec($ch);
$curlErr = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($curlErr) {
  http_response_code(502);
  echo json_encode(['error' => 'Upstream request failed: ' . $curlErr]);
  exit;
}

$data = json_decode($response, true);
if (!is_array($data)) {
  http_response_code(502);
  echo json_encode(['error' => 'Invalid upstream response']);
  exit;
}

if ($httpCode >= 400 || (isset($data['success']) && $data['success'] === false)) {
  http_response_code($httpCode >= 400 ? $httpCode : 502);
  echo json_encode(['error' => $data['error'] ?? 'Upstream API error']);
  exit;
}

$text = $data['response'] ?? $data['text'] ?? '';
echo json_encode(['text' => $text]);
