/* ==========================================================================
   A 5 × 7 dot-matrix alphabet, drawn for this site.

   Round letters take a cut corner instead of a curve — one dot missing at
   each corner of O, C, G, S and the round digits — the same chamfer the
   buttons and HUD panels use, so the pixel type belongs to the system.

   Each glyph is seven rows of five cells: "#" lit, "." dark. Supported:
   A–Z, 0–9, space, and . - / :. Lookup is case-insensitive; a character
   the alphabet does not have throws, so a missing glyph is caught when the
   page renders rather than shipping as a gap.
   ========================================================================== */

export const GLYPH_WIDTH = 5;
export const GLYPH_HEIGHT = 7;

const G: Record<string, string> = {
  A: ".###. #...# #...# ##### #...# #...# #...#",
  B: "####. #...# #...# ####. #...# #...# ####.",
  C: ".#### #.... #.... #.... #.... #.... .####",
  D: "####. #...# #...# #...# #...# #...# ####.",
  E: "##### #.... #.... ####. #.... #.... #####",
  F: "##### #.... #.... ####. #.... #.... #....",
  G: ".#### #.... #.... #.### #...# #...# .###.",
  H: "#...# #...# #...# ##### #...# #...# #...#",
  I: "##### ..#.. ..#.. ..#.. ..#.. ..#.. #####",
  J: "..### ....# ....# ....# ....# #...# .###.",
  K: "#...# #..#. #.#.. ##... #.#.. #..#. #...#",
  L: "#.... #.... #.... #.... #.... #.... #####",
  M: "#...# ##.## #.#.# #.#.# #...# #...# #...#",
  N: "#...# #...# ##..# #.#.# #..## #...# #...#",
  O: ".###. #...# #...# #...# #...# #...# .###.",
  P: "####. #...# #...# ####. #.... #.... #....",
  Q: ".###. #...# #...# #...# #.#.# #..#. .##.#",
  R: "####. #...# #...# ####. #.#.. #..#. #...#",
  S: ".#### #.... #.... .###. ....# ....# ####.",
  T: "##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..",
  U: "#...# #...# #...# #...# #...# #...# .###.",
  V: "#...# #...# #...# #...# .#.#. .#.#. ..#..",
  W: "#...# #...# #...# #.#.# #.#.# ##.## #...#",
  X: "#...# .#.#. .#.#. ..#.. .#.#. .#.#. #...#",
  Y: "#...# .#.#. .#.#. ..#.. ..#.. ..#.. ..#..",
  Z: "##### ....# ...#. ..#.. .#... #.... #####",
  "0": ".###. #...# #..## #.#.# ##..# #...# .###.",
  "1": "..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.",
  "2": ".###. #...# ....# ...#. ..#.. .#... #####",
  "3": "####. ....# ....# .###. ....# ....# ####.",
  "4": "...#. ..##. .#.#. #..#. ##### ...#. ...#.",
  "5": "##### #.... ####. ....# ....# #...# .###.",
  "6": ".###. #.... #.... ####. #...# #...# .###.",
  "7": "##### ....# ...#. ..#.. ..#.. ..#.. ..#..",
  "8": ".###. #...# #...# .###. #...# #...# .###.",
  "9": ".###. #...# #...# .#### ....# ....# .###.",
  " ": "..... ..... ..... ..... ..... ..... .....",
  ".": "..... ..... ..... ..... ..... ..... ..#..",
  "-": "..... ..... ..... .###. ..... ..... .....",
  "/": "....# ....# ...#. ..#.. .#... #.... #....",
  ":": "..... ..#.. ..... ..... ..... ..#.. .....",
};

/** A glyph as rows of booleans, `true` where the dot is lit. */
export function glyph(char: string): boolean[][] {
  const rows = G[char.toUpperCase()];
  if (!rows) throw new Error(`font5x7: no glyph for "${char}"`);
  return rows.split(" ").map((row) => [...row].map((cell) => cell === "#"));
}

export type Dot = { x: number; y: number; lit: boolean };

/**
 * Every dot of a block of text, in cell units: glyphs are GLYPH_WIDTH wide
 * with `tracking` empty cells between them, lines GLYPH_HEIGHT tall with
 * `leading` empty cells between them. Returns the dots and the block size.
 */
export function layout(
  lines: readonly string[],
  { tracking = 1, leading = 2 }: { tracking?: number; leading?: number } = {},
) {
  const dots: Dot[] = [];
  let width = 0;
  lines.forEach((line, li) => {
    const top = li * (GLYPH_HEIGHT + leading);
    [...line].forEach((char, ci) => {
      const left = ci * (GLYPH_WIDTH + tracking);
      glyph(char).forEach((row, y) =>
        row.forEach((lit, x) => dots.push({ x: left + x, y: top + y, lit })),
      );
    });
    width = Math.max(width, line.length * (GLYPH_WIDTH + tracking) - tracking);
  });
  const height = lines.length * (GLYPH_HEIGHT + leading) - leading;
  return { dots, width, height };
}
