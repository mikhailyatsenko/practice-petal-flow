import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";
import { BackButton } from "@/components/layout/BackButton";
import {
  buddyCardProgress,
  isBuddyCardFilled,
  type BuddyCard,
} from "@/lib/buddyCardStore";
import {
  getFoursomeProfile,
  saveFoursomeProfile,
} from "@/lib/foursomeProfileStore";
import { findFoursomeMember, fullName } from "@/lib/foursomeDemo";

export const Route = createFileRoute("/_app/foursome-profile/$userId")({
  head: () => ({
    meta: [
      { title: "Карточка участника — Четвёрка" },
      { name: "description", content: "Карточка участника Четвёрки — цель, желания, сильные стороны, поддержка." },
    ],
  }),
  component: FoursomeParticipantCardForm,
});

function FoursomeParticipantCardForm() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const member = findFoursomeMember(userId);
  const isMe = userId === "me";

  const [card, setCard] = useState<BuddyCard>(() => getFoursomeProfile(userId));
  const initiallyFilled = isBuddyCardFilled(getFoursomeProfile(userId));
  const [mode, setMode] = useState<"view" | "edit">(initiallyFilled ? "view" : "edit");

  const progress = buddyCardProgress(card);
  const filled = isBuddyCardFilled(card);
  const readOnly = mode === "view";

  const update = (patch: Partial<BuddyCard>) => setCard((c) => ({ ...c, ...patch }));
  const updateSphere = (i: 0 | 1 | 2, v: string) =>
    setCard((c) => {
      const next = [...c.spheres] as [string, string, string];
      next[i] = v;
      return { ...c, spheres: next };
    });

  const onSave = () => {
    if (!filled) return;
    saveFoursomeProfile(userId, card);
    setMode("view");
  };

  const goBack = () => navigate({ to: "/foursome", search: { demo: "has" } });
  const title = isMe ? "Моя карточка" : "Карточка участника";

  return (
    <div className="px-4 pb-8">
      {/* Header */}
      <div className="relative flex items-center px-1 pt-2 pb-3">
        <div className="relative z-10">
          <BackButton onClick={goBack} />
        </div>
        <h1 className="pointer-events-none absolute left-0 right-0 text-center text-[18px] font-semibold leading-tight">
          {title}
        </h1>
      </div>

      {/* Профиль-шапка участника */}
      {member && (
        <div
          className="rounded-2xl p-4 mb-3 flex items-center gap-3"
          style={{ background: "#FAF6EF", border: "1px solid #ede8df" }}
        >
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center text-[24px] shrink-0"
            style={{ background: "#fff" }}
          >
            {member.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold truncate">{fullName(member)}</div>
            <div className="text-[12px] text-muted-foreground truncate">{member.job}</div>
          </div>
          {readOnly && initiallyFilled && (
            <button
              onClick={() => setMode("edit")}
              className="tap text-[12px] font-bold px-3 py-1.5 rounded-full"
              style={{ background: "#fff3e0", color: "#FF6D00" }}
            >
              Изменить
            </button>
          )}
        </div>
      )}

      {/* Прогресс — только в режиме редактирования */}
      {!readOnly && (
        <div className="mt-2 animate-fade-up">
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "#f0ebe2" }}>
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
      )}

      {/* Q1 */}
      <FieldCard
        num={1}
        title="Главная цель на 1–2 года"
        hint="Один большой результат, который он хотел бы получить за ближайшие 1–2 года"
      >
        {readOnly ? (
          <ReadValue value={card.goal} />
        ) : (
          <AutoResizeTextarea
            value={card.goal}
            onChange={(e) => update({ goal: e.target.value })}
            placeholder="Например: открыть своё дело и выйти на доход 300 тысяч в месяц"
            className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#FF6D00]"
            style={{ background: "#FAF6EF", border: "1px solid #ece4d4", lineHeight: 1.5, minHeight: 80 }}
          />
        )}
      </FieldCard>

      {/* Q2 */}
      <FieldCard
        num={2}
        title="3 желания"
        hint="Три желания, которые он хочет чтобы случились. Желание — это не цель с планом, а просто то, чего он хочет"
      >
        {readOnly ? (
          <div className="space-y-1.5">
            {card.spheres.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {i + 1}
                </span>
                <ReadValue value={s} className="flex-1" />
              </div>
            ))}
          </div>
        ) : (
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
                  placeholder={["Например: съездить в Японию", "Например: научиться готовить", "Например: купить велосипед"][i]}
                  className="flex-1 rounded-xl px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#FF6D00]"
                  style={{ background: "#FAF6EF", border: "1px solid #ece4d4" }}
                />
              </div>
            ))}
          </div>
        )}
      </FieldCard>

      {/* Q3 */}
      <FieldCard
        num={3}
        title="Сильные стороны"
        hint="В чём он действительно силён — таланты, качества и преимущества, которые помогают достигать результатов"
      >
        {readOnly ? (
          <ReadValue value={card.strengths} />
        ) : (
          <AutoResizeTextarea
            value={card.strengths}
            onChange={(e) => update({ strengths: e.target.value })}
            placeholder="Например: целеустремлённый, умеет слушать, системно мыслит"
            className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#FF6D00]"
            style={{ background: "#FAF6EF", border: "1px solid #ece4d4", lineHeight: 1.5, minHeight: 80 }}
          />
        )}
      </FieldCard>

      {/* Q4 */}
      <FieldCard
        num={4}
        title="Что мешает достигать успеха"
        hint="Что чаще всего останавливает на пути к цели — внутренние препятствия, которые он сам признаёт"
      >
        {readOnly ? (
          <ReadValue value={card.blockers} />
        ) : (
          <AutoResizeTextarea
            value={card.blockers}
            onChange={(e) => update({ blockers: e.target.value })}
            placeholder="Например: откладывает важные решения, боится оценки других"
            className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#FF6D00]"
            style={{ background: "#FAF6EF", border: "1px solid #ece4d4", lineHeight: 1.5, minHeight: 80 }}
          />
        )}
      </FieldCard>

      {/* Q5 */}
      <FieldCard
        num={5}
        title="В чём нужна поддержка"
        hint="Какая поддержка для него важнее всего — где помощь будет наиболее ценной"
      >
        {readOnly ? (
          <ReadValue value={card.support} />
        ) : (
          <AutoResizeTextarea
            value={card.support}
            onChange={(e) => update({ support: e.target.value })}
            placeholder="Например: напоминать о целях, задавать честные вопросы"
            className="w-full rounded-xl px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[#FF6D00]"
            style={{ background: "#FAF6EF", border: "1px solid #ece4d4", lineHeight: 1.5, minHeight: 80 }}
          />
        )}
      </FieldCard>

      {!readOnly && (
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
          Сохранить карточку участника
        </button>
      )}

      {readOnly && !initiallyFilled && (
        <button
          onClick={() => setMode("edit")}
          className="tap mt-5 w-full rounded-2xl py-3.5 text-[15px] font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #FFB300, #FF6D00)",
            boxShadow: "0 6px 20px rgba(255,109,0,0.35)",
          }}
        >
          Заполнить карточку участника
        </button>
      )}
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
        <p className="mb-3 text-[12px] leading-snug" style={{ color: "#a59a85" }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

function ReadValue({ value, className = "" }: { value: string; className?: string }) {
  const v = value?.trim();
  if (!v) {
    return (
      <p className={`text-[13px] italic text-muted-foreground ${className}`}>Не заполнено</p>
    );
  }
  return (
    <p className={`text-[14px] whitespace-pre-line ${className}`} style={{ lineHeight: 1.55 }}>
      {v}
    </p>
  );
}
