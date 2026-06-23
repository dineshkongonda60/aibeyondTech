export const dynamic = "force-dynamic";

export default async function sitemap() {
  const baseUrl = "https://aibeyond-tech.vercel.app";

  let blogs = [];
  const repo = process.env.GITHUB_REPO!;

  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/dineshkongonda60/aibeyondTech/main/data/blogs.json",
      {
        cache: "no-store",
      }
    );

    blogs = await res.json();
  } catch (e) {
    console.error("Failed to fetch blogs", e);
  }

  const blogUrls = blogs.map((blog: any) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: new Date(blog.date),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...blogUrls,
  ];
}
