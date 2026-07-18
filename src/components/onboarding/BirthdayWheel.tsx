import { useEffect, useRef } from "react";
import { MONTHS_RU, daysInMonth, type Birthday } from "@/lib/birthdayStore";

const ITEM_H = 36;
const VISIBLE = 5; // 2 above + center + 2 below
const PAD = ((VISIBLE - 1) / 2) * ITEM_H;

interface WheelProps {
  values: (string | number)[];
  index: number;
  onChange: (i: number) => void;
  ariaLabel: string;
}

function Wheel({ values, index, onChange, ariaLabel }: WheelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const suppressScroll = useRef(false);

  // Sync scroll position to index
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = index * ITEM_H;
    if (Math.abs(el.scrollTop - target) > 1) {
      suppressScroll.current = true;
      el.scrollTo({ top: target, behavior: "smooth" });
      window.setTimeout(() => { suppressScroll.current = false; }, 250);
    }
  }, [index]);

  const handleScroll = () => {
    const el = ref.current;
    if (!el || suppressScroll.current) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const i = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(values.length - 1, i));
      if (clamped !== index) onChange(clamped);
      // snap
      const target = clamped * ITEM_H;
      if (Math.abs(el.scrollTop - target) > 1) {
        suppressScroll.current = true;
        el.scrollTo({ top: target, behavior: "smooth" });
        window.setTimeout(() => { suppressScroll.current = false; }, 200);
      }
    }, 90);
  };

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      role="listbox"
      aria-label={ariaLabel}
      className="relative flex-1 overflow-y-scroll no-scrollbar snap-y snap-mandatory"
      style={{
        height: VISIBLE * ITEM_H,
        maskImage:
          "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
      }}
    >
      <div style={{ height: PAD }} />
      {values.map((v, i) => {
        const active = i === index;
        return (
          <div
            key={i}
            className="snap-center flex items-center justify-center transition-all"
            style={{
              height: ITEM_H,
              fontSize: active ? 17 : 14,
              fontWeight: active ? 600 : 400,
              opacity: active ? 1 : 0.4,
            }}
          >
            {v}
          </div>
        );
      })}
      <div style={{ height: PAD }} />
    </div>
  );
}

interface Props {
  value: Birthday;
  onChange: (b: Birthday) => void;
}

export function BirthdayWheel({ value, onChange }: Props) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 14 - i); // 14+
  const months = MONTHS_RU;
  const maxDay = daysInMonth(value.month, value.year);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  const dayIdx = Math.min(value.day - 1, maxDay - 1);
  const monthIdx = value.month - 1;
  const yearIdx = years.indexOf(value.year);

  return (
    <div className="relative rounded-xl bg-background hairline overflow-hidden">
      {/* Central highlight band */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 border-y border-primary/30 bg-primary/5"
        style={{ top: PAD, height: ITEM_H }}
      />
      <div className="flex px-2">
        <Wheel
          values={days}
          index={dayIdx}
          onChange={(i) => onChange({ ...value, day: i + 1 })}
          ariaLabel="День"
        />
        <Wheel
          values={months}
          index={monthIdx}
          onChange={(i) => {
            const m = i + 1;
            const md = daysInMonth(m, value.year);
            onChange({ ...value, month: m, day: Math.min(value.day, md) });
          }}
          ariaLabel="Месяц"
        />
        <Wheel
          values={years}
          index={yearIdx === -1 ? 0 : yearIdx}
          onChange={(i) => {
            const y = years[i];
            const md = daysInMonth(value.month, y);
            onChange({ ...value, year: y, day: Math.min(value.day, md) });
          }}
          ariaLabel="Год"
        />
      </div>
    </div>
  );
}
