import { useRef, useEffect, TextareaHTMLAttributes } from "react";

export function AutoResizeTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    resize();
  }, [props.value]);

  return (
    <textarea
      ref={ref}
      {...props}
      onChange={(e) => {
        resize();
        props.onChange?.(e);
      }}
      rows={1}
      style={{ ...props.style, overflow: "hidden", resize: "none" }}
    />
  );
}
