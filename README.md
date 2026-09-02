# Tahir Bot 🤖💀

A savage Hinglish roast chatbot — swear at him and watch the rage climb. No AI, no API, no nonsense. Pure JavaScript brain with a shuffle-bag of savage replies.

## Features

- 🗣️ **Hinglish Detection** — Auto-detects Hindi/Urdu vs English and replies in the same language
- 🔥 **Savage Replies** — 200+ curated roast responses for Hindi and English insults
- 🎭 **Personality Topics** — Responds to smokes, food, love, cricket, games, movies, brainrot slang, and more
- 🛡️ **Leet-Speak Filter** — Catches `f*ck`, `sh1t`, `ch*tiya`, and other censored variations
- 📱 **PWA Support** — Installable on mobile, works offline with service worker caching
- 🎨 **Animated UI** — Aurora, stars, floating bubbles, and emoji rain background effects
- 💀 **Rage Counter** — Tracks insults in real-time with a glowing counter display
- 🌙 **Dark Theme** — Sleek glassmorphism design

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Vanilla HTML / CSS / JavaScript |
| Styling | CSS glassmorphism + keyframe animations |
| PWA | Service Worker + Web App Manifest |
| AI | None — regex keyword matching + shuffle-bag replies |

## Project Structure

```
├── index.html            # App shell, chat UI, background effects
├── app.js                # Chatbot brain — language detection, rules, replies
├── style.css             # Full UI styling (glassmorphism, animations)
├── service-worker.js     # PWA offline caching
├── manifest.json         # Web App Manifest for PWA install
├── icon-192.png          # App icon (192x192)
├── icon-512.png          # App icon (512x512)
└── apple-touch-icon.png  # iOS home screen icon
```

## Getting Started

### Run Locally

No build step needed. Just open `index.html` in any modern browser:

```bash
# Clone the repo
git clone https://github.com/ZaidAhamed05/tahirbot.git
cd tahirbot

# Open in browser (use a local server for PWA features)
npx serve .
```

> **Note:** PWA features (install prompt, offline caching) require a local server — opening `index.html` directly via `file://` won't trigger the service worker.

### Deploy

Drop these files into any static hosting service:

- **GitHub Pages** — Push to `gh-pages` branch or enable in repo settings
- **Netlify** — Drag & drop the folder
- **Vercel** — Connect the repo and deploy as static

## How It Works

1. User types a message
2. Language is detected (Hindi/Urdu vs English) via regex
3. Message is normalized — leet speak decoded, repeated chars collapsed
4. Pattern-matched against ~40+ regex rules (gaalis, topics, greetings)
5. A random reply is picked from the rule's shuffle bag
6. Reply is rendered with typing delay animation

## License

MIT
