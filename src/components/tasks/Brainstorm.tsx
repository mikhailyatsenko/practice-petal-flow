import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";

export const BRAINSTORM_QUESTIONS: string[] = [
  "Какие ключевые факторы успеха для достижения этой цели? Какие 20% усилий принесут 80% результата?",
  "Какой золотой ключик — 1% действий может принести 99% результата?",
  "Как я могу измерять ключевые факторы успеха, чтобы у меня появились ключевые показатели эффективности?",
  "Какие препятствия могут возникнуть на пути к этой цели, и как я могу их преодолеть?",
  "Какие ресурсы У МЕНЯ ЕСТЬ, чтобы двигаться к этой цели?",
  "Какие ресурсы МНЕ НУЖНЫ, чтобы достичь этой цели?",
  "Какие знания мне нужно иметь, чтобы достичь этой цели?",
  "Какие убеждения мне нужно иметь, чтобы стать человеком с таким результатом?",
  "Какие навыки/умения мне нужно иметь, чтобы достичь этой цели?",
  "В каком состоянии/энергии я должен находиться, чтобы эффективно двигаться к цели?",
  "Какие финансовые инвестиции требуются для достижения этой цели?",
  "Какие регулярные действия и привычки мне нужно сформировать?",
  "Какое окружение должно быть у человека с таким результатом?",
  "Какие качества характера мне нужно развить, чтобы соответствовать этой цели?",
  "Что я должен перестать делать/быть, чтобы соответствовать этому результату?",
  "Какой образ жизни ведёт человек, который имеет этот результат?",
  "Кто уже достиг этой цели и может быть примером/ролевой моделью для меня?",
  "Какие технологии или инструменты могут ускорить достижение цели?",
  "Кто может помочь мне в достижении этой цели?",
  "Кто может стать моим наставником в достижении цели?",
  "Какие альтернативные пути достижения цели я могу рассмотреть?",
  "Как я могу создать среду, которая будет способствовать достижению цели?",
  "Что я готов принести в жертву ради достижения этой цели?",
  "Какие страхи мешают мне двигаться к цели?",
  "Какие убеждения мне мешают стать человеком с таким результатом?",
  "На каком этапе я сейчас? Что мешает перейти к следующему этапу?",
  "Что может сделать процесс достижения цели более лёгким или приятным?",
  "Что я могу делегировать или автоматизировать, чтобы сосредоточиться на главном?",
  "История изменений моей цели: что я менял, почему это происходило и как это повлияло на мой путь.",
  "Свободный мозговой штурм: задавайте и отвечайте на любые вопросы, которые приходят в голову.",
];

/* ---------------- Список вопросов ---------------- */

export function BrainstormListScreen({
  goalTitle,
  answers,
  onBack,
  onSwitchToPlan,
  onOpenQuestion,
}: {
  goalTitle: string;
  answers: Record<number, string>;
  onBack: () => void;
  onSwitchToPlan?: () => void;
  onOpenQuestion: (idx: number) => void;
}) {
  return (
    <div className="px-4 pt-3 pb-6 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="tap inline-flex items-center gap-1.5 text-[14px] font-medium"
          style={{ color: "#FF6D00" }}
        >
          <ArrowLeft className="h-4 w-4" /> Назад
        </button>
        <div className="inline-flex rounded-full p-1" style={{ background: "#f3efe7", border: "1px solid #ede8df" }}>
          <button
            onClick={onSwitchToPlan ?? onBack}
            className="tap rounded-full px-3.5 py-1.5 text-[12.5px] font-medium"
            style={{ background: "transparent", color: "#8a8a8a" }}
          >
            📝 План + Заметки
          </button>
          <button
            className="tap rounded-full px-3.5 py-1.5 text-[12.5px] font-medium"
            style={{ background: "linear-gradient(135deg,#FFB300,#FF6D00)", color: "#fff" }}
          >
            🧠 Мозговой штурм
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-[20px] font-bold leading-tight text-foreground">Мозговой штурм</h1>
        <p className="text-[12px]" style={{ color: "#8a8a8a" }}>Цель: {goalTitle}</p>
      </div>

      <div className="space-y-2.5 pt-1">
        {BRAINSTORM_QUESTIONS.map((q, i) => {
          const num = i + 1;
          const answer = answers[num];
          const hasAnswer = !!answer && answer.trim().length > 0;
          return (
            <button
              key={i}
              onClick={() => onOpenQuestion(num)}
              className="tap w-full text-left bg-card rounded-[14px] p-3 transition-colors active:bg-[#fff7ed]"
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                borderLeft: hasAnswer ? "3px solid #FF6D00" : "3px solid transparent",
              }}
            >
              <div className="flex items-center gap-2.5">
                <span className="shrink-0 text-[14px] font-bold" style={{ color: "#FF6D00" }}>{num}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-medium leading-snug text-foreground">{q}</p>
                  {hasAnswer && (
                    <p
                      className="mt-1 text-[12px] leading-snug"
                      style={{
                        color: "#8a8a8a",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {answer}
                    </p>
                  )}
                </div>
                {!hasAnswer && <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "#c5c5c5" }} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Экран ответа ---------------- */

const MAX_LEN = 4000;
const MIN_LEN = 100;

export function BrainstormAnswerScreen({
  questionNumber,
  initialAnswer,
  onBack,
  onSave,
}: {
  questionNumber: number;
  initialAnswer: string;
  onBack: () => void;
  onSave: (text: string) => void;
}) {
  const question = BRAINSTORM_QUESTIONS[questionNumber - 1];
  const [text, setText] = useState(initialAnswer);
  const [savedText, setSavedText] = useState(initialAnswer);
  const [savedFlash, setSavedFlash] = useState(false);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // auto-resize
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }, [text]);

  const len = text.length;
  const isDirty = text !== savedText;
  const canSave = text.trim().length > 0 && isDirty;

  const handleSave = () => {
    if (!canSave) return;
    onSave(text);
    setSavedText(text);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  };

  return (
    <div className="px-4 pt-3 pb-6 space-y-3">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="tap inline-flex items-center gap-1.5 text-[14px] font-medium" style={{ color: "#FF6D00" }}>
          <ArrowLeft className="h-4 w-4" /> К вопросам
        </button>
      </div>

      <div className="rounded-[12px] px-3.5 py-3" style={{ background: "#fff3e0" }}>
        <p className="text-[14px] font-bold leading-snug" style={{ color: "#1a1a1a" }}>
          <span style={{ color: "#FF6D00" }}>{questionNumber}.</span> {question}
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-card p-3.5" style={{ border: "1px solid #ede8df" }}>
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
          placeholder="Напишите свои мысли..."
          rows={3}
          className="w-full text-[15px] leading-[1.55] outline-none resize-none bg-transparent text-foreground placeholder:text-muted-foreground"
          style={{ minHeight: 72, border: "none" }}
        />
        <div className="mt-2 pt-2 flex items-center justify-between text-[11.5px]" style={{ borderTop: "1px solid #ede8df" }}>
          <span style={{ color: isDirty && text.trim().length > 0 ? "#FF6D00" : "#8a8a8a", fontWeight: isDirty ? 600 : 400 }}>
            {isDirty && text.trim().length > 0 ? "● Несохранённые изменения" : savedText.length > 0 ? "✓ Сохранено" : ""}
          </span>
          <span style={{ color: "#8a8a8a" }}>{len} / {MAX_LEN}</span>
        </div>
      </div>

      {savedFlash && (
        <div
          className="rounded-xl px-3.5 py-2.5 text-center text-[13px] font-medium animate-fade-up"
          style={{ background: "#dcfce7", color: "#16a34a", border: "1px solid #86efac" }}
        >
          ✅ Ответ сохранён!
        </div>
      )}

      <button
        disabled={!canSave}
        onClick={handleSave}
        className="tap w-full rounded-[14px] py-4 text-[15px] font-bold transition-all"
        style={
          canSave
            ? {
                background: "linear-gradient(135deg,#FFB300,#FF6D00)",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(255,109,0,0.35)",
              }
            : !isDirty && savedText.length > 0
            ? {
                background: "#fff",
                color: "#9ca3af",
                border: "1.5px solid #e5e7eb",
                cursor: "not-allowed",
              }
            : { background: "#d1d5db", color: "#9ca3af", cursor: "not-allowed" }
        }
      >
        {!isDirty && savedText.length > 0 ? "✓ Сохранено" : "Сохранить ответ"}
      </button>
    </div>
  );
}
