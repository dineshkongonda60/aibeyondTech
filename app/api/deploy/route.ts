export async function POST(req: Request) {
  try {
    const { topic, html, blogData, imageUrl } = await req.json();

    const slug = topic
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "")
      .trim();

    const repo = process.env.GITHUB_REPO!;
    const token = process.env.GITHUB_TOKEN!;

    /* =========================
       ✅ 1. LOAD blogs.json
    ========================== */

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

    /* =========================
       ✅ 2. UPSERT BLOG META
    ========================== */

    const existingIndex = existing.findIndex(
      (b: any) => b.slug === slug
    );

    const newBlog = {
      title: blogData.title,
      slug,
      description: blogData.meta_description,
      image: imageUrl,
      tags: blogData.tags,
      date:
        existingIndex !== -1
          ? existing[existingIndex].date
          : new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      existing[existingIndex] = newBlog;
    } else {
      existing.unshift(newBlog);
    }

    const updated = existing;

    /* =========================
       ✅ 3. HANDLE HTML FILE (FIX)
    ========================== */

    const filePath = `blogs/${slug}.html`;

    let existingHtmlFile = null;

    try {
      const htmlRes = await fetch(
        `https://api.github.com/repos/${repo}/contents/${filePath}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (htmlRes.ok) {
        existingHtmlFile = await htmlRes.json();
      }
    } catch {
      console.log("No existing HTML file found");
    }

    /* =========================
       ✅ 4. CREATE / UPDATE HTML
    ========================== */

    await fetch(
      `https://api.github.com/repos/${repo}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: `Add/Update blog ${topic}`,
          content: Buffer.from(html).toString("base64"),
          sha: existingHtmlFile?.sha, // ✅ CRITICAL FIX
        }),
      }
    );

    /* =========================
       ✅ 5. UPDATE blogs.json
    ========================== */

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
          sha: fileData.sha,
        }),
      }
    );

    return Response.json({ success: true });


    /* =========================
   ✅ 6. TRIGGER MAKE WEBHOOK
========================= */

try {
  await fetch("https://hook.eu2.make.com/jcxh3y4qqnq27k1g1ja8j8wokbu161dx", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: blogData.title,
      description: blogData.meta_description,
      url: `https://aibeyond-tech.vercel.app/blogs/${slug}`,
      tags: blogData.tags,
      image: imageUrl,
    }),
  });
} catch (err) {
  console.warn("Webhook trigger failed");
}

  } catch (error: any) {
    console.error("❌ Deploy Error:", error);

    return Response.json(
      { error: error.message || "Deployment failed" },
      { status: 500 }
    );
  }
}
