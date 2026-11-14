// The route: a thin line that walks the aisles between blocks, from the name
// in the hero through every section heading to the contact clearing. A dot
// travels along it as the page scrolls, and the header's miniature of the same
// line doubles as navigation.

import type { Plan } from './layout';

const SVG = 'http://www.w3.org/2000/svg';
const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];

type P = [number, number];

/** Dijkstra over grid vertices; edges inside a multi-cell item are closed. */
function findPath(
  W: number,
  H: number,
  shutH: Uint8Array,
  shutV: Uint8Array,
  usedH: Uint8Array,
  usedV: Uint8Array,
  a: P,
  b: P,
): P[] {
  const cols = W - 1;
  const rows = H - 1;
  const n = W * H * 4;
  const dist = new Float64Array(n).fill(Infinity);
  const prev = new Int32Array(n).fill(-1);
  const heap: [number, number][] = [];
  const push = (c: number, s: number) => {
    heap.push([c, s]);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        let m = i;
        const l = 2 * i + 1;
        const r = l + 1;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };

  const start = a[1] * W + a[0];
  const goal = b[1] * W + b[0];
  for (let d = 0; d < 4; d++) {
    dist[start * 4 + d] = 0;
    push(0, start * 4 + d);
  }
  let end = -1;
  while (heap.length) {
    const [cost, s] = pop();
    if (cost > dist[s]) continue;
    const v = s >> 2;
    const d = s & 3;
    if (v === goal) {
      end = s;
      break;
    }
    const x = v % W;
    const y = (v - x) / W;
    for (let nd = 0; nd < 4; nd++) {
      if (nd === (d + 2) % 4 && v !== start) continue;
      const nx = x + DX[nd];
      const ny = y + DY[nd];
      if (nx < 0 || ny < 0 || nx > cols || ny > rows) continue;
      const horizontal = nd % 2 === 0;
      const e = horizontal ? y * W + Math.min(x, nx) : Math.min(y, ny) * W + x;
      if (horizontal ? shutH[e] : shutV[e]) continue;
      let step = 1;
      if (nd !== d && v !== start) step += 4;
      if (horizontal ? usedH[e] : usedV[e]) step += 2;
      if (horizontal ? y === 0 || y === rows : x === 0 || x === cols) step += 3;
      const ns = (ny * W + nx) * 4 + nd;
      if (cost + step < dist[ns]) {
        dist[ns] = cost + step;
        prev[ns] = s;
        push(cost + step, ns);
      }
    }
  }
  const out: P[] = [];
  for (let s = end; s !== -1; s = prev[s]) {
    const v = s >> 2;
    out.push([v % W, Math.floor(v / W)]);
  }
  return out.reverse();
}

export interface RouteFrame {
  x: number;
  y: number;
  moving: boolean;
}

export class Route {
  private svg: SVGSVGElement;
  private trail: SVGPathElement;
  private walk: SVGPathElement;
  private marks: SVGGElement;
  private dot: SVGCircleElement;
  private shade: SVGCircleElement;

  private verts: P[] = [];
  private knotLen: number[] = [];
  private knotScroll: number[] = [];
  private stations: { id: string; len: number }[] = [];
  private cell = 1;
  private rowY: number[] = [];
  private px: number[] = [];
  private py: number[] = [];
  private cum: number[] = [];
  private cur = 0;
  private ready = false;
  private active = '';
  private stops: number[] = [];

  constructor(
    private field: HTMLElement,
    private nav: HTMLElement,
  ) {
    const el = <K extends keyof SVGElementTagNameMap>(tag: K, cls: string) => {
      const e = document.createElementNS(SVG, tag);
      e.setAttribute('class', cls);
      return e;
    };
    this.svg = el('svg', 'route-line');
    this.svg.setAttribute('aria-hidden', 'true');
    this.trail = el('path', 'route-line__trail');
    this.walk = el('path', 'route-line__walk');
    this.marks = el('g', 'route-line__marks');
    this.shade = el('circle', 'route-line__shade');
    this.dot = el('circle', 'route-line__dot');
    this.shade.setAttribute('r', '6');
    this.dot.setAttribute('r', '6');
    this.svg.append(this.trail, this.walk, this.marks, this.shade, this.dot);
  }

  /** Recompute the path for a new plan (the grid reflowed). */
  setPlan(plan: Plan) {
    const W = plan.cols + 1;
    const H = plan.rows + 1;
    const shutH = new Uint8Array(W * H);
    const shutV = new Uint8Array(W * H);
    for (const sec of plan.sections)
      for (const it of sec.items) {
        const r = it.r + sec.row0;
        for (let x = it.c + 1; x < it.c + it.w; x++) for (let y = r; y < r + it.h; y++) shutV[y * W + x] = 1;
        for (let y = r + 1; y < r + it.h; y++) for (let x = it.c; x < it.c + it.w; x++) shutH[y * W + x] = 1;
      }
    const usedH = new Uint8Array(W * H);
    const usedV = new Uint8Array(W * H);

    this.verts = [[plan.knots[0].x, plan.knots[0].y]];
    this.knotLen = [0];
    for (let i = 1; i < plan.knots.length; i++) {
      const a = plan.knots[i - 1];
      const b = plan.knots[i];
      const leg = findPath(W, H, shutH, shutV, usedH, usedV, [a.x, a.y], [b.x, b.y]);
      for (let j = 1; j < leg.length; j++) {
        const [x0, y0] = leg[j - 1];
        const [x1, y1] = leg[j];
        if (y0 === y1) usedH[y0 * W + Math.min(x0, x1)] = 1;
        else usedV[Math.min(y0, y1) * W + x0] = 1;
        this.verts.push(leg[j]);
      }
      this.knotLen.push(this.verts.length - 1);
    }
    this.stations = plan.knots
      .map((k, i) => ({ id: k.station ?? '', len: this.knotLen[i] }))
      .filter((s) => s.id);
    this.knotY = plan.knots.map((k) => k.y);

    this.field.prepend(this.svg);
    this.ready = false;
    this.measure();
  }

  private knotY: number[] = [];

  /** Re-read pixel geometry: cell size, scroll positions, header stops. */
  measure() {
    if (!this.verts.length) return;
    const cols = Number(getComputedStyle(this.field).getPropertyValue('--cols')) || 12;
    this.cell = this.field.clientWidth / cols;
    const c = this.cell;

    // Row lines in px. Rows are at least one cell tall but may grow to fit a
    // paper sheet, so read the resolved tracks rather than assuming squares.
    this.rowY = [];
    for (const sec of this.field.querySelectorAll<HTMLElement>('.sec')) {
      let y = sec.offsetTop;
      if (!this.rowY.length) this.rowY.push(y);
      for (const t of getComputedStyle(sec).gridTemplateRows.split(' ')) {
        y += parseFloat(t) || c;
        this.rowY.push(y);
      }
    }
    const Y = (v: number) => this.rowY[Math.min(v, this.rowY.length - 1)] ?? v * c;
    this.px = this.verts.map(([x]) => x * c);
    this.py = this.verts.map(([, y]) => Y(y));
    this.cum = [0];
    for (let i = 1; i < this.verts.length; i++)
      this.cum.push(this.cum[i - 1] + Math.abs(this.px[i] - this.px[i - 1]) + Math.abs(this.py[i] - this.py[i - 1]));

    let d = '';
    for (let i = 0; i < this.verts.length; i++) {
      const [x, y] = this.verts[i];
      const mid =
        i > 0 &&
        i < this.verts.length - 1 &&
        ((this.verts[i - 1][0] === x && this.verts[i + 1][0] === x) ||
          (this.verts[i - 1][1] === y && this.verts[i + 1][1] === y));
      if (!mid) d += `${i ? 'L' : 'M'}${this.px[i].toFixed(1)} ${this.py[i].toFixed(1)}`;
    }
    this.trail.setAttribute('d', d);
    this.walk.setAttribute('d', d);
    const total = this.cum[this.cum.length - 1];
    this.walk.style.strokeDasharray = `${total} ${total}`;

    this.marks.replaceChildren(
      ...this.stations.map((s) => {
        const m = document.createElementNS(SVG, 'circle');
        m.setAttribute('cx', String(this.px[s.len]));
        m.setAttribute('cy', String(this.py[s.len]));
        m.setAttribute('r', '4.5');
        return m;
      }),
    );

    // Scroll position at which each knot should be reached. The target line
    // slides from the first knot (at the top of the page) to the last knot (at
    // the bottom), so the dot is at the start on load and at the end at rest.
    const top = this.field.getBoundingClientRect().top + window.scrollY;
    const vh = window.innerHeight;
    const max = Math.max(1, document.documentElement.scrollHeight - vh);
    const ys = this.knotY.map((y) => top + Y(y));
    const a0 = ys[0] / vh;
    const a1 = (ys[ys.length - 1] - max) / vh;
    const k = 1 + (vh * (a1 - a0)) / max;
    this.knotScroll = ys.map((y) => Math.min(max, Math.max(0, (y - vh * a0) / (k || 1))));
    for (let i = 1; i < this.knotScroll.length; i++)
      this.knotScroll[i] = Math.max(this.knotScroll[i], this.knotScroll[i - 1]);
    this.knotScroll[this.knotScroll.length - 1] = max;

    const list = this.nav.querySelector('ol')!;
    const box = list.getBoundingClientRect();
    const centres = [...list.querySelectorAll('a')].map((a) => {
      const r = a.getBoundingClientRect();
      return r.left + r.width / 2 - box.left;
    });
    this.stops = [0, ...centres, box.width];
  }

  private target(scroll: number): number {
    const s = this.knotScroll;
    const l = this.knotLen;
    if (scroll <= s[0]) return l[0];
    for (let i = 1; i < s.length; i++) {
      if (scroll <= s[i]) {
        const span = s[i] - s[i - 1];
        return span < 0.5 ? l[i] : l[i - 1] + ((scroll - s[i - 1]) / span) * (l[i] - l[i - 1]);
      }
    }
    return l[l.length - 1];
  }

  /** Advance the dot towards where the scroll position puts it. */
  frame(scroll: number, dt: number, instant: boolean): RouteFrame {
    if (!this.verts.length) return { x: 0, y: 0, moving: false };
    const goal = this.target(scroll);
    if (!this.ready || instant) {
      this.cur = goal;
      this.ready = true;
    } else {
      this.cur += (goal - this.cur) * (1 - Math.exp(-dt * 9));
      if (Math.abs(goal - this.cur) < 0.002) this.cur = goal;
    }
    const L = Math.min(this.verts.length - 1, Math.max(0, this.cur));
    const i = Math.min(this.verts.length - 2, Math.floor(L));
    const f = L - i;
    const x = this.px[i] + (this.px[i + 1] - this.px[i]) * f;
    const y = this.py[i] + (this.py[i + 1] - this.py[i]) * f;

    const total = this.cum[this.cum.length - 1];
    const walked = this.cum[i] + (this.cum[i + 1] - this.cum[i]) * f;
    this.walk.style.strokeDashoffset = String(total - walked);
    this.dot.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    this.shade.setAttribute('transform', `translate(${(x + 2).toFixed(2)} ${(y + 3).toFixed(2)})`);

    // Mirror progress on the header line.
    const st = this.stations;
    let k = 0;
    while (k < st.length - 2 && L >= st[k + 1].len) k++;
    const span = st[k + 1].len - st[k].len || 1;
    const u = Math.min(1, Math.max(0, (L - st[k].len) / span));
    const nx = this.stops[k] + (this.stops[k + 1] - this.stops[k]) * u;
    this.nav.style.setProperty('--dot-x', `${nx.toFixed(1)}px`);

    let here = st[0].id;
    for (const s of st) if (goal >= s.len - 0.5) here = s.id;
    if (here !== this.active) {
      this.active = here;
      for (const a of this.nav.querySelectorAll<HTMLAnchorElement>('a[data-section]')) {
        if (a.dataset.section === here) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      }
    }

    return {
      x: x + this.field.offsetLeft,
      y: y + this.field.offsetTop,
      moving: this.cur !== goal,
    };
  }
}
