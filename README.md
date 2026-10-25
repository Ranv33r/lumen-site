# Lumen

A minimal, aesthetic website with a static front end and a serverless backend. No database, no framework, no build step.

```
lumen-site/
├── public/            # static front end (served from Vercel's edge CDN)
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── api/               # backend: each file is a Vercel Function
│   ├── health.js      # GET  /api/health
│   ├── quote.js       # GET  /api/quote
│   └── contact.js     # POST /api/contact
├── vercel.json        # caching, security headers, function limits
└── package.json
```

## Deploy

**Option A: GitHub (recommended)**
1. Push this folder to a GitHub repo.
2. On vercel.com → Add New → Project → import the repo.
3. Leave Framework Preset as **Other**, no build command. Deploy.

**Option B: CLI**
```bash
npm i -g vercel
vercel          # preview deploy
vercel --prod   # production
```

## Run locally
```bash
vercel dev      # serves public/ and api/ at http://localhost:3000
```

## Optional: receive contact messages
Messages are never stored. By default they appear in Vercel → Project → Logs.
To get them in Discord or Slack, add an environment variable in Vercel → Settings → Environment Variables:

```
CONTACT_WEBHOOK_URL = <your Discord or Slack incoming-webhook URL>
```

## What's optimized for Vercel
- Static assets in `public/` are served from the edge CDN with year-long immutable caching; HTML always revalidates.
- API functions use 128 MB memory and a 10 s cap, cheap and fast cold starts with zero dependencies.
- Security headers (nosniff, frame-deny, referrer and permissions policy) on every response.
- `cleanUrls` for tidy paths; fonts preconnected; scripts deferred; reduced-motion respected.
