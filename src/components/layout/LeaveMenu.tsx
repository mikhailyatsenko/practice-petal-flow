import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreHorizontal, LogOut } from "lucide-react";

interface LeaveMenuProps {
  menuItemLabel: string;
  confirmTitle: string;
  confirmBody: ReactNode;
  confirmButtonLabel: string;
  onConfirm: () => void;
}

export function LeaveMenu({
  menuItemLabel,
  confirmTitle,
  confirmBody,
  confirmButtonLabel,
  onConfirm,
}: LeaveMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <>
      <div ref={wrapRef} className="ml-auto relative z-20">
        <button
          type="button"
          aria-label="Меню"
          onClick={() => setOpen((v) => !v)}
          className="tap h-9 w-9 rounded-full flex items-center justify-center bg-card hairline shadow-card"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
        {open && (
          <div
            className="absolute right-0 mt-1.5 min-w-[220px] rounded-xl bg-card hairline shadow-card overflow-hidden animate-fade-in"
            style={{ zIndex: 40 }}
          >
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setConfirm(true);
              }}
              className="tap w-full px-3.5 py-3 text-left text-[14px] font-semibold flex items-center gap-2.5"
              style={{ color: "#c92a2a" }}
            >
              <LogOut className="h-4 w-4" />
              {menuItemLabel}
            </button>
          </div>
        )}
      </div>

      {confirm && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/45 animate-fade-in"
            onClick={() => setConfirm(false)}
          />
          <div className="relative w-full max-w-md mx-auto bg-card rounded-t-2xl sm:rounded-2xl p-5 animate-fade-up shadow-card">
            <h3 className="text-[17px] font-bold leading-tight">{confirmTitle}</h3>
            <div className="mt-2.5 text-[13.5px] leading-relaxed" style={{ color: "#4b4335" }}>
              {confirmBody}
            </div>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirm(false)}
                className="tap flex-1 rounded-xl py-3 text-[14px] font-semibold bg-[#FAF6EF] hairline"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirm(false);
                  onConfirm();
                }}
                className="tap flex-1 rounded-xl py-3 text-[14px] font-bold text-white"
                style={{ background: "#c92a2a", boxShadow: "0 6px 18px rgba(201,42,42,0.35)" }}
              >
                {confirmButtonLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
