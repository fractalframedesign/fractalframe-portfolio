# Kiran Pingle Portfolio

Personal portfolio site for Kiran Pingle, built with Next.js, Tailwind CSS, and MDX-driven project/article content.

- [Local Development](http://localhost:3000)

## Screenshot

![Kiran Pingle Portfolio screenshot](./public/og-image.jpg)

## Getting Started

```bash
npm install
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- Nextjs 16 / App Router
- Tailwind 4
- shadcn/ui

## Branch Strategy

| Branch | Purpose | Vercel |
|--------|---------|--------|
| `main` | Active development | — |
| `staging` | Review & testing | Preview URL |
| `prod` | Live site | Production domain |

**Workflow:** `main` → `staging` (test) → `prod` (ship)

## Deploy on Vercel

1. Import `fractalframedesign-commits/fractalframe-portfolio` on [Vercel](https://vercel.com)
2. Set **Production Branch** to `prod` in Project Settings → Git
3. `staging` gets an automatic preview URL on every push

## Static Export Support

This template is configured to support static export by default, making it easy to deploy on various platforms including Cloudflare Pages, GitHub Pages, and other static hosting providers.

To build for static export:

```bash
npm run build
# The output will be in the '.next' directory
```
