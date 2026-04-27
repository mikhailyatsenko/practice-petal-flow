import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/qualities")({
  head: () => ({
    meta: [
      { title: "Качества характера — Клуб «Моя жизнь»" },
      { name: "description", content: "Развитие качеств характера через ежедневную практику." },
    ],
  }),
  component: QualitiesScreen,
});

// ---------- Types & storage ----------

type DayMark = "done" | "skip";

interface Quality {
  id: string;
  title: string;
  description?: string;
  pose: string;
  startDate: string; // YYYY-MM-DD
  marks: Record<string, DayMark>;
}

interface CatalogItem {
  title: string;
  description: string;
}

const CATALOG: CatalogItem[] = [
  { title: "Смелый", description: "Способность действовать вопреки страху, идти к целям несмотря на сомнения." },
  { title: "Самодисциплинированный", description: "Умение выполнять задуманное независимо от настроения и обстоятельств." },
  { title: "Уверенный", description: "Внутренняя опора и доверие к себе, спокойствие в действиях и решениях." },
  { title: "Терпеливый", description: "Способность ждать, выдерживать паузу, не торопить события." },
  { title: "Ответственный", description: "Готовность отвечать за свои действия, решения и их последствия." },
  { title: "Эмпатичный", description: "Умение чувствовать и понимать состояние других людей." },
  { title: "Инициативный", description: "Готовность начинать первым, предлагать и брать на себя задачи." },
  { title: "Настойчивый", description: "Способность доводить начатое до конца, несмотря на препятствия." },
  { title: "Доброжелательный", description: "Открытость и тёплое отношение к людям без условий." },
  { title: "Креативный", description: "Способность видеть нестандартные решения и создавать новое." },
  { title: "Харизматичный", description: "Магнетизм личности, способность увлекать и вдохновлять." },
  { title: "Привлекательный", description: "Внешняя и внутренняя притягательность для окружающих." },
  { title: "Трудолюбивый", description: "Любовь к качественному труду и способность работать долго и упорно." },
  { title: "Вдохновляющий", description: "Умение зажигать в других интерес, веру и желание действовать." },
  { title: "Благодарный", description: "Способность видеть и ценить то, что уже есть в жизни." },
  { title: "Радостный", description: "Способность находить и проживать радость в обычных моментах." },
  { title: "Женственная", description: "Мягкость, грация, чуткость и принимающая сила." },
  { title: "Исполнительный", description: "Точное и качественное выполнение того, о чём договорились." },
  { title: "Помогающий", description: "Готовность поддерживать и приходить на помощь другим." },
  { title: "Аккуратный", description: "Внимание к порядку и деталям во всём, что делаешь." },
  { title: "Амбициозный", description: "Стремление к большим целям и высоким результатам." },
  { title: "Бережливый", description: "Разумное и осознанное отношение к ресурсам и времени." },
  { title: "Бесстрашный", description: "Свобода от страха в моменте принятия решений и действия." },
  { title: "Богатый", description: "Изобилие во всех сферах: деньги, отношения, энергия, идеи." },
  { title: "Бодрый", description: "Свежесть, энергичность и лёгкость в теле и в мыслях." },
  { title: "Быстрый", description: "Скорость реакции, мышления и действия." },
  { title: "Великодушный", description: "Щедрость сердца, способность прощать и отдавать." },
  { title: "Весёлый", description: "Лёгкость, чувство юмора, способность радоваться." },
  { title: "Внимательный", description: "Глубокое присутствие и наблюдательность в каждом моменте." },
  { title: "Восприимчивый", description: "Открытость к новому опыту, идеям и обратной связи." },
  { title: "Всесторонний", description: "Развитие в разных сферах жизни одновременно." },
  { title: "Выносливый", description: "Способность выдерживать длительные нагрузки, не сдаваться." },
  { title: "Гармоничный", description: "Баланс между разными сторонами жизни и личности." },
  { title: "Глобальный", description: "Способность видеть картину целиком, мыслить масштабно." },
  { title: "Деятельный", description: "Постоянное движение, активность, действие вместо разговоров." },
  { title: "Добродушный", description: "Тёплая, мягкая открытость к людям и миру." },
  { title: "Дисциплинированный", description: "Способность жить по правилам, которые ты сам установил." },
  { title: "Дружелюбный", description: "Лёгкость в общении, открытость к новым контактам." },
  { title: "Жизнерадостный", description: "Глубокая радость от самого факта жизни." },
  { title: "Здоровый", description: "Сила, энергия и крепость тела и психики." },
  { title: "Искренний", description: "Совпадение того, что чувствуешь, говоришь и делаешь." },
  { title: "Мудрый", description: "Глубокое понимание жизни, людей и причинно-следственных связей." },
  { title: "Открытый", description: "Готовность встречать новое, людей и опыт без защит." },
  { title: "Позитивный", description: "Способность видеть возможности там, где другие видят проблемы." },
  { title: "Решительный", description: "Способность принимать решения быстро и брать ответственность." },
  { title: "Свободный", description: "Внутренняя независимость от мнений, страхов и обстоятельств." },
  { title: "Спокойный", description: "Внутренний покой и устойчивость в любых ситуациях." },
  { title: "Счастливый", description: "Глубокое внутреннее ощущение наполненности и радости." },
  { title: "Творческий", description: "Способность подходить к любому делу с оригинальностью." },
  { title: "Целеустремлённый", description: "Ясное движение к выбранной цели без отвлечений." },
];

const STORAGE_KEY = "qualities-v1";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateAdd(base: string, days: number) {
  const d = new Date(base + "T00:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(a: string, b: string) {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((db - da) / 86400000);
}

function loadQualities(): Quality[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Quality[];
  } catch {
    return [];
  }
}

function saveQualities(list: Quality[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Auto-mark missed past days as skip; on 3 consecutive skips reset tracker to day 1.
function reconcile(list: Quality[]): { list: Quality[]; resetTitles: string[] } {
  const today = todayStr();
  const resetTitles: string[] = [];
  const out: Quality[] = [];
  for (const q of list) {
    let updated: Quality = { ...q, marks: { ...q.marks } };
    // Loop in case multiple resets accumulated
    let safety = 0;
    while (safety++ < 10) {
      const total = daysBetween(updated.startDate, today);
      if (total < 0) break;
      // Mark all past days without marks as skip
      for (let i = 0; i < total; i++) {
        const d = dateAdd(updated.startDate, i);
        if (!updated.marks[d]) updated.marks[d] = "skip";
      }
      // Find first 3-in-a-row skip among past days (not today)
      let streak = 0;
      let resetAfter: string | null = null;
      for (let i = 0; i < total; i++) {
        const d = dateAdd(updated.startDate, i);
        if (updated.marks[d] === "skip") {
          streak++;
          if (streak >= 3) {
            resetAfter = d;
            break;
          }
        } else {
          streak = 0;
        }
      }
      if (resetAfter) {
        if (!resetTitles.includes(updated.title)) resetTitles.push(updated.title);
        // Reset: new start date is the day after the last skip in the triple
        const newStart = dateAdd(resetAfter, 1);
        updated = { ...updated, startDate: newStart, marks: {} };
        // continue while-loop in case more resets needed
      } else {
        break;
      }
    }
    out.push(updated);
  }
  return { list: out, resetTitles };
}

// ---------- Screen ----------

type View =
  | { name: "list" }
  | { name: "detail"; item: CatalogItem };

function QualitiesScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"mine" | "catalog">("mine");
  const [qualities, setQualities] = useState<Quality[]>([]);
  const [view, setView] = useState<View>({ name: "list" });
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const raw = loadQualities();
    const { list, resetTitles } = reconcile(raw);
    if (resetTitles.length > 0) {
      saveQualities(list);
      setNotice(
        `Качество "${resetTitles[0]}" обнулено — 3 пропуска подряд. Начинаешь с дня 1.`,
      );
    } else if (JSON.stringify(raw) !== JSON.stringify(list)) {
      saveQualities(list);
    }
    setQualities(list);
  }, []);

  const updateQualities = (updater: (prev: Quality[]) => Quality[]) => {
    setQualities((prev) => {
      const next = updater(prev);
      saveQualities(next);
      return next;
    });
  };

  const activate = (title: string, pose: string, description?: string) => {
    const q: Quality = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      description,
      pose,
      startDate: todayStr(),
      marks: {},
    };
    updateQualities((prev) => [...prev, q]);
    setTab("mine");
    setView({ name: "list" });
  };

  if (view.name === "detail") {
    return (
      <DetailScreen
        item={view.item}
        onBack={() => setView({ name: "list" })}
        onActivate={(pose) => activate(view.item.title, pose, view.item.description)}
      />
    );
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex items-center px-3 pt-2 pb-2">
        <button
          onClick={() => navigate({ to: "/sections" })}
          className="tap inline-flex items-center gap-1 text-[14px] text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Назад
        </button>
        <h1 className="flex-1 text-center text-[16px] font-semibold">Качества характера</h1>
        <div className="w-[64px]" />
      </div>

      {/* Tabs */}
      <div
        className="mx-4 mb-4 grid grid-cols-2 rounded-[12px] p-1"
        style={{ background: "#f0ebe2" }}
      >
        {(["mine", "catalog"] as const).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="tap rounded-[10px] py-2 text-[13px] font-medium transition-colors"
              style={
                active
                  ? { background: "linear-gradient(135deg, #FFB300, #FF6D00)", color: "#fff" }
                  : { color: "#7a6f5e" }
              }
            >
              {t === "mine" ? "Мои качества" : "Каталог"}
            </button>
          );
        })}
      </div>

      {notice && (
        <div
          className="mx-4 mb-3 rounded-[12px] border px-3 py-2 text-[12px]"
          style={{ background: "#fff3e0", borderColor: "#FFB300", color: "#92400e" }}
        >
          {notice}
          <button className="ml-2 underline" onClick={() => setNotice(null)}>
            ок
          </button>
        </div>
      )}

      {tab === "mine" ? (
        <MineTab
          qualities={qualities}
          onMarkToday={(id) =>
            updateQualities((prev) =>
              prev.map((q) =>
                q.id === id ? { ...q, marks: { ...q.marks, [todayStr()]: "done" } } : q,
              ),
            )
          }
          onDelete={(id) => updateQualities((prev) => prev.filter((q) => q.id !== id))}
          onEdit={(id, patch) =>
            updateQualities((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)))
          }
          onGoCatalog={() => setTab("catalog")}
        />
      ) : (
        <CatalogTab onPick={(item) => setView({ name: "detail", item })} />
      )}
    </div>
  );
}

// ---------- Mine Tab ----------

function MineTab({
  qualities,
  onMarkToday,
  onDelete,
  onEdit,
  onGoCatalog,
}: {
  qualities: Quality[];
  onMarkToday: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, patch: Partial<Quality>) => void;
  onGoCatalog: () => void;
}) {
  return (
    <div className="px-4 space-y-3">
      {qualities.length === 0 && (
        <p className="text-center text-[13px] text-muted-foreground py-6">
          Пока нет активных качеств. Открой каталог и выбери первое.
        </p>
      )}

      {qualities.map((q) => (
        <QualityCard
          key={q.id}
          quality={q}
          onMarkToday={() => onMarkToday(q.id)}
          onDelete={() => onDelete(q.id)}
          onEdit={(patch) => onEdit(q.id, patch)}
        />
      ))}

      <button
        onClick={onGoCatalog}
        className="tap w-full rounded-[14px] py-[14px] text-[14px] font-medium"
        style={{ border: "1.5px dashed #FF6D00", color: "#FF6D00" }}
      >
        ＋ Добавить качество
      </button>
    </div>
  );
}

function QualityCard({
  quality,
  onMarkToday,
  onDelete,
  onEdit,
}: {
  quality: Quality;
  onMarkToday: () => void;
  onDelete: () => void;
  onEdit: (patch: Partial<Quality>) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [eTitle, setETitle] = useState(quality.title);
  const [eDesc, setEDesc] = useState(quality.description ?? "");
  const [ePose, setEPose] = useState(quality.pose);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const today = todayStr();
  const dayNumber = daysBetween(quality.startDate, today) + 1;
  const totalCircles = Math.max(dayNumber + 7, 30);

  const circles = useMemo(() => {
    const arr: { n: number; date: string; state: "done" | "skip" | "today" | "future" }[] = [];
    for (let i = 0; i < totalCircles; i++) {
      const date = dateAdd(quality.startDate, i);
      const cmp = daysBetween(date, today);
      let state: "done" | "skip" | "today" | "future";
      if (cmp > 0) state = quality.marks[date] === "done" ? "done" : "skip";
      else if (cmp === 0) state = quality.marks[date] === "done" ? "done" : "today";
      else state = "future";
      arr.push({ n: i + 1, date, state });
    }
    return arr;
  }, [quality, today, totalCircles]);

  const colorFor = (s: "done" | "skip" | "today" | "future") => {
    switch (s) {
      case "done": return { bg: "#16a34a", color: "#fff" };
      case "skip": return { bg: "#ef4444", color: "#fff" };
      case "today": return { bg: "#FFB300", color: "#fff" };
      case "future": return { bg: "#e5e7eb", color: "#9ca3af" };
    }
  };

  if (editing) {
    const valid =
      eTitle.trim().length >= 3 && eDesc.trim().length >= 3 && ePose.trim().length >= 3;
    return (
      <EditScreenInline
        title={eTitle}
        description={eDesc}
        pose={ePose}
        onTitle={setETitle}
        onDesc={setEDesc}
        onPose={setEPose}
        canSave={valid}
        onCancel={() => {
          setETitle(quality.title);
          setEDesc(quality.description ?? "");
          setEPose(quality.pose);
          setEditing(false);
        }}
        onSave={() => {
          onEdit({
            title: eTitle.trim(),
            description: eDesc.trim(),
            pose: ePose.trim(),
          });
          setEditing(false);
        }}
      />
    );
  }

  return (
    <div
      className="relative rounded-[16px] bg-white"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)", padding: 16 }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[16px] font-bold leading-tight truncate flex-1">{quality.title}</h3>
        <span className="text-[12px]" style={{ color: "#8a8a8a" }}>
          День {dayNumber}
        </span>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="tap -mt-1 -mr-1 px-1"
            style={{ color: "#8a8a8a" }}
            aria-label="Меню"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-10 w-40 rounded-lg bg-white py-1 text-[13px] shadow-lg border border-[#ede8df]">
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[#faf7f1]"
                onClick={() => {
                  setMenuOpen(false);
                  setEditing(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" /> Изменить
              </button>
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-[#faf7f1]"
                onClick={() => {
                  setMenuOpen(false);
                  if (
                    typeof window !== "undefined" &&
                    window.confirm(`Удалить качество «${quality.title}»?`)
                  ) {
                    onDelete();
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Удалить
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="mt-1 text-[12px] italic" style={{ color: "#8a8a8a" }}>
        {quality.pose}
      </p>

      <div className="mt-3 flex flex-wrap" style={{ gap: 5 }}>
        {circles.map((c) => {
          const col = colorFor(c.state);
          const clickable = c.state === "today";
          return (
            <button
              key={c.n}
              disabled={!clickable}
              onClick={clickable ? onMarkToday : undefined}
              className="flex items-center justify-center text-[11px] font-medium select-none"
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: col.bg,
                color: col.color,
                cursor: clickable ? "pointer" : "default",
              }}
            >
              {c.n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Inline edit form rendered in place of the card
function EditScreenInline({
  title,
  description,
  pose,
  onTitle,
  onDesc,
  onPose,
  canSave,
  onCancel,
  onSave,
}: {
  title: string;
  description: string;
  pose: string;
  onTitle: (v: string) => void;
  onDesc: (v: string) => void;
  onPose: (v: string) => void;
  canSave: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  const inputStyle: React.CSSProperties = {
    border: "1.5px solid #ede8df",
    borderRadius: 12,
  };
  return (
    <div
      className="rounded-[16px] bg-white"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)", padding: 16 }}
    >
      <div className="flex items-center mb-3">
        <button
          onClick={onCancel}
          className="tap inline-flex items-center gap-1 text-[13px] text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Назад
        </button>
        <h3 className="flex-1 text-center text-[15px] font-semibold">Изменить качество</h3>
        <div className="w-[60px]" />
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-[12px] font-medium text-muted-foreground">Название</label>
          <input
            value={title}
            maxLength={100}
            onChange={(e) => onTitle(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-[14px] outline-none focus:border-[#FF6D00]"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="text-[12px] font-medium text-muted-foreground">Описание</label>
          <textarea
            value={description}
            onChange={(e) => onDesc(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-[13px] outline-none focus:border-[#FF6D00]"
            style={{ ...inputStyle, minHeight: 80 }}
          />
        </div>
        <div>
          <label className="text-[12px] font-medium text-muted-foreground">Поза</label>
          <p className="mt-1 text-[12px]" style={{ color: "#555", lineHeight: 1.6 }}>
            Представь, что ты уже обладаешь этим качеством. Как бы выглядело твоё тело? Как бы ты
            стоял? Где твои руки, ноги, взгляд?
          </p>
          <p className="mt-1 text-[11px] italic" style={{ color: "#8a8a8a", lineHeight: 1.5 }}>
            Пример «Уверенность»: ноги на ширине плеч, плечи расправлены, грудь открыта, подбородок
            слегка приподнят, взгляд прямой и спокойный.
          </p>
          <textarea
            value={pose}
            onChange={(e) => onPose(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-[13px] outline-none focus:border-[#FF6D00]"
            style={{ ...inputStyle, minHeight: 80 }}
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            disabled={!canSave}
            onClick={onSave}
            className="tap flex-1 rounded-[12px] py-2.5 text-[13px] font-semibold"
            style={
              canSave
                ? { background: "linear-gradient(135deg, #FFB300, #FF6D00)", color: "#fff" }
                : { background: "#e5e7eb", color: "#9ca3af" }
            }
          >
            ✅ Сохранить
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-[12px] border border-[#ede8df] py-2.5 text-[13px]"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Catalog Tab ----------

function CatalogTab({ onPick }: { onPick: (item: CatalogItem) => void }) {
  return (
    <div className="px-4 space-y-2">
      {CATALOG.map((item) => (
        <button
          key={item.title}
          onClick={() => onPick(item)}
          className="tap block w-full rounded-[14px] bg-white p-3 text-left"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
        >
          <h4 className="text-[15px] font-semibold leading-tight">{item.title}</h4>
          <p
            className="mt-1 text-[12px] leading-snug line-clamp-2"
            style={{ color: "#8a8a8a" }}
          >
            {item.description}
          </p>
        </button>
      ))}
    </div>
  );
}

// ---------- Detail screen ----------

function DetailScreen({
  item,
  onBack,
  onActivate,
}: {
  item: CatalogItem;
  onBack: () => void;
  onActivate: (pose: string) => void;
}) {
  const [pose, setPose] = useState("");
  const valid = pose.trim().length >= 10;

  return (
    <div className="pb-8">
      <div className="flex items-center px-3 pt-2 pb-2">
        <button
          onClick={onBack}
          className="tap inline-flex items-center gap-1 text-[14px] text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Назад
        </button>
        <h1 className="flex-1 text-center text-[16px] font-semibold truncate px-2">
          {item.title}
        </h1>
        <div className="w-[64px]" />
      </div>

      <div className="px-4 space-y-4">
        <p className="text-[14px]" style={{ color: "#555", lineHeight: 1.7 }}>
          {item.description}
        </p>

        <div
          className="rounded-[16px] bg-white p-4"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
        >
          <p className="text-[11px] uppercase tracking-wider" style={{ color: "#8a8a8a" }}>
            ПОЗА КАЧЕСТВА
          </p>
          <p className="mt-2 text-[13px]" style={{ color: "#555", lineHeight: 1.6 }}>
            Представь, что ты уже обладаешь этим качеством. Как бы выглядело твоё тело? Как бы ты
            стоял? Где твои руки, ноги, взгляд? Опиши подробно, чтобы вставая в эту позу, ты
            чувствовал в себе силу этого качества.
          </p>
          <div className="mt-3 space-y-2">
            <p className="text-[12px] italic" style={{ color: "#8a8a8a", lineHeight: 1.6 }}>
              Пример для качества «Уверенность»: Я стою, расставив ноги на ширину плеч, плечи
              расправлены, грудь открыта, подбородок слегка приподнят. Руки свободно опущены вниз,
              ладони развернуты вперёд, а взгляд устремлён прямо — твёрдый и спокойный.
            </p>
            <p className="text-[12px] italic" style={{ color: "#8a8a8a", lineHeight: 1.6 }}>
              Пример для качества «Спокойствие»: Я стою, поставив ноги параллельно и ближе друг к
              другу. Руки свободно опущены вдоль тела, плечи расслаблены, дыхание глубокое и ровное,
              взгляд мягкий, слегка направлен вниз, а выражение лица спокойное и умиротворённое.
            </p>
          </div>

          <textarea
            value={pose}
            onChange={(e) => setPose(e.target.value)}
            placeholder="Опиши свою позу для этого качества..."
            className="mt-3 w-full rounded-[12px] px-3 py-2 text-[13px] outline-none focus:border-[#FF6D00]"
            style={{ border: "1.5px solid #ede8df", minHeight: 80 }}
          />
        </div>

        <button
          disabled={!valid}
          onClick={() => onActivate(pose.trim())}
          className="tap w-full rounded-[14px] py-3 text-[14px] font-semibold"
          style={
            valid
              ? { background: "linear-gradient(135deg, #FFB300, #FF6D00)", color: "#fff" }
              : { background: "#e5e7eb", color: "#9ca3af" }
          }
        >
          ⭐ Активировать качество
        </button>
      </div>
    </div>
  );
}
