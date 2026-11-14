// Procedural artificial turf.
//
// One 512px tile of blades is generated once. It is rendered to an image and
// used as the page's repeating background, so scrolling costs nothing. Two
// small canvases ("patches") follow the cursor and the route dot and redraw the
// same blades bent away from them; a radial mask blends each patch into the
// static tile. Without WebGL the tile is drawn with Canvas 2D and the turf
// simply stays still.

const T = 512; // tile size, CSS px
const B = 64; // bucket size for culling
const NB = T / B;
const REACH = 30; // furthest a blade tip can sit from its root

const SHADOW = [0x3a / 255, 0x62 / 255, 0x29 / 255];
const BASE = [0x4f / 255, 0x7f / 255, 0x3a / 255];
const TIP = [0x79 / 255, 0xa2 / 255, 0x57 / 255];
const STRAW = [0.66, 0.74, 0.47];

const VERT = `
attribute vec2 aBase;
attribute vec2 aLean;
attribute vec3 aParam; // corner (-1, 0 tip, 1), shade, half width
uniform vec2 uOrigin;
uniform vec2 uTile;
uniform float uSize;
uniform vec4 uInfl;  // x, y, radius, push
uniform float uPress;
varying float vT;
varying float vShade;
varying float vLight;
const float K = 6.2831853 / ${T}.0;
void main() {
  vec2 base = aBase + uTile;
  vec2 d = base - uInfl.xy;
  float dist = length(d) + 0.001;
  float f = exp(-(dist * dist) / (uInfl.z * uInfl.z));
  vec2 lean = aLean + (d / dist) * f * uInfl.w;
  float tip = 1.0 - abs(aParam.x);
  vec2 nrm = normalize(vec2(-lean.y, lean.x) + 0.0001);
  vec2 p = base + lean * tip + nrm * aParam.x * aParam.z;
  float n = sin(K * aBase.x + 1.3) * sin(K * 2.0 * aBase.y + 0.7)
          + 0.6 * sin(K * (3.0 * aBase.x + 2.0 * aBase.y) + 2.1);
  vLight = 1.0 + 0.05 * n - f * uPress * step(0.001, uInfl.w);
  vT = tip;
  vShade = aParam.y;
  vec2 c = (p - uOrigin) / uSize;
  gl_Position = vec4(c.x * 2.0 - 1.0, 1.0 - c.y * 2.0, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform vec3 uShadow;
uniform vec3 uBase;
uniform vec3 uTip;
varying float vT;
varying float vShade;
varying float vLight;
void main() {
  vec3 tip = mix(uBase, uTip, vShade);
  tip = mix(tip, vec3(${STRAW.join(', ')}), step(0.95, vShade) * 0.55);
  vec3 col = mix(uShadow * 0.94, tip, smoothstep(0.0, 0.7, vT));
  gl_FragColor = vec4(col * vLight, 1.0);
}`;

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Blades {
  /** 7 floats per vertex, 3 vertices per blade, grouped by bucket. */
  data: Float32Array;
  start: Int32Array; // first blade of each bucket
  count: Int32Array;
  total: number;
}

function makeBlades(): Blades {
  const rand = rng(12);
  const pitch = T / 84; // tufts sit on a jittered lattice, like stitched turf
  const perTuft = 6;
  const list: number[][] = [];
  for (let gy = 0; gy < 84; gy++)
    for (let gx = 0; gx < 84; gx++) {
      const cx = (gx + 0.5 + (rand() - 0.5) * 0.9) * pitch;
      const cy = (gy + 0.5 + (rand() - 0.5) * 0.9) * pitch;
      const spin = rand() * Math.PI * 2;
      for (let i = 0; i < perTuft; i++) {
        const ang = spin + (i / perTuft) * Math.PI * 2 + (rand() - 0.5) * 0.9;
        const len = 4.5 + rand() * rand() * 9;
        const bx = (((cx + (rand() - 0.5) * 2.4) % T) + T) % T;
        const byy = (((cy + (rand() - 0.5) * 2.4) % T) + T) % T;
        // A slight shared lay, as if the pile had been brushed one way.
        const lx = Math.cos(ang) * len + 1.6;
        const ly = Math.sin(ang) * len - 2.4;
        list.push([bx, byy, lx, ly, Math.pow(rand(), 1.35), 0.55 + rand() * 0.6, rand()]);
      }
    }
  // Shuffle so overlap order is random, then group by bucket.
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  const bucketOf = (b: number[]) => Math.floor(b[1] / B) * NB + Math.floor(b[0] / B);
  const count = new Int32Array(NB * NB);
  for (const b of list) count[bucketOf(b)]++;
  const start = new Int32Array(NB * NB);
  for (let i = 1; i < start.length; i++) start[i] = start[i - 1] + count[i - 1];
  const fill = new Int32Array(NB * NB);
  const data = new Float32Array(list.length * 21);
  for (const b of list) {
    const k = bucketOf(b);
    let o = (start[k] + fill[k]++) * 21;
    for (const corner of [-1, 1, 0]) {
      data[o++] = b[0];
      data[o++] = b[1];
      data[o++] = b[2];
      data[o++] = b[3];
      data[o++] = corner;
      data[o++] = b[4];
      data[o++] = b[5];
    }
  }
  return { data, start, count, total: list.length };
}

const css = (c: number[], k = 1) =>
  `rgb(${c.map((v) => Math.round(Math.min(1, v * k) * 255)).join(' ')})`;

/** Canvas 2D rendering of the tile, for browsers without WebGL. */
function tile2d(blades: Blades, q: number): string {
  const cv = document.createElement('canvas');
  cv.width = cv.height = T * q;
  const g = cv.getContext('2d')!;
  g.scale(q, q);
  g.fillStyle = css(SHADOW, 0.9);
  g.fillRect(0, 0, T, T);
  const d = blades.data;
  const wrap = (v: number) => (v < REACH ? [0, T] : v > T - REACH ? [0, -T] : [0]);
  for (let i = 0; i < blades.total; i++) {
    const o = i * 21;
    const bx = d[o];
    const by = d[o + 1];
    const lx = d[o + 2];
    const ly = d[o + 3];
    const shade = d[o + 5];
    const hw = d[o + 6];
    const len = Math.hypot(lx, ly) || 1;
    const nx = (-ly / len) * hw;
    const ny = (lx / len) * hw;
    const tip = BASE.map((v, j) => v + (TIP[j] - v) * shade);
    for (const ox of wrap(bx))
      for (const oy of wrap(by)) {
        const x = bx + ox;
        const y = by + oy;
        g.fillStyle = css(tip, 0.85);
        g.beginPath();
        g.moveTo(x - nx, y - ny);
        g.lineTo(x + nx, y + ny);
        g.lineTo(x + lx, y + ly);
        g.fill();
        g.fillStyle = css(tip);
        g.beginPath();
        g.moveTo(x + lx * 0.45 - nx * 0.55, y + ly * 0.45 - ny * 0.55);
        g.lineTo(x + lx * 0.45 + nx * 0.55, y + ly * 0.45 + ny * 0.55);
        g.lineTo(x + lx, y + ly);
        g.fill();
      }
  }
  return cv.toDataURL('image/jpeg', 0.9);
}

interface Patch {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  size: number;
  radius: number;
  push: number;
  press: number;
  shown: boolean;
}

export class Turf {
  readonly live: boolean;
  private q = Math.min(window.devicePixelRatio || 1, 2);
  private gl: WebGLRenderingContext | null = null;
  private glCanvas = document.createElement('canvas');
  private blades = makeBlades();
  private u: Record<string, WebGLUniformLocation | null> = {};
  private pointer!: Patch;
  private walker!: Patch;

  constructor(private ground: HTMLElement) {
    this.live = this.initGL();
    const url = this.live ? this.tileGL() : tile2d(this.blades, this.q);
    ground.style.setProperty('--turf-img', `url(${url})`);
    if (this.live) {
      this.pointer = this.makePatch(232, 46, 10, 0.05);
      this.walker = this.makePatch(132, 22, 7, 0.2);
    }
  }

  private initGL(): boolean {
    const cv = this.glCanvas;
    cv.width = cv.height = T * this.q;
    const gl = cv.getContext('webgl', {
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: 'low-power',
    }) as WebGLRenderingContext | null;
    if (!gl) return false;
    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = shader(gl.VERTEX_SHADER, VERT);
    const fs = shader(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return false;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, this.blades.data, gl.STATIC_DRAW);
    const attr = (name: string, size: number, offset: number) => {
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 28, offset);
    };
    attr('aBase', 2, 0);
    attr('aLean', 2, 8);
    attr('aParam', 3, 16);
    for (const n of ['uOrigin', 'uTile', 'uSize', 'uInfl', 'uPress', 'uShadow', 'uBase', 'uTip'])
      this.u[n] = gl.getUniformLocation(prog, n);
    gl.uniform3fv(this.u.uShadow, SHADOW);
    gl.uniform3fv(this.u.uBase, BASE);
    gl.uniform3fv(this.u.uTip, TIP);
    gl.clearColor(SHADOW[0] * 0.9, SHADOW[1] * 0.9, SHADOW[2] * 0.9, 1);
    gl.enable(gl.SCISSOR_TEST);
    this.gl = gl;
    return true;
  }

  /** Draw every blade that can reach the square at (ox, oy) of the given size. */
  private draw(ox: number, oy: number, size: number, px: number) {
    const gl = this.gl!;
    gl.viewport(0, 0, px, px);
    gl.scissor(0, 0, px, px);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(this.u.uOrigin, ox, oy);
    gl.uniform1f(this.u.uSize, size);
    const x0 = ox - REACH;
    const y0 = oy - REACH;
    const x1 = ox + size + REACH;
    const y1 = oy + size + REACH;
    const { start, count } = this.blades;
    for (let ty = Math.floor(y0 / T); ty * T < y1; ty++)
      for (let tx = Math.floor(x0 / T); tx * T < x1; tx++) {
        gl.uniform2f(this.u.uTile, tx * T, ty * T);
        const bx0 = Math.max(0, Math.floor((x0 - tx * T) / B));
        const bx1 = Math.min(NB - 1, Math.floor((x1 - tx * T) / B));
        const by0 = Math.max(0, Math.floor((y0 - ty * T) / B));
        const by1 = Math.min(NB - 1, Math.floor((y1 - ty * T) / B));
        for (let by = by0; by <= by1; by++) {
          // Buckets in a row are contiguous in the buffer: one call per row.
          const first = start[by * NB + bx0];
          const last = by * NB + bx1;
          const n = start[last] + count[last] - first;
          if (n > 0) gl.drawArrays(gl.TRIANGLES, first * 3, n * 3);
        }
      }
  }

  private tileGL(): string {
    const gl = this.gl!;
    gl.uniform4f(this.u.uInfl, 0, 0, 1, 0);
    gl.uniform1f(this.u.uPress, 0);
    this.draw(0, 0, T, T * this.q);
    return this.glCanvas.toDataURL('image/jpeg', 0.92);
  }

  private makePatch(size: number, radius: number, push: number, press: number): Patch {
    const canvas = document.createElement('canvas');
    canvas.className = 'turf-patch';
    canvas.width = canvas.height = size * this.q;
    canvas.style.width = canvas.style.height = `${size}px`;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.hidden = true;
    this.ground.prepend(canvas);
    return { canvas, ctx: canvas.getContext('2d')!, size, radius, push, press, shown: false };
  }

  private paint(p: Patch, x: number, y: number, k: number) {
    if (k < 0.01) {
      if (p.shown) {
        p.canvas.hidden = true;
        p.shown = false;
      }
      return;
    }
    const gl = this.gl!;
    const ox = Math.round(x - p.size / 2);
    const oy = Math.round(y - p.size / 2);
    const px = p.size * this.q;
    gl.uniform4f(this.u.uInfl, x, y, p.radius, p.push * k);
    gl.uniform1f(this.u.uPress, p.press * k);
    this.draw(ox, oy, p.size, px);
    p.ctx.drawImage(this.glCanvas, 0, this.glCanvas.height - px, px, px, 0, 0, px, px);
    p.canvas.style.transform = `translate(${ox}px, ${oy}px)`;
    if (!p.shown) {
      p.canvas.hidden = false;
      p.shown = true;
    }
  }

  /** Coordinates are relative to the ground element. k is 0..1 strength. */
  bendAtPointer(x: number, y: number, k: number) {
    if (this.live) this.paint(this.pointer, x, y, k);
  }

  bendAtDot(x: number, y: number) {
    if (this.live) this.paint(this.walker, x, y, 1);
  }
}
