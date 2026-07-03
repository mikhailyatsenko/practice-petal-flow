import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle, X } from "lucide-react";
import type { Task, TaskGoalRef, TaskDeadline } from "./TasksModule";

/* =====================================================================
   Гант — третий режим раздела «Задачи».
   - Sticky левая колонка с названиями (2 строки, обрезка)
   - Горизонтальная шкала времени (пиксельная), сдвигается через JS transform
   - Общий полупрозрачный ползунок сверху
   - Свайп пальцем по правой панели
   - Тап по названию задачи или по полоске -> попап с датами
   - Тап по названию цели -> всплывающая подсказка с полным текстом
   - Просроченная задача -> красный текст + значок ⚠
   ===================================================================== */

const LEFT_W = 132;
const PX_PER_DAY = 10;
const ROW_H = 34;
const GOAL_ROW_H = 30;
const HEADER_H = 44;
const SCROLLBAR_H = 14;
const MAX_WIDTH = 480;
const VIEW_MONTHS = 3;

const GOAL_PALETTE = [
  "#FF6D00", "#2E7DD7", "#7F55D9", "#2FA36C",
  "#D93A6A", "#C58A17", "#0F8E9C", "#8A6E4E",
];

function goalColor(goal: TaskGoalRef | undefined, index: number): string {
  if (goal?.color) return goal.color;
  return GOAL_PALETTE[index % GOAL_PALETTE.length];
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000);
}

function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromIso(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function rangeFromTag(deadline: TaskDeadline, today: Date): { start: Date; end: Date } {
  switch (deadline) {
    case "🟧 На день":
      return { start: today, end: today };
    case "🟦 На неделю":
      return { start: today, end: addDays(today, 6) };
    case "🟪 На месяц":
      return { start: today, end: addDays(today, 29) };
    case "🟥 Квартал":
      return { start: today, end: addDays(today, 89) };
    default:
      return { start: today, end: today };
  }
}

function getTaskRange(t: Task, today: Date): { start: Date; end: Date } {
  if (t.startDate && t.endDate) return { start: fromIso(t.startDate), end: fromIso(t.endDate) };
  const idTime = t.id.startsWith("t") ? Number(t.id.slice(1)) : NaN;
  const createdAt = Number.isFinite(idTime) && idTime > 1_000_000_000_000 ? startOfDay(new Date(idTime)) : today;
  return rangeFromTag(t.deadline, createdAt);
}

const MONTHS_RU = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

interface GanttViewProps {
  goals: TaskGoalRef[];
  tasks: Task[];
  onUpdateTaskDates: (taskId: string, start: string, end: string) => void;
  onOpenTask?: (taskId: string) => void;
}

export function GanttView({ goals, tasks, onUpdateTaskDates, onOpenTask }: GanttViewProps) {
  const today = useMemo(() => startOfDay(new Date()), []);

  // Диапазон шкалы: (VIEW_MONTHS-1) месяца назад, всего 9 месяцев для запаса прокрутки.
  const [monthShift, setMonthShift] = useState(0); // управляет позицией скролла к нужному месяцу
  const rangeStart = useMemo(() => {
    return new Date(today.getFullYear(), today.getMonth() - 3, 1);
  }, [today]);
  const rangeEnd = useMemo(() => {
    return new Date(today.getFullYear(), today.getMonth() + 6, 0);
  }, [today]);
  const totalDays = useMemo(() => daysBetween(rangeStart, rangeEnd) + 1, [rangeStart, rangeEnd]);
  const totalW = totalDays * PX_PER_DAY;

  // Активные задачи
  const activeTasks = useMemo(() => tasks.filter((t) => !t.done), [tasks]);

  // Группировка (только цели, у которых есть задачи)
  const grouped = useMemo(() => {
    return goals
      .map((g, i) => ({ goal: g, color: goalColor(g, i), items: activeTasks.filter((t) => t.goalId === g.id) }))
      .filter((r) => r.items.length > 0);
  }, [goals, activeTasks]);

  // Замер ширины
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const rightPaneRef = useRef<HTMLDivElement | null>(null);
  const [rightW, setRightW] = useState(0);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = Math.min(el.clientWidth, MAX_WIDTH);
      setRightW(Math.max(0, w - LEFT_W));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const maxOffset = Math.max(0, totalW - rightW);
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const maxOffsetRef = useRef(0);
  const clamp = (v: number) => Math.min(Math.max(0, v), maxOffset);
  const setClampedOffset = (value: number) => {
    const next = Math.min(Math.max(0, value), maxOffsetRef.current);
    offsetRef.current = next;
    setOffset(next);
  };

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  useEffect(() => {
    maxOffsetRef.current = maxOffset;
  }, [maxOffset]);

  // Автопрокрутка при первом рендере: левый край шкалы = ближайшая слева
  // «пятидневная» дата текущего месяца:
  //   день 1–5   → 1-е
  //   день 5–10  → 5-е
  //   день 10–15 → 10-е и т.д.
  const didCenterRef = useRef(false);
  useEffect(() => {
    if (didCenterRef.current || rightW === 0) return;
    const dayInMonth = today.getDate();
    const anchorDay = Math.max(1, Math.floor(dayInMonth / 5) * 5);
    const anchor = new Date(today.getFullYear(), today.getMonth(), anchorDay);
    const anchorX = daysBetween(rangeStart, anchor) * PX_PER_DAY;
    setClampedOffset(anchorX);
    didCenterRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rightW]);

  useEffect(() => {
    setOffset((o) => {
      const next = Math.min(o, maxOffset);
      offsetRef.current = next;
      return next;
    });
  }, [maxOffset]);

  // Инерция прокрутки: после отпускания пальца/мыши лента плавно замедляется.
  const rafRef = useRef<number | null>(null);
  const cancelInertia = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };
  const startInertia = (velocity: number) => {
    // velocity — px/ms в системе координат пальца (положительная = палец двигался вправо).
    cancelInertia();
    if (Math.abs(velocity) < 0.05) return;
    let v = velocity;
    let last = performance.now();
    const friction = 0.004; // экспоненциальное затухание в мс^-1
    const step = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      // offset уменьшается когда палец двигался вправо → next = offset - v*dt
      const next = offsetRef.current - v * dt;
      const clamped = Math.min(Math.max(0, next), maxOffsetRef.current);
      offsetRef.current = clamped;
      setOffset(clamped);
      if (clamped === 0 || clamped === maxOffsetRef.current) {
        rafRef.current = null;
        return;
      }
      v *= Math.max(0, 1 - friction * dt);
      if (Math.abs(v) < 0.02) {
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };
  useEffect(() => () => cancelInertia(), []);

  // Свайп пальцем/мышью по правой панели
  useEffect(() => {
    const el = rightPaneRef.current;
    if (!el) return;
    let pointerDragging = false;
    let pointerStartX = 0;
    let pointerStartOffset = 0;
    let pointerId: number | null = null;
    let pointerLastX = 0;
    let pointerLastT = 0;
    let pointerVelocity = 0;

    let touchDragging = false;
    let touchHorizontal = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartOffset = 0;
    let touchLastX = 0;
    let touchLastT = 0;
    let touchVelocity = 0;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.stopPropagation();
      cancelInertia();
      pointerDragging = true;
      pointerStartX = e.clientX;
      pointerStartOffset = offsetRef.current;
      pointerId = e.pointerId;
      pointerLastX = e.clientX;
      pointerLastT = performance.now();
      pointerVelocity = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!pointerDragging) return;
      e.preventDefault();
      e.stopPropagation();
      const dx = e.clientX - pointerStartX;
      if (Math.abs(dx) > 4 && pointerId != null) {
        try { el.setPointerCapture(pointerId); } catch { /* noop */ }
      }
      const now = performance.now();
      const dt = now - pointerLastT;
      if (dt > 0) pointerVelocity = (e.clientX - pointerLastX) / dt;
      pointerLastX = e.clientX;
      pointerLastT = now;
      setClampedOffset(pointerStartOffset - dx);
    };
    const onUp = () => {
      if (pointerDragging) startInertia(pointerVelocity);
      pointerDragging = false;
      pointerId = null;
    };

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      e.stopPropagation();
      cancelInertia();
      touchDragging = true;
      touchHorizontal = false;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartOffset = offsetRef.current;
      touchLastX = touch.clientX;
      touchLastT = performance.now();
      touchVelocity = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touchDragging) return;
      const touch = e.touches[0];
      if (!touch) return;
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      if (!touchHorizontal && Math.abs(dx) > 5 && Math.abs(dx) > Math.abs(dy) * 1.05) {
        touchHorizontal = true;
      }
      e.stopPropagation();
      if (!touchHorizontal) return;
      e.preventDefault();
      const now = performance.now();
      const dt = now - touchLastT;
      if (dt > 0) touchVelocity = (touch.clientX - touchLastX) / dt;
      touchLastX = touch.clientX;
      touchLastT = now;
      setClampedOffset(touchStartOffset - dx);
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.stopPropagation();
      if (touchDragging && touchHorizontal) startInertia(touchVelocity);
      touchDragging = false;
      touchHorizontal = false;
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove, { passive: false });
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);


  // Кастомный ползунок
  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbRatio = rightW > 0 && totalW > 0 ? Math.min(1, rightW / totalW) : 1;
  const thumbW = Math.max(28, rightW * thumbRatio);
  const thumbX = maxOffset === 0 ? 0 : (offset / maxOffset) * (rightW - thumbW);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let dragging = false;
    let startX = 0;
    let startOffset = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      startX = e.clientX;
      startOffset = offset;
      try { el.setPointerCapture(e.pointerId); } catch { /* noop */ }
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || rightW <= thumbW) return;
      const dx = e.clientX - startX;
      const next = clamp(startOffset + (dx / (rightW - thumbW)) * maxOffset);
      offsetRef.current = next;
      setOffset(next);
    };
    const onUp = () => { dragging = false; };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [offset, maxOffset, thumbW, thumbX, rightW]);

  const showScrollbar = totalW > rightW && rightW > 0;

  // Заголовки месяцев
  const monthMarkers = useMemo(() => {
    const list: { label: string; x: number; days: number }[] = [];
    let d = new Date(rangeStart);
    while (d <= rangeEnd) {
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const clampedStart = monthStart < rangeStart ? rangeStart : monthStart;
      const clampedEnd = monthEnd > rangeEnd ? rangeEnd : monthEnd;
      const x = daysBetween(rangeStart, clampedStart) * PX_PER_DAY;
      const days = daysBetween(clampedStart, clampedEnd) + 1;
      list.push({
        label: `${MONTHS_RU[monthStart.getMonth()]} ${monthStart.getFullYear()}`,
        x,
        days,
      });
      d = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    }
    return list;
  }, [rangeStart, rangeEnd]);

  // Деления каждые 5 дней
  const dayTicks = useMemo(() => {
    const list: { x: number; label: number }[] = [];
    let d = new Date(rangeStart);
    while (d <= rangeEnd) {
      if (d.getDate() % 5 === 0 || d.getDate() === 1) {
        list.push({ x: daysBetween(rangeStart, d) * PX_PER_DAY, label: d.getDate() });
      }
      d = addDays(d, 1);
    }
    return list;
  }, [rangeStart, rangeEnd]);

  // Кнопки навигации ◀/▶/Сегодня — прижимают к левому краю по 1-му числу месяца
  const shiftMonth = (delta: number) => {
    const leftDate = addDays(rangeStart, Math.round(offsetRef.current / PX_PER_DAY));
    const target = new Date(leftDate.getFullYear(), leftDate.getMonth() + delta, 1);
    const targetX = daysBetween(rangeStart, target) * PX_PER_DAY;
    setOffset(clamp(targetX));
  };
  const goToday = () => {
    const dayInMonth = today.getDate();
    const anchorDay = Math.max(1, Math.floor(dayInMonth / 5) * 5);
    const anchor = new Date(today.getFullYear(), today.getMonth(), anchorDay);
    const anchorX = daysBetween(rangeStart, anchor) * PX_PER_DAY;
    setOffset(clamp(anchorX));
  };

  // Popup редактирования дат
  const [editing, setEditing] = useState<Task | null>(null);
  // Tooltip у названия цели
  const [goalTip, setGoalTip] = useState<{ id: string; text: string; x: number; y: number } | null>(null);
  useEffect(() => {
    if (!goalTip) return;
    const t = window.setTimeout(() => setGoalTip(null), 3200);
    const onDoc = () => setGoalTip(null);
    window.addEventListener("click", onDoc);
    return () => { window.clearTimeout(t); window.removeEventListener("click", onDoc); };
  }, [goalTip]);

  const todayX = daysBetween(rangeStart, today) * PX_PER_DAY;
  const totalRowsH =
    grouped.reduce((sum, g) => sum + GOAL_ROW_H + g.items.length * ROW_H, 0) + 8;

  return (
    <div className="px-2">
      {/* Панель управления временем */}
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => shiftMonth(-1)}
            className="tap inline-flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: "#fff", border: "1px solid #ede8df", color: "#5a5a5a" }}
            aria-label="Назад"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToday}
            className="tap rounded-full px-3 py-1.5 text-[12px] font-medium"
            style={{ background: "linear-gradient(135deg,#FFB300,#FF6D00)", color: "#fff" }}
          >
            Сегодня
          </button>
          <button
            onClick={() => shiftMonth(1)}
            className="tap inline-flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: "#fff", border: "1px solid #ede8df", color: "#5a5a5a" }}
            aria-label="Вперёд"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="text-[11px] text-muted-foreground">
          1 месяц · свайп ←→
        </div>
      </div>

      {grouped.length === 0 && (
        <div className="text-center text-[13px] text-[#FF6D00] py-10">
          Нет активных задач. Добавь первую ✨
        </div>
      )}

      {grouped.length > 0 && (
        <div
          ref={wrapRef}
          className="mx-auto rounded-2xl bg-card overflow-hidden"
          style={{ border: "1px solid #ede8df", maxWidth: MAX_WIDTH }}
        >
          <div className="flex" style={{ position: "relative" }}>
            {/* Левая колонка (названия) */}
            <div
              className="shrink-0"
              style={{
                width: LEFT_W,
                borderRight: "1px solid #ede8df",
                background: "#faf7f1",
              }}
            >
              {/* Шапка левой колонки под "месяцы" + ползунок */}
              <div
                style={{
                  height: HEADER_H + (showScrollbar ? SCROLLBAR_H : 0),
                  borderBottom: "1px solid #ede8df",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#8a8a8a",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                Задачи
              </div>

              {grouped.map((row) => (
                <React.Fragment key={row.goal.id}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setGoalTip({
                        id: row.goal.id,
                        text: row.goal.title,
                        x: r.left + 8,
                        y: r.bottom + 4,
                      });
                    }}
                    className="tap w-full text-left flex items-center gap-1.5 px-2"
                    style={{
                      height: GOAL_ROW_H,
                      background: hexWithAlpha(row.color, 0.12),
                      borderBottom: "1px solid #ede8df",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: row.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      className="text-[11px] font-semibold"
                      style={{
                        color: "#3a3a3a",
                        lineHeight: 1.15,
                        maxHeight: 26,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                      }}
                    >
                      {row.goal.title}
                    </span>
                  </button>

                  {row.items.map((t) => {
                    const range = getTaskRange(t, today);
                    const overdue = range.end < today;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setEditing(t)}
                        className="tap w-full text-left flex items-start gap-1 px-2 py-1"
                        style={{
                          height: ROW_H,
                          borderBottom: "1px solid #f2ede4",
                          background: "#fff",
                        }}
                      >
                        {overdue && (
                          <AlertTriangle
                            className="h-3 w-3 mt-[2px] shrink-0"
                            style={{ color: "#DC2626" }}
                          />
                        )}
                        <span
                          style={{
                            fontSize: 11,
                            lineHeight: 1.2,
                            color: overdue ? "#DC2626" : "#3a3a3a",
                            fontWeight: overdue ? 600 : 500,
                            maxHeight: 28,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 2,
                          }}
                        >
                          {t.title}
                        </span>
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            {/* Правая панель — шкала */}
            <div
              ref={rightPaneRef}
              data-gantt-scroll="true"
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              style={{
                flex: 1,
                overflow: "hidden",
                position: "relative",
                minHeight: HEADER_H + totalRowsH,
                cursor: "grab",
                touchAction: "pan-y",
                overscrollBehavior: "contain",
              }}
            >
              {/* Шапка: месяцы + деления (сдвигается вместе со шкалой) */}
              <div
                style={{
                  height: HEADER_H,
                  borderBottom: "1px solid #ede8df",
                  position: "relative",
                  overflow: "hidden",
                  background: "#faf7f1",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: totalW,
                    height: HEADER_H,
                    transform: `translateX(${-offset}px)`,
                    willChange: "transform",
                  }}
                >
                  {monthMarkers.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        left: m.x,
                        top: 0,
                        width: m.days * PX_PER_DAY,
                        height: 22,
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#5a5a5a",
                        padding: "4px 6px",
                        borderLeft: i === 0 ? "none" : "1px solid #ede8df",
                        boxSizing: "border-box",
                      }}
                    >
                      {m.label}
                    </div>
                  ))}
                  {dayTicks.map((t, i) => (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        left: t.x,
                        top: 22,
                        width: 20,
                        marginLeft: -10,
                        textAlign: "center",
                        fontSize: 9,
                        color: "#a8a8a8",
                      }}
                    >
                      {t.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Ползунок прокрутки */}
              {showScrollbar && (
                <div
                  ref={trackRef}
                  style={{
                    height: SCROLLBAR_H,
                    position: "relative",
                    background: "rgba(0,0,0,0.03)",
                    borderBottom: "1px solid #ede8df",
                    touchAction: "none",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 3,
                      left: thumbX,
                      width: thumbW,
                      height: SCROLLBAR_H - 6,
                      background: "rgba(255,109,0,0.45)",
                      borderRadius: 999,
                    }}
                  />
                </div>
              )}

              {/* Тело шкалы */}
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  height: totalRowsH,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: totalW,
                    height: totalRowsH,
                    transform: `translateX(${-offset}px)`,
                    willChange: "transform",
                  }}
                >
                  {/* Вертикальные линии месяцев */}
                  {monthMarkers.map((m, i) => (
                    <div
                      key={`ml-${i}`}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: m.x,
                        width: 1,
                        height: totalRowsH,
                        background: i === 0 ? "transparent" : "#ede8df",
                      }}
                    />
                  ))}
                  {/* Линия "сегодня" */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: todayX,
                      width: 2,
                      height: totalRowsH,
                      background: "rgba(220,38,38,0.7)",
                      zIndex: 2,
                    }}
                  />

                  {/* Строки */}
                  {(() => {
                    let y = 0;
                    const nodes: React.ReactNode[] = [];
                    grouped.forEach((row) => {
                      const goalY = y;
                      nodes.push(
                        <div
                          key={`gr-${row.goal.id}`}
                          style={{
                            position: "absolute",
                            top: goalY,
                            left: 0,
                            width: totalW,
                            height: GOAL_ROW_H,
                            background: hexWithAlpha(row.color, 0.06),
                            borderBottom: "1px solid #ede8df",
                          }}
                        />
                      );
                      y += GOAL_ROW_H;
                      row.items.forEach((t) => {
                        const range = getTaskRange(t, today);
                        const startX = daysBetween(rangeStart, range.start) * PX_PER_DAY;
                        const w = Math.max(PX_PER_DAY, (daysBetween(range.start, range.end) + 1) * PX_PER_DAY);
                        const rowY = y;
                        nodes.push(
                          <div
                            key={`sep-${t.id}`}
                            style={{
                              position: "absolute",
                              top: rowY,
                              left: 0,
                              width: totalW,
                              height: ROW_H,
                              borderBottom: "1px solid #f2ede4",
                            }}
                          />
                        );
                        nodes.push(
                          <button
                            key={`bar-${t.id}`}
                            onClick={(e) => { e.stopPropagation(); setEditing(t); }}
                            style={{
                              position: "absolute",
                              top: rowY + 6,
                              left: startX,
                              width: w,
                              height: ROW_H - 12,
                              background: row.color,
                              borderRadius: 6,
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
                              opacity: 0.92,
                            }}
                            aria-label={t.title}
                          />
                        );
                        y += ROW_H;
                      });
                    });
                    return nodes;
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <DatesPopup
          task={editing}
          today={today}
          onClose={() => setEditing(null)}
          onSave={(s, e) => {
            onUpdateTaskDates(editing.id, s, e);
            setEditing(null);
          }}
          onOpenTask={onOpenTask ? () => { const id = editing.id; setEditing(null); onOpenTask(id); } : undefined}
        />
      )}

      {goalTip && (
        <GoalTip x={goalTip.x} y={goalTip.y} text={goalTip.text} onClose={() => setGoalTip(null)} />
      )}
    </div>
  );
}

/* ---------------- Попап дат ---------------- */

function DatesPopup({
  task,
  today,
  onClose,
  onSave,
  onOpenTask,
}: {
  task: Task;
  today: Date;
  onClose: () => void;
  onSave: (start: string, end: string) => void;
  onOpenTask?: () => void;
}) {
  const initial = task.startDate && task.endDate
    ? { start: task.startDate, end: task.endDate }
    : (() => { const r = getTaskRange(task, today); return { start: iso(r.start), end: iso(r.end) }; })();
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const valid = start && end && start <= end;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 360, background: "#fff",
          borderRadius: 20, padding: 18, boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
        }}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-[15px] font-semibold leading-snug text-foreground" style={{ flex: 1 }}>
            {task.title}
          </h3>
          <button onClick={onClose} className="tap shrink-0 rounded-full p-1" aria-label="Закрыть">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-2.5">
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Начало</span>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="mt-1 w-full rounded-xl px-3 py-2 text-[14px] outline-none"
              style={{ border: "1px solid #ede8df", background: "#faf7f1" }}
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Дедлайн</span>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="mt-1 w-full rounded-xl px-3 py-2 text-[14px] outline-none"
              style={{ border: "1px solid #ede8df", background: "#faf7f1" }}
            />
          </label>
          {!valid && (
            <p className="text-[11.5px]" style={{ color: "#DC2626" }}>
              Дата дедлайна должна быть не раньше даты начала
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          {onOpenTask ? (
            <button
              onClick={onOpenTask}
              className="tap text-[12px] underline"
              style={{ color: "#8a8a8a" }}
            >
              Открыть задачу
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="tap rounded-full px-3 py-1.5 text-[12.5px] font-medium"
              style={{ background: "#fff", color: "#8a8a8a", border: "1px solid #ede8df" }}
            >
              Отмена
            </button>
            <button
              onClick={() => valid && onSave(start, end)}
              disabled={!valid}
              className="tap rounded-full px-4 py-1.5 text-[12.5px] font-semibold"
              style={{
                background: valid ? "linear-gradient(135deg,#FFB300,#FF6D00)" : "#e5e2d9",
                color: valid ? "#fff" : "#a8a8a8",
                opacity: valid ? 1 : 0.7,
              }}
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Всплывающая подсказка цели ---------------- */

function GoalTip({ x, y, text, onClose }: { x: number; y: number; text: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ left: x, top: y });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let left = x;
    let top = y;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (left + r.width + 8 > vw) left = Math.max(8, vw - r.width - 8);
    if (top + r.height + 8 > vh) top = Math.max(8, y - r.height - 24);
    setPos({ left, top });
  }, [x, y]);
  return (
    <div
      ref={ref}
      onClick={(e) => { e.stopPropagation(); onClose(); }}
      style={{
        position: "fixed",
        left: pos.left,
        top: pos.top,
        zIndex: 999,
        maxWidth: 260,
        background: "#2a2a2a",
        color: "#fff",
        fontSize: 12,
        lineHeight: 1.35,
        padding: "8px 10px",
        borderRadius: 10,
        boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
      }}
    >
      {text}
    </div>
  );
}

/* ---------------- utils ---------------- */

function hexWithAlpha(hex: string, alpha: number): string {
  const m = hex.replace("#", "");
  const v = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
