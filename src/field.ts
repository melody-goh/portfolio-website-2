// Renders the plan into the DOM: text clearings, captioned blocks, paper
// sheets, and the plain foam seats that fill every other cell.

import { site, skills, roles, outside } from './content';
import type { Item, Plan, Section } from './layout';

export const BASE = import.meta.env.BASE_URL;

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);

const pos = (it: { c: number; r: number; w: number; h: number }) =>
  `style="--c:${it.c};--r:${it.r};--w:${it.w};--h:${it.h}"`;

const rowName = (n: number) => {
  let s = '';
  for (n += 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};

function href(target: string): { url: string; attrs: string } {
  if (/^https?:/.test(target)) return { url: target, attrs: ' target="_blank" rel="noopener"' };
  if (target.startsWith('#')) return { url: BASE + target, attrs: ` data-section="${target.slice(1)}"` };
  return { url: BASE + target, attrs: '' };
}

const block = (label: string) => `<span class="blk" data-label="${esc(label)}"><span class="blk__top"></span></span>`;

function sheet(type: string): string {
  if (type === 'skills')
    return `<div class="sheet__cols">${skills
      .map((g) => `<div><h3>${esc(g.title)}</h3><ul>${g.items.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>`)
      .join('')}</div>`;
  if (type === 'roles')
    return `<ol class="sheet__rows">${roles
      .map(
        (r) =>
          `<li><span class="label">${esc(r.dates)}</span><div><h3>${esc(r.role)}</h3><p class="sheet__org">${esc(r.org)}</p></div><p>${esc(r.note)}</p></li>`,
      )
      .join('')}</ol>`;
  return `<p class="sheet__lede">${esc(outside.note)}</p><ul class="sheet__list">${outside.items
    .map((p) => {
      const inner = `<span class="sheet__title">${esc(p.title)}</span><span class="label">${esc(p.meta)}</span>`;
      return `<li>${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${inner}</a>` : inner}</li>`;
    })
    .join('')}</ul>`;
}

function item(it: Item, sec: Section): string {
  const d = it.data;
  switch (it.kind) {
    case 'name':
      return `<div class="clear clear--name" ${pos(it)}><h1 class="name">${esc(site.name)}</h1></div>`;
    case 'intro':
      return `<div class="clear clear--intro" ${pos(it)}><p class="intro">${esc(site.intro)}</p></div>`;
    case 'heading':
      return `<div class="clear clear--heading" ${pos(it)}><h2 id="h-${sec.id}">${esc(d)}</h2></div>`;
    case 'contact':
      return `<div class="clear clear--contact" ${pos(it)}><h2 id="h-${sec.id}">Get in touch</h2><a class="mail" href="mailto:${esc(site.email)}">${esc(site.email)}</a></div>`;
    case 'link': {
      const h = href(d.href);
      return `<a class="spot spot--link" href="${esc(h.url)}"${h.attrs} ${pos(it)}>${block(d.hint)}<span class="cap"><span class="cap__title">${esc(d.label)}</span></span></a>`;
    }
    case 'project':
      return `<a class="spot spot--project" href="${BASE}projects/${esc(d.slug)}" data-project="${esc(d.slug)}" ${pos(it)}>${block('Open case study')}<span class="cap"><span class="cap__title">${esc(d.title)}</span><span class="label">${esc(d.kind)}</span></span></a>`;
    case 'sheet':
      return `<div class="sheet sheet--${d}" ${pos(it)}>${sheet(d)}</div>`;
  }
}

function section(sec: Section, cols: number): string {
  const taken = new Uint8Array(cols * sec.rows);
  for (const it of sec.items)
    for (let y = it.r; y < it.r + it.h; y++) for (let x = it.c; x < it.c + it.w; x++) taken[y * cols + x] = 1;

  let seats = '';
  for (let y = 0; y < sec.rows; y++)
    for (let x = 0; x < cols; x++)
      if (!taken[y * cols + x])
        seats += `<span class="blk blk--seat" aria-hidden="true" data-label="Seat ${rowName(sec.row0 + y)}${x + 1}" style="--c:${x};--r:${y};--w:1;--h:1"><span class="blk__top"></span></span>`;

  const label = sec.title ? ` aria-labelledby="h-${sec.id}"` : ` aria-label="Introduction"`;
  return `<section class="sec" id="${sec.id}"${label} style="--rows:${sec.rows}">${sec.items.map((it) => item(it, sec)).join('')}${seats}</section>`;
}

export function renderField(host: HTMLElement, plan: Plan) {
  host.innerHTML = plan.sections.map((s) => section(s, plan.cols)).join('');
}
