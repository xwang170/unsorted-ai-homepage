"use client";

import { useEffect } from "react";

/* Blur + rise reveals for every [data-reveal] element, ported from the
   perception site. The hidden initial state is gated behind the .reveals-on
   class (added here at mount) so content stays visible without JS. */

export default function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("reveals-on");
    const els = Array.from(document.querySelectorAll("[data-reveal]"));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      document.documentElement.classList.remove("reveals-on");
    };
  }, []);

  return null;
}
