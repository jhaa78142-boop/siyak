# Siyak Steel International

ISO 9001:2015 certified steel exporter website built with React + Vite + Tailwind CSS v4.

## Getting Started

**Requirements:** Node.js 18+ and npm (or pnpm / yarn)

### Install & run

```bash
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Build for production

```bash
npm run build        # outputs to dist/
npm run preview      # preview the production build locally
```

## Tech Stack

| Tool | Version |
|------|---------|
| React | 19 |
| Vite | 7 |
| Tailwind CSS | v4 |
| Framer Motion | 12 |
| React Router | v7 |
| Lucide React | 0.545 |

## Project Structure

```
src/
├── assets/          # Images (hero backgrounds, product photos, logo)
├── components/      # Reusable UI components
├── data/            # Product catalogue data (products.js, steelReference.js, alloyReference.js)
├── hooks/           # Custom React hooks
├── lib/             # Utilities (slugify, tracking, site URL helpers)
├── pages/           # Route-level page components
├── App.jsx          # Root app with routing
├── main.jsx         # Entry point
└── index.css        # Tailwind v4 theme tokens + global styles
```
