"use client";

import { useState } from "react";

export default function Admin() {
  const [topic, setTopic] = useState("");
  const [html, setHtml] = useState("");

  const generate = async () => {
    const res = await fetch("/api/generate", {
      method: "POST",
      body: JSON.stringify({ topic }),
    });
    const data = await res.json();
    setHtml(data.html);
  };

  const deploy = async () => {
    await fetch("/api/deploy", {
      method: "POST",
      body: JSON.stringify({ topic, html }),
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
