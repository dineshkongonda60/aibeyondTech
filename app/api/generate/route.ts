import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const SYSTEM_PROMPT = `
You are an expert blog writer and SEO specialist.

Return ONLY valid JSON with this structure:

{
  "title": "string",
  "meta_description": "string",
  "introduction": "string",
  "sections": [
    {
      "heading": "string",
      "content": "string"
    }
  ],
  "conclusion": "string",
  "tags": ["AI", "Automation"]
}

Rules:
- Make it engaging and professional
- Write real content (not placeholders)
- Use paragraphs separated by \\n\\n
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: topic },
      ],
    });

    
const raw = response.choices?.[0]?.message?.content;

if (!raw) {
  throw new Error("OpenAI returned empty response");
}

// 🧹 Clean response
const cleaned = raw
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

// 🔍 Extract JSON safely
const match = cleaned.match(/\{[\s\S]*\}/);

if (!match) {
  throw new Error("Invalid JSON format from OpenAI");
}

const json = JSON.parse(match[0]);



    // ✅ Convert JSON → HTML
    const html = buildHTML(json);

    return Response.json({ html });

  } catch (error: any) {
    console.error(error);
    return Response.json({ error: "Failed to generate blog" }, { status: 500 });
  }
}

// ✅ HTML Builder (Agent Style)
function buildHTML(data: any) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <title>${data.title}</title>
  <meta name="description" content="${data.meta_description}" />

  <!-- ✅ Open Graph (LinkedIn/Twitter) -->
  <meta property="og:title" content="${data.title}" />
  <meta property="og:description" content="${data.meta_description}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://aibeyond-tech.vercel.app" />
  <meta property="og:image" content="/logo.png" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${data.title}" />
  <meta name="twitter:description" content="${data.meta_description}" />

  <!-- ✅ Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

  <style>
    body {
      margin: 0;
      font-family: 'Inter', sans-serif;
      background: #f4f6f9;
    }

    /* ✅ HERO */
    .hero {
      background: linear-gradient(120deg, #1f4037, #99f2c8);
      color: white;
      padding: 60px 20px;
      text-align: center;
    }

    .hero h1 {
      font-size: 42px;
      margin-bottom: 10px;
    }

    .meta {
      opacity: 0.9;
      font-size: 14px;
    }

    /* ✅ CONTENT */
    .container {
      max-width: 850px;
      margin: -40px auto 40px;
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    }

    h2 {
      margin-top: 30px;
      color: #2c5364;
    }

    p {
      line-height: 1.8;
      margin: 12px 0;
      color: #333;
      font-size: 17px;
    }

    /* ✅ TAGS */
    .tags {
      margin-top: 30px;
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

    /* ✅ SHARE */
    .share {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
    }

    .share a {
      margin: 0 10px;
      text-decoration: none;
      color: #2c5364;
      font-weight: 600;
    }

    /* ✅ MOBILE */
    @media (max-width: 768px) {
      .hero h1 {
        font-size: 28px;
      }

      .container {
        padding: 20px;
      }
    }
  </style>
</head>

<body>

  <!-- ✅ HERO -->
  <div class="hero">
    <h1>${data.title}</h1>
    <div class="meta">
      By AI & Beyond Tech · ${new Date().toDateString()}
    </div>
  </div>

  <!-- ✅ CONTENT -->
  <div class="container">

    <p>${data.introduction.replace(/\n\n/g, "</p><p>")}</p>

    ${data.sections.map((s: any) => `
      <h2>${s.heading}</h2>
      <p>${s.content.replace(/\n\n/g, "</p><p>")}</p>
    `).join("")}

    <h2>Conclusion</h2>
    <p>${data.conclusion.replace(/\n\n/g, "</p><p>")}</p>

    <!-- ✅ TAGS -->
    <div class="tags">
      ${data.tags.map((t: string) => `<span class="tag">${t}</span>`).join("")}
    </div>

    <!-- ✅ SHARE -->
    <div class="share">
      <p>Share this article:</p>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=https://aibeyond-tech.vercel.app">LinkedIn</a>
      <a href="https://twitter.com/intent/tweet?url=https://aibeyond-tech.vercel.app">Twitter</a>
    </div>

  </div>

</body>
</html>
`;
}