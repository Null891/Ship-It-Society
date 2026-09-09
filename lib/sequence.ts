/* ==========================================================================
   The hero sequence.

   drawFrame() is a PURE function of progress. Given the same p it produces
   exactly the same frame, which is what makes scrubbing backwards
   frame-exact instead of an approximate reverse. Nothing in this file reads
   the clock, holds state, or mutates anything outside the 2D context.

   Two layouts are built at module load: a landscape composition for wide
   viewports and a portrait one for phones. A phone is not a small desktop —
   letterboxing the landscape composition into a 390px column left it
   stranded in empty space — so the portrait layout is a genuinely different
   interface: no sidebar, a tab row at the top, a bar at the foot.

   All geometry is in each layout's own stage units.
   ========================================================================== */

export type Palette = {
  ink: string;
  paper: string;
  muted: string;
  line: string;
  marigold: string;
  surface: string;
};

/* --- math ---------------------------------------------------------------- */

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Progress of p within the window [a, b], clamped to 0..1. */
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Deterministic PRNG. Same seed, same layout, every load and every pass. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function withAlpha(color: string, alpha: number) {
  if (color.startsWith("#")) {
    let h = color.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
  }
  const nums = color.match(/[\d.]+/g);
  if (nums && nums.length >= 3) {
    return `rgba(${nums[0]},${nums[1]},${nums[2]},${alpha})`;
  }
  return color;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, rr);
}

/* --- layout ---------------------------------------------------------------
   Both the code field and the resolved interface are static. The sequence
   only interpolates between them.
   ------------------------------------------------------------------------- */

type Rect = { x: number; y: number; w: number; h: number; r: number };
type Tone = "bright" | "plain" | "dim" | "accent";
type Token = { code: Rect; tone: Tone; line: number };

type CodeField = {
  left: number;
  right: number;
  top: number;
  lineH: number;
  lines: number;
};

type Layout = {
  W: number;
  H: number;
  win: { x: number; y: number; w: number; h: number };
  /** Sidebar divider x, or 0 when the layout has no sidebar. */
  railX: number;
  targets: Rect[];
  buttonIndex: number;
  morphing: Token[];
  dissolving: Token[];
  /** The region worth filling the viewport with. */
  focus: { x: number; y: number; w: number; h: number };
  code: CodeField;
};

/** Lines of pseudo-code laid out with a real indent stack, so the shape reads
 *  as source rather than as random bars. */
function buildTokens(seed: number, cfg: CodeField, minCount: number): Token[] {
  const rnd = mulberry32(seed);
  const tokens: Token[] = [];
  let indent = 0;

  for (let line = 0; line < cfg.lines; line++) {
    // Indent behaves like block structure: open, hold, close.
    const roll = rnd();
    if (roll > 0.72 && indent < 3) indent++;
    else if (roll < 0.16 && indent > 0) indent--;

    const x0 = cfg.left + indent * 24;
    const count = 1 + Math.floor(rnd() * 3);
    let x = x0;
    for (let i = 0; i < count; i++) {
      const w = 24 + Math.floor(rnd() * (cfg.right - cfg.left) * 0.34);
      if (x + w > cfg.right) break;
      const roll2 = rnd();
      const tone: Tone =
        i === 0 && roll2 > 0.62
          ? "bright"
          : roll2 > 0.86
            ? "accent"
            : roll2 > 0.4
              ? "plain"
              : "dim";
      tokens.push({
        code: { x, y: cfg.top + line * cfg.lineH, w, h: 10, r: 3 },
        tone,
        line,
      });
      x += w + 12;
    }
  }

  // A layout with fewer tokens than targets would leave interface elements
  // with nothing to morph from. Fail loudly at module load, not silently.
  if (tokens.length < minCount) {
    throw new Error(
      `sequence: layout needs ${minCount} tokens, generated ${tokens.length}`,
    );
  }
  return tokens;
}

/** Wide viewports: a desktop app with a sidebar. */
function buildLandscape(): Layout {
  const W = 1000;
  const H = 620;
  const win = { x: 150, y: 96, w: 700, h: 428 };
  const targets: Rect[] = [];

  for (let i = 0; i < 3; i++) {
    targets.push({ x: 170 + i * 19, y: 110, w: 9, h: 9, r: 4.5 });
  }
  // Sidebar, with one item pinned to the foot so the column does not trail off.
  for (let i = 0; i < 5; i++) {
    targets.push({ x: 170, y: 162 + i * 32, w: i === 0 ? 104 : 78, h: 9, r: 2 });
  }
  targets.push({ x: 170, y: 486, w: 66, h: 9, r: 2 });
  targets.push({ x: 322, y: 156, w: 190, h: 13, r: 3 });
  const buttonIndex = targets.length;
  targets.push({ x: 700, y: 152, w: 118, h: 30, r: 15 });
  for (let i = 0; i < 4; i++) {
    const cy = 206 + i * 74;
    targets.push({ x: 338, y: cy + 14, w: 168, h: 9, r: 2 });
    targets.push({ x: 338, y: cy + 33, w: 282, h: 7, r: 2 });
  }

  const code: CodeField = { left: 156, right: 846, top: 140, lineH: 30, lines: 13 };
  const tokens = buildTokens(20260907, code, targets.length);

  return {
    W,
    H,
    win,
    railX: win.x + 146,
    targets,
    buttonIndex,
    morphing: tokens.slice(0, targets.length),
    dissolving: tokens.slice(targets.length),
    focus: { x: 0, y: 0, w: W, h: H },
    code,
  };
}

/** Phones: a tall app with a tab row instead of a sidebar. */
function buildPortrait(): Layout {
  const W = 560;
  const H = 940;
  const win = { x: 40, y: 130, w: 480, h: 690 };
  const targets: Rect[] = [];

  for (let i = 0; i < 3; i++) {
    targets.push({ x: 62 + i * 18, y: 148, w: 8, h: 8, r: 4 });
  }
  // Tab row across the top of the content area.
  for (let i = 0; i < 3; i++) {
    targets.push({ x: 64 + i * 84, y: 202, w: 64, h: 9, r: 2 });
  }
  targets.push({ x: 64, y: 248, w: 190, h: 14, r: 3 });
  const buttonIndex = targets.length;
  targets.push({ x: 372, y: 242, w: 116, h: 30, r: 15 });
  // Five list rows filling the body.
  for (let i = 0; i < 5; i++) {
    const cy = 306 + i * 84;
    targets.push({ x: 64, y: cy, w: 176, h: 9, r: 2 });
    targets.push({ x: 64, y: cy + 19, w: 312, h: 7, r: 2 });
  }
  // Bottom bar.
  for (let i = 0; i < 4; i++) {
    targets.push({ x: 76 + i * 112, y: 772, w: 56, h: 9, r: 2 });
  }

  const code: CodeField = { left: 52, right: 512, top: 168, lineH: 34, lines: 17 };
  const tokens = buildTokens(20260907, code, targets.length);

  return {
    W,
    H,
    win,
    railX: 0,
    targets,
    buttonIndex,
    morphing: tokens.slice(0, targets.length),
    dissolving: tokens.slice(targets.length),
    focus: { x: 8, y: 96, w: W - 16, h: H - 130 },
    code,
  };
}

const LANDSCAPE = buildLandscape();
const PORTRAIT = buildPortrait();

const toneAlpha: Record<Tone, number> = {
  bright: 0.92,
  plain: 0.55,
  dim: 0.3,
  accent: 1,
};

/* --- phases ---------------------------------------------------------------
   Windows overlap slightly so nothing snaps between stages.
   ------------------------------------------------------------------------- */

const PHASE = {
  gridIn: [0.0, 0.08],
  cursorIn: [0.05, 0.11],
  cursorOut: [0.13, 0.2],
  codeIn: [0.12, 0.34],
  gridOut: [0.3, 0.44],
  morph: [0.34, 0.58],
  frameIn: [0.36, 0.5],
  scan: [0.56, 0.8],
  deploy: [0.78, 1.0],
  readout: [0.12, 0.2],
} as const;

/* --- drawing -------------------------------------------------------------- */

function drawGrid(
  ctx: CanvasRenderingContext2D,
  L: Layout,
  pal: Palette,
  alpha: number,
) {
  if (alpha <= 0.001) return;
  const step = 26;
  ctx.fillStyle = withAlpha(pal.paper, 0.1 * alpha);
  for (let x = step; x < L.W; x += step) {
    for (let y = step; y < L.H; y += step) {
      ctx.fillRect(x, y, 1.4, 1.4);
    }
  }
}

function drawCursor(
  ctx: CanvasRenderingContext2D,
  L: Layout,
  pal: Palette,
  p: number,
  alpha: number,
) {
  if (alpha <= 0.001) return;
  // Blink is a function of p, never of time, so the frame stays pure.
  const blink = 0.35 + 0.65 * Math.abs(Math.sin(p * 46));
  ctx.fillStyle = withAlpha(pal.marigold, alpha * blink);
  ctx.fillRect(L.code.left, L.code.top - 4, 10, 18);
}

function drawWindowFrame(
  ctx: CanvasRenderingContext2D,
  L: Layout,
  pal: Palette,
  t: number,
  scanT: number,
  deployT: number,
) {
  if (t <= 0.001) return;
  const e = easeOutExpo(t);
  const { win } = L;
  const chromeH = 38;
  // The frame draws itself: height grows from the title bar downward.
  const h = lerp(chromeH, win.h, e);

  ctx.save();
  roundRect(ctx, win.x, win.y, win.w, h, 14);
  ctx.fillStyle = withAlpha(pal.paper, 0.022 * e + 0.02 * deployT);
  ctx.fill();
  ctx.strokeStyle = withAlpha(
    pal.paper,
    lerp(0.14, 0.24, Math.max(scanT, deployT)) * e,
  );
  ctx.lineWidth = 1;
  ctx.stroke();

  if (e > 0.5) {
    ctx.strokeStyle = withAlpha(pal.paper, 0.1 * e);
    ctx.beginPath();
    ctx.moveTo(win.x, win.y + chromeH);
    ctx.lineTo(win.x + win.w, win.y + chromeH);
    ctx.stroke();
  }
  if (L.railX && h > 200) {
    ctx.strokeStyle = withAlpha(pal.paper, 0.08 * e);
    ctx.beginPath();
    ctx.moveTo(L.railX, win.y + chromeH);
    ctx.lineTo(L.railX, win.y + h);
    ctx.stroke();
  }
  // Portrait has no rail; it gets a rule above the bottom bar instead.
  if (!L.railX && e > 0.85) {
    const barY = win.y + win.h - 96;
    ctx.strokeStyle = withAlpha(pal.paper, 0.08 * e);
    ctx.beginPath();
    ctx.moveTo(win.x, barY);
    ctx.lineTo(win.x + win.w, barY);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTokens(
  ctx: CanvasRenderingContext2D,
  L: Layout,
  pal: Palette,
  codeT: number,
  morphT: number,
  scanY: number,
  deployT: number,
) {
  const morphE = easeInOutCubic(morphT);
  const lines = L.code.lines;

  L.morphing.forEach((tok, i) => {
    const target = L.targets[i];
    // Stagger the type-in by line, then by position, so it reads left to right.
    const start = (tok.line / lines) * 0.72 + (i % 3) * 0.02;
    const typeT = easeOutExpo(clamp01((codeT - start) / 0.3));
    if (typeT <= 0.001) return;

    // Each token starts its morph slightly after the one before it.
    const mStart = (i / L.morphing.length) * 0.28;
    const m = easeInOutCubic(clamp01((morphT - mStart) / (1 - mStart + 0.0001)));

    const x = lerp(tok.code.x, target.x, m);
    const y = lerp(tok.code.y, target.y, m);
    const w = lerp(tok.code.w * typeT, target.w, m);
    const h = lerp(tok.code.h, target.h, m);
    const r = lerp(tok.code.r, target.r, m);

    let alpha = lerp(toneAlpha[tok.tone], 0.82, morphE) * typeT;
    let fill = pal.paper;

    const isButton = i === L.buttonIndex;
    if (tok.tone === "accent" && m < 0.5) fill = pal.marigold;
    if (isButton && deployT > 0) {
      fill = pal.marigold;
      alpha = lerp(alpha, 1, easeOutCubic(deployT));
    }

    // Elements the scanline has passed brighten briefly, then settle.
    if (scanY > 0) {
      const passed = clamp01((scanY - y) / 40);
      alpha = lerp(alpha, Math.min(1, alpha + 0.28), passed);
    }

    ctx.fillStyle = withAlpha(fill, alpha);
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();
  });

  // Tokens with nowhere to go: they type in, then dissolve upward.
  L.dissolving.forEach((tok, i) => {
    const start = (tok.line / lines) * 0.72 + (i % 3) * 0.02;
    const typeT = easeOutExpo(clamp01((codeT - start) / 0.3));
    if (typeT <= 0.001) return;
    const out = easeInOutCubic(clamp01((morphT - (i % 5) * 0.04) / 0.5));
    const alpha = toneAlpha[tok.tone] * typeT * (1 - out);
    if (alpha <= 0.002) return;
    ctx.fillStyle = withAlpha(
      tok.tone === "accent" ? pal.marigold : pal.paper,
      alpha,
    );
    roundRect(
      ctx,
      tok.code.x,
      tok.code.y - out * 14,
      tok.code.w * (1 - out * 0.35),
      tok.code.h,
      tok.code.r,
    );
    ctx.fill();
  });
}

function drawScan(
  ctx: CanvasRenderingContext2D,
  L: Layout,
  pal: Palette,
  t: number,
  scanY: number,
) {
  if (t <= 0.001 || t >= 1) return;
  const { win } = L;

  ctx.save();
  roundRect(ctx, win.x, win.y, win.w, win.h, 14);
  ctx.clip();

  const trailH = Math.min(90, scanY - win.y);
  const trail = ctx.createLinearGradient(0, scanY - 90, 0, scanY);
  trail.addColorStop(0, withAlpha(pal.marigold, 0));
  trail.addColorStop(1, withAlpha(pal.marigold, 0.16));
  ctx.fillStyle = trail;
  ctx.fillRect(win.x, Math.max(win.y, scanY - 90), win.w, trailH);

  ctx.fillStyle = withAlpha(pal.marigold, 0.9);
  ctx.fillRect(win.x, scanY, win.w, 1.4);
  ctx.restore();

  // Edge ticks, so the sweep reads as measurement rather than decoration.
  ctx.fillStyle = withAlpha(pal.marigold, 0.9);
  ctx.fillRect(win.x - 14, scanY - 0.5, 9, 2);
  ctx.fillRect(win.x + win.w + 5, scanY - 0.5, 9, 2);
}

function drawUrlBar(
  ctx: CanvasRenderingContext2D,
  L: Layout,
  pal: Palette,
  t: number,
) {
  if (t <= 0.001) return;
  const e = easeOutExpo(t);
  const { win } = L;
  const full = Math.min(250, win.w * 0.46);
  const w = full * e;
  // Centred in the chrome bar, nudged clear of the traffic lights.
  const x = win.x + win.w / 2 - full / 2 + (L.railX ? 40 : 24);
  const y = win.y + 12;

  ctx.save();
  roundRect(ctx, x, y, w, 15, 7.5);
  ctx.fillStyle = withAlpha(pal.paper, 0.09 * e);
  ctx.fill();
  if (e > 0.35) {
    ctx.fillStyle = withAlpha(pal.marigold, 0.95 * e);
    ctx.fillRect(x + 10, y + 5.5, 5, 5);
    ctx.fillStyle = withAlpha(pal.paper, 0.5 * e);
    ctx.fillRect(x + 22, y + 6, Math.max(0, w - 44), 3);
  }
  ctx.restore();
}

/** Drawn OUTSIDE the stage transform, so it stays legible on a phone where
 *  the stage scales to a fraction of its nominal size. */
function drawReadout(
  ctx: CanvasRenderingContext2D,
  pal: Palette,
  p: number,
  scanT: number,
  deployT: number,
  box: { left: number; right: number; y: number; size: number },
  /** The readout belongs to the sequence, not to the title state, so it stays
   *  hidden while the headline still owns the screen. */
  alpha: number,
) {
  if (alpha <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `500 ${box.size}px "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "0.09em";

  let label: string;
  let value = "";
  let accent = false;

  if (p < PHASE.morph[0]) {
    label = "BUILDING";
    value = `${Math.round(seg(p, PHASE.codeIn[0], PHASE.codeIn[1]) * 100)}%`;
  } else if (p < PHASE.scan[0]) {
    label = "ASSEMBLING INTERFACE";
  } else if (scanT < 1) {
    // Findings resolve downward as the sweep proceeds: 3 -> 0.
    const remaining = Math.max(0, 3 - Math.floor(scanT * 4));
    label = "SCANNING";
    value = `${remaining} OPEN`;
    accent = remaining > 0;
  } else if (deployT < 0.55) {
    label = "SCAN CLEAN";
    value = "0 FINDINGS";
  } else {
    label = "LIVE";
    value = "SHIPPED";
    accent = true;
  }

  ctx.fillStyle = withAlpha(pal.paper, 0.45);
  ctx.fillText(label, box.left, box.y);
  const lw = ctx.measureText(label).width;
  if (value) {
    ctx.fillStyle = accent ? pal.marigold : withAlpha(pal.paper, 0.85);
    ctx.fillText(value, box.left + lw + box.size * 1.5, box.y);
  }

  const live = deployT > 0.55;
  const dotAlpha = live ? 1 : 0.3 + 0.3 * Math.abs(Math.sin(p * 40));
  ctx.fillStyle = withAlpha(live ? pal.marigold : pal.paper, dotAlpha);
  ctx.beginPath();
  ctx.arc(box.right, box.y, box.size * 0.33, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* --- entry point ---------------------------------------------------------- */

/**
 * Render one frame of the sequence.
 * @param p progress 0..1. Pure: same p always yields the same pixels.
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  p: number,
  w: number,
  h: number,
  pal: Palette,
) {
  const prog = clamp01(p);
  ctx.clearRect(0, 0, w, h);

  // A phone gets the portrait interface, not a shrunken desktop one.
  const narrow = w < 720 || h / w > 1.15;
  const L = narrow ? PORTRAIT : LANDSCAPE;
  const margin = narrow ? 16 : 40;
  const readoutSize = narrow ? 11 : 12;
  const reserve = readoutSize * 4;

  const scale = Math.min(
    (w - margin * 2) / L.focus.w,
    (h - margin * 2 - reserve) / L.focus.h,
  );
  // A slight settle on entry, so the composition arrives rather than appears.
  const settle = lerp(0.965, 1, easeOutExpo(seg(prog, 0, 0.4)));
  const k = scale * settle;

  const cx = L.focus.x + L.focus.w / 2;
  const cy = L.focus.y + L.focus.h / 2;

  /* The grid starts partly present rather than at zero.

     It used to fade in from nothing across the first 8% while the cursor was
     already at full opacity, so the very first frame — the one everybody
     sees — was a single marigold rectangle alone on black. It read as a
     rendering artifact rather than a cursor waiting in an empty file. A
     floor of 0.38 gives it a field to sit in from the first paint, and the
     rest of the fade still does its work. */
  const gridAlpha =
    (0.38 + 0.62 * seg(prog, PHASE.gridIn[0], PHASE.gridIn[1])) *
    (1 - seg(prog, PHASE.gridOut[0], PHASE.gridOut[1]));
  const codeT = seg(prog, PHASE.codeIn[0], PHASE.codeIn[1]);
  const morphT = seg(prog, PHASE.morph[0], PHASE.morph[1]);
  const frameT = seg(prog, PHASE.frameIn[0], PHASE.frameIn[1]);
  const scanT = seg(prog, PHASE.scan[0], PHASE.scan[1]);
  const deployT = seg(prog, PHASE.deploy[0], PHASE.deploy[1]);
  /* The cursor fades IN as the headline fades out, rather than starting at
     full opacity on the first frame. It sits at the code panel's origin,
     which is directly behind the headline, so at p=0 it read as a stray
     marigold block sitting on the type. Now the opening frame is the empty
     grid alone, and the cursor arrives once it has the stage to itself. */
  const cursorAlpha =
    seg(prog, PHASE.cursorIn[0], PHASE.cursorIn[1]) *
    (1 - seg(prog, PHASE.cursorOut[0], PHASE.cursorOut[1]));
  const scanY =
    scanT > 0 && scanT < 1 ? L.win.y + L.win.h * easeInOutCubic(scanT) : 0;

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(k, k);
  ctx.translate(-cx, -cy);

  drawGrid(ctx, L, pal, gridAlpha);
  drawCursor(ctx, L, pal, prog, cursorAlpha);
  drawWindowFrame(ctx, L, pal, frameT, scanT, deployT);
  drawTokens(ctx, L, pal, codeT, morphT, scanY, deployT);
  drawScan(ctx, L, pal, scanT, scanY);
  drawUrlBar(ctx, L, pal, deployT);

  ctx.restore();

  // Screen-space chrome, aligned to the window's on-screen edges.
  const sx = (v: number) => w / 2 + (v - cx) * k;
  const sy = (v: number) => h / 2 + (v - cy) * k;
  drawReadout(
    ctx,
    pal,
    prog,
    scanT,
    deployT,
    {
      left: Math.max(margin, sx(L.win.x)),
      right: Math.min(w - margin, sx(L.win.x + L.win.w)),
      y: Math.min(h - margin, sy(L.win.y + L.win.h) + readoutSize * 2.4),
      size: readoutSize,
    },
    seg(prog, PHASE.readout[0], PHASE.readout[1]),
  );
}

/** The frame shown when the visitor prefers reduced motion: scan complete,
 *  interface resolved, deploy underway. */
export const STATIC_FRAME = 0.86;
