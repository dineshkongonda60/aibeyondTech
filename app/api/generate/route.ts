import OpenAI from "openai";

export async function POST(req: Request) {
  const { topic } = await req.json();

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await client.chat.completions.create({
    model: "gpt-5-chat",
    messages: [
      {
        role: "system",
        content: "Generate a modern SEO-friendly HTML blog with styling and headings"
      },
      { role: "user", content: topic }
    ]
  });

  return Response.json({
    html: response.choices[0].message.content,
  });
}
