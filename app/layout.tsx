import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SmoothScroll } from "@/components/chrome/SmoothScroll";
import { StageRoot } from "@/components/chrome/Stage";
import { RevealRoot } from "@/components/motion/RevealRoot";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { StructuredData } from "@/components/chrome/StructuredData";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { club, hero } from "@/content/club";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shipitsociety.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${club.name} — ${club.school}`,
    template: `%s — ${club.name}`,
  },
  description: hero.standfirst,
  openGraph: {
    title: `${club.name} — ${club.school}`,
    description: hero.standfirst,
    url: "/",
    siteName: club.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${club.name} — ${club.school}`,
    description: hero.standfirst,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "light dark",
};

/* Runs before first paint. Three jobs:

   1. data-stage — so the home page never flashes light before the cinematic
      hero takes over. StageRoot keeps it correct after navigation.

   2. the `anim` class — this is the gate for every entry reveal on the site.
      Reveals are hidden ONLY under html.anim, so this script decides whether
      anything is allowed to be invisible. It says yes only when the tab is
      actually visible, IntersectionObserver exists to bring content back, and
      the user has not asked for reduced motion.

      That ordering is the fix for a real bug: the hero used to ship
      opacity:0 from the server and rely on an observer to reveal it, so a
      page opened in a background tab stayed blank indefinitely — the
      observer does not fire for a tab that was never displayed. Now the
      background-tab path simply never adds `anim`, and the content is
      visible from the first byte. Same for JS being disabled entirely.

   3. a dead-man's switch. If `anim` is set but RevealRoot never mounts —
      a hydration failure, a bundle that 404s — nothing would ever add
      `is-in` and the page would stay hidden. So the script disarms itself
      after three seconds unless RevealRoot has reported in. The worst case
      degrades to "everything visible, no animation" rather than a blank
      page. */
const BOOT_SCRIPT = `try{var d=document,e=d.documentElement;
e.dataset.stage=location.pathname==="/"?"dark":"light";
if(d.visibilityState==="visible"&&"IntersectionObserver" in window&&!matchMedia("(prefers-reduced-motion: reduce)").matches){
e.classList.add("anim");
setTimeout(function(){if(e.dataset.revealReady!=="1")e.classList.remove("anim")},3000)}
}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning is required, not incidental. STAGE_SCRIPT runs
    // before React hydrates and stamps data-stage onto <html>, so the server
    // markup (no attribute) and the live DOM (attribute set) necessarily
    // disagree. The alternative is a flash of the wrong background on every
    // load. This suppresses the warning for this element's own attributes
    // only — one level deep — so genuine mismatches anywhere inside the tree
    // are still reported.
    <html
      lang="en"
      className={GeistMono.variable}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="preconnect"
          href="https://cdn.fontshare.com"
          crossOrigin="anonymous"
        />
        {/* Preload the two weights used above the fold. Without these the
            browser waits for the Fontshare stylesheet before it even learns
            the font URLs, and that extra hop is what LCP was waiting on.
            If Fontshare ever rotates these hashed paths the preload simply
            goes unused — the stylesheet below still resolves the real files. */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          href="https://cdn.fontshare.com/wf/BLNB4FAQFNK56DWWNF7PMGTCOTZHOEII/ST3WKSSDMBK2MIQQO3MAVYWLF4FTOLFV/6IN5WOLRCYP4G4MOCOHOMXNON6Q7MDAR.woff2"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          href="https://cdn.fontshare.com/wf/5SZVFDB7V52TI6ULVC6J3WQZQCIZVDV5/ODYPSTCUDMKSTYIPTV4CLQ7URIK7XYBJ/YS3VPNVO4B3TOJMEXDGFZQ4TLZGGSRZC.woff2"
        />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f%5B%5D=switzer@400,500,600,700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <StructuredData />
      </head>
      <body className="antialiased">
        <StageRoot />
        <RevealRoot />
        <SmoothScroll>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </SmoothScroll>
        {/* These load from /_vercel/* and only exist once deployed, so they
            would 404 noisily in local development. */}
        {process.env.NODE_ENV === "production" && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
