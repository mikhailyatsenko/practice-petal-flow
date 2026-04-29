import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Check } from "lucide-react";
import { BackButton } from "@/components/layout/BackButton";
import { HowItWorksBlock } from "@/components/section/HowItWorksBlock";

export const Route = createFileRoute("/_app/values")({
  head: () => ({
    meta: [
      { title: "Ценности — Клуб «Моя жизнь»" },
      { name: "description", content: "Список твоих ценностей с приоритетом." },
    ],
  }),
  component: ValuesScreen,
});

// ---------- Types & Storage ----------

interface Value {
  id: string;
  title: string;
  description: string;
  priority: number | null;
}

const STORAGE_KEY = "values-v1";

function loadValues(): Value[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveValues(list: Value[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function newId() {
  return `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function sortValues(list: Value[]): Value[] {
  return [...list].sort((a, b) => {
    if (a.priority == null && b.priority == null) return 0;
    if (a.priority == null) return 1;
    if (b.priority == null) return -1;
    return a.priority - b.priority;
  });
}

// ---------- Screen ----------

type Screen =
  | { name: "list" }
  | { name: "add" }
  | { name: "view"; id: string }
  | { name: "priority" };

function ValuesScreen() {
  const navigate = useNavigate();
  const [values, setValues] = useState<Value[]>([]);
  const [screen, setScreen] = useState<Screen>({ name: "list" });
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setValues(sortValues(loadValues()));
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function update(list: Value[]) {
    const sorted = sortValues(list);
    setValues(sorted);
    saveValues(sorted);
  }

  function addValue(title: string, description: string) {
    const v: Value = { id: newId(), title: title.trim(), description: description.trim(), priority: null };
    update([...values, v]);
  }

  function deleteValue(id: string) {
    if (!confirm("Удалить эту ценность?")) return;
    update(values.filter((v) => v.id !== id));
    setScreen({ name: "list" });
  }

  function patchValue(id: string, patch: Partial<Value>) {
    update(values.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  function applyPriorities(orderIds: string[]) {
    const map = new Map(orderIds.map((id, i) => [id, i + 1]));
    update(values.map((v) => ({ ...v, priority: map.get(v.id) ?? null })));
    setScreen({ name: "list" });
  }

  // ----- Sub screens -----
  if (screen.name === "add") {
    return (
      <AddScreen
        onBack={() => setScreen({ name: "list" })}
        onSave={(t, d) => {
          addValue(t, d);
          setScreen({ name: "list" });
        }}
      />
    );
  }

  if (screen.name === "view") {
    const v = values.find((x) => x.id === screen.id);
    if (!v) {
      setScreen({ name: "list" });
      return null;
    }
    return (
      <ViewScreen
        value={v}
        onBack={() => setScreen({ name: "list" })}
        onPatch={(patch) => patchValue(v.id, patch)}
        onDelete={() => deleteValue(v.id)}
      />
    );
  }

  if (screen.name === "priority") {
    return (
      <PriorityScreen
        values={values}
        onBack={() => setScreen({ name: "list" })}
        onDone={(orderIds) => applyPriorities(orderIds)}
      />
    );
  }

  // ----- List screen -----
  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Header
        title="Ценности"
        onBack={() => navigate({ to: "/sections" })}
        backLabel="Назад"
      />

      <div className="px-4 pb-32 pt-4">
        {values.length === 0 ? (
          <div className="py-16 text-center text-[14px] text-[#8a8a8a]">
            Добавь свои ценности — то, что важно и ценно для тебя в жизни
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {values.map((v, i) => (
              <div
                key={v.id}
                className="relative flex items-start gap-3 rounded-[14px] bg-white px-4 py-3"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
              >
                <button
                  className="flex flex-1 items-start gap-3 text-left"
                  onClick={() => setScreen({ name: "view", id: v.id })}
                >
                  <span
                    className="min-w-[24px] pt-[1px] text-[15px] font-bold"
                    style={{ color: "#FF6D00" }}
                  >
                    {v.priority != null ? v.priority : i + 1}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[15px] font-semibold text-[#1a1a1a]">
                      {v.title}
                    </span>
                    {v.description && (
                      <span className="mt-0.5 block text-[12px] leading-[1.4] text-[#8a8a8a] line-clamp-2">
                        {v.description}
                      </span>
                    )}
                  </span>
                </button>
                <button
                  className="p-1 text-[#8a8a8a]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenu(openMenu === v.id ? null : v.id);
                  }}
                  aria-label="Меню"
                >
                  <MoreHorizontal size={18} />
                </button>
                {openMenu === v.id && (
                  <div
                    ref={menuRef}
                    className="absolute right-3 top-12 z-10 w-56 overflow-hidden rounded-[12px] bg-white py-1"
                    style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
                  >
                    <button
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[14px] hover:bg-gray-50"
                      onClick={() => {
                        setOpenMenu(null);
                        setScreen({ name: "view", id: v.id });
                      }}
                    >
                      ✏️ Изменить
                    </button>
                    <button
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[14px] text-[#ef4444] hover:bg-red-50"
                      onClick={() => {
                        setOpenMenu(null);
                        deleteValue(v.id);
                      }}
                    >
                      🗑 Удалить ценность
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            className="rounded-[14px] py-3.5 text-[15px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
            onClick={() => setScreen({ name: "add" })}
          >
            + Добавить ценность
          </button>
          {values.length >= 2 && (
            <button
              className="rounded-[14px] py-3.5 text-[15px] font-semibold"
              style={{ border: "1.5px solid #FF6D00", color: "#FF6D00" }}
              onClick={() => setScreen({ name: "priority" })}
            >
              ↕ Расставить по приоритету
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Header ----------

function Header({ title, onBack, backLabel = "Назад" }: { title: string; onBack: () => void; backLabel?: string }) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 bg-white px-3 py-3">
      <BackButton onClick={onBack} label={backLabel} />
      <div className="text-[15px] font-semibold text-[#1a1a1a]">{title}</div>
      <div className="w-[70px]" />
    </div>
  );
}

// ---------- Add Screen ----------

function AddScreen({ onBack, onSave }: { onBack: () => void; onSave: (t: string, d: string) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const valid = title.trim().length >= 3 && description.trim().length >= 3;
  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Header title="Новая ценность" onBack={onBack} />
      <div className="px-4 pb-32 pt-4">
        <div className="mb-5">
          <div className="mb-1.5 text-[11px] font-semibold uppercase text-[#8a8a8a]">Название</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="w-full rounded-[12px] border border-black/10 bg-white px-4 py-3 text-[15px] outline-none focus:border-[#FF6D00]"
          />
          <div className="mt-1.5 text-[12px] text-[#8a8a8a]">
            Отвечай на вопрос: «Что для меня ценно/важно в жизни?»
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-1.5 text-[11px] font-semibold uppercase text-[#8a8a8a]">Описание</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={250}
            className="min-h-[100px] w-full rounded-[12px] border border-black/10 bg-white px-4 py-3 text-[15px] outline-none focus:border-[#FF6D00]"
          />
          <div className="mt-1.5 text-[12px] text-[#8a8a8a]">
            Опиши эту ценность максимально подробно — что она для тебя значит, как проявляется в жизни
          </div>
        </div>

        <button
          disabled={!valid}
          onClick={() => onSave(title, description)}
          className="w-full rounded-[14px] py-3.5 text-[15px] font-semibold text-white disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
        >
          ✅ Добавить ценность
        </button>
      </div>
    </div>
  );
}

// ---------- View / Edit Screen ----------

function ViewScreen({
  value,
  onBack,
  onPatch,
  onDelete,
}: {
  value: Value;
  onBack: () => void;
  onPatch: (patch: Partial<Value>) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(value.title);
  const [description, setDescription] = useState(value.description);

  useEffect(() => {
    setTitle(value.title);
    setDescription(value.description);
  }, [value.id]);

  function commitTitle() {
    const t = title.trim();
    if (t.length >= 3 && t !== value.title) onPatch({ title: t });
    else setTitle(value.title);
  }

  function commitDescription() {
    const d = description.trim();
    if (d !== value.description) onPatch({ description: d });
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Header title={value.title} onBack={onBack} />
      <div className="px-4 pb-32 pt-4">
        <div className="mb-4">
          <div className="mb-1.5 text-[11px] font-semibold uppercase text-[#8a8a8a]">Название</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            maxLength={100}
            className="w-full rounded-[14px] border border-transparent bg-white px-4 py-3.5 text-[18px] font-bold text-[#1a1a1a] outline-none focus:border-[#FF6D00]"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
          />
        </div>

        <div className="mb-6">
          <div className="mb-1.5 text-[11px] font-semibold uppercase text-[#8a8a8a]">Описание</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={commitDescription}
            maxLength={250}
            placeholder="Опиши эту ценность подробно — что она для тебя значит"
            className="min-h-[140px] w-full rounded-[14px] border border-transparent bg-white px-4 py-3.5 text-[14px] leading-[1.7] text-[#555] outline-none focus:border-[#FF6D00]"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
          />
          <div className="mt-1 text-right text-[11px] text-[#aaa]">{description.length}/250</div>
        </div>

        <button
          onClick={onDelete}
          className="w-full rounded-[14px] py-3 text-[14px] font-semibold"
          style={{ border: "1.5px solid #fee2e2", color: "#ef4444", background: "#fff" }}
        >
          🗑 Удалить ценность
        </button>
      </div>
    </div>
  );
}

// ---------- Priority Screen ----------

function PriorityScreen({
  values,
  onBack,
  onDone,
}: {
  values: Value[];
  onBack: () => void;
  onDone: (orderIds: string[]) => void;
}) {
  const [order, setOrder] = useState<string[]>([]);
  const remaining = values.filter((v) => !order.includes(v.id));
  const ordered = order.map((id) => values.find((v) => v.id === id)!).filter(Boolean);

  useEffect(() => {
    if (order.length === values.length && values.length > 0) {
      onDone(order);
    }
  }, [order, values.length, onDone]);

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Header title="Приоритет ценностей" onBack={onBack} />
      <div className="px-4 pb-32 pt-4">
        <div className="mb-5 text-[14px] leading-[1.55] text-[#666]">
          Нажимай на ценности по порядку — от самой важной к менее важной. Первая нажатая займёт 1-е место, вторая — 2-е, и так далее.
        </div>

        {remaining.length > 0 && (
          <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {remaining.map((v) => {
              const nextNum = order.length + 1;
              return (
                <button
                  key={v.id}
                  onClick={() => setOrder([...order, v.id])}
                  className="rounded-[10px] px-3 py-3 text-left text-[14px] font-semibold text-white active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
                >
                  {nextNum}) {v.title}
                </button>
              );
            })}
          </div>
        )}

        {ordered.length > 0 && (
          <div>
            <div className="mb-2 text-[12px] font-semibold uppercase text-[#8a8a8a]">Расставлено</div>
            <div className="flex flex-col gap-2">
              {ordered.map((v, i) => (
                <div
                  key={v.id}
                  className="flex items-center gap-2 rounded-[10px] bg-white px-3 py-2.5 text-[14px] text-[#8a8a8a]"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                >
                  <Check size={16} className="text-[#16a34a]" />
                  <span className="font-semibold">{i + 1})</span>
                  <span className="flex-1">{v.title}</span>
                </div>
              ))}
            </div>
            {order.length < values.length && (
              <button
                onClick={() => setOrder([])}
                className="mt-4 w-full rounded-[12px] py-2.5 text-[13px] font-medium text-[#666]"
                style={{ border: "1px solid #e5e5e5" }}
              >
                Сбросить
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
