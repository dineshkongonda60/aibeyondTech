import fs from "fs";
import path from "path";

export default function sitemap() {
  const baseUrl = "https://aibeyond-tech.vercel.app";

  const blogs = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data/blogs.json"), "utf-8")
  );

  const blogUrls = blogs.map((blog: any) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: blog.date,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    ...blogUrls,
  ];
}