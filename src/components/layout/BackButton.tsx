import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

/**
 * Унифицированная кнопка возврата назад.
 * Стиль: оранжевый (#FF6D00), не жирный, с шевроном слева.
 * Используется во всех шапках разделов для единообразного UX.
 */
export function BackButton({ onClick, label = "Назад", className = "" }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`tap inline-flex items-center gap-1 text-[15px] font-normal text-[#FF6D00] ${className}`}
    >
      <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
      {label}
    </button>
  );
}
