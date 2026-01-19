import * as React from "react";

export interface HeroLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  left: React.ReactNode;
  right?: React.ReactNode;
}

export const HeroLayout: React.FC<HeroLayoutProps> = ({ left, right, className, ...props }) => {
  return (
    <section
      className={`w-full px-4 py-12 sm:px-6 lg:px-8 flex justify-center bg-gradient-to-b from-rose-50 via-white to-sky-50 ${
        className ?? ""
      }`}
      {...props}
    >
      <div className="w-full max-w-6xl flex flex-col-reverse gap-10 md:flex-row md:items-center">
        <div className="flex-1 space-y-6">{left}</div>
        {right && <div className="flex-1 flex justify-center">{right}</div>}
      </div>
    </section>
  );
};

