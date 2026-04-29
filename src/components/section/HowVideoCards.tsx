import { Play } from "lucide-react";

type VideoItem = {
  title: string;
  duration: string;
  caption: string;
};

function VideoCard({ title, duration, caption }: VideoItem) {
  return (
    <div className="bg-card hairline rounded-2xl overflow-hidden shadow-card">
      <p className="px-4 pt-3 pb-2 text-[14px] font-semibold">{title}</p>
      <div
        className="relative aspect-video w-full flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #2a1a05 0%, #4a2c0a 50%, #1a0e00 100%)",
        }}
      >
        <button
          aria-label="Воспроизвести"
          className="tap h-16 w-16 rounded-full flex items-center justify-center text-white shadow-lg"
          style={{ background: "linear-gradient(135deg, #FFB300, #FF6D00)" }}
        >
          <Play className="h-7 w-7 fill-white ml-1" />
        </button>
        <span className="absolute bottom-2.5 right-3 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
          {duration}
        </span>
      </div>
      <div className="px-4 py-3">
        <p className="text-[13px] leading-snug text-foreground">{caption}</p>
      </div>
    </div>
  );
}

export function HowVideoCards({
  first,
  second,
}: {
  first: VideoItem;
  second: VideoItem;
}) {
  return (
    <div className="space-y-3">
      <VideoCard {...first} />
      <VideoCard {...second} />
    </div>
  );
}
