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
    "w-full px-4 py-10 sm:px-6 lg:px-8 flex justify-center bg-transparent";
  const inner =
    "w-full max-w-6xl";
  const variantClass =
    variant === "muted"
      ? "bg-[#f9fafb]"
      : variant === "highlight"
      ? "bg-gradient-to-b from-[#fff7f9] to-[#f3f4ff]"
      : "";

  return (
    <section className={`${base} ${variantClass} ${className ?? ""}`} {...props}>
      <div className={inner}>{children}</div>
    </section>
  );
};

