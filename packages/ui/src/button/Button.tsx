import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  fullWidth,
  className,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const variantClass =
    variant === "primary"
      ? "bg-rose-500 text-white hover:bg-rose-600 focus-visible:ring-rose-500"
      : variant === "secondary"
      ? "bg-rose-50 text-rose-700 hover:bg-rose-100 focus-visible:ring-rose-400"
      : "border border-rose-200 text-rose-700 hover:bg-rose-50 focus-visible:ring-rose-400";

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${base} ${variantClass} ${widthClass} ${className ?? ""}`}
      {...props}
    />
  );
};
