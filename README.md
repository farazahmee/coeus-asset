# Coeus Asset Workspace

Internal multi-sheet asset and inventory tracker for Coeus Solutions. Built with Next.js (App Router), Tailwind CSS, and Neon Postgres.

## Local development

1. **Logo** — Place your Coeus logo at `public/logo.png` (PNG or JPG). A placeholder is included until you replace it.

2. **Environment** — Copy `.env.example` to `.env.local` and set your Neon connection string:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
   ```

   Optionally set `API_KEY` (and matching `NEXT_PUBLIC_API_KEY` if you need write calls from the browser).

3. **Run**

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Tables are created automatically on the first API request; **Hardware** and **Employees** sheets are seeded if empty.

4. **Production build**

   ```bash
   npm run build
   npm start
   ```

## Deploy on Vercel

1. Push this project to a GitHub repository and **Import** it into [Vercel](https://vercel.com) (Next.js is auto-detected).

2. In the Vercel project → **Storage** → **Create / Connect Database** → choose **Neon (Postgres)** from the Marketplace and create a database. Vercel injects `DATABASE_URL` automatically.

3. Optionally add an `API_KEY` environment variable to require the `x-app-key` header on write endpoints (POST/DELETE). If you use it, also set `NEXT_PUBLIC_API_KEY` to the same value for the client.

4. **Redeploy** so serverless functions pick up `DATABASE_URL`. Open the deployment URL — built-in sheets should appear and the header status pill should show **Cloud synced**.

## Custom domain (Namecheap)

1. Vercel project → **Settings → Domains** → add e.g. `assets.coeus-solutions.com`.

2. Vercel shows a DNS record (usually a **CNAME** to `cname.vercel-dns.com`).

3. In Namecheap → **Domain → Advanced DNS** → add that CNAME for the `assets` host.

4. Wait for Vercel to verify (a few minutes). For an apex/root domain, follow Vercel’s A-record instructions instead.

## Features

- Built-in **Hardware** and **Employees** sheets (cannot be deleted)
- Add **Custom**, **Assets**, or **People** sheets
- Per-sheet **Dashboard** and **Register** views
- Cloud persistence via Neon (shared across browsers and devices)
- CSV export for the active sheet
- Optional API key protection on writes

## Tech stack

- Next.js App Router + TypeScript
- Tailwind CSS
- `@neondatabase/serverless` (parameterized SQL, no ORM)
- Route Handlers under `app/api/`

Database credentials are only used server-side in API routes; they never ship to the browser.
