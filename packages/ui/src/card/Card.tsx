import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className, ...props }) => {
  const base =
    "rounded-2xl border border-slate-100 bg-white shadow-sm/40 p-4 sm:p-6";
  return <div className={`${base} ${className ?? ""}`} {...props} />;
};

