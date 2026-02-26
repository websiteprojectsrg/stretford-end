# The Stretford End — Manchester United Fan Blog

A Next.js fan blog with AI-powered live news, reading from Supabase and auto-scraping Man Utd news every 2 hours via Anthropic API + web search.

---

## 🗂 Project Structure

```
stretford-end/
├── pages/
│   ├── index.js              ← Main site (homepage + article view)
│   ├── _app.js               ← Next.js wrapper
│   └── api/
│       ├── articles.js       ← GET /api/articles — fetch from Supabase
│       └── cron/
│           └── scrape.js     ← GET /api/cron/scrape — AI news scraper
├── lib/
│   └── supabase.js           ← Supabase client (public + service)
├── styles/
│   └── globals.css
├── supabase/
│   └── migrations/
│       ├── 001_create_articles.sql   ← Run this first in Supabase SQL editor
│       └── 002_seed_articles.sql     ← Optional: seed via SQL editor
├── setup-db.js               ← One-time DB seed script
├── vercel.json               ← Cron schedule (every 2 hours)
├── .env.local                ← Your secrets (never commit this)
└── package.json
```

---

## 🚀 Deployment Steps

### Step 1 — Set up the Supabase database

1. Go to: https://supabase.com/dashboard/project/kbcowhkqgxptkllvmgre/sql/new
2. Paste the entire contents of `supabase/migrations/001_create_articles.sql`
3. Click **Run** — you should see "Success"
4. Then paste the entire contents of `supabase/migrations/002_seed_articles.sql`
5. Click **Run** — this loads the 10 fan-written articles

### Step 2 — Push code to GitHub

Open a terminal on your computer and run these commands:

```bash
# Navigate to this folder (adjust path as needed)
cd stretford-end

# Initialise git
git init
git add .
git commit -m "Initial commit — The Stretford End"

# Connect to your GitHub repo and push
git remote add origin https://github.com/websiteprojectsrg/stretford-end.git
git branch -M main
git push -u origin main
```

### Step 3 — Deploy to Vercel

1. Go to **vercel.com** and sign in with your GitHub account
2. Click **"Add New Project"**
3. Find and select **"stretford-end"** from your GitHub repos
4. Click **Import**
5. On the configuration page, **add these Environment Variables** (click "Add" for each):

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kbcowhkqgxptkllvmgre.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiY293aGtxZ3hwdGtsbHZtZ3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjA4NDksImV4cCI6MjA4NzY5Njg0OX0.HOfw2kFFBWtL8VZJguR0_YIBRS-nyh0q75EvgClBq3A` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiY293aGtxZ3hwdGtsbHZtZ3JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjEyMDg0OSwiZXhwIjoyMDg3Njk2ODQ5fQ.QcNLvNMvgj9L4TcvEwYyUxQfYsBW19EykP9Vfbq2m0Y` |
| `ANTHROPIC_API_KEY` | *(your current Anthropic API key)* |
| `CRON_SECRET` | `stretford-cron-s3cr3t-2026` |

6. Click **Deploy** — Vercel will build and deploy automatically

### Step 4 — Trigger the first news scrape

Once deployed, trigger the first AI news scrape manually:

```
https://your-vercel-url.vercel.app/api/cron/scrape
```

Add the auth header or temporarily remove the secret check for the first run. Or just wait — it will auto-run within 2 hours on the cron schedule.

---

## ⏰ Cron Schedule

The scraper runs automatically every 2 hours via `vercel.json`:
- Searches the web for recent Man Utd news
- Rewrites 6 articles in neutral journalist voice
- Saves to Supabase
- Deletes AI articles older than 48 hours

---

## 🔧 Local Development

```bash
npm install
npm run dev
# Visit http://localhost:3000
```

---

## 📝 Adding New Fan Articles

Insert directly into Supabase:
1. Go to: https://supabase.com/dashboard/project/kbcowhkqgxptkllvmgre/editor
2. Run an INSERT query, or use the Table Editor UI
3. Set `is_live: false` for fan articles, `published: true`
