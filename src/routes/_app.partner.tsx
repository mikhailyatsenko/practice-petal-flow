import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HowVideoCards } from "@/components/section/HowVideoCards";
import { Copy, ArrowDown, ChevronDown, KeyRound, Gift, Zap, Trophy, Unlock, CheckCircle2, MinusCircle, Check, Send } from "lucide-react";
import { Drawer, DrawerContent, DrawerClose } from "@/components/ui/drawer";
import { TelegramIcon, MaxIcon } from "@/components/icons/MessengerIcons";
import { isFeatureUnlocked, unlockLevelOf, usePreviewLevel, type PreviewLevel } from "@/lib/previewLevel";

export const Route = createFileRoute("/_app/partner")({
  head: () => ({
    meta: [
      { title: "Возможности — Клуб «Моя жизнь»" },
      { name: "description", content: "Доступ к дополнительным функциям и бонусам клуба." },
    ],
  }),
  component: PossibilitiesScreen,
});

type Tab = "partner" | "codes";

function PossibilitiesScreen() {
  const previewLevel = usePreviewLevel();
  const unlocked = isFeatureUnlocked("possibilities", previewLevel);
  const [tab, setTab] = useState<Tab>("partner");

  if (!unlocked) {
    return <PossibilitiesLocked currentLevel={previewLevel ?? 1} unlockLevel={unlockLevelOf("possibilities")} />;
  }


  return (
    <div className="px-4">
      <div className="px-1 pt-2 pb-3">
        <h1 className="text-[22px] font-semibold leading-tight inline-flex items-center gap-1.5">
          <span aria-hidden className="text-[20px] leading-none">🔑</span>
          Возможности
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground leading-snug">
          Доступ к дополнительным функциям и бонусам клуба.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex rounded-xl mb-4"
        style={{ background: "#f0ebe2", padding: 4 }}
      >
        {([
          { k: "partner" as const, label: "Партнёрка" },
          { k: "codes" as const, label: "Кодовые слова" },
        ]).map((t) => {
          const active = tab === t.k;
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className="tap flex-1 rounded-lg py-2 text-[13px] font-medium transition-colors"
              style={{
                background: active ? "#fff" : "transparent",
                border: active ? "1.5px solid #FF6D00" : "1.5px solid transparent",
                color: active ? "#FF6D00" : "#8a8275",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "partner" ? <PartnerTab /> : <CodesTab />}
    </div>
  );
}

function PossibilitiesLocked({ currentLevel, unlockLevel }: { currentLevel: PreviewLevel; unlockLevel: PreviewLevel }) {
  const pct = Math.min(100, Math.round((currentLevel / unlockLevel) * 100));
  return (
    <div className="px-4">
      <div className="px-1 pt-2 pb-3">
        <h1 className="text-[22px] font-semibold leading-tight inline-flex items-center gap-1.5">
          <span aria-hidden className="text-[20px] leading-none">🔑</span>
          Возможности
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground leading-snug">
          Дополнительные функции и бонусы клуба
        </p>
      </div>

      <div
        className="mx-auto bg-card"
        style={{
          borderRadius: 20,
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          padding: "24px 20px",
        }}
      >
        <div className="flex justify-center">
          <div
            className="flex items-center justify-center"
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FFB300, #FF6D00)",
              boxShadow: "0 6px 18px rgba(255,109,0,0.35)",
              fontSize: 28,
              fontFamily: '"Apple Color Emoji","Segoe UI Emoji",sans-serif',
            }}
          >
            🔒
          </div>
        </div>

        <p className="text-center mt-4 text-[16px] font-semibold leading-tight">
          Раздел откроется на {unlockLevel}-м уровне
        </p>
        <p className="text-center mt-2 text-[13px] text-muted-foreground leading-snug">
          Здесь ты сможешь вводить кодовые слова, открывать секретные разделы и узнать, как сделать участие в клубе бесплатным.
        </p>

        <WhatsInsideBlock />

        <div className="mt-5">

          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Твой уровень</span>
            <span className="font-medium tabular-nums" style={{ color: "#FF6D00" }}>
              {currentLevel} из {unlockLevel}
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full rounded-full" style={{ background: "#f0ebe0" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg, #FFB300, #FF6D00)" }}
            />
          </div>
          <p className="mt-3 text-center text-[12px] text-muted-foreground">
            Достигни {unlockLevel}-го уровня, чтобы открыть раздел.
          </p>
        </div>
      </div>
    </div>
  );
}

function PartnerTab() {
  const [howOpen, setHowOpen] = useState(false);
  const [howTab, setHowTab] = useState<"text" | "video">("text");
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      {/* Balance */}
      <div className="rounded-2xl bg-card hairline shadow-card p-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Бонусы</p>
        <p className="mt-1 text-[24px] font-semibold">💰 0 ₽</p>

        <button onClick={() => setShareOpen(true)} className="tap btn-pill-orange mt-3 w-full">
          <span className="inline-flex items-center justify-center gap-2">
            <Copy className="h-4 w-4" /> Скопировать партнёрскую ссылку
          </span>
        </button>
      </div>

      <ShareLinkDrawer open={shareOpen} onOpenChange={setShareOpen} />

      {/* Short bonus description */}
      <div className="mt-3 rounded-2xl bg-card hairline shadow-card p-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Партнёрская система</p>
        <p className="mt-1 text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>
          Как сделать клуб бесплатным?
        </p>
        <div className="flex items-start gap-3" style={{ marginTop: 12 }}>
          <div className="shrink-0 flex items-center justify-center text-[18px]" style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF3E0" }}>🎁</div>
          <p className="text-[13px]" style={{ color: "#1a1a1a", lineHeight: 1.6 }}>
            Нажми «Скопировать партнёрскую ссылку» выше и отправь её другу — <span className="font-semibold">его первый месяц в клубе будет пробным, всего за 1 рубль.</span>
          </p>
        </div>
        <div className="flex items-start gap-3" style={{ marginTop: 10 }}>
          <div className="shrink-0 flex items-center justify-center text-[18px]" style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF3E0" }}>💰</div>
          <p className="text-[13px]" style={{ color: "#1a1a1a", lineHeight: 1.6 }}>
            Если твой друг продолжает участие и оплачивает клуб со второго месяца, тебе каждое 1-е число начисляется 1000 бонусных рублей.
          </p>
        </div>
        <div className="flex items-start gap-3" style={{ marginTop: 10 }}>
          <div className="shrink-0 flex items-center justify-center text-[18px]" style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF3E0" }}>✅</div>
          <p className="text-[13px]" style={{ color: "#1a1a1a", lineHeight: 1.6 }}>
            Когда приходит твой день оплаты, эти бонусные рубли автоматически списываются в счёт оплаты клуба.
          </p>
        </div>
        <div className="flex items-start gap-3" style={{ marginTop: 10 }}>
          <div className="shrink-0 flex items-center justify-center text-[18px]" style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF3E0" }}>🚀</div>
          <p className="text-[13px]" style={{ color: "#1a1a1a", lineHeight: 1.6 }}>
            Если ты привёл больше друзей, у тебя накапливается больше бонусных рублей. И значит, ты дольше можешь оплачивать клуб бонусами.
          </p>
        </div>
        <div className="flex items-start gap-3" style={{ marginTop: 10 }}>
          <div className="shrink-0 flex items-center justify-center text-[18px]" style={{ width: 36, height: 36, borderRadius: 10, background: "#FFF3E0" }}>💡</div>
          <p className="text-[13px]" style={{ color: "#1a1a1a", lineHeight: 1.6 }}>
            <span className="font-semibold">Нюанс:</span> Если друг выходит из клуба, то с 1-го числа бонусные рубли за него больше не начисляются.
          </p>
        </div>
      </div>

      {/* Invited friends */}
      <div className="mt-3 rounded-2xl bg-card hairline shadow-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>Приглашённые друзья</p>
          <span className="text-[12px] text-muted-foreground">{friendsCountLabel(INVITED_FRIENDS.length)}</span>
        </div>
        <div className="mt-3 flex flex-col gap-3.5">
          {INVITED_FRIENDS.map((f, i) => (
            <div key={f.name}>
              {i > 0 && <div className="h-px mb-3.5" style={{ background: "rgba(0,0,0,0.06)" }} />}
              <FriendRow friend={f} />
            </div>
          ))}
        </div>
      </div>

      {/* Earnings history */}
      <EarningsHistoryCard />



      {/* How it works */}
      <section className="mt-6">
        <button
          onClick={() => setHowOpen((v) => !v)}
          className="tap w-full bg-card hairline rounded-2xl shadow-card px-4 py-3 flex items-center justify-between"
        >
          <span className="text-[14px] font-medium">❓ Как это работает</span>
          <ChevronDown className="h-5 w-5 transition-transform" style={{ transform: howOpen ? "rotate(180deg)" : "none" }} />
        </button>

        {howOpen && (
          <div className="mt-3 animate-fade-up">
            <div className="flex rounded-xl mb-3" style={{ background: "#f0ebe2", padding: 4 }}>
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
                      background: active ? "linear-gradient(135deg, #FFB300, #FF6D00)" : "transparent",
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
                    Партнёрка — это способ сделать участие в клубе бесплатным. Ты делишься своей ссылкой с друзьями, а клуб награждает тебя бонусными рублями за каждую оплату, которую они совершают.
                  </p>
                </div>
                <div className="bg-card hairline shadow-card p-4" style={{ borderRadius: 14 }}>
                  <p className="text-[14px] font-semibold mb-2">💱 Курс бонусов</p>
                  <p className="text-[13px] leading-relaxed text-foreground/85">
                    1 бонусный ₽ = 1 реальному ₽. Бонусы автоматически списываются вместо денег, когда наступает твой следующий платёж.
                  </p>
                </div>
                <div className="bg-card hairline shadow-card p-4" style={{ borderRadius: 14 }}>
                  <p className="text-[14px] font-semibold mb-2">🧮 Как считается начисление</p>
                  <p className="text-[13px] leading-relaxed text-foreground/85">
                    Первый месяц приглашённого друга — пробный, он оплачивает его за 1 ₽. За пробный месяц бонусы не начисляются.
                  </p>
                  <p className="text-[13px] leading-relaxed text-foreground/85 mt-2">
                    Если друг остаётся в клубе и оплачивает второй месяц, он становится активным участником. После этого каждое 1-е число тебе начисляется 1 000 бонусных рублей за этого друга.
                  </p>
                  <p className="text-[13px] leading-relaxed text-foreground/85 mt-2">
                    Начисления продолжаются каждый месяц, пока друг остаётся в клубе и оплачивает участие.
                  </p>
                </div>
                <div className="bg-card hairline shadow-card p-4" style={{ borderRadius: 14 }}>
                  <p className="text-[14px] font-semibold mb-2">🔥 Бонусы не сгорают</p>
                  <p className="text-[13px] leading-relaxed text-foreground/85">
                    Они копятся на твоём балансе, пока ты их не используешь. В день твоей оплаты система сначала спишет бонусы, и только если их не хватит — попросит доплатить разницу.
                  </p>
                </div>
                <div className="bg-card hairline shadow-card p-4" style={{ borderRadius: 14 }}>
                  <p className="text-[12px] uppercase tracking-wider text-muted-foreground mb-2">Схема</p>
                  <div className="flex flex-col gap-2">
                    <BonusStep variant="orange" title="Друг вступает в клуб" line1="1 ₽ — пробный месяц" line2="За пробный месяц бонусы не начисляются." />
                    <StepArrow />
                    <BonusStep variant="green" title="Друг продолжает участие" line1="Со второго месяца друг оплачивает обычную стоимость клуба" line2="и становится активным участником." />
                    <StepArrow />
                    <BonusStep variant="blue" title="Тебе начисляется" line1="+1 000 бонусных рублей каждое 1-е число," line2="пока друг остаётся активным участником клуба." />
                    <StepArrow />
                    <BonusStep variant="purple" title="Бонусы оплачивают твой клуб" line1="В день твоей оплаты накопленные бонусные рубли" line2="автоматически списываются в счёт участия в клубе." />
                  </div>
                </div>
                <div className="bg-card hairline shadow-card p-4" style={{ borderRadius: 14 }}>
                  <p className="text-[14px] font-semibold mb-2">📊 Пример</p>
                  <p className="text-[13px] leading-relaxed text-foreground/85">
                    Ты пригласил двух друзей.
                  </p>
                  <p className="text-[13px] leading-relaxed text-foreground/85 mt-2">
                    Первый месяц каждый из них оплатил за 1 ₽ — в этот период бонусы ещё не начисляются.
                  </p>
                  <p className="text-[13px] leading-relaxed text-foreground/85 mt-2">
                    Со второго месяца оба друга продолжили участие и стали активными участниками. Теперь каждое 1-е число тебе начисляется по 1 000 бонусных рублей за каждого:
                  </p>
                  <p className="text-[13px] leading-relaxed text-foreground/85 mt-2 font-semibold">
                    2 друга × 1 000 ₽ = 2 000 бонусных рублей в месяц.
                  </p>
                  <p className="text-[13px] leading-relaxed text-foreground/85 mt-2">
                    Когда наступает день твоей оплаты, накопленные бонусы автоматически списываются в счёт клуба. Если бонусов достаточно, участие становится для тебя бесплатным. Остаток сохраняется на балансе.
                  </p>
                </div>
                <div className="hairline shadow-card p-4" style={{ borderRadius: 14, background: "#FFF8EC" }}>
                  <p className="text-[14px] font-semibold mb-2">🚀 Чем больше активных друзей — тем больше бонусов</p>
                  <p className="text-[13px] leading-relaxed text-foreground/85">
                    За каждого активного друга тебе начисляется 1 000 бонусных рублей каждое 1-е число.
                  </p>
                  <p className="text-[13px] leading-relaxed text-foreground/85 mt-2">
                    1 друг — 1 000 бонусов в месяц<br />
                    3 друга — 3 000 бонусов в месяц<br />
                    10 друзей — 10 000 бонусов в месяц
                  </p>
                  <p className="text-[13px] leading-relaxed text-foreground/85 mt-2">
                    Бонусы накапливаются и автоматически используются для оплаты клуба. Чем больше друзей продолжают участие, тем дольше ты можешь оплачивать клуб бонусами.
                  </p>
                </div>
              </div>
            )}

            {howTab === "video" && (
              <HowVideoCards
                first={{ title: "Как работает партнёрка", duration: "2:30", caption: "Короткий обзор: как получить ссылку, делиться ей и получать бонусные рубли." }}
                second={{ title: "Как списываются бонусы", duration: "1:45", caption: "Разбираем на примере, как бонусы автоматически уходят в счёт твоей следующей оплаты." }}
              />
            )}
          </div>
        )}
      </section>
    </>
  );
}

function CodesTab() {
  const [code, setCode] = useState("");
  const [howOpen, setHowOpen] = useState(false);
  const [howTab, setHowTab] = useState<"text" | "video">("text");

  return (
    <>
      {/* Main card: input + where-to-get */}
      <div className="rounded-2xl bg-card hairline shadow-card p-4">
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 flex items-center justify-center"
            style={{ width: 40, height: 40, borderRadius: 12, background: "#E7F7EC" }}
          >
            <KeyRound className="h-5 w-5" style={{ color: "#22A557" }} />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold leading-tight" style={{ color: "#1a1a1a" }}>
              Введите кодовые слова
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground leading-snug">
              Чтобы получать бонусы и открывать секретные разделы.
            </p>
          </div>
        </div>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Введите кодовое слово"
          className="mt-3 w-full rounded-xl bg-secondary/60 px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-primary/40"
        />

        <button className="tap btn-pill-orange mt-3 w-full">Активировать</button>

        <div className="my-4 h-px" style={{ background: "rgba(0,0,0,0.06)" }} />

        <div
          className="rounded-xl p-3.5 flex items-start gap-3"
          style={{ background: "#F1FAF3" }}
        >
          <div
            className="shrink-0 flex items-center justify-center"
            style={{ width: 36, height: 36, borderRadius: 10, background: "#E7F7EC" }}
          >
            <Gift className="h-4.5 w-4.5" style={{ color: "#22A557" }} />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold leading-tight" style={{ color: "#1a1a1a" }}>
              Где брать кодовые слова?
            </p>
            <p className="mt-1 text-[13px] leading-snug" style={{ color: "#1a1a1a" }}>
              Кодовые слова можно получить во время эфиров и мероприятий, при выполнении заданий и в специальных сообщениях клуба.
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="mt-3 rounded-2xl bg-card hairline shadow-card p-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">История активаций</p>
        <div className="mt-3 flex flex-col gap-2.5">
          <HistoryRow
            icon={<Zap className="h-4.5 w-4.5" style={{ color: "#FF6D00" }} />}
            iconBg="#FFEBD6"
            title="Бонус за эфир"
            reward="+10 очков"
            date="12 мая, 20:15"
          />
          <HistoryRow
            icon={<Trophy className="h-4.5 w-4.5" style={{ color: "#FFB300" }} />}
            iconBg="#FFF3E0"
            title="Прохождение уровня"
            reward="+50 очков"
            date="10 мая, 18:30"
          />
          <HistoryRow
            icon={<Unlock className="h-4.5 w-4.5" style={{ color: "#22A557" }} />}
            iconBg="#E7F7EC"
            title="Секретный раздел «Сила привычек»"
            reward="Раздел открыт"
            date="8 мая, 19:30"
          />
          <HistoryRow
            icon={<Gift className="h-4.5 w-4.5" style={{ color: "#22A557" }} />}
            iconBg="#E7F7EC"
            title="Подарок от клуба"
            reward="+20 очков"
            date="5 мая, 18:45"
          />
        </div>
      </div>

      {/* How it works */}
      <section className="mt-6">
        <button
          onClick={() => setHowOpen((v) => !v)}
          className="tap w-full bg-card hairline rounded-2xl shadow-card px-4 py-3 flex items-center justify-between"
        >
          <span className="text-[14px] font-medium">❓ Как это работает</span>
          <ChevronDown className="h-5 w-5 transition-transform" style={{ transform: howOpen ? "rotate(180deg)" : "none" }} />
        </button>
        {howOpen && (
          <div className="mt-3 animate-fade-up space-y-3">
            <div className="flex rounded-xl" style={{ background: "#f0ebe2", padding: 4 }}>
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
                      background: active ? "linear-gradient(135deg, #FFB300, #FF6D00)" : "transparent",
                      color: active ? "#fff" : "#6b6356",
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {howTab === "text" && (
              <div className="bg-card hairline shadow-card p-4" style={{ borderRadius: 14 }}>
                <p className="text-[13px] leading-relaxed text-foreground/85">
                  Получите кодовое слово на эфире, в задании или специальном сообщении клуба. Введите его в поле выше и нажмите «Активировать». За правильное кодовое слово вы можете получить дополнительные очки, бонус или доступ к секретному разделу.
                </p>
              </div>
            )}

            {howTab === "video" && (
              <HowVideoCards
                first={{
                  title: "ВИДЕО",
                  duration: "1:20",
                  caption: "В этом видео показано, где получать кодовые слова, как вводить их в приложении и какие награды можно открыть после активации.",
                }}
              />
            )}
          </div>
        )}
      </section>
    </>
  );
}

function HistoryRow({
  icon,
  iconBg,
  title,
  reward,
  date,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  reward: string;
  date: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2">
      <div
        className="shrink-0 flex items-center justify-center"
        style={{ width: 36, height: 36, borderRadius: 10, background: iconBg }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-medium leading-tight truncate" style={{ color: "#1a1a1a" }}>
          {title}
        </p>
        <p className="mt-0.5 text-[12px] text-muted-foreground leading-snug">
          <span style={{ color: "#22A557" }}>{reward}</span> · {date}
        </p>
      </div>
    </div>
  );
}

type BonusVariant = "orange" | "green" | "blue" | "purple";

const VARIANT_STYLES: Record<BonusVariant, { bg: string; border: string; title: string }> = {
  orange: { bg: "bg-primary/10", border: "border-primary/25", title: "text-primary" },
  green: { bg: "bg-success/10", border: "border-success/25", title: "text-success-dark" },
  blue: { bg: "bg-[oklch(0.92_0.04_220)]", border: "border-[oklch(0.75_0.08_220)]/30", title: "text-[oklch(0.45_0.12_220)]" },
  purple: { bg: "bg-[oklch(0.92_0.05_300)]", border: "border-[oklch(0.75_0.10_300)]/30", title: "text-[oklch(0.45_0.15_300)]" },
};

function BonusStep({ title, line1, line2, variant }: { title: string; line1: string; line2: string; variant: BonusVariant }) {
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

// ============ Invited friends & earnings history ============

type FriendStatus = "trial" | "active";

interface Friend {
  name: string;
  photo?: string;
  status: FriendStatus;
  joinedAt: string;
}

function friendsCountLabel(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} друг`;
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return `${n} друга`;
  return `${n} друзей`;
}

function eventsCountLabel(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} событие`;
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return `${n} события`;
  return `${n} событий`;
}

const INVITED_FRIENDS: Friend[] = [
  {
    name: "Анна Смирнова",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "trial",
    joinedAt: "с 12 мая 2026",
  },
  {
    name: "Иван Петров",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    status: "active",
    joinedAt: "с 8 апреля 2026",
  },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function FriendRow({ friend }: { friend: Friend }) {
  const isTrial = friend.status === "trial";
  const badge = isTrial
    ? { label: "Пробный месяц", color: "#FF6D00", bg: "#FFEBD6" }
    : { label: "Активный", color: "#22A557", bg: "#E7F7EC" };
  const right = isTrial
    ? { amount: "1 ₽", amountColor: "#FF6D00", caption: "пробный" }
    : { amount: "+1 000 ₽", amountColor: "#22A557", caption: "начисляются каждое 1-е число" };

  return (
    <div className="flex items-center gap-3">
      {friend.photo ? (
        <img
          src={friend.photo}
          alt={friend.name}
          className="shrink-0 rounded-full object-cover"
          style={{ width: 48, height: 48 }}
        />
      ) : (
        <div
          className="shrink-0 flex items-center justify-center rounded-full text-[14px] font-semibold"
          style={{ width: 48, height: 48, background: "#F0EBE2", color: "#6b6356" }}
        >
          {initials(friend.name)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] font-semibold leading-tight truncate" style={{ color: "#1a1a1a" }}>
          {friend.name}
        </p>
        <div className="mt-1.5 flex items-center gap-2 min-w-0">
          <span
            className="inline-flex items-center gap-1 shrink-0 text-[11.5px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: badge.bg, color: badge.color }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {badge.label}
          </span>
          <span className="text-[11.5px] text-muted-foreground truncate">{friend.joinedAt}</span>
        </div>
      </div>
      <div className="shrink-0 flex flex-col items-end leading-tight max-w-[110px]">
        <span className="text-[14px] font-semibold whitespace-nowrap" style={{ color: right.amountColor }}>
          {right.amount}
        </span>
        <span className="mt-0.5 text-[11px] text-muted-foreground text-right leading-snug">
          {right.caption}
        </span>
      </div>
    </div>
  );
}

type EarningType = "trial-start" | "continued" | "bonus" | "churn" | "tg-bot-start" | "max-bot-start";

interface EarningEvent {
  type: EarningType;
  title: string;
  subtitle: string;
  dateISO: string;
  dateLabel: string;
  rightLabel?: string;
}

const EARNINGS_HISTORY_RAW: EarningEvent[] = [
  {
    type: "bonus",
    title: "Начислен бонус за Ивана Петрова",
    subtitle: "За продолжение участия в клубе",
    dateISO: "2026-06-01T00:00:00",
    dateLabel: "1 июня 2026, 00:00",
  },
  {
    type: "continued",
    title: "Иван Петров продолжил участие",
    subtitle: "Оплатил второй месяц клуба",
    dateISO: "2026-05-08T18:42:00",
    dateLabel: "8 мая 2026, 18:42",
  },
  {
    type: "trial-start",
    title: "Иван Петров вступил в клуб",
    subtitle: "Оплатил пробный месяц за 1 ₽",
    dateISO: "2026-04-08T18:42:00",
    dateLabel: "8 апреля 2026, 18:42",
  },
  {
    type: "churn",
    title: "Мария Орлова не продлила участие",
    subtitle: "Подписка завершена",
    dateISO: "2026-04-05T10:15:00",
    dateLabel: "5 апреля 2026, 10:15",
  },
  {
    type: "trial-start",
    title: "Анна Смирнова вступила в клуб",
    subtitle: "Оплатила пробный месяц за 1 ₽",
    dateISO: "2026-06-05T14:20:00",
    dateLabel: "5 июня 2026, 14:20",
  },
  {
    type: "tg-bot-start",
    title: "Анна Смирнова запустила Telegram-бота",
    subtitle: "Перешла по вашей партнёрской ссылке",
    dateISO: "2026-06-05T14:10:00",
    dateLabel: "5 июня 2026, 14:10",
  },
  {
    type: "max-bot-start",
    title: "Иван Петров запустил MAX-бота",
    subtitle: "Перешёл по вашей партнёрской ссылке",
    dateISO: "2026-04-06T18:25:00",
    dateLabel: "6 апреля 2026, 18:25",
  },
  {
    type: "trial-start",
    title: "Мария Орлова вступила в клуб",
    subtitle: "Оплатила пробный месяц за 1 ₽",
    dateISO: "2026-03-05T12:00:00",
    dateLabel: "5 марта 2026, 12:00",
  },
  {
    type: "trial-start",
    title: "Фёдор Смирнов вступил в клуб",
    subtitle: "Оплатил пробный месяц за 1 ₽",
    dateISO: "2026-02-14T09:30:00",
    dateLabel: "14 февраля 2026, 09:30",
  },
  {
    type: "churn",
    title: "Фёдор Смирнов не продлил участие",
    subtitle: "Подписка завершена",
    dateISO: "2026-03-14T00:05:00",
    dateLabel: "14 марта 2026, 00:05",
  },
];

const EARNINGS_HISTORY: EarningEvent[] = [...EARNINGS_HISTORY_RAW].sort(
  (a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime(),
);

const EARNING_META: Record<
  EarningType,
  { icon: React.ReactNode; bg: string; amount: string; amountColor: string }
> = {
  "trial-start": {
    icon: <CheckCircle2 className="h-5 w-5" style={{ color: "#FF6D00" }} />,
    bg: "#FFEBD6",
    amount: "1 ₽",
    amountColor: "#FF6D00",
  },
  continued: {
    icon: <CheckCircle2 className="h-5 w-5" style={{ color: "#22A557" }} />,
    bg: "#E7F7EC",
    amount: "1 000 ₽ начислятся 1-го числа",
    amountColor: "#8a8275",
  },
  bonus: {
    icon: <CheckCircle2 className="h-5 w-5" style={{ color: "#22A557" }} />,
    bg: "#E7F7EC",
    amount: "+1 000 ₽",
    amountColor: "#22A557",
  },
  churn: {
    icon: <MinusCircle className="h-5 w-5" style={{ color: "#8a8275" }} />,
    bg: "#EFEBE3",
    amount: "Без начисления",
    amountColor: "#8a8275",
  },
  "tg-bot-start": {
    icon: <TelegramIcon size={22} />,
    bg: "#E3F2FD",
    amount: "Telegram",
    amountColor: "#229ED9",
  },
  "max-bot-start": {
    icon: <MaxIcon size={22} />,
    bg: "#EDE7F6",
    amount: "MAX",
    amountColor: "#7B4DFF",
  },
};

function EarningRow({ event }: { event: EarningEvent }) {
  const meta = EARNING_META[event.type];
  return (
    <div className="flex items-start gap-3">
      <div
        className="shrink-0 flex items-center justify-center mt-0.5"
        style={{ width: 36, height: 36, borderRadius: 10, background: meta.bg }}
      >
        {meta.icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-medium leading-tight" style={{ color: "#1a1a1a" }}>
          {event.title}
        </p>
        <p className="mt-0.5 text-[12px] text-muted-foreground leading-snug">
          {event.subtitle}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground/80 leading-snug">
          {event.dateLabel}
        </p>
      </div>
      <span
        className="shrink-0 text-[12.5px] font-semibold text-right leading-snug max-w-[110px]"
        style={{ color: meta.amountColor }}
      >
        {meta.amount}
      </span>
    </div>
  );
}

function EarningsHistoryCard() {
  const [expanded, setExpanded] = useState(false);
  const initial = 5;
  const hidden = Math.max(0, EARNINGS_HISTORY.length - initial);
  const visible = expanded ? EARNINGS_HISTORY : EARNINGS_HISTORY.slice(0, initial);
  return (
    <div className="mt-3 rounded-2xl bg-card hairline shadow-card p-4">
      <p className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>История партнёрки</p>
      <div className="mt-3 flex flex-col gap-3">
        {visible.map((e, i) => (
          <div key={i}>
            {i > 0 && <div className="h-px mb-3" style={{ background: "rgba(0,0,0,0.06)" }} />}
            <EarningRow event={e} />
          </div>
        ))}
      </div>
      {hidden > 0 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="tap mt-3 w-full flex items-center justify-center gap-1.5 text-[13px] font-medium py-2.5 rounded-xl"
          style={{ background: "#F5F0E6", color: "#1a1a1a" }}
        >
          Посмотреть ещё {eventsCountLabel(hidden)}
          <ChevronDown className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}




// ============ Share partner link drawer ============

const PARTNER_CODE = "u_a1b2c3";
const TG_LINK = `https://t.me/moya_zhizn_bot?start=${PARTNER_CODE}`;
const MAX_LINK = `https://max.ru/moya_zhizn_bot?start=${PARTNER_CODE}`;

function ShareLinkDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [copied, setCopied] = useState<null | "tg" | "max">(null);

  const copy = async (which: "tg" | "max") => {
    const link = which === "tg" ? TG_LINK : MAX_LINK;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      /* noop */
    }
    setCopied(which);
    setTimeout(() => {
      setCopied(null);
      onOpenChange(false);
    }, 1200);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setCopied(null);
      }}
    >
      <DrawerContent className="px-5 pb-6 pt-2 max-w-md mx-auto">
        <div className="mx-auto mt-1 h-1 w-10 rounded-full bg-black/10" />
        <div className="mt-3 text-center">
          <p className="text-[17px] font-semibold" style={{ color: "#1a1a1a" }}>
            Куда вы хотите пригласить друга?
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground leading-snug">
            Выберите мессенджер — мы скопируем нужную партнёрскую ссылку.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          <button
            onClick={() => copy("tg")}
            className="tap w-full rounded-2xl py-3.5 text-[15px] font-medium text-white inline-flex items-center justify-center gap-2"
            style={{
              background:
                copied === "tg"
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : "linear-gradient(135deg, #2AABEE, #229ED9)",
              boxShadow: "0 8px 22px rgba(34, 158, 217, 0.30)",
            }}
          >
            {copied === "tg" ? (
              <>
                <Check className="h-5 w-5" /> Ссылка Telegram скопирована
              </>
            ) : (
              <>
                <Send className="h-5 w-5" /> Скопировать ссылку Telegram
              </>
            )}
          </button>

          <button
            onClick={() => copy("max")}
            className="tap w-full rounded-2xl py-3.5 text-[15px] font-medium text-white inline-flex items-center justify-center gap-2"
            style={{
              background:
                copied === "max"
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : "linear-gradient(135deg, #7B4DFF, #E24BE6)",
              boxShadow: "0 8px 22px rgba(123, 77, 255, 0.30)",
            }}
          >
            {copied === "max" ? (
              <>
                <Check className="h-5 w-5" /> Ссылка MAX скопирована
              </>
            ) : (
              <>
                <MaxIcon size={20} className="rounded-md" /> Скопировать ссылку MAX
              </>
            )}
          </button>
        </div>

        <DrawerClose asChild>
          <button className="tap mt-4 w-full py-3 text-[14px] font-medium text-muted-foreground">
            Отмена
          </button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}
