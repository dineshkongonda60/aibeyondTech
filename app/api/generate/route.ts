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
  <html>
  <head>
    <title>${data.title}</title>
    <meta name="description" content="${data.meta_description}">
    <style>
      body {
        font-family: 'Segoe UI';
        line-height: 1.7;
        max-width: 800px;
        margin: auto;
        padding: 30px;
        background: #f9fafb;
      }
      h1 {
        font-size: 32px;
        color: #111;
      }
      h2 {
        margin-top: 30px;
        color: #2c5364;
      }
      p {
        margin: 10px 0;
      }
      .tag {
        display: inline-block;
        margin: 5px;
        padding: 5px 10px;
        background: #2c5364;
        color: white;
        border-radius: 6px;
      }
    </style>
  </head>

  <body>

    <h1>${data.title}</h1>

    <p>${data.introduction.replace(/\n\n/g, "</p><p>")}</p>

    ${data.sections
      .map(
        (s: any) => `
        <h2>${s.heading}</h2>
        <p>${s.content.replace(/\n\n/g, "</p><p>")}</p>
      `
      )
      .join("")}

    <h2>Conclusion</h2>
    <p>${data.conclusion.replace(/\n\n/g, "</p><p>")}</p>

    <div>
      ${data.tags.map((t: string) => `<span class="tag">${t}</span>`).join("")}
    </div>

  </body>
  </html>
  `;
}