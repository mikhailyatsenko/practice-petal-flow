import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { BackButton } from "@/components/layout/BackButton";
export const Route = createFileRoute("/_app/decisions")({
  head: () => ({
    meta: [
      { title: "Дневник решений — Клуб «Моя жизнь»" },
      { name: "description", content: "Анализ, принятие и завершение важных решений." },
    ],
  }),
  component: DecisionsScreen,
});

// ---------- Types & storage ----------

type DType = "reversible" | "irreversible" | "fatal" | "emotional" | "strategic";
type Status = "waiting" | "accepted" | "completed";

interface Comment {
  ts: number;
  text: string;
}

interface Decision {
  id: string;
  type: DType;
  title: string;
  positive: string;
  negative: string;
  pros: string;
  cons: string;
  needs: string;
  barriers: string;
  status: Status;
  // for waiting: deadline to make decision
  decideBy?: number; // ms
  // for accepted: deadline to draw conclusion
  concludeBy?: number; // ms
  conclusion?: string;
  comments: Comment[];
  createdAt: number;
}

const STORAGE_KEY = "decisions-v1";

const TYPES: { id: DType; label: string; emoji: string; color: string; desc: string }[] = [
  {
    id: "reversible",
    label: "Обратимое",
    emoji: "🟢",
    color: "#22C55E",
    desc: "Решение, последствие которого можно легко отменить или скорректировать с минимальными потерями.",
  },
  {
    id: "irreversible",
    label: "Необратимое",
    emoji: "🟠",
    color: "#FF6D00",
    desc: "Решение, последствие которого невозможно отменить. Успех или неудача меняет жизнь.",
  },
  {
    id: "fatal",
    label: "Фатальное",
    emoji: "🔴",
    color: "#EF4444",
    desc: "Решение, неудача в котором приводит к необратимым катастрофическим последствиям, угрожающим ключевым аспектам жизни.",
  },
  {
    id: "emotional",
    label: "Эмоциональное",
    emoji: "🟣",
    color: "#A855F7",
    desc: "Решение, принимаемое под влиянием чувств, импульсов или межличностных отношений.",
  },
  {
    id: "strategic",
    label: "Стратегическое",
    emoji: "🔵",
    color: "#3B82F6",
    desc: "Решение, направленное на долгосрочные цели, формирующие будущее, но не всегда связанное с немедленным риском.",
  },
];

function typeMeta(t: DType) {
  return TYPES.find((x) => x.id === t)!;
}

function loadStore(): Decision[] {
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

function saveStore(s: Decision[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function newId() {
  return `d_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatDate(ms: number) {
  const d = new Date(ms);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}.${mm}.${yy}`;
}

// ---------- Main screen ----------

type View =
  | { kind: "main" }
  | { kind: "create" }
  | { kind: "list"; status: Status }
  | { kind: "detail"; id: string };

function DecisionsScreen() {
  const navigate = useNavigate();
  const [store, setStore] = useState<Decision[]>([]);
  const [view, setView] = useState<View>({ kind: "main" });

  useEffect(() => {
    setStore(loadStore());
  }, []);

  function persist(next: Decision[]) {
    setStore(next);
    saveStore(next);
  }

  function addDecision(d: Decision) {
    persist([d, ...store]);
  }

  function updateDecision(id: string, patch: Partial<Decision>) {
    persist(store.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  if (view.kind === "create") {
    return (
      <CreateFlow
        onCancel={() => setView({ kind: "main" })}
        onCreated={(d) => {
          addDecision(d);
          setView({ kind: "main" });
        }}
      />
    );
  }

  if (view.kind === "list") {
    return (
      <ListScreen
        status={view.status}
        items={store.filter((d) => d.status === view.status)}
        onBack={() => setView({ kind: "main" })}
        onOpen={(id) => setView({ kind: "detail", id })}
      />
    );
  }

  if (view.kind === "detail") {
    const dec = store.find((d) => d.id === view.id);
    if (!dec) {
      setView({ kind: "main" });
      return null;
    }
    return (
      <DetailScreen
        decision={dec}
        onBack={() => setView({ kind: "list", status: dec.status })}
        onUpdate={(patch) => updateDecision(dec.id, patch)}
      />
    );
  }

  return (
    <div style={{ padding: "16px" }}>
      <Header title="Дневник решений" onBack={() => navigate({ to: "/sections" })} />

      <p style={{ color: "#6B7280", fontSize: 14, margin: "16px 0 12px" }}>Выберите раздел:</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <PrimaryButton onClick={() => setView({ kind: "create" })}>Анализ решения</PrimaryButton>
        <OutlineButton onClick={() => setView({ kind: "list", status: "waiting" })}>
          Решения в ожидании
        </OutlineButton>
        <OutlineButton onClick={() => setView({ kind: "list", status: "accepted" })}>
          Принятые решения
        </OutlineButton>
        <OutlineButton onClick={() => setView({ kind: "list", status: "completed" })}>
          Завершённые решения
        </OutlineButton>
      </div>

    </div>
  );
}

// ---------- Header ----------

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 44,
      }}
    >
      <BackButton onClick={onBack} />
      <div style={{ fontSize: 17, fontWeight: 600 }}>{title}</div>
      <div style={{ width: 38 }} />
    </div>
  );
}

// ---------- Buttons ----------

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
        padding: "14px 16px",
        borderRadius: 10,
        border: 0,
        color: "#fff",
        fontWeight: 600,
        fontSize: 15,
        background: disabled
          ? "#FFD9B3"
          : "linear-gradient(135deg, #FFB300 0%, #FF6D00 100%)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function OutlineButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "14px 16px",
        borderRadius: 10,
        border: "1.5px solid #FF6D00",
        color: "#FF6D00",
        background: "#fff",
        fontWeight: 600,
        fontSize: 15,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function GreyOutlineButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: 10,
        border: "1.5px solid #D1D5DB",
        color: "#374151",
        background: "#fff",
        fontWeight: 500,
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

// ---------- Create flow ----------

const QUESTIONS: { key: keyof Decision; label: string; max: number; multi: boolean }[] = [
  { key: "title", label: "Задайте название этому решению (не более 200 символов)", max: 200, multi: false },
  {
    key: "positive",
    label:
      "Какое положительное ожидание от решения? (если это произойдет, то я пойму, что решение удачное)",
    max: 1000,
    multi: true,
  },
  {
    key: "negative",
    label:
      "Какой самый отрицательный исход? (узнав худший сценарий, я пойму, что он не так страшен, и перестану бояться)",
    max: 1000,
    multi: true,
  },
  { key: "pros", label: "Какие плюсы этого решения? (перечислить все варианты)", max: 1000, multi: true },
  { key: "cons", label: "Какие минусы этого решения? (перечислить все варианты)", max: 1000, multi: true },
  { key: "needs", label: "Что нужно, чтобы реализовать это решение?", max: 1000, multi: true },
  {
    key: "barriers",
    label: "Какие барьеры я могу встретить на пути, и не довести решение до положительного результата?",
    max: 1000,
    multi: true,
  },
];

const ACCEPT_DAYS = [5, 10, 20, 30, 40, 50, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360];
const WAIT_DAYS = [1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30, 60];

function CreateFlow({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (d: Decision) => void;
}) {
  // step: 0 = type, 1..7 = questions, 8 = readiness, 9 = accept-days, 10 = wait-days
  const [step, setStep] = useState(0);
  const [type, setType] = useState<DType | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [text, setText] = useState("");
  const [customDate, setCustomDate] = useState("");

  function back() {
    if (step === 0) onCancel();
    else if (step === 9 || step === 10) setStep(8);
    else setStep(step - 1);
  }

  function pickType(t: DType) {
    setType(t);
    setStep(1);
  }

  if (step === 0) {
    return (
      <div style={{ padding: 16 }}>
        <Header title="Тип решения" onBack={back} />
        <div
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            padding: 14,
            marginTop: 14,
            fontSize: 13,
            lineHeight: 1.5,
            color: "#374151",
          }}
        >
          {TYPES.map((t) => (
            <p key={t.id} style={{ margin: "0 0 10px" }}>
              <b>
                {t.emoji} {t.label === "Обратимое" ? "Обратимое решение" :
                  t.label === "Необратимое" ? "Необратимое решение" :
                  t.label === "Фатальное" ? "Фатальное решение" :
                  t.label === "Эмоциональное" ? "Эмоциональное решение" :
                  "Стратегическое решение"}:
              </b>{" "}
              {t.desc}
            </p>
          ))}
        </div>

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => pickType(t.id)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 10,
                border: `1.5px solid ${t.color}`,
                color: "#111",
                background: "#fff",
                fontWeight: 600,
                fontSize: 15,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // questions 1..7
  if (step >= 1 && step <= 7) {
    const q = QUESTIONS[step - 1];
    const value = (answers[q.key as string] ?? text) || "";
    return (
      <div style={{ padding: 16 }}>
        <Header title={`Шаг ${step + 1} из 9`} onBack={back} />
        <p style={{ fontSize: 14, color: "#111", margin: "14px 0 8px", lineHeight: 1.4 }}>{q.label}</p>
        {q.multi ? (
          <textarea
            value={value}
            onChange={(e) => setText(e.target.value.slice(0, q.max))}
            maxLength={q.max}
            style={{
              width: "100%",
              minHeight: 140,
              padding: 12,
              border: "1px solid #D1D5DB",
              borderRadius: 10,
              fontSize: 14,
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        ) : (
          <input
            value={value}
            onChange={(e) => setText(e.target.value.slice(0, q.max))}
            maxLength={q.max}
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #D1D5DB",
              borderRadius: 10,
              fontSize: 14,
              outline: "none",
            }}
          />
        )}
        <div style={{ textAlign: "right", color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>
          {value.length}/{q.max}
        </div>
        <div style={{ marginTop: 12 }}>
          <PrimaryButton
            disabled={value.trim().length === 0}
            onClick={() => {
              const next = { ...answers, [q.key as string]: value.trim() };
              setAnswers(next);
              setText("");
              setStep(step + 1);
            }}
          >
            ✅ Сохранить
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // step 8 — readiness
  if (step === 8) {
    return (
      <div style={{ padding: 16 }}>
        <Header title="Готовность" onBack={back} />
        <p style={{ fontSize: 15, fontWeight: 600, margin: "14px 0 12px" }}>
          Готовы ли сейчас принять решение или нужно еще время?
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <PrimaryButton onClick={() => setStep(9)}>✅ Готов(а) принять решение!</PrimaryButton>
          <OutlineButton onClick={() => setStep(10)}>⏰ Нужно еще время</OutlineButton>
        </div>
      </div>
    );
  }

  // step 9 — accept (choose conclusion days)
  if (step === 9) {
    return (
      <div style={{ padding: 16 }}>
        <Header title="Срок вывода" onBack={back} />
        <p style={{ fontSize: 13, color: "#374151", margin: "14px 0 12px", lineHeight: 1.5 }}>
          Чтобы принять решение, выбери, через сколько дней сможешь сделать вывод о решении. Сразу после
          выбора решение будет принято ✅
        </p>
        <DaysGrid
          days={ACCEPT_DAYS}
          extraCustom
          customDate={customDate}
          onCustomDate={setCustomDate}
          onPick={(days, dateMs) => finalize("accepted", days, dateMs)}
        />
      </div>
    );
  }

  // step 10 — wait (choose wait days)
  if (step === 10) {
    return (
      <div style={{ padding: 16 }}>
        <Header title="Срок ожидания" onBack={back} />
        <p style={{ fontSize: 14, fontWeight: 600, margin: "14px 0 12px" }}>
          Сколько дней необходимо для принятия решения?
        </p>
        <DaysGrid days={WAIT_DAYS} onPick={(days) => finalize("waiting", days)} />
      </div>
    );
  }

  function finalize(status: Status, days: number, customMs?: number) {
    if (!type) return;
    const now = Date.now();
    const target = customMs ?? now + days * 86400000;
    const dec: Decision = {
      id: newId(),
      type,
      title: answers.title || "",
      positive: answers.positive || "",
      negative: answers.negative || "",
      pros: answers.pros || "",
      cons: answers.cons || "",
      needs: answers.needs || "",
      barriers: answers.barriers || "",
      status,
      decideBy: status === "waiting" ? target : undefined,
      concludeBy: status === "accepted" ? target : undefined,
      comments: [],
      createdAt: now,
    };
    onCreated(dec);
  }

  return null;
}

function DaysGrid({
  days,
  onPick,
  extraCustom,
  customDate,
  onCustomDate,
}: {
  days: number[];
  onPick: (days: number, customMs?: number) => void;
  extraCustom?: boolean;
  customDate?: string;
  onCustomDate?: (s: string) => void;
}) {
  function dayLabel(n: number) {
    const last2 = n % 100;
    const last = n % 10;
    let word = "дней";
    if (last2 < 11 || last2 > 14) {
      if (last === 1) word = "день";
      else if (last >= 2 && last <= 4) word = "дня";
    }
    return `${n} ${word}`;
  }
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {days.map((d) => (
          <button
            key={d}
            onClick={() => onPick(d)}
            style={{
              padding: "10px 6px",
              borderRadius: 10,
              border: "1.5px solid #FF6D00",
              background: "#fff",
              color: "#FF6D00",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {dayLabel(d)}
          </button>
        ))}
        {extraCustom ? (
          <button
            onClick={() => {
              const el = document.getElementById("custom-date-input") as HTMLInputElement | null;
              el?.focus();
            }}
            style={{
              padding: "10px 6px",
              borderRadius: 10,
              border: "1.5px solid #FF6D00",
              background: "#fff",
              color: "#FF6D00",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Своя дата
          </button>
        ) : null}
      </div>
      {extraCustom ? (
        <div style={{ marginTop: 12 }}>
          <input
            id="custom-date-input"
            type="date"
            value={customDate || ""}
            onChange={(e) => onCustomDate?.(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #D1D5DB",
              borderRadius: 10,
              fontSize: 14,
            }}
          />
          <div style={{ marginTop: 8 }}>
            <PrimaryButton
              disabled={!customDate}
              onClick={() => {
                if (!customDate) return;
                const ms = new Date(customDate).getTime();
                if (!Number.isFinite(ms)) return;
                onPick(0, ms);
              }}
            >
              ✅ Выбрать дату
            </PrimaryButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ---------- List screen ----------

function ListScreen({
  status,
  items,
  onBack,
  onOpen,
}: {
  status: Status;
  items: Decision[];
  onBack: () => void;
  onOpen: (id: string) => void;
}) {
  const titles: Record<Status, { hdr: string; section: string; line: (d: Decision) => string }> = {
    waiting: {
      hdr: "Решения в ожидании",
      section: "СПИСОК РЕШЕНИЙ В ОЖИДАНИИ",
      line: (d) => `Принять до ${d.decideBy ? formatDate(d.decideBy) : "—"}`,
    },
    accepted: {
      hdr: "Принятые решения",
      section: "СПИСОК ПРИНЯТЫХ РЕШЕНИЙ",
      line: (d) => `Вывод решения до ${d.concludeBy ? formatDate(d.concludeBy) : "—"}`,
    },
    completed: {
      hdr: "Завершённые решения",
      section: "СПИСОК ЗАВЕРШЁННЫХ РЕШЕНИЙ",
      line: () => "",
    },
  };
  const t = titles[status];
  return (
    <div style={{ padding: 16 }}>
      <Header title={t.hdr} onBack={onBack} />
      <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", margin: "16px 0 10px" }}>
        {t.section}
      </div>
      {items.length === 0 ? (
        <p style={{ color: "#9CA3AF", fontSize: 14 }}>Список пуст.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((d) => {
            const tm = typeMeta(d.type);
            return (
              <button
                key={d.id}
                onClick={() => onOpen(d.id)}
                style={{
                  textAlign: "left",
                  width: "100%",
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  padding: 12,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 6 }}>
                  {d.title}
                </div>
                <div style={{ fontSize: 13, color: "#6B7280", display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: tm.color,
                    }}
                  />
                  <span>{tm.label}</span>
                  {t.line(d) ? <span>· {t.line(d)}</span> : null}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Detail screen ----------

function DetailScreen({
  decision,
  onBack,
  onUpdate,
}: {
  decision: Decision;
  onBack: () => void;
  onUpdate: (patch: Partial<Decision>) => void;
}) {
  const tm = typeMeta(decision.type);
  const [mode, setMode] = useState<"view" | "accept" | "conclude" | "comment">("view");
  const [text, setText] = useState("");
  const [customDate, setCustomDate] = useState("");

  const statusLine = useMemo(() => {
    if (decision.status === "waiting" && decision.decideBy)
      return `В ожидании · Принять до ${formatDate(decision.decideBy)}`;
    if (decision.status === "accepted" && decision.concludeBy)
      return `Принято · Вывод до ${formatDate(decision.concludeBy)}`;
    if (decision.status === "completed") return "Завершено";
    return "";
  }, [decision]);

  function acceptDecision(days: number, customMs?: number) {
    const target = customMs ?? Date.now() + days * 86400000;
    onUpdate({ status: "accepted", concludeBy: target, decideBy: undefined });
    setMode("view");
  }

  function saveConclusion() {
    if (text.trim().length === 0) return;
    onUpdate({ status: "completed", conclusion: text.trim(), concludeBy: undefined });
    setMode("view");
    setText("");
  }

  function saveComment() {
    if (text.trim().length === 0) return;
    onUpdate({ comments: [...decision.comments, { ts: Date.now(), text: text.trim() }] });
    setMode("view");
    setText("");
  }

  return (
    <div style={{ padding: 16 }}>
      <Header title="Решение" onBack={onBack} />

      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 6 }}>
          {decision.title}
        </div>
        <div style={{ fontSize: 13, color: "#6B7280", display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: tm.color,
            }}
          />
          <span>{tm.label}</span>
          {statusLine ? <span>/ {statusLine}</span> : null}
        </div>
      </div>

      <Field q="Какое положительное ожидание от решения?" a={decision.positive} />
      <Field q="Какой самый отрицательный исход?" a={decision.negative} />
      <Field q="Какие плюсы этого решения?" a={decision.pros} />
      <Field q="Какие минусы этого решения?" a={decision.cons} />
      <Field q="Что нужно, чтобы реализовать это решение?" a={decision.needs} />
      <Field q="Какие барьеры я могу встретить на пути?" a={decision.barriers} />

      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "#111", marginBottom: 6 }}>Комментарии:</div>
        {decision.comments.length === 0 ? (
          <div style={{ color: "#9CA3AF", fontSize: 14 }}>Нет</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {decision.comments.map((c, i) => (
              <div
                key={i}
                style={{
                  background: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  borderRadius: 10,
                  padding: 10,
                  fontSize: 14,
                  color: "#111",
                }}
              >
                <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 4 }}>{formatDate(c.ts)}</div>
                {c.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {decision.conclusion ? (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#111", marginBottom: 6 }}>Вывод:</div>
          <div
            style={{
              background: "#FFF7ED",
              border: "1px solid #FFD9B3",
              borderRadius: 10,
              padding: 10,
              fontSize: 14,
              color: "#111",
              whiteSpace: "pre-wrap",
            }}
          >
            {decision.conclusion}
          </div>
        </div>
      ) : null}

      {/* Actions */}
      {mode === "view" ? (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          {decision.status === "waiting" ? (
            <>
              <PrimaryButton onClick={() => setMode("accept")}>✅ Принять решение</PrimaryButton>
              <OutlineButton onClick={() => setMode("comment")}>📝 Добавить комментарий</OutlineButton>
            </>
          ) : null}
          {decision.status === "accepted" ? (
            <>
              <PrimaryButton onClick={() => setMode("conclude")}>✅ Написать вывод</PrimaryButton>
              <OutlineButton onClick={() => setMode("comment")}>📝 Добавить комментарий</OutlineButton>
            </>
          ) : null}
          {decision.status === "completed" ? (
            <OutlineButton onClick={() => setMode("comment")}>📝 Добавить комментарий</OutlineButton>
          ) : null}
        </div>
      ) : null}

      {mode === "accept" ? (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 13, color: "#374151", margin: "0 0 12px", lineHeight: 1.5 }}>
            Чтобы принять решение, выбери, через сколько дней сможешь сделать вывод о решении.
          </p>
          <DaysGrid
            days={ACCEPT_DAYS}
            extraCustom
            customDate={customDate}
            onCustomDate={setCustomDate}
            onPick={(d, ms) => acceptDecision(d, ms)}
          />
          <div style={{ marginTop: 10 }}>
            <GreyOutlineButton onClick={() => setMode("view")}>Отмена</GreyOutlineButton>
          </div>
        </div>
      ) : null}

      {mode === "conclude" || mode === "comment" ? (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>
            {mode === "conclude" ? "Вывод" : "Комментарий"}
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 1000))}
            maxLength={1000}
            style={{
              width: "100%",
              minHeight: 140,
              padding: 12,
              border: "1px solid #D1D5DB",
              borderRadius: 10,
              fontSize: 14,
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
          <div style={{ textAlign: "right", color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>
            {text.length}/1000
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            <PrimaryButton
              disabled={text.trim().length === 0}
              onClick={() => (mode === "conclude" ? saveConclusion() : saveComment())}
            >
              {mode === "conclude" ? "✅ Сохранить вывод" : "✅ Сохранить"}
            </PrimaryButton>
            <GreyOutlineButton
              onClick={() => {
                setMode("view");
                setText("");
              }}
            >
              Отмена
            </GreyOutlineButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({ q, a }: { q: string; a: string }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 4 }}>{q}</div>
      <div style={{ fontSize: 14, color: "#374151", whiteSpace: "pre-wrap" }}>
        Ответ: {a || "—"}
      </div>
    </div>
  );
}
