"use client";

import { useEffect, useRef } from "react";

/* Orange targeting reticle that replaces the cursor on fine-pointer devices
   (the perception site's signature gesture, restyled for the light theme).
   Lerps toward the pointer, grows over interactive elements, and never
   renders on touch devices. */

export default function Reticle() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("reticle-on");

    let raf = 0;
    let shown = false;
    const target = { x: innerWidth / 2, y: innerHeight / 2 };
    const pos = { x: target.x, y: target.y };

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!shown) {
        shown = true;
        el.classList.add("on");
      }
    };
    const onOver = (e: Event) => {
      const t = e.target as Element | null;
      el.classList.toggle("hover", !!t?.closest?.("a, button"));
    };
    const onLeave = () => el.classList.remove("on");
    const onEnter = () => shown && el.classList.add("on");

    const frame = () => {
      pos.x += (target.x - pos.x) * 0.22;
      pos.y += (target.y - pos.y) * 0.22;
      el.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(frame);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("reticle-on");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  return (
    <div ref={ref} className="reticle" aria-hidden="true">
      <span className="reticleRing" />
      <span className="reticleDot" />
    </div>
  );
}
