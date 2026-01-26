import type { HeroContent } from "./types";
import { HeroLayout, Heading, Text, Button, ResponsiveImage } from "@repo/ui";

export function HeroSection(props: HeroContent) {
  const { headline, subheadline, primaryCta, secondaryCta, image, stats } = props;

  return (
    <section className="relative w-full pt-12 pb-20 overflow-hidden bg-gradient-to-b from-sky-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-sky-200/30 rounded-full blur-3xl dark:bg-sky-900/20 animate-pulse-slow"></div>
        <div className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] bg-blue-200/30 rounded-full blur-3xl dark:bg-blue-900/20 animate-pulse-slow delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-8 text-center lg:text-left w-full">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-sky-100 text-sky-600 text-xs font-bold uppercase tracking-wider animate-fade-in-up dark:bg-slate-800 dark:border-slate-700 dark:text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              #1 Choice for Moms & Babies
            </div>
            
            <div className="space-y-4">
                <Heading as="h1" size="xl" className="font-sans text-slate-900 dark:text-white leading-[1.1] text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                {headline}
                </Heading>
                
                <Text className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
                {subheadline}
                </Text>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <a href={primaryCta.href} className="w-full sm:w-auto">
                <Button className="px-8 py-4 text-base rounded-2xl shadow-xl shadow-sky-500/20 bg-sky-500 text-white hover:bg-sky-600 hover:scale-105 transition-all duration-300 w-full dark:shadow-sky-900/40 font-bold">
                  {primaryCta.label}
                </Button>
              </a>
              <a href={secondaryCta.href} className="w-full sm:w-auto">
                <Button variant="outline" className="px-8 py-4 text-base rounded-2xl border-2 border-slate-200 text-slate-600 hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50 transition-all duration-300 w-full font-bold dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                  {secondaryCta.label}
                </Button>
              </a>
            </div>

            {/* Stats Row */}
            {stats && stats.length > 0 && (
              <div className="flex items-center justify-center lg:justify-start gap-8 pt-6 border-t border-slate-100 dark:border-slate-800/50 mt-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hero Image with Floating Elements */}
          <div className="relative lg:h-[600px] flex items-center justify-center w-full perspective-1000">
            <div className="relative w-full max-w-md lg:max-w-full aspect-[4/5] lg:aspect-auto lg:h-full transform transition-transform duration-500 hover:rotate-y-2">
              {/* Main Image Frame */}
              <div className="absolute inset-4 bg-white rounded-3xl shadow-2xl rotate-3 z-10 dark:bg-slate-800 opacity-50"></div>
              <div className="absolute inset-4 bg-sky-100 rounded-3xl -rotate-3 z-0 dark:bg-sky-900/30 opacity-50"></div>
              
              <div className="absolute inset-0 z-20 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="w-full h-full overflow-hidden rounded-2xl relative">
                    {image && (
                    <ResponsiveImage
                        src={image.src}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        priority={image.priority}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-1000"
                    />
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                </div>
              </div>

              {/* Floating Badge 1 */}
              <div className="absolute top-12 -left-6 z-30 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 animate-bounce-slow hidden sm:flex items-center gap-3 dark:bg-slate-800/90 dark:border-slate-700">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl dark:bg-green-900/30">🌿</div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">100% Organic</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Certified Safe</div>
                </div>
              </div>

              {/* Floating Badge 2 */}
              <div className="absolute bottom-16 -right-6 z-30 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 animate-bounce-slow delay-700 hidden sm:flex items-center gap-3 dark:bg-slate-800/90 dark:border-slate-700">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl dark:bg-yellow-900/30">🚚</div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Fast Delivery</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Nationwide Shipping</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
