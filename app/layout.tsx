import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SmoothScroll } from "@/components/chrome/SmoothScroll";
import { RevealRoot } from "@/components/motion/RevealRoot";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { StructuredData } from "@/components/chrome/StructuredData";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { club, hero } from "@/content/club";
import { SITE_URL } from "@/lib/site";

/* Date-driven content (the next meeting, which cycle is running, the footer
   year) is rendered on the server, so a fully static page would freeze it at
   deploy time. Regenerating every six hours keeps it true without anyone
   having to redeploy. The countdown itself runs on the client. */
export const revalidate = 21600;

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

/* One dark stage on every page, so the browser chrome matches it whatever
   the visitor's OS setting is. */
export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

/* Runs before first paint. Two jobs:

   1. the `anim` class — this is the gate for every entry reveal on the site.
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

   2. a dead-man's switch. If `anim` is set but RevealRoot never mounts —
      a hydration failure, a bundle that 404s — nothing would ever add
      `is-in` and the page would stay hidden. So the script disarms itself
      after three seconds unless RevealRoot has reported in. The worst case
      degrades to "everything visible, no animation" rather than a blank
      page. */
const BOOT_SCRIPT = `try{var d=document,e=d.documentElement;
if(d.visibilityState==="visible"&&"IntersectionObserver" in window&&!matchMedia("(prefers-reduced-motion: reduce)").matches){
e.classList.add("anim");
setTimeout(function(){if(e.dataset.revealReady!=="1")e.classList.remove("anim")},3000)}
}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning is required, not incidental. BOOT_SCRIPT runs
    // before React hydrates and adds the `anim` class to <html>, so the
    // server markup and the live DOM necessarily disagree on that attribute.
    // This suppresses the warning for this element's own attributes only —
    // one level deep — so genuine mismatches inside the tree still report.
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
          href="https://api.fontshare.com/v2/css?f%5B%5D=switzer@300,400,500,600,700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <StructuredData />
      </head>
      <body className="antialiased">
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
