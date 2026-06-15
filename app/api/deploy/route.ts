export async function POST(req: Request) {
  const { topic, html, blogData, imageUrl } = await req.json();

  const slug = topic.toLowerCase().replace(/\s+/g, "-");

  const repo = process.env.GITHUB_REPO!;
  const token = process.env.GITHUB_TOKEN!;

  // ✅ Get existing blogs.json
  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/data/blogs.json`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const fileData = await res.json();
  const existing = JSON.parse(
    Buffer.from(fileData.content, "base64").toString()
  );

  // ✅ Store metadata
  const newBlog = {
    title: blogData.title,
    slug,
    description: blogData.meta_description,
    image: imageUrl, // ⚠ replace later with real URL
    tags: blogData.tags,
    date: new Date().toISOString(),
  };

  const updated = [newBlog, ...existing];

  // ✅ Push blog HTML
  await fetch(
    `https://api.github.com/repos/${repo}/contents/blogs/${slug}.html`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: `Add blog ${topic}`,
        content: Buffer.from(html).toString("base64"),
      }),
    }
  );

  // ✅ Update JSON
  await fetch(
    `https://api.github.com/repos/${repo}/contents/data/blogs.json`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: "Update blogs",
        content: Buffer.from(JSON.stringify(updated, null, 2)).toString("base64"),
        sha: fileData.sha,
      }),
    }
  );

  return Response.json({ success: true });
}
