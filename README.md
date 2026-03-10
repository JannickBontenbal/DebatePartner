# 🎤 Debate Partner

An AI-powered debate arena. Pick any topic, choose your side, and argue against a sharp Claude-powered opponent. Request a verdict when you're done.

## ✨ Features

- **Topic setup** — type a topic, paste an article, or upload a `.txt` / `.md` / `.docx` file
- **Side selection** — argue FOR or AGAINST; the AI takes the opposite position
- **Live debate** — back-and-forth arguments with a typing indicator
- **Judge's verdict** — impartial AI verdict with feedback for both sides after 2+ rounds
- **Awwwards-level UI** — custom cursor, marquee ticker, editorial typography, hard-shadow brutalist cards

---

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone <your-repo-url>
cd debate-app
npm install
```

### 2. Add your API key

```bash
cp .env.example .env
# Edit .env and paste your Anthropic API key
```

Get your key at: https://console.anthropic.com/

> ⚠️ **Security note:** The key is sent in browser requests. For a production app, proxy API calls through your own backend server so the key stays private.

### 3. Run locally

```bash
npm start
# Opens at http://localhost:3000
```

---

## 🌐 Deployment

### Vercel (recommended — one command)

```bash
npm install -g vercel
vercel
```

Add `REACT_APP_ANTHROPIC_API_KEY` as an Environment Variable in your Vercel project dashboard.

### Netlify

```bash
npm run build
# Drag the build/ folder into app.netlify.com/drop
```

Add `REACT_APP_ANTHROPIC_API_KEY` under Site Settings → Environment Variables.

### GitHub Pages

```bash
npm install --save-dev gh-pages
# Add to package.json scripts:
#   "predeploy": "npm run build",
#   "deploy": "gh-pages -d build"
# Add "homepage": "https://<username>.github.io/<repo>" to package.json
npm run deploy
```

### Any static host (Render, Cloudflare Pages, S3…)

```bash
npm run build
# Upload the contents of build/ to your host
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── DebatePartner.js   # Root layout + stage router
│   ├── SetupStage.js      # Topic input + file upload
│   ├── ChooseSideStage.js # FOR / AGAINST picker
│   ├── DebateStage.js     # Message feed + input
│   ├── Marquee.js         # Animated ticker
│   └── CustomCursor.js    # Orange dot cursor
├── hooks/
│   ├── useDebate.js       # All debate state + API calls
│   └── useCursor.js       # Mouse position tracker
├── utils/
│   ├── claude.js          # Anthropic API wrapper
│   ├── fileExtract.js     # .txt/.md/.docx → text
│   └── constants.js       # Colors, stages, config
├── App.js
├── index.js
└── index.css              # Global styles + keyframes
public/
└── index.html
```

---

## 🔧 Customisation

| What | Where |
|------|-------|
| AI model | `src/utils/claude.js` → `MODEL` |
| Quick-topic pills | `src/utils/constants.js` → `QUICK_TOPICS` |
| Colours | `src/utils/constants.js` → `COLORS` |
| AI debate persona | `src/hooks/useDebate.js` → system prompts |
| Max response length | `src/utils/claude.js` → `maxTokens` default |

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `react` / `react-dom` | UI framework |
| `react-scripts` | CRA build tooling |
| `mammoth` | `.docx` → plain text extraction |

---

## Netlify AI setup (important)

When hosted on Netlify, this app now calls `/.netlify/functions/ai` so your API key stays server-side.

Set one of these in Netlify Project Settings -> Environment variables:

- `FREE_LLM_API_KEY` (uses `https://apifreellm.com/api/v1/chat` by default)
- `OPENROUTER_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

Optional model/url overrides:

- `FREE_LLM_API_URL`
- `FREE_LLM_MODEL`
- `OPENROUTER_MODEL`
- `OPENAI_MODEL`
- `ANTHROPIC_MODEL`

Do not use `REACT_APP_*` secrets for production deploys unless you intentionally want browser-side direct calls.

---

## free-hosting.org deployment

This repo includes a PHP proxy at `api/ai.php` for hosts that support PHP.

1. Build locally:
   - `npm run build`
2. Upload contents of `build/` to `public_html/`
3. Create folder `public_html/api/`
4. Upload these files into `public_html/api/`:
   - `api/ai.php`
   - `api/.htaccess`
   - `api/config.php`
5. Open your domain and test.

The frontend calls `/api/ai.php` by default via `REACT_APP_AI_PROXY_URL`.

If your host has no environment variable feature:

1. Copy `api/config.example.php` to `api/config.php`
2. Put your real `FREE_LLM_API_KEY` in that file
3. Upload `api/config.php` with `api/ai.php`

If your host is cPanel File Manager only:

1. In File Manager open `public_html`
2. Upload a ZIP of the local `build` contents and extract into `public_html`
3. Upload a ZIP with the local `api` folder and extract into `public_html/api`
4. Confirm these URLs:
   - `/index.html` loads
   - `/api/ai.php` returns `Method not allowed` on GET (expected)
5. Test app UI.

---

## License

MIT
