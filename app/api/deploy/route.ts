export async function POST(req: Request) {
  const { topic, html } = await req.json();

  const slug = topic.toLowerCase().replace(/\s+/g, "-");

  const content = Buffer.from(html).toString("base64");

  await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/blogs/${slug}.html`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({
        message: `Add blog: ${topic}`,
        content,
      }),
    }
  );

  return Response.json({ success: true });
}