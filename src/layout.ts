// The field plan. Every section is a band of square cells. Each unclaimed cell
// holds one foam block (a seat); content items claim rectangles of cells.
// The plan is recomputed whenever the column count changes (12 / 8 / 4).

import { site, projects } from './content';

export type Cols = 4 | 8 | 12;
export type Kind = 'name' | 'intro' | 'heading' | 'contact' | 'link' | 'project' | 'sheet';

export interface Item {
  kind: Kind;
  c: number;
  r: number;
  w: number;
  h: number;
  data?: any;
}

export interface Section {
  id: string;
  title?: string;
  row0: number;
  rows: number;
  items: Item[];
}

/** A grid vertex the route passes through, in global cell coordinates. */
export interface Knot {
  x: number;
  y: number;
  station?: string;
}

export interface Plan {
  cols: Cols;
  rows: number;
  sections: Section[];
  knots: Knot[];
}

type Box = { c: number; r: number; w: number; h: number };

const by = <T,>(cols: Cols, d: T, t: T, m: T): T => (cols === 12 ? d : cols === 8 ? t : m);

/** Rightmost vertical grid line no item covers, so the route can run down it. */
function freeX(items: Item[], cols: number): number {
  for (let x = cols - 1; x > 0; x--) if (!items.some((it) => x > it.c && x < it.c + it.w)) return x;
  return cols;
}

export function buildPlan(cols: Cols): Plan {
  const sections: Section[] = [];
  const knots: Knot[] = [];
  let row0 = 0;

  // Each section is walked the same way: from its station, across under the
  // heading, down the open aisle on the right, then back along the bottom.
  const add = (id: string, title: string | undefined, rows: number, items: Item[], station: [number, number], loop = true) => {
    sections.push({ id, title, row0, rows, items });
    knots.push({ x: station[0], y: station[1] + row0, station: id });
    if (loop) {
      const fx = freeX(items, cols);
      knots.push({ x: fx, y: station[1] + row0 }, { x: fx, y: rows + row0 });
    }
    row0 += rows;
  };

  const link = (label: string, hint: string, href: string, at: Box): Item => ({
    kind: 'link',
    ...at,
    data: { label, hint, href },
  });

  // Hero: name and intro set into a clearing, a column of section blocks beside it.
  {
    const name: Item = { kind: 'name', ...by(cols, { c: 1, r: 1, w: 7, h: 2 }, { c: 0, r: 1, w: 6, h: 2 }, { c: 0, r: 1, w: 4, h: 2 }) };
    const intro: Item = { kind: 'intro', ...by(cols, { c: 1, r: 3, w: 6, h: 1 }, { c: 0, r: 3, w: 5, h: 2 }, { c: 0, r: 3, w: 4, h: 2 }) };
    const at: Box[] = by(
      cols,
      [1, 2, 3, 4, 5].map((r) => ({ c: 9, r, w: 3, h: 1 })),
      [1, 2, 3, 4, 5].map((r) => ({ c: 6, r, w: 2, h: 1 })),
      [[0, 5], [2, 5], [0, 6], [2, 6], [0, 7]].map(([c, r]) => ({ c, r, w: 2, h: 1 })),
    );
    const links = [
      link('Projects', `${projects.length} case studies`, '#projects', at[0]),
      link('Skills', 'Jump to section', '#skills', at[1]),
      link('Experience', 'Jump to section', '#experience', at[2]),
      link('Outside work', 'Jump to section', '#outside', at[3]),
      link('Résumé', 'PDF', site.resume, at[4]),
    ];
    add('top', undefined, by(cols, 7, 7, 9), [name, intro, ...links], [name.c, name.r + name.h]);
  }

  const heading = (title: string): Item => ({
    kind: 'heading',
    ...by(cols, { c: 1, r: 0, w: 6, h: 1 }, { c: 0, r: 0, w: 5, h: 1 }, { c: 0, r: 0, w: 4, h: 1 }),
    data: title,
  });
  const section = (id: string, title: string, items: Item[], rows: number) => {
    const head = heading(title);
    add(id, title, rows, [head, ...items], [head.c, 1]);
  };
  const sheet = (type: string, box: Box): Item => ({ kind: 'sheet', ...box, data: type });

  // Projects: one block each, caption set on the grass beside it.
  {
    const at: Box[] = by(
      cols,
      [[1, 1], [5, 1], [9, 1], [1, 3], [5, 3], [9, 3]].map(([c, r]) => ({ c, r, w: 3, h: 1 })),
      [[0, 1], [4, 1], [0, 3], [4, 3], [0, 5], [4, 5]].map(([c, r]) => ({ c, r, w: 4, h: 1 })),
      [1, 2, 3, 4, 5, 6].map((r) => ({ c: 0, r, w: 4, h: 1 })),
    );
    const items = projects.map((p, i): Item => ({ kind: 'project', ...at[i % at.length], data: p }));
    section('projects', 'Projects', items, by(cols, 5, 7, 8));
  }

  section('skills', 'Skills', [sheet('skills', by(cols, { c: 1, r: 1, w: 9, h: 3 }, { c: 1, r: 1, w: 6, h: 5 }, { c: 0, r: 1, w: 4, h: 8 }))], by(cols, 5, 7, 10));
  section('experience', 'Experience', [sheet('experience', by(cols, { c: 2, r: 1, w: 9, h: 8 }, { c: 0, r: 1, w: 8, h: 11 }, { c: 0, r: 1, w: 4, h: 22 }))], by(cols, 10, 13, 24));
  section('outside', 'Outside work', [sheet('outside', by(cols, { c: 1, r: 1, w: 7, h: 4 }, { c: 1, r: 1, w: 6, h: 5 }, { c: 0, r: 1, w: 4, h: 7 }))], by(cols, 6, 7, 9));

  // Contact: the close of the route.
  {
    const clear: Item = { kind: 'contact', ...by(cols, { c: 1, r: 0, w: 7, h: 2 }, { c: 0, r: 0, w: 5, h: 2 }, { c: 0, r: 0, w: 4, h: 2 }) };
    const at: Box[] = by(
      cols,
      [0, 1, 2].map((r) => ({ c: 9, r, w: 3, h: 1 })),
      [0, 1, 2].map((r) => ({ c: 5, r, w: 3, h: 1 })),
      [[0, 2], [2, 2], [0, 3]].map(([c, r]) => ({ c, r, w: 2, h: 1 })),
    );
    const links = [
      ...site.links.map((l, i) => link(l.label, l.hint, l.url, at[i])),
      link('Résumé', 'PDF', site.resume, at[2]),
    ];
    add('contact', 'Contact', by(cols, 4, 4, 5), [clear, ...links], [clear.c, clear.h], false);
  }

  return { cols, rows: row0, sections, knots };
}
