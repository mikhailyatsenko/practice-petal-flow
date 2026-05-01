import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BackButton } from "@/components/layout/BackButton";
import {
  getBuddyCard,
  setBuddyCard,
  isBuddyCardFilled,
  buddyCardProgress,
  type BuddyCard,
} from "@/lib/buddyCardStore";

export const Route = createFileRoute("/_app/my-buddy-card")({
  head: () => ({
    meta: [
      { title: "Карточка Бадди — Клуб «Моя жизнь»" },
      { name: "description", content: "Заполни карточку Бадди — расскажи о цели, сильных сторонах и поддержке." },
    ],
  }),
  component: MyBuddyCardForm,
});

function MyBuddyCardForm() {
  const navigate = useNavigate();
  const [card, setCard] = useState<BuddyCard>(() => getBuddyCard());

  const progress = buddyCardProgress(card);
  const filled = isBuddyCardFilled(card);

  const update = (patch: Partial<BuddyCard>) => setCard((c) => ({ ...c, ...patch }));
  const updateSphere = (i: 0 | 1 | 2, v: string) =>
    setCard((c) => {
      const next = [...c.spheres] as [string, string, string];
      next[i] = v;
      return { ...c, spheres: next };
    });

  const onSave = () => {
    if (!filled) return;
    setBuddyCard(card);
    navigate({ to: "/buddy", search: { demo: "has" } });
  };

  return (
    <div className="px-4 pb-8">
      {/* Header */}
      <div className="relative flex items-center px-1 pt-2 pb-3">
        <div className="relative z-10">
          <BackButton onClick={() => navigate({ to: "/buddy", search: { demo: "has" } })} />
        </div>
        <h1 className="pointer-events-none absolute left-0 right-0 text-center text-[18px] font-semibold leading-tight">
          Карточка Бадди
        </h1>
      </div>

      {/* Progress */}
      <div className="mt-2 animate-fade-up">
        <div
          className="h-2 w-full rounded-full overflow-hidden"
          style={{ background: "#f0ebe2" }}
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #FFB300, #FF6D00)",
            }}
          />
        </div>
        <p
          className="mt-2 text-[12px] font-medium text-center"
          style={{ color: progress === 100 ? "#4CAF50" : "#FF6D00" }}
        >
          {progress === 100 ? "Все поля заполнены — можно сохранять!" : `${progress}% заполнено`}
        </p>
      </div>

      {/* Q1 */}
      <FieldCard
        num={1}
        title="Главная цель на 1–2 года"
        hint="Опиши одним предложением куда он движется — что хочет создать, достичь или изменить в своей жизни за ближайшие 1–2 года"
      >
        <textarea
          value={card.goal}
          onChange={(e) => update({ goal: e.target.value })}
          rows={3}
          placeholder="Например: открыть своё дело и выйти на доход 300 тысяч в месяц"
          className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none resize-none transition-colors focus:border-[#FF6D00]"
          style={{ background: "#FAF6EF", border: "1px solid #ece4d4", lineHeight: 1.5 }}
        />
      </FieldCard>

      {/* Q2 */}
      <FieldCard
        num={2}
        title="3 сферы жизни"
        hint="В каких трёх сферах он хочет получить результат в первую очередь — где ему важнее всего сдвинуться с места"
      >
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <input
                value={card.spheres[i]}
                onChange={(e) => updateSphere(i as 0 | 1 | 2, e.target.value)}
                placeholder={["Например: финансы", "Например: здоровье", "Например: отношения"][i]}
                className="flex-1 rounded-xl px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#FF6D00]"
                style={{ background: "#FAF6EF", border: "1px solid #ece4d4" }}
              />
            </div>
          ))}
        </div>
      </FieldCard>

      {/* Q3 */}
      <FieldCard
        num={3}
        title="Сильные стороны"
        hint="В чём он действительно силён — его таланты, качества и преимущества которые помогают ему достигать результатов"
      >
        <textarea
          value={card.strengths}
          onChange={(e) => update({ strengths: e.target.value })}
          rows={3}
          placeholder="Например: целеустремлённый, умеет слушать, системно мыслит"
          className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none resize-none transition-colors focus:border-[#FF6D00]"
          style={{ background: "#FAF6EF", border: "1px solid #ece4d4", lineHeight: 1.5 }}
        />
      </FieldCard>

      {/* Q4 */}
      <FieldCard
        num={4}
        title="Что мешает достигать успеха"
        hint="Что чаще всего останавливает его на пути к цели — какие внутренние препятствия он сам признаёт, которые мешают ему достигать результатов"
      >
        <textarea
          value={card.blockers}
          onChange={(e) => update({ blockers: e.target.value })}
          rows={3}
          placeholder="Например: откладывает важные решения, боится оценки других"
          className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none resize-none transition-colors focus:border-[#FF6D00]"
          style={{ background: "#FAF6EF", border: "1px solid #ece4d4", lineHeight: 1.5 }}
        />
      </FieldCard>

      {/* Q5 */}
      <FieldCard
        num={5}
        title="В чём нужна моя поддержка"
        hint="Какая поддержка для него важнее всего — где твоя помощь будет для него наиболее ценной"
      >
        <textarea
          value={card.support}
          onChange={(e) => update({ support: e.target.value })}
          rows={3}
          placeholder="Например: напоминать о целях, задавать честные вопросы"
          className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none resize-none transition-colors focus:border-[#FF6D00]"
          style={{ background: "#FAF6EF", border: "1px solid #ece4d4", lineHeight: 1.5 }}
        />
      </FieldCard>

      {/* Save */}
      <button
        onClick={onSave}
        disabled={!filled}
        className="tap mt-5 w-full rounded-2xl py-3.5 text-[15px] font-bold transition-all"
        style={
          filled
            ? {
                background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                color: "#fff",
                boxShadow: "0 6px 20px rgba(255,109,0,0.35)",
              }
            : {
                background: "#ece4d4",
                color: "#a59a85",
                cursor: "not-allowed",
              }
        }
      >
        Сохранить карточку Бадди
      </button>
    </div>
  );
}

function FieldCard({
  num,
  title,
  hint,
  children,
}: {
  num: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3 bg-card hairline shadow-card rounded-2xl p-4 animate-fade-up">
      <div className="flex items-center gap-2 mb-3">
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "#FF6D00",
          }}
        >
          ВОПРОС {num}
        </span>
      </div>
      <h3 className="text-[14px] font-bold mb-2" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {title}
      </h3>
      {hint && (
        <p
          className="mb-3 text-[12px] leading-snug"
          style={{ color: "#a59a85" }}
        >
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}
