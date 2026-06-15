import "./globals.css";


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