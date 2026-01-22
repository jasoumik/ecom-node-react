import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
  asChild?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  fullWidth,
  className,
  asChild,
  children,
  ...props
}) => {
  // Unified shape: rounded-2xl (matches product cards and categories)
  const base =
    "inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-bold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95";

  const variantClass =
    variant === "primary"
      ? "bg-sky-400 text-white shadow-lg shadow-sky-400/30 hover:bg-sky-500 hover:shadow-xl hover:shadow-sky-400/40 hover:-translate-y-0.5 focus-visible:ring-sky-400"
      : variant === "secondary"
      ? "bg-white text-slate-800 border border-slate-200 shadow-sm hover:bg-sky-50 hover:border-sky-200 hover:shadow-md focus-visible:ring-sky-400"
      : "border-2 border-sky-200 text-sky-500 hover:border-sky-400 hover:bg-sky-50 focus-visible:ring-sky-400";

  const widthClass = fullWidth ? "w-full" : "";

  if (asChild && React.isValidElement(children)) {
     return React.cloneElement(children as React.ReactElement, {
         className: `${base} ${variantClass} ${widthClass} ${className ?? ""} ${(children as React.ReactElement).props.className ?? ""}`,
         ...props
     });
  }

  return (
    <button
      className={`${base} ${variantClass} ${widthClass} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
};
