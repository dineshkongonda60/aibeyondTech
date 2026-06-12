export async function POST(req: Request) {
  const { topic, html } = await req.json();

  const slug = topic
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-");

  const blogFile = `blogs/${slug}.html`;

  // ✅ Fetch existing blogs.json
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;

  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/data/blogs.json`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const fileData = await res.json();
  const existingContent = JSON.parse(
    Buffer.from(fileData.content, "base64").toString()
  );

  // ✅ Add new blog entry
  const newBlog = {
    title: topic,
    slug,
    description: `Blog about ${topic}`,
    tags: topic.split(" "),
    date: new Date().toISOString(),
  };

  const updated = [newBlog, ...existingContent];

  const updatedBase64 = Buffer.from(
    JSON.stringify(updated, null, 2)
  ).toString("base64");

  // ✅ Push blog HTML
  await fetch(
    `https://api.github.com/repos/${repo}/contents/${blogFile}`,
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

  // ✅ Update blogs.json
  await fetch(
    `https://api.github.com/repos/${repo}/contents/data/blogs.json`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: "Update blogs list",
        content: updatedBase64,
        sha: fileData.sha,
      }),
    }
  );

  return Response.json({ success: true });
}
