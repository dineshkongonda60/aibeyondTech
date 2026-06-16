export async function POST(req: Request) {
  try {
    const { topic, html, blogData, imageUrl } = await req.json();

    
    const slug = topic
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")   // ✅ remove special chars
      .replace(/\s+/g, "-")       // ✅ spaces → dash
      .replace(/-+/g, "-")        // ✅ remove duplicate dashes
      .trim();


    const repo = process.env.GITHUB_REPO!;
    const token = process.env.GITHUB_TOKEN!;

    // ✅ 1. Get existing blogs.json
    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/data/blogs.json`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const fileData = await res.json();

    const existing = JSON.parse(
      Buffer.from(fileData.content, "base64").toString()
    );

    // ✅ 2. Check if blog already exists
    const existingIndex = existing.findIndex(
      (b: any) => b.slug === slug
    );

    // ✅ 3. Prepare blog object (preserve old date if updating)
    const newBlog = {
      title: blogData.title,
      slug,
      description: blogData.meta_description,
      image: imageUrl,
      tags: blogData.tags,
      date:
        existingIndex !== -1
          ? existing[existingIndex].date   // ✅ keep original date
          : new Date().toISOString(),
    };

    // ✅ 4. UPSERT (update or insert)
    if (existingIndex !== -1) {
      // ✅ Update existing blog
      existing[existingIndex] = newBlog;
    } else {
      // ✅ Insert new blog at top
      existing.unshift(newBlog);
    }

    const updated = existing;

    // ✅ 5. Push blog HTML (overwrite if exists)
    await fetch(
      `https://api.github.com/repos/${repo}/contents/blogs/${slug}.html`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: `Add/Update blog ${topic}`,
          content: Buffer.from(html).toString("base64"),
        }),
      }
    );

    // ✅ 6. Update blogs.json
    await fetch(
      `https://api.github.com/repos/${repo}/contents/data/blogs.json`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: "Update blogs list",
          content: Buffer.from(
            JSON.stringify(updated, null, 2)
          ).toString("base64"),
          sha: fileData.sha, // ✅ required for update
        }),
      }
    );

    return Response.json({ success: true });

  } catch (error: any) {
    console.error("❌ Deploy Error:", error);

    return Response.json(
      { error: error.message || "Deployment failed" },
      { status: 500 }
    );
  }
}