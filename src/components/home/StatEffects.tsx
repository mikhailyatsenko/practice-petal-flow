import { useEffect, useState } from "react";

/* ========== ⭐ Взрыв частиц для блока "Очки" ========== */
interface BurstProps {
  x: number;
  y: number;
  onDone: () => void;
}
export function StarBurst({ x, y, onDone }: BurstProps) {
  const icons = ["⭐", "✨", "💫", "⭐", "✨", "💫"];
  const [phase, setPhase] = useState<"start" | "end">("start");
  useEffect(() => {
    const r1 = requestAnimationFrame(() =>
      requestAnimationFrame(() => setPhase("end")),
    );
    const t = window.setTimeout(onDone, 450);
    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(t);
    };
  }, [onDone]);
  return (
    <>
      {icons.map((ic, i) => {
        const angle = (Math.PI * 2 * i) / icons.length;
        const dist = 38 + Math.random() * 18;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        return (
          <div
            key={i}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              transform: `translate(${x + (phase === "end" ? dx : 0)}px, ${y + (phase === "end" ? dy : 0)}px) translate(-50%,-50%) scale(${phase === "end" ? 0.6 : 1})`,
              transition: "transform 0.4s ease-out, opacity 0.4s ease-out",
              opacity: phase === "end" ? 0 : 1,
              fontSize: 14,
              pointerEvents: "none",
              zIndex: 80,
              lineHeight: 1,
            }}
          >
            {ic}
          </div>
        );
      })}
    </>
  );
}

/* ========== 🔥 Языки пламени для блока "Хит" ========== */
export function FireFlames({ x, y, onDone }: BurstProps) {
  const flames = [0, 1, 2, 3, 4];
  const [active, setActive] = useState<boolean[]>(flames.map(() => false));
  useEffect(() => {
    const timers: number[] = [];
    flames.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => {
          setActive((a) => {
            const n = [...a];
            n[i] = true;
            return n;
          });
        }, i * 40),
      );
    });
    const done = window.setTimeout(onDone, 5 * 40 + 520);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [onDone]);
  return (
    <>
      {flames.map((_, i) => {
        const dx = -20 + (i * 40) / 4;
        const on = active[i];
        return (
          <div
            key={i}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              transform: `translate(${x + dx}px, ${y + (on ? -30 : 10)}px) translate(-50%,-50%)`,
              transition: "transform 0.5s ease-out, opacity 0.5s ease-out",
              opacity: on ? 0 : 1,
              fontSize: 16,
              pointerEvents: "none",
              zIndex: 80,
              lineHeight: 1,
            }}
          >
            🔥
          </div>
        );
      })}
    </>
  );
}

/* ========== 🛡️ Конфетти для блока "Страховка" ========== */
const CONFETTI_COLORS = ["#FFB300", "#FF6D00", "#16a34a", "#FF9800", "#FFD54F"];
export function Confetti({ x, y, onDone }: BurstProps) {
  const pieces = Array.from({ length: 10 });
  const [phase, setPhase] = useState<"start" | "end">("start");
  useEffect(() => {
    const r = requestAnimationFrame(() =>
      requestAnimationFrame(() => setPhase("end")),
    );
    const t = window.setTimeout(onDone, 500);
    return () => {
      cancelAnimationFrame(r);
      clearTimeout(t);
    };
  }, [onDone]);
  return (
    <>
      {pieces.map((_, i) => {
        const angle = (Math.PI * 2 * i) / pieces.length;
        const dist = 40 + Math.random() * 25;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const rot = Math.random() * 360;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        return (
          <div
            key={i}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: 8,
              height: 8,
              borderRadius: 2,
              background: color,
              transform: `translate(${x + (phase === "end" ? dx : 0)}px, ${y + (phase === "end" ? dy : 0)}px) translate(-50%,-50%) rotate(${phase === "end" ? rot : 0}deg)`,
              transition: "all 0.45s ease-out",
              opacity: phase === "end" ? 0 : 1,
              pointerEvents: "none",
              zIndex: 80,
            }}
          />
        );
      })}
    </>
  );
}

/* ========== 💎 Кольца для блока "Статус" ========== */
export function StatusRings({ x, y, onDone }: BurstProps) {
  const rings = [0, 1, 2];
  const [active, setActive] = useState<boolean[]>(rings.map(() => false));
  useEffect(() => {
    const timers: number[] = [];
    rings.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => {
          setActive((a) => {
            const n = [...a];
            n[i] = true;
            return n;
          });
        }, i * 130),
      );
    });
    const done = window.setTimeout(onDone, 2 * 130 + 580);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [onDone]);
  return (
    <>
      {rings.map((_, i) => {
        const on = active[i];
        const size = on ? 100 : 40;
        return (
          <div
            key={i}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: size,
              height: size,
              border: "2.5px solid rgba(255,179,0,0.7)",
              borderRadius: "50%",
              transform: `translate(${x}px, ${y}px) translate(-50%,-50%)`,
              transition: "all 0.55s ease-out",
              opacity: on ? 0 : 1,
              pointerEvents: "none",
              zIndex: 80,
              boxSizing: "border-box",
            }}
          />
        );
      })}
    </>
  );
}
