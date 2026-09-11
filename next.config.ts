import type { NextConfig } from "next";

/* ==========================================================================
   Security headers.

   The club's whole pitch is "nothing ships unreviewed", and one of its
   sponsors (ArgosX) scans for exactly these. Shipping a site with none of
   them was not a good look — and the site was demonstrably framable, which
   is how an auditor ran mobile tests against it inside an iframe.

   A note on script-src. The strict answer is a per-request nonce, but that
   forces every page to render dynamically and this site is fully static —
   we would trade a real, measured performance win for a theoretical gain.
   There is no user-generated content rendered anywhere here, and the one
   inline script is our own boot script in app/layout.tsx. So 'unsafe-inline'
   is a considered trade-off, not an oversight. Everything else is locked
   down, and frame-ancestors closes the finding that was actually exploited.
   ========================================================================== */

const isDev = process.env.NODE_ENV === "development";

const CSP = [
  "default-src 'self'",
  // 'unsafe-inline': see the note above. va.vercel-scripts.com is Analytics.
  // 'unsafe-eval' is added in DEVELOPMENT ONLY: React rebuilds server call
  // stacks with eval() in dev and Turbopack's HMR relies on it, so without
  // it every local page load logs CSP errors. Production never receives it.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com`,
  // Tailwind emits inline styles, and Motion writes inline style attributes.
  "style-src 'self' 'unsafe-inline' https://api.fontshare.com",
  "font-src 'self' https://cdn.fontshare.com data:",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Production is https-only; upgrading would only break plain-http localhost.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  // Redundant with frame-ancestors for modern browsers, kept for older ones.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
