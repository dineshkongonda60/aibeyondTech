import fs from "fs";
import path from "path";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://aibeyond-tech.vercel.app";

  // ✅ Read blog data
  const blogs = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "data/blogs.json"),
      "utf-8"
    )
  );

  // ✅ Generate dynamic blog URLs
  const blogUrls = blogs.map((blog: any) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: new Date(blog.date),
    changeFrequency: "daily" as const, // ✅ Updated to daily
    priority: 0.8,
  }));

  // ✅ Return full sitemap
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily", // ✅ Updated to daily
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily", // ✅ Updated to daily
      priority: 0.9,
    },
    ...blogUrls,
  ];
}