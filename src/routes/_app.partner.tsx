import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SubItemList, SectionHeader } from "@/components/section/SubItemList";
import { Copy, ArrowDown, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/_app/partner")({
  head: () => ({
    meta: [
      { title: "Партнёрка — Клуб «Моя жизнь»" },
      { name: "description", content: "Приглашай друзей и делай участие в клубе бесплатным." },
    ],
  }),
  component: PartnerScreen,
});

function PartnerScreen() {
  const [howOpen, setHowOpen] = useState(false);

  return (
    <div className="px-4">
      <SectionHeader emoji="📍" title="Партнёрка" subtitle="Пригласи друга — и клуб станет бесплатным." />

      {/* Balance */}
      <div className="rounded-2xl bg-card hairline shadow-card p-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Бонусы</p>
        <p className="mt-1 text-[24px] font-semibold">💰 0 ₽</p>

        <button className="tap btn-pill-orange mt-3 w-full">
          <span className="inline-flex items-center justify-center gap-2">
            <Copy className="h-4 w-4" /> Скопировать партнёрскую ссылку
          </span>
        </button>
      </div>

      {/* Short bonus description */}
      <div className="mt-3 rounded-2xl bg-card hairline shadow-card p-4">
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 flex items-center justify-center text-[18px]"
            style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF3E0" }}
          >
            💰
          </div>
          <p className="text-[14px]" style={{ color: "#1a1a1a", lineHeight: 1.6 }}>
            Каждый раз когда твой друг оплачивает клуб — тебе начисляется столько бонусных рублей, сколько он заплатил.
          </p>
        </div>
        <div className="flex items-start gap-3" style={{ marginTop: 10 }}>
          <div
            className="shrink-0 flex items-center justify-center text-[18px]"
            style={{ width: 36, height: 36, borderRadius: 10, background: "#E8F5E9" }}
          >
            ✅
          </div>
          <p className="text-[13px]" style={{ color: "#8a8a8a", lineHeight: 1.6 }}>
            Бонусы списываются вместо реальных денег при твоей следующей оплате.
          </p>
        </div>
      </div>

      <h2 className="mt-5 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
        Разделы
      </h2>
      <SubItemList
        items={[
          { emoji: "👫", title: "Приглашённые друзья", subtitle: "Список тех, кто пришёл по твоей ссылке" },
          { emoji: "📜", title: "История начислений", subtitle: "Все партнёрские бонусы за период" },
        ]}
      />

      {/* How it works — expandable (same style as habits/practices) */}
      <section className="mt-6">
        <button
          onClick={() => setHowOpen((v) => !v)}
          className="tap w-full bg-card hairline rounded-2xl shadow-card px-4 py-3 flex items-center justify-between"
        >
          <span className="text-[14px] font-medium">❓ Как это работает</span>
          <ChevronDown
            className="h-5 w-5 transition-transform"
            style={{ transform: howOpen ? "rotate(180deg)" : "none" }}
          />
        </button>

        {howOpen && (
          <div className="mt-3 animate-fade-up">
            <div className="space-y-3 text-[13.5px] leading-relaxed text-foreground/90">
              <p>
                Партнёрка — это способ сделать участие в клубе бесплатным. Ты делишься своей ссылкой
                с друзьями, а клуб награждает тебя бонусными рублями за каждую оплату, которую они
                совершают.
              </p>
              <p>
                <span className="font-semibold">1 бонусный ₽ = 1 реальному ₽.</span> Бонусы
                автоматически списываются вместо денег, когда наступает твой следующий платёж.
              </p>
              <p>
                <span className="font-semibold">Как считается начисление.</span> Тебе начисляется
                ровно та сумма, которую заплатил друг. Если друг только начал и платит 1 ₽ за первый
                месяц — ты получаешь 1 бонусный ₽. Когда он переходит на регулярную оплату 1 000 ₽ в
                месяц — ты получаешь 1 000 бонусов с каждой его оплаты.
              </p>
              <p>
                <span className="font-semibold">Бонусы не сгорают.</span> Они копятся на твоём
                балансе, пока ты их не используешь. В день твоей оплаты система сначала спишет
                бонусы, и только если их не хватит — попросит доплатить разницу.
              </p>

              <p className="pt-1 text-[12px] uppercase tracking-wider text-muted-foreground">
                Схема
              </p>

              <div className="flex flex-col gap-2">
                <BonusStep
                  variant="orange"
                  title="Друг платит"
                  line1="1 ₽ — первый месяц"
                  line2="1 000 ₽ — каждый следующий"
                />
                <StepArrow />
                <BonusStep
                  variant="green"
                  title="Тебе начисляется"
                  line1="1 бонусный ₽ — в первый месяц"
                  line2="1 000 бонусов ₽ — с каждой оплаты"
                />
                <StepArrow />
                <BonusStep
                  variant="blue"
                  title="Ты не платишь"
                  line1="когда наступает твой день оплаты"
                  line2="списываются бонусные рубли"
                />
              </div>

              <div className="mt-1 rounded-xl bg-secondary p-3">
                <p className="text-[12px] uppercase tracking-wider text-muted-foreground">
                  Пример
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed">
                  Ты пригласил 2 друзей. Оба перешли на регулярную оплату 1 000 ₽/мес. За месяц тебе
                  начислится 2 000 бонусов. Когда наступит твой день оплаты — система спишет 1 000
                  бонусов вместо денег, а 1 000 останутся на следующий месяц. Так твоё участие
                  становится полностью бесплатным.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type BonusVariant = "orange" | "green" | "blue";

const VARIANT_STYLES: Record<BonusVariant, { bg: string; border: string; title: string }> = {
  orange: {
    bg: "bg-primary/10",
    border: "border-primary/25",
    title: "text-primary",
  },
  green: {
    bg: "bg-success/10",
    border: "border-success/25",
    title: "text-success-dark",
  },
  blue: {
    bg: "bg-[oklch(0.92_0.04_220)]",
    border: "border-[oklch(0.75_0.08_220)]/30",
    title: "text-[oklch(0.45_0.12_220)]",
  },
};

function BonusStep({
  title,
  line1,
  line2,
  variant,
}: {
  title: string;
  line1: string;
  line2: string;
  variant: BonusVariant;
}) {
  const s = VARIANT_STYLES[variant];
  return (
    <div className={`w-full rounded-xl p-3.5 border ${s.bg} ${s.border}`}>
      <p className={`text-[14px] font-semibold leading-tight ${s.title}`}>{title}</p>
      <p className="mt-1.5 text-[13px] leading-snug text-foreground/85">{line1}</p>
      <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{line2}</p>
    </div>
  );
}

function StepArrow() {
  return (
    <div className="flex items-center justify-center">
      <ArrowDown className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
