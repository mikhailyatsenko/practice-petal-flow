import { useEffect, useRef } from "react";

/**
 * Lightweight "ink drops" background.
 * - GPU-only transforms (no top/left animation)
 * - Subtle parallax on scroll
 * - Reduced opacity to stay non-distracting
 */
export function InkBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY * 0.06;
        el.style.transform = `translate3d(0, ${y}px, 0)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div ref={ref} className="absolute inset-0">
        <div
          className="absolute -top-24 -left-16 h-[55vw] w-[55vw] rounded-full blur-3xl opacity-50 animate-float-blob"
          style={{ background: "radial-gradient(circle at 30% 30%, var(--primary), transparent 70%)" }}
        />
        <div
          className="absolute top-[35%] -right-24 h-[60vw] w-[60vw] rounded-full blur-3xl opacity-40 animate-float-blob"
          style={{ background: "radial-gradient(circle at 50% 50%, var(--accent), transparent 70%)", animationDelay: "-5s" }}
        />
        <div
          className="absolute bottom-[-10%] left-[10%] h-[55vw] w-[55vw] rounded-full blur-3xl opacity-35 animate-float-blob"
          style={{ background: "radial-gradient(circle at 60% 40%, oklch(0.85 0.15 110), transparent 70%)", animationDelay: "-9s" }}
        />
      </div>
    </div>
  );
}
