import * as React from "react";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "muted" | "highlight";
}

export const Section: React.FC<SectionProps> = ({
  variant = "default",
  className,
  children,
  ...props
}) => {
  const base =
    "w-full px-4 py-16 sm:px-6 lg:px-8 flex justify-center bg-transparent";
  const inner =
    "w-full max-w-7xl"; // Increased max-width for more breathing room
  const variantClass =
    variant === "muted"
      ? "bg-slate-50/50"
      : variant === "highlight"
      ? "bg-gradient-to-br from-rose-50/50 via-white to-sky-50/50"
      : "";

  return (
    <section className={`${base} ${variantClass} ${className ?? ""}`} {...props}>
      <div className={inner}>{children}</div>
    </section>
  );
};
