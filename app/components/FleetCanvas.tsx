"use client";

import { useEffect, useRef } from "react";

/* Light-theme fleet scene behind the hero.

   Geography mirrors the business: merchants (stores, restaurants, dark
   stores, groceries, pharmacies) cluster TIGHTLY around the left hubs —
   a drone pad and an AV loading zone — and homes (apartments, offices,
   walk-ups, a campus) cluster tightly around the right hubs. The first and
   last 100 yards are short; the middle mile between hubs is long. Robots
   (orange squares) shuttle the short ends, drones (triangles) arc the
   corridor, AVs (rounded rects) run the road — continuously, plus discrete
   orders handing off robot → drone/AV → robot. */

const INK = "18, 18, 18";
const ORANGE = "255, 75, 0";

type P = { x: number; y: number };
type NodeKind =
  | "store"
  | "restaurant"
  | "darkstore"
  | "grocery"
  | "pharmacy"
  | "home"
  | "apartments"
  | "office"
  | "walkup"
  | "campus"
  | "pad"
  | "dock";
type SceneNode = P & { kind: NodeKind; label: string };

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

    const target = { x: 0.5, y: 0.5 };
    const pointer = { x: 0.5, y: 0.5 };
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX / window.innerWidth;
      target.y = e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // ---- scene ------------------------------------------------------------
    let merchants: SceneNode[] = [];
    let ends: SceneNode[] = [];
    let padL: SceneNode, padR: SceneNode, dockL: SceneNode, dockR: SceneNode;

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // left cluster: merchants packed around the left hubs (short first leg)
      merchants = [
        { fx: 0.045, fy: 0.28, kind: "store", label: "STORE" },
        { fx: 0.105, fy: 0.38, kind: "restaurant", label: "RESTAURANT" },
        { fx: 0.048, fy: 0.5, kind: "darkstore", label: "DARK STORE" },
        { fx: 0.115, fy: 0.6, kind: "grocery", label: "GROCERY" },
        { fx: 0.055, fy: 0.72, kind: "pharmacy", label: "PHARMACY" },
        { fx: 0.115, fy: 0.82, kind: "restaurant", label: "KITCHEN" },
      ].map((n) => ({ x: n.fx * w, y: n.fy * h, kind: n.kind as NodeKind, label: n.label }));

      padL = { x: 0.185 * w, y: 0.3 * h, kind: "pad", label: "DRONE PAD" };
      dockL = { x: 0.178 * w, y: 0.72 * h, kind: "dock", label: "AV LOADING" };

      // right cluster: destinations packed around the right hubs (short last leg)
      padR = { x: 0.815 * w, y: 0.28 * h, kind: "pad", label: "DRONE PAD" };
      dockR = { x: 0.822 * w, y: 0.72 * h, kind: "dock", label: "AV DOCK" };

      ends = [
        { fx: 0.895, fy: 0.26, kind: "apartments", label: "APARTMENTS" },
        { fx: 0.952, fy: 0.37, kind: "office", label: "OFFICE" },
        { fx: 0.9, fy: 0.5, kind: "home", label: "HOME" },
        { fx: 0.955, fy: 0.62, kind: "walkup", label: "WALK-UP" },
        { fx: 0.898, fy: 0.74, kind: "home", label: "HOME" },
        { fx: 0.95, fy: 0.85, kind: "campus", label: "CAMPUS" },
      ].map((n) => ({ x: n.fx * w, y: n.fy * h, kind: n.kind as NodeKind, label: n.label }));
    };
    layout();
    window.addEventListener("resize", layout);

    // ---- traffic ----------------------------------------------------------
    type Order = { via: "air" | "road"; from: SceneNode; to: SceneNode; t: number };
    let orders: Order[] = [];
    let spawnClock = 0;

    const spawn = () => {
      orders.push({
        via: Math.random() < 0.5 ? "air" : "road",
        from: merchants[Math.floor(Math.random() * merchants.length)],
        to: ends[Math.floor(Math.random() * ends.length)],
        t: Math.random() * 0.2,
      });
    };

    // ambient carriers looping the whole time (not tied to an order)
    type Ambient = { kind: "drone" | "av" | "robotL" | "robotR"; t: number; dir: 1 | -1; speed: number; a?: SceneNode; b?: SceneNode };
    let ambient: Ambient[] = [];
    const seedAmbient = () => {
      ambient = [
        { kind: "drone", t: 0.15, dir: 1, speed: 0.0042 },
        { kind: "drone", t: 0.6, dir: -1, speed: 0.0036 },
        { kind: "drone", t: 0.85, dir: 1, speed: 0.0048 },
        { kind: "av", t: 0.3, dir: 1, speed: 0.0032 },
        { kind: "av", t: 0.75, dir: -1, speed: 0.0028 },
        { kind: "robotL", t: 0.2, dir: 1, speed: 0.011 },
        { kind: "robotL", t: 0.7, dir: 1, speed: 0.009 },
        { kind: "robotR", t: 0.4, dir: 1, speed: 0.01 },
        { kind: "robotR", t: 0.9, dir: 1, speed: 0.012 },
      ];
      ambient.forEach((a) => {
        if (a.kind === "robotL") {
          a.a = merchants[Math.floor(Math.random() * merchants.length)];
          a.b = Math.random() < 0.5 ? padL : dockL;
        } else if (a.kind === "robotR") {
          a.a = Math.random() < 0.5 ? padR : dockR;
          a.b = ends[Math.floor(Math.random() * ends.length)];
        }
      });
    };
    seedAmbient();

    const ease = (u: number) => u * u * (3 - 2 * u);

    const arcPoint = (a: P, b: P, u: number): P => {
      const mx = (a.x + b.x) / 2;
      const my = Math.min(a.y, b.y) - 0.17 * h;
      const q = 1 - u;
      return {
        x: q * q * a.x + 2 * q * u * mx + u * u * b.x,
        y: q * q * a.y + 2 * q * u * my + u * u * b.y,
      };
    };

    const legPoint = (o: Order): P => {
      const hubA = o.via === "air" ? padL : dockL;
      const hubB = o.via === "air" ? padR : dockR;
      if (o.t < 1) {
        const u = ease(o.t);
        return { x: o.from.x + (hubA.x - o.from.x) * u, y: o.from.y + (hubA.y - o.from.y) * u };
      }
      if (o.t < 2) {
        const u = ease(o.t - 1);
        if (o.via === "air") return arcPoint(hubA, hubB, u);
        return { x: hubA.x + (hubB.x - hubA.x) * u, y: hubA.y + (hubB.y - hubA.y) * u };
      }
      const u = ease(o.t - 2);
      return { x: hubB.x + (o.to.x - hubB.x) * u, y: hubB.y + (o.to.y - hubB.y) * u };
    };

    // ---- drawing ----------------------------------------------------------
    const line = (a: P, b: P) => {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    };

    const glyph = (n: SceneNode) => {
      const { x, y } = n;
      ctx.beginPath();
      switch (n.kind) {
        case "store":
          ctx.strokeRect(x - 9, y - 7, 18, 14);
          line({ x: x - 9, y: y - 3 }, { x: x + 9, y: y - 3 }); // awning
          break;
        case "restaurant":
          ctx.strokeRect(x - 9, y - 7, 18, 14);
          ctx.beginPath();
          ctx.arc(x, y + 1, 3, 0, Math.PI * 2); // plate
          ctx.stroke();
          break;
        case "darkstore":
          ctx.strokeRect(x - 9, y - 7, 18, 14);
          ctx.fillRect(x - 9, y - 7, 18, 14); // filled: lights off
          break;
        case "grocery":
          ctx.strokeRect(x - 9, y - 7, 18, 14);
          line({ x: x - 5, y: y - 7 }, { x: x - 5, y: y + 7 });
          line({ x: x + 1, y: y - 7 }, { x: x + 1, y: y + 7 }); // aisles
          break;
        case "pharmacy":
          ctx.strokeRect(x - 8, y - 7, 16, 14);
          line({ x, y: y - 4 }, { x, y: y + 4 });
          line({ x: x - 4, y }, { x: x + 4, y }); // cross
          break;
        case "home":
          ctx.strokeRect(x - 7, y - 4, 14, 10);
          ctx.beginPath();
          ctx.moveTo(x - 9, y - 4);
          ctx.lineTo(x, y - 11);
          ctx.lineTo(x + 9, y - 4);
          ctx.stroke();
          break;
        case "apartments":
          ctx.strokeRect(x - 7, y - 13, 14, 24);
          for (let r = 0; r < 3; r++)
            for (let c = 0; c < 2; c++) ctx.fillRect(x - 4 + c * 6, y - 9 + r * 7, 2, 2); // windows
          break;
        case "office":
          ctx.strokeRect(x - 8, y - 11, 16, 21);
          line({ x: x - 8, y: y - 4 }, { x: x + 8, y: y - 4 });
          line({ x: x - 8, y: y + 3 }, { x: x + 8, y: y + 3 }); // floors
          break;
        case "walkup":
          ctx.strokeRect(x - 7, y - 9, 14, 18);
          // stoop steps — the part that stops everyone else
          line({ x: x - 11, y: y + 9 }, { x: x - 7, y: y + 9 });
          line({ x: x - 9, y: y + 6 }, { x: x - 7, y: y + 6 });
          break;
        case "campus":
          ctx.strokeRect(x - 12, y - 6, 24, 12);
          line({ x: x, y: y - 6 }, { x: x, y: y - 13 });
          line({ x: x, y: y - 13 }, { x: x + 6, y: y - 11 }); // flag
          break;
        case "pad":
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.font = "600 9px ui-monospace, Menlo, monospace";
          ctx.fillText("H", x - 3, y + 3.5);
          break;
        case "dock":
          ctx.strokeRect(x - 11, y - 6, 22, 12);
          ctx.beginPath();
          ctx.moveTo(x - 4, y - 3);
          ctx.lineTo(x + 1, y);
          ctx.lineTo(x - 4, y + 3);
          ctx.moveTo(x + 2, y - 3);
          ctx.lineTo(x + 7, y);
          ctx.lineTo(x + 2, y + 3);
          ctx.stroke(); // load-in chevrons
          break;
      }
    };

    const label = (n: SceneNode, dy = 0) => {
      ctx.font = "600 8px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(n.label, n.x, n.y + 20 + dy);
      ctx.textAlign = "left";
    };

    const drawStatic = () => {
      // short-leg paths: dense dashed spokes inside each cluster
      ctx.strokeStyle = `rgba(${INK}, 0.11)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      merchants.forEach((m) => {
        line(m, padL);
        line(m, dockL);
      });
      ends.forEach((e) => {
        line(padR, e);
        line(dockR, e);
      });
      ctx.setLineDash([]);

      // long middle mile: road + drone corridor
      ctx.strokeStyle = `rgba(${INK}, 0.13)`;
      ctx.setLineDash([6, 6]);
      line(dockL, dockR);
      ctx.beginPath();
      ctx.moveTo(padL.x, padL.y);
      ctx.quadraticCurveTo((padL.x + padR.x) / 2, Math.min(padL.y, padR.y) - 0.17 * h, padR.x, padR.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // nodes + labels
      ctx.strokeStyle = `rgba(${INK}, 0.34)`;
      ctx.fillStyle = `rgba(${INK}, 0.3)`;
      ctx.lineWidth = 1.2;
      merchants.forEach((n) => {
        glyph(n);
        label(n);
      });
      ends.forEach((n) => {
        glyph(n);
        label(n, n.kind === "apartments" || n.kind === "office" ? 4 : 0);
      });
      ctx.strokeStyle = `rgba(${ORANGE}, 0.5)`;
      ctx.fillStyle = `rgba(${ORANGE}, 0.62)`;
      [padL, padR, dockL, dockR].forEach((n) => {
        glyph(n);
        label(n);
      });

      // zone captions
      ctx.fillStyle = `rgba(${INK}, 0.3)`;
      ctx.font = "600 9px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("FIRST 100 YDS", 0.115 * w, 0.955 * h);
      ctx.fillText("MIDDLE MILE — DRONES & AVS", 0.5 * w, 0.955 * h);
      ctx.fillText("LAST 100 YDS", 0.885 * w, 0.955 * h);
      ctx.textAlign = "left";
    };

    const drawDrone = (p: P) => {
      ctx.strokeStyle = `rgba(${ORANGE}, 0.85)`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 5);
      ctx.lineTo(p.x - 5, p.y + 4);
      ctx.lineTo(p.x + 5, p.y + 4);
      ctx.closePath();
      ctx.stroke();
    };
    const drawAV = (p: P) => {
      ctx.strokeStyle = `rgba(${ORANGE}, 0.85)`;
      ctx.lineWidth = 1.4;
      ctx.strokeRect(p.x - 6, p.y - 4, 12, 8);
    };
    const drawRobot = (p: P) => {
      ctx.fillStyle = `rgba(${ORANGE}, 0.9)`;
      ctx.shadowColor = `rgba(${ORANGE}, 0.7)`;
      ctx.shadowBlur = 7;
      ctx.fillRect(p.x - 3.5, p.y - 3.5, 7, 7);
      ctx.shadowBlur = 0;
    };

    const drawAmbient = () => {
      ambient.forEach((a) => {
        const u = ease(a.t);
        if (a.kind === "drone") {
          drawDrone(arcPoint(padL, padR, a.dir === 1 ? u : 1 - u));
        } else if (a.kind === "av") {
          const uu = a.dir === 1 ? u : 1 - u;
          drawAV({ x: dockL.x + (dockR.x - dockL.x) * uu, y: dockL.y + (dockR.y - dockL.y) * uu });
        } else if (a.a && a.b) {
          // shuttle robots ping-pong their short leg
          const uu = a.t < 0.5 ? ease(a.t * 2) : ease(2 - a.t * 2);
          drawRobot({ x: a.a.x + (a.b.x - a.a.x) * uu, y: a.a.y + (a.b.y - a.a.y) * uu });
        }
      });
    };

    const stepAmbient = () => {
      ambient.forEach((a) => {
        a.t += a.speed;
        if (a.t >= 1) {
          a.t = 0;
          // re-roll shuttle endpoints so the clusters feel busy everywhere
          if (a.kind === "robotL") {
            a.a = merchants[Math.floor(Math.random() * merchants.length)];
            a.b = Math.random() < 0.5 ? padL : dockL;
          } else if (a.kind === "robotR") {
            a.a = Math.random() < 0.5 ? padR : dockR;
            a.b = ends[Math.floor(Math.random() * ends.length)];
          }
        }
      });
    };

    const drawOrders = () => {
      orders.forEach((o) => {
        const p = legPoint(o);
        const leg = Math.floor(o.t);
        if (leg === 1 && o.via === "air") drawDrone(p);
        else if (leg === 1) drawAV(p);
        else drawRobot(p);
        ctx.fillStyle = `rgba(${ORANGE}, 0.85)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y - 9, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const stepOrders = () => {
      spawnClock -= 1;
      if (spawnClock <= 0 && orders.length < 10) {
        spawn();
        spawnClock = 45 + Math.random() * 70;
      }
      orders.forEach((o) => {
        const leg = Math.floor(o.t);
        // short ends move through their leg quickly (they're short); the long
        // middle mile takes its time even at vehicle speed
        o.t += leg === 1 ? 0.0038 : 0.011;
      });
      orders = orders.filter((o) => o.t < 3);
    };

    const frame = () => {
      pointer.x += (target.x - pointer.x) * 0.06;
      pointer.y += (target.y - pointer.y) * 0.06;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate((pointer.x - 0.5) * 16, (pointer.y - 0.5) * 10);
      drawStatic();
      drawAmbient();
      drawOrders();
      ctx.restore();

      stepAmbient();
      stepOrders();

      if (running && visible) raf = requestAnimationFrame(frame);
    };

    if (reduced) {
      for (let i = 0; i < 4; i++) {
        spawn();
        orders[i].t = 0.4 + i * 0.7;
      }
      ctx.clearRect(0, 0, w, h);
      drawStatic();
      drawAmbient();
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
