# World Cup 2026 Bracket

A simple, ESPN-style knockout bracket game for the 2026 World Cup that you can share
with friends. Friends fill out a bracket, submit it with just a name (no email / no
login), view everyone else's brackets, and compete on a leaderboard. You enter the real
results from a password-protected admin page.

Built with **Next.js (App Router) + TypeScript + Tailwind**, storing data in **Vercel
Postgres**, and designed to deploy to **Vercel** in a few clicks.

## How it works

- The knockout bracket is the standard 2026 format: **Round of 32 → Round of 16 →
  Quarterfinals → Semifinals → Final**, plus a third-place playoff (32 matches total).
- You (the organizer) set the **32 teams** in the Round of 32 on the admin page.
- Friends pick a winner for every match. A bracket is **submit-once** — there's no login,
  so this keeps people from overwriting each other. If someone messes up, they just submit
  a new one.
- As real matches finish, you enter the winners on the admin page. The leaderboard scores
  every bracket automatically.

### Scoring (per correct pick)

| Round | Points |
| ----- | ------ |
| Round of 32 | 1 |
| Round of 16 | 2 |
| Quarterfinal | 3 |
| Semifinal | 4 |
| Third place | 3 |
| Final | 5 |

Edit `ROUND_POINTS` in `lib/bracket.ts` to change these.

## Pages

| Path | What it is |
| ---- | ---------- |
| `/` | Home: intro + list of submitted brackets with scores |
| `/bracket/new` | Interactive bracket builder (submit with your name) |
| `/bracket/[id]` | View one person's bracket (green = correct, red = wrong) |
| `/leaderboard` | Everyone ranked by points |
| `/admin` | Password-gated: set teams, enter results, lock submissions |

## Deploy to Vercel

1. **Push to GitHub.** Create a repo and push this project.
2. **Import to Vercel.** In the Vercel dashboard → *Add New → Project* → import the repo.
   Framework is auto-detected as Next.js.
3. **Add a Postgres database.** In the project → *Storage* tab → create a **Postgres**
   database and connect it. Vercel adds the `POSTGRES_*` env vars automatically.
4. **Set the admin password.** Project → *Settings → Environment Variables* → add
   `ADMIN_PASSWORD` = something only you know. Redeploy so it takes effect.
5. **Initialize the database.** Open `https://your-app.vercel.app/admin`, type your admin
   password, and click **Initialize database** (creates the tables — safe to click once).
6. **Enter the teams.** On the admin page, fill in the 32 Round-of-32 teams (name + a
   2-letter country code for the flag, e.g. `br`, `us`, `fr`) and click **Save teams**.
7. **Share the link.** Send `https://your-app.vercel.app` to your friends.
8. **During the tournament:** enter winners on the admin page as matches finish and click
   **Save results**. Click **Lock submissions** once the knockout stage begins so no one
   can submit after seeing results.

## Run locally

```bash
npm install

# Connect to your Vercel Postgres for local dev (after importing the project once):
#   npm i -g vercel && vercel link && vercel env pull .env.local
# ...or copy .env.local.example to .env.local and fill in the values manually.

npm run dev
```

Then open http://localhost:3000, go to `/admin`, click **Initialize database**, and add teams.

> Note: the app needs a Postgres connection to store data. `npm run build` works without
> one (pages are rendered on-demand), but the running app reads/writes the database.

## Customizing

- **Scoring weights:** `ROUND_POINTS` in `lib/bracket.ts`.
- **Include/exclude third place:** remove the `M32` match from `lib/bracket.ts`.
- **Colors/branding:** `tailwind.config.ts` (`pitch` color) and `app/layout.tsx`.
