import * as React from "react";

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: "muted" | "default";
}

export const Text: React.FC<TextProps> = ({
  className,
  variant = "default",
  ...props
}) => {
  const base = "text-sm sm:text-base leading-relaxed";
  const color =
    variant === "muted" ? "text-slate-500" : "text-slate-700";

  return <p className={`${base} ${color} ${className ?? ""}`} {...props} />;
};

