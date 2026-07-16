import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SectionHeader, SubItemList } from "@/components/section/SubItemList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HowVideoCards } from "@/components/section/HowVideoCards";
import { SECTION_INFO, type SectionInfo } from "@/lib/sectionInfo";
import { SectionsLockedPreview } from "@/components/section/SectionsLockedPreview";
import { isFeatureUnlocked, unlockLevelOf, usePreviewLevel } from "@/lib/previewLevel";
import { useLevel5WaitingMode } from "@/lib/level5WaitingMode";

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

type Confirm =
  | { kind: "section"; key: string; title: string; price: string; route: string }
  | { kind: "extra"; key: "freeze" | "insurance"; title: string; price: string }
  | null;

function SectionsScreen() {
  const navigate = useNavigate();
  const previewLevel = usePreviewLevel();
  const waiting = useLevel5WaitingMode();
  const catalogOpen = isFeatureUnlocked("sections", previewLevel) && !waiting;
  const extrasOpen = isFeatureUnlocked("sectionExtras", previewLevel);
  const [extra, setExtra] = useState<ExtraKey>(null);
  const [sectionKey, setSectionKey] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);

  const open = (key: string) => setSectionKey(key);

  const confirmPurchase = () => {
    if (!confirm) return;
    if (confirm.kind === "section") {
      const route = confirm.route;
      setConfirm(null);
      setSectionKey(null);
      navigate({ to: route });
    } else {
      setConfirm(null);
      setExtra(null);
    }
  };

  return (
    <div className="px-4">
      <SectionHeader emoji="🧩" title="Разделы магазина" subtitle="Открывай дополнительные разделы за очки" />

      <h3 className="text-[15px] font-semibold mb-2 mt-1">🛡 Защита прогресса</h3>
      {extrasOpen ? (
        <SubItemList
          items={[
           { emoji: "🔰", title: "Страховка от пропуска",    subtitle: "Защита от обнуления",          price: "50 ⭐",  locked: false, onClick: () => setExtra("insurance") },
           { emoji: "❄️", title: "Заморозка клуба",          subtitle: "Поставить клуб на паузу",     price: "300 ⭐", locked: false, onClick: () => setExtra("freeze") },
          ]}
        />
      ) : (
        <SectionsLockedPreview
          variant="simple"
          unlockLevel={unlockLevelOf("sectionExtras")}
          icon="🛡️"
          title="На пятом уровне"
          description="На пятом уровне откроется страховка от пропуска и заморозка клуба"
          badge="Откроется на 5-м уровне"
        />
      )}

      <h3 className="text-[15px] font-semibold mb-2 mt-6">Другие разделы магазина</h3>
      {catalogOpen ? (
        <SubItemList
          items={[
            { emoji: "💪", title: "Привычки",                subtitle: "Отслеживание любых привычек", price: "300 ⭐", locked: true, onClick: () => open("habits") },
            { emoji: "👑", title: "Качества характера",      subtitle: "Развитие 100+ качеств",       price: "300 ⭐", locked: true, onClick: () => open("qualities") },
            { emoji: "🧠", title: "Потребности",                                                       price: "300 ⭐", locked: true, onClick: () => open("needs") },
            { emoji: "💡", title: "Ценности",                                                          price: "300 ⭐", locked: true, onClick: () => open("values") },
            { emoji: "🤝", title: "Самоулучшение",            subtitle: "30 вопросов для рефлексии",    price: "300 ⭐", locked: true, onClick: () => open("self-improve") },
            { emoji: "🙏", title: "Дневник благодарности",                                              price: "300 ⭐", locked: true, onClick: () => open("gratitude") },
            { emoji: "🧭", title: "Дневник решений",                                                    price: "300 ⭐", locked: true, onClick: () => open("decisions") },
            { emoji: "📝", title: "Дневник ошибок",                                                     price: "300 ⭐", locked: true, onClick: () => open("mistakes") },
            { emoji: "⚖️", title: "Дневник ответственности",                                            price: "300 ⭐", locked: true, onClick: () => open("responsibility") },
          ]}
        />
      ) : (
        <SectionsLockedPreview
          unlockLevel={unlockLevelOf("sections")}
          title="Другие разделы магазина откроются на 6-м уровне"
          description="Продолжай повышать уровень, чтобы получить доступ к другим разделам магазина."
          badge="Откроются на 6-м уровне"
        />
      )}


      <Dialog open={extra !== null} onOpenChange={(o) => !o && setExtra(null)}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-md max-h-[85vh] overflow-y-auto p-5">
          {extra === "freeze" && (
            <FreezeContent
              onBuy={() =>
                setConfirm({ kind: "extra", key: "freeze", title: "Заморозка клуба", price: "300 ⭐" })
              }
            />
          )}
          {extra === "insurance" && (
            <InsuranceContent
              onBuy={() =>
                setConfirm({ kind: "extra", key: "insurance", title: "Страховка практики", price: "50 ⭐" })
              }
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={sectionKey !== null} onOpenChange={(o) => !o && setSectionKey(null)}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-md max-h-[85vh] overflow-y-auto p-5">
          {sectionKey && SECTION_INFO[sectionKey] && (
            <SectionInfoContent
              info={SECTION_INFO[sectionKey]}
              onBuy={() =>
                setConfirm({
                  kind: "section",
                  key: sectionKey,
                  title: SECTION_INFO[sectionKey].title,
                  price: SECTION_INFO[sectionKey].price,
                  route: SECTION_INFO[sectionKey].route,
                })
              }
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-sm p-5">
          <DialogHeader>
            <DialogTitle className="text-[18px]">Подтверждение покупки</DialogTitle>
          </DialogHeader>
          {confirm && (
            <p className="text-[14px] text-foreground/85 mt-1">
              Купить «{confirm.title}» за {confirm.price}?
            </p>
          )}
          <DialogFooter className="mt-4 flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setConfirm(null)}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              onClick={confirmPurchase}
              className="flex-1 text-white"
              style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
            >
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SectionInfoContent({ info, onBuy }: { info: SectionInfo; onBuy: () => void }) {
  const [tab, setTab] = useState<"text" | "video">("text");

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-[18px]">
          {info.emoji} {info.title}
        </DialogTitle>
      </DialogHeader>

      <div
        className="flex rounded-xl mt-2"
        style={{ background: "#f0ebe2", padding: 4 }}
      >
        {([
          { k: "text" as const, label: "📖 Текст" },
          { k: "video" as const, label: "▶️ Видео" },
        ]).map((t) => {
          const active = tab === t.k;
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
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

      <div className="mt-3">
        {tab === "text" && (
          <div className="space-y-3">
            {info.paragraphs.map((p, i) => (
              <div
                key={i}
                className="bg-card shadow-card p-4"
                style={{ borderRadius: 14 }}
              >
                <p className="text-[14px] font-semibold mb-2">{p.title}</p>
                <p className="text-[13px] leading-snug text-foreground/85 whitespace-pre-line">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {tab === "video" && (
          <HowVideoCards first={info.videos[0]} second={info.videos[1]} />
        )}
      </div>

      <DialogFooter className="mt-4">
        <Button
          onClick={onBuy}
          className="w-full text-white"
          style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
        >
          Купить за {info.price}
        </Button>
      </DialogFooter>
    </>
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

function FreezeContent({ onBuy }: { onBuy: () => void }) {
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
          onClick={onBuy}
          className="w-full text-white"
          style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
        >
          Купить за 300 ⭐
        </Button>
      </DialogFooter>
    </>
  );
}

function InsuranceContent({ onBuy }: { onBuy: () => void }) {
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
      <Section title="💡 Совет:">
        Держи 1-2 страховки про запас. Никогда не знаешь когда случится форс-мажор.
      </Section>

      <p className="mt-3 text-[14px] font-semibold">💎 Цена: 50 ⭐</p>

      <DialogFooter className="mt-3">
        <Button
          onClick={onBuy}
          className="w-full text-white"
          style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
        >
          Купить за 50 ⭐
        </Button>
      </DialogFooter>
    </>
  );
}
