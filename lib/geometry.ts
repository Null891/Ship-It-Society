/* ==========================================================================
   Geometry for SVG drawn during render.

   Math.cos and Math.sin are not bit-identical across JavaScript engines:
   the server (Node) and the browser can disagree in the last digit, e.g.
   41.696851061588994 against 41.696851061589. React compares SVG attributes
   as strings when it hydrates, so unrounded trig in render is a hydration
   mismatch waiting for the right angle. Rounding to three decimals makes
   both sides print the same string, and a thousandth of a user unit is far
   below a device pixel.

   Anything computed in an effect or a frame loop (never serialised by the
   server) does not need this.
   ========================================================================== */

/** Round to three decimals so server and client serialise identically. */
export const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** A point at `radius` from (cx, cy) at `angle` radians, hydration-safe. */
export function polar(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
): [number, number] {
  return [r3(cx + Math.cos(angle) * radius), r3(cy + Math.sin(angle) * radius)];
}
