import { Eye, X } from "lucide-react";
import { setPreviewLevel, usePreviewLevel } from "@/lib/previewLevel";

export const PREVIEW_BANNER_HEIGHT = 64;

export function PreviewLevelBanner() {
  const level = usePreviewLevel();
  if (level == null) return null;

  return (
    <div
      className="fixed top-0 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-3 pt-[max(env(safe-area-inset-top),8px)] pb-2"
      role="status"
    >
      <div
        className="relative overflow-hidden rounded-2xl px-3.5 py-2.5 flex items-center gap-3 text-white shadow-[0_10px_30px_rgba(255,109,0,0.45)]"
        style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
      >
        <span className="h-9 w-9 shrink-0 rounded-full bg-white/20 flex items-center justify-center">
          <Eye className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold leading-tight">
            Режим просмотра: Уровень {level}
          </p>
          <p className="text-[11px] opacity-95 leading-tight mt-0.5">
            Только демо — данные не меняются
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPreviewLevel(null)}
          className="tap text-[12px] font-semibold bg-white/25 hover:bg-white/35 rounded-full pl-2 pr-2.5 py-1 flex items-center gap-1 transition-colors"
          aria-label="Выйти из режима просмотра"
        >
          <X className="h-3.5 w-3.5" strokeWidth={3} />
          Выйти
        </button>
      </div>
    </div>
  );
}
