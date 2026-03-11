# Debate Partner

An open, AI-powered debate partner to practice arguments and get quick verdicts.

## Aims
- Open access: runs locally with a free-tier key; deployable to free/cheap hosts.
- Skill building: fast back-and-forth debates plus a concise verdict.
- Simple deploy: PHP proxy for static hosts, Netlify/Vercel friendly, localhost works without CORS.

## Screenshots
<details>
  <summary>Click to expand</summary>

  ![Home](docs/screenshots/home.svg)

  ![Debate](docs/screenshots/debate.svg)

  ![API Settings](docs/screenshots/api-settings.svg)

  Replace the placeholder `.svg` files in `docs/screenshots/` with real PNG/JPG screenshots (keep the same filenames) and GitHub will render them here.
</details>

---

## Local Development (localhost)

Prereqs: Node 18+ and npm.

```bash
git clone https://github.com/JannickBontenbal/DebatePartner
cd DebatePartner
npm install
npm start   # opens http://localhost:3000
```

First run:
- The **API Settings** modal opens automatically.
- Paste your API key and endpoint, click **Save & Verify** (this stores in `localStorage` and overrides any `.env`).

Optional `.env` (only if you prefer defaults or CI):
```
REACT_APP_FREE_LLM_API_KEY=
REACT_APP_FREE_LLM_API_URL=https://apifreellm.com/api/v1/chat
# REACT_APP_DISABLE_PROXY=false
```

How AI calls work locally:
- Frontend hits `/api/dev-llm` handled by `src/setupProxy.js` (server-side fetch with your key).
- Supported providers (auto-detected by URL):
  - ApiFreeLLM (`message` payload)
  - OpenAI (`/chat/completions`)
  - OpenRouter (`/chat/completions`)
  - Anthropic (`/v1/messages`)
- No CORS issues; key never leaves the dev server in responses.

Port in use? `PORT=3001 npm start` or close the other process.

---

## Production Deploy (simple PHP host)

This repo includes `api/ai.php` so you can host on a basic PHP/shared host.

1) `npm run build`
2) Upload contents of `build/` to `public_html/`
3) Create `public_html/api/` and upload:
   - `api/ai.php`
   - `api/.htaccess`
   - `api/config.php` (copy from `config.example.php` and put your real key; never commit it)
4) Visit your domain; `/api/ai.php` should return "Method not allowed" on GET (expected).

No env vars on the host? Use `api/config.php` as above.

---

## Netlify (serverless proxy)

1) Connect the repo in Netlify.
2) Build command: `npm run build`
3) Publish directory: `build`
4) Functions directory: `netlify/functions`
5) Add env var `FREE_LLM_API_KEY=<your key>` (or `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`).
6) Deploy. Frontend calls `/.netlify/functions/ai`.

---

## Vercel
- Static build works; set `FREE_LLM_API_KEY` in project settings.
- You can adapt `netlify/functions/ai.js` as a Vercel function if you want server-side keys.

---

## Project Structure

```
src/
├── components/           # UI building blocks
├── hooks/                # State + behavior
├── utils/                # API + helpers
├── setupProxy.js         # Local dev proxy to avoid CORS
├── App.js
├── index.js
└── index.css
public/                   # CRA static assets + SPA .htaccess
api/                      # PHP proxy for static hosts
netlify/functions/ai.js   # Netlify serverless proxy
```

---

## Customisation
- Prompts & persona: `src/hooks/useDebate.js`
- Quick topics & colors: `src/utils/constants.js`
- API endpoint/model: `src/utils/claude.js`
- PHP proxy target: `api/ai.php`
- API Settings modal: opens automatically on first run (or via the “API Settings” button) to set key/endpoint; values stored in `localStorage` take priority over `.env`.

---

## Notes on Keys
- Development: keep key in `.env` (`REACT_APP_FREE_LLM_API_KEY`).
- PHP/static hosting: use `api/config.php` (keep private).
- Netlify/Vercel: set server env vars; avoid `REACT_APP_*` for production.

---

## License

This project is licensed under **CC BY-NC 4.0** — remix and improve non-commercially, with attribution to **Jannick Bontenbal**. See `LICENSE`.
