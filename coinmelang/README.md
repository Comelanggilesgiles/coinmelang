# Coinmelang

**A modern crypto landing page and paper-trading dashboard, built with Angular and a zero-dependency Node.js API.**

## Description

Coinmelang is a full-stack demo app. It combines an animated marketing landing page with a trading dashboard where you can sign up, receive $10,000 of demo cash, and buy or sell eight simulated crypto assets with live-updating prices. No real money and no external APIs are involved.

Open it from the Node server for the full experience, or host the static build anywhere. When no server is reachable, the app runs the same backend logic inside the browser and stores data in `localStorage`, so every feature still works.

## Screenshot

![Coinmelang screenshot](docs/screenshot.png)

> Placeholder image. Replace `docs/screenshot.png` with a real screenshot of your running app.

## Key Features

- Animated landing page: hero, features, testimonials, call to action, and contact form
- Account system: sign up, log in, log out, protected `/dashboard` route
- Live market: 8 assets with simulated real-time prices and sparklines, refreshed every 2 seconds
- Paper trading: buy and sell with $10,000 demo cash, with balance and holdings validation
- Portfolio view: total balance, profit and loss, allocation donut chart, holdings, and transaction history
- Testimonials loaded from the API, with ratings from logged-in users
- Newsletter and contact forms stored in the database
- Community stats: member, trade, and subscriber counts
- Secure basics: PBKDF2-SHA256 password hashing and bearer session tokens
- Static hosting mode: automatic in-browser backend fallback

## Tech Stack

- Angular 21 (standalone components, signals, zoneless change detection, router)
- TypeScript 5.9
- Vite 7 with `vite-plugin-singlefile`
- Tailwind CSS 4
- Motion (animations: reveal, split text, tilt, magnetic, parallax, counters)
- RxJS
- Node.js 20+ (built-in `http` module, no server dependencies)
- JSON file storage with atomic writes

## Getting Started (about 5 minutes)

### Requirements

- [Node.js](https://nodejs.org/) 20.19 or newer (includes npm)
- [Git](https://git-scm.com/)

Check your versions:

```bash
node -v
git --version
```

### Install

```bash
git clone https://github.com/Comelanggilesgiles/coinmelang.git
cd coinmelang
npm install
```

### Run option A: full stack (API + frontend)

```bash
npm run build
npm start
```

Open http://localhost:3000. The footer shows "Live - Node.js API".

### Run option B: development mode (hot reload)

```bash
npm run dev
```

Open the URL printed in the terminal (usually http://localhost:5173). In this mode there is no API server, so the app uses the in-browser backend and shows "Demo - In-browser API".

### Try it out

1. Click **Sign up** and create an account (password: at least 6 characters).
2. Open the **Dashboard**.
3. Buy or sell an asset using your $10,000 demo cash.
4. Check your portfolio, allocation chart, and transaction history.

## Configuration

No API keys or secrets are required. Optional environment variables:

| Variable       | Default                 | Purpose                                         |
| -------------- | ----------------------- | ----------------------------------------------- |
| `PORT`         | `3000`                  | Port for the Node server                        |
| `DB_FILE`      | `server/data/db.json`   | Location of the JSON database                   |
| `CORS_ORIGIN`  | `*`                     | Allowed origin for API requests                 |
| `VITE_API_URL` | empty (same origin)     | Build-time URL of a separately hosted API       |

Example (PowerShell):

```powershell
$env:PORT = "4000"; npm start
```

## Scripts

| Command           | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Start the Vite dev server                      |
| `npm run build`   | Build the app into `dist/index.html`           |
| `npm run preview` | Preview the production build                   |
| `npm start`       | Start the API server and serve `dist/`         |

## API Reference

| Method | Path                | Auth | Description                   |
| ------ | ------------------- | ---- | ----------------------------- |
| GET    | `/api/health`       | No   | Health check                  |
| GET    | `/api/stats`        | No   | Community counts              |
| POST   | `/api/auth/signup`  | No   | `{ name, email, password }`   |
| POST   | `/api/auth/login`   | No   | `{ email, password }`         |
| POST   | `/api/auth/logout`  | Yes  | End the session               |
| GET    | `/api/auth/me`      | Yes  | Current user                  |
| GET    | `/api/market`       | No   | Prices, 24h change, history   |
| GET    | `/api/portfolio`    | Yes  | Cash, holdings, P&L, history  |
| POST   | `/api/trade`        | Yes  | `{ symbol, side, amountUsd }` |
| GET    | `/api/testimonials` | No   | All reviews                   |
| POST   | `/api/testimonials` | Yes  | `{ quote, role, rating }`     |
| POST   | `/api/newsletter`   | No   | `{ email }`                   |
| POST   | `/api/contact`      | No   | `{ name, email, message }`    |

## Project Structure

```
server/
  core.mjs              Shared backend logic (routes, auth, market simulation)
  index.mjs             Node HTTP server and JSON file storage
src/
  main.ts               Angular bootstrap
  app/
    app.ts              Root component, routes, auth guard
    core/               API service, state services, models
    shared/motion.ts    Animation directives and components
    layout/             Navbar, footer, auth modal, toasts
    pages/landing/      Hero, features, testimonials, contact
    pages/dashboard/    Trading dashboard
  assets/               Images
docs/
  screenshot.png        README screenshot
```

## Troubleshooting

- **Blank page at localhost:3000:** run `npm run build` before `npm start`.
- **Port already in use:** set another port, for example `$env:PORT = "4000"` in PowerShell.
- **`npm install` fails:** update Node.js to version 20.19 or newer.

## Disclaimer

Coinmelang is an educational demo. Prices are simulated and no real trading or real money is involved.
