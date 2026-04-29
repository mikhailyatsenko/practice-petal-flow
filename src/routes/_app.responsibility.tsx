import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { BackButton } from "@/components/layout/BackButton";
import { HowItWorksBlock } from "@/components/section/HowItWorksBlock";

export const Route = createFileRoute("/_app/responsibility")({
  head: () => ({
    meta: [
      { title: "Дневник ответственности — Клуб «Моя жизнь»" },
      { name: "description", content: "Зоны ответственности и регулярные проверки." },
    ],
  }),
  component: ResponsibilityScreen,
});

interface Zone {
  id: string;
  name: string;
  result: string;
  actions: string;
  createdAt: number;
}

interface Check {
  id: string;
  createdAt: number;
  answers: [string, string, string, string, string];
}

interface Store {
  zones: Zone[];
  checks: Check[];
}

const STORAGE_KEY = "responsibility-v1";

function loadStore(): Store {
  if (typeof window === "undefined") return { zones: [], checks: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { zones: [], checks: [] };
    const obj = JSON.parse(raw);
    return {
      zones: Array.isArray(obj?.zones) ? obj.zones : [],
      checks: Array.isArray(obj?.checks) ? obj.checks : [],
    };
  } catch {
    return { zones: [], checks: [] };
  }
}

function saveStore(s: Store) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function newId() {
  return `r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function fmtDate(ts: number) {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}.${mm}.${yy}`;
}

const QUESTIONS = [
  "За что я избегаю брать ответственность?",
  "В каких ситуациях я обвиняю других или обстоятельства вместо того, чтобы искать свои рычаги влияния?",
  "В каких областях я жду, что кто-то другой «разрулит» ситуацию за меня?",
  "Какие обязательства я взял и не выполняю(ил) перед собой или другими? Почему?",
  "За что я хотел бы взять на себя полную ответственность в своей жизни?",
] as const;

const HUNDRED = [
  "Своё физическое здоровье",
  "Питание и диета",
  "Регулярные физические упражнения",
  "Качество сна",
  "Эмоциональное благополучие",
  "Управление стрессом",
  "Личное развитие и обучение",
  "Постановка и достижение целей",
  "Финансовая дисциплина",
  "Управление личным бюджетом",
  "Своевременная оплата счетов",
  "Накопление сбережений",
  "Инвестиции в будущее",
  "Качество своих отношений",
  "Открытая коммуникация с близкими",
  "Поддержка семьи",
  "Время, проведённое с детьми",
  "Уважение к партнёру",
  "Решение конфликтов в отношениях",
  "Профессиональный рост",
  "Качество выполняемой работы",
  "Соблюдение рабочих дедлайнов",
  "Инициатива на работе",
  "Развитие профессиональных навыков",
  "Построение карьеры",
  "Личная продуктивность",
  "Управление временем",
  "Выполнение обещаний",
  "Честность в словах и действиях",
  "Соблюдение своих ценностей",
  "Принятие трудных решений",
  "Преодоление страхов",
  "Самодисциплина",
  "Уход за своим домом",
  "Организация пространства",
  "Экологичный образ жизни",
  "Снижение потребления ресурсов",
  "Помощь окружающим",
  "Волонтёрская деятельность",
  "Поддержка друзей в трудные моменты",
  "Участие в жизни сообщества",
  "Воспитание детей",
  "Передача детям своих ценностей",
  "Личный пример для других",
  "Забота о родителях",
  "Управление своими привычками",
  "Избавление от вредных привычек",
  "Формирование полезных привычек",
  "Соблюдение личных границ",
  "Уважение границ других",
  "Развитие эмпатии",
  "Управление гневом",
  "Прощение обид",
  "Принятие своих ошибок",
  "Извинения, когда это нужно",
  "Исправление своих ошибок",
  "Доверие к себе",
  "Развитие уверенности",
  "Забота о ментальном здоровье",
  "Регулярная рефлексия",
  "Ведение дневника",
  "Планирование своего будущего",
  "Реализация творческого потенциала",
  "Развитие хобби",
  "Время для отдыха",
  "Баланс работы и жизни",
  "Забота о своём внешнем виде",
  "Уход за одеждой и вещами",
  "Управление личными проектами",
  "Завершение начатых дел",
  "Организация поездок и путешествий",
  "Безопасность в быту",
  "Забота о домашних животных",
  "Поддержание порядка в машине",
  "Соблюдение законов и правил",
  "Участие в общественных инициативах",
  "Голосование на выборах",
  "Осведомлённость о текущих событиях",
  "Развитие критического мышления",
  "Проверка фактов перед суждениями",
  "Управление своими ожиданиями",
  "Принятие реальности",
  "Адаптация к изменениям",
  "Гибкость в подходах",
  "Развитие терпения",
  "Уважение к чужому мнению",
  "Конструктивная критика",
  "Обучение других",
  "Деление знаний и опыта",
  "Создание безопасного пространства для других",
  "Забота о своём духовном росте",
  "Практика благодарности",
  "Развитие осознанности",
  "Медитация или духовные практики",
  "Уважение к природе",
  "Сохранение семейных традиций",
  "Создание новых традиций",
  "Поддержание связи с дальними родственниками",
  "Управление своим цифровым следом",
  "Осознанное использование соцсетей",
];

type View =
  | { kind: "main" }
  | { kind: "add"; step: 1 | 2 | 3; name: string; result: string; actions: string }
  | { kind: "edit"; id: string }
  | { kind: "checks" }
  | { kind: "checkFlow"; step: 0 | 1 | 2 | 3 | 4; answers: string[] }
  | { kind: "checkDetail"; id: string }
  | { kind: "hundred" };

const PAGE_BG = "#FAF6EF";
const ORANGE_GRAD = "linear-gradient(135deg, #FFB300, #FF6D00)";
const CARD_SHADOW = "0 2px 12px rgba(0,0,0,0.07)";

function PrimaryBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3 text-white font-semibold disabled:opacity-50"
      style={{ background: ORANGE_GRAD, borderRadius: 12 }}
    >
      {children}
    </button>
  );
}

function SecondaryBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 font-semibold"
      style={{
        background: "#fff",
        color: "#1a1a1a",
        borderRadius: 12,
        border: "1px solid #ede8df",
      }}
    >
      {children}
    </button>
  );
}

function Header({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center gap-2 py-3">
      <BackButton onClick={onBack} />
      <h1 className="flex-1 text-center text-[17px] font-bold pr-8" style={{ color: "#1a1a1a" }}>
        {title}
      </h1>
    </div>
  );
}

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = Math.max(0, Math.min(100, (value / total) * 100));
  return (
    <div className="w-full h-1.5 rounded-full mb-4" style={{ background: "#ede8df" }}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, background: ORANGE_GRAD }}
      />
    </div>
  );
}

function ZoneCard({
  zone,
  onEdit,
  onDelete,
}: {
  zone: Zone;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menu]);

  return (
    <div
      className="relative p-4 mb-3"
      style={{ background: "#fff", borderRadius: 16, boxShadow: CARD_SHADOW }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[15px] font-bold pr-2" style={{ color: "#1a1a1a" }}>
          {zone.name}
        </div>
        <div className="relative" ref={ref}>
          <button
            onClick={() => setMenu((v) => !v)}
            className="p-1 -mr-1 -mt-1"
            aria-label="Меню"
          >
            <MoreVertical size={20} color="#8a8a8a" />
          </button>
          {menu && (
            <div
              className="absolute right-0 top-7 z-10 min-w-[140px] py-1"
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: CARD_SHADOW,
                border: "1px solid #ede8df",
              }}
            >
              <button
                className="w-full text-left px-3 py-2 text-[14px]"
                style={{ color: "#1a1a1a" }}
                onClick={() => {
                  setMenu(false);
                  onEdit();
                }}
              >
                Изменить
              </button>
              <button
                className="w-full text-left px-3 py-2 text-[14px]"
                style={{ color: "#d92c2c" }}
                onClick={() => {
                  setMenu(false);
                  setConfirm(true);
                }}
              >
                Удалить
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2">
        <div className="text-[12px]" style={{ color: "#8a8a8a" }}>
          Желаемый результат:
        </div>
        <div className="text-[14px] mt-0.5" style={{ color: "#1a1a1a" }}>
          {zone.result}
        </div>
      </div>
      <div className="mt-2">
        <div className="text-[12px]" style={{ color: "#8a8a8a" }}>
          Готовность делать действия:
        </div>
        <div className="text-[14px] mt-0.5" style={{ color: "#1a1a1a" }}>
          {zone.actions}
        </div>
      </div>

      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setConfirm(false)}
        >
          <div
            className="w-full max-w-md p-5"
            style={{ background: "#fff", borderRadius: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[15px] font-semibold mb-4" style={{ color: "#1a1a1a" }}>
              Вы уверены, что хотите удалить эту зону?
            </div>
            <div className="flex flex-col gap-2">
              <PrimaryBtn
                onClick={() => {
                  setConfirm(false);
                  onDelete();
                }}
              >
                Да, удалить
              </PrimaryBtn>
              <SecondaryBtn onClick={() => setConfirm(false)}>Отмена</SecondaryBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditSheet({
  zone,
  onClose,
  onSave,
}: {
  zone: Zone;
  onClose: () => void;
  onSave: (z: Zone) => void;
}) {
  const [name, setName] = useState(zone.name);
  const [result, setResult] = useState(zone.result);
  const [actions, setActions] = useState(zone.actions);

  const valid = name.trim() && result.trim() && actions.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-5 max-h-[90vh] overflow-y-auto"
        style={{
          background: "#fff",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[16px] font-bold mb-4" style={{ color: "#1a1a1a" }}>
          Редактировать зону
        </div>
        <Field label="Название" max={100}>
          <input
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-[14px] outline-none"
            style={{
              border: "1px solid #ede8df",
              borderRadius: 12,
              background: "#fff",
            }}
          />
        </Field>
        <Field label="Желаемый результат" max={300}>
          <textarea
            value={result}
            maxLength={300}
            onChange={(e) => setResult(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-[14px] outline-none resize-none"
            style={{ border: "1px solid #ede8df", borderRadius: 12 }}
          />
        </Field>
        <Field label="Готовность делать действия" max={300}>
          <textarea
            value={actions}
            maxLength={300}
            onChange={(e) => setActions(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-[14px] outline-none resize-none"
            style={{ border: "1px solid #ede8df", borderRadius: 12 }}
          />
        </Field>
        <div className="flex flex-col gap-2 mt-4">
          <PrimaryBtn
            disabled={!valid}
            onClick={() =>
              onSave({
                ...zone,
                name: name.trim(),
                result: result.trim(),
                actions: actions.trim(),
              })
            }
          >
            Сохранить изменения
          </PrimaryBtn>
          <SecondaryBtn onClick={onClose}>Отмена</SecondaryBtn>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  max,
  children,
}: {
  label: string;
  max?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <label className="text-[12px]" style={{ color: "#8a8a8a" }}>
          {label}
        </label>
        {max != null && (
          <span className="text-[11px]" style={{ color: "#8a8a8a" }}>
            до {max}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function ResponsibilityScreen() {
  const navigate = useNavigate();
  const [store, setStore] = useState<Store>({ zones: [], checks: [] });
  const [view, setView] = useState<View>({ kind: "main" });

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const update = (s: Store) => {
    setStore(s);
    saveStore(s);
  };

  const goSections = () => navigate({ to: "/sections" });

  return (
    <div className="min-h-screen pb-8" style={{ background: PAGE_BG }}>
      <div className="px-4 max-w-md mx-auto">
        {view.kind === "main" && (
          <MainView
            store={store}
            onBack={goSections}
            onAdd={() =>
              setView({ kind: "add", step: 1, name: "", result: "", actions: "" })
            }
            onChecks={() => setView({ kind: "checks" })}
            onHundred={() => setView({ kind: "hundred" })}
            onEdit={(id) => setView({ kind: "edit", id })}
            onDelete={(id) =>
              update({ ...store, zones: store.zones.filter((z) => z.id !== id) })
            }
          />
        )}

        {view.kind === "add" && (
          <AddView
            view={view}
            setView={setView}
            onBack={() => setView({ kind: "main" })}
            onSave={(name, result, actions) => {
              const zone: Zone = {
                id: newId(),
                name,
                result,
                actions,
                createdAt: Date.now(),
              };
              update({ ...store, zones: [zone, ...store.zones] });
              setView({ kind: "main" });
            }}
          />
        )}

        {view.kind === "edit" && (() => {
          const zone = store.zones.find((z) => z.id === view.id);
          if (!zone) {
            setView({ kind: "main" });
            return null;
          }
          return (
            <>
              <MainView
                store={store}
                onBack={goSections}
                onAdd={() =>
                  setView({ kind: "add", step: 1, name: "", result: "", actions: "" })
                }
                onChecks={() => setView({ kind: "checks" })}
                onHundred={() => setView({ kind: "hundred" })}
                onEdit={(id) => setView({ kind: "edit", id })}
                onDelete={(id) =>
                  update({ ...store, zones: store.zones.filter((z) => z.id !== id) })
                }
              />
              <EditSheet
                zone={zone}
                onClose={() => setView({ kind: "main" })}
                onSave={(z) => {
                  update({
                    ...store,
                    zones: store.zones.map((x) => (x.id === z.id ? z : x)),
                  });
                  setView({ kind: "main" });
                }}
              />
            </>
          );
        })()}

        {view.kind === "checks" && (
          <ChecksView
            checks={store.checks}
            onBack={() => setView({ kind: "main" })}
            onStart={() =>
              setView({ kind: "checkFlow", step: 0, answers: ["", "", "", "", ""] })
            }
            onDetail={(id) => setView({ kind: "checkDetail", id })}
          />
        )}

        {view.kind === "checkFlow" && (
          <CheckFlowView
            view={view}
            setView={setView}
            onCancel={() => setView({ kind: "checks" })}
            onSave={(answers) => {
              const check: Check = {
                id: newId(),
                createdAt: Date.now(),
                answers: answers as Check["answers"],
              };
              update({ ...store, checks: [check, ...store.checks] });
              setView({ kind: "checks" });
            }}
          />
        )}

        {view.kind === "checkDetail" && (() => {
          const check = store.checks.find((c) => c.id === view.id);
          if (!check) {
            setView({ kind: "checks" });
            return null;
          }
          return (
            <CheckDetailView
              check={check}
              onBack={() => setView({ kind: "checks" })}
            />
          );
        })()}

        {view.kind === "hundred" && (
          <HundredView onBack={() => setView({ kind: "main" })} />
        )}
      </div>
    </div>
  );
}

function MainView({
  store,
  onBack,
  onAdd,
  onChecks,
  onHundred,
  onEdit,
  onDelete,
}: {
  store: Store;
  onBack: () => void;
  onAdd: () => void;
  onChecks: () => void;
  onHundred: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      <Header title="Дневник ответственности" onBack={onBack} />
      <h2 className="text-[18px] font-bold mt-2 mb-3" style={{ color: "#1a1a1a" }}>
        Мои зоны ответственности
      </h2>

      {store.zones.length === 0 ? (
        <div
          className="p-5 text-center text-[14px] mb-4"
          style={{ color: "#8a8a8a", background: "#fff", borderRadius: 16, boxShadow: CARD_SHADOW }}
        >
          У вас ещё нет зон ответственности.
        </div>
      ) : (
        store.zones.map((z) => (
          <ZoneCard
            key={z.id}
            zone={z}
            onEdit={() => onEdit(z.id)}
            onDelete={() => onDelete(z.id)}
          />
        ))
      )}

      <div className="flex flex-col gap-2 mt-4">
        <PrimaryBtn onClick={onAdd}>Добавить ответственность</PrimaryBtn>
        <button
          onClick={onChecks}
          className="w-full py-3 font-semibold"
          style={{
            background: "#fff",
            color: "#FF6D00",
            borderRadius: 12,
            border: "1.5px solid #FF6D00",
          }}
        >
          Проверка ответственности
        </button>
        <button
          onClick={onHundred}
          className="w-full py-3 font-semibold"
          style={{
            background: "#fff",
            color: "#FF6D00",
            borderRadius: 12,
            border: "1.5px solid #FF6D00",
          }}
        >
          100 видов ответственности
        </button>
      </div>
    </>
  );
}

function AddView({
  view,
  setView,
  onBack,
  onSave,
}: {
  view: Extract<View, { kind: "add" }>;
  setView: (v: View) => void;
  onBack: () => void;
  onSave: (name: string, result: string, actions: string) => void;
}) {
  const { step, name, result, actions } = view;

  return (
    <>
      <Header title="Новая зона" onBack={onBack} />
      <ProgressBar value={step} total={3} />

      {step === 1 && (
        <>
          <div className="text-[16px] font-bold mb-2" style={{ color: "#1a1a1a" }}>
            За что ты берёшь ответственность?
          </div>
          <div className="text-[13px] mb-3" style={{ color: "#8a8a8a" }}>
            Пример: За своё эмоциональное состояние
          </div>
          <input
            value={name}
            maxLength={100}
            onChange={(e) => setView({ ...view, name: e.target.value })}
            className="w-full px-3 py-3 text-[14px] outline-none mb-2"
            style={{
              background: "#fff",
              border: "1px solid #ede8df",
              borderRadius: 12,
            }}
            placeholder="Введите название зоны"
          />
          <div className="text-[11px] text-right mb-4" style={{ color: "#8a8a8a" }}>
            {name.length}/100
          </div>
          <div className="flex flex-col gap-2">
            <PrimaryBtn
              disabled={!name.trim()}
              onClick={() => setView({ ...view, step: 2 })}
            >
              Далее →
            </PrimaryBtn>
            <SecondaryBtn onClick={onBack}>← Назад</SecondaryBtn>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="text-[16px] font-bold mb-3" style={{ color: "#1a1a1a" }}>
            Какие результаты ты хотел(а) бы видеть благодаря своей ответственности в этой зоне?
          </div>
          <textarea
            value={result}
            maxLength={300}
            rows={6}
            onChange={(e) => setView({ ...view, result: e.target.value })}
            className="w-full px-3 py-3 text-[14px] outline-none mb-2 resize-none"
            style={{
              background: "#fff",
              border: "1px solid #ede8df",
              borderRadius: 12,
            }}
            placeholder="Опишите желаемый результат"
          />
          <div className="text-[11px] text-right mb-4" style={{ color: "#8a8a8a" }}>
            {result.length}/300
          </div>
          <div className="flex flex-col gap-2">
            <PrimaryBtn
              disabled={!result.trim()}
              onClick={() => setView({ ...view, step: 3 })}
            >
              Далее →
            </PrimaryBtn>
            <SecondaryBtn onClick={() => setView({ ...view, step: 1 })}>← Назад</SecondaryBtn>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="text-[16px] font-bold mb-3" style={{ color: "#1a1a1a" }}>
            Какие конкретные действия ты готов(а) предпринять, чтобы укрепить эту зону ответственности?
          </div>
          <textarea
            value={actions}
            maxLength={300}
            rows={6}
            onChange={(e) => setView({ ...view, actions: e.target.value })}
            className="w-full px-3 py-3 text-[14px] outline-none mb-2 resize-none"
            style={{
              background: "#fff",
              border: "1px solid #ede8df",
              borderRadius: 12,
            }}
            placeholder="Опишите действия"
          />
          <div className="text-[11px] text-right mb-4" style={{ color: "#8a8a8a" }}>
            {actions.length}/300
          </div>
          <div className="flex flex-col gap-2">
            <PrimaryBtn
              disabled={!actions.trim()}
              onClick={() => onSave(name.trim(), result.trim(), actions.trim())}
            >
              Сохранить
            </PrimaryBtn>
            <SecondaryBtn onClick={() => setView({ ...view, step: 2 })}>← Назад</SecondaryBtn>
          </div>
        </>
      )}
    </>
  );
}

function ChecksView({
  checks,
  onBack,
  onStart,
  onDetail,
}: {
  checks: Check[];
  onBack: () => void;
  onStart: () => void;
  onDetail: (id: string) => void;
}) {
  return (
    <>
      <Header title="Мои проверки" onBack={onBack} />
      {checks.length === 0 ? (
        <div
          className="p-5 text-center text-[14px] mb-4"
          style={{ color: "#8a8a8a", background: "#fff", borderRadius: 16, boxShadow: CARD_SHADOW }}
        >
          Вы ещё не делали проверки
        </div>
      ) : (
        checks.map((c) => (
          <div
            key={c.id}
            className="p-4 mb-3 flex items-center justify-between"
            style={{ background: "#fff", borderRadius: 16, boxShadow: CARD_SHADOW }}
          >
            <div className="text-[14px]" style={{ color: "#1a1a1a" }}>
              Проверка {fmtDate(c.createdAt)} года
            </div>
            <button
              onClick={() => onDetail(c.id)}
              className="text-[14px] font-semibold"
              style={{ color: "#FF6D00" }}
            >
              Подробнее →
            </button>
          </div>
        ))
      )}
      <div className="flex flex-col gap-2 mt-4">
        <PrimaryBtn onClick={onStart}>Сделать проверку ответственности</PrimaryBtn>
        <SecondaryBtn onClick={onBack}>← Назад в раздел</SecondaryBtn>
      </div>
    </>
  );
}

function CheckFlowView({
  view,
  setView,
  onCancel,
  onSave,
}: {
  view: Extract<View, { kind: "checkFlow" }>;
  setView: (v: View) => void;
  onCancel: () => void;
  onSave: (answers: string[]) => void;
}) {
  const { step, answers } = view;
  const value = answers[step] || "";
  const isLast = step === 4;

  return (
    <>
      <Header title="Проверка" onBack={onCancel} />
      <ProgressBar value={step + 1} total={5} />

      <div className="text-[15px] font-bold mb-3" style={{ color: "#1a1a1a" }}>
        {QUESTIONS[step]}
      </div>
      <textarea
        value={value}
        rows={8}
        onChange={(e) => {
          const next = [...answers];
          next[step] = e.target.value;
          setView({ ...view, answers: next });
        }}
        className="w-full px-3 py-3 text-[14px] outline-none mb-4 resize-none"
        style={{
          background: "#fff",
          border: "1px solid #ede8df",
          borderRadius: 12,
        }}
        placeholder="Ваш ответ..."
      />
      <div className="flex flex-col gap-2">
        <PrimaryBtn
          disabled={!value.trim()}
          onClick={() => {
            if (isLast) onSave(answers);
            else setView({ ...view, step: (step + 1) as 1 | 2 | 3 | 4 });
          }}
        >
          {isLast ? "Сохранить" : "Далее →"}
        </PrimaryBtn>
        <SecondaryBtn
          onClick={() => {
            if (step === 0) onCancel();
            else setView({ ...view, step: (step - 1) as 0 | 1 | 2 | 3 });
          }}
        >
          ← Назад
        </SecondaryBtn>
      </div>
    </>
  );
}

function CheckDetailView({
  check,
  onBack,
}: {
  check: Check;
  onBack: () => void;
}) {
  return (
    <>
      <Header title={`Проверка ${fmtDate(check.createdAt)}`} onBack={onBack} />
      <div className="flex flex-col gap-3">
        {QUESTIONS.map((q, i) => (
          <div
            key={i}
            className="p-4"
            style={{ background: "#fff", borderRadius: 16, boxShadow: CARD_SHADOW }}
          >
            <div className="text-[13px] font-semibold mb-1" style={{ color: "#1a1a1a" }}>
              {q}
            </div>
            <div className="text-[12px] mb-1" style={{ color: "#8a8a8a" }}>
              Ответ:
            </div>
            <div className="text-[14px] whitespace-pre-wrap" style={{ color: "#1a1a1a" }}>
              {check.answers[i] || "—"}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <SecondaryBtn onClick={onBack}>← Назад к списку</SecondaryBtn>
      </div>
    </>
  );
}

function HundredView({ onBack }: { onBack: () => void }) {
  return (
    <>
      <Header title="100 видов ответственности" onBack={onBack} />
      <div
        className="p-4 mb-3 text-[14px]"
        style={{ background: "#fff", borderRadius: 16, boxShadow: CARD_SHADOW, color: "#1a1a1a" }}
      >
        Вот список из 100 вариантов, за что человек может взять ответственность:
      </div>
      <ol
        className="p-4 mb-4 text-[14px] list-decimal pl-8 space-y-1.5"
        style={{ background: "#fff", borderRadius: 16, boxShadow: CARD_SHADOW, color: "#1a1a1a" }}
      >
        {HUNDRED.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
      <SecondaryBtn onClick={onBack}>← Назад</SecondaryBtn>
    </>
  );
}
