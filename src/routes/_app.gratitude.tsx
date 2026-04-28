import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BackButton } from "@/components/layout/BackButton";

export const Route = createFileRoute("/_app/gratitude")({
  head: () => ({
    meta: [
      { title: "Дневник благодарности — Клуб «Моя жизнь»" },
      { name: "description", content: "Благодарности дня, особые благодарности и золотые моменты." },
    ],
  }),
  component: GratitudeScreen,
});

// ---------- Storage ----------

type Category = "daily" | "special" | "golden";

interface Entry {
  id: string;
  ts: number; // creation time
  date: string; // YYYY-MM-DD (local)
  text: string;
}

type Store = Record<Category, Entry[]>;

const STORAGE_KEY = "gratitude-v1";

function emptyStore(): Store {
  return { daily: [], special: [], golden: [] };
}

function loadStore(): Store {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw);
    return {
      daily: Array.isArray(parsed?.daily) ? parsed.daily : [],
      special: Array.isArray(parsed?.special) ? parsed.special : [],
      golden: Array.isArray(parsed?.golden) ? parsed.golden : [],
    };
  } catch {
    return emptyStore();
  }
}

function saveStore(s: Store) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function newId() {
  return `g_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function todayStr(): string {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function fmtDate(s: string): string {
  const [yy, mm, dd] = s.split("-");
  return `${dd}.${mm}.${yy}`;
}

// ---------- Screens ----------

type Screen =
  | { name: "main" }
  | { name: "category"; cat: Category }
  | { name: "add"; cat: Category }
  | { name: "history"; cat: Category };

const CAT_TITLES: Record<Category, string> = {
  daily: "Благодарности дня",
  special: "Особые благодарности",
  golden: "Золотые моменты",
};

function GratitudeScreen() {
  const navigate = useNavigate();
  const [store, setStore] = useState<Store>(emptyStore());
  const [screen, setScreen] = useState<Screen>({ name: "main" });

  useEffect(() => {
    setStore(loadStore());
  }, []);

  function update(next: Store) {
    setStore(next);
    saveStore(next);
  }

  function addEntry(cat: Category, text: string) {
    const e: Entry = { id: newId(), ts: Date.now(), date: todayStr(), text: text.trim() };
    update({ ...store, [cat]: [...store[cat], e] });
  }

  function patchEntry(cat: Category, id: string, text: string) {
    update({ ...store, [cat]: store[cat].map((e) => (e.id === id ? { ...e, text: text.trim() } : e)) });
  }

  if (screen.name === "category") {
    return (
      <CategoryScreen
        cat={screen.cat}
        store={store}
        onBack={() => setScreen({ name: "main" })}
        onAdd={() => setScreen({ name: "add", cat: screen.cat })}
        onHistory={() => setScreen({ name: "history", cat: screen.cat })}
      />
    );
  }
  if (screen.name === "add") {
    return (
      <AddScreen
        cat={screen.cat}
        store={store}
        onBack={() => setScreen({ name: "category", cat: screen.cat })}
        onSave={(t) => addEntry(screen.cat, t)}
      />
    );
  }
  if (screen.name === "history") {
    return (
      <HistoryScreen
        cat={screen.cat}
        store={store}
        onBack={() => setScreen({ name: "category", cat: screen.cat })}
        onPatch={(id, t) => patchEntry(screen.cat, id, t)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Header title="Дневник благодарности" onBack={() => navigate({ to: "/sections" })} />
      <div className="px-4 pb-32 pt-6">
        <div className="mb-4 text-[14px] text-[#8a8a8a]">Выберите вид благодарностей:</div>
        <div className="flex flex-col gap-3">
          <button
            className="rounded-[14px] py-[15px] text-[15px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
            onClick={() => setScreen({ name: "category", cat: "daily" })}
          >
            🌟 Благодарности дня
          </button>
          <button
            className="rounded-[14px] py-[15px] text-[15px] font-semibold"
            style={{ border: "1.5px solid #FF6D00", color: "#FF6D00" }}
            onClick={() => setScreen({ name: "category", cat: "special" })}
          >
            ⭐ Особые благодарности
          </button>
          <button
            className="rounded-[14px] py-[15px] text-[15px] font-semibold"
            style={{ border: "1.5px solid #FF6D00", color: "#FF6D00" }}
            onClick={() => setScreen({ name: "category", cat: "golden" })}
          >
            🏆 Золотые моменты
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Header ----------

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 bg-white px-3 py-3">
      <BackButton onClick={onBack} />
      <div className="text-[15px] font-semibold text-[#1a1a1a]">{title}</div>
      <div className="w-[70px]" />
    </div>
  );
}

// ---------- Category Screen ----------

const INFO_TEXT: Record<Category, string | null> = {
  daily: null,
  special:
    "Эта категория для записи ОСОБЫХ благодарностей. Здесь вы можете отмечать:\n✔ Поворотные моменты, изменившие ваш путь\n✔ Особо ценные достижения, которые вызывают гордость\n✔ Важнейшие события, оказавшие глубокое влияние\n✔ Фундаментальные открытия о себе и мире\n✔ Решающие встречи и знакомства",
  golden:
    "Золотые моменты — это редкие мгновения от которых захватывает дух. Те моменты, которые запоминаются на всю жизнь. Важно их фиксировать и сохранять.",
};

function CategoryScreen({
  cat,
  store,
  onBack,
  onAdd,
  onHistory,
}: {
  cat: Category;
  store: Store;
  onBack: () => void;
  onAdd: () => void;
  onHistory: () => void;
}) {
  const todayCount = useMemo(
    () => store[cat].filter((e) => e.date === todayStr()).length,
    [store, cat],
  );
  const dailyFull = cat === "daily" && todayCount >= 3;
  const addLabel =
    cat === "daily"
      ? "Добавить благодарности дня"
      : cat === "special"
        ? "Добавить особую благодарность"
        : "Добавить золотой момент";
  const historyLabel =
    cat === "daily"
      ? "Посмотреть все благодарности"
      : cat === "special"
        ? "Посмотреть особые благодарности"
        : "Посмотреть золотые моменты";

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Header title={CAT_TITLES[cat]} onBack={onBack} />
      <div className="px-4 pb-32 pt-4">
        {INFO_TEXT[cat] && (
          <div
            className="mb-4 whitespace-pre-line rounded-[12px] px-3.5 py-3 text-[13px] leading-[1.6]"
            style={{ background: "#fff3e0", color: "#92400e" }}
          >
            {INFO_TEXT[cat]}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            disabled={dailyFull}
            onClick={onAdd}
            className="rounded-[14px] py-[15px] text-[15px] font-bold disabled:opacity-60"
            style={
              dailyFull
                ? { background: "#e5e7eb", color: "#9ca3af" }
                : { background: "linear-gradient(135deg, #FFB300, #FF6D00)", color: "#fff" }
            }
          >
            {dailyFull ? "Сегодня уже добавлено 3 благодарности" : addLabel}
          </button>
          <button
            onClick={onHistory}
            className="rounded-[14px] py-[15px] text-[15px] font-semibold"
            style={{ border: "1.5px solid #FF6D00", color: "#FF6D00" }}
          >
            {historyLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Add Screen ----------

const PROMPTS = ["первую", "вторую", "третью"];

function AddScreen({
  cat,
  store,
  onBack,
  onSave,
}: {
  cat: Category;
  store: Store;
  onBack: () => void;
  onSave: (text: string) => void;
}) {
  const isDaily = cat === "daily";
  const maxLen = isDaily ? 200 : 500;
  const minH = isDaily ? 80 : 120;

  const todayCount = store[cat].filter((e) => e.date === todayStr()).length;
  // For daily: how many slots already filled (after re-renders due to onSave)
  const slotsFilled = isDaily ? todayCount : 0;

  const [text, setText] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  const placeholder = isDaily
    ? `Напишите ${PROMPTS[Math.min(slotsFilled, 2)]} благодарность...`
    : cat === "special"
      ? "Опишите эту особую благодарность..."
      : "Опишите этот золотой момент...";

  const canSave = text.trim().length >= 1;
  const dailyFull = isDaily && slotsFilled >= 3;

  function handleSave() {
    if (!canSave) return;
    onSave(text);
    setText("");
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Header title={CAT_TITLES[cat]} onBack={onBack} />
      <div className="px-4 pb-32 pt-4">
        {isDaily && (
          <div
            className="mb-4 rounded-[12px] px-3.5 py-3 text-[14px] font-semibold text-[#1a1a1a]"
            style={{ background: "#fff3e0" }}
          >
            За что я благодарен сегодня?
          </div>
        )}

        {/* Already filled today (daily) */}
        {isDaily && slotsFilled > 0 && (
          <div className="mb-4 flex flex-col gap-2">
            {store[cat]
              .filter((e) => e.date === todayStr())
              .map((e, i) => (
                <div
                  key={e.id}
                  className="rounded-[12px] bg-white px-4 py-3 text-[14px] leading-[1.6] text-[#1a1a1a]"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                >
                  <span className="mr-2 font-bold text-[#FF6D00]">{i + 1}.</span>
                  {e.text}
                </div>
              ))}
          </div>
        )}

        {dailyFull ? (
          <div
            className="rounded-[12px] bg-white px-4 py-4 text-center text-[14px] text-[#555]"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            Список заполнен. Можно добавить до трёх благодарностей за один день.
          </div>
        ) : (
          <>
            <div
              className="mb-3 rounded-[14px] bg-white"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, maxLen))}
                placeholder={placeholder}
                maxLength={maxLen}
                className="w-full resize-none rounded-[14px] bg-transparent px-4 py-3.5 text-[14px] leading-[1.7] text-[#1a1a1a] outline-none"
                style={{ minHeight: minH }}
              />
              <div
                className="flex items-center justify-end px-4 py-2 text-[12px] text-[#8a8a8a]"
                style={{ borderTop: "1px solid #ede8df" }}
              >
                {text.length} / {maxLen}
              </div>
            </div>

            <button
              disabled={!canSave}
              onClick={handleSave}
              className="w-full rounded-[14px] py-3.5 text-[15px] font-bold"
              style={
                canSave
                  ? { background: "linear-gradient(135deg, #FFB300, #FF6D00)", color: "#fff" }
                  : { background: "#e5e7eb", color: "#9ca3af" }
              }
            >
              ✅ Сохранить
            </button>
          </>
        )}

        {savedFlash && (
          <div
            className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-[12px] px-5 py-3 text-[14px] font-semibold text-white shadow-lg"
            style={{ background: "#16a34a" }}
          >
            ✅ Сохранено
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- History Screen ----------

function HistoryScreen({
  cat,
  store,
  onBack,
  onPatch,
}: {
  cat: Category;
  store: Store;
  onBack: () => void;
  onPatch: (id: string, text: string) => void;
}) {
  const maxLen = cat === "daily" ? 200 : 500;
  const grouped = useMemo(() => {
    const map: Record<string, Entry[]> = {};
    for (const e of store[cat]) {
      (map[e.date] ||= []).push(e);
    }
    return Object.entries(map)
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, list]) => ({
        date,
        list: [...list].sort((a, b) => a.ts - b.ts),
      }));
  }, [store, cat]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function startEdit(e: Entry) {
    setEditingId(e.id);
    setDraft(e.text);
  }
  function commitEdit() {
    if (editingId && draft.trim().length >= 1) {
      onPatch(editingId, draft);
    }
    setEditingId(null);
    setDraft("");
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Header title={CAT_TITLES[cat]} onBack={onBack} />
      <div className="px-4 pb-32 pt-4">
        {grouped.length === 0 ? (
          <div className="py-16 text-center text-[14px] text-[#8a8a8a]">
            Пока нет записей
          </div>
        ) : (
          grouped.map(({ date, list }) => (
            <div key={date} className="mb-5">
              <div
                className="mb-2 text-[13px] font-bold uppercase"
                style={{ color: "#FF6D00" }}
              >
                Благодарности за {fmtDate(date)}
              </div>
              <div className="flex flex-col gap-2">
                {list.map((e) => (
                  <div
                    key={e.id}
                    className="rounded-[12px] bg-white px-4 py-3"
                    style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                  >
                    {editingId === e.id ? (
                      <>
                        <textarea
                          value={draft}
                          onChange={(ev) => setDraft(ev.target.value.slice(0, maxLen))}
                          maxLength={maxLen}
                          className="min-h-[90px] w-full resize-none rounded-[10px] border border-black/10 bg-white px-3 py-2 text-[14px] leading-[1.6] text-[#1a1a1a] outline-none focus:border-[#FF6D00]"
                        />
                        <div className="mt-1 flex items-center justify-between text-[12px] text-[#8a8a8a]">
                          <span>{draft.length} / {maxLen}</span>
                          <button
                            onClick={commitEdit}
                            disabled={draft.trim().length < 1}
                            className="rounded-[10px] px-4 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
                          >
                            ✅ Сохранить
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="whitespace-pre-wrap text-[14px] leading-[1.6] text-[#1a1a1a]">
                          {e.text}
                        </div>
                        <button
                          onClick={() => startEdit(e)}
                          className="mt-2 text-[12px] font-semibold text-[#FF6D00]"
                        >
                          ✏️ Изменить
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
