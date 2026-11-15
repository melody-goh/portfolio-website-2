// The opening cue: the hall starts dark and its sixteen floodlight banks strike
// one after another, down both walls, until the field sits in its resting
// light. Everything is CSS animation on opacity; this file only builds the
// rig, aims the name's light and strikes the set.

import { isHome } from './caseStudy';

const KEY = 'field-lit';
/** Must match the end of `cue-out` in styles.css. */
const LENGTH = 1500;
const CUT = 120;

export function playOpening(bar: HTMLElement) {
  if (!isHome(location.pathname) || location.hash || document.hidden) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    if (localStorage.getItem(KEY)) return;
    localStorage.setItem(KEY, '1');
  } catch {
    return; // No storage means no "once", so don't play at all.
  }

  const top = bar.offsetHeight;
  const cue = document.createElement('div');
  cue.className = 'cue';
  cue.setAttribute('aria-hidden', 'true');

  let dark = '<i class="cue__base"></i>';
  let rig = '';
  for (let i = 0; i < 16; i++) {
    const side = i % 2 ? 'r' : 'l';
    const at = `style="--n:${i >> 1};--i:${i}"`;
    dark += `<i class="cue__shade cue__shade--${side}" ${at}></i>`;
    rig += `<i class="cue__bank cue__bank--${side}" ${at}><i class="cue__throw"></i><i class="cue__lamp"></i></i>`;
  }

  // The name and the line under it are lit from the first frame: a hole in
  // the darkness, aimed at them once.
  const name = document.querySelector('.name')?.getBoundingClientRect();
  let key = '';
  if (name) {
    const intro = document.querySelector('.intro')?.getBoundingClientRect();
    const l = Math.min(name.left, intro?.left ?? name.left);
    const r = Math.max(name.right, intro?.right ?? name.right);
    const b = Math.max(name.bottom, intro?.bottom ?? name.bottom);
    key = ` style="--kx:${(l + r) / 2}px;--ky:${(name.top + b) / 2 - top}px;--kw:${(r - l) * 0.8}px;--kh:${(b - name.top) * 0.95}px"`;
  }

  cue.innerHTML = `<div class="cue__dark${name ? ' cue__dark--keyed' : ''}"${key}>${dark}</div>${rig}`;
  document.body.append(cue);

  const off = new AbortController();
  const strike = (cut: boolean) => {
    if (off.signal.aborted) return;
    off.abort();
    clearTimeout(timer);
    if (!cut) return cue.remove();
    cue.classList.add('cue--cut');
    setTimeout(() => cue.remove(), CUT);
  };
  const timer = setTimeout(() => strike(false), LENGTH);
  for (const type of ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown', 'resize'])
    addEventListener(type, () => strike(true), { passive: true, capture: true, signal: off.signal });
}
