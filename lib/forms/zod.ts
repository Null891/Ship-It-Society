import { z } from "zod";

/* ==========================================================================
   The one place Zod is imported for forms.

   Zod 4 probes for `new Function` the first time an object schema parses,
   to decide whether it can compile a fast path. The probe is wrapped in a
   try/catch, but a strict CSP still reports it as a violation — and the
   production CSP forbids eval, so every form page logged one. `jitless`
   skips the probe entirely. It has to be set before anything parses, so
   every schema file imports `z` from here rather than from "zod" directly.
   ========================================================================== */

z.config({ jitless: true });

export { z };
