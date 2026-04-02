# Podnova — AI Podcast Generator

> Turn any idea into a professional podcast in **under 2 minutes**.

Podnova is a production-grade AI pipeline that converts a user prompt into a fully generated podcast:
**script → enhancement → voice synthesis → audio output.**

---

## ⚡ Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), Tailwind CSS v3, Framer Motion |
| Backend | Next.js API Routes (serverless) |
| Database & Storage | **InsForge** (agentic BaaS) |
| Script Generation | **Mistral AI** (`mistral-medium-latest`) |
| Script Enhancement | **HuggingFace** (Mistral-7B-Instruct) |
| Voice Synthesis | **ElevenLabs** (`eleven_turbo_v2_5`) |
| Icons | Lucide React |

---

## 🗂 Folder Structure

```
podnova/
├── app/
│   ├── api/
│   │   ├── generate/route.js      # Main AI pipeline
│   │   ├── podcasts/route.js      # List / delete podcasts
│   │   ├── podcasts/[id]/route.js # Get single podcast
│   │   └── health/route.js        # Health check
│   ├── globals.css
│   ├── layout.js
│   └── page.js                    # Root page (full UX)
├── components/
│   ├── Navbar.jsx                 # Floating nav
│   ├── HeroSection.jsx            # Landing hero
│   ├── PromptInput.jsx            # Main generation form
│   ├── PipelineStatus.jsx         # Animated step tracker
│   ├── AudioPlayer.jsx            # Custom audio player
│   ├── ScriptViewer.jsx           # Collapsible script display
│   ├── PodcastCard.jsx            # Library card
│   ├── HowItWorks.jsx             # 4-step explainer
│   └── Footer.jsx
├── lib/
│   ├── ai/
│   │   ├── mistral.js             # Script generation
│   │   ├── huggingface.js         # Script enhancement
│   │   └── elevenlabs.js          # Text-to-speech
│   ├── audio/
│   │   └── processor.js           # Buffer merge, base64
│   ├── db/
│   │   └── podcasts.js            # InsForge DB layer
│   ├── insforge.js                # SDK singleton
│   └── utils.js                   # Shared helpers
├── .env.local                     # Local secrets (gitignored)
├── .env.example                   # Template for all keys
├── tailwind.config.js
├── next.config.js
└── jsconfig.json
```

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone git@github.com:mohan-coder444/Podnova.git
cd Podnova
npm install
```

### 2. Add API Keys

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|----------|----------------|
| `MISTRAL_API_KEY` | [console.mistral.ai](https://console.mistral.ai/) |
| `HUGGINGFACE_API_KEY` | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| `ELEVENLABS_API_KEY` | [elevenlabs.io](https://elevenlabs.io/) |
| `INSFORGE_BASE_URL` | Pre-filled (your project URL) |
| `INSFORGE_API_KEY` | Pre-filled (anon key) |

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Check Health

```
GET http://localhost:3000/api/health
```

This confirms all your API keys and DB are connected before you generate.

---

## 🔄 AI Pipeline

```
User Prompt
    │
    ▼
POST /api/generate
    │
    ├─ 1. Create DB record (status: processing)
    │
    ├─ 2. Mistral API → structured JSON script + segments
    │
    ├─ 3. HuggingFace → enhance each segment for natural speech
    │
    ├─ 4. ElevenLabs → TTS each segment → MP3 ArrayBuffers
    │
    ├─ 5. Merge ArrayBuffers → single MP3 Uint8Array
    │
    ├─ 6. Upload to InsForge Storage bucket (podcast-audio)
    │
    ├─ 7. Update DB record (status: done, audio_url, script...)
    │
    └─ 8. Return podcast object → client renders AudioPlayer
```

---

## 🔒 Security

- All API keys are **server-side only** (API Routes) — never sent to the browser
- InsForge anon key is intentionally public-safe (anon role with RLS)
- InsForge admin API key stays in `.env.local` (gitignored)
- RLS enabled on `podcasts` table — all-access policy until auth is added
- `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection` headers on all API routes

---

## 🗃 Database Schema

```sql
CREATE TABLE podcasts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT NOT NULL DEFAULT 'anonymous',
  topic            TEXT NOT NULL,
  title            TEXT,
  description      TEXT,
  script           TEXT,
  script_json      TEXT,          -- full Mistral JSON with segments
  options          JSONB,
  status           TEXT,          -- idle | generating_script | enhancing | synthesizing | processing_audio | uploading | done | error
  step             TEXT,
  error_message    TEXT,
  audio_url        TEXT,
  audio_size       TEXT,
  duration_minutes NUMERIC(5,2),
  keywords         TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);
```

---

## 📦 Deploy

Deploy to InsForge hosting:

```bash
npm run build
npx @insforge/cli deployments deploy ./
```

---

## 🛣 Roadmap

- [ ] User authentication (InsForge Auth — Google/GitHub)
- [ ] Voice selection UI (multiple ElevenLabs voices)
- [ ] Background music mixing (FFmpeg server job)
- [ ] Multi-host / dialogue format
- [ ] RSS feed for podcast distribution
- [ ] Stripe payments for premium tiers
