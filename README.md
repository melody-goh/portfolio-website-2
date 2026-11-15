# Melody Goh: portfolio

My personal portfolio site. The layout borrows from the set OMA/AMO designed for Prada Men's Spring/Summer 2012: a grid of blue foam blocks on artificial turf, with a route connecting the sections.

## Features

- A field of foam blocks on procedurally drawn turf (WebGL, with a Canvas 2D fallback). Blades bend around the cursor and the route dot.
- A route line that walks between the blocks as you scroll and doubles as section navigation. It recomputes when the grid reflows (12, 8 or 4 columns).
- Case studies at `/projects/<slug>`, opened from their block with an expanding transition. Back, forward, deep links and Escape all work.
- A 404 page for unknown addresses.

## Stack

Vite and TypeScript, no framework. Fonts are self-hosted through Fontsource (Instrument Serif and Inter).

## Run locally

Requires Node 20.19 or later.

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

- `src/content.ts` holds all the text: intro, projects, skills, experience, outside work and contact links.
- Each project can have an optional `link` (live site or repository) and `gallery` of screenshots. Screenshots live in `public/projects/<slug>/`.
- `public/resume.pdf` is the downloadable résumé.
- `public/og.jpg` is the image shown in link previews.

## Project layout

```
src/
  main.ts        wires everything together
  content.ts     site content
  layout.ts      grid plan for each breakpoint
  field.ts       renders the plan into blocks, captions and sheets
  route.ts       the route line and travelling dot
  grass.ts       procedural turf
  caseStudy.ts   case study pages, routing and the 404 page
  styles.css     all styles
public/          résumé, screenshots, icons and preview image
```

## Deploying

The output in `dist/` is static. Unknown paths must fall back to `index.html` so case study URLs and the 404 page work. `vercel.json` (Vercel) and `public/_redirects` (Netlify) already handle this.
