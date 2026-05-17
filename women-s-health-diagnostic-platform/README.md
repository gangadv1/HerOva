# HerOva — Women's Health Diagnostic Platform

> AI-powered platform for explainable diagnostics of PCOS and endometriosis.

## Overview

This repository contains the frontend for the HerOva diagnostic platform (Next.js + React + Tailwind). It provides patient intake forms, analysis pages, body visualization, batch CSV upload, and session management used in the BioHackathon 2026 demo.

## Quick Start

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Build

```bash
npm run build
npm start
```

## Scripts

- `dev`: Start Next.js dev server
- `build`: Production build
- `start`: Start production server
- `lint`: Run ESLint

## Notes

- Next.js may warn if multiple lockfiles exist. Set `turbopack.root` in `next.config.mjs` or remove extra lockfiles if needed.
- Sessions and Supabase-backed actions require `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your environment.
- If you run the Supabase Edge Functions locally or in production, also set the service-role variables used by the backend functions.

## Contributing

Feel free to open issues or submit PRs.

---

Files added/edited in this repo include several app routes and components under `app/` and `components/`.
