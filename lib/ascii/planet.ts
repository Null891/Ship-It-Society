/* ==========================================================================
   A ringed planet, rendered as text.

   A pure function: the same options give the same characters on every run,
   on the server and in a browser. There is no image and no randomness; each
   character cell is ray-cast against a unit sphere and a flat ring around
   it, lit from one direction, and the brightness picks a character from a
   density ramp.

   Geometry, in planet radii, viewer on +z looking down -z (orthographic):

     sphere   x² + y² + z² = 1. A cell on the disc sees the front surface,
              z = √(1 − x² − y²), and the normal there is (x, y, z).
     ring     the plane through the origin with normal N: +y tipped toward
              the viewer by `tilt`, then rolled about the view axis by
              `roll`. A cell's ray meets it at z = −(Nx·x + Ny·y) / Nz, and
              hits the ring when that point's radius is inside [inner, outer].
              The ring wins a cell over the sphere only where it is in front.
     light    Lambert shading, n · L, with a floor so the dark side still
              reads as a disc. The planet shadows the ring (a ray from the
              ring point toward the light meets the sphere), and the ring
              shadows the planet (a ray from the surface toward the light
              crosses the ring plane inside the ring).

   Character cells are taller than they are wide — `cellAspect` is width over
   height, 0.6 for a monospace face set with line-height 1 — so rows are
   sampled further apart than columns and the sphere comes out round.

   Trig runs only on the option angles, and is rounded (see lib/geometry.ts)
   so no engine's last digit can move a threshold and change a character.
   ========================================================================== */

import { r3 } from "@/lib/geometry";

/** Darkest to brightest. The first character is empty space. */
export const PLANET_RAMP = " .:-=+*#%@";

export type PlanetOptions = {
  /** Width of the sampled field, in characters. */
  cols?: number;
  /** Height of the sampled field, in characters, before cropping. */
  rows?: number;
  /** Character width divided by line height. */
  cellAspect?: number;
  /** Half the field's width, in planet radii. */
  span?: number;
  /** Ring edges, in planet radii. */
  ringInner?: number;
  ringOuter?: number;
  /**
   * Ring bands from the inner edge (0) to the outer edge (1):
   * [from, to, brightness]. Brightness 0 is a gap.
   */
  bands?: readonly (readonly [number, number, number])[];
  /** Radians the ring plane tips toward the viewer. */
  tilt?: number;
  /** Radians the whole system rolls about the view axis. */
  roll?: number;
  /** Direction toward the light. Normalised internally. */
  light?: readonly [number, number, number];
  ramp?: string;
};

type Vec = [number, number, number];

const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** Rounded to six decimals so the result cannot differ by engine. */
const r6 = (n: number) => Math.round(n * 1e6) / 1e6;

export const PLANET_DEFAULTS: Required<PlanetOptions> = {
  cols: 72,
  rows: 40,
  cellAspect: 0.6,
  span: 2.3,
  ringInner: 1.38,
  ringOuter: 2.2,
  bands: [
    [0, 0.12, 0.22],
    [0.12, 0.5, 0.66],
    [0.5, 0.58, 0],
    [0.58, 0.92, 0.5],
    [0.92, 1, 0.24],
  ],
  tilt: 0.5,
  roll: -0.24,
  light: [-0.6, 0.5, 0.62],
  ramp: PLANET_RAMP,
};

/**
 * The planet as lines of text, cropped to its bounding box: no empty rows
 * above or below, no shared leading spaces, no trailing spaces.
 */
export function renderPlanet(options: PlanetOptions = {}): string[] {
  const o = { ...PLANET_DEFAULTS, ...options };
  const lightLength = Math.hypot(...o.light);
  const L: Vec = [o.light[0] / lightLength, o.light[1] / lightLength, o.light[2] / lightLength];

  const ct = r6(Math.cos(o.tilt));
  const st = r6(Math.sin(o.tilt));
  const cr = r6(Math.cos(o.roll));
  const sr = r6(Math.sin(o.roll));
  const N: Vec = [-ct * sr, ct * cr, st];
  const lightOnRing = dot(N, L);

  const stepX = (2 * o.span) / o.cols;
  const stepY = stepX / o.cellAspect;
  const last = o.ramp.length - 1;
  const inner2 = o.ringInner * o.ringInner;
  const outer2 = o.ringOuter * o.ringOuter;

  const bandAt = (radius: number) => {
    const k = (radius - o.ringInner) / (o.ringOuter - o.ringInner);
    for (const [from, to, level] of o.bands) if (k >= from && k <= to) return level;
    return 0;
  };

  const lines: string[] = [];
  for (let row = 0; row < o.rows; row++) {
    const y = ((o.rows - 1) / 2 - row) * stepY;
    let line = "";
    for (let col = 0; col < o.cols; col++) {
      const x = (col - (o.cols - 1) / 2) * stepX;
      const d2 = x * x + y * y;
      const onDisc = d2 <= 1;
      const zSphere = onDisc ? Math.sqrt(1 - d2) : -Infinity;

      let brightness = -1;

      // The ring, where it is in front of the sphere or beside it.
      const zRing = -(N[0] * x + N[1] * y) / N[2];
      const ringR2 = d2 + zRing * zRing;
      if (ringR2 >= inner2 && ringR2 <= outer2 && zRing > zSphere) {
        const level = bandAt(Math.sqrt(ringR2));
        if (level > 0) {
          const towardLight = dot([x, y, zRing], L);
          const shadowed = towardLight < 0 && towardLight * towardLight >= ringR2 - 1;
          brightness = level * (0.45 + 0.55 * Math.abs(lightOnRing)) * (shadowed ? 0.2 : 1);
        }
      }

      // The sphere, where the ring does not cover it.
      if (brightness < 0 && onDisc) {
        const n: Vec = [x, y, zSphere];
        const lambert = Math.max(0, dot(n, L));
        const latitude = 0.93 + 0.07 * Math.cos(dot(n, N) * 9);
        brightness = Math.max(0.08, lambert * latitude * (0.8 + 0.2 * zSphere));

        if (Math.abs(lightOnRing) > 1e-6) {
          const s = -dot(n, N) / lightOnRing;
          if (s > 0) {
            const q: Vec = [n[0] + s * L[0], n[1] + s * L[1], n[2] + s * L[2]];
            const q2 = dot(q, q);
            if (q2 >= inner2 && q2 <= outer2 && bandAt(Math.sqrt(q2)) > 0) brightness *= 0.35;
          }
        }
      }

      line +=
        brightness < 0
          ? " "
          : o.ramp[Math.min(last, Math.max(1, Math.round(r3(brightness) * last)))];
    }
    lines.push(line.replace(/\s+$/, ""));
  }

  const first = lines.findIndex((l) => l.length > 0);
  if (first === -1) return [];
  let end = lines.length;
  while (end > first && lines[end - 1].length === 0) end--;
  const kept = lines.slice(first, end);
  const indent = Math.min(
    ...kept.filter((l) => l.length > 0).map((l) => l.length - l.trimStart().length),
  );
  return kept.map((l) => l.slice(indent));
}
