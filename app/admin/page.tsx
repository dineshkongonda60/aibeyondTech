"use client";

import { useState } from "react";

export default function Admin() {
  const [topic, setTopic] = useState("");
  const [html, setHtml] = useState("");
  
const [blogData, setBlogData] = useState<any>(null);
const [imageUrl, setImageUrl] = useState("");


const generate = async () => {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic }),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    // ✅ Store everything
    setHtml(data.html);
    setBlogData(data.blogData);
    setImageUrl(data.imageUrl);

  } catch (err) {
    console.error(err);
    alert("Generate failed");
  }
};

const deploy = async () => {
  await fetch("/api/deploy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic,
      html,
      blogData
    }),
  });

  alert("✅ Blog Deployed!");
};


  return (
    <div style={{ padding: "30px" }}>
      <h2>AI Blog Agent</h2>

      <input onChange={(e) => setTopic(e.target.value)} />

      <br /><br />

      <button onClick={generate}>Generate</button>
      <button onClick={deploy}>Deploy</button>

      <hr />

      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
