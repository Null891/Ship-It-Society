#!/usr/bin/env node
/* ==========================================================================
   Fail the build if a placeholder would reach a visitor.

   This exists because the site was rejected from the is-a.dev registry for
   "incomplete website" — visible TODO / TBA / "Name to come" / example.com
   strings. A lint rule is cheaper than a second rejection.

   Scans the source that produces rendered output. Docs and this script are
   exempt; so are the handful of legitimate uses listed in ALLOW.
   ========================================================================== */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const SCAN = ["app", "components", "content", "lib"];
const EXT = new Set([".ts", ".tsx", ".css"]);

/** Each needs a reason. If you add one, say why it is not a real placeholder. */
const ALLOW = [
  // React's own attribute, and our styling hook for it.
  /placeholder[=:]/,
  /placeholder:text-/,
  // The form's example email is illustrative input, shown greyed inside the
  // field — it is not presented as the club's address.
  /placeholder="you@example\.com"/,
  // Prose in comments explaining this very check.
  /check-placeholders/,
];

const PATTERNS = [
  { re: /\bTODO\b/, name: "TODO" },
  { re: /\bFIXME\b/, name: "FIXME" },
  { re: /\bTBA\b/, name: "TBA" },
  { re: /\bTBD\b/, name: "TBD" },
  { re: /\bto come\b/i, name: '"to come"' },
  { re: /\bLorem\b/i, name: "Lorem" },
  { re: /\bFill in\b/i, name: '"Fill in"' },
  { re: /\bComing soon\b/i, name: '"Coming soon"' },
  { re: /\bexample\.com\b/, name: "example.com" },
  { re: /\bplaceholder\b/i, name: "placeholder" },
];

/**
 * Strip comments before scanning. A placeholder inside a comment never
 * reaches a visitor, and this file's own documentation would otherwise trip
 * the check. Blanks the comment body while preserving line count so the
 * reported line numbers stay accurate.
 */
function stripComments(src) {
  let out = "";
  let i = 0;
  // 0 = code, 1 = line comment, 2 = block comment, 3 = string, 4 = template
  let mode = 0;
  let quote = "";
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (mode === 0) {
      if (c === "/" && next === "/") { mode = 1; out += "  "; i += 2; continue; }
      if (c === "/" && next === "*") { mode = 2; out += "  "; i += 2; continue; }
      if (c === '"' || c === "'") { mode = 3; quote = c; out += c; i++; continue; }
      if (c === "`") { mode = 4; out += c; i++; continue; }
      out += c; i++; continue;
    }
    if (mode === 1) {
      if (c === "\n") { mode = 0; out += "\n"; } else out += " ";
      i++; continue;
    }
    if (mode === 2) {
      if (c === "*" && next === "/") { mode = 0; out += "  "; i += 2; continue; }
      out += c === "\n" ? "\n" : " ";
      i++; continue;
    }
    if (mode === 3) {
      if (c === "\\") { out += "  "; i += 2; continue; }
      if (c === quote) mode = 0;
      out += c; i++; continue;
    }
    // template literal
    if (c === "\\") { out += "  "; i += 2; continue; }
    if (c === "`") mode = 0;
    out += c; i++;
  }
  return out;
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      walk(full, out);
    } else if (EXT.has(entry.slice(entry.lastIndexOf(".")))) {
      out.push(full);
    }
  }
  return out;
}

const hits = [];
for (const dir of SCAN) {
  let files;
  try {
    files = walk(join(ROOT, dir));
  } catch {
    continue; // directory may not exist
  }
  for (const file of files) {
    const lines = stripComments(readFileSync(file, "utf8")).split(/\r?\n/);
    lines.forEach((line, i) => {
      if (ALLOW.some((a) => a.test(line))) return;
      for (const { re, name } of PATTERNS) {
        if (re.test(line)) {
          hits.push({
            file: relative(ROOT, file).split(sep).join("/"),
            line: i + 1,
            name,
            text: line.trim().slice(0, 100),
          });
          break;
        }
      }
    });
  }
}

if (hits.length === 0) {
  console.log("placeholder check: clean");
  process.exit(0);
}

console.error(
  `\nplaceholder check FAILED — ${hits.length} placeholder${
    hits.length === 1 ? "" : "s"
  } would ship:\n`,
);
for (const h of hits) {
  console.error(`  ${h.file}:${h.line}  [${h.name}]`);
  console.error(`    ${h.text}`);
}
console.error(
  "\nReplace each with real content, delete the section, or add a documented\n" +
    "exemption to ALLOW in scripts/check-placeholders.mjs.\n",
);
process.exit(1);
