
import OpenAI from "openai";

export async function POST(req: Request) {
  const { topic } = await req.json();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-5-chat",
    messages: [
      {
        role: "system",
        content:
          "Generate a modern HTML blog with metadata, headings and styling.",
      },
      {
        role: "user",
        content: topic,
      },
    ],
  });

  return Response.json({
    html: response.choices[0].message.content,
  });
}

