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
  // Modernized button: rounded-xl (not full), slightly more padding, better shadows
  const base =
    "inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95";

  const variantClass =
    variant === "primary"
      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600 hover:shadow-xl hover:shadow-rose-500/40 hover:-translate-y-0.5 focus-visible:ring-rose-500"
      : variant === "secondary"
      ? "bg-white text-slate-800 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow-md focus-visible:ring-slate-400"
      : "border-2 border-rose-200 text-rose-600 hover:border-rose-500 hover:bg-rose-50 focus-visible:ring-rose-400";

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
