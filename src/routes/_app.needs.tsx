import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, MoreHorizontal, Trash2 } from "lucide-react";
import { BackButton } from "@/components/layout/BackButton";
export const Route = createFileRoute("/_app/needs")({
  head: () => ({
    meta: [
      { title: "Потребности — Клуб «Моя жизнь»" },
      { name: "description", content: "Оценка и развитие основных потребностей." },
    ],
  }),
  component: NeedsScreen,
});

// ---------- Data ----------

type Rating = "sleeping" | "0" | "1" | "2" | "3" | "4"; // 6 levels in spec order

const RATINGS: { key: Rating; color: string; emoji: string; label: string }[] = [
  { key: "sleeping", color: "#1a1a1a", emoji: "⚫️", label: "Спящая потребность: для меня неактуальна, я её не ощущаю" },
  { key: "0", color: "#ef4444", emoji: "🔴", label: "Полностью не удовлетворена (0–10%)" },
  { key: "1", color: "#92400e", emoji: "🟤", label: "Удовлетворена минимально (10–30%)" },
  { key: "2", color: "#f97316", emoji: "🟠", label: "Удовлетворена частично (30–60%)" },
  { key: "3", color: "#facc15", emoji: "🟡", label: "Почти удовлетворена (70–80%)" },
  { key: "4", color: "#16a34a", emoji: "🟢", label: "Полностью удовлетворена (90–100%)" },
];

interface NeedDef {
  id: string;
  title: string;
  description: string;
  custom?: boolean;
}

const BUILT_IN: NeedDef[] = [
  {
    id: "transcendent",
    title: "Трансцендентные потребности",
    description:
      "Стремление выйти за пределы собственного «я» — соприкоснуться с чем-то бо́льшим: истиной, единством, вселенной. Проявляется как поиск смысла, переживание сопричастности, желание оставить след, выходящий за рамки личной жизни.",
  },
  {
    id: "service",
    title: "Потребность в служении",
    description:
      "Желание приносить пользу другим людям, делу, миру. Это не жертва, а потребность чувствовать, что твоя деятельность кому-то по-настоящему важна и меняет что-то к лучшему.",
  },
  {
    id: "spiritual",
    title: "Духовные потребности",
    description:
      "Поиск смысла жизни, связи с собой, с людьми, с большим целым. Внутренние практики, ценности, ритуалы, которые наполняют жизнь глубиной.",
  },
  {
    id: "self-actualization",
    title: "Потребность в самореализации",
    description:
      "Раскрытие своего потенциала: реализовать таланты, развить способности, делать то, для чего ты создан. Жить свою жизнь, а не чужую.",
  },
  {
    id: "aesthetic",
    title: "Эстетические потребности",
    description:
      "Потребность в красоте, гармонии, форме. Любовь к искусству, природе, эстетике быта. Желание окружать себя тем, что радует глаз и душу.",
  },
  {
    id: "freedom",
    title: "Потребность в свободе и автономии",
    description:
      "Возможность самому принимать решения, распоряжаться временем, выбирать, как жить. Свобода от внешнего контроля и навязанных ролей.",
  },
  {
    id: "respect",
    title: "Потребность в уважении и признании",
    description:
      "Быть замеченным, оценённым, услышанным. Получать обратную связь о ценности того, что ты делаешь и кто ты есть.",
  },
  {
    id: "mastery",
    title: "Потребность в мастерстве",
    description:
      "Углубление в выбранное дело: становиться лучше, точнее, искуснее. Радость от качественно сделанной работы и роста собственных компетенций.",
  },
  {
    id: "fun",
    title: "Потребность в развлечении",
    description:
      "Игра, удовольствие, лёгкость, смех, новые впечатления. То, что наполняет жизнь радостью и помогает восстанавливаться.",
  },
  {
    id: "info",
    title: "Информационные потребности",
    description:
      "Любознательность, желание узнавать новое, понимать как устроен мир. Потребность учиться, читать, исследовать.",
  },
  {
    id: "social",
    title: "Социальные потребности",
    description:
      "Близкие связи, дружба, любовь, принадлежность к группе. Чувствовать что ты не один, что тебя понимают и принимают.",
  },
  {
    id: "safety",
    title: "Потребность в безопасности",
    description:
      "Стабильность, предсказуемость, защищённость. Уверенность в завтрашнем дне — финансовая, физическая, эмоциональная.",
  },
  {
    id: "sexual",
    title: "Сексуальные потребности",
    description:
      "Близость, телесный контакт, сексуальная реализация. Принятие своей сексуальности и здоровое её выражение.",
  },
  {
    id: "physiological",
    title: "Физиологические потребности",
    description:
      "Базовые потребности тела: сон, еда, вода, движение, отдых, здоровье. Фундамент, без которого всё остальное даётся тяжело.",
  },
];

const RATINGS_KEY = "needs-ratings-v1";
const CUSTOM_KEY = "needs-custom-v1";

function loadRatings(): Record<string, Rating> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(RATINGS_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveRatings(r: Record<string, Rating>) {
  localStorage.setItem(RATINGS_KEY, JSON.stringify(r));
}
function loadCustom(): NeedDef[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveCustom(list: NeedDef[]) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
}

// ---------- Screen ----------

type View =
  | { name: "list" }
  | { name: "detail"; need: NeedDef }
  | { name: "create" };

function NeedsScreen() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>({ name: "list" });
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [custom, setCustom] = useState<NeedDef[]>([]);

  useEffect(() => {
    setRatings(loadRatings());
    setCustom(loadCustom());
  }, []);

  const setRating = (id: string, r: Rating) => {
    setRatings((prev) => {
      const next = { ...prev, [id]: r };
      saveRatings(next);
      return next;
    });
  };

  const addCustom = (title: string, description: string) => {
    const item: NeedDef = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      description,
      custom: true,
    };
    setCustom((prev) => {
      const next = [...prev, item];
      saveCustom(next);
      return next;
    });
    setView({ name: "list" });
  };

  const removeCustom = (id: string) => {
    setCustom((prev) => {
      const next = prev.filter((n) => n.id !== id);
      saveCustom(next);
      return next;
    });
    setRatings((prev) => {
      const { [id]: _, ...rest } = prev;
      saveRatings(rest);
      return rest;
    });
  };

  if (view.name === "detail") {
    return (
      <DetailScreen
        need={view.need}
        rating={ratings[view.need.id]}
        onBack={() => setView({ name: "list" })}
        onPick={(r) => {
          setRating(view.need.id, r);
          setView({ name: "list" });
        }}
      />
    );
  }

  if (view.name === "create") {
    return (
      <CreateScreen
        onBack={() => setView({ name: "list" })}
        onSave={(title, description) => addCustom(title, description)}
      />
    );
  }

  const all: NeedDef[] = [...BUILT_IN, ...custom];

  return (
    <div className="pb-6">
      <div className="flex items-center px-3 pt-2 pb-2">
        <BackButton onClick={() => navigate({ to: "/sections" })} />
        <h1 className="flex-1 text-center text-[16px] font-semibold">Потребности</h1>
        <div className="w-[64px]" />
      </div>

      <div className="px-4 space-y-2">
        {all.map((need) => (
          <NeedRow
            key={need.id}
            need={need}
            rating={ratings[need.id]}
            onOpen={() => setView({ name: "detail", need })}
            onDelete={need.custom ? () => removeCustom(need.id) : undefined}
          />
        ))}

        <button
          onClick={() => setView({ name: "create" })}
          className="tap mt-3 w-full rounded-[14px] py-[14px] text-[14px] font-medium"
          style={{ border: "1.5px dashed #FF6D00", color: "#FF6D00" }}
        >
          ＋ Добавить свою потребность
        </button>
      </div>

    </div>
  );
}

function NeedRow({
  need,
  rating,
  onOpen,
  onDelete,
}: {
  need: NeedDef;
  rating?: Rating;
  onOpen: () => void;
  onDelete?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const ratingDef = rating ? RATINGS.find((r) => r.key === rating) : undefined;

  return (
    <div
      className="relative rounded-[14px] bg-white"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
    >
      <button
        onClick={onOpen}
        className="tap flex w-full items-center gap-3 text-left"
        style={{ padding: "14px 16px" }}
      >
        {ratingDef ? (
          <span
            className="shrink-0 leading-none"
            style={{
              fontSize: 20,
              fontFamily:
                '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif',
            }}
            aria-label={ratingDef.label}
          >
            {ratingDef.emoji}
          </span>
        ) : (
          <span
            className="shrink-0"
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: "1.5px dashed #d4cfc4",
              background: "transparent",
            }}
          />
        )}
        <span
          className="flex-1 truncate"
          style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}
        >
          {need.title}
        </span>
        {onDelete ? (
          <span ref={menuRef} className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="tap p-1"
              style={{ color: "#8a8a8a" }}
              aria-label="Меню"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-10 w-36 rounded-lg bg-white py-1 text-[13px] shadow-lg border border-[#ede8df]">
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-[#faf7f1]"
                  onClick={() => {
                    setMenuOpen(false);
                    if (
                      typeof window !== "undefined" &&
                      window.confirm(`Удалить потребность «${need.title}»?`)
                    )
                      onDelete();
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Удалить
                </button>
              </div>
            )}
          </span>
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>
    </div>
  );
}

// ---------- Detail ----------

function DetailScreen({
  need,
  rating,
  onBack,
  onPick,
}: {
  need: NeedDef;
  rating?: Rating;
  onBack: () => void;
  onPick: (r: Rating) => void;
}) {
  return (
    <div className="pb-8">
      <div className="flex items-center px-3 pt-2 pb-2">
        <BackButton onClick={onBack} />
        <h1 className="flex-1 text-center text-[16px] font-semibold truncate px-2">
          {need.title}
        </h1>
        <div className="w-[64px]" />
      </div>

      <div className="px-4 space-y-4">
        <p className="text-[14px]" style={{ color: "#555", lineHeight: 1.7 }}>
          {need.description}
        </p>

        <div
          className="rounded-[12px]"
          style={{ background: "#FAF6EF", padding: "12px 14px", fontSize: 13, lineHeight: 1.8 }}
        >
          <div>⚫ — Спящая потребность: для меня неактуальна, я её не ощущаю</div>
          <div>🔴 — Потребность полностью не удовлетворена (0–10%)</div>
          <div>🟤 — Потребность удовлетворена минимально (10–30%)</div>
          <div>🟠 — Потребность удовлетворена частично (30–60%)</div>
          <div>🟡 — Потребность почти удовлетворена (70–80%)</div>
          <div>🟢 — Потребность полностью удовлетворена (90–100%)</div>
        </div>

        <p className="text-[13px]" style={{ color: "#8a8a8a" }}>
          Выберите, какой у вас уровень удовлетворения этой потребности
        </p>

        <div className="flex gap-2">
          {RATINGS.map((r) => {
            const selected = rating === r.key;
            return (
              <button
                key={r.key}
                onClick={() => onPick(r.key)}
                className="tap flex-1"
                style={{
                  height: 48,
                  borderRadius: 10,
                  background: selected ? `${r.color}33` : r.color,
                  border: selected ? `3px solid ${r.color}` : "3px solid transparent",
                }}
                aria-label={r.label}
                title={r.label}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- Create ----------

function CreateScreen({
  onBack,
  onSave,
}: {
  onBack: () => void;
  onSave: (title: string, description: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const valid = title.trim().length >= 3 && description.trim().length >= 3;

  const inputStyle: React.CSSProperties = {
    border: "1.5px solid #ede8df",
    borderRadius: 12,
  };

  return (
    <div className="pb-8">
      <div className="flex items-center px-3 pt-2 pb-2">
        <BackButton onClick={onBack} />
        <h1 className="flex-1 text-center text-[16px] font-semibold">Своя потребность</h1>
        <div className="w-[64px]" />
      </div>

      <div className="px-4 space-y-3">
        <div>
          <label className="text-[12px] font-medium text-muted-foreground">Название</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Потребность в творчестве"
            className="mt-1 w-full px-3 py-2 text-[14px] outline-none focus:border-[#FF6D00]"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="text-[12px] font-medium text-muted-foreground">Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опиши что это за потребность и почему она важна для тебя..."
            className="mt-1 w-full px-3 py-2 text-[13px] outline-none focus:border-[#FF6D00]"
            style={{ ...inputStyle, minHeight: 80 }}
          />
        </div>

        <button
          disabled={!valid}
          onClick={() => onSave(title.trim(), description.trim())}
          className="tap mt-2 w-full rounded-[14px] py-3 text-[14px] font-semibold"
          style={
            valid
              ? { background: "linear-gradient(135deg, #FFB300, #FF6D00)", color: "#fff" }
              : { background: "#e5e7eb", color: "#9ca3af" }
          }
        >
          ✅ Добавить потребность
        </button>
      </div>
    </div>
  );
}
