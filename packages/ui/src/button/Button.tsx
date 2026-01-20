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
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95";

  const variantClass =
    variant === "primary"
      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25 hover:bg-rose-600 hover:shadow-rose-500/40 focus-visible:ring-rose-500"
      : variant === "secondary"
      ? "bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-slate-400"
      : "border-2 border-rose-100 text-rose-600 hover:border-rose-200 hover:bg-rose-50 focus-visible:ring-rose-400";

  const widthClass = fullWidth ? "w-full" : "";

  const Comp = asChild ? React.Fragment : "button";
  // If asChild is true, we assume the child is a single element that accepts className and props.
  // But for simplicity here, if asChild is true, we just render children (assuming the user handles it, or we cloneElement).
  // Since I don't have the full slot implementation, I'll stick to button for now or wrap children.
  // Wait, the original code didn't have asChild logic but the usage in FeaturedProductsSection used `asChild`.
  // Let's check FeaturedProductsSection usage: <Button variant="outline" asChild><a href={viewAllHref}>View all</a></Button>
  // So I need to support asChild properly or just clone the child.
  
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
