#!/usr/bin/env node
/* ==========================================================================
   Fail the build if stub text would reach a visitor.

   The site was rejected once from the is-a.dev registry as an "incomplete
   website". A reviewer reads unfinished copy as an unfinished site, so this
   check runs before every `npm run build` (the `prebuild` script) and fails
   it on any match.

   What it reads
     app/ components/ content/ lib/ public/, plus README.md and SETUP.md,
     in .ts .tsx .js .mjs .css .md .mdx .json .svg .txt files. The public
     README is part of what a reviewer sees, so it is held to the same rule.
     Skipped: node_modules, .next, dot-directories, this script, CLAUDE.md
     and AGENTS.md (they quote the patterns in order to forbid them).

   What it ignores
     Real comments only, found by parsing rather than by guessing:
       .ts .tsx .js .mjs  TypeScript's own parser. "//" inside a string, a
                          regex or JSX text is copy, not a comment.
       .css               block comments.
       .md .svg           HTML comments. .mdx adds {JSX comments}.
       .json .txt         nothing.
     A stub hidden in a comment never renders; a stub in a string does.

   How it matches
     Case-insensitive and word-boundary aware, over the whole file, so one
     legitimate use on a line never hides a real stub beside it. Exemptions
     apply to a single match, never to a line: the `placeholder=` attribute
     name, the `placeholder:` variant or key, the `::placeholder` selector and
     this check's own name are not stubs, while the value next to them is
     still read.

   Usage
     node scripts/check-placeholders.mjs            scan the site
     node scripts/check-placeholders.mjs <paths>    scan only these files or
                                                    directories (for testing)
   ========================================================================== */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIRS = ["app", "components", "content", "lib", "public"];
const ROOT_FILES = ["README.md", "SETUP.md"];
const EXT = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".md", ".mdx", ".json", ".svg", ".txt"]);
const SKIP_DIRS = new Set(["node_modules", ".next"]);
const SKIP_FILES = new Set(["scripts/check-placeholders.mjs", "CLAUDE.md", "AGENTS.md"]);

/* --- Patterns --------------------------------------------------------------
   `allow(text, index, match)` exempts one match by its immediate context.
   `visibleOnly` limits a pattern, in script files, to text a visitor can
   read (string literals, template text, JSX text), so an identifier or a
   prop name with the same spelling is not flagged.
   ------------------------------------------------------------------------- */

/** Phrasal verbs and idioms where "to come" is real copy, not a stub. */
const COME_FOLLOWERS =
  "off|back|out|up|in|into|on|over|through|along|across|around|down|home|together|to|from|with|by|forward|before|after|near|close|clean|true|first|last|apart|alive|undone|and|at|of|for|here|there|again|inside|outside";
const COME_IDIOMS = "years|months|weeks|days|decades|ages|times?|generations";

const PATTERNS = [
  { name: "TODO", re: /\btodo\b/gi },
  { name: "FIXME", re: /\bfixme\b/gi },
  { name: "TBD / TBA / TBC", re: /\btb[adc]\b/gi },
  { name: "TK", re: /\b(?:tk)+\b/gi },
  { name: "XXX", re: /\bx{3,}\b/gi },
  { name: "coming soon", re: /\bcoming\s+soon\b/gi },
  { name: "under construction", re: /\bunder\s+construction\b/gi },
  { name: "work in progress", re: /\bwork\s+in\s+progress\b/gi },
  { name: "to be announced", re: /\bto\s+be\s+(?:announced|confirmed|determined|decided)\b/gi },
  { name: "land soon", re: /\bland(?:s|ing)?\s+soon\b/gi },
  { name: "lorem ipsum", re: /\blorem\b|\bipsum\b/gi },
  { name: "sample project", re: /\bsample\s+projects?\b/gi },
  { name: "placeholder name", re: /\[\s*your\s+[a-z][a-z ]*\]|\b(?:jane|john)\s+doe\b/gi },
  { name: "example domain", re: /\bexample\.(?:com|org|net)\b/gi },
  { name: "fill in", re: /\bfill\s+in\b/gi },
  {
    // "Name to come", "details to come", "more to come". Not "come off it",
    // "to come back", or "in the years to come".
    name: "to come",
    re: new RegExp(
      `(?<!\\b(?:${COME_IDIOMS})\\s+)\\bto\\s+come\\b(?!\\s+(?:${COME_FOLLOWERS})\\b)`,
      "gi",
    ),
  },
  {
    // A stub in square brackets: "[Room number]", "[Name]", "[Insert date]".
    // Case-sensitive on purpose: one capitalised word, or two to five words.
    // Not an index or tuple type (preceded by a word or a bracket), not a
    // mapped type key (followed by ":" or "?"), not a Markdown link text
    // (followed by "(" or "[").
    name: "bracketed stub",
    re: /(?<![\w\])}$])\[(?:[A-Z][a-z]+|[A-Za-z][a-z]*(?:[ \t]+[A-Za-z][a-z]*){1,4})\](?![(:?[])/g,
  },
  {
    name: "placeholder",
    re: /\bplaceholders?\b/gi,
    visibleOnly: true,
    allow(text, index, match) {
      const after = text.slice(index + match.length, index + match.length + 8);
      if (text[index - 1] === ":") return true; // ::placeholder, :placeholder-shown
      if (/^\s*=/.test(after)) return true; // the attribute name
      if (/^\??:/.test(after)) return true; // placeholder: variant, key or prop type
      if (/^-shown\b/.test(after)) return true; // placeholder-shown: variant
      // This check's own name: "check-placeholders.mjs", "check:placeholders"
      // and "the placeholder check", as the docs refer to it.
      if (/check[-:]$/i.test(text.slice(Math.max(0, index - 6), index))) return true;
      if (/^\s+check\b/i.test(after)) return true;
      return false;
    },
  },
];

/* --- Comments ------------------------------------------------------------- */

/** Replace [start, end) with spaces, keeping newlines so offsets hold. */
function blank(chars, start, end) {
  for (let i = start; i < end; i++) {
    if (chars[i] !== "\n" && chars[i] !== "\r") chars[i] = " ";
  }
}

const SCRIPT_KIND = {
  ".ts": ts.ScriptKind.TS,
  ".tsx": ts.ScriptKind.TSX,
  ".js": ts.ScriptKind.JSX,
  ".mjs": ts.ScriptKind.JS,
};

const VISIBLE_KINDS = new Set([
  ts.SyntaxKind.StringLiteral,
  ts.SyntaxKind.NoSubstitutionTemplateLiteral,
  ts.SyntaxKind.TemplateHead,
  ts.SyntaxKind.TemplateMiddle,
  ts.SyntaxKind.TemplateTail,
  ts.SyntaxKind.JsxText,
]);

/**
 * Parse a script file. Returns the source with every real comment blanked,
 * and the ranges that hold visible text.
 *
 * Every comment is leading or trailing trivia of some token, so asking each
 * node and token for both finds them all. The one false positive that scan
 * produces is text inside JSX ("<p>// note</p>" reads as trivia after ">"),
 * so any range that starts inside a JsxText node is discarded.
 */
function parseScript(file, text, ext) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, SCRIPT_KIND[ext]);
  const comments = new Map();
  const visible = [];
  const jsxText = [];

  const collect = (ranges) => {
    if (ranges) for (const r of ranges) comments.set(r.pos, r.end);
  };
  const visit = (node) => {
    if (VISIBLE_KINDS.has(node.kind)) visible.push([node.getStart(source), node.end]);
    if (node.kind === ts.SyntaxKind.JsxText) {
      jsxText.push([node.pos, node.end]);
      return;
    }
    collect(ts.getLeadingCommentRanges(text, node.pos));
    collect(ts.getTrailingCommentRanges(text, node.end));
    for (const child of node.getChildren(source)) visit(child);
  };
  visit(source);

  // split("") indexes by UTF-16 unit, matching the parser's offsets.
  const chars = text.split("");
  for (const [start, end] of comments) {
    if (jsxText.some(([a, b]) => start >= a && start < b)) continue;
    blank(chars, start, end);
  }
  return { clean: chars.join(""), visible };
}

/** CSS block comments, skipping anything inside a quoted string. */
function stripCss(text) {
  const chars = text.split("");
  let quote = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = "";
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      continue;
    }
    if (c === "/" && text[i + 1] === "*") {
      const close = text.indexOf("*/", i + 2);
      const end = close === -1 ? text.length : close + 2;
      blank(chars, i, end);
      i = end - 1;
    }
  }
  return chars.join("");
}

/** Blank every match of a comment pattern. */
function stripPattern(text, re) {
  const chars = text.split("");
  for (const m of text.matchAll(re)) blank(chars, m.index, m.index + m[0].length);
  return chars.join("");
}

function prepare(file, text) {
  const ext = extname(file).toLowerCase();
  if (ext in SCRIPT_KIND) return parseScript(file, text, ext);
  if (ext === ".css") return { clean: stripCss(text), visible: null };
  if (ext === ".md" || ext === ".svg") return { clean: stripPattern(text, /<!--[\s\S]*?-->/g), visible: null };
  if (ext === ".mdx") {
    return { clean: stripPattern(text, /<!--[\s\S]*?-->|\{\s*\/\*[\s\S]*?\*\/\s*\}/g), visible: null };
  }
  return { clean: text, visible: null };
}

/* --- Scanning ------------------------------------------------------------- */

const toPosix = (p) => relative(ROOT, p).split(sep).join("/");

function walk(dir, out) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (SKIP_DIRS.has(entry) || entry.startsWith(".")) continue;
      walk(full, out);
    } else if (EXT.has(extname(entry).toLowerCase()) && !SKIP_FILES.has(toPosix(full))) {
      out.push(full);
    }
  }
  return out;
}

function targets(args) {
  const out = [];
  const add = (full) => {
    let stat;
    try {
      stat = statSync(full);
    } catch {
      return; // a directory the project does not have yet
    }
    if (stat.isDirectory()) walk(full, out);
    else if (EXT.has(extname(full).toLowerCase()) && !SKIP_FILES.has(toPosix(full))) out.push(full);
  };
  if (args.length) for (const a of args) add(resolve(process.cwd(), a));
  else for (const p of [...DIRS, ...ROOT_FILES]) add(join(ROOT, p));
  return out;
}

function scan(file) {
  const text = readFileSync(file, "utf8");
  const { clean, visible } = prepare(file, text);
  const lineStarts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") lineStarts.push(i + 1);
  const locate = (index) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= index) lo = mid;
      else hi = mid - 1;
    }
    return { line: lo + 1, col: index - lineStarts[lo] + 1, start: lineStarts[lo] };
  };

  const found = [];
  for (const { name, re, allow, visibleOnly } of PATTERNS) {
    for (const m of clean.matchAll(re)) {
      const index = m.index;
      if (visibleOnly && visible && !visible.some(([a, b]) => index >= a && index < b)) continue;
      if (allow && allow(clean, index, m[0])) continue;
      const { line, col, start } = locate(index);
      const end = text.indexOf("\n", start);
      found.push({
        file: toPosix(file),
        line,
        col,
        name,
        match: m[0],
        text: text.slice(start, end === -1 ? text.length : end).trim().slice(0, 120),
      });
    }
  }
  return found;
}

const files = targets(process.argv.slice(2));
const hits = files.flatMap(scan).sort((a, b) =>
  a.file === b.file ? a.line - b.line || a.col - b.col : a.file < b.file ? -1 : 1,
);

if (hits.length === 0) {
  console.log(`placeholder check: clean (${files.length} files)`);
  process.exit(0);
}

console.error(
  `\nplaceholder check FAILED: ${hits.length} match${hits.length === 1 ? "" : "es"} would ship.\n`,
);
for (const h of hits) {
  console.error(`  ${h.file}:${h.line}:${h.col}  [${h.name}] "${h.match}"`);
  console.error(`    ${h.text}`);
}
console.error(
  "\nReplace each with real content or remove it. If a match is genuinely not\n" +
    "a stub, narrow the pattern in scripts/check-placeholders.mjs and say why.\n",
);
process.exit(1);
