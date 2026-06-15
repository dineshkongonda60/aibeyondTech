import OpenAI from "openai";

// ✅ HTML Builder (Premium UI + Image + SEO)
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
    height: 400px;
    overflow: hidden;
  }

  .hero img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .overlay {
    position: absolute;
    bottom: 30px;
    left: 40px;
    color: white;
    text-shadow: 0 3px 10px rgba(0,0,0,0.7);
  }

  .overlay h1 {
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

  @media (max-width: 768px) {
    .overlay h1 {
      font-size: 26px;
    }
    .container {
      padding: 20px;
    }
  }
</style>
</head>

<body>

<div class="hero">
  <img src="${imageUrl}" />
  <div class="overlay">
    <h1>${data.title}</h1>
    <div class="meta">
      AI & Beyond Tech · ${readTime} min read
    </div>
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

// ✅ API Route
export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return Response.json({ error: "Topic required" }, { status: 400 });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // ✅ Agent-style structured prompt
    const SYSTEM_PROMPT = `
You are an expert blog writer.

Return ONLY valid JSON (no markdown, no extra text):

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
- Use professional tone
- Write real content
- Separate paragraphs using \\n\\n
`;

    // ✅ 1. Generate blog JSON
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: topic },
      ],
    });

    const raw = response.choices?.[0]?.message?.content;

    if (!raw) throw new Error("Empty response from OpenAI");

    // ✅ Clean + Extract JSON safely
    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const match = cleaned.match(/\{[\s\S]*\}/);

    if (!match) throw new Error("Invalid JSON format");

    const blogData = JSON.parse(match[0]);

    // ✅ 2. Generate Image
    const imageResponse = await client.images.generate({
      model: "gpt-image-1",
      prompt: `Futuristic minimal AI blog cover image about ${topic}`,
      size: "1792x1024",
    });

   let imageUrl = "";

// ✅ Generate image safely
try {
  const imageResponse = await client.images.generate({
    model: "gpt-image-1",
    prompt: `Futuristic minimal AI blog cover image about ${topic}`,
    size: "1792x1024",
  });

  const imageBase64 = imageResponse?.data?.[0]?.b64_json;

  if (imageBase64) {
    imageUrl = `data:image/png;base64,${imageBase64}`;
  } else {
    console.warn("⚠️ Image generation returned empty");
    imageUrl = "/logo.png"; // ✅ fallback image
  }

} catch (err) {
  console.warn("⚠️ Image generation failed:", err);
  imageUrl = "/logo.png"; // ✅ fallback
}

    // ✅ 3. Calculate reading time
    const words = JSON.stringify(blogData).split(" ").length;
    const readTime = Math.ceil(words / 200);

    // ✅ 4. Build premium HTML
    const html = buildHTML(blogData, imageUrl, readTime);

    return Response.json({ html });

  } catch (error: any) {
    console.error("❌ Generate API Error:", error);

    return Response.json(
      { error: error.message || "Failed to generate blog" },
      { status: 500 }
    );
  }
}
``