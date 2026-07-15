// Общие демо-данные участников Четвёрки — используются на странице «Моя Четвёрка»
// и на странице «Анкета участника».

export interface FoursomeMember {
  userId: string;
  name: string;
  lastName?: string;
  avatar: string;
  job: string;
  telegram?: string; // username без @
  max?: string;      // ссылка на профиль
}

export const ME_MEMBER: FoursomeMember = {
  userId: "me",
  name: "Ты",
  avatar: "🙂",
  job: "Участник клуба",
};

export const MY_BUDDY_MEMBER: FoursomeMember = {
  userId: "b1",
  name: "Алексей",
  lastName: "Иванов",
  avatar: "🧑‍💻",
  job: "Продакт-менеджер",
  telegram: "alexey_ivanov",
  max: "https://max.ru/alexey.ivanov",
};

export const FOURSOME_DEMO_MEMBERS: FoursomeMember[] = [
  ME_MEMBER,
  MY_BUDDY_MEMBER,
  {
    userId: "u7",
    name: "Елена",
    lastName: "Смирнова",
    avatar: "🦋",
    job: "Архитектор",
    telegram: "elena_arc",
    max: "https://max.ru/elena.arc",
  },
  {
    userId: "u8",
    name: "Павел",
    lastName: "Морозов",
    avatar: "🎸",
    job: "Музыкант · продюсер",
    telegram: "pavel_m",
  },
];

export function findFoursomeMember(userId: string): FoursomeMember | undefined {
  return FOURSOME_DEMO_MEMBERS.find((m) => m.userId === userId);
}

export function fullName(m: { name: string; lastName?: string }): string {
  return m.lastName ? `${m.name} ${m.lastName}` : m.name;
}
