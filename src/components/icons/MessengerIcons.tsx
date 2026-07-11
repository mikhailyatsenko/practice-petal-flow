// Официальные логотипы мессенджеров, используемых в приложении.
// Используются в разделе «Комьюнити», баннерах «Открой в MAX/Telegram»
// и в форме заявки на бадди.

interface Props {
  size?: number;
  className?: string;
}

// Telegram — синий круг с белым бумажным самолётиком (официальная марка).
export function TelegramIcon({ size = 24, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      className={className}
      aria-label="Telegram"
    >
      <defs>
        <linearGradient id="tg-g" x1="120" y1="0" x2="120" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2AABEE" />
          <stop offset="1" stopColor="#229ED9" />
        </linearGradient>
      </defs>
      <circle cx="120" cy="120" r="120" fill="url(#tg-g)" />
      <path
        fill="#fff"
        d="M53.6 118.4c34.9-15.2 58.2-25.2 69.8-30.1 33.2-13.8 40.1-16.2 44.6-16.3 1 0 3.2.2 4.7 1.4 1.2 1 1.5 2.3 1.7 3.3.2 1 .4 3.1.2 4.8-2 21.3-10.9 72.9-15.4 96.7-1.9 10.1-5.7 13.5-9.3 13.8-8 .7-14-5.3-21.7-10.4-12-7.9-18.8-12.8-30.5-20.5-13.5-8.9-4.7-13.8 2.9-21.8 2-2.1 36.7-33.6 37.4-36.5.1-.4.2-1.7-.6-2.4-.8-.7-2-.5-2.9-.3-1.2.3-20.6 13.1-58 38.4-5.5 3.8-10.5 5.6-14.9 5.5-4.9-.1-14.3-2.8-21.3-5.1-8.6-2.8-15.4-4.2-14.8-8.9.3-2.4 3.7-4.9 10.1-7.5z"
      />
    </svg>
  );
}

// MAX — мессенджер VK. Сине-фиолетовый градиентный квадрат с белой «M».
export function MaxIcon({ size = 24, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      className={className}
      aria-label="MAX"
    >
      <defs>
        <linearGradient id="max-g" x1="0" y1="0" x2="240" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2E7BFF" />
          <stop offset="0.55" stopColor="#7B4DFF" />
          <stop offset="1" stopColor="#E24BE6" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="240" height="240" rx="56" fill="url(#max-g)" />
      <path
        fill="#fff"
        d="M55 178V62h24l41 66 41-66h24v116h-25v-72l-32 51h-16l-32-51v72z"
      />
    </svg>
  );
}
