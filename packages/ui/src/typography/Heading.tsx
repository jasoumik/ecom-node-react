import * as React from "react";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4";
  size?: "xl" | "lg" | "md" | "sm";
}

const sizeClasses: Record<NonNullable<HeadingProps["size"]>, string> = {
  xl: "text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight",
  lg: "text-2xl sm:text-3xl font-semibold",
  md: "text-xl font-semibold",
  sm: "text-lg font-semibold",
};

export const Heading: React.FC<HeadingProps> = ({
  as: Tag = "h2",
  size = "lg",
  className,
  ...props
}) => {
  return (
    <Tag
      className={`${sizeClasses[size]} text-slate-900 tracking-tight ${
        className ?? ""
      }`}
      {...props}
    />
  );
};

