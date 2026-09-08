import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SmoothScroll } from "@/components/chrome/SmoothScroll";
import { StageRoot } from "@/components/chrome/Stage";
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
  colorScheme: "light",
};

/* Runs before first paint so the home page never flashes light before the
   cinematic hero takes over. StageRoot keeps it correct after navigation. */
const STAGE_SCRIPT = `try{document.documentElement.dataset.stage=location.pathname==="/"?"dark":"light"}catch(e){}`;

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
        <script dangerouslySetInnerHTML={{ __html: STAGE_SCRIPT }} />
        <StructuredData />
      </head>
      <body className="antialiased">
        <StageRoot />
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
