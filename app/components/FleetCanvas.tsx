"use client";

import { useEffect, useRef } from "react";

/* A quiet, light-theme rendition of the perception site's fleet scene:
   merchants (left) → drone pad / AV dock hubs → homes (right), with orders
   visibly handing off robot → drone/AV → robot. Drawn in ink and orange on
   paper at low contrast so the hero copy stays perfectly legible; the whole
   scene drifts gently with the cursor. Pauses off-screen and honours
   prefers-reduced-motion (renders one static frame). */

const INK = "18, 18, 18";
const ORANGE = "255, 75, 0";

type P = { x: number; y: number };

export default function FleetCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    let visible = true;

    // pointer parallax (normalised, lerped)
    const target = { x: 0.5, y: 0.5 };
    const pointer = { x: 0.5, y: 0.5 };
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX / window.innerWidth;
      target.y = e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // ---- scene ------------------------------------------------------------
    type Node = P & { kind: "merchant" | "home" | "pad" | "dock" };
    let merchants: Node[] = [];
    let homes: Node[] = [];
    let padL: Node, padR: Node, dockL: Node, dockR: Node;

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      merchants = [0.34, 0.55, 0.76].map((fy) => ({ x: 0.055 * w, y: fy * h, kind: "merchant" }));
      homes = [0.3, 0.48, 0.66, 0.82].map((fy) => ({ x: 0.945 * w, y: fy * h, kind: "home" }));
      padL = { x: 0.21 * w, y: 0.26 * h, kind: "pad" };
      padR = { x: 0.79 * w, y: 0.24 * h, kind: "pad" };
      dockL = { x: 0.2 * w, y: 0.8 * h, kind: "dock" };
      dockR = { x: 0.8 * w, y: 0.78 * h, kind: "dock" };
    };
    layout();
    window.addEventListener("resize", layout);

    // ---- orders -----------------------------------------------------------
    // Each order: merchant --robot--> hub, hub --drone/AV--> hub, hub --robot--> home
    type Order = {
      via: "air" | "road";
      from: Node;
      to: Node;
      t: number; // 0..3 (one unit per leg)
      speed: number;
    };
    let orders: Order[] = [];
    let spawnClock = 0;

    const spawn = () => {
      const via: "air" | "road" = Math.random() < 0.5 ? "air" : "road";
      orders.push({
        via,
        from: merchants[Math.floor(Math.random() * merchants.length)],
        to: homes[Math.floor(Math.random() * homes.length)],
        t: 0,
        speed: 0.0034 + Math.random() * 0.0016,
      });
    };

    const legPoint = (o: Order): P => {
      const hubA = o.via === "air" ? padL : dockL;
      const hubB = o.via === "air" ? padR : dockR;
      const t = o.t;
      const ease = (u: number) => u * u * (3 - 2 * u);
      if (t < 1) {
        const u = ease(t);
        return { x: o.from.x + (hubA.x - o.from.x) * u, y: o.from.y + (hubA.y - o.from.y) * u };
      }
      if (t < 2) {
        const u = ease(t - 1);
        if (o.via === "air") {
          // drone arc between pads
          const mx = (hubA.x + hubB.x) / 2;
          const my = Math.min(hubA.y, hubB.y) - 0.16 * h;
          const a = 1 - u;
          return {
            x: a * a * hubA.x + 2 * a * u * mx + u * u * hubB.x,
            y: a * a * hubA.y + 2 * a * u * my + u * u * hubB.y,
          };
        }
        return { x: hubA.x + (hubB.x - hubA.x) * u, y: hubA.y + (hubB.y - hubA.y) * u };
      }
      const u = ease(t - 2);
      return { x: hubB.x + (o.to.x - hubB.x) * u, y: hubB.y + (o.to.y - hubB.y) * u };
    };

    // ---- drawing ----------------------------------------------------------
    const line = (a: P, b: P) => {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    };

    const drawStatic = () => {
      // paths
      ctx.strokeStyle = `rgba(${INK}, 0.1)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      merchants.forEach((m) => {
        line(m, padL);
        line(m, dockL);
      });
      homes.forEach((hm) => {
        line(padR, hm);
        line(dockR, hm);
      });
      // road between docks
      line(dockL, dockR);
      // drone corridor between pads
      ctx.beginPath();
      ctx.moveTo(padL.x, padL.y);
      ctx.quadraticCurveTo((padL.x + padR.x) / 2, Math.min(padL.y, padR.y) - 0.16 * h, padR.x, padR.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // nodes
      ctx.strokeStyle = `rgba(${INK}, 0.32)`;
      ctx.lineWidth = 1.2;
      ctx.font = `600 9px ui-monospace, Menlo, monospace`;
      ctx.fillStyle = `rgba(${INK}, 0.34)`;

      merchants.forEach((m) => {
        ctx.strokeRect(m.x - 9, m.y - 7, 18, 14);
        line({ x: m.x - 9, y: m.y - 2 }, { x: m.x + 9, y: m.y - 2 });
      });
      homes.forEach((hm) => {
        ctx.strokeRect(hm.x - 8, hm.y - 5, 16, 12);
        ctx.beginPath();
        ctx.moveTo(hm.x - 10, hm.y - 5);
        ctx.lineTo(hm.x, hm.y - 13);
        ctx.lineTo(hm.x + 10, hm.y - 5);
        ctx.stroke();
      });
      [padL, padR].forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillText("H", p.x - 3, p.y + 3);
      });
      [dockL, dockR].forEach((d) => {
        ctx.strokeRect(d.x - 10, d.y - 6, 20, 12);
        ctx.beginPath();
        ctx.moveTo(d.x - 3, d.y - 2);
        ctx.lineTo(d.x + 2, d.y);
        ctx.lineTo(d.x - 3, d.y + 2);
        ctx.stroke();
      });

      // zone labels
      ctx.fillStyle = `rgba(${INK}, 0.28)`;
      ctx.fillText("FIRST 100 YDS", 0.045 * w, 0.94 * h);
      ctx.fillText("MIDDLE MILE", 0.46 * w, 0.94 * h);
      ctx.fillText("LAST 100 YDS", 0.87 * w, 0.94 * h);
    };

    const drawOrders = () => {
      orders.forEach((o) => {
        const p = legPoint(o);
        const leg = Math.floor(o.t);
        ctx.fillStyle = `rgba(${ORANGE}, 0.85)`;
        ctx.strokeStyle = `rgba(${ORANGE}, 0.85)`;
        ctx.lineWidth = 1.4;
        if (leg === 1 && o.via === "air") {
          // drone triangle
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - 5);
          ctx.lineTo(p.x - 5, p.y + 4);
          ctx.lineTo(p.x + 5, p.y + 4);
          ctx.closePath();
          ctx.stroke();
        } else if (leg === 1) {
          // AV
          ctx.strokeRect(p.x - 6, p.y - 4, 12, 8);
        } else {
          // our robot carrying the ends — filled square with glow
          ctx.shadowColor = `rgba(${ORANGE}, 0.7)`;
          ctx.shadowBlur = 8;
          ctx.fillRect(p.x - 3.5, p.y - 3.5, 7, 7);
          ctx.shadowBlur = 0;
        }
        // package dot
        ctx.beginPath();
        ctx.arc(p.x, p.y - 9, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const frame = () => {
      pointer.x += (target.x - pointer.x) * 0.06;
      pointer.y += (target.y - pointer.y) * 0.06;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate((pointer.x - 0.5) * 16, (pointer.y - 0.5) * 10);
      drawStatic();
      drawOrders();
      ctx.restore();

      spawnClock -= 1;
      if (spawnClock <= 0 && orders.length < 6) {
        spawn();
        spawnClock = 130 + Math.random() * 110;
      }
      orders.forEach((o) => (o.t += o.speed * (Math.floor(o.t) === 1 ? 1.7 : 1)));
      orders = orders.filter((o) => o.t < 3);

      if (running && visible) raf = requestAnimationFrame(frame);
    };

    if (reduced) {
      // static single frame with a few frozen orders for context
      for (let i = 0; i < 3; i++) {
        spawn();
        orders[i].t = 0.5 + i;
      }
      ctx.clearRect(0, 0, w, h);
      drawStatic();
      drawOrders();
    } else {
      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible && running) {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(frame);
          }
        },
        { threshold: 0 }
      );
      io.observe(canvas);
      raf = requestAnimationFrame(frame);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", layout);
    };
  }, []);

  return <canvas ref={ref} className="fleetCanvas" aria-hidden="true" />;
}
