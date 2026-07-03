import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SubItemList } from "@/components/section/SubItemList";
import { HowVideoCards } from "@/components/section/HowVideoCards";
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
  const [howTab, setHowTab] = useState<"text" | "video">("text");

  return (
    <div className="px-4">
      <div className="px-1 pt-2 pb-3">
        <h1 className="text-[22px] font-semibold leading-tight">
          <span className="mr-1.5">📍</span>Партнёрка
        </h1>
        <p
          className="mt-1.5 text-[15px] font-semibold leading-snug"
          style={{ color: "#1a1a1a" }}
        >
          Пригласи друга — и клуб станет бесплатным.
        </p>
      </div>

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
        <p className="text-[14px] font-semibold" style={{ color: "#1a1a1a" }}>
          Как работает партнёрская система?
        </p>
        <div className="flex items-start gap-3" style={{ marginTop: 12 }}>
          <div
            className="shrink-0 flex items-center justify-center text-[18px]"
            style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF3E0" }}
          >
            🎁
          </div>
          <p className="text-[13px]" style={{ color: "#1a1a1a", lineHeight: 1.6 }}>
            Если ты привёл друга в клуб, его первый месяц — пробный, он оплачивает участие всего за 1 рубль.
          </p>
        </div>
        <div className="flex items-start gap-3" style={{ marginTop: 10 }}>
          <div
            className="shrink-0 flex items-center justify-center text-[18px]"
            style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF3E0" }}
          >
            💰
          </div>
          <p className="text-[13px]" style={{ color: "#1a1a1a", lineHeight: 1.6 }}>
            Если твой друг продолжает участие и оплачивает клуб со второго месяца, тебе каждое 1-е число начисляется 1000 бонусных рублей.
          </p>
        </div>
        <div className="flex items-start gap-3" style={{ marginTop: 10 }}>
          <div
            className="shrink-0 flex items-center justify-center text-[18px]"
            style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF3E0" }}
          >
            ✅
          </div>
          <p className="text-[13px]" style={{ color: "#1a1a1a", lineHeight: 1.6 }}>
            Когда приходит твой день оплаты, эти бонусные рубли автоматически списываются в счёт оплаты клуба.
          </p>
        </div>
        <div className="flex items-start gap-3" style={{ marginTop: 10 }}>
          <div
            className="shrink-0 flex items-center justify-center text-[18px]"
            style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF3E0" }}
          >
            🚀
          </div>
          <p className="text-[13px]" style={{ color: "#1a1a1a", lineHeight: 1.6 }}>
            Если ты привёл больше друзей, у тебя накапливается больше бонусных рублей. И значит, ты дольше можешь оплачивать клуб бонусами.
          </p>
        </div>
        <div className="flex items-start gap-3" style={{ marginTop: 10 }}>
          <div
            className="shrink-0 flex items-center justify-center text-[18px]"
            style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF3E0" }}
          >
            💡
          </div>
          <p className="text-[13px]" style={{ color: "#1a1a1a", lineHeight: 1.6 }}>
            <span className="font-semibold">Нюанс:</span> Если друг выходит из клуба, то с 1-го числа бонусные рубли за него больше не начисляются.
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
            {/* Tabs */}
            <div
              className="flex rounded-xl mb-3"
              style={{ background: "#f0ebe2", padding: 4 }}
            >
              {([
                { k: "text" as const, label: "📖 Текст" },
                { k: "video" as const, label: "▶️ Видео" },
              ]).map((t) => {
                const active = howTab === t.k;
                return (
                  <button
                    key={t.k}
                    onClick={() => setHowTab(t.k)}
                    className="tap flex-1 rounded-lg py-2 text-[13px] font-medium transition-colors"
                    style={{
                      background: active
                        ? "linear-gradient(135deg, #FFB300, #FF6D00)"
                        : "transparent",
                      color: active ? "#fff" : "#6b6356",
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {howTab === "text" && (
              <div className="space-y-3">
                <div className="bg-card hairline shadow-card p-4" style={{ borderRadius: 14 }}>
                  <p className="text-[14px] font-semibold mb-2">🤝 Что такое партнёрка</p>
                  <p className="text-[13px] leading-relaxed text-foreground/85">
                    Партнёрка — это способ сделать участие в клубе бесплатным. Ты делишься своей
                    ссылкой с друзьями, а клуб награждает тебя бонусными рублями за каждую
                    оплату, которую они совершают.
                  </p>
                </div>

                <div className="bg-card hairline shadow-card p-4" style={{ borderRadius: 14 }}>
                  <p className="text-[14px] font-semibold mb-2">💱 Курс бонусов</p>
                  <p className="text-[13px] leading-relaxed text-foreground/85">
                    1 бонусный ₽ = 1 реальному ₽. Бонусы автоматически списываются вместо денег,
                    когда наступает твой следующий платёж.
                  </p>
                </div>

                <div className="bg-card hairline shadow-card p-4" style={{ borderRadius: 14 }}>
                  <p className="text-[14px] font-semibold mb-2">🧮 Как считается начисление</p>
                  <p className="text-[13px] leading-relaxed text-foreground/85">
                    Тебе начисляется ровно та сумма, которую заплатил друг. Если друг только начал
                    и платит 1 ₽ за первый месяц — ты получаешь 1 бонусный ₽. Когда он переходит на
                    регулярную оплату 1 000 ₽ в месяц — ты получаешь 1 000 бонусов с каждой его
                    оплаты.
                  </p>
                </div>

                <div className="bg-card hairline shadow-card p-4" style={{ borderRadius: 14 }}>
                  <p className="text-[14px] font-semibold mb-2">🔥 Бонусы не сгорают</p>
                  <p className="text-[13px] leading-relaxed text-foreground/85">
                    Они копятся на твоём балансе, пока ты их не используешь. В день твоей оплаты
                    система сначала спишет бонусы, и только если их не хватит — попросит доплатить
                    разницу.
                  </p>
                </div>

                <div className="bg-card hairline shadow-card p-4" style={{ borderRadius: 14 }}>
                  <p className="text-[12px] uppercase tracking-wider text-muted-foreground mb-2">
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
                </div>

                <div className="bg-card hairline shadow-card p-4" style={{ borderRadius: 14 }}>
                  <p className="text-[14px] font-semibold mb-2">📊 Пример</p>
                  <p className="text-[13px] leading-relaxed text-foreground/85">
                    Ты пригласил 2 друзей. Оба перешли на регулярную оплату 1 000 ₽/мес. За месяц
                    тебе начислится 2 000 бонусов. Когда наступит твой день оплаты — система спишет
                    1 000 бонусов вместо денег, а 1 000 останутся на следующий месяц. Так твоё
                    участие становится полностью бесплатным.
                  </p>
                </div>

                <div
                  className="hairline shadow-card p-4"
                  style={{ borderRadius: 14, background: "#FFF8EC" }}
                >
                  <p className="text-[14px] font-semibold mb-2">
                    🚀 А что если я приведу больше одного друга?
                  </p>
                  <p className="text-[13px] leading-relaxed text-foreground/85">
                    Тогда бонусы начнут копиться быстрее. За каждого друга и за каждую его оплату
                    тебе начисляется отдельная сумма — и всё это складывается на одном балансе.
                  </p>
                  <p className="text-[13px] leading-relaxed text-foreground/85 mt-2">
                    Например, привёл 3 друзей — за месяц получаешь 3 000 бонусов. Привёл 10 друзей —
                    уже 10 000 бонусов в месяц. Этими бонусами ты сможешь оплачивать клуб в будущем
                    — иногда на месяцы вперёд, без единого рубля из своего кармана.
                  </p>
                  <p className="text-[13px] leading-relaxed text-foreground/85 mt-2">
                    Чем больше друзей в клубе — тем дольше твоё участие остаётся бесплатным.
                  </p>
                </div>

              </div>
            )}

            {howTab === "video" && (
              <HowVideoCards
                first={{
                  title: "Как работает партнёрка",
                  duration: "2:30",
                  caption:
                    "Короткий обзор: как получить ссылку, делиться ей и получать бонусные рубли.",
                }}
                second={{
                  title: "Как списываются бонусы",
                  duration: "1:45",
                  caption:
                    "Разбираем на примере, как бонусы автоматически уходят в счёт твоей следующей оплаты.",
                }}
              />
            )}
          </div>
        )}
      </section>
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
      <p className="mt-0.5 text-[13px] leading-snug text-foreground/85">{line2}</p>
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
