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
  // GhorerBazar inspired: Slightly rounded corners (rounded-md or rounded), bold text, specific padding
  // They use roughly 4-6px radius. Tailwind 'rounded' is 4px, 'rounded-md' is 6px.
  // I'll use 'rounded-md' for a clean, professional look.
  const base =
    "inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-bold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95";

  const variantClass =
    variant === "primary"
      ? "bg-sky-500 text-white shadow-md hover:bg-sky-600 hover:shadow-lg focus-visible:ring-sky-500"
      : variant === "secondary"
      ? "bg-white text-slate-800 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-sky-400"
      : "border-2 border-sky-500 text-sky-600 hover:bg-sky-50 focus-visible:ring-sky-400";

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
