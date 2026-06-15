import OpenAI from "openai";

// ✅ HTML BUILDER
function buildHTML(data: any, imageUrl: string, readTime: number) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />

<title>${data.title}</title>
<meta name="description" content="${data.meta_description}" />

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
    text-shadow: 0 3px 15px rgba(0,0,0,0.8);
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
  ${imageUrl}
  <div class="hero-overlay"></div>

  <div class="hero-content">
    <h1>${data.title}</h1>
    <div class="meta">AI & Beyond Tech · ${readTime} min read</div>
  </div>
</div>

<div class="container">

<p>${data.introduction.replace(/\n\n/g, "</p><p>")}</p>

${data.sections.map((s: any) => `
  <h2>${s.heading}</h2>
  <p>${s.content.replace(/\n\n/g, "</p><p>")}</p>
`).join("")}

<h2>Conclusion</h2>
<p>${data.conclusion.replace(/\n\n/g, "</p><p>")}</p>

<div>
${data.tags.map((t: string) => `<span class="tag">${t}</span>`).join("")}
</div>

</div>

</body>
</html>
`;
}

// ✅ MAIN API
export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const SYSTEM_PROMPT = `
Return ONLY valid JSON:

{
  "title": "",
  "meta_description": "",
  "introduction": "",
  "sections": [{ "heading": "", "content": "" }],
  "conclusion": "",
  "tags": ["AI"]
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

    const cleaned = raw.replace(/```json|```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid JSON");

    const blogData = JSON.parse(match[0]);

    // ✅ IMAGE GENERATION
    let imageUrl = "/logo.png";

    try {
      const imageResponse = await client.images.generate({
        model: "gpt-image-1",
        prompt: `Minimal abstract technology background, no text, futuristic clean design about ${topic}`,
        size: "1536x1024",
      });

      const base64 = imageResponse?.data?.[0]?.b64_json;

      if (base64) {
        
        const filename = topic.toLowerCase().replace(/\s+/g, "-");

        imageUrl = await uploadImageToGitHub(base64, filename);

      }
    } catch (e) {
      console.warn("Image fallback used");
    }

    const words = JSON.stringify(blogData).split(" ").length;
    const readTime = Math.ceil(words / 200);

    const html = buildHTML(blogData, imageUrl, readTime);

    return Response.json({
      html,
      blogData,
      imageUrl
    });

  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

async function uploadImageToGitHub(base64: string, filename: string) {
  const repo = process.env.GITHUB_REPO!;
  const token = process.env.GITHUB_TOKEN!;

  const path = `public/blog-images/${filename}.png`;

  await fetch(
    `https://api.github.com/repos/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: `Upload image ${filename}`,
        content: base64,
      }),
    }
  );

  return `https://raw.githubusercontent.com/${repo}/main/${path}`;
}

