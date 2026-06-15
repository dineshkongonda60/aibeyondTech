import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return Response.json({ error: "Topic required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key missing");
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional blog writer. Generate a clean, modern HTML blog with headings, paragraphs and minimal styling.",
        },
        {
          role: "user",
          content: `Write a blog on: ${topic}`,
        },
      ],
    });

    const html = response.choices?.[0]?.message?.content;

    if (!html) {
      throw new Error("No response from OpenAI");
    }

    return Response.json({ html });

  } catch (error: any) {
    console.error("❌ Generate API Error:", error);

    return Response.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}