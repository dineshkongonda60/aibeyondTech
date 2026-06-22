import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: {
    default: "AI & Beyond Tech",
    template: "%s | AI & Beyond Tech",
  },

  description:
    "AI & Beyond Tech provides AI solutions, RPA automation, and insights into the future of intelligent technology.",

  keywords: [
    "AI",
    "Automation",
    "RPA",
    "AI solutions",
    "Machine Learning",
    "AI blogs",
    "AI automation"
  ],

  authors: [{ name: "AI & Beyond Tech" }],
  creator: "AI & Beyond Tech",

  icons: {
    icon: "/favicon.ico",
  },

  metadataBase: new URL("https://aibeyond-tech.vercel.app"),

  openGraph: {
    title: "AI & Beyond Tech",
    description:
      "Explore AI, automation, and the future of technology with AI & Beyond Tech.",
    url: "https://aibeyond-tech.vercel.app",
    siteName: "AI & Beyond Tech",
    images: [
      {
        url: "/og-image.png", // ✅ add this image in public folder
        width: 1200,
        height: 630,
        alt: "AI & Beyond Tech",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "AI & Beyond Tech",
    description: "AI automation and future tech insights",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  verification: {
    google: "h6qVN3cKv3HoHLYPDEsh117-A_u5-4V5YpcH0lLEQJY",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Adsense Script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9814863623957523"
          crossOrigin="anonymous"
        />

        {/* ✅ Structured Data (SEO BOOST) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "AI & Beyond Tech",
              url: "https://aibeyond-tech.vercel.app",
              logo: "https://aibeyond-tech.vercel.app/logo.png",
              sameAs: [
                "https://www.linkedin.com",
                "https://twitter.com"
              ],
            }),
          }}
        />
      </head>

      <body>
        <div className="layout">
          <main className="main-content">{children}</main>

          {/* ✅ Footer */}
          <footer className="footer">
            © {new Date().getFullYear()} AI & Beyond Tech
          </footer>
        </div>
      </body>
    </html>
  );
}
