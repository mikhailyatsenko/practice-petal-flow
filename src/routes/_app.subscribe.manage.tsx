import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { BackButton } from "@/components/layout/BackButton";
import { AlertTriangle, CheckCircle2, CreditCard } from "lucide-react";

export const Route = createFileRoute("/_app/subscribe/manage")({
  head: () => ({ meta: [{ title: "Управление подпиской" }] }),
  component: ManageScreen,
});

const MIN_REASON = 30;
const NEXT_DATE = "01.05.2026";
const AMOUNT = "1 000 ₽";

type Step = "overview" | "warning" | "reason" | "done";

const BONUS_BALANCE = "1 000 ₽";
const BONUS_ACCRUAL_DATE = "01.05.2026";
const BONUS_ACCRUAL_AMOUNT = "1 000 ₽";

type Mode = "paid" | "free";

function ManageScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("overview");
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState<Mode>("paid");

  return (
    <div className="min-h-screen bg-background px-5 pt-3 pb-10">
      <div className="flex items-center justify-between">
        <BackButton onClick={() => (step === "overview" ? router.history.back() : setStep("overview"))} />
        <div className="flex items-center rounded-full bg-card hairline p-1">
          <button
            onClick={() => setMode("paid")}
            className={`tap flex h-8 w-8 items-center justify-center rounded-full text-[16px] transition-colors ${
              mode === "paid" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
            title="Оплата картой"
          >
            <CreditCard className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMode("free")}
            className={`tap flex h-8 w-8 items-center justify-center rounded-full text-[16px] transition-colors ${
              mode === "free" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
            title="Бесплатный клуб"
          >
            🎁
          </button>
        </div>
      </div>

      {step === "overview" && (
        <div className="mt-3 animate-fade-up">
          <div className="text-center">
            <div className="text-[13px] text-muted-foreground">Ваша подписка</div>
            <div className="text-[20px] font-bold">Клуб «Моя жизнь»</div>
          </div>

          {mode === "paid" ? (
            <div className="mt-5 rounded-2xl bg-card hairline p-5">
              <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Подписка активна
              </div>
              <div className="mt-3 text-[14px]">
                Следующее списание — <b>{NEXT_DATE}</b>
              </div>
              <div className="mt-1 text-[14px]">
                Сумма — <b>{AMOUNT}</b>
              </div>
              <p className="mt-4 text-[12px] text-muted-foreground leading-snug">
                Списание происходит автоматически каждые 30 дней с привязанной банковской карты.
              </p>
              <p className="mt-3 text-[12px] leading-snug text-foreground">
                Вы можете сделать клуб бесплатным и не платить за подписку. Для этого нажмите кнопку «Сделать клуб бесплатным» ниже.
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-card hairline p-5">
              <div className="flex items-center gap-2 text-[13px] text-success font-medium">
                <CheckCircle2 className="h-4 w-4 text-success" />
                У вас бесплатный клуб 🎉
              </div>
              <div className="mt-4 rounded-xl p-3" style={{ background: "linear-gradient(135deg, #FFF7E6, #FFE9C7)" }}>
                <div className="text-[12px] text-muted-foreground">Баланс бонусов</div>
                <div className="text-[22px] font-bold" style={{ color: "#B45309" }}>{BONUS_BALANCE}</div>
              </div>
              <div className="mt-4 text-[14px]">
                <b>{BONUS_ACCRUAL_DATE}</b> — начисление <b>{BONUS_ACCRUAL_AMOUNT}</b> бонусов за приведённого друга
              </div>
              <div className="mt-2 text-[14px]">
                <b>{NEXT_DATE}</b> — списание <b>{AMOUNT}</b> бонусов за подписку
              </div>
              <p className="mt-4 text-[12px] text-muted-foreground leading-snug">
                1-го числа каждого месяца вам начисляется 1 000 бонусов за каждого приведённого друга. Списание за подписку происходит бонусами — пока их хватает, клуб остаётся бесплатным.
              </p>
              <p className="mt-3 text-[12px] leading-snug text-foreground">
                Приведите ещё друга, чтобы увеличить бонусный баланс и продлить бесплатный период.
              </p>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => router.navigate({ to: "/partner" })}
              className="tap flex items-center justify-center rounded-2xl py-3 text-[13px] font-semibold text-white shadow-card text-center leading-tight"
              style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
            >
              {mode === "paid" ? "Сделать клуб бесплатным" : "Привести ещё друга"}
            </button>
            <button
              onClick={() => setStep("warning")}
              className="tap flex items-center justify-center rounded-2xl border border-destructive/40 py-3 text-[13px] font-semibold text-destructive"
            >
              Отписаться
            </button>
          </div>
        </div>
      )}

      {step === "warning" && (
        <div className="mt-3 animate-fade-up">
          <div
            className="rounded-2xl p-5"
            style={{ background: "#FEF2F2", border: "1px solid #FCA5A5" }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 shrink-0 text-destructive" />
              <div>
                <div className="text-[16px] font-bold text-destructive">Внимание!</div>
                <p className="mt-2 text-[14px] leading-snug text-[#7f1d1d]">
                  При отписке ваш аккаунт будет <b>полностью удалён</b>.
                </p>
                <p className="mt-2 text-[14px] leading-snug text-[#7f1d1d]">
                  Вы потеряете все свои желания, цели, привычки, задачи и весь прогресс. Это действие необратимо.
                </p>
                <p className="mt-3 text-[14px] leading-snug text-[#7f1d1d]">
                  <span className="mr-1">👉</span>
                  <b>Вернуться в клуб будет нельзя.</b> После выхода повторное вступление невозможно.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => setStep("reason")}
              className="tap flex w-full items-center justify-center rounded-2xl bg-destructive py-4 text-[15px] font-semibold text-white"
            >
              Да, я точно готов отписаться
            </button>
            <button
              onClick={() => setStep("overview")}
              className="tap flex w-full items-center justify-center rounded-2xl bg-card hairline py-4 text-[15px] font-semibold text-foreground"
            >
              Остаться в клубе
            </button>
          </div>
        </div>
      )}

      {step === "reason" && (
        <div className="mt-3 animate-fade-up">
          <h1 className="text-[20px] font-bold">Расскажите, почему вы уходите</h1>
          <p className="mt-2 text-[13px] text-muted-foreground leading-snug">
            Что вам не хватило в клубе? Ваш ответ поможет нам стать лучше. Минимум {MIN_REASON} символов.
          </p>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Напишите, что вам не подошло..."
            rows={6}
            className="mt-4 w-full resize-none rounded-2xl bg-card hairline p-4 text-[14px] leading-snug outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="mt-1 text-right text-[12px] text-muted-foreground">
            {reason.trim().length} / {MIN_REASON}
          </div>

          <button
            onClick={() => reason.trim().length >= MIN_REASON && setStep("done")}
            disabled={reason.trim().length < MIN_REASON}
            className="tap mt-4 flex w-full items-center justify-center rounded-2xl bg-destructive py-4 text-[15px] font-semibold text-white transition-opacity"
            style={{ opacity: reason.trim().length >= MIN_REASON ? 1 : 0.4 }}
          >
            Отписаться и удалить аккаунт
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="mt-16 animate-fade-up text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="mt-5 text-[20px] font-bold">Подписка отменена</h1>
          <p className="mt-2 text-[14px] text-muted-foreground leading-snug">
            Спасибо за обратную связь. Ваш аккаунт удалён. Будем рады видеть вас снова.
          </p>
          <button
            onClick={() => router.navigate({ to: "/welcome" })}
            className="tap mt-8 inline-flex items-center justify-center rounded-2xl bg-card hairline px-6 py-3 text-[14px] font-medium"
          >
            На главную
          </button>
        </div>
      )}
    </div>
  );
}

