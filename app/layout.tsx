import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: {
    default: "AI & Beyond Tech",
    template: "%s | AI & Beyond Tech",
  },
  icons:{
    icon: "/favicon.ico"
  },
  description: "Exploring AI, Automation & The Future of Technology",

  verification:{
    google:"h6qVN3cKv3HoHLYPDEsh117-A_u5-4V5YpcH0lLEQJY",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      
  <head>
        {/* ✅ ADSENSE SCRIPT */}
        
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9814863623957523"
  crossOrigin="anonymous"
/>

      </head>

      <body>
        <div className="layout">
          <main className="main-content">{children}</main>

          {/* ✅ Footer moved to layout */}
          <footer className="footer">
            © AI & Beyond Tech
          </footer>
        </div>
      </body>
    </html>
  );
}