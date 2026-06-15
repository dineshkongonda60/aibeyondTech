export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://aibeyond-tech.vercel.app/sitemap.xml",
  };
}
