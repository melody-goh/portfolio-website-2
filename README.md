# Melody Goh — portfolio

Personal portfolio site. The layout borrows from the Prada Men's SS12 "Field" set by OMA/AMO: a grid of foam blocks on artificial turf, with a route connecting the sections.

## Stack

Vite and TypeScript, no framework. The turf is drawn with WebGL (with a Canvas 2D fallback), the route is SVG, and case studies are client-side routes using the History API.

## Run locally

```sh
npm install
npm run dev
```

## Build

```sh
npm run build    # type-checks, then writes the static site to dist/
npm run preview  # serves dist/ locally
```

## Editing content

All text lives in `src/content.ts`: intro, projects (each becomes a case study at `/projects/<slug>`), skills, experience and contact links. The downloadable résumé is `public/resume.pdf`.

## Deploying

The output in `dist/` is static. Unknown paths must fall back to `index.html` so case study URLs and the 404 page work; `vercel.json` (Vercel) and `public/_redirects` (Netlify) already do this.
