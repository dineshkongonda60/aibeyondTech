"use client";

import { useState } from "react";
import Link from "next/link";
import blogs from "../data/blogs.json";

export default function Home() {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const filtered = blogs.filter((b: any) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.tags.join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* ✅ NAVBAR */}
      <div className="navbar">
        <h3>AI & Beyond Tech</h3>

        {/* ✅ Desktop + Mobile Menu */}
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

        {/* ✅ Hamburger Button */}
        <div
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </div>
      </div>

      {/* ✅ HEADER */}
      <div className="header">
        <h1>AI & Beyond Tech</h1>
        <p>Exploring AI, Automation & The Future of Technology</p>
      </div>

      {/* ✅ SEARCH BAR */}
      <div className="search-container">
        <input
          className="search"
          type="text"
          placeholder="Search blogs..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ✅ BLOG GRID */}
      <div className="container">
        <div className="grid">
          {filtered.length === 0 ? (
            <p style={{ textAlign: "center", width: "100%" }}>
              No blogs available yet. Generate one from the Admin page 🚀
            </p>
          ) : (
            filtered.map((b: any) => (
              <div key={b.slug} className="card">
                
              {/* ✅ Thumbnail */}
                
              <img
                src={b.image || "/logo.png"}   // ✅ dynamic image
                alt={b.title}
                className="card-img"
                onError={(e) => {
                  e.currentTarget.src = "/logo.png";  // ✅ fallback
                }}
              />


                <div className="card-body">
                <h3>{b.title}</h3>
                <p>{b.description}</p>
                <Link href={`/blog/${b.slug}`}>
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
