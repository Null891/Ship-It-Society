import "server-only";

/* ==========================================================================
   Rate limiting — a sliding-window log per client IP, in memory.

   20 submissions a minute. The old limit was 4, which sounds safe until
   you remember who applies: students, together, from the school network,
   which reaches the internet through one public IP. Five friends applying
   at lunch would have locked the fifth one out. Twenty still stops a naive
   flood cold.

   Honest limits of this approach:
     · Serverless instances do not share memory. Each warm instance keeps
       its own log, so a burst spread across instances gets more through,
       and a cold start forgets everything. It throttles a careless script;
       it does not stop a determined, distributed one. The honeypot, the
       schema, the size cap and the same-origin check do the rest.
     · The log lives on globalThis so every route bundle in one process —
       and a module reloaded by the dev server — shares a single window.

   Denied attempts are not recorded, so each IP holds at most MAX
   timestamps and the window reopens exactly when the oldest one ages out.
   ========================================================================== */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const SWEEP_AT = 1000;

type Store = Map<string, number[]>;
const KEY = Symbol.for("ship-it.forms.rate-limit");
const g = globalThis as typeof globalThis & { [KEY]?: Store };
const hits: Store = (g[KEY] ??= new Map());

export type RateResult = { ok: true } | { ok: false; retryAfter: number };

export function rateLimit(ip: string, now = Date.now()): RateResult {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    const retryAfter = Math.max(1, Math.ceil((recent[0] + WINDOW_MS - now) / 1000));
    return { ok: false, retryAfter };
  }

  recent.push(now);
  hits.set(ip, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > SWEEP_AT) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return { ok: true };
}

/** The client's IP as the platform reports it. Vercel overwrites
 *  x-forwarded-for itself, so the first entry cannot be spoofed there. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
