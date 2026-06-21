import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { BackButton } from "@/components/layout/BackButton";

export const Route = createFileRoute("/_app/subscribe/confirm")({
  validateSearch: z.object({ amount: z.number().default(1000) }),
  head: () => ({ meta: [{ title: "Подтверждение подписки" }] }),
  component: ConfirmScreen,
});

function ConfirmScreen() {
  const router = useRouter();
  const { amount } = Route.useSearch();
  const [c1, setC1] = useState(true);
  const [c2, setC2] = useState(true);
  const [c3, setC3] = useState(true);
  const allOk = c1 && c2 && c3;

  const onConfirm = () => {
    if (!allOk) return;
    window.open("https://example.com/pay", "_blank");
  };

  return (
    <div className="px-5 pt-3 pb-10">
      <BackButton onClick={() => router.history.back()} />

      <div
        className="mt-3 rounded-2xl p-5"
        style={{ background: "#E8F2EA", border: "1px solid #cfe3d3" }}
      >
        <p className="text-[15px] font-semibold text-[#1f2937]">
          В клубе действует абонплата, которая списывается каждые 30 дней.
        </p>
        <p className="mt-3 text-[14px] text-[#1f2937]">
          💳 Абонплата <b>{amount}₽</b> (отписаться можно в любой момент).
        </p>
        <p className="mt-3 text-[14px] text-[#1f2937]">
          Для получения платёжной ссылки, необходимо дать согласие с положениями.
        </p>
        <p className="mt-3 text-[14px] text-[#1f2937]">Нажимая кнопку ниже, вы:</p>
      </div>

      <div className="mt-4 space-y-3">
        <Check checked={c1} onChange={setC1} label="соглашаетесь с регулярными списаниями" />
        <Check
          checked={c2}
          onChange={setC2}
          label={<>соглашаетесь с <a className="text-primary underline" href="#">обработкой персональных данных</a></>}
        />
        <Check
          checked={c3}
          onChange={setC3}
          label={<>принимаете условия <a className="text-primary underline" href="#">публичной оферты</a></>}
        />
      </div>

      <button
        onClick={onConfirm}
        disabled={!allOk}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[16px] font-semibold text-white transition-opacity"
        style={{ background: "#22A05B", opacity: allOk ? 1 : 0.4 }}
      >
        ✅ Даю согласие
      </button>
    </div>
  );
}

function Check({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl bg-card hairline p-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 accent-[#22A05B]"
      />
      <span className="text-[14px] leading-snug">{label}</span>
    </label>
  );
}
