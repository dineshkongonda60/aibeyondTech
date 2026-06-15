import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";

type Props = {
  params: {
    slug: string;
  };
};


export async function generateMetadata({ params }: any) {
  const blogs = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data/blogs.json"), "utf-8")
  );

  const blog = blogs.find((b: any) => b.slug === params.slug);

  if (!blog) return {};

  const url = `https://aibeyond-tech.vercel.app/blog/${blog.slug}`;

  return {
    title: blog.title,
    description: blog.description,

    openGraph: {
      title: blog.title,
      description: blog.description,
      url,
      siteName: "AI & Beyond Tech",
      images: [
        {
          url: blog.image,
          width: 1200,
          height: 630,
        },
      ],
      type: "article",
    },

    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.description,
      images: ["https://aibeyond-tech.vercel.app/logo.png"],
    },
  };
}



export default function BlogPage({ params }: Props) {
  const { slug } = params;

  try {
    const filePath = path.join(process.cwd(), "blogs", `${slug}.html`);

    // ✅ Check if file exists
    if (!fs.existsSync(filePath)) {
      return notFound();
    }

    const html = fs.readFileSync(filePath, "utf-8");

    const url = `https://aibeyond-tech.vercel.app/blog/${slug}`;

    return (
      <div style={{ padding: "20px" }}>
        {/* ✅ Blog Content */}
        <div dangerouslySetInnerHTML={{ __html: html }} />

        {/* ✅ Share Buttons */}
        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <a
            href={`https://www.linkedin.com/shareArticle?url=${url}`}
            target="_blank"
          >
            Share on LinkedIn
          </a>
          {" | "}
          <a
            href={`https://twitter.com/intent/tweet?url=${url}`}
            target="_blank"
          >
            Share on Twitter
          </a>
        </div>
      </div>
    );
  } catch (err) {
    console.error("Error loading blog:", err);
    return notFound();
  }
}