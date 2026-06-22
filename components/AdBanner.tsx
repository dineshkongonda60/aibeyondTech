"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function AdBanner() {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.log("Adsense error", err);
    }
  }, []);

  return (
    <>
      {/* ✅ AdSense global script (only needed once ideally, but safe here) */}
      <Script
        async
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9814863623957523"
        crossOrigin="anonymous"
      />

      {/* ✅ Ad unit */}
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-9814863623957523"
        data-ad-slot="2586673450"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </>
  );
}
