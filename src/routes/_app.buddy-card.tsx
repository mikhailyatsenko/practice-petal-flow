import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BackButton } from "@/components/layout/BackButton";
import {
  useBuddyCard,
  setBuddyCard,
  isBuddyCardFilled,
  buddyCardProgress,
  type BuddyCardData,
} from "@/lib/buddyCardStore";

export const Route = createFileRoute("/_app/buddy-card")({
  head: () => ({
    meta: [
      { title: "Карточка Бадди" },
      { name: "description", content: "Заполни карточку своего Бадди по 5 ключевым вопросам." },
    ],
  }),
  component: BuddyCardPage,
});

function BuddyCardPage() {
  const navigate = useNavigate();
  const initial = useBuddyCard();
  const [data, setData] = useState<BuddyCardData>(initial);

  const valid = isBuddyCardFilled(data);
  const progress = buddyCardProgress(data);

  const update = <K extends keyof BuddyCardData>(key: K, value: BuddyCardData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const updateSphere = (i: 0 | 1 | 2, value: string) => {
    setData((prev) => {
      const next = [...prev.spheres] as [string, string, string];
      next[i] = value;
      return { ...prev, spheres: next };
    });
  };

  const onSave = () => {
    if (!valid) return;
    setBuddyCard(data);
    navigate({ to: "/buddy", search: { demo: "has" } });
  };

  return (
    <div className="px-4 pb-8">
      <div className="relative flex items-center px-1 pt-2 pb-3">
        <div className="relative z-10">
          <BackButton onClick={() => navigate({ to: "/buddy", search: { demo: "has" } })} />
        </div>
        <h1 className="pointer-events-none absolute left-0 right-0 text-center text-[18px] font-semibold leading-tight">
          Карточка Бадди
        </h1>
      </div>

      {/* Progress */}
      <div className="mb-5">
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: 8, background: "#f0ebe2" }}
        >
          <div
            className="h-full transition-all"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(135deg, #FFB300, #FF6D00)",
            }}
          />
        </div>
        <p className="mt-2 text-[12px] text-center" style={{ color: progress === 100 ? "#FF6D00" : "var(--muted-foreground)", fontWeight: progress === 100 ? 700 : 500 }}>
          {progress === 100 ? "Все поля заполнены — можно сохранять!" : `Заполнено ${progress}%`}
        </p>
      </div>

      <div className="space-y-4">
        <QuestionCard
          number={1}
          title="Главная цель моего Бадди на 1–2 года"
          hint="Запиши одним предложением то, к чему стремится твой Бадди"
        >
          <Textarea
            value={data.goal}
            onChange={(v) => update("goal", v)}
            placeholder="Например: Запустить онлайн-школу и выйти на 500к/мес"
          />
        </QuestionCard>

        <QuestionCard
          number={2}
          title="3 сферы жизни которые Бадди хочет улучшить больше всего"
          hint="Запиши три сферы — здоровье, финансы, отношения и т.д."
        >
          <div className="space-y-2">
            {([0, 1, 2] as const).map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span
                  className="shrink-0 flex items-center justify-center rounded-full text-white text-[12px] font-bold"
                  style={{ width: 26, height: 26, background: "#FFB300" }}
                >
                  {i + 1}
                </span>
                <input
                  value={data.spheres[i]}
                  onChange={(e) => updateSphere(i, e.target.value)}
                  placeholder={["Например: здоровье", "Например: финансы", "Например: отношения"][i]}
                  className="flex-1 bg-card rounded-xl px-3.5 py-2.5 text-[14px] outline-none transition-colors"
                  style={{ border: `1px solid ${data.spheres[i] ? "#FF6D00" : "#ede8df"}` }}
                />
              </div>
            ))}
          </div>
        </QuestionCard>

        <QuestionCard
          number={3}
          title="Сильные стороны моего Бадди"
          hint="Что ты заметил в своём Бадди — его таланты, качества, преимущества"
        >
          <Textarea
            value={data.strengths}
            onChange={(v) => update("strengths", v)}
            placeholder="Например: Системность, упорство, умение слышать"
          />
        </QuestionCard>

        <QuestionCard
          number={4}
          title="Что как правило мешает моему Бадди достигать успеха"
          hint="Запиши честно — страхи, привычки, паттерны которые он сам называл"
        >
          <Textarea
            value={data.obstacles}
            onChange={(v) => update("obstacles", v)}
            placeholder="Например: Прокрастинация, страх ошибки"
          />
        </QuestionCard>

        <QuestionCard
          number={5}
          title="В чём моему Бадди нужна моя поддержка больше всего"
          hint="Как ты можешь помочь своему Бадди — что для него важно от тебя"
        >
          <Textarea
            value={data.support}
            onChange={(v) => update("support", v)}
            placeholder="Например: Напоминать о фокусе, не давать сливаться"
          />
        </QuestionCard>

        <button
          disabled={!valid}
          onClick={onSave}
          className="w-full rounded-2xl py-3.5 text-[14px] font-bold transition-all"
          style={
            valid
              ? {
                  background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                  color: "#fff",
                  boxShadow: "0 6px 20px rgba(255,109,0,0.40)",
                  cursor: "pointer",
                }
              : {
                  background: "#ede8df",
                  color: "#9a8e7a",
                  cursor: "not-allowed",
                }
          }
        >
          Сохранить карточку Бадди
        </button>
      </div>
    </div>
  );
}

function QuestionCard({
  number,
  title,
  hint,
  children,
}: {
  number: number;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card hairline shadow-card rounded-2xl p-4 animate-fade-up">
      <div className="flex items-start gap-2.5 mb-1">
        <span
          className="shrink-0 flex items-center justify-center rounded-full text-white text-[12px] font-bold mt-0.5"
          style={{ width: 24, height: 24, background: "#FFB300" }}
        >
          {number}
        </span>
        <h3 className="text-[14px] font-bold leading-snug">{title}</h3>
      </div>
      <p className="text-[12px] text-muted-foreground mb-3 ml-[34px] leading-snug">{hint}</p>
      {children}
    </div>
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-card rounded-xl px-3.5 py-3 text-[14px] outline-none transition-colors resize-none"
      style={{ minHeight: 90, border: `1px solid ${value ? "#FF6D00" : "#ede8df"}` }}
    />
  );
}
