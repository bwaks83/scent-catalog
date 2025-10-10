# Fragrance Catalog — Starter (Next.js + Vercel)

This is a ready-to-run starter that reads your Google Sheets (published as CSV)
on the server and exposes it as `/api/scents`, and a front-end search UI.

## Prerequisites
1) Install **Node.js LTS** (https://nodejs.org)  
2) Have a **Google Sheet** with the **Scents** tab
3) Publish the Scents tab: *File → Share → Publish to the web → Link → Sheet: Scents → CSV*
   - Copy the URL (it must end with `output=csv`)

## Setup
```bash
# in a terminal
npm install
cp .env.example .env.local
# open .env.local and paste your CSV publish URL
# SCENTS_CSV_URL=https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=...
```

## Run locally
```bash
npm run dev
# open http://localhost:3000
```

## Deploy on Vercel
1) Create a GitHub account (if you don't have one)
2) Create a new repository and upload all files
3) Go to **Vercel → New Project → Import** your repo
4) In **Environment Variables**, add `SCENTS_CSV_URL` with the same value from `.env.local`
5) Deploy

If you see errors, double-check:
- The Sheet was **Published to the web** (Publish, not only Share)
- The link **ends with `output=csv`**
- The header row in the Scents tab matches exactly:
  `ID, Name, Family, Short Description, Top Notes, Heart Notes, Base Notes, Key Ingredients, Origin Country, Status, Notes`
