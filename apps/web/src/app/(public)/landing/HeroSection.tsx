import type { HeroContent } from "./types";
import { Heading, Text, Button } from "@repo/ui";

export function HeroSection(props: HeroContent) {
  const { headline, subheadline, primaryCta, secondaryCta, stats } = props;

  return (
    <section className="w-full bg-transparent py-12"> {/* Changed to bg-transparent */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-sky-100 text-sky-600 text-[10px] font-bold uppercase tracking-wider animate-fade-in-up dark:bg-slate-800/80 dark:border-slate-700 dark:text-sky-400">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            Your One-Stop Shop
          </div>
          
          <Heading as="h1" size="xl" className="font-sans text-slate-900 dark:text-white leading-tight text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            {headline}
          </Heading>
          
          <Text className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {subheadline}
          </Text>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-1">
            <a href={primaryCta.href} className="w-full sm:w-auto">
              <Button className="px-6 py-3 text-sm rounded-xl shadow-lg shadow-sky-500/20 bg-sky-500 text-white hover:bg-sky-600 hover:scale-105 transition-all duration-300 w-full dark:shadow-sky-900/40 font-bold">
                {primaryCta.label}
              </Button>
            </a>
            <a href={secondaryCta.href} className="w-full sm:w-auto">
              <Button variant="outline" className="px-6 py-3 text-sm rounded-xl border-2 border-slate-200 text-slate-600 hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50 transition-all duration-300 w-full font-bold dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 bg-white/50 backdrop-blur-sm">
                {secondaryCta.label}
              </Button>
            </a>
          </div>

          {stats && stats.length > 0 && (
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 mt-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white leading-none mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
