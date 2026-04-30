import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

import { BackButton } from "@/components/layout/BackButton";
export const Route = createFileRoute("/_app/self-improve")({
  head: () => ({
    meta: [
      { title: "Самоулучшение — Клуб «Моя жизнь»" },
      { name: "description", content: "30 вопросов для рефлексии и самоулучшения." },
    ],
  }),
  component: SelfImproveScreen,
});

// ---------- Data ----------

const QUESTIONS: string[] = [
  "Чтобы я хотел улучшить в себе? Что мне необходимо улучшить в себе?",
  "Как я могу увеличить свою эффективность?",
  "Как я могу уменьшить трудозатратность, сохранив или увеличив производительность?",
  "Как я могу структурировать свой день так, чтобы он стал максимально продуктивным?",
  "Какие ошибки я совершил, и какой алгоритм поможет их избежать в будущем?",
  "Что мне не нравилось в последние дни? Что я могу изменить, чтобы это не повторялось?",
  "Какие знания наиболее важны для меня на данный момент?",
  "Какие навыки наиболее важны для меня на данный момент?",
  "Какие привычки наиболее важны для меня на данный момент?",
  "Что для меня сейчас является приоритетным?",
  "Что мне следует автоматизировать или делегировать?",
  "Чего не хватает в моей жизни для полноты и гармонии?",
  "От чего или кого мне нужно освободить свою жизнь?",
  "Что мне нужно точно добавить в свою жизнь?",
  "Какие ограничивающие убеждения мешают моему развитию?",
  "С какими проблемами я сталкиваюсь чаще всего и как их можно решить?",
  "Каким я должен стать человеком, чтобы решить свои проблемы?",
  "Какие дела истощают мою энергию?",
  "Какие новые убеждения я могу встроить в себя, чтобы усилить себя?",
  "Какие действия я откладываю, хотя знаю, что они важны для моего развития?",
  "Какие действия приносят мне радость и вдохновение, и как я могу включить их в свой день?",
  "Какие мои таланты я не развиваю?",
  "В каких ситуациях я чувствую себя наиболее энергичным и вдохновленным?",
  "Что я знаю, но не применяю в своей жизни?",
  "Какие внутренние принципы мне стоит внедрить, чтобы стать лучше?",
  "Какие новые возможности для роста я упускаю из виду?",
  "Какие мои сильные стороны я использую недостаточно?",
  "Где я чаще всего иду на компромисс с самим собой и как я могу это изменить?",
  "Что я делаю по инерции, а не потому что это действительно нужно?",
  "Свободное самоулучшение: задавайте и отвечайте на любые вопросы по самоулучшению, которые приходят в голову.",
];

interface Answer {
  ts: number; // unix ms
  text: string;
}

type Store = Record<number, Answer[]>; // questionIndex (1-based) -> answers

const STORAGE_KEY = "self-improve-v1";

function loadStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Store) : {};
  } catch {
    return {};
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

function fmtDate(ts: number): string {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}.${mm}.${yy}`;
}

// ---------- Screens ----------

type Screen =
  | { name: "main" }
  | { name: "pick" }
  | { name: "answer"; q: number }
  | { name: "myList" }
  | { name: "history"; q: number }
  | { name: "instruction" };

function SelfImproveScreen() {
  const navigate = useNavigate();
  const [store, setStore] = useState<Store>({});
  const [screen, setScreen] = useState<Screen>({ name: "main" });
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  function addAnswer(q: number, text: string) {
    const next: Store = { ...store, [q]: [...(store[q] || []), { ts: Date.now(), text }] };
    setStore(next);
    saveStore(next);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2000);
    setTimeout(() => setScreen({ name: "pick" }), 400);
  }

  // -- subscreens
  if (screen.name === "pick") {
    return (
      <PickScreen
        store={store}
        onBack={() => setScreen({ name: "main" })}
        onPick={(q) => setScreen({ name: "answer", q })}
      />
    );
  }
  if (screen.name === "answer") {
    return (
      <AnswerScreen
        q={screen.q}
        store={store}
        onBack={() => setScreen({ name: "pick" })}
        onSave={(text) => addAnswer(screen.q, text)}
        savedBanner={savedBanner}
      />
    );
  }
  if (screen.name === "myList") {
    return (
      <MyListScreen
        store={store}
        onBack={() => setScreen({ name: "main" })}
        onPick={(q) => setScreen({ name: "history", q })}
      />
    );
  }
  if (screen.name === "history") {
    return (
      <HistoryScreen
        q={screen.q}
        store={store}
        onBack={() => setScreen({ name: "myList" })}
        onAddMore={() => setScreen({ name: "answer", q: screen.q })}
        onAllQuestions={() => setScreen({ name: "pick" })}
        onMain={() => setScreen({ name: "main" })}
      />
    );
  }
  if (screen.name === "instruction") {
    return <InstructionScreen onBack={() => setScreen({ name: "main" })} />;
  }

  // -- main
  return (
    <div className="min-h-screen bg-background">
      <Header title="Самоулучшение" onBack={() => navigate({ to: "/sections" })} />
      <div className="px-4 pb-32 pt-6">
        <div className="flex flex-col gap-3">
          <button
            className="rounded-[14px] py-[15px] text-[15px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
            onClick={() => setScreen({ name: "pick" })}
          >
            ❓ Начать практику
          </button>
          <button
            className="rounded-[14px] py-[15px] text-[15px] font-semibold"
            style={{ border: "1.5px solid #FF6D00", color: "#FF6D00" }}
            onClick={() => setScreen({ name: "myList" })}
          >
            💬 Мои ответы на вопросы
          </button>
        </div>

      </div>
    </div>
  );
}

// ---------- Header ----------

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between bg-background px-3 py-3">
      <BackButton onClick={onBack} />
      <div className="text-[15px] font-semibold text-[#1a1a1a]">{title}</div>
      <div className="w-[70px]" />
    </div>
  );
}

// ---------- Pick Screen ----------

function PickScreen({
  store,
  onBack,
  onPick,
}: {
  store: Store;
  onBack: () => void;
  onPick: (q: number) => void;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Выбери вопрос" onBack={onBack} />
      <div className="px-4 pb-32 pt-4">
        <div className="mb-3 text-[13px] italic text-[#8a8a8a]">
          На какой вопрос хотите ответить?
        </div>
        <div className="flex flex-col gap-2.5">
          {QUESTIONS.map((text, i) => {
            const num = i + 1;
            const has = (store[num]?.length ?? 0) > 0;
            return (
              <button
                key={num}
                onClick={() => onPick(num)}
                className="flex items-start gap-3 rounded-[14px] bg-white px-4 py-3.5 text-left"
                style={{
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  borderLeft: has ? "3px solid #FF6D00" : "3px solid transparent",
                }}
              >
                <span className="min-w-[24px] text-[14px] font-bold text-[#FF6D00]">{num}.</span>
                <span className="flex-1 text-[14px] leading-[1.45] text-[#1a1a1a]">{text}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- Answer Screen ----------

function AnswerScreen({
  q,
  store,
  onBack,
  onSave,
  savedBanner,
}: {
  q: number;
  store: Store;
  onBack: () => void;
  onSave: (text: string) => void;
  savedBanner: boolean;
}) {
  const [text, setText] = useState("");
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const last = useMemo(() => {
    const arr = store[q] || [];
    return arr.length > 0 ? arr[arr.length - 1] : null;
  }, [store, q]);

  const len = text.length;
  const enough = len > 0;

  function autosize() {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(120, el.scrollHeight) + "px";
  }
  useEffect(() => {
    autosize();
  }, [text]);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Ответ на вопрос" onBack={onBack} />
      <div className="px-4 pb-32 pt-4">
        <div
          className="mb-4 rounded-[12px] px-3.5 py-3 text-[14px] font-semibold text-[#1a1a1a]"
          style={{ background: "#fff3e0" }}
        >
          {q}. {QUESTIONS[q - 1]}
        </div>

        {last && (
          <div className="mb-4">
            <div className="mb-1.5 text-[11px] font-semibold uppercase text-[#8a8a8a]">
              Последние ответы
            </div>
            <div
              className="rounded-[12px] bg-white px-4 py-3"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <div className="text-[13px] font-bold text-[#1a1a1a]">{fmtDate(last.ts)}</div>
              <div className="mt-1 whitespace-pre-wrap text-[13px] leading-[1.6] text-[#555]">
                {last.text}
              </div>
            </div>
          </div>
        )}

        <div
          className="mb-4 rounded-[14px] bg-white"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 4000))}
            placeholder="Напишите ответ..."
            maxLength={4000}
            className="w-full resize-none rounded-t-[14px] bg-transparent px-4 py-3.5 text-[14px] leading-[1.7] text-[#1a1a1a] outline-none"
            style={{ minHeight: 120 }}
          />
          <div
            className="flex items-center justify-end px-4 py-2.5 text-[12px]"
            style={{ borderTop: "1px solid #ede8df" }}
          >
            <span className="text-[#8a8a8a]">{len} / 4000</span>
          </div>
        </div>

        <button
          disabled={!enough}
          onClick={() => enough && onSave(text.trim())}
          className="w-full rounded-[14px] py-3.5 text-[15px] font-bold"
          style={
            enough
              ? { background: "linear-gradient(135deg, #FFB300, #FF6D00)", color: "#fff" }
              : { background: "#e5e7eb", color: "#9ca3af" }
          }
        >
          ✅ Сохранить ответ
        </button>

        {savedBanner && (
          <div
            className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-[12px] px-5 py-3 text-[14px] font-semibold text-white shadow-lg"
            style={{ background: "#16a34a" }}
          >
            ✅ Ответ сохранён!
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- My List Screen ----------

function MyListScreen({
  store,
  onBack,
  onPick,
}: {
  store: Store;
  onBack: () => void;
  onPick: (q: number) => void;
}) {
  const answered = QUESTIONS.map((t, i) => ({ num: i + 1, text: t }))
    .filter((x) => (store[x.num]?.length ?? 0) > 0);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Мои ответы" onBack={onBack} />
      <div className="px-4 pb-32 pt-4">
        <div className="mb-3 text-[13px] italic text-[#8a8a8a]">
          На какой вопрос хотите посмотреть ответы?
        </div>
        {answered.length === 0 ? (
          <div className="py-16 text-center text-[14px] text-[#8a8a8a]">
            У тебя пока нет сохранённых ответов
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {answered.map(({ num, text }) => (
              <button
                key={num}
                onClick={() => onPick(num)}
                className="flex items-start gap-3 rounded-[14px] bg-white px-4 py-3.5 text-left"
                style={{
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  borderLeft: "3px solid #FF6D00",
                }}
              >
                <span className="min-w-[24px] text-[14px] font-bold text-[#FF6D00]">{num}.</span>
                <span className="flex-1 text-[14px] leading-[1.45] text-[#1a1a1a]">{text}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- History Screen ----------

function HistoryScreen({
  q,
  store,
  onBack,
  onAddMore,
  onAllQuestions,
  onMain,
}: {
  q: number;
  store: Store;
  onBack: () => void;
  onAddMore: () => void;
  onAllQuestions: () => void;
  onMain: () => void;
}) {
  const answers = [...(store[q] || [])].sort((a, b) => a.ts - b.ts);
  return (
    <div className="min-h-screen bg-background">
      <Header title={`Вопрос ${q}`} onBack={onBack} />
      <div className="px-4 pb-32 pt-4">
        <div
          className="mb-4 rounded-[12px] px-3.5 py-3 text-[14px] font-semibold text-[#1a1a1a]"
          style={{ background: "#fff3e0" }}
        >
          {q}. {QUESTIONS[q - 1]}
        </div>

        <div className="mb-2 text-[11px] font-semibold uppercase text-[#8a8a8a]">Ответы</div>
        <div
          className="mb-6 rounded-[14px] bg-white px-4 py-2"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
          {answers.map((a, i) => (
            <div
              key={a.ts}
              className="py-3"
              style={i < answers.length - 1 ? { borderBottom: "1px solid #ede8df" } : undefined}
            >
              <div className="text-[13px] font-bold text-[#1a1a1a]">{fmtDate(a.ts)}</div>
              <div className="mt-1 whitespace-pre-wrap text-[13px] leading-[1.6] text-[#555]">
                {a.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onAddMore}
            className="rounded-[14px] py-3.5 text-[14px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
          >
            Добавить ещё ответ
          </button>
          <button
            onClick={onAllQuestions}
            className="rounded-[14px] py-3 text-[14px] font-semibold"
            style={{ border: "1.5px solid #FF6D00", color: "#FF6D00" }}
          >
            К списку всех вопросов
          </button>
          <button
            onClick={onMain}
            className="rounded-[14px] py-3 text-[14px] font-semibold"
            style={{ border: "1.5px solid #ede8df", color: "#8a8a8a" }}
          >
            ← Назад в раздел
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Instruction Screen ----------

function InstructionScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Инструкция" onBack={onBack} />
      <div className="px-4 pb-32 pt-4">
        <div
          className="rounded-[14px] bg-white px-5 py-5 text-[14px] leading-[1.7] text-[#333]"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
          <p className="mb-3">
            Раздел «Самоулучшение» — это 30 глубоких вопросов для рефлексии. Ты выбираешь вопрос,
            который тебе сейчас откликается, и развёрнуто на него отвечаешь.
          </p>
          <p className="mb-3">
            На один вопрос можно отвечать сколько угодно раз — каждый ответ сохраняется с датой.
            Спустя время полезно перечитать прошлые ответы и увидеть, как изменилось твоё мышление.
          </p>
          <p>
            Это <b>не</b> ежедневная практика — здесь нет серий и счётчиков. Заходи когда чувствуешь
            потребность остановиться и подумать.
          </p>
        </div>
      </div>
    </div>
  );
}
