"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import blogs from "../data/blogs.json";

export default function Home() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const [suggestions, setSuggestions] = useState<any[]>([]);

useEffect(() => {
  const handler = setTimeout(() => {
    const value = search.toLowerCase();
    setDebouncedSearch(value);

    if (!value) {
      setSuggestions([]);
      return;
    }

    // ✅ Generate suggestions (top 5 matches)
    const matched = blogs
      .filter((b: any) =>
        b.title.toLowerCase().includes(value)
      )
      .slice(0, 5);

    setSuggestions(matched);

  }, 300);

  return () => clearTimeout(handler);
}, [search]);


  // ✅ Extract categories
  const categories = [
    "All",
    ...Array.from(new Set(blogs.flatMap((b: any) => b.tags || []))),
  ];

  // ✅ Highlight function
  const highlightText = (text: string) => {
    if (!debouncedSearch) return text;

    const regex = new RegExp(`(${debouncedSearch})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  };

  // ✅ Filter logic (using debouncedSearch ✅ FIXED)
  const filtered = blogs.filter((b: any) => {
    const matchesSearch =
      b.title.toLowerCase().includes(debouncedSearch) ||
      b.tags.join(" ").toLowerCase().includes(debouncedSearch);

    const matchesCategory =
      category === "All" || b.tags?.includes(category);

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* ✅ NAVBAR */}
      <div className="navbar">
        <h3>AI & Beyond Tech</h3>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link href="/">Home</Link>
          <a
            href="https://dinesh-portfolio-sepia.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            About
          </a>
        </div>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>
      </div>

      {/* ✅ HEADER */}
      <div className="header">
        <h1>AI & Beyond Tech</h1>
        <p>Exploring AI, Automation & The Future of Technology</p>
      </div>

      {/* ✅ SEARCH */}
      <div className="search-container">
        <input
          className="search"
          type="text"
          placeholder="Search blogs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* ✅ SEARCH SUGGESTIONS */}
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((s: any) => (
            <Link key={s.slug} href={`/blog/${s.slug}`}>
              <div className="suggestion-item"
              onClick={() => setSuggestions([])}>
                {s.title}
              </div>
            </Link>
          ))}
        </div>
      )}

      </div>
      
      


      {/* ✅ CATEGORY FILTER */}
      <div className="filters">
        {categories.map((cat) => {
          const count =
            cat === "All"
              ? blogs.length
              : blogs.filter((b: any) =>
                  b.tags?.includes(cat)
                ).length;

          return (
            <button
              key={cat}
              className={category === cat ? "active" : ""}
              onClick={() => setCategory(cat)}
            >
              {cat} <span className="count">({count})</span>
            </button>
          );
        })}
      </div>

      {/* ✅ BLOG GRID */}
      <div className="container">
        <div className="grid">
          {filtered.length === 0 ? (
            <p style={{ textAlign: "center", width: "100%" }}>
              No results found for "{debouncedSearch}" 🚀
            </p>
          ) : (
            filtered.map((b: any) => (
              <div key={b.slug} className="card">

                {/* ✅ Thumbnail */}
                <img
                  src={b.image || "/logo.png"}
                  alt={b.title}
                  className="card-img"
                  onError={(e) => {
                    e.currentTarget.src = "/logo.png";
                  }}
                />

                <div className="card-body">

                  {/* ✅ Highlighted Title */}
                  <h3
                    dangerouslySetInnerHTML={{
                      __html: highlightText(b.title),
                    }}
                  />

                  {/* ✅ Highlighted Description */}
                  <p
                    dangerouslySetInnerHTML={{
                      __html: highlightText(b.description),
                    }}
                  />

                  <Link href={`/blog/${b.slug}.html`}>
                    <button>Read More →</button>
                  </Link>

                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}