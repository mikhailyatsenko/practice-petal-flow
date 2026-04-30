import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, X, ArrowLeft, Check, ImageIcon, FolderOpen, Pencil, RotateCw, Sparkles, Trash2, Trophy, MoreHorizontal, ChevronDown, Heart } from "lucide-react";
import wishHouse from "@/assets/wish-house.jpg";
import wishBali from "@/assets/wish-bali.jpg";
import wishBody from "@/assets/wish-body.jpg";
import wishBook from "@/assets/wish-book.jpg";
import wishBusiness from "@/assets/wish-business.jpg";
import goalMarathon from "@/assets/goal-marathon.jpg";
import goalLanguage from "@/assets/goal-language.jpg";
import goalSavings from "@/assets/goal-savings.jpg";
import { TasksModule, CreateOrEditTaskScreen, type Task as ModuleTask } from "@/components/tasks/TasksModule";
import { setPracticeDone, useChargesMap, bumpCharge, setChargeTotal, useDaysCount } from "@/lib/practicesStore";
import { HowVideoCards } from "@/components/section/HowVideoCards";

const VALID_TABS = ["wants", "wishes", "goals", "tasks", "done"] as const;
type WishesSearch = { tab?: typeof VALID_TABS[number] };

export const Route = createFileRoute("/_app/wishes")({
  validateSearch: (search: Record<string, unknown>): WishesSearch => {
    const tab = search.tab;
    if (typeof tab === "string" && (VALID_TABS as readonly string[]).includes(tab)) {
      return { tab: tab as WishesSearch["tab"] };
    }
    return {};
  },
  head: () => ({
    meta: [
      { title: "Желания — Клуб «Моя жизнь»" },
      { name: "description", content: "Лента твоих желаний — листай, вдохновляйся, воплощай." },
    ],
  }),
  component: WishesScreen,
});

const TABS = [
  { id: "wants",     label: "Хотелки"     },
  { id: "wishes",    label: "Желания"     },
  { id: "goals",     label: "Цели"        },
  { id: "tasks",     label: "Задачи"      },
  { id: "done",      label: "Воплощённые" },
] as const;

type TabId = typeof TABS[number]["id"];

const getAdjacentTab = (tab: TabId, step: -1 | 1): TabId | null => {
  const idx = TABS.findIndex((item) => item.id === tab);
  const next = TABS[idx + step];
  return next ? next.id : null;
};

type ImageAspect = "portrait" | "landscape" | "square";

const aspectClass = (a?: ImageAspect) =>
  a === "landscape" ? "aspect-[16/10]" : a === "square" ? "aspect-square" : "aspect-[4/5]";

interface Wish {
  id: string;
  image: string;
  title: string;
  reasons: string[];
  vision?: string;
  aspect?: ImageAspect;
}

const INITIAL_WISHES: Wish[] = [
  {
    id: "w1",
    image: wishHouse,
    title: "Дом у океана",
    aspect: "portrait",
    vision:
      "Я просыпаюсь рано утром, открываю окно — и комнату наполняет солёный воздух. Босиком выхожу на тёплую террасу с чашкой кофе, слышу шум прибоя и крики чаек. Дети бегут по песку, смеются. Это мой дом — светлый, просторный, наполненный любовью и спокойствием.",
    reasons: [
      "Просыпаться под шум волн и встречать рассветы у воды",
      "Свобода и пространство для семьи и творчества",
      "Место силы, куда хочется возвращаться",
    ],
  },
  {
    id: "w2",
    image: wishBali,
    title: "Зимовка на Бали",
    aspect: "landscape",
    vision:
      "Я живу в уютной вилле среди джунглей. По утрам — йога на открытой террасе, потом сёрфинг на тёплых волнах. Днём работаю в кафе с видом на рисовые поля, вечером — закаты с новыми друзьями. Голова ясная, тело лёгкое, душа в полном балансе.",
    reasons: [
      "Сменить обстановку и перезагрузить голову",
      "Жить среди природы, тепла и спокойствия",
      "Познакомиться с людьми со всего мира",
    ],
  },
  {
    id: "w3",
    image: wishBody,
    title: "Тело, в котором энергия",
    aspect: "square",
    vision:
      "Я смотрю в зеркало и вижу подтянутое, сильное тело. Поднимаюсь по лестнице — дыхание ровное, мышцы упругие. Утром бегу 5 км и чувствую только лёгкость. Одежда сидит идеально, и я с удовольствием встречаю каждый новый день в этом теле.",
    reasons: [
      "Чувствовать лёгкость и силу каждый день",
      "Уверенность в себе и в зеркале",
      "Здоровье — фундамент всего остального",
    ],
  },
  {
    id: "w4",
    image: wishBook,
    title: "Написать свою книгу",
    aspect: "landscape",
    vision:
      "Я держу в руках напечатанный экземпляр своей книги. На обложке — моё имя. Читатели пишут, что книга помогла им посмотреть на жизнь по-новому. Я провожу презентации, отвечаю на вопросы — и понимаю, что мой опыт реально нужен людям.",
    reasons: [
      "Оставить след и поделиться опытом с другими",
      "Структурировать свои мысли и путь",
      "Реализовать давнюю мечту",
    ],
  },
  {
    id: "w5",
    image: wishBusiness,
    title: "Своё дело, которое вдохновляет",
    aspect: "portrait",
    vision:
      "Я просыпаюсь и сам выбираю, чем заняться. Мой проект работает, команда живая и любит дело. Клиенты благодарят за результат. Деньги приходят стабильно, я свободно распоряжаюсь временем — могу уехать в путешествие или провести день с семьёй, не теряя в доходе.",
    reasons: [
      "Заниматься тем, что зажигает по утрам",
      "Финансовая свобода и контроль над временем",
      "Создавать ценность для других людей",
    ],
  },
];

const INITIAL_HOTELKI = [
  "Купить новые беспроводные наушники",
  "Сходить на массаж в эти выходные",
  "Попробовать сёрфинг",
  "Прочитать «Атомные привычки»",
  "Завести привычку медитации по утрам",
  "Съездить на выходные в горы",
  "Купить красивую кружку для кофе",
  "Научиться готовить пасту карбонара",
  "Сходить в новый ресторан с другом",
  "Завести растение на рабочий стол",
];

interface GoalTask {
  id: number;
  text: string;
  done: boolean;
}

interface Goal {
  id: string;
  title: string;
  image: string;            // путь к картинке цели
  deadline: string;
  progress: number;
  reasons: string[];
  vision?: string;
  criteria: string;
  plan: string;
  tasks: GoalTask[];
  aspect?: ImageAspect;
}

const MONTHS_RU = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

const daysInMonth = (monthIdx: number, year: number) =>
  new Date(year, monthIdx + 1, 0).getDate();

const formatDeadline = (d: number, m: number, y: number) =>
  `${d} ${MONTHS_RU[m]} ${y}`;

// Начальные цели — НЕ пересекаются с желаниями (другие темы и картинки)
const INITIAL_GOALS: Goal[] = [
  {
    id: "g1",
    title: "Пробежать первый марафон",
    image: goalMarathon,
    aspect: "landscape",
    deadline: "1 октября 2026",
    progress: 35,
    vision:
      "Я стою на финише марафона. Ноги горят, но я улыбаюсь — пробежал все 42,2 км. На груди медаль, рядом — близкие, которые поддерживали весь путь. Я знаю, что прошёл этот путь сам, шаг за шагом, и теперь нет ничего, чего я не смогу.",
    reasons: [
      "Доказать себе, что могу больше",
      "Построить выносливость и здоровье",
    ],
    criteria: "Финиш марафона 42,2 км в пределах 4:30:00.",
    plan: "Тренировки 4 раза в неделю → длинная пробежка по выходным → участие в полумарафоне в августе.",
    tasks: [
      { id: 1, text: "Купить кроссовки для длинных дистанций", done: true },
      { id: 2, text: "Составить план тренировок", done: false },
      { id: 3, text: "Зарегистрироваться на марафон", done: false },
    ],
  },
  {
    id: "g2",
    title: "Выучить испанский до B1",
    image: goalLanguage,
    aspect: "portrait",
    deadline: "1 июня 2027",
    progress: 20,
    vision:
      "Я свободно говорю с барменом в Барселоне, шучу с продавцом на рынке, понимаю фильмы Альмодовара без субтитров. Испанский больше не «иностранный» — это часть меня, ключ к новой культуре и людям.",
    reasons: [
      "Свободно общаться в путешествиях",
      "Открыть мир испаноязычной культуры",
    ],
    criteria: "Сдан экзамен DELE B1 с положительным результатом.",
    plan: "3 урока в неделю с преподавателем + ежедневно 20 мин Duolingo + один сериал в оригинале в неделю.",
    tasks: [
      { id: 1, text: "Найти преподавателя", done: true },
      { id: 2, text: "Пройти базовый курс грамматики", done: false },
    ],
  },
  {
    id: "g3",
    title: "Накопить финансовую подушку",
    image: goalSavings,
    aspect: "square",
    deadline: "31 декабря 2026",
    progress: 45,
    vision:
      "Я открываю приложение банка и вижу сумму, равную 6 месяцам моих расходов. Никакой тревоги, никакой зависимости от завтрашнего дня. Я знаю, что могу спокойно сменить работу, взять паузу или вложиться в новый проект — у меня есть подушка и свобода выбора.",
    reasons: [
      "Чувствовать уверенность и спокойствие",
      "Иметь свободу выбирать, а не выживать",
    ],
    criteria: "На отдельном счёте лежит сумма равная 6 месячным расходам.",
    plan: "Откладывать 20% дохода каждый месяц → класть на отдельный накопительный счёт → не трогать.",
    tasks: [
      { id: 1, text: "Открыть накопительный счёт", done: true },
      { id: 2, text: "Настроить автоперевод 20%", done: false },
    ],
  },
  {
    id: "g4",
    title: "Прочитать 24 книги за год",
    image: goalSavings,
    aspect: "square",
    deadline: "31 декабря 2026",
    progress: 15,
    vision:
      "31 декабря я листаю свой читательский дневник — 24 книги, каждая со своими заметками и инсайтами. Голова полна новых идей, мышление стало острее, а вечера с книгой превратились в любимый ритуал вместо листания ленты.",
    reasons: [
      "Расширять кругозор и мышление",
      "Возвращать привычку к глубокому чтению",
    ],
    criteria: "Прочитано и зафиксировано в дневнике 24 книги за календарный год.",
    plan: "Читать минимум 30 минут в день → чередовать художественную и нон-фикшн литературу → вести читательский дневник.",
    tasks: [
      { id: 1, text: "Составить список из 24 книг", done: false },
      { id: 2, text: "Завести читательский дневник", done: false },
    ],
  },
];

type HowBlock =
  | { kind: "card"; title: string; text: string }
  | { kind: "callout"; text: string }
  | { kind: "list"; title: string; items: { label: string; text: string }[] };

type HowVideo = { title: string; duration: string; caption: string };
type HowKey = TabId | "brainstorm";
const HOW_IT_WORKS: Record<HowKey, { videos: [HowVideo, HowVideo]; blocks: HowBlock[] }> = {
  wants: {
    videos: [
      {
        title: "🎬 Что такое Хотелки",
        duration: "5:00",
        caption:
          "Как работать с хотелками — быстро фиксировать желания, чтобы не терять важные мысли в потоке дня.",
      },
      {
        title: "✨ Как ловить и записывать желания",
        duration: "4:10",
        caption:
          "Простые приёмы: как замечать желания в обычной жизни и не фильтровать себя в момент записи.",
      },
    ],
    blocks: [
      {
        kind: "card",
        title: "✨ Что такое Хотелки",
        text: `Каждое большое желание когда-то начиналось с одной простой мысли — «а хочу я вот это». Этот раздел — место где эта мысль получает своё первое воплощение. Ты фиксируешь её, даёшь ей существование. Это начальная стадия любого желания.

Не каждая хотелка превратится в желание или цель. И это нормально. Но именно здесь всё начинается. Главное — не потерять эту мысль в потоке ежедневной суеты.

Часто желание появляется неожиданно — в середине дня, в разговоре, в случайный момент. Именно для этого существует этот блок. Чтобы не тратить время на картинку и причины — просто быстро записал и пошёл дальше. Желание зафиксировано, оно никуда не денется.`,
      },
      {
        kind: "card",
        title: "🎯 Как выполнять?",
        text: `Когда ты открываешь раздел — все твои хотелки сразу появляются перед тобой. Чтобы добавить новую — нажми «Добавить хотелку» внизу и напиши своё желание текстом — как чувствуешь, своими словами. Без правил и шаблонов. Просто то, чего хочешь. Как только написал — хотелка сохранена ✅`,
      },
      {
        kind: "callout",
        text: "☝️ Важно: не фильтруй себя. Любая мысль «а хочу...» достойна попасть сюда. Чем свободнее ты записываешь — тем точнее проявляются твои настоящие желания.",
      },
      {
        kind: "card",
        title: "💎 Что ты получаешь?",
        text: `Зафиксированное желание — это уже не просто мысль. Это намерение, которое существует. И чем больше таких намерений ты фиксируешь — тем яснее становится картина того, чего ты на самом деле хочешь от жизни.`,
      },
    ],
  },
  wishes: {
    videos: [
      {
        title: "🌟 Что такое Желания",
        duration: "6:30",
        caption:
          "Как из хотелки родить настоящее желание: найти причины, подобрать образ и почувствовать притяжение.",
      },
      {
        title: "🖼️ Как подобрать образ и причины",
        duration: "5:00",
        caption:
          "Разбор: как выбрать картинку, которая цепляет, и какие причины делают желание живым.",
      },
    ],
    blocks: [
      {
        kind: "card",
        title: "🌟 Что такое Желания",
        text: `Хотелка стала чем-то большим? Ты чувствуешь что это не просто мимолётная мысль, а то чего ты действительно хочешь? Тогда пора переводить её на следующий уровень — в желание.

Желание без образа и без причин — это просто слова. Но когда ты добавляешь картинку, которая тебя цепляет, и прописываешь почему это важно — желание оживает. Оно начинает притягивать тебя к себе каждый раз когда ты его видишь.`,
      },
      {
        kind: "list",
        title: "Желание отличается от хотелки тремя вещами:",
        items: [
          {
            label: "🧭 Ты знаешь зачем оно тебе",
            text: "У тебя есть ответ на вопрос «почему это важно для меня?». Не «хочу и всё», а глубокое понимание того, что это желание даст тебе и как изменит твою жизнь.",
          },
          {
            label: "🖼️ Ты видишь его образ",
            text: "В твоей голове есть конкретная картинка. Не размытое ощущение, а живой образ. Чем конкретнее образ — тем сильнее притяжение.",
          },
          {
            label: "🔥 Оно живёт в тебе",
            text: "Достаточно сильно, чтобы ты потратил время на его оформление.",
          },
        ],
      },
      {
        kind: "card",
        title: "🎯 Как выполнять?",
        text: `Открой раздел — все твои желания сразу перед тобой. Перечитывай их, живи ими, чувствуй их. Чтобы добавить новое — нажми «Добавить желание». Бот проведёт по трём шагам:

Шаг 1. Перенеси желание из хотелок или создай новое — напиши его текстом.
Шаг 2. Напиши причины — зачем тебе это желание? Что оно даст тебе?
Шаг 3. Добавь картинку — образ, который отражает твоё желание.

Когда все три шага выполнены — желание сохранено ✅`,
      },
      {
        kind: "callout",
        text: "Нажав на любое желание — попадёшь внутрь и увидишь его картинку и причины. Доступно: ✏️ Редактировать · ✅ Желание воплощено! · ❌ Удалить.",
      },
      {
        kind: "card",
        title: "💎 Что ты получаешь?",
        text: `Желание с причинами и образом — это уже не размытая фантазия. Это живой ориентир, который каждый раз когда ты его видишь — напоминает тебе, кем ты хочешь стать и куда идёшь. Чем чаще ты смотришь на свои желания — тем сильнее они притягивают тебя к себе.`,
      },
    ],
  },
  goals: {
    videos: [
      {
        title: "🎯 Что такое Цели",
        duration: "6:00",
        caption:
          "Как превратить желание в цель: выставить дату, прописать критерий и составить план.",
      },
      {
        title: "🗺️ Как написать рабочий план",
        duration: "5:20",
        caption:
          "Разбор: какие шаги попадают в план, как ставить промежуточные даты и не утонуть в деталях.",
      },
    ],
    blocks: [
      {
        kind: "card",
        title: "🎯 Что такое Цели",
        text: `Желание стало настолько живым и важным, что ты готов идти к нему? Тогда пора переводить его в цель. Цель отличается от желания одним — у неё есть конкретика.`,
      },
      {
        kind: "list",
        title: "У цели всегда есть три вещи:",
        items: [
          {
            label: "📅 Дата",
            text: "Ты знаешь до какого числа хочешь это реализовать. Дедлайн превращает «когда-нибудь» в «к конкретному сроку».",
          },
          {
            label: "✅ Критерий достижения",
            text: "Ты точно знаешь как поймёшь что цель воплощена. Не «хочу быть здоровым», а «пробежал 21 км».",
          },
          {
            label: "🗺️ План",
            text: "У тебя есть конкретные шаги, которые ведут к цели. Не общие слова, а действия с датами.",
          },
        ],
      },
      {
        kind: "callout",
        text: "📊 Исследования показывают: люди, которые записывают цели с конкретными датами и планом — достигают их в разы чаще тех, кто просто держит желание в голове. Это не теория — это механика.",
      },
      {
        kind: "card",
        title: "🎯 Как выполнять?",
        text: `Открой раздел — все твои цели перед тобой. Чтобы добавить новую — нажми «Добавить цель». Бот проведёт по четырём шагам:

Шаг 1. Выбери желание, которое переводишь в цель.
Шаг 2. Напиши конкретный критерий достижения.
Шаг 3. Напиши дату в формате день.месяц.год.
Шаг 4. Напиши общий план реализации.

Когда все шаги выполнены — цель сохранена ✅`,
      },
      {
        kind: "callout",
        text: "Внутри цели доступно: ➕ Добавить задачу · 🧠 Мозговой штурм · ✏️ Редактировать · ✅ Желание воплощено! · ❌ Убрать цель.",
      },
      {
        kind: "card",
        title: "💎 Что ты получаешь?",
        text: `Цель с критерием, датой и планом — это уже не мечта. Это проект. У него есть начало, конец и маршрут. Каждый раз когда ты открываешь этот раздел — ты видишь не просто слова, а конкретный курс, которому следуешь, и именно это запускает движение.`,
      },
    ],
  },
  tasks: {
    videos: [
      {
        title: "📋 Что такое Задачи",
        duration: "5:30",
        caption:
          "Как разбить большую цель на конкретные задачи и каждый день делать ощутимый шаг.",
      },
      {
        title: "🟧 Как работать с фильтрами и сроками",
        duration: "4:30",
        caption:
          "День / неделя / месяц / главные — как пользоваться фильтрами, чтобы не перегружаться задачами.",
      },
    ],
    blocks: [
      {
        kind: "card",
        title: "📋 Что такое Задачи",
        text: `Цель — это направление. Задачи — это движение. Можно годами смотреть на цель и ждать подходящего момента. А можно каждый день делать один конкретный шаг. Именно из таких шагов складываются результаты, которые меняют жизнь.

Большая цель пугает только пока ты смотришь на неё целиком. Разбей её на задачи — и она перестаёт быть страшной. Любую цель можно достичь. Просто нужно есть слона по кусочкам.`,
      },
      {
        kind: "card",
        title: "🎯 Как добавить задачу?",
        text: `Нажми «Добавить задачу». Бот проведёт по шагам:

Шаг 1. Выбери цель, к которой относится задача.
Шаг 2. Напиши название — конкретно и ясно.
Шаг 3. Укажи срок — выбери из списка или поставь дату.
Шаг 4. Укажи примерное время выполнения.
Шаг 5. Выбери чувство, которое вызывает задача.

Задача создана ✅`,
      },
      {
        kind: "callout",
        text: "✅ Выполнив хотя бы одну задачу в день — ты автоматически закрываешь ежедневную привычку «Задачи к целям».",
      },
      {
        kind: "list",
        title: "🎯 Фильтры по задачам:",
        items: [
          { label: "🟧 На день", text: "Задачи, назначенные на сегодня." },
          { label: "🟦 На неделю", text: "Задачи на эту неделю." },
          { label: "🟪 На месяц", text: "Задачи на этот месяц." },
          { label: "⬜ Открытые", text: "Все незавершённые задачи." },
          { label: "🟥 Главные", text: "Ключевые задачи — большой прогресс к цели." },
          { label: "🏁 Решённые", text: "Сколько задач уже выполнено по каждой цели." },
        ],
      },
      {
        kind: "callout",
        text: "Внутри задачи: ▶️ Начать работу (запускает таймер) · ✏️ Редактировать · ✅ Задача сделана! · ❌ Удалить · 🎯 Перейти к цели.",
      },
      {
        kind: "card",
        title: "💎 Что ты получаешь?",
        text: `Задачи превращают большую цель в управляемый процесс. Вместо того чтобы смотреть на цель и не знать с чего начать — ты просто берёшь следующую задачу и делаешь. Шаг за шагом. День за днём. И цель перестаёт казаться далёкой.`,
      },
    ],
  },
  done: {
    videos: [
      {
        title: "🏆 Что такое Воплощённые желания",
        duration: "4:30",
        caption:
          "Зачем возвращаться к воплощённым желаниям и как они укрепляют веру в себя.",
      },
      {
        title: "💎 Как использовать раздел в сложные моменты",
        duration: "3:50",
        caption:
          "Как этот раздел помогает в моменты сомнений, усталости и потери мотивации.",
      },
    ],
    blocks: [
      {
        kind: "card",
        title: "🏆 Что такое Воплощённые желания",
        text: `Это не просто раздел. Это твоя история побед. Каждое желание и хотелка которые ты довёл до воплощения — живут здесь.

Многие люди не замечают своих побед — достигают одного и сразу бегут к следующему. Этот раздел создан, чтобы ты останавливался и видел — сколько всего уже воплощено. Это мощный источник веры в себя и в свои будущие желания.`,
      },
      {
        kind: "card",
        title: "💎 Как пополняется этот раздел?",
        text: `Автоматически — когда ты нажимаешь «Желание воплощено!» внутри любого желания или цели. Воплощённое желание сразу появляется здесь и хранится навсегда.`,
      },
      {
        kind: "callout",
        text: "💡 Возвращайся сюда, когда чувствуешь сомнение или усталость. Листай воплощённые желания, читай причины, смотри на картинки — это лучшее напоминание о том, на что ты способен.",
      },
    ],
  },
  brainstorm: {
    videos: [
      {
        title: "🧠 Что такое Мозговой штурм",
        duration: "4:20",
        caption:
          "Зачем включать мозговой штурм по цели и как 30 вопросов помогают увидеть путь, который ты раньше не замечал.",
      },
      {
        title: "✍️ Как отвечать на вопросы",
        duration: "3:40",
        caption:
          "Лучший способ отвечать — без фильтра и без оценок. Разбираем, как поймать поток и достать настоящие ответы из себя.",
      },
    ],
    blocks: [
      {
        kind: "card",
        title: "🧠 Что такое Мозговой штурм",
        text: `Мозговой штурм — это твой личный разговор с целью. Ты задаёшь себе 30 вопросов и честно на них отвечаешь. Не для отчётности, не для красоты — для ясности.

Часто мы не двигаемся к цели не потому, что лень, а потому что не видим следующий шаг. Мозговой штурм вытаскивает из головы ответы, которые там уже есть, но прячутся за шумом и сомнениями.`,
      },
      {
        kind: "card",
        title: "🎯 Как это работает?",
        text: `Открой мозговой штурм у любой цели. Перед тобой список из 30 вопросов про эту цель: что мешает, что помогает, какие ресурсы есть, кто может помочь, что ты уже пробовал и так далее.

Шаг 1. Выбери любой вопрос — не обязательно по порядку.
Шаг 2. Напиши ответ свободно, в потоке. Минимум 100 символов — чтобы успеть подумать.
Шаг 3. Сохрани и иди к следующему. Ответы остаются — можно вернуться и дополнить.`,
      },
      {
        kind: "callout",
        text: "💡 Не пытайся ответить на все 30 вопросов за раз. Лучше 2–3 в день, но честно и глубоко. Часто самый ценный ответ приходит на третий день после вопроса.",
      },
      {
        kind: "list",
        title: "Зачем вообще это нужно:",
        items: [
          { label: "🔍 Видишь препятствия", text: "Замечаешь, что именно тормозит тебя — и перестаёшь биться о невидимую стену." },
          { label: "🗺 Появляются шаги", text: "Из ответов сами рождаются конкретные задачи, которые потом превращаются в действия." },
          { label: "💪 Растёт уверенность", text: "Когда ты видишь свой путь на бумаге, цель перестаёт быть пугающей и становится понятным проектом." },
        ],
      },
      {
        kind: "card",
        title: "💎 Что ты получаешь?",
        text: `Ясность вместо тумана. Конкретные шаги вместо «надо что-то делать». И ощущение, что ты не один на один с целью — у тебя есть карта, которую ты сам нарисовал.`,
      },
    ],
  },
};

function HowBlockView({ block }: { block: HowBlock }) {
  if (block.kind === "card") {
    return (
      <div
        className="bg-card shadow-card p-4"
        style={{ borderRadius: 14 }}
      >
        <h3 className="text-[14px] font-bold mb-2 text-foreground">
          {block.title}
        </h3>
        <p className="text-[13px] leading-relaxed text-foreground/85 whitespace-pre-line">
          {block.text}
        </p>
      </div>
    );
  }
  if (block.kind === "callout") {
    return (
      <div
        className="rounded-xl p-3 text-[13px] leading-snug"
        style={{
          background: "#fff3e0",
          color: "#92400e",
          border: "1px solid #ffe0b2",
        }}
      >
        {block.text}
      </div>
    );
  }
  return (
    <div
      className="bg-card shadow-card p-4"
      style={{ borderRadius: 14 }}
    >
      <h3 className="text-[14px] font-bold mb-3 text-foreground">
        {block.title}
      </h3>
      <div className="space-y-2">
        {block.items.map((it, i) => (
          <div
            key={i}
            className="rounded-xl p-3"
            style={{ background: "#fff7ed", border: "1px solid #ffe0b2" }}
          >
            <p className="text-[13px] font-semibold text-[#92400e] mb-0.5">
              {it.label}
            </p>
            <p className="text-[13px] leading-snug text-foreground/85">
              {it.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowItWorks({ tab }: { tab: HowKey }) {
  const [open, setOpen] = useState(false);
  const [howTab, setHowTab] = useState<"text" | "video">("text");
  const data = HOW_IT_WORKS[tab];
  return (
    <section className="px-4 mt-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="tap w-full bg-card hairline rounded-2xl shadow-card px-4 py-3 flex items-center justify-between"
      >
        <span className="text-[14px] font-medium">❓ Как это работает</span>
        <ChevronDown
          className="h-5 w-5 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>
      {open && (
        <div className="mt-3 animate-fade-up">
          <div
            className="flex rounded-xl mb-3"
            style={{ background: "#f0ebe2", padding: 4 }}
          >
            {(
              [
                { k: "text", label: "📖 Текст" },
                { k: "video", label: "▶️ Видео" },
              ] as const
            ).map((t) => {
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
              {data.blocks.map((b, i) => (
                <HowBlockView key={i} block={b} />
              ))}
            </div>
          )}

          {howTab === "video" && (
            <HowVideoCards first={data.videos[0]} second={data.videos[1]} />
          )}
        </div>
      )}
    </section>
  );
}

function WishesScreen() {
  const search = Route.useSearch();
  const [activeTab, setActiveTab] = useState<TabId>(search.tab ?? "wishes");

  // Реакция на смену search-параметра (например, при переходе из «Шаг к цели»)
  useEffect(() => {
    if (search.tab && search.tab !== activeTab) {
      setActiveTab(search.tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.tab]);
  const [transitionState, setTransitionState] = useState<{
    current: TabId;
    next: TabId;
    direction: -1 | 1;
    stage: "animating";
  } | null>(null);
  const touchRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const inspires = useChargesMap();
  const [wishes, setWishes] = useState<Wish[]>(INITIAL_WISHES);
  const [hotelki, setHotelki] = useState<string[]>(INITIAL_HOTELKI);

  // Цели
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const goalInspires = inspires; // единый источник для зарядки желаний и целей
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [creatingGoal, setCreatingGoal] = useState<null | { fromWish?: Wish; returnTo?: TabId }>(null);

  // Inline-форма для хотелки
  const [adding, setAdding] = useState(false);
  const [hotelkaText, setHotelkaText] = useState("");

  // Мастер создания желания
  const [creating, setCreating] = useState(false);

  // Редактирование желания
  const [editingWish, setEditingWish] = useState<Wish | null>(null);

  // Воплощённые
  const [doneHotelki, setDoneHotelki] = useState<Set<string>>(
    () => new Set([
      "Купить красивую кружку для кофе",
      "Научиться готовить пасту карбонара",
      "Завести растение на рабочий стол",
    ]),
  );
  const [doneWishes, setDoneWishes] = useState<Set<string>>(
    () => new Set(["w2", "w4"]),
  );
  const [doneGoals, setDoneGoals] = useState<Set<string>>(
    () => new Set(["g3"]),
  );

  // Раздел «Задачи»: фильтр по конкретной цели (когда переходим из «Цели → К задачам»)
  const [tasksFromGoalId, setTasksFromGoalId] = useState<string | null>(null);
  const [brainstormFromGoalId, setBrainstormFromGoalId] = useState<string | null>(null);
  const [brainstormingActive, setBrainstormingActive] = useState(false);

  // Центральное хранилище задач (используется и в TasksModule, и в карточке цели)
  const [moduleTasks, setModuleTasks] = useState<ModuleTask[]>([
    { id: "t1", goalId: "g1", title: "Купить кроссовки для длинных дистанций", deadline: "🟧 На день", duration: "1 час", feeling: 8, done: false, timeSpent: 0 },
    { id: "t2", goalId: "g1", title: "Составить план тренировок на месяц", deadline: "🟥 Главная задача", duration: "2 часа", feeling: 7, done: false, timeSpent: 0 },
    { id: "t3", goalId: "g1", title: "Зарегистрироваться на полумарафон", deadline: "🟪 На месяц", duration: "30 мин", feeling: 9, done: false, timeSpent: 0 },
    { id: "t4", goalId: "g2", title: "Найти преподавателя испанского", deadline: "🟦 На неделю", duration: "1 час", feeling: 6, done: false, timeSpent: 0 },
    { id: "t5", goalId: "g2", title: "Пройти базовый курс грамматики", deadline: "🟥 Главная задача", duration: "Более 10 часов", feeling: 5, done: false, timeSpent: 0 },
    { id: "t6", goalId: "g4", title: "Составить список из 24 книг на год", deadline: "🟧 На день", duration: "30 мин", feeling: 7, done: false, timeSpent: 0 },
    { id: "t7", goalId: "g4", title: "Завести читательский дневник", deadline: "⬜ Не определён", duration: "15 мин", feeling: 8, done: false, timeSpent: 0 },
  ]);

  // Быстрая постановка задачи из карточки цели
  const [quickTaskGoalId, setQuickTaskGoalId] = useState<string | null>(null);

  // Синхронизация с практикой «Шаг к цели»: как только хотя бы одна задача
  // выполнена сегодня — отмечаем привычку сделанной (и на главной, и на её странице).
  useEffect(() => {
    const doneCount = moduleTasks.filter((t) => t.done).length;
    if (doneCount < 1) return;
    try {
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      localStorage.setItem(
        "step-done-v1",
        JSON.stringify({ date: today, count: doneCount }),
      );
    } catch {
      /* ignore */
    }
    setPracticeDone("wishes", true);
  }, [moduleTasks]);

  // Сообщаем «Зарядке желаний» сколько всего активных объектов нужно зарядить
  // (активные желания + активные цели — без воплощённых).
  useEffect(() => {
    const activeWishes = wishes.filter((w) => !doneWishes.has(w.id)).length;
    const activeGoals = goals.filter((g) => !doneGoals.has(g.id)).length;
    setChargeTotal(activeWishes + activeGoals);
  }, [wishes, goals, doneWishes, doneGoals]);

  useEffect(() => {
    const onTouchMove = (event: TouchEvent) => {
      const state = touchRef.current;
      if (!state.active) return;

      const touch = event.touches[0];
      if (!touch) return;

      const dx = touch.clientX - state.x;
      const dy = touch.clientY - state.y;
      const startedNearEdge = state.x <= 32 || state.x >= window.innerWidth - 32;
      const isHorizontalSwipe = Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.1;

      if (startedNearEdge && isHorizontalSwipe) {
        event.preventDefault();
      }
    };

    const resetTouch = () => {
      touchRef.current.active = false;
    };

    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchcancel", resetTouch);

    return () => {
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchcancel", resetTouch);
    };
  }, []);

  const toggleDoneHotelka = (text: string) => {
    setDoneHotelki((prev) => {
      const next = new Set(prev);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
  };
  const toggleDoneWish = (id: string) => {
    setDoneWishes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleDoneGoal = (id: string) => {
    setDoneGoals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleInspire = (id: string) => {
    bumpCharge(id);
  };
  const handleGoalInspire = (id: string) => {
    bumpCharge(id);
  };

  const handleAddHotelka = () => {
    const v = hotelkaText.trim();
    if (!v) return;
    setHotelki((prev) => [...prev, v]);
    setHotelkaText("");
    setAdding(false);
  };

  const handleCreateWish = (w: Omit<Wish, "id">) => {
    const newWish: Wish = { ...w, id: `w${Date.now()}` };
    setWishes((prev) => [newWish, ...prev]);
    setCreating(false);
  };

  const handleSaveEdit = (updated: Wish) => {
    setWishes((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    setEditingWish(null);
  };

  const handleDeleteWish = (id: string) => {
    setWishes((prev) => prev.filter((w) => w.id !== id));
    setEditingWish(null);
  };

  const handleEditHotelka = (i: number, v: string) => {
    const t = v.trim();
    if (!t) return;
    setHotelki((prev) => prev.map((h, j) => (j === i ? t : h)));
  };

  const handleDeleteHotelka = (i: number) => {
    setHotelki((prev) => prev.filter((_, j) => j !== i));
  };

  const handleCreateGoal = (g: Omit<Goal, "id">) => {
    const newGoal: Goal = {
      ...g,
      id: `g${Date.now()}`,
    };
    setGoals((prev) => [newGoal, ...prev]);
  };

  const handleSaveGoal = (updated: Goal) => {
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    setEditingGoal(null);
  };
  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    setEditingGoal(null);
  };

  if (creatingGoal) {
    return (
      <CreateGoalWizard
        wishes={wishes}
        fromWish={creatingGoal.fromWish}
        onClose={() => {
          const ret = creatingGoal.returnTo;
          setCreatingGoal(null);
          if (ret) setActiveTab(ret);
        }}
        onCreate={(g, openInGoals, sourceWishId) => {
          handleCreateGoal(g);
          // Желание превратилось в цель — убираем его из ленты желаний
          if (sourceWishId) {
            setWishes((prev) => prev.filter((w) => w.id !== sourceWishId));
          }
          const ret = creatingGoal.returnTo;
          setCreatingGoal(null);
          if (openInGoals) setActiveTab("goals");
          else setActiveTab("goals"); // всегда показываем созданную цель
          void ret;
        }}
      />
    );
  }

  if (editingGoal) {
    return (
      <EditGoalScreen
        goal={editingGoal}
        onClose={() => setEditingGoal(null)}
        onSave={handleSaveGoal}
        onDelete={() => handleDeleteGoal(editingGoal.id)}
      />
    );
  }

  if (creating) {
    return (
      <CreateWishWizard
        onClose={() => setCreating(false)}
        onCreate={handleCreateWish}
        hotelki={hotelki}
        onConsumeHotelka={(idx) => setHotelki((prev) => prev.filter((_, j) => j !== idx))}
      />
    );
  }

  if (editingWish) {
    return (
      <EditWishScreen
        wish={editingWish}
        onClose={() => setEditingWish(null)}
        onSave={handleSaveEdit}
        onDelete={() => handleDeleteWish(editingWish.id)}
      />
    );
  }

  
  const changeTabWithCardEffect = (direction: -1 | 1, targetTab?: TabId) => {
    if (transitionState) return;
    const next = targetTab ?? getAdjacentTab(activeTab, direction);
    if (!next || next === activeTab) return;
    // Уходящий таб показываем оверлеем, а активный сразу переключаем — чтобы не было ремоунта/мерцания.
    const outgoing = activeTab;
    setActiveTab(next);
    setTransitionState({ current: outgoing, next, direction, stage: "animating" });
    window.setTimeout(() => {
      setTransitionState(null);
    }, 320);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY, active: true };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current.active || transitionState) return;
    touchRef.current.active = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) changeTabWithCardEffect(1);
    if (dx > 0) changeTabWithCardEffect(-1);
  };

  const renderTabContent = (tab: TabId) => {
    if (tab === "wishes") {
      return (
        <>
        <div className="px-4 pt-3 space-y-4">
          <button
            onClick={() => setCreating(true)}
            className="tap btn-pill-orange w-full inline-flex items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Добавить желание
          </button>
          <div className="space-y-4">
            {wishes.filter((w) => !doneWishes.has(w.id)).map((w) => (
              <WishCard
                key={w.id}
                wish={w}
                priority={false}
                count={inspires[w.id] ?? 0}
                onInspire={() => handleInspire(w.id)}
                onEdit={() => setEditingWish(w)}
                onMakeGoal={() => setCreatingGoal({ fromWish: w, returnTo: "wishes" })}
                onDelete={() => handleDeleteWish(w.id)}
                isDone={doneWishes.has(w.id)}
                onToggleDone={() => toggleDoneWish(w.id)}
              />
            ))}
            {wishes.filter((w) => !doneWishes.has(w.id)).length === 0 && (
              <div className="text-center text-[13px] text-[#FF6D00] py-10">
                Пока нет желаний. Добавь первое ✨
              </div>
            )}
          </div>
          <div className="text-center text-[11px] text-muted-foreground pt-2 pb-1">
            Это все твои желания на сегодня ✨
          </div>
        </div>
        <HowItWorks key="wishes" tab="wishes" />
        </>
      );
    }

    if (tab === "wants") {
      return (
        <>
        <div className="px-4 pt-3">
          {adding ? (
            <InlineHotelkaForm
              value={hotelkaText}
              onChange={setHotelkaText}
              onSubmit={handleAddHotelka}
              onCancel={() => {
                setAdding(false);
                setHotelkaText("");
              }}
            />
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="tap btn-pill-orange w-full inline-flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Добавить хотелку
            </button>
          )}
          <div className="mt-5 space-y-2">
            {hotelki.filter((h) => !doneHotelki.has(h)).map((h) => {
              const realIdx = hotelki.indexOf(h);
              return (
                <HotelkaItem
                  key={`${realIdx}-${h}`}
                  index={realIdx + 1}
                  text={h}
                  onSave={(v) => handleEditHotelka(realIdx, v)}
                  onDelete={() => handleDeleteHotelka(realIdx)}
                  isDone={doneHotelki.has(h)}
                  onToggleDone={() => toggleDoneHotelka(h)}
                />
              );
            })}
          </div>
          <div className="text-center text-[11px] text-muted-foreground pt-3 pb-1">
            Маленькие хотелки — большие радости 🌿
          </div>
        </div>
        <HowItWorks key="wants" tab="wants" />
        </>
      );
    }

    if (tab === "goals") {
      return (
        <>
        <div className="px-4 pt-3 space-y-4">
          <button
            onClick={() => setCreatingGoal({ returnTo: "goals" })}
            className="tap btn-pill-orange w-full inline-flex items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Добавить цель
          </button>
          {goals.filter((g) => !doneGoals.has(g.id)).map((g) => {
            const goalTasks = moduleTasks.filter((t) => t.goalId === g.id);
            const goalDone = goalTasks.filter((t) => t.done).length;
            return (
              <GoalCard
                key={g.id}
                goal={g}
                count={goalInspires[g.id] ?? 0}
                onInspire={() => handleGoalInspire(g.id)}
                onEdit={() => setEditingGoal(g)}
                onDelete={() => handleDeleteGoal(g.id)}
                isDone={doneGoals.has(g.id)}
                onToggleDone={() => toggleDoneGoal(g.id)}
                tasksAll={goalTasks}
                tasksDoneCount={goalDone}
                onAddTask={() => setQuickTaskGoalId(g.id)}
                onProgressChange={(value) =>
                  setGoals((prev) => prev.map((x) => (x.id === g.id ? { ...x, progress: value } : x)))
                }
                onOpenTasks={() => {
                  // По правке: при переходе из «Цели» фильтр НЕ ставим — показываем все задачи всех целей.
                  setTasksFromGoalId(null);
                  changeTabWithCardEffect(1, "tasks");
                }}
                onBrainstorm={() => {
                  setTasksFromGoalId(null);
                  setBrainstormFromGoalId(g.id);
                  changeTabWithCardEffect(1, "tasks");
                }}
              />
            );
          })}
          {goals.filter((g) => !doneGoals.has(g.id)).length === 0 && (
            <div className="text-center text-[12px] text-muted-foreground pt-6">
              Пока нет целей. Создай первую — вырасти её из желания 🎯
            </div>
          )}
        </div>
        <HowItWorks key="goals" tab="goals" />
        </>
      );
    }

    if (tab === "tasks") {
      return (
        <>
        <TasksModule
          goals={goals.filter((g) => !doneGoals.has(g.id)).map((g) => ({
            id: g.id,
            title: g.title,
            plan: g.plan,
            image: g.image,
          }))}
          initialGoalId={tasksFromGoalId}
          onClearGoalFilter={() => setTasksFromGoalId(null)}
          initialBrainstormGoalId={brainstormFromGoalId}
          onClearBrainstormGoalId={() => setBrainstormFromGoalId(null)}
          onBrainstormingChange={setBrainstormingActive}
          tasks={moduleTasks}
          onTasksChange={(updater) => setModuleTasks(updater)}
          onUpdateGoalPlan={(goalId, plan) =>
            setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, plan } : g)))
          }
        />
        {brainstormingActive ? (
          <HowItWorks key="brainstorm" tab="brainstorm" />
        ) : (
          <HowItWorks key="tasks" tab="tasks" />
        )}
        </>
      );
    }

    return (
      <>
      <RealizedTab
        hotelki={hotelki.filter((h) => doneHotelki.has(h))}
        wishes={wishes.filter((w) => doneWishes.has(w.id))}
        goals={goals.filter((g) => doneGoals.has(g.id))}
        moduleTasks={moduleTasks}
        onUndoHotelka={(t) => toggleDoneHotelka(t)}
        onUndoWish={(id) => toggleDoneWish(id)}
        onUndoGoal={(id) => toggleDoneGoal(id)}
      />
      <HowItWorks key="done" tab="done" />
      </>
    );
  };

  return (
    <div className="pb-4" style={{ touchAction: "pan-y" }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Горизонтальные вкладки */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="flex gap-1.5 overflow-x-auto px-4 py-2.5 no-scrollbar">
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === activeTab) return;
                  const currentIndex = TABS.findIndex((item) => item.id === activeTab);
                  const nextIndex = TABS.findIndex((item) => item.id === tab.id);
                  changeTabWithCardEffect(nextIndex > currentIndex ? 1 : -1, tab.id);
                }}
                className={
                  active
                    ? "tap btn-pill-orange btn-sm shrink-0"
                    : "tap shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium bg-card text-muted-foreground hairline"
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative overflow-hidden">
        {/* Активная вкладка остаётся смонтированной всегда — никаких мерцаний на смене таба */}
        <div>{renderTabContent(activeTab)}</div>

        {/* Уходящая вкладка показывается поверх только во время анимации */}
        {transitionState && (
          <div
            className="absolute inset-0 min-w-0"
            style={{
              animation: transitionState.direction === 1
                ? "slide-out-left 320ms cubic-bezier(.2,.7,.2,1) both"
                : "slide-out-right 320ms cubic-bezier(.2,.7,.2,1) both",
              background: "var(--background)",
              zIndex: 20,
              pointerEvents: "none",
            }}
          >
            {renderTabContent(transitionState.current)}
          </div>
        )}
      </div>

      {/* Быстрая постановка задачи из карточки цели */}
      {quickTaskGoalId && createPortal(
        <div
          className="fixed inset-0 z-[100] overflow-y-auto animate-fade-up flex justify-center"
          style={{ background: "var(--background)" }}
        >
          <div className="w-full max-w-[480px]">
            <CreateOrEditTaskScreen
              mode="create"
              goals={goals.filter((g) => !doneGoals.has(g.id)).map((g) => ({ id: g.id, title: g.title, plan: g.plan }))}
              defaultGoalId={quickTaskGoalId}
              onCancel={() => setQuickTaskGoalId(null)}
              onSubmit={(d) => {
                setModuleTasks((prev) => [
                  { ...d, id: `t${Date.now()}`, done: false, timeSpent: 0 },
                  ...prev,
                ]);
                setQuickTaskGoalId(null);
              }}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ---------------- Inline-форма «Добавить хотелку» ---------------- */

function InlineHotelkaForm({
  value,
  onChange,
  onSubmit,
  onCancel,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filled = value.trim().length > 0;

  return (
    <div className="bg-card rounded-xl px-3.5 py-3 shadow-card animate-fade-up mb-1"
         style={{ border: `1px solid ${filled ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (filled) onSubmit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        placeholder="Напиши своё желание..."
        className="w-full bg-transparent outline-none text-[14px] text-foreground placeholder:text-muted-foreground"
      />
      <div className="mt-3 flex gap-2">
        <button
          onClick={onCancel}
          className="tap flex-1 rounded-full px-3.5 py-1.5 text-[12px] font-medium bg-secondary text-muted-foreground hairline"
        >
          Отмена
        </button>
        <button
          onClick={onSubmit}
          disabled={!filled}
          className="tap btn-pill-orange btn-sm flex-1 disabled:opacity-40"
        >
          Добавить
        </button>
      </div>
    </div>
  );
}

/* ---------------- Хотелка с редактированием ---------------- */

function HotelkaItem({
  index,
  text,
  onSave,
  onDelete,
  isDone,
  onToggleDone,
  readOnly = false,
  proudCount = 0,
  onProud,
}: {
  index: number;
  text: string;
  onSave: (v: string) => void;
  onDelete: () => void;
  isDone: boolean;
  onToggleDone: () => void;
  readOnly?: boolean;
  proudCount?: number;
  onProud?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const filled = value.trim().length > 0;

  const submit = () => {
    if (!filled) return;
    onSave(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div
        className="bg-card rounded-xl px-3.5 py-3 shadow-card animate-fade-up"
        style={{ border: `1px solid ${filled ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
      >
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 shrink-0 rounded-full bg-secondary flex items-center justify-center text-[12px] font-medium text-muted-foreground">
            {index}
          </div>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              } else if (e.key === "Escape") {
                e.preventDefault();
                setValue(text);
                setEditing(false);
              }
            }}
            className="flex-1 bg-transparent outline-none text-[14px] text-foreground"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => {
              setValue(text);
              setEditing(false);
            }}
            className="tap flex-1 rounded-full px-3.5 py-1.5 text-[12px] font-medium bg-secondary text-muted-foreground hairline"
          >
            Отмена
          </button>
          <button
            onClick={submit}
            disabled={!filled}
            className="tap btn-pill-orange btn-sm flex-1 disabled:opacity-40"
          >
            Сохранить
          </button>
        </div>
      </div>
    );
  }

  if (readOnly) {
    return (
      <div className="bg-card hairline rounded-xl px-3.5 py-3 shadow-card animate-fade-up">
        <div className="flex items-center gap-3 min-h-[40px]">
          <div
            className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg,#FFB300,#FF6D00)" }}
            aria-hidden
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </div>
          <p className="text-[14px] leading-snug text-foreground/90 flex-1">
            {text}
          </p>
        </div>
        <div className="mt-2">
          <DesireCharge level={proudCount} onTap={() => onProud?.()} mode="proud" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card hairline rounded-xl px-3.5 py-3 shadow-card flex items-center gap-3 animate-fade-up min-h-[52px]">
      <div className="h-7 w-7 shrink-0 rounded-full bg-secondary flex items-center justify-center text-[12px] font-medium text-muted-foreground">
        {index}
      </div>
      <p className="text-[14px] leading-snug text-foreground/90 flex-1">
        {text}
      </p>
      <ActionsMenu
        onDone={onToggleDone}
        onEdit={() => {
          setValue(text);
          setEditing(true);
        }}
        onDelete={onDelete}
        doneConfirmText={`«${text}» будет перемещена в раздел «Воплощённые».`}
        deleteConfirmText={`«${text}» будет удалена навсегда. Это действие нельзя отменить.`}
      />
    </div>
  );
}

/* ---------------- Карточка желания ---------------- */

function WishCard({
  wish,
  priority,
  count,
  onInspire,
  onEdit,
  onMakeGoal,
  onDelete,
  isDone,
  onToggleDone,
  readOnly = false,
}: {
  wish: Wish;
  priority?: boolean;
  count: number;
  onInspire: () => void;
  onEdit: () => void;
  onMakeGoal: () => void;
  onDelete: () => void;
  isDone: boolean;
  onToggleDone: () => void;
  readOnly?: boolean;
}) {
  void isDone;
  return (
    <article className="bg-card hairline rounded-2xl overflow-hidden shadow-card animate-fade-up">
      <div className={`relative ${aspectClass(wish.aspect)} w-full overflow-hidden bg-muted`}>
        <img
          src={wish.image}
          alt={wish.title}
          width={768}
          height={1024}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <h3 className="text-[16px] font-semibold leading-tight text-foreground flex-1 min-w-0">
            {wish.title}
          </h3>
          {!readOnly && (
            <ActionsMenu
              onDone={onToggleDone}
              onEdit={onEdit}
              onDelete={onDelete}
              doneConfirmText={`«${wish.title}» будет перемещено в раздел «Воплощённые».`}
              deleteConfirmText={`«${wish.title}» будет удалено навсегда. Это действие нельзя отменить.`}
            />
          )}
        </div>

        {wish.vision && wish.vision.trim() && (
          <>
            <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Это уже произошло
            </p>
            <p className="mt-1.5 text-[13px] leading-snug text-foreground/85 italic whitespace-pre-line">
              {wish.vision}
            </p>
          </>
        )}

        <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Почему это важно
        </p>

        <ul className="mt-1.5 space-y-1.5">
          {wish.reasons.map((r, i) => (
            <li key={i} className="flex gap-2 text-[13px] leading-snug text-foreground/80">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
              <span>{r}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center justify-between gap-3">
          <DesireCharge level={count} onTap={onInspire} mode={readOnly ? "proud" : "inspire"} id={readOnly ? undefined : wish.id} />
          {!readOnly && (
            <button onClick={onMakeGoal} className="tap btn-pill-orange btn-sm shrink-0">
              Сделать целью →
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function EmptyTab({ tab }: { tab: string }) {
  return (
    <div className="px-4 pt-16 text-center">
      <div className="text-4xl mb-3">✨</div>
      <h3 className="text-[15px] font-semibold text-foreground">{tab}</h3>
      <p className="mt-1.5 text-[12px] text-muted-foreground max-w-[260px] mx-auto">
        Здесь скоро появится твой раздел «{tab}». Сейчас открыты «Желания».
      </p>
    </div>
  );
}

/* ---------------- Заряд желания ---------------- */

const CHARGE_COLORS = ["#9c8f7a", "#FFB300", "#FF9100", "#FF7A00", "#FF5722", "#E64A19"];
const DOT_FILLED_COLORS = ["#FFD180", "#FFB300", "#FF9100", "#FF6D00", "#E64A19"];
const DOT_EMPTY = "#e0d8cc";

function DesireCharge({ level, onTap, mode = "inspire", id }: { level: number; onTap: () => void; mode?: "inspire" | "proud"; id?: string }) {
  const total = Math.max(0, level);
  const inRound = total === 0 ? 0 : ((total - 1) % 5) + 1;
  // Бейдж = количество дней, в которые пользователь заряжал именно это желание/цель.
  // Появляется с первого тапа дня; в новый день обнуляется до первого тапа.
  const daysCount = useDaysCount(id ?? "__none__");
  const justHit100 = total > 0 && inRound === 5;
  // Бейдж появляется только когда заряд достигает 100% (5/5 в текущем круге).
  const badgeCount = id ? (justHit100 ? daysCount : 0) : (total === 0 ? 0 : Math.floor((total - 1) / 5) + 1);
  const label =
    mode === "proud"
      ? total === 0
        ? "Горжусь"
        : `Горжусь · ${total}`
      : total === 0
        ? "Заряжает"
        : `Зарядился на ${inRound * 20}%`;
  const color = CHARGE_COLORS[inRound];

  if (mode === "proud") {
    const liked = total > 0;
    return (
      <button
        onClick={onTap}
        aria-label="Горжусь"
        className="tap flex items-center gap-2 select-none -mx-1 px-1 py-1 rounded-lg"
      >
        <span
          key={`proud-${total}`}
          className={`inline-flex items-center justify-center transition-transform active:scale-90 text-[22px] leading-none ${liked ? "animate-pop" : ""}`}
          style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }}
        >
          {liked ? "❤️" : "🤍"}
        </span>
        <span
          className="text-[13px] font-medium leading-none inline-flex items-center gap-1.5"
          style={{ color: liked ? "#E53935" : "#9c8f7a" }}
        >
          <span>Горжусь</span>
          {total > 0 && (
            <span
              className="min-w-[22px] h-[18px] px-1.5 rounded-full text-[11px] font-bold text-white inline-flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,#FFB300,#FF6D00)",
                boxShadow: "0 2px 6px rgba(255,109,0,0.35)",
              }}
            >
              {total}
            </span>
          )}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onTap}
      aria-label="Заряд желания"
      className="tap flex items-center gap-2.5 min-w-0 select-none -mx-1 px-1 py-1 rounded-lg relative"
    >
      <span
        key={`heart-${total === 0 ? "empty" : justHit100 ? total : "idle"}`}
        className={`text-[22px] leading-none transition-transform active:scale-90 ${justHit100 ? "animate-celebrate" : ""}`}
        style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }}
      >
        {total === 0 ? "🤍" : "❤️"}
      </span>
      <span className="flex flex-col gap-0.5 min-w-0 text-left">
        <span className="flex items-end gap-1.5" style={{ height: 16 }}>
          {Array.from({ length: 5 }).map((_, i) => {
            const filled = i < inRound;
            return (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${justHit100 && filled ? "animate-celebrate-glow" : ""}`}
                style={{ backgroundColor: filled ? DOT_FILLED_COLORS[i] : DOT_EMPTY }}
              />
            );
          })}
          {/* Бейдж +N — фикс. ширина, чтобы лейбл не прыгал. Выровнен по низу кружочков */}
          <span className="ml-1 inline-flex items-end justify-start" style={{ width: 30, height: 16 }}>
            {badgeCount > 0 && (
              <span
                key={badgeCount}
                className="min-w-[18px] h-[14px] px-1 rounded-full text-[9px] font-bold text-white inline-flex items-center justify-center animate-pop"
                style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)", boxShadow: "0 2px 6px rgba(255,109,0,0.35)", transform: "translateY(2px)" }}
              >
                {badgeCount}
              </span>
            )}
          </span>
        </span>
        {/* Фиксированная высота строки лейбла */}
        <span className="block leading-none" style={{ minHeight: 12 }}>
          <span
            key={total}
            className={`text-[12px] font-medium leading-none inline-block ${justHit100 ? "animate-celebrate" : "animate-pop"}`}
            style={{ color }}
          >
            {label}
          </span>
        </span>
      </span>

      {/* Конфетти при 100% */}
      {justHit100 && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          {[
            { c: "#FF6D00", x: -22, y: -28 },
            { c: "#FFB300", x: 18,  y: -30 },
            { c: "#FF9100", x: -28, y: 6   },
            { c: "#E64A19", x: 24,  y: 10  },
            { c: "#FFD180", x: 0,   y: -34 },
            { c: "#FF6D00", x: -10, y: 22  },
            { c: "#FFB300", x: 14,  y: 24  },
          ].map((p, i) => (
            <span
              key={`${total}-${i}`}
              className="absolute h-1.5 w-1.5 rounded-full"
              style={{
                background: p.c,
                left: 0,
                top: 0,
                ["--cx" as never]: `${p.x}px`,
                ["--cy" as never]: `${p.y}px`,
                animation: "confetti-burst 800ms ease-out both",
              }}
            />
          ))}
        </span>
      )}
    </button>
  );
}

/* ============================================================
   ====================  МАСТЕР СОЗДАНИЯ  ===================== */

const STEP_LABELS = ["Название", "Причины", "Образ", "Картинка"] as const;

function StepIndicator({ step }: { step: 1 | 2 | 3 | 4 | 5 }) {
  const labels = STEP_LABELS;
  const n = labels.length;
  const progressPct = n > 1 ? Math.min(Math.max((step - 1) / (n - 1), 0), 1) * 100 : 0;
  return (
    <div className="px-4 pt-3 pb-4">
      <div className="relative max-w-[420px] mx-auto">
        <div
          className="absolute top-[14px] h-[2px] rounded"
          style={{
            left: `calc((100% / ${n}) / 2)`,
            right: `calc((100% / ${n}) / 2)`,
            background: "var(--secondary)",
          }}
        />
        <div
          className="absolute top-[14px] h-[2px] rounded transition-[width]"
          style={{
            left: `calc((100% / ${n}) / 2)`,
            width: `calc((100% - (100% / ${n})) * ${progressPct / 100})`,
            background: "#FF6D00",
          }}
        />
        <div className="relative flex items-start">
          {labels.map((label, i) => {
            const idx = i + 1;
            const done = step > idx;
            const active = step === idx;
            return (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5"
                style={{ width: `${100 / n}%` }}
              >
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center text-[12px] font-semibold transition-colors"
                  style={
                    done || active
                      ? { background: "linear-gradient(135deg, #FFB300, #FF6D00)", color: "#fff" }
                      : { background: "var(--secondary)", color: "var(--muted-foreground)" }
                  }
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : idx}
                </div>
                <span
                  className="text-[10px] font-medium whitespace-nowrap"
                  style={{ color: active || done ? "var(--foreground)" : "var(--muted-foreground)" }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WizardHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center px-4 py-3">
        <button onClick={onBack} className="tap inline-flex items-center gap-1 text-[13px] text-[#FF6D00]">
          <ArrowLeft className="h-4 w-4" /> Отмена
        </button>
        <h2 className="flex-1 text-center text-[15px] font-semibold pr-12">{title}</h2>
      </div>
    </div>
  );
}

function CreateWishWizard({
  onClose,
  onCreate,
  hotelki,
  onConsumeHotelka,
}: {
  onClose: () => void;
  onCreate: (wish: Omit<Wish, "id">) => void;
  hotelki: string[];
  onConsumeHotelka: (idx: number) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [title, setTitle] = useState("");
  const [vision, setVision] = useState("");
  const [reasons, setReasons] = useState<string[]>(["", "", ""]);
  const [image, setImage] = useState<string>("");
  const [fromHotelkaIdx, setFromHotelkaIdx] = useState<number | null>(null);

  const filledReasons = reasons.map((r) => r.trim()).filter(Boolean);

  const handleCreate = () => {
    if (fromHotelkaIdx !== null) {
      onConsumeHotelka(fromHotelkaIdx);
    }
    onCreate({
      title: title.trim(),
      vision: vision.trim(),
      reasons: filledReasons,
      image,
    });
  };

  const handlePickHotelka = (i: number, text: string) => {
    if (fromHotelkaIdx === i) {
      setFromHotelkaIdx(null);
      setTitle("");
    } else {
      setFromHotelkaIdx(i);
      setTitle(text.slice(0, 80));
    }
  };

  if (step === 5) {
    return (
      <div className="min-h-screen bg-background pb-8">
        <WizardHeader title="Готово" onBack={onClose} />
        <div className="px-4 pt-8 text-center animate-fade-up">
          <div className="text-6xl mb-3">🌟</div>
          <h2 className="text-[20px] font-bold">Желание создано!</h2>
          <p className="mt-1.5 text-[13px] text-[#FF6D00]">
            Твоё желание добавлено в ленту
          </p>

          <article className="mt-6 mx-auto max-w-sm bg-card hairline rounded-2xl overflow-hidden shadow-card text-left">
            {image && (
              <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
                <img src={image} alt={title} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="px-4 py-3.5">
              <h3 className="text-[16px] font-semibold">{title}</h3>
              {filledReasons.slice(0, 2).length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {filledReasons.slice(0, 2).map((r, i) => (
                    <li key={i} className="flex gap-2 text-[13px] leading-snug text-foreground/80">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>

          <button
            onClick={handleCreate}
            className="tap btn-pill-orange mt-6 inline-flex items-center justify-center gap-1.5 px-6"
          >
            Посмотреть в ленте
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <WizardHeader title="Новое желание" onBack={onClose} />
      <StepIndicator step={step} />

      {step === 1 && (
        <div className="px-4 animate-fade-up pb-24">
          <h2 className="text-[18px] font-bold leading-tight">Как называется твоё желание?</h2>
          <p className="mt-1.5 text-[14px] text-[#FF6D00]">
            Напиши своё желание или выбери одну из хотелок ниже, чтобы превратить её в желание.
          </p>

          <input
            autoFocus
            value={title}
            maxLength={80}
            onChange={(e) => {
              setTitle(e.target.value);
              if (fromHotelkaIdx !== null) setFromHotelkaIdx(null);
            }}
            placeholder="Например: Дом у океана"
            className="mt-5 w-full rounded-xl bg-card px-4 py-3.5 text-[18px] font-bold outline-none transition-colors"
            style={{ border: `1px solid ${title.trim() ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
          />
          <div className="mt-1.5 text-right text-[11px] text-muted-foreground">
            {title.length}/80
          </div>

          {hotelki.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="h-px flex-1 bg-border/60" />
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  или выбери из хотелок
                </span>
                <div className="h-px flex-1 bg-border/60" />
              </div>
              <div className="space-y-2 -mx-1 px-1 pb-1">
                {hotelki.map((h, i) => {
                  const active = fromHotelkaIdx === i;
                  return (
                    <React.Fragment key={i}>
                      <button
                        onClick={() => handlePickHotelka(i, h)}
                        className="tap w-full text-left bg-card rounded-xl px-3.5 py-3 shadow-card flex items-center gap-3 transition-colors"
                        style={{ border: `1px solid ${active ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
                      >
                        <div
                          className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[12px] font-medium transition-colors"
                          style={{
                            background: active ? "#FF6D00" : "var(--secondary)",
                            color: active ? "#fff" : "var(--muted-foreground)",
                          }}
                        >
                          {active ? <Check className="h-4 w-4" /> : i + 1}
                        </div>
                        <p className="text-[14px] leading-snug text-foreground/90 flex-1">{h}</p>
                      </button>
                     </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {step === 1 && (
        <div className="fixed bottom-[110px] left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4">
          <button
            disabled={title.trim().length < 2}
            onClick={() => setStep(2)}
            className="tap btn-pill-orange w-full shadow-lg shadow-orange-200/60 disabled:opacity-40"
          >
            Далее → Причины
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="px-4 animate-fade-up">
          <h2 className="text-[18px] font-bold leading-tight">Почему это важно?</h2>
          <p className="mt-1.5 text-[14px] text-[#FF6D00]">
            Запиши причины — они держат мотивацию когда становится трудно.
          </p>

          <div className="mt-5 space-y-2.5">
            {reasons.map((r, i) => {
              const filled = r.trim().length > 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center text-[13px] font-bold transition-colors"
                    style={
                      filled
                        ? { background: "linear-gradient(135deg, #FFB300, #FF6D00)", color: "#fff" }
                        : { background: "var(--secondary)", color: "var(--muted-foreground)" }
                    }
                  >
                    {i + 1}
                  </div>
                  <input
                    value={r}
                    onChange={(e) => {
                      const next = [...reasons];
                      next[i] = e.target.value;
                      setReasons(next);
                    }}
                    placeholder={i === 0 ? "Самая главная причина..." : `Причина ${i + 1}...`}
                    className="flex-1 rounded-xl bg-card px-3.5 py-2.5 text-[14px] outline-none transition-colors"
                    style={{ border: `1px solid ${filled ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
                  />
                  {reasons.length > 1 && (
                    <button
                      onClick={() => setReasons(reasons.filter((_, j) => j !== i))}
                      aria-label="Удалить причину"
                      className="tap h-8 w-8 shrink-0 rounded-full bg-secondary text-muted-foreground inline-flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}

            {reasons.length < 5 && (
              <button
                onClick={() => setReasons([...reasons, ""])}
                className="tap w-full rounded-xl py-2.5 text-[13px] font-medium text-muted-foreground"
                style={{ border: "1px dashed rgba(0,0,0,0.18)" }}
              >
                + Ещё причина
              </button>
            )}
          </div>

          <div
            className="mt-4 rounded-xl px-3.5 py-3 text-[12px] leading-snug text-foreground/80"
            style={{ background: "#fff8ee", border: "1px solid #ffe0a3" }}
          >
            💡 Чем конкретнее — тем сильнее. «Чтобы дети росли у моря» лучше, чем «хочу дом».
          </div>

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="tap flex-1 rounded-full px-3.5 py-2 text-[13px] font-medium bg-white text-[#FF6D00] border border-[#FF6D00]"
            >
              ← Назад
            </button>
            <button
              disabled={filledReasons.length === 0}
              onClick={() => setStep(3)}
              className="tap btn-pill-orange flex-1 disabled:opacity-40"
            >
              Далее → Образ
            </button>
          </div>
          <button
            onClick={() => setStep(3)}
            className="tap mt-3 w-full text-center text-[12px] text-muted-foreground underline-offset-2 hover:underline"
          >
            Пропустить
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="px-4 animate-fade-up">
          <h2 className="text-[18px] font-bold leading-tight">Опиши детальнее желание</h2>
          <p className="mt-1.5 text-[14px] text-[#FF6D00]">
            Представь, что оно уже произошло. Опиши так, как будто проживаешь это прямо сейчас — что ты видишь, слышишь, чувствуешь.
          </p>

          <textarea
            autoFocus
            value={vision}
            maxLength={800}
            onChange={(e) => setVision(e.target.value)}
            placeholder="Например: я просыпаюсь в своём доме у океана, слышу шум волн, выхожу на террасу с чашкой кофе..."
            rows={8}
            className="mt-5 w-full rounded-xl bg-card px-4 py-3.5 text-[14px] leading-relaxed outline-none transition-colors resize-none"
            style={{ border: `1px solid ${vision.trim() ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
          />
          <div className="mt-1.5 text-right text-[11px] text-muted-foreground">
            {vision.length}/800
          </div>

          <div
            className="mt-2 rounded-xl px-3.5 py-3 text-[12px] leading-snug text-foreground/80"
            style={{ background: "#fff8ee", border: "1px solid #ffe0a3" }}
          >
            ✨ Пиши в настоящем времени, от первого лица. Чем ярче картинка — тем сильнее желание тянет тебя к себе.
          </div>

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setStep(2)}
              className="tap flex-1 rounded-full px-3.5 py-2 text-[13px] font-medium bg-white text-[#FF6D00] border border-[#FF6D00]"
            >
              ← Назад
            </button>
            <button
              disabled={vision.trim().length < 10}
              onClick={() => setStep(4)}
              className="tap btn-pill-orange flex-1 disabled:opacity-40"
            >
              Далее → Картинка
            </button>
          </div>
          <button
            onClick={() => setStep(4)}
            className="tap mt-3 w-full text-center text-[12px] text-muted-foreground underline-offset-2 hover:underline"
          >
            Пропустить
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="px-4 animate-fade-up">
          <h2 className="text-[18px] font-bold leading-tight">Добавь картинку</h2>
          <p className="mt-1.5 text-[14px] text-[#FF6D00]">
            Визуальный образ усиливает желание. Загрузи фото с телефона или компьютера.
          </p>

          {!image ? (
            <label
              className="tap mt-5 block cursor-pointer rounded-[18px] bg-card px-4 py-8 text-center"
              style={{ border: "1.5px dashed #ede8df" }}
            >
              <div
                className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: "linear-gradient(135deg, #FFE0B2, #FFB300)" }}
              >
                🖼️
              </div>
              <h3 className="mt-3 text-[15px] font-semibold">Выбрать фото</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Нажми чтобы выбрать фото с телефона или компьютера
              </p>
              <span className="tap btn-pill-orange mt-4 inline-flex items-center gap-1.5">
                <FolderOpen className="h-4 w-4" /> Открыть галерею
              </span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setImage(URL.createObjectURL(f));
                }}
              />
            </label>
          ) : (
            <div className="mt-5">
              <div className="relative rounded-[18px] overflow-hidden" style={{ height: 200 }}>
                <img src={image} alt="Превью" className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                  <div className="text-white text-[14px] font-semibold drop-shadow">{title}</div>
                </div>
                <button
                  onClick={() => setImage("")}
                  className="tap absolute top-2 right-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] text-white"
                  style={{ background: "rgba(0,0,0,0.55)" }}
                >
                  <X className="h-3 w-3" /> Убрать
                </button>
              </div>
              <label className="tap mt-2 block text-center text-[12px] text-muted-foreground underline-offset-2 hover:underline cursor-pointer">
                <RotateCw className="inline h-3 w-3 mr-1" /> Выбрать другое фото
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setImage(URL.createObjectURL(f));
                  }}
                />
              </label>
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setStep(3)}
              className="tap flex-1 rounded-full px-3.5 py-2 text-[13px] font-medium bg-white text-[#FF6D00] border border-[#FF6D00]"
            >
              ← Назад
            </button>
            <button
              disabled={!image}
              onClick={() => setStep(5)}
              className="tap btn-pill-orange flex-1 inline-flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" /> Создать желание
            </button>
          </div>
          {!image && (
            <p className="mt-2 text-center text-[12px] text-muted-foreground">
              Загрузи картинку чтобы создать желание
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ===================  ЭКРАН РЕДАКТИРОВАНИЯ  ================= */

type EditTab = "title" | "reasons" | "vision" | "image";

function EditWishScreen({
  wish,
  onClose,
  onSave,
  onDelete,
}: {
  wish: Wish;
  onClose: () => void;
  onSave: (w: Wish) => void;
  onDelete: () => void;
}) {
  void onDelete;
  const [tab, setTab] = useState<EditTab>("title");
  const [title, setTitle] = useState(wish.title);
  const [reasons, setReasons] = useState<string[]>(wish.reasons.length ? wish.reasons : [""]);
  const [vision, setVision] = useState<string>(wish.vision ?? "");
  const [image, setImage] = useState<string>(wish.image);

  const handleSave = () => {
    onSave({
      ...wish,
      title: title.trim() || wish.title,
      reasons: reasons.map((r) => r.trim()).filter(Boolean),
      vision: vision.trim(),
      image,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            onClick={onClose}
            className="tap inline-flex items-center gap-1 text-[13px] text-[#FF6D00]"
          >
            <ArrowLeft className="h-4 w-4" /> К желанию
          </button>
          <h2 className="flex-1 text-center text-[15px] font-semibold">Изменить</h2>
          
          <button onClick={handleSave} className="tap btn-pill-orange btn-sm">Сохранить</button>
        </div>
      </div>

      {/* Live превью */}
      <div className="px-4 pt-3">
        <div className="relative rounded-2xl overflow-hidden" style={{ height: 130 }}>
          <img src={image} alt={title} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
            <div className="text-white text-[15px] font-semibold drop-shadow">{title}</div>
          </div>
        </div>
      </div>

      {/* Табы */}
      <div className="px-4 mt-3 flex gap-1.5 flex-wrap">
        {([
          { id: "title",   label: "✏️ Название" },
          { id: "reasons", label: "💡 Причины"  },
          { id: "vision",  label: "✨ Образ"    },
          { id: "image",   label: "🖼 Картинка"  },
        ] as { id: EditTab; label: string }[]).map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                active
                  ? "tap btn-pill-orange btn-sm"
                  : "tap rounded-full px-3 py-1.5 text-[12px] font-medium bg-card text-muted-foreground hairline"
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="px-4 mt-4">
        {tab === "title" && (
          <div className="animate-fade-up">
            <input
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-card px-4 py-3 text-[16px] font-semibold outline-none transition-colors"
              style={{ border: `1px solid ${title.trim() ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
            />
            <div className="mt-1.5 text-right text-[11px] text-muted-foreground">
              {title.length}/80
            </div>
            <div
              className="mt-4 rounded-xl px-3.5 py-3 text-[12px] leading-snug text-foreground/80"
              style={{ background: "#fff8ee", border: "1px solid #ffe0a3" }}
            >
              💡 «Дом у океана» лучше чем «Купить недвижимость на побережье».
            </div>
          </div>
        )}

        {tab === "reasons" && (
          <div className="animate-fade-up space-y-2.5">
            {reasons.map((r, i) => {
              const filled = r.trim().length > 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center text-[13px] font-bold"
                    style={
                      filled
                        ? { background: "linear-gradient(135deg, #FFB300, #FF6D00)", color: "#fff" }
                        : { background: "var(--secondary)", color: "var(--muted-foreground)" }
                    }
                  >
                    {i + 1}
                  </div>
                  <input
                    value={r}
                    onChange={(e) => {
                      const next = [...reasons];
                      next[i] = e.target.value;
                      setReasons(next);
                    }}
                    placeholder={`Причина ${i + 1}...`}
                    className="flex-1 rounded-xl bg-card px-3.5 py-2.5 text-[14px] outline-none transition-colors"
                    style={{ border: `1px solid ${filled ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
                  />
                  {reasons.length > 1 && (
                    <button
                      onClick={() => setReasons(reasons.filter((_, j) => j !== i))}
                      aria-label="Удалить причину"
                      className="tap h-8 w-8 shrink-0 rounded-full bg-secondary text-muted-foreground inline-flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}

            {reasons.length < 5 && (
              <button
                onClick={() => setReasons([...reasons, ""])}
                className="tap w-full rounded-xl py-2.5 text-[13px] font-medium text-muted-foreground"
                style={{ border: "1px dashed rgba(0,0,0,0.18)" }}
              >
                + Добавить причину
              </button>
            )}
          </div>
        )}

        {tab === "vision" && (
          <div className="animate-fade-up">
            <p className="text-[13px] text-[#FF6D00] mb-2">
              Представь, что оно уже произошло. Опиши так, как будто проживаешь это прямо сейчас — что ты видишь, слышишь, чувствуешь.
            </p>
            <textarea
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              maxLength={800}
              rows={8}
              placeholder="Я вижу, как..."
              className="w-full rounded-xl bg-card px-3.5 py-3 text-[14px] outline-none transition-colors resize-none"
              style={{ border: `1px solid ${vision.trim() ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
            />
            <div className="mt-1.5 text-right text-[11px] text-muted-foreground">{vision.length}/800</div>
          </div>
        )}

        {tab === "image" && (
          <div className="animate-fade-up">
            <label
              className="tap block cursor-pointer rounded-[18px] bg-card px-4 py-8 text-center"
              style={{ border: "1.5px dashed #ede8df" }}
            >
              <div
                className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "linear-gradient(135deg, #FFE0B2, #FFB300)" }}
              >
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-3 text-[14px] font-semibold">Загрузить новое фото</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">
                С телефона или компьютера
              </p>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setImage(URL.createObjectURL(f));
                }}
              />
            </label>
          </div>
        )}
      </div>

      {/* Bottom save */}
      <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-border/50 px-4 py-3 safe-bottom">
        <button onClick={handleSave} className="tap btn-pill-orange w-full">
          Сохранить изменения
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   ========================  ЦЕЛИ  ============================ */

function GoalCard({
  goal,
  count,
  onInspire,
  onEdit,
  onDelete,
  isDone,
  onToggleDone,
  onOpenTasks,
  onBrainstorm,
  tasksAll = [],
  tasksDoneCount = 0,
  onAddTask,
  readOnly = false,
  onProgressChange,
}: {
  goal: Goal;
  count: number;
  onInspire: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDone: boolean;
  onToggleDone: () => void;
  onOpenTasks?: () => void;
  onBrainstorm?: () => void;
  tasksAll?: ModuleTask[];
  tasksDoneCount?: number;
  onAddTask?: () => void;
  readOnly?: boolean;
  onProgressChange?: (value: number) => void;
}) {
  void isDone;
  const openTasks = tasksAll.filter((t) => !t.done);
  const totalTasks = tasksAll.length;

  return (
    <article className="bg-card hairline rounded-[20px] overflow-hidden shadow-card animate-fade-up">
      <div className={`relative w-full ${aspectClass(goal.aspect)}`}>
        <img src={goal.image} alt={goal.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      </div>

      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <h3 className="text-[20px] font-bold leading-tight text-foreground flex-1 min-w-0">
            {goal.title}
          </h3>
          {!readOnly && (
            <ActionsMenu
              onDone={onToggleDone}
              onEdit={onEdit}
              onDelete={onDelete}
              onBrainstorm={onBrainstorm}
              doneConfirmText={`«${goal.title}» будет перемещена в раздел «Воплощённые». Это действие можно отменить.`}
              deleteConfirmText={`«${goal.title}» будет удалена навсегда. Это действие нельзя отменить.`}
            />
          )}
        </div>
        <p className="mt-1 text-[12px] text-muted-foreground">📅 до {goal.deadline}</p>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-muted-foreground">Прогресс</span>
            <span className="font-semibold" style={{ color: "#FF6D00" }}>{goal.progress}%</span>
          </div>
          {!readOnly && onProgressChange ? (
            <div className="relative h-5 flex items-center">
              <div
                className="absolute inset-x-0 h-1.5 rounded-full overflow-hidden"
                style={{ background: "#ede8df" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${goal.progress}%`,
                    background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                  }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={goal.progress}
                onChange={(e) => onProgressChange(Number(e.target.value))}
                aria-label="Прогресс цели"
                className="relative w-full h-5 bg-transparent appearance-none cursor-pointer goal-progress-range"
                style={{ accentColor: "#FF6D00" }}
              />
            </div>
          ) : (
            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "#ede8df" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${goal.progress}%`,
                  background: "linear-gradient(135deg, #FFB300, #FF6D00)",
                }}
              />
            </div>
          )}
        </div>

        {goal.vision && goal.vision.trim() && (
          <>
            <div className="my-3 h-px bg-border/60" />
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Это уже произошло
            </p>
            <p className="mt-1.5 text-[13px] leading-snug text-foreground/85 italic whitespace-pre-line">
              {goal.vision}
            </p>
          </>
        )}

        <div className="my-3 h-px bg-border/60" />

        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Почему это важно
        </p>
        <ul className="mt-1.5 space-y-1.5">
          {goal.reasons.map((r, i) => (
            <li key={i} className="flex gap-2 text-[13px] leading-snug text-foreground/80">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: "#FF6D00" }} />
              <span>{r}</span>
            </li>
          ))}
        </ul>

        <div className="my-3 h-px bg-border/60" />

        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Критерий готовности
        </p>
        <div
          className="mt-1.5 rounded-xl px-3 py-2.5 text-[13px] leading-snug text-foreground/85"
          style={{ background: "#FAF6EF" }}
        >
          {goal.criteria}
        </div>

        <div className="my-3 h-px bg-border/60" />

        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          План реализации
        </p>
        <p className="mt-1.5 text-[13px] leading-snug text-foreground/85 whitespace-pre-line">
          {goal.plan}
        </p>

        <div className="my-3 h-px bg-border/60" />

        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Задачи
          </p>
        </div>
        {totalTasks === 0 ? (
          <p className="mt-1.5 text-[12.5px] text-muted-foreground">Задач пока нет</p>
        ) : openTasks.length === 0 ? (
          <p className="mt-1.5 text-[13px] text-foreground/85">✅ Все задачи выполнены!</p>
        ) : (
          <ul className="mt-1.5 space-y-1.5">
            {openTasks.map((t) => (
              <li key={t.id} className="flex items-start gap-2 text-[13px] leading-snug text-foreground/85">
                <span
                  className="mt-[7px] inline-block h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: "#c8c0b0" }}
                  aria-hidden
                />
                <span className="flex-1">{t.title}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
          <span>Сделано задач:</span>
          <span className="font-semibold tabular-nums" style={{ color: "#16a34a" }}>{tasksDoneCount}</span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <DesireCharge level={count} onTap={onInspire} mode={readOnly ? "proud" : "inspire"} id={readOnly ? undefined : goal.id} />
          {!readOnly && (
            <button
              onClick={onOpenTasks}
              className="tap btn-pill-orange btn-sm shrink-0"
              style={{ borderRadius: 12 }}
            >
              К задачам →
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   =================  МАСТЕР СОЗДАНИЯ ЦЕЛИ  =================== */

function GoalStepIndicator({
  step,
  labels,
}: {
  step: number;
  labels: string[];
}) {
  const n = labels.length;
  // Прогресс линии: от центра 1-го кружка до центра последнего
  const progressPct = n > 1 ? Math.min(Math.max((step - 1) / (n - 1), 0), 1) * 100 : 0;
  return (
    <div className="px-4 pt-3 pb-4">
      <div className="relative">
        {/* Линия-фон (между центрами первого и последнего кружка) */}
        <div
          className="absolute top-[14px] h-[2px] rounded"
          style={{
            left: `calc((100% / ${n}) / 2)`,
            right: `calc((100% / ${n}) / 2)`,
            background: "var(--secondary)",
          }}
        />
        {/* Линия-прогресс */}
        <div
          className="absolute top-[14px] h-[2px] rounded transition-[width]"
          style={{
            left: `calc((100% / ${n}) / 2)`,
            width: `calc((100% - (100% / ${n})) * ${progressPct / 100})`,
            background: "#FF6D00",
          }}
        />
        <div className="relative flex items-start">
          {labels.map((label, i) => {
            const idx = i + 1;
            const done = step > idx;
            const active = step === idx;
            return (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5"
                style={{ width: `${100 / n}%` }}
              >
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center text-[12px] font-semibold transition-colors"
                  style={
                    done || active
                      ? { background: "linear-gradient(135deg, #FFB300, #FF6D00)", color: "#fff" }
                      : { background: "var(--secondary)", color: "var(--muted-foreground)" }
                  }
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : idx}
                </div>
                <span
                  className="text-[10px] font-medium whitespace-nowrap"
                  style={{ color: active || done ? "var(--foreground)" : "var(--muted-foreground)" }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WheelColumn({
  values,
  index,
  onChange,
  width,
}: {
  values: (string | number)[];
  index: number;
  onChange: (i: number) => void;
  width: number;
}) {
  const ITEM_H = 40;
  const ref = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external index → scroll position
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = index * ITEM_H;
    if (Math.abs(el.scrollTop - target) > 1) {
      el.scrollTo({ top: target, behavior: "smooth" });
    }
  }, [index]);

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const i = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(values.length - 1, i));
      const snap = clamped * ITEM_H;
      if (Math.abs(el.scrollTop - snap) > 1) {
        el.scrollTo({ top: snap, behavior: "smooth" });
      }
      if (clamped !== index) onChange(clamped);
    }, 90);
  };

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="relative overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      style={{
        height: ITEM_H * 5,
        width,
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div style={{ height: ITEM_H * 2 }} />
      {values.map((v, i) => (
        <div
          key={i}
          className="snap-center flex items-center justify-center text-[16px] transition-all"
          style={{
            height: ITEM_H,
            color: i === index ? "#1a1a1a" : "rgba(0,0,0,0.35)",
            fontWeight: i === index ? 600 : 400,
            transform: i === index ? "scale(1.05)" : "scale(1)",
          }}
        >
          {v}
        </div>
      ))}
      <div style={{ height: ITEM_H * 2 }} />
    </div>
  );
}

function DateWheelPicker({
  day,
  month,
  year,
  onChange,
}: {
  day: number;
  month: number;
  year: number;
  onChange: (d: number, m: number, y: number) => void;
}) {
  const ITEM_H = 40;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);
  const maxDay = daysInMonth(month, year);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  return (
    <div className="relative mt-5 rounded-2xl bg-card hairline overflow-hidden">
      {/* Selection highlight */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-xl"
        style={{
          height: ITEM_H,
          background: "rgba(255,109,0,0.08)",
          border: "1px solid rgba(255,109,0,0.25)",
          margin: "0 8px",
        }}
      />
      {/* Top + bottom fade */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0"
        style={{ height: ITEM_H * 2, background: "linear-gradient(180deg, #fff, rgba(255,255,255,0))" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0"
        style={{ height: ITEM_H * 2, background: "linear-gradient(0deg, #fff, rgba(255,255,255,0))" }}
      />
      <div className="flex items-center justify-center gap-2 px-3">
        <WheelColumn
          values={days}
          index={Math.min(day - 1, days.length - 1)}
          onChange={(i) => onChange(i + 1, month, year)}
          width={64}
        />
        <WheelColumn
          values={MONTHS_RU}
          index={month}
          onChange={(i) => {
            const newMax = daysInMonth(i, year);
            onChange(Math.min(day, newMax), i, year);
          }}
          width={130}
        />
        <WheelColumn
          values={years}
          index={Math.max(0, years.indexOf(year))}
          onChange={(i) => {
            const y = years[i];
            const newMax = daysInMonth(month, y);
            onChange(Math.min(day, newMax), month, y);
          }}
          width={80}
        />
      </div>
    </div>
  );
}

function CreateGoalWizard({
  wishes,
  fromWish,
  onClose,
  onCreate,
}: {
  wishes: Wish[];
  fromWish?: Wish;
  onClose: () => void;
  onCreate: (g: Omit<Goal, "id">, openInGoals: boolean, sourceWishId?: string) => void;
}) {
  const startFromWish = !!fromWish;
  // Шаги:
  // Если из желания — 1: Срок, 2: Критерий, 3: План
  // Если с нуля — 1: Желание, 2: Срок, 3: Критерий, 4: План
  const labels = startFromWish
    ? ["Срок", "Критерий", "План"]
    : ["Желание", "Срок", "Критерий", "План"];
  const [step, setStep] = useState<number>(1);
  const [selectedWish, setSelectedWish] = useState<Wish | null>(fromWish ?? null);

  // Дедлайн по умолчанию: 31 декабря текущего года
  const today = new Date();
  const [dlDay, setDlDay] = useState<number>(31);
  const [dlMonth, setDlMonth] = useState<number>(11); // декабрь
  const [dlYear, setDlYear] = useState<number>(today.getFullYear());

  const [criteria, setCriteria] = useState("");
  const [plan, setPlan] = useState("");
  const [done, setDone] = useState(false);

  const finalize = () => {
    if (!selectedWish) return;
    onCreate(
      {
        title: selectedWish.title,
        image: selectedWish.image,
        deadline: formatDeadline(dlDay, dlMonth, dlYear),
        progress: 0,
        reasons: selectedWish.reasons,
        vision: selectedWish.vision,
        criteria: criteria.trim(),
        plan: plan.trim(),
        tasks: [],
      },
      true,
      startFromWish ? selectedWish.id : undefined,
    );
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background pb-8">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center px-4 py-3">
            <h2 className="flex-1 text-center text-[15px] font-semibold">Готово</h2>
          </div>
        </div>
        <div className="px-4 pt-8 text-center animate-fade-up">
          <div className="text-6xl mb-3">🎯</div>
          <h2 className="text-[20px] font-bold">Цель создана!</h2>
          <p className="mt-1.5 text-[13px] text-[#FF6D00]">
            Твоя цель добавлена в ленту целей
          </p>

          {selectedWish && (
            <article className="mt-6 mx-auto max-w-sm bg-card hairline rounded-[20px] overflow-hidden shadow-card text-left">
              <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
                <img src={selectedWish.image} alt={selectedWish.title} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute left-3 bottom-2 text-white text-[15px] font-semibold drop-shadow">
                  {selectedWish.title}
                </div>
              </div>
              <div className="px-4 py-3.5">
                <div className="h-1.5 w-full rounded-full" style={{ background: "#ede8df" }} />
                <p className="mt-1 text-right text-[11px] text-muted-foreground">0%</p>
              </div>
            </article>
          )}

          <button
            onClick={finalize}
            className="tap btn-pill-orange mt-6 inline-flex items-center justify-center gap-1.5 px-6"
          >
            Посмотреть в ленте целей
          </button>
        </div>
      </div>
    );
  }

  // Хедер
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onClose();
  };

  // Какой логический шаг сейчас
  const isPickWish = !startFromWish && step === 1;
  const isDeadline = startFromWish ? step === 1 : step === 2;
  const isCriteria = startFromWish ? step === 2 : step === 3;
  const isPlan = startFromWish ? step === 3 : step === 4;

  // Превью карточки (название + картинка) — показываем на всех шагах после выбора желания
  const showPreview = !!selectedWish && !isPickWish;

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center px-4 py-3">
          <button onClick={onClose} className="tap inline-flex items-center gap-1 text-[13px] text-[#FF6D00]">
            <ArrowLeft className="h-4 w-4" /> Отмена
          </button>
          <h2 className="flex-1 text-center text-[15px] font-semibold pr-12">Новая цель</h2>
        </div>
      </div>

      <GoalStepIndicator step={step} labels={labels} />

      {showPreview && selectedWish && (
        <div className="px-4 pt-1 pb-1">
          <div className="relative rounded-2xl overflow-hidden" style={{ height: 110 }}>
            <img src={selectedWish.image} alt={selectedWish.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute left-3 bottom-2 right-3 text-white text-[16px] font-semibold drop-shadow leading-tight">
              {selectedWish.title}
            </div>
          </div>
        </div>
      )}

      {isPickWish && (
        <div className="px-4 animate-fade-up">
          <h2 className="text-[18px] font-bold leading-tight">Выбери желание</h2>
          <p className="mt-1.5 text-[14px] text-[#FF6D00]">
            Цель вырастает из желания — выбери то, которое хочешь воплотить
          </p>

          <div className="mt-5 space-y-2">
            {wishes.length === 0 && (
              <p className="text-[13px] text-[#FF6D00] text-center py-6">
                Сначала создай желание во вкладке «Желания»
              </p>
            )}
            {wishes.map((w) => {
              const active = selectedWish?.id === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWish(w)}
                  className="tap w-full text-left bg-card rounded-xl px-3 py-3 shadow-card flex items-center gap-3 transition-colors"
                  style={{ border: `1.5px solid ${active ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
                >
                  <img
                    src={w.image}
                    alt={w.title}
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                  />
                  <p className="flex-1 text-[14px] font-medium text-foreground/90">{w.title}</p>
                  {active && (
                    <div
                      className="h-6 w-6 shrink-0 rounded-full inline-flex items-center justify-center text-white"
                      style={{ background: "#FF6D00" }}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            disabled={!selectedWish}
            onClick={() => setStep(2)}
            className="tap btn-pill-orange w-full mt-6 disabled:opacity-40"
          >
            Далее → Срок цели
          </button>
        </div>
      )}

      {isDeadline && (
        <div className="px-4 animate-fade-up">
          <h2 className="text-[18px] font-bold leading-tight">До какого числа хочешь достичь цели?</h2>
          <p className="mt-1.5 text-[14px] text-[#FF6D00]">
            Выбери дату — конкретный срок помогает двигаться.
          </p>

          <DateWheelPicker
            day={dlDay}
            month={dlMonth}
            year={dlYear}
            onChange={(d, m, y) => {
              setDlDay(d);
              setDlMonth(m);
              setDlYear(y);
            }}
          />

          <p className="mt-3 text-center text-[13px] text-foreground/70">
            📅 до <span className="font-semibold text-foreground">{formatDeadline(dlDay, dlMonth, dlYear)}</span>
          </p>

          <div className="mt-6 flex gap-2">
            <button
              onClick={handleBack}
              className="tap flex-1 rounded-full px-3.5 py-2 text-[13px] font-medium bg-white text-[#FF6D00] border border-[#FF6D00]"
            >
              ← Назад
            </button>
            <button
              onClick={() => setStep(step + 1)}
              className="tap btn-pill-orange flex-1"
            >
              Далее → Критерий
            </button>
          </div>
        </div>
      )}

      {isCriteria && (
        <div className="px-4 animate-fade-up">
          <h2 className="text-[18px] font-bold leading-tight">Напиши критерий готовности</h2>
          <p className="mt-1.5 text-[14px] text-[#FF6D00]">
            Одно предложение — конкретный факт, по которому ты поймёшь что цель достигнута. Не «хочу похудеть», а «вес 74 кг на весах утром».
          </p>

          <div
            className="mt-4 rounded-xl px-3.5 py-3 text-[12.5px] leading-snug text-foreground/80"
            style={{ background: "#fff8ee", border: "1px solid #ffe0a3" }}
          >
            <div className="font-semibold mb-1.5">Примеры:</div>
            <ul className="space-y-1">
              <li>• «Написана и опубликована первая глава книги.»</li>
              <li>• «Куплены билеты на Бали и забронировано жильё на 2 месяца.»</li>
              <li>• «Открыт расчётный счёт ИП и получен первый оплаченный заказ.»</li>
            </ul>
          </div>

          <textarea
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            placeholder="Напиши критерий готовности"
            rows={4}
            className="mt-4 w-full rounded-xl bg-card px-3.5 py-3 text-[14px] outline-none transition-colors resize-none"
            style={{ border: `1px solid ${criteria.trim().length > 5 ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
          />

          <div className="mt-6 flex gap-2">
            <button
              onClick={handleBack}
              className="tap flex-1 rounded-full px-3.5 py-2 text-[13px] font-medium bg-white text-[#FF6D00] border border-[#FF6D00]"
            >
              ← Назад
            </button>
            <button
              disabled={criteria.trim().length <= 5}
              onClick={() => setStep(step + 1)}
              className="tap btn-pill-orange flex-1 disabled:opacity-40"
            >
              Далее → План
            </button>
          </div>
        </div>
      )}

      {isPlan && (
        <div className="px-4 animate-fade-up">
          <h2 className="text-[18px] font-bold leading-tight">Напиши план реализации</h2>
          <p className="mt-1.5 text-[14px] text-[#FF6D00]">
            Опиши шаги — как и в каком порядке ты будешь двигаться к цели.
          </p>

          <div
            className="mt-4 rounded-xl px-3.5 py-3 text-[12.5px] leading-snug text-foreground/80"
            style={{ background: "#fff8ee", border: "1px solid #ffe0a3" }}
          >
            <div className="font-semibold mb-1.5">Примеры:</div>
            <ul className="space-y-1">
              <li>• «Накопить деньги → купить билеты → найти жильё → оформить страховку.»</li>
              <li>• «3 тренировки в неделю + убрать сахар. Взвешиваться раз в 2 недели.»</li>
            </ul>
          </div>

          <textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder="Опиши порядок действий..."
            rows={5}
            className="mt-4 w-full rounded-xl bg-card px-3.5 py-3 text-[14px] outline-none transition-colors resize-none"
            style={{ border: `1px solid ${plan.trim().length > 5 ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
          />

          <div className="mt-6 flex gap-2">
            <button
              onClick={handleBack}
              className="tap flex-1 rounded-full px-3.5 py-2 text-[13px] font-medium bg-white text-[#FF6D00] border border-[#FF6D00]"
            >
              ← Назад
            </button>
            <button
              disabled={plan.trim().length <= 5}
              onClick={() => setDone(true)}
              className="tap btn-pill-orange flex-1 inline-flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              🎯 Создать цель
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   =================  РЕДАКТИРОВАНИЕ ЦЕЛИ  ==================== */

type GoalEditTab = "title" | "deadline" | "reasons" | "vision" | "image" | "criteria" | "plan";

function parseDeadline(s: string): { d: number; m: number; y: number } {
  // Ожидаем формат "31 декабря 2026"
  const parts = s.trim().split(/\s+/);
  const today = new Date();
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = MONTHS_RU.indexOf(parts[1].toLowerCase());
    const y = parseInt(parts[2], 10);
    if (!isNaN(d) && m >= 0 && !isNaN(y)) return { d, m, y };
  }
  return { d: 31, m: 11, y: today.getFullYear() };
}

function EditGoalScreen({
  goal,
  onClose,
  onSave,
  onDelete,
}: {
  goal: Goal;
  onClose: () => void;
  onSave: (g: Goal) => void;
  onDelete: () => void;
}) {
  void onDelete;
  const [tab, setTab] = useState<GoalEditTab>("title");
  const [title, setTitle] = useState(goal.title);
  const [reasons, setReasons] = useState<string[]>(goal.reasons.length ? goal.reasons : [""]);
  const [criteria, setCriteria] = useState(goal.criteria);
  const [plan, setPlan] = useState(goal.plan);
  const [vision, setVision] = useState(goal.vision ?? "");
  const [image, setImage] = useState(goal.image);

  const initDl = parseDeadline(goal.deadline);
  const [dlDay, setDlDay] = useState<number>(initDl.d);
  const [dlMonth, setDlMonth] = useState<number>(initDl.m);
  const [dlYear, setDlYear] = useState<number>(initDl.y);

  const handleSave = () => {
    onSave({
      ...goal,
      title: title.trim() || goal.title,
      deadline: formatDeadline(dlDay, dlMonth, dlYear),
      reasons: reasons.map((r) => r.trim()).filter(Boolean),
      criteria: criteria.trim() || goal.criteria,
      plan: plan.trim() || goal.plan,
      vision: vision.trim(),
      image,
    });
  };

  // Порядок: Название → Причины → Образ → Картинка → Срок → Критерий → План
  const tabs: { id: GoalEditTab; label: string }[] = [
    { id: "title",    label: "✏️ Название"  },
    { id: "reasons",  label: "💡 Причины"  },
    { id: "vision",   label: "✨ Образ"    },
    { id: "image",    label: "🖼 Картинка"  },
    { id: "deadline", label: "📅 Срок"      },
    { id: "criteria", label: "✅ Критерий" },
    { id: "plan",     label: "🗺 План"      },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            onClick={onClose}
            className="tap inline-flex items-center gap-1 text-[13px] text-[#FF6D00]"
          >
            <ArrowLeft className="h-4 w-4" /> К цели
          </button>
          <h2 className="flex-1 text-center text-[15px] font-semibold">Изменить</h2>
          
          <button onClick={handleSave} className="tap btn-pill-orange btn-sm">Сохранить</button>
        </div>
      </div>

      {/* Live превью */}
      <div className="px-4 pt-3">
        <div className="relative rounded-2xl overflow-hidden" style={{ height: 110 }}>
          <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-3 py-2">
            <div className="text-white text-[15px] font-semibold drop-shadow">{title}</div>
          </div>
        </div>
      </div>

      {/* Табы — две строки */}
      <div className="px-4 mt-3 flex gap-1.5 flex-wrap">
        {tabs.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                active
                  ? "tap btn-pill-orange btn-sm"
                  : "tap rounded-full px-3 py-1.5 text-[12px] font-medium bg-card text-muted-foreground hairline"
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="px-4 mt-4">
        {tab === "title" && (
          <div className="animate-fade-up">
            <input
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-card px-4 py-3 text-[16px] font-semibold outline-none transition-colors"
              style={{ border: `1px solid ${title.trim() ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
            />
            <div className="mt-1.5 text-right text-[11px] text-muted-foreground">{title.length}/80</div>
          </div>
        )}

        {tab === "deadline" && (
          <div className="animate-fade-up">
            <p className="text-[13px] text-[#FF6D00]">
              До какого числа нужно достичь цели
            </p>
            <DateWheelPicker
              day={dlDay}
              month={dlMonth}
              year={dlYear}
              onChange={(d, m, y) => {
                setDlDay(d);
                setDlMonth(m);
                setDlYear(y);
              }}
            />
            <p className="mt-3 text-center text-[13px] text-foreground/70">
              📅 до <span className="font-semibold text-foreground">{formatDeadline(dlDay, dlMonth, dlYear)}</span>
            </p>
          </div>
        )}

        {tab === "reasons" && (
          <div className="animate-fade-up space-y-2.5">
            {reasons.map((r, i) => {
              const filled = r.trim().length > 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center text-[13px] font-bold"
                    style={
                      filled
                        ? { background: "linear-gradient(135deg, #FFB300, #FF6D00)", color: "#fff" }
                        : { background: "var(--secondary)", color: "var(--muted-foreground)" }
                    }
                  >
                    {i + 1}
                  </div>
                  <input
                    value={r}
                    onChange={(e) => {
                      const next = [...reasons];
                      next[i] = e.target.value;
                      setReasons(next);
                    }}
                    placeholder={`Причина ${i + 1}...`}
                    className="flex-1 rounded-xl bg-card px-3.5 py-2.5 text-[14px] outline-none transition-colors"
                    style={{ border: `1px solid ${filled ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
                  />
                  {reasons.length > 1 && (
                    <button
                      onClick={() => setReasons(reasons.filter((_, j) => j !== i))}
                      aria-label="Удалить причину"
                      className="tap h-8 w-8 shrink-0 rounded-full bg-secondary text-muted-foreground inline-flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
            {reasons.length < 5 && (
              <button
                onClick={() => setReasons([...reasons, ""])}
                className="tap w-full rounded-xl py-2.5 text-[13px] font-medium text-muted-foreground"
                style={{ border: "1px dashed rgba(0,0,0,0.18)" }}
              >
                + Добавить причину
              </button>
            )}
          </div>
        )}

        {tab === "image" && (
          <div className="animate-fade-up">
            <div className="rounded-2xl overflow-hidden mb-3" style={{ aspectRatio: "16 / 9" }}>
              <img src={image} alt={title} className="h-full w-full object-cover" />
            </div>
            <label
              className="tap block cursor-pointer rounded-[18px] bg-card px-4 py-6 text-center"
              style={{ border: "1.5px dashed #ede8df" }}
            >
              <div className="mx-auto h-12 w-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "linear-gradient(135deg, #FFE0B2, #FFB300)" }}>
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-2 text-[14px] font-semibold">Загрузить новое фото</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">С телефона или компьютера</p>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setImage(URL.createObjectURL(f));
                }}
              />
            </label>
          </div>
        )}

        {tab === "criteria" && (
          <div className="animate-fade-up">
            <textarea
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              rows={4}
              className="w-full rounded-xl bg-card px-3.5 py-3 text-[14px] outline-none transition-colors resize-none"
              style={{ border: `1px solid ${criteria.trim() ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
            />
          </div>
        )}

        {tab === "plan" && (
          <div className="animate-fade-up">
            <textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              rows={6}
              className="w-full rounded-xl bg-card px-3.5 py-3 text-[14px] outline-none transition-colors resize-none"
              style={{ border: `1px solid ${plan.trim() ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
            />
          </div>
        )}

        {tab === "vision" && (
          <div className="animate-fade-up">
            <p className="text-[13px] text-[#FF6D00] mb-2">
              Представь, что оно уже произошло. Опиши так, как будто проживаешь это прямо сейчас — что ты видишь, слышишь, чувствуешь.
            </p>
            <textarea
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              maxLength={800}
              rows={8}
              placeholder="Я стою на финише и чувствую..."
              className="w-full rounded-xl bg-card px-3.5 py-3 text-[14px] outline-none transition-colors resize-none"
              style={{ border: `1px solid ${vision.trim() ? "#FF6D00" : "rgba(0,0,0,0.08)"}` }}
            />
            <div className="mt-1.5 text-right text-[11px] text-muted-foreground">{vision.length}/800</div>
          </div>
        )}
      </div>

      {/* Bottom save */}
      <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-border/50 px-4 py-3 safe-bottom">
        <button onClick={handleSave} className="tap btn-pill-orange w-full">
          Сохранить изменения
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   ===========  Кнопка «Воплощено» + поп-ап =================== */

function ActionsMenu({
  onDone,
  onEdit,
  onDelete,
  onBrainstorm,
  doneConfirmText,
  deleteConfirmText,
}: {
  onDone: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onBrainstorm?: () => void;
  doneConfirmText: string;
  deleteConfirmText: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirmDone, setConfirmDone] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = btnRef.current?.getBoundingClientRect();
      if (!rect) return;

      const menuWidth = 172;
      const menuHeight = 136;
      const gap = 8;
      const viewportPadding = 12;

      const left = Math.min(
        window.innerWidth - menuWidth - viewportPadding,
        Math.max(viewportPadding, rect.right - menuWidth),
      );

      const belowTop = rect.bottom + gap;
      const aboveTop = rect.top - menuHeight - gap;
      const top = belowTop + menuHeight <= window.innerHeight - viewportPadding
        ? belowTop
        : Math.max(viewportPadding, aboveTop);

      setMenuPos({ top, left });
    };

    const onDocPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (btnRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", onDocPointerDown);
    document.addEventListener("touchstart", onDocPointerDown);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", onDocPointerDown);
      document.removeEventListener("touchstart", onDocPointerDown);
    };
  }, [open]);

  return (
    <div className="relative shrink-0">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Действия"
        className="tap inline-flex items-center justify-center"
        style={{
          width: 32,
          height: 32,
          background: "transparent",
          border: "none",
          color: "#6b6b6b",
        }}
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[70] animate-fade-up"
          style={{
            top: menuPos?.top ?? 0,
            left: menuPos?.left ?? 0,
            width: 172,
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setConfirmDone(true);
            }}
            className="tap flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-medium"
            style={{ color: "#16a34a" }}
          >
            <span className="inline-flex w-5 justify-center text-[15px] leading-none">✅</span>
            <span>Выполнить</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="tap flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-medium text-foreground"
            style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
          >
            <span className="inline-flex w-5 justify-center text-[15px] leading-none">✏️</span>
            <span>Изменить</span>
          </button>
          {onBrainstorm && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onBrainstorm();
              }}
              className="tap flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-medium text-foreground"
              style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
            >
              <span className="inline-flex w-5 justify-center text-[15px] leading-none">🧠</span>
              <span>Мозговой штурм</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setConfirmDelete(true);
            }}
            className="tap flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-medium"
            style={{ color: "#E53935", borderTop: "1px solid rgba(0,0,0,0.06)" }}
          >
            <span className="inline-flex w-5 justify-center text-[15px] leading-none">🗑️</span>
            <span>Удалить</span>
          </button>
        </div>,
        document.body,
      )}
      {confirmDone && (
        <RealizedConfirmSheet
          text={doneConfirmText}
          onCancel={() => setConfirmDone(false)}
          onConfirm={() => {
            setConfirmDone(false);
            onDone();
          }}
        />
      )}
      {confirmDelete && (
        <DeleteConfirmSheet
          text={deleteConfirmText}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            setConfirmDelete(false);
            onDelete();
          }}
        />
      )}
    </div>
  );
}

function DoneButton({
  isDone,
  onToggle,
  confirmText,
}: {
  isDone: boolean;
  onToggle: () => void;
  confirmText: string;
  variant?: "compact" | "wide";
}) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (isDone) {
      onToggle();
    } else {
      setOpen(true);
    }
  };

  const confirm = () => {
    onToggle();
    setOpen(false);
  };

  const doneStyles: React.CSSProperties = {
    background: "#16a34a",
    border: "1px solid #16a34a",
    color: "#ffffff",
  };
  const idleStyles: React.CSSProperties = {
    background: "rgba(22,163,74,0.14)",
    border: "1px solid rgba(22,163,74,0.35)",
    color: "#16a34a",
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isDone}
        aria-label={isDone ? "Снять отметку «Воплощено»" : "Отметить как воплощённое"}
        className="tap inline-flex items-center justify-center shrink-0"
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          transition: "all 0.2s",
          ...(isDone ? doneStyles : idleStyles),
        }}
      >
        <Check className="h-4 w-4" strokeWidth={2.5} />
      </button>
      {open && (
        <RealizedConfirmSheet
          text={confirmText}
          onCancel={() => setOpen(false)}
          onConfirm={confirm}
        />
      )}
    </>
  );
}

function RealizedConfirmSheet({
  text,
  onCancel,
  onConfirm,
}: {
  text: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onEsc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prev;
    };
  }, [onCancel]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center px-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onCancel}
    >
      <div
        className="w-full animate-fade-up"
        style={{
          maxWidth: "calc(28rem - 2rem)",
          background: "#fff",
          borderRadius: "24px 24px 24px 24px",
          padding: "24px 20px 28px",
          marginBottom: "16px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mb-4"
          style={{ width: 40, height: 4, borderRadius: 2, background: "#ede8df" }}
        />
        <div className="text-center text-[48px] leading-none">🎉</div>
        <h3 className="mt-2 text-center text-[18px] font-bold text-foreground">Воплощено?</h3>
        <p
          className="mt-2 text-center text-[14px] text-[#FF6D00]"
          style={{ lineHeight: 1.6 }}
        >
          {text}
        </p>
        <button
          type="button"
          onClick={onConfirm}
          className="tap mt-5 w-full font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #4CAF50, #16a34a)",
            borderRadius: 14,
            padding: 14,
          }}
        >
          ✅ Да, воплощено!
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="tap mt-2 w-full text-muted-foreground"
          style={{
            background: "transparent",
            border: "1px solid #ede8df",
            borderRadius: 14,
            padding: 13,
          }}
        >
          Отмена
        </button>
      </div>
    </div>,
    document.body,
  );
}

function DeleteConfirmSheet({
  text,
  onCancel,
  onConfirm,
}: {
  text: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onEsc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prev;
    };
  }, [onCancel]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center px-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onCancel}
    >
      <div
        className="w-full animate-fade-up"
        style={{
          maxWidth: "calc(28rem - 2rem)",
          background: "#fff",
          borderRadius: 24,
          padding: "24px 20px 28px",
          marginBottom: 16,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mb-4"
          style={{ width: 40, height: 4, borderRadius: 2, background: "#ede8df" }}
        />
        <div className="text-center text-[48px] leading-none">🗑️</div>
        <h3 className="mt-2 text-center text-[18px] font-bold text-foreground">Удалить?</h3>
        <p
          className="mt-2 text-center text-[14px] text-[#FF6D00]"
          style={{ lineHeight: 1.6 }}
        >
          {text}
        </p>
        <button
          type="button"
          onClick={onConfirm}
          className="tap mt-5 w-full font-bold text-white"
          style={{
            background: "#E53935",
            borderRadius: 14,
            padding: 14,
          }}
        >
          Да, удалить
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="tap mt-2 w-full text-muted-foreground"
          style={{
            background: "transparent",
            border: "1px solid #ede8df",
            borderRadius: 14,
            padding: 13,
          }}
        >
          Отмена
        </button>
      </div>
    </div>,
    document.body,
  );
}



function RealizedTab({
  hotelki,
  wishes,
  goals,
  moduleTasks,
  onUndoHotelka,
  onUndoWish,
  onUndoGoal,
}: {
  hotelki: string[];
  wishes: Wish[];
  goals: Goal[];
  moduleTasks: ModuleTask[];
  onUndoHotelka: (text: string) => void;
  onUndoWish: (id: string) => void;
  onUndoGoal: (id: string) => void;
}) {
  const [proudWishes, setProudWishes] = useState<Record<string, number>>({});
  const [proudGoals, setProudGoals] = useState<Record<string, number>>({});
  const [proudHotelki, setProudHotelki] = useState<Record<string, number>>({});

  const total = hotelki.length + wishes.length + goals.length;

  if (total === 0) {
    return (
      <div className="px-4 pt-16 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-[15px] font-semibold text-foreground">Воплощённые</h3>
        <p className="mt-1.5 text-[12px] text-muted-foreground max-w-[280px] mx-auto">
          Здесь появятся хотелки, желания и цели, которые ты отметишь как воплощённые.
        </p>
      </div>
    );
  }

  type MixedItem =
    | { kind: "hotelka"; key: string; node: React.ReactNode }
    | { kind: "wish"; key: string; node: React.ReactNode }
    | { kind: "goal"; key: string; node: React.ReactNode };

  const items: MixedItem[] = [
    ...goals.map((g): MixedItem => {
      const goalTasks = moduleTasks.filter((t) => t.goalId === g.id);
      const goalDone = goalTasks.filter((t) => t.done).length;
      return {
        kind: "goal",
        key: `g-${g.id}`,
        node: (
          <GoalCard
            goal={g}
            count={proudGoals[g.id] ?? 0}
            onInspire={() => setProudGoals((p) => ({ ...p, [g.id]: (p[g.id] ?? 0) + 1 }))}
            onEdit={() => {}}
            onDelete={() => {}}
            isDone
            onToggleDone={() => onUndoGoal(g.id)}
            tasksAll={goalTasks}
            tasksDoneCount={goalDone}
            readOnly
          />
        ),
      };
    }),
    ...wishes.map((w): MixedItem => ({
      kind: "wish",
      key: `w-${w.id}`,
      node: (
        <WishCard
          wish={w}
          count={proudWishes[w.id] ?? 0}
          onInspire={() => setProudWishes((p) => ({ ...p, [w.id]: (p[w.id] ?? 0) + 1 }))}
          onEdit={() => {}}
          onMakeGoal={() => {}}
          onDelete={() => {}}
          isDone
          onToggleDone={() => onUndoWish(w.id)}
          readOnly
        />
      ),
    })),
    ...hotelki.map((h, i): MixedItem => ({
      kind: "hotelka",
      key: `h-${i}-${h}`,
      node: (
        <HotelkaItem
          index={i + 1}
          text={h}
          onSave={() => {}}
          onDelete={() => {}}
          isDone
          onToggleDone={() => onUndoHotelka(h)}
          readOnly
          proudCount={proudHotelki[h] ?? 0}
          onProud={() => setProudHotelki((p) => ({ ...p, [h]: (p[h] ?? 0) + 1 }))}
        />
      ),
    })),
  ];

  // Перемешать детерминированно
  const mixed = items
    .map((it, i) => ({ it, sort: ((it.key.length * 31 + i * 17) % 97) }))
    .sort((a, b) => a.sort - b.sort)
    .map((x) => x.it);

  return (
    <div className="px-4 pt-3 space-y-4">
      {mixed.map((it) => (
        <div key={it.key}>{it.node}</div>
      ))}
    </div>
  );
}

/* ---------------- Deck свайп-карточек желаний ---------------- */

function WishesDeck({
  wishes,
  inspires,
  onInspire,
  onEdit,
  onMakeGoal,
  onDelete,
  onToggleDone,
  doneWishes,
}: {
  wishes: Wish[];
  inspires: Record<string, number>;
  onInspire: (id: string) => void;
  onEdit: (w: Wish) => void;
  onMakeGoal: (w: Wish) => void;
  onDelete: (id: string) => void;
  onToggleDone: (id: string) => void;
  doneWishes: Set<string>;
}) {
  const [order, setOrder] = useState<string[]>(() => wishes.map((w) => w.id));
  const [dx, setDx] = useState(0);
  const [flying, setFlying] = useState<null | "left" | "right">(null);
  const startRef = useRef<{ x: number; y: number; active: boolean; locked: boolean }>({ x: 0, y: 0, active: false, locked: false });

  // Sync order with incoming wishes (add new / remove deleted), preserving current order for existing ids.
  useEffect(() => {
    setOrder((prev) => {
      const ids = new Set(wishes.map((w) => w.id));
      const kept = prev.filter((id) => ids.has(id));
      const added = wishes.map((w) => w.id).filter((id) => !kept.includes(id));
      return [...added, ...kept];
    });
  }, [wishes]);

  const byId = new Map(wishes.map((w) => [w.id, w]));
  const visibleIds = order.filter((id) => byId.has(id));

  if (visibleIds.length === 0) {
    return (
      <div className="text-center text-[13px] text-[#FF6D00] py-10">
        Пока нет желаний. Добавь первое ✨
      </div>
    );
  }

  
  const THRESHOLD = 90;

  const commitSwipe = (dir: "left" | "right") => {
    setFlying(dir);
    window.setTimeout(() => {
      setOrder((prev) => {
        if (prev.length <= 1) return prev;
        const [first, ...rest] = prev;
        return [...rest, first];
      });
      setDx(0);
      setFlying(null);
    }, 280);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    startRef.current = { x: t.clientX, y: t.clientY, active: true, locked: false };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const s = startRef.current;
    if (!s.active || flying) return;
    const t = e.touches[0];
    const deltaX = t.clientX - s.x;
    const deltaY = t.clientY - s.y;
    if (!s.locked) {
      if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        s.active = false;
        return;
      }
      s.locked = true;
    }
    setDx(deltaX);
  };
  const onTouchEnd = () => {
    const s = startRef.current;
    startRef.current = { x: 0, y: 0, active: false, locked: false };
    if (flying) return;
    if (!s.locked) {
      setDx(0);
      return;
    }
    if (Math.abs(dx) > THRESHOLD) {
      commitSwipe(dx < 0 ? "left" : "right");
    } else {
      setDx(0);
    }
  };

  return (
    <div
      className="relative"
      style={{
        minHeight: 520,
      }}
    >
      {visibleIds.slice(0, 3).reverse().map((id, idxFromBottom, arr) => {
        const w = byId.get(id)!;
        const depth = arr.length - 1 - idxFromBottom; // 0 = top
        const isTop = depth === 0;
        const progress = isTop ? Math.min(Math.abs(dx) / 160, 1) : 0;

        // Behind cards: scale + darken; as top is dragged, they rise toward 1.
        const baseScale = depth === 0 ? 1 : depth === 1 ? 0.94 : 0.88;
        const baseY = depth === 0 ? 0 : depth === 1 ? 10 : 20;
        const nextScale = depth === 1 ? baseScale + (1 - baseScale) * progress : baseScale;
        const nextY = depth === 1 ? baseY - baseY * progress : baseY;
        const darken = depth === 0 ? 0 : depth === 1 ? 0.18 - 0.18 * progress : 0.28;

        let transform = `translate3d(0, ${nextY}px, 0) scale(${nextScale})`;
        let transition = flying && isTop
          ? "transform 280ms cubic-bezier(.2,.7,.2,1), opacity 280ms ease"
          : startRef.current.active && isTop
            ? "none"
            : "transform 260ms cubic-bezier(.2,.7,.2,1)";
        let opacity = 1;
        let zIndex = 10 - depth;
        let boxShadow = isTop
          ? "0 20px 40px -12px rgba(0,0,0,0.25), 0 8px 16px -8px rgba(0,0,0,0.15)"
          : "0 8px 20px -10px rgba(0,0,0,0.15)";

        if (isTop) {
          if (flying) {
            const out = flying === "left" ? -window.innerWidth : window.innerWidth;
            transform = `translate3d(${out}px, 0, 0) rotate(${flying === "left" ? -12 : 12}deg)`;
            opacity = 0;
          } else {
            const rot = dx / 20;
            transform = `translate3d(${dx}px, 0, 0) rotate(${rot}deg)`;
          }
        }

        return (
          <div
            key={id}
            className="absolute inset-x-0 top-0"
            style={{
              transform,
              transition,
              opacity,
              zIndex,
              willChange: "transform, opacity",
              touchAction: "pan-y",
            }}
            onTouchStart={isTop ? onTouchStart : undefined}
            onTouchMove={isTop ? onTouchMove : undefined}
            onTouchEnd={isTop ? onTouchEnd : undefined}
            onTouchCancel={isTop ? onTouchEnd : undefined}
          >
            <div className="relative rounded-2xl" style={{ boxShadow }}>
              <WishCard
                wish={w}
                priority={isTop}
                count={inspires[w.id] ?? 0}
                onInspire={() => onInspire(w.id)}
                onEdit={() => onEdit(w)}
                onMakeGoal={() => onMakeGoal(w)}
                onDelete={() => onDelete(w.id)}
                isDone={doneWishes.has(w.id)}
                onToggleDone={() => onToggleDone(w.id)}
              />
              {darken > 0 && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{ background: `rgba(0,0,0,${darken})`, transition: "background 260ms ease" }}
                />
              )}
            </div>
          </div>
        );
      })}
      {/* Подсказка */}
      
    </div>
  );
}
