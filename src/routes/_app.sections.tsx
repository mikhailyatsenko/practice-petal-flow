import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SectionHeader, SubItemList } from "@/components/section/SubItemList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/sections")({
  head: () => ({
    meta: [
      { title: "Разделы магазина — Клуб «Моя жизнь»" },
      { name: "description", content: "Дополнительные разделы клуба, открываемые за очки." },
    ],
  }),
  component: SectionsScreen,
});

type ExtraKey = "freeze" | "insurance" | null;

function SectionsScreen() {
  const navigate = useNavigate();
  const [extra, setExtra] = useState<ExtraKey>(null);

  return (
    <div className="px-4">
      <SectionHeader emoji="🧩" title="Разделы магазина" subtitle="Открывай дополнительные разделы за очки" />

      <SubItemList
        items={[
          { emoji: "💪", title: "Привычки",                subtitle: "Отслеживание любых привычек", price: "300 ⭐", locked: true, onClick: () => navigate({ to: "/habits" }) },
          { emoji: "👑", title: "Качества характера",      subtitle: "Развитие 100+ качеств",       price: "300 ⭐", locked: true, onClick: () => navigate({ to: "/qualities" }) },
          { emoji: "🧠", title: "Потребности",                                                       price: "300 ⭐", locked: true, onClick: () => navigate({ to: "/needs" }) },
          { emoji: "💡", title: "Ценности",                                                          price: "300 ⭐", locked: true, onClick: () => navigate({ to: "/values" }) },
          { emoji: "🤝", title: "Самоулучшение",            subtitle: "30 вопросов для рефлексии",    price: "300 ⭐", locked: true, onClick: () => navigate({ to: "/self-improve" }) },
          { emoji: "🙏", title: "Дневник благодарности",                                              price: "300 ⭐", locked: true, onClick: () => navigate({ to: "/gratitude" }) },
          { emoji: "🧭", title: "Дневник решений",                                                    price: "300 ⭐", locked: true, onClick: () => navigate({ to: "/decisions" }) },
          { emoji: "📝", title: "Дневник ошибок",                                                     price: "300 ⭐", locked: true, onClick: () => navigate({ to: "/mistakes" }) },
          { emoji: "⚖️", title: "Дневник ответственности",                                            price: "300 ⭐", locked: true, onClick: () => navigate({ to: "/responsibility" }) },
        ]}
      />

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Доп. функции</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <SubItemList
        items={[
         { emoji: "🔰", title: "Страховка от пропуска",    subtitle: "Защита от обнуления",          price: "50 ⭐",  locked: false, onClick: () => setExtra("insurance") },
         { emoji: "❄️", title: "Заморозка клуба",          subtitle: "Поставить клуб на паузу",     price: "300 ⭐", locked: false, onClick: () => setExtra("freeze") },
        ]}
      />

      <Dialog open={extra !== null} onOpenChange={(o) => !o && setExtra(null)}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-md max-h-[85vh] overflow-y-auto p-5">
          {extra === "freeze" && <FreezeContent onClose={() => setExtra(null)} />}
          {extra === "insurance" && <InsuranceContent onClose={() => setExtra(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <h4 className="text-[13px] font-semibold mb-1">{title}</h4>
      <div className="text-[13px] text-foreground/80 whitespace-pre-line leading-relaxed">{children}</div>
    </div>
  );
}

function FreezeContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-[18px]">❄️ Заморозка клуба</DialogTitle>
      </DialogHeader>
      <p className="text-[13px] text-foreground/80 mt-1">Заморозь весь прогресс на 21 день (отпуск, форс-мажор).</p>

      <Section title="🎯 Что это:">
        Покупаешь заморозку — и 21 день можешь не делать практики без последствий. Прогресс не падает, уровни не снижаются, штрафов нет.
      </Section>
      <Section title="💪 Как работает:">
        {`• Купил заморозку за 300 очков
• Активировал её (например, перед отпуском)
• 21 день ты свободен: не делаешь практики
• Пропуски не считаются
• Уровни не падают, прогресс сохраняется
• Через 21 день возвращаешься и продолжаешь`}
      </Section>
      <Section title="💡 Когда покупать:">
        Перед отпуском, командировкой, болезнью, важным проектом — любой ситуацией, где 21 день не сможешь делать практики.
      </Section>

      <div className="mt-3 rounded-lg bg-destructive/10 text-destructive text-[12.5px] p-3">
        ⚠️ ВНИМАНИЕ! Заморозка активируется сразу же после покупки. Как только вы купите заморозку — она немедленно вступит в силу.
      </div>

      <p className="mt-3 text-[14px] font-semibold">💎 Цена: 300 ⭐</p>

      <DialogFooter className="mt-3">
        <Button
          onClick={onClose}
          className="w-full text-white"
          style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
        >
          Купить за 300 ⭐
        </Button>
      </DialogFooter>
    </>
  );
}

function InsuranceContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-[18px]">🔰 Страховка практики</DialogTitle>
      </DialogHeader>
      <p className="text-[13px] text-foreground/80 mt-1">Защита от обнуления при пропуске практики (одноразовая).</p>

      <Section title="🎯 Что это:">
        Пропустил практику? Страховка спасёт твой прогресс: он НЕ обнулится, останется на текущем месте. После использования страховка сгорает.
      </Section>
      <Section title="💪 Как работает:">
        {`• Покупаешь страховку за 50 очков
• Она лежит в твоём инвентаре
• Пропускаешь любые практики за день → прогресс не обнулится
• Страховка сгорает (нужно покупать новую)`}
      </Section>
      <Section title="🎁 Что получаешь:">
        {`✅ Защита от случайного пропуска (забыл, заболел, форс-мажор)
✅ Прогресс сохраняется полностью
✅ Можно купить несколько штук про запас
✅ Спокойствие: есть страховка на случай ЧП
✅ Дёшево: всего 50 очков`}
      </Section>
      <Section title="💡 Совет:">
        Держи 1-2 страховки про запас. Никогда не знаешь когда случится форс-мажор.
      </Section>

      <p className="mt-3 text-[14px] font-semibold">💎 Цена: 50 ⭐</p>

      <DialogFooter className="mt-3">
        <Button
          onClick={onClose}
          className="w-full text-white"
          style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
        >
          Купить за 50 ⭐
        </Button>
      </DialogFooter>
    </>
  );
}
