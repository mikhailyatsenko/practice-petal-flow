import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { BackButton } from "@/components/layout/BackButton";
export const Route = createFileRoute("/_app/mistakes")({
  head: () => ({
    meta: [
      { title: "Дневник ошибок — Клуб «Моя жизнь»" },
      { name: "description", content: "Фиксируй ошибки и уроки, которые они дали." },
    ],
  }),
  component: MistakesScreen,
});

interface Mistake {
  id: string;
  title: string;
  text: string;
  lessons: string;
  prevention: string;
  createdAt: number;
}

const STORAGE_KEY = "mistakes-v1";

function loadStore(): Mistake[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveStore(s: Mistake[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function newId() {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const AFFIRMATION =
  "Не ошибаются только те, кто стоит на месте. Ошибки — это часть успеха. Я не боюсь ошибаться. Каждая ошибка учит меня чему-то новому. Моя способность признавать ошибки — признак моей силы. Я быстро осознаю ошибки и исправляю их. Я превращаю ошибки в возможности. Ошибка — это опыт, который делает меня лучше. Ошибаться — значит развиваться. Я благодарен за ошибки, потому что они делают меня успешнее.";

type View =
  | { kind: "main" }
  | { kind: "add1" }
  | { kind: "add2"; title: string }
  | { kind: "add3"; title: string; text: string }
  | { kind: "add4"; title: string; text: string; lessons: string }
  | { kind: "affirm" }
  | { kind: "edit"; id: string };

function MistakesScreen() {
  const navigate = useNavigate();
  const [store, setStore] = useState<Mistake[]>([]);
  const [view, setView] = useState<View>({ kind: "main" });

  useEffect(() => {
    setStore(loadStore());
  }, []);

  function persist(next: Mistake[]) {
    setStore(next);
    saveStore(next);
  }

  if (view.kind === "add1") {
    return (
      <StepScreen
        key="add1"
        title="Название ошибки"
        prompt="Задайте название этой ошибке (не более 200 символов)"
        max={200}
        minHeight={60}
        onBack={() => setView({ kind: "main" })}
        onSave={(t) => setView({ kind: "add2", title: t })}
      />
    );
  }

  if (view.kind === "add2") {
    return (
      <StepScreen
        key="add2"
        title="Описание ошибки"
        prompt="Опишите, что именно произошло (не более 1000 символов)"
        max={1000}
        minHeight={120}
        onBack={() => setView({ kind: "add1" })}
        onSave={(text) => setView({ kind: "add3", title: view.title, text })}
      />
    );
  }

  if (view.kind === "add3") {
    return (
      <StepScreen
        key="add3"
        title="Уроки из ошибки"
        prompt="Какие уроки вы вынесли из этой ошибки? (не более 500 символов)"
        max={500}
        minHeight={100}
        onBack={() => setView({ kind: "add2", title: view.title })}
        onSave={(lessons) => setView({ kind: "add4", title: view.title, text: view.text, lessons })}
      />
    );
  }

  if (view.kind === "add4") {
    return (
      <StepScreen
        key="add4"
        title="Страховка от повторения"
        prompt="Что нужно сделать, чтобы такая ошибка больше не повторилась? (не более 500 символов)"
        max={500}
        minHeight={100}
        onBack={() => setView({ kind: "add3", title: view.title, text: view.text })}
        onSave={(prevention) => {
          const m: Mistake = {
            id: newId(),
            title: view.title,
            text: view.text,
            lessons: view.lessons,
            prevention,
            createdAt: Date.now(),
          };
          persist([m, ...store]);
          setView({ kind: "affirm" });
        }}
      />
    );
  }

  if (view.kind === "affirm") {
    return <AffirmScreen onDone={() => setView({ kind: "main" })} />;
  }

  if (view.kind === "edit") {
    const m = store.find((x) => x.id === view.id);
    if (!m) {
      setView({ kind: "main" });
      return null;
    }
    return (
      <EditScreen
        mistake={m}
        onBack={() => setView({ kind: "main" })}
        onSave={(title, text, lessons, prevention) => {
          persist(store.map((x) => (x.id === m.id ? { ...x, title, text, lessons, prevention } : x)));
          setView({ kind: "main" });
        }}
        onDelete={() => {
          if (!confirm("Удалить эту ошибку?")) return;
          persist(store.filter((x) => x.id !== m.id));
          setView({ kind: "main" });
        }}
      />
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <Header title="Дневник ошибок" onBack={() => navigate({ to: "/sections" })} />

      <div
        style={{
          background: "#fff",
          border: "1px solid #ede8df",
          borderRadius: 14,
          padding: 14,
          marginTop: 14,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>
          Количество моих ошибок: {store.length}
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #ede8df",
          borderRadius: 14,
          padding: 14,
          marginTop: 12,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#8a8a8a",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Список ошибок
        </div>

        {store.length === 0 ? (
          <div style={{ color: "#8a8a8a", fontSize: 14, textAlign: "center", padding: "20px 0" }}>
            Добавь свою первую ошибку — каждая ошибка делает тебя лучше
          </div>
        ) : (
          <div>
            {store.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setView({ kind: "edit", id: m.id })}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: "transparent",
                  border: 0,
                  padding: "12px 0",
                  borderBottom: i < store.length - 1 ? "1px solid #ede8df" : "none",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 4 }}>
                  {m.title || m.text}
                </div>
                {m.title && m.text && (
                  <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>
                    {m.text}
                  </div>
                )}
                {m.lessons && (
                  <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5, marginTop: 4 }}>
                    Уроки: {m.lessons}
                  </div>
                )}
                {m.prevention && (
                  <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5, marginTop: 4 }}>
                    Страховка: {m.prevention}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <PrimaryButton onClick={() => setView({ kind: "add1" })}>Добавить ошибку</PrimaryButton>
      </div>

    </div>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 44 }}>
      <BackButton onClick={onBack} />
      <div style={{ fontSize: 17, fontWeight: 600 }}>{title}</div>
      <div style={{ width: 38 }} />
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: 15,
        borderRadius: 14,
        border: 0,
        color: "#fff",
        fontWeight: 700,
        fontSize: 15,
        background: disabled ? "#FFD9B3" : "linear-gradient(135deg, #FFB300, #FF6D00)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function AutoTextarea({
  value,
  onChange,
  max,
  minHeight,
}: {
  value: string;
  onChange: (s: string) => void;
  max: number;
  minHeight: number;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(minHeight, el.scrollHeight) + "px";
  }, [value, minHeight]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value.slice(0, max))}
      maxLength={max}
      style={{
        width: "100%",
        minHeight,
        padding: 12,
        border: "1px solid #D1D5DB",
        borderRadius: 10,
        fontSize: 14,
        outline: "none",
        resize: "none",
        fontFamily: "inherit",
        lineHeight: 1.5,
      }}
    />
  );
}

function StepScreen({
  title,
  prompt,
  max,
  minHeight,
  initial,
  onBack,
  onSave,
}: {
  title: string;
  prompt: string;
  max: number;
  minHeight: number;
  initial?: string;
  onBack: () => void;
  onSave: (text: string) => void;
}) {
  const [text, setText] = useState(initial || "");
  return (
    <div style={{ padding: 16 }}>
      <Header title={title} onBack={onBack} />
      <p style={{ fontSize: 14, color: "#374151", margin: "14px 0 8px", lineHeight: 1.4 }}>{prompt}</p>
      <AutoTextarea value={text} onChange={setText} max={max} minHeight={minHeight} />
      <div style={{ textAlign: "right", color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>
        {text.length} / {max}
      </div>
      <div style={{ marginTop: 12 }}>
        <PrimaryButton disabled={text.trim().length === 0} onClick={() => onSave(text.trim())}>
          ✅ Сохранить
        </PrimaryButton>
      </div>
    </div>
  );
}

function AffirmScreen({ onDone }: { onDone: () => void }) {
  return (
    <div style={{ padding: 16 }}>
      <Header title="Дневник ошибок" onBack={onDone} />
      <div style={{ marginTop: 14, fontSize: 15, fontWeight: 600, color: "#22C55E" }}>
        ✅ Ошибка сохранена.
      </div>
      <div
        style={{
          background: "#fff",
          border: "1px solid #ede8df",
          borderRadius: 14,
          padding: 16,
          marginTop: 12,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
          Повторите в слух (или про себя), текст ниже:
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: "#374151" }}>{AFFIRMATION}</div>
      </div>
      <div style={{ marginTop: 16 }}>
        <PrimaryButton onClick={onDone}>✅ Проговорено</PrimaryButton>
      </div>
    </div>
  );
}

function EditScreen({
  mistake,
  onBack,
  onSave,
  onDelete,
}: {
  mistake: Mistake;
  onBack: () => void;
  onSave: (text: string, lesson: string, lessons: string, prevention: string) => void;
  onDelete: () => void;
}) {
  const [text, setText] = useState(mistake.text);
  const [lesson, setLesson] = useState(mistake.lesson);
  const [lessons, setLessons] = useState(mistake.lessons || "");
  const [prevention, setPrevention] = useState(mistake.prevention || "");
  const valid =
    text.trim().length > 0 &&
    lesson.trim().length > 0 &&
    lessons.trim().length > 0 &&
    prevention.trim().length > 0;
  return (
    <div style={{ padding: 16 }}>
      <Header title="Изменить ошибку" onBack={onBack} />

      <p style={{ fontSize: 14, fontWeight: 600, margin: "14px 0 6px", color: "#1a1a1a" }}>
        Описание ошибки
      </p>
      <AutoTextarea value={text} onChange={setText} max={200} minHeight={80} />
      <div style={{ textAlign: "right", color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>
        {text.length} / 200
      </div>

      <p style={{ fontSize: 14, fontWeight: 600, margin: "14px 0 6px", color: "#1a1a1a" }}>
        Чему научила
      </p>
      <AutoTextarea value={lesson} onChange={setLesson} max={500} minHeight={100} />
      <div style={{ textAlign: "right", color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>
        {lesson.length} / 500
      </div>

      <p style={{ fontSize: 14, fontWeight: 600, margin: "14px 0 6px", color: "#1a1a1a" }}>
        Уроки из ошибки
      </p>
      <AutoTextarea value={lessons} onChange={setLessons} max={500} minHeight={100} />
      <div style={{ textAlign: "right", color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>
        {lessons.length} / 500
      </div>

      <p style={{ fontSize: 14, fontWeight: 600, margin: "14px 0 6px", color: "#1a1a1a" }}>
        Страховка от повторения
      </p>
      <AutoTextarea value={prevention} onChange={setPrevention} max={500} minHeight={100} />
      <div style={{ textAlign: "right", color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>
        {prevention.length} / 500
      </div>

      <div style={{ marginTop: 16 }}>
        <PrimaryButton disabled={!valid} onClick={() => onSave(text.trim(), lesson.trim(), lessons.trim(), prevention.trim())}>
          ✅ Сохранить изменения
        </PrimaryButton>
      </div>

      <button
        onClick={onDelete}
        style={{
          width: "100%",
          marginTop: 12,
          padding: 14,
          borderRadius: 14,
          border: "1.5px solid #fee2e2",
          background: "#fff",
          color: "#ef4444",
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        🗑 Удалить ошибку
      </button>
    </div>
  );
}
