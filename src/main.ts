import '@fontsource/instrument-serif/400.css';
import '@fontsource-variable/inter';
import './styles.css';

import { buildPlan, type Cols } from './layout';
import { renderField } from './field';
import { Route } from './route';
import { Turf } from './grass';
import { initRouter } from './caseStudy';

const ground = document.getElementById('ground')!;
const field = document.getElementById('field')!;
const nav = document.getElementById('route-nav')!;
const bar = document.querySelector<HTMLElement>('.bar')!;
const foot = document.querySelector<HTMLElement>('.foot')!;

const calm = matchMedia('(prefers-reduced-motion: reduce)');
const readCols = () => Number(getComputedStyle(document.documentElement).getPropertyValue('--cols')) as Cols;

const route = new Route(field, nav);
const turf = new Turf(ground);

let cols = 0 as Cols | 0;
function layout() {
  const next = readCols();
  if (next !== cols) {
    cols = next;
    const plan = buildPlan(next);
    renderField(field, plan);
    route.setPlan(plan);
  } else route.measure();
  kick(true);
}

// Pointer state, in viewport coordinates; the bend eases in and out.
const ptr = { cx: 0, cy: 0, x: 0, y: 0, k: 0, goal: 0, seen: false };
let caseOpen = false;
let snap = true;
let raf = 0;
let last = 0;

function frame(now: number) {
  raf = 0;
  const dt = last ? Math.min(0.05, Math.max(0.001, (now - last) / 1000)) : 0.016;
  last = now;

  const walk = route.frame(window.scrollY, dt, snap || calm.matches);
  snap = false;
  turf.bendAtDot(walk.x, walk.y);

  const box = ground.getBoundingClientRect();
  const tx = ptr.cx - box.left;
  const ty = ptr.cy - box.top;
  const goal = caseOpen || ptr.cy < bar.offsetHeight ? 0 : ptr.goal;
  if (!ptr.seen) {
    ptr.x = tx;
    ptr.y = ty;
    ptr.seen = true;
  }
  ptr.x += (tx - ptr.x) * (1 - Math.exp(-dt * 16));
  ptr.y += (ty - ptr.y) * (1 - Math.exp(-dt * 16));
  ptr.k += (goal - ptr.k) * (1 - Math.exp(-dt * (goal ? 10 : 5)));
  turf.bendAtPointer(ptr.x, ptr.y, ptr.k);

  const settling = Math.abs(goal - ptr.k) > 0.01 || Math.hypot(tx - ptr.x, ty - ptr.y) > 0.3;
  if (walk.moving || settling) raf = requestAnimationFrame(frame);
}

function kick(instant = false) {
  if (instant) snap = true;
  if (!raf) {
    last = 0;
    raf = requestAnimationFrame(frame);
  }
}

addEventListener('scroll', () => kick(), { passive: true });
addEventListener(
  'pointermove',
  (e) => {
    ptr.cx = e.clientX;
    ptr.cy = e.clientY;
    ptr.goal = 1;
    kick();
  },
  { passive: true },
);
const release = () => {
  ptr.goal = 0;
  kick();
};
document.documentElement.addEventListener('pointerleave', release);
addEventListener('pointercancel', release);
addEventListener('pointerup', (e) => e.pointerType !== 'mouse' && release());

new ResizeObserver(layout).observe(field);
addEventListener('resize', layout);
document.fonts?.ready.then(() => route.measure());
layout();

initRouter([ground, foot], (open) => {
  caseOpen = open;
  kick();
});
