import OpenAI from "openai";

/* ===========================
   ✅ HTML BUILDER
=========================== */
function buildHTML(
  data: any,
  slug: string,
  imageUrl: string,
  readTime: number,
  imageCredit: any
) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />

<title>${data.title}</title>
<meta name="description" content="${data.meta_description}" />

<!-- ✅ Canonical FIX -->
<link rel="canonical" href="https://aibeyond-tech.vercel.app/blog/${slug}" />

<!-- ✅ AdSense script (load once) -->
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9814863623957523"
  crossorigin="anonymous">
</script>

<style>
  body {
    margin: 0;
    font-family: 'Inter', sans-serif;
    background: #f4f6f9;
  }

  .hero {
    position: relative;
    height: 420px;
    overflow: hidden;
  }

  .hero img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(0,0,0,0.75),
      rgba(0,0,0,0.3),
      rgba(0,0,0,0.1)
    );
  }

  .hero-content {
    position: absolute;
    bottom: 30px;
    left: 40px;
    right: 40px;
    color: white;
  }

  .hero-content h1 {
    font-size: 38px;
    margin: 0;
  }

  .meta {
    font-size: 14px;
    opacity: 0.9;
  }

  .container {
    max-width: 850px;
    margin: -40px auto 40px;
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  }

  h2 {
    color: #2c5364;
    margin-top: 30px;
  }

  p {
    line-height: 1.8;
    font-size: 17px;
    color: #333;
  }

  .tag {
    display: inline-block;
    padding: 6px 12px;
    margin: 5px;
    border-radius: 20px;
    background: #2c5364;
    color: white;
    font-size: 13px;
  }
</style>

</head>

<body>

<div class="hero">
  <img src="${imageUrl}" alt="${data.title}" loading="lazy" />
  <div class="hero-overlay"></div>

  <div class="hero-content">
    <h1>${data.title}</h1>
    <div class="meta">AI & Beyond Tech · ${readTime} min read</div>

    ${
      imageCredit?.name
        ? `
    <div style="text-align:right; font-size:12px; color:#ddd; margin-top:5px;">
      © Photo by 
      <a href="${imageCredit.url}" target="_blank">${imageCredit.name}</a>
    </div>`
        : ""
    }
  </div>
</div>

<div class="container">

<p>${data.introduction.replace(/\n\n/g, "</p><p>")}</p>

${data.sections
  .map(
    (s: any, index: number) => `
  <h2>${s.heading}</h2>
  <p>${s.content.replace(/\n\n/g, "</p><p>")}</p>

  ${
    index === 1
      ? `
    <!-- ✅ Ad placement -->
    <div style="margin:30px 0;">
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-9814863623957523"
           data-ad-slot="2586673450"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  `
      : ""
  }
`
  )
  .join("")}

<h2>Conclusion</h2>
<p>${data.conclusion.replace(/\n\n/g, "</p><p>")}</p>

<div>
${data.tags
  .map((t: string) => `<span class="tag">${t}</span>`)
  .join("")}
</div>

</div>

<!-- ✅ FIXED AdSense INIT -->
<script>
window.addEventListener("load", function () {
  const ads = document.querySelectorAll(".adsbygoogle");
  ads.forEach(() => {
    try {
      (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.log("Adsense error:", e);
    }
  });
});
</script>

</body>
</html>
`;
}

/* ===========================
   ✅ MAIN API
=========================== */
export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    /* ✅ SLUG FIX */
    const slug = topic
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "")
      .trim();

    /* ✅ ORIGINAL PROMPT (UNCHANGED) */
    const SYSTEM_PROMPT = `
Generate a detailed, high-quality blog article.

Rules:
- Minimum 1200–1500 words
- Include 5–6 sections
- Each section must have detailed explanation (150–200 words)
- Add real-world examples
- Use simple language
- SEO optimized
- Generate 3–5 relevant tags based on the topic
- Tags should be short (1–2 words max)
- Tags should represent categories like AI, Banking, Automation, etc.
- Always include "AI" as one of the tags if relevant
- STRICT JSON OUTPUT only
- No raw newlines or invalid characters inside JSON

Return ONLY valid JSON:

{
  "title": "",
  "meta_description": "",
  "introduction": "",
  "sections": [{ "heading": "", "content": "" }],
  "conclusion": "",
  "tags": []
}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: topic },
      ],
    });

    const raw = response.choices?.[0]?.message?.content;
    if (!raw) throw new Error("Empty response");

    let cleaned = raw.replace(/```json|```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid JSON");

    const blogData = JSON.parse(match[0]);

    /* ✅ IMAGE FIX */
    let imageUrl, author, authorUrl;

    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${topic}&per_page=1`,
        {
          headers: {
            Authorization: process.env.PEXELS_API_KEY!,
          },
        }
      );

      const data = await res.json();
      imageUrl = data.photos[0]?.src?.landscape;
      author = data.photos[0]?.photographer;
      authorUrl = data.photos[0]?.photographer_url;
    } catch {
      imageUrl = `https://picsum.photos/seed/${encodeURIComponent(topic)}/800/400`;
    }

    const words = (
      blogData.introduction +
      blogData.sections.map((s: any) => s.content).join(" ") +
      blogData.conclusion
    ).split(" ").length;

    const readTime = Math.ceil(words / 200);

    const html = buildHTML(
      blogData,
      slug,
      imageUrl,
      readTime,
      { name: author, url: authorUrl }
    );

    return Response.json({
      html,
      blogData,
      slug,
      imageUrl,
    });

  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}