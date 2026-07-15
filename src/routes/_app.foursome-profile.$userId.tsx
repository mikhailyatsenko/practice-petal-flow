import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BackButton } from "@/components/layout/BackButton";
import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";
import { findFoursomeMember, fullName } from "@/lib/foursomeDemo";
import {
  getFoursomeProfile,
  saveFoursomeProfile,
  isProfileFilled,
  type FoursomeProfile,
} from "@/lib/foursomeProfileStore";

export const Route = createFileRoute("/_app/foursome-profile/$userId")({
  head: () => ({
    meta: [{ title: "Анкета участника — Четвёрка" }],
  }),
  component: ProfilePage,
});

const ORANGE_GRADIENT = "linear-gradient(135deg, #FFB300, #FF6D00)";

const FIELDS: Array<{
  key: keyof FoursomeProfile;
  label: string;
  emoji: string;
  placeholder: string;
}> = [
  {
    key: "goal12",
    label: "Главная цель на 1–2 года",
    emoji: "🎯",
    placeholder: "Что важно достичь в ближайшие 1–2 года?",
  },
  {
    key: "wishes",
    label: "Три желания",
    emoji: "✨",
    placeholder: "Опиши три ключевых желания",
  },
  {
    key: "strengths",
    label: "Сильные стороны",
    emoji: "💪",
    placeholder: "Что у тебя получается лучше всего?",
  },
  {
    key: "blockers",
    label: "Что мешает достигать целей",
    emoji: "🚧",
    placeholder: "Что чаще всего останавливает?",
  },
  {
    key: "support",
    label: "В чём нужна поддержка",
    emoji: "🤝",
    placeholder: "Какая помощь от Четвёрки будет самой ценной?",
  },
  {
    key: "offer",
    label: "Чем ты можешь быть полезен",
    emoji: "🎁",
    placeholder: "Опыт, знания, связи, которыми готов делиться",
  },
  {
    key: "notes",
    label: "Дополнительные заметки",
    emoji: "📝",
    placeholder: "Всё, что важно знать участникам",
  },
];

function ProfilePage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const member = findFoursomeMember(userId);
  const isMe = userId === "me";

  const initial = getFoursomeProfile(userId) ?? {};
  const [profile, setProfile] = useState<FoursomeProfile>(initial);
  const filled = isProfileFilled(initial);
  const [mode, setMode] = useState<"view" | "edit">(filled ? "view" : "edit");

  const set = <K extends keyof FoursomeProfile>(k: K, v: FoursomeProfile[K]) =>
    setProfile((p) => ({ ...p, [k]: v }));

  const onSave = () => {
    saveFoursomeProfile(userId, profile);
    setMode("view");
  };

  if (!member) {
    return (
      <div className="px-4 pb-8">
        <Header title="Анкета участника" onBack={() => navigate({ to: "/foursome", search: { demo: "has" } })} />
        <p className="text-[14px] text-muted-foreground text-center mt-8">Участник не найден</p>
      </div>
    );
  }

  const title = isMe ? "Моя анкета" : `Анкета · ${member.name}`;
  const readOnly = mode === "view";

  return (
    <div className="px-4 pb-8">
      <Header title={title} onBack={() => navigate({ to: "/foursome", search: { demo: "has" } })} />

      {/* Профиль-шапка */}
      <div
        className="rounded-2xl p-4 mb-4 flex items-center gap-3"
        style={{ background: "#FAF6EF", border: "1px solid #ede8df" }}
      >
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center text-[24px] shrink-0"
          style={{ background: "#fff" }}
        >
          {member.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold truncate">{fullName(member)}</div>
          <div className="text-[12px] text-muted-foreground truncate">{member.job}</div>
        </div>
        {isMe && filled && readOnly && (
          <button
            onClick={() => setMode("edit")}
            className="tap text-[12px] font-bold px-3 py-1.5 rounded-full"
            style={{ background: "#fff3e0", color: "#FF6D00" }}
          >
            Изменить
          </button>
        )}
      </div>

      {!filled && !isMe && readOnly && (
        <p className="text-[13px] text-muted-foreground mb-4 px-1" style={{ lineHeight: 1.55 }}>
          Анкета ещё не заполнена. Заполните её на первом созвоне Четвёрки, чтобы лучше узнать участника.
        </p>
      )}

      <div className="space-y-3">
        {FIELDS.map((f) => {
          const value = (profile[f.key] as string | undefined) ?? "";
          if (readOnly && !value.trim()) return null;
          return (
            <div
              key={f.key}
              className="rounded-2xl p-3.5 bg-white"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <div className="text-[13px] font-semibold mb-1.5 flex items-center gap-1.5">
                <span>{f.emoji}</span>
                <span>{f.label}</span>
              </div>
              {readOnly ? (
                <p className="text-[13px] whitespace-pre-line" style={{ lineHeight: 1.55 }}>
                  {value}
                </p>
              ) : (
                <AutoResizeTextarea
                  value={value}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full text-[13px] bg-transparent outline-none"
                  style={{ lineHeight: 1.55, minHeight: 40 }}
                />
              )}
            </div>
          );
        })}

        {readOnly && filled === false && (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: "#FAF6EF", border: "1px dashed #ede8df" }}
          >
            <div className="text-[28px] mb-1">📄</div>
            <div className="text-[13px] text-muted-foreground">Анкета пуста</div>
          </div>
        )}
      </div>

      {!readOnly && (
        <button
          onClick={onSave}
          className="tap mt-5 w-full py-3.5 rounded-2xl text-white text-[14px] font-bold"
          style={{ background: ORANGE_GRADIENT }}
        >
          💾 Сохранить анкету
        </button>
      )}
      {readOnly && !filled && (
        <button
          onClick={() => setMode("edit")}
          className="tap mt-5 w-full py-3.5 rounded-2xl text-white text-[14px] font-bold"
          style={{ background: ORANGE_GRADIENT }}
        >
          ✍️ Заполнить анкету
        </button>
      )}
    </div>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="relative flex items-center px-1 pt-2 pb-3">
      <div className="relative z-10">
        <BackButton onClick={onBack} />
      </div>
      <h1 className="pointer-events-none absolute left-0 right-0 text-center text-[18px] font-semibold leading-tight">
        {title}
      </h1>
    </div>
  );
}
