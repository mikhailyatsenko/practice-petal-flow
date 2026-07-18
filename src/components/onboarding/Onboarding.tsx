import { useState } from "react";
import { Cake, Clock, Play, Sparkles, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TIMEZONES, getTimezone, setTimezone } from "@/lib/timezoneStore";
import { getBirthday, setBirthday, type Birthday } from "@/lib/birthdayStore";
import { BirthdayWheel } from "@/components/onboarding/BirthdayWheel";

interface OnboardingProps {
  onComplete: () => void;
  onClose?: () => void; // если показано из меню — есть крестик
}

const CODE_WORD = "клуб";

export function Onboarding({ onComplete, onClose }: OnboardingProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [step, setStep] = useState<"code" | "tz">("code");
  const [tz, setTz] = useState<string>(() => getTimezone());
  const [birthday, setBirthdayState] = useState<Birthday>(
    () => getBirthday() ?? { day: 15, month: 6, year: 1995 },
  );

  const handleSubmit = () => {
    if (code.trim().toLowerCase() === CODE_WORD) {
      setError(false);
      setStep("tz");
    } else {
      setError(true);
    }
  };

  const handleSaveTz = () => {
    setTimezone(tz);
    setBirthday(birthday);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-background">
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="tap absolute right-4 top-4 z-10 h-9 w-9 rounded-full bg-card hairline shadow-card flex items-center justify-center"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </button>
      )}

      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-8 safe-top safe-bottom">
        {step === "code" ? (
          <>
            {/* Бейдж */}
            <div className="flex justify-center">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-white"
                style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
              >
                <Sparkles className="h-3.5 w-3.5" /> Добро пожаловать
              </span>
            </div>

            {/* Заголовок */}
            <h1 className="mt-5 text-center text-[26px] font-semibold leading-tight tracking-tight">
              Твой путь начинается здесь
            </h1>
            <p className="mt-2.5 text-center text-[14px] leading-snug text-muted-foreground">
              Посмотри вводное видео и введи кодовое слово — клуб откроется
            </p>

            {/* Видео-карточка */}
            <div className="mt-6 bg-card hairline rounded-2xl overflow-hidden shadow-card">
              <div
                className="relative aspect-video w-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #2a1a05 0%, #4a2c0a 50%, #1a0e00 100%)",
                }}
              >
                <button
                  aria-label="Воспроизвести"
                  className="tap h-16 w-16 rounded-full flex items-center justify-center text-white shadow-lg"
                  style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
                >
                  <Play className="h-7 w-7 fill-white ml-1" />
                </button>
                <span className="absolute bottom-2.5 right-3 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
                  9:00
                </span>
              </div>
              <div className="px-4 py-3">
                <p className="text-[14px] font-medium leading-tight">Вводное видео</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  9 минут о том, как устроен клуб
                </p>
              </div>
            </div>

            {/* Карточка с кодом */}
            <div className="mt-4 bg-card hairline rounded-2xl shadow-card p-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-white text-[14px] font-semibold"
                  style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
                >
                  1
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium leading-tight">Кодовое слово</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground leading-tight">
                    Услышишь его в конце видео
                  </p>
                </div>
              </div>

              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Введи кодовое слово"
                className={
                  "mt-3.5 w-full rounded-xl bg-background px-4 py-3 text-[14px] outline-none transition-colors " +
                  (error ? "border border-destructive" : "hairline focus:border-primary")
                }
              />
              {error && (
                <p className="mt-1.5 text-[11px] text-destructive">
                  Кодовое слово не подходит — попробуй ещё раз
                </p>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={handleSubmit}
              className="tap mt-5 w-full rounded-2xl py-3.5 text-[15px] font-medium text-white"
              style={{
                background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                boxShadow: "0 8px 24px rgba(255, 109, 0, 0.35)",
              }}
            >
              Войти в клуб →
            </button>

            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              Подсказка для теста: кодовое слово — «клуб»
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-white"
                style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
              >
                <Clock className="h-3.5 w-3.5" /> Последний шаг
              </span>
            </div>

            <h1 className="mt-5 text-center text-[26px] font-semibold leading-tight tracking-tight">
              Выбери свой часовой пояс
            </h1>
            <p className="mt-2.5 text-center text-[14px] leading-snug text-muted-foreground">
              По нему будут считаться сутки, задания и сроки в клубе
            </p>

            <div className="mt-6 bg-card hairline rounded-2xl shadow-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-[18px] w-[18px] text-primary" strokeWidth={2} />
                <p className="text-[14px] font-medium">Часовой пояс</p>
              </div>
              <Select value={tz} onValueChange={setTz}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите часовой пояс" />
                </SelectTrigger>
                <SelectContent className="max-h-[50vh]">
                  {TIMEZONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Позже можно изменить в разделе «Настройки»
              </p>
            </div>

            <div className="mt-4 bg-card hairline rounded-2xl shadow-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Cake className="h-[18px] w-[18px] text-primary" strokeWidth={2} />
                <p className="text-[14px] font-medium">Дата рождения</p>
              </div>
              <BirthdayWheel value={birthday} onChange={setBirthdayState} />
              <p className="mt-3 text-[11px] text-muted-foreground">
                Покрути барабаны, чтобы выбрать день, месяц и год
              </p>
            </div>



            <button
              onClick={handleSaveTz}
              className="tap mt-5 w-full rounded-2xl py-3.5 text-[15px] font-medium text-white"
              style={{
                background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                boxShadow: "0 8px 24px rgba(255, 109, 0, 0.35)",
              }}
            >
              Сохранить и войти →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
