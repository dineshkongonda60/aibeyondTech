export async function POST(req: Request) {
  try {
    const { topic, html, blogData, imageUrl } = await req.json();
    if(!topic) {
      return Response.json({ error: "Topic is required" });
    }
    if(!html) {
      return Response.json({ error: "HTML content is required" });
    }
    if(!blogData) {
      return Response.json({ error: "Blog data is required" });
    }
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

    if(!repo){
      return Response.json({ error: "GitHub repository is not configured" });
    }
    if(!token){
      return Response.json({ error: "GitHub token is not configured" });
    }

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

    console.log("GitHub Response Status:", res.status);

  const fileData = await res.json();

  console.log(
    "blogs.json response:",
    JSON.stringify(fileData, null, 2)
  );

  if (!res.ok) {
    throw new Error(
      `GitHub API failed: ${JSON.stringify(fileData)}`
    );
  }

  if (!fileData.content) {
    throw new Error(
      `blogs.json content missing: ${JSON.stringify(fileData)}`
    );
  }

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

    const blogUrl = `https://aibeyond-tech.vercel.app/blog/${slug}.html`;

    console.log("Waiting for deployment...");
    await waitForPage(blogUrl);
    console.log("Page is live ✅");
    const newblogUrl = `https://aibeyond-tech.vercel.app/blog/${slug}`;
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
            url: newblogUrl,
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
   ✅ Updating Sitemap on Google (Improved)
========================== */

try {
  await fetch(
    "https://www.google.com/ping?sitemap=https://aibeyond-tech.vercel.app/sitemap.xml"
  );
  console.log("Google sitemap pinged ✅");
} catch (err) {
  console.error("Google ping failed:", err);
}


/* =========================
   ✅ Updating Sitemap on Bing (IndexNow - Enhanced)
========================== */

try {
  const indexNowKey = "61f44f88d4a447808e81571ce94d90b3";

  await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      host: "aibeyond-tech.vercel.app",
      key: indexNowKey,
      urlList: [
        // ✅ Main blog page
        `https://aibeyond-tech.vercel.app/blog/${slug}`,

        // ✅ Blog listing page
        "https://aibeyond-tech.vercel.app/blog",

        // ✅ Homepage (helps discovery boost)
        "https://aibeyond-tech.vercel.app/",

        // ✅ Sitemap (forces re-check)
        "https://aibeyond-tech.vercel.app/sitemap.xml"
      ],
    }),
  });

  console.log("Bing IndexNow submitted ✅");
} catch (err) {
  console.error("Bing IndexNow failed:", err);
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