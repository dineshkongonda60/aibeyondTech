import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";

type Props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: any) {
  return {
    title: params.slug.replace(/-/g, " "),
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