// Case studies and routing. A project block expands into a full page on plain
// off-white; the URL changes with it, so back, forward, deep links and Escape
// all behave.

import { projects, site, type Project } from './content';
import { BASE, composition, esc } from './field';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const restOf = (path: string) => (path.startsWith(BASE) ? path.slice(BASE.length) : path.replace(/^\//, ''));
export const isHome = (path: string) => /^(index\.html)?$/.test(restOf(path));
const slugOf = (path: string): string | null => {
  const rest = restOf(path);
  const m = /^projects\/([^/]+)\/?$/.exec(rest);
  return m ? decodeURIComponent(m[1]) : null;
};

function page(p: Project): string {
  const next = projects[(projects.indexOf(p) + 1) % projects.length];
  return `
    <a class="case__back" href="${BASE}" data-home>Back to the field</a>
    <header class="case__head">
      <h1 id="case-title" tabindex="-1">${esc(p.title)}</h1>
      <p class="case__summary">${esc(p.summary)}</p>
    </header>
    <dl class="case__meta">
      <div><dt>Type</dt><dd>${esc(p.kind)}</dd></div>
      ${p.year ? `<div><dt>Year</dt><dd>${esc(p.year)}</dd></div>` : ''}
      ${p.role ? `<div><dt>Role</dt><dd>${esc(p.role)}</dd></div>` : ''}
      <div class="care"><dt>Composition</dt><dd>${composition(p).map((c) => `<span>${esc(c)}</span>`).join('')}</dd></div>
    </dl>
    <div class="case__body">
      ${p.sections
        .map((s) => `<section><h2>${esc(s.heading)}</h2>${s.body.map((t) => `<p>${esc(t)}</p>`).join('')}</section>`)
        .join('')}
    </div>
    <a class="case__next" href="${BASE}projects/${esc(next.slug)}">
      <span class="label">Next project</span>
      <span class="case__next-title">${esc(next.title)}</span>
    </a>`;
}

export function initRouter(home: HTMLElement[], onChange: (open: boolean) => void) {
  const root = document.getElementById('case')!;
  const scroller = root.querySelector<HTMLElement>('.case__scroll')!;
  const article = root.querySelector<HTMLElement>('.case__page')!;
  const wash = root.querySelector<HTMLElement>('.case__wash')!;
  const lost = document.getElementById('lost')!;
  const homeTitle = document.title;
  let current: string | null = null;
  let lostOn = false;

  /** 404: any address that is neither the field nor a known project. */
  function showLost() {
    if (lostOn) return;
    lostOn = true;
    lost.hidden = false;
    home.forEach((el) => (el.inert = true));
    document.documentElement.classList.add('case-open');
    document.title = `Page not found · ${site.name}`;
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex';
    robots.id = 'lost-robots';
    document.head.append(robots);
    onChange(true);
    lost.querySelector<HTMLElement>('h1')!.focus({ preventScroll: true });
  }
  function hideLost() {
    if (!lostOn) return;
    lostOn = false;
    lost.hidden = true;
    document.getElementById('lost-robots')?.remove();
    if (current === null) {
      home.forEach((el) => (el.inert = false));
      document.documentElement.classList.remove('case-open');
      document.title = homeTitle;
      onChange(false);
    }
  }

  const block = (slug: string) =>
    document.querySelector<HTMLElement>(`[data-project="${CSS.escape(slug)}"] .blk__top`);

  const stop = () => [root, wash, article].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));

  /** clip-path that frames the block, or null when it is not on screen. */
  const frame = (slug: string): string | null => {
    const el = block(slug);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const c = root.getBoundingClientRect();
    if (r.bottom < c.top || r.top > c.bottom || r.width === 0) return null;
    return `inset(${r.top - c.top}px ${c.right - r.right}px ${c.bottom - r.bottom}px ${r.left - c.left}px round 3px)`;
  };
  const FULL = 'inset(0px 0px 0px 0px round 0px)';

  function open(slug: string, animate: boolean) {
    const p = projects.find((x) => x.slug === slug)!;
    const swap = current !== null;
    current = slug;
    stop();
    article.innerHTML = page(p);
    scroller.scrollTop = 0;
    root.hidden = false;
    home.forEach((el) => (el.inert = true));
    document.documentElement.classList.add('case-open');
    document.title = `${p.title} · ${site.name}`;
    onChange(true);

    const from = animate && !swap && !calm() ? frame(slug) : null;
    if (from) {
      root.animate([{ clipPath: from }, { clipPath: FULL }], { duration: 620, easing: EASE });
      wash.animate([{ opacity: 1 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { duration: 620, easing: 'ease-out' });
      article.animate(
        [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }],
        { duration: 520, delay: 240, easing: EASE, fill: 'backwards' },
      );
    } else if (animate && !calm()) {
      article.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'ease-out' });
    }
    root.querySelector<HTMLElement>('#case-title')!.focus({ preventScroll: true });
  }

  function close(animate: boolean) {
    const slug = current;
    if (slug === null) return;
    current = null;
    stop();
    home.forEach((el) => (el.inert = false));
    document.documentElement.classList.remove('case-open');
    document.title = homeTitle;
    onChange(false);
    const origin = document.querySelector<HTMLElement>(`[data-project="${CSS.escape(slug)}"]`);
    origin?.focus({ preventScroll: true });

    const to = animate && !calm() ? frame(slug) : null;
    const done = () => {
      if (current === null) root.hidden = true;
    };
    if (to) {
      article.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' });
      wash.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: 'ease-in', fill: 'forwards' });
      root.animate([{ clipPath: FULL }, { clipPath: to }], { duration: 460, easing: EASE }).finished.then(() => {
        stop();
        done();
      }, () => {});
    } else if (animate && !calm()) {
      root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180 }).finished.then(done, () => {});
    } else done();
  }

  function sync(animate: boolean) {
    const slug = slugOf(location.pathname);
    if (!isHome(location.pathname) && !(slug && projects.some((p) => p.slug === slug))) {
      if (current !== null) close(false);
      return showLost();
    }
    hideLost();
    if (slug === current) return;
    if (slug) open(slug, animate);
    else close(animate);
  }

  const away = () => current !== null || lostOn;
  const goHome = () => {
    if (!away()) return;
    if (current !== null && history.state?.fromField) history.back();
    else {
      history.pushState(null, '', BASE);
      sync(true);
    }
  };

  const goSection = (id: string) => {
    if (away()) {
      history.pushState(null, '', `${BASE}#${id}`);
      sync(false);
    } else history.replaceState(history.state, '', `${BASE}#${id}`);
    document.getElementById(id)?.scrollIntoView();
  };

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest?.('a');
    if (!a || a.target === '_blank') return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;

    if (a.dataset.section) {
      e.preventDefault();
      goSection(a.dataset.section);
    } else if (a.hasAttribute('data-home')) {
      e.preventDefault();
      if (away()) goHome();
      else window.scrollTo({ top: 0 });
    } else if (slugOf(url.pathname)) {
      e.preventDefault();
      if (url.pathname === location.pathname) return;
      history.pushState({ fromField: current === null }, '', url.pathname);
      sync(true);
    }
  });

  addEventListener('popstate', () => sync(true));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && away()) goHome();
  });

  sync(false);
  if (current === null && location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}
