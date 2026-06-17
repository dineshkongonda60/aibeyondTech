export async function POST(req: Request) {
  try {
    const { topic, html, blogData, imageUrl } = await req.json();

    /* =========================
       ✅ 1. SLUG GENERATION
    ========================== */

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
       ✅ 2. LOAD blogs.json
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
       ✅ 3. UPSERT BLOG META
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
       ✅ 4. HANDLE HTML FILE
    ========================== */

    const filePath = `blogs/${slug}`;

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
       ✅ 5. UPLOAD / UPDATE HTML
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
          sha: existingHtmlFile?.sha,
        }),
      }
    );

    /* =========================
       ✅ 6. UPDATE blogs.json
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

    /* =========================
       ✅ 7. WAIT FOR VERCEL DEPLOY
    ========================== */

    async function waitForPage(url: string, retries = 6) {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(url);

          if (res.ok) return true;
        } catch {}

        await new Promise((r) => setTimeout(r, 15000));
      }

      return false;
    }

    const blogUrl = `https://aibeyond-tech.vercel.app/blog/${slug}`;

    console.log("Waiting for deployment...");
    await waitForPage(blogUrl);
    console.log("Page is live ✅");

    /* =========================
       ✅ 8. TRIGGER MAKE WEBHOOK
    ========================== */

    console.log("Triggering Make webhook...");

    try {
      const webhookRes = await fetch(
        "https://hook.eu2.make.com/jcxh3y4qqnq27k1g1ja8j8wokbu161dx",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: blogData.title,
            description: blogData.meta_description,
            url: blogUrl,
            tags: blogData.tags,
            image: imageUrl,
          }),
        }
      );

      console.log("Webhook status:", webhookRes.status);
    } catch (err) {
      console.error("Webhook trigger failed:", err);
    }

    /* =========================
       ✅ FINAL RESPONSE
    ========================== */

    return Response.json({ success: true });

  } catch (error: any) {
    console.error("❌ Deploy Error:", error);

    return Response.json(
      { error: error.message || "Deployment failed" },
      { status: 500 }
    );
  }
}