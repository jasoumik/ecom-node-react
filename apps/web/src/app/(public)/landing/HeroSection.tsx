import type { HeroContent } from "./types";
import { HeroLayout, Heading, Text, Button, ResponsiveImage } from "@repo/ui";

export function HeroSection(props: HeroContent) {
  const { headline, subheadline, primaryCta, secondaryCta, image, stats } = props;

  return (
    <section className="relative w-full pt-12 pb-24 overflow-hidden bg-[#fff5f5] dark:bg-slate-950 transition-colors duration-300">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-rose-200/40 rounded-full blur-3xl dark:bg-rose-900/20"></div>
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-sky-200/40 rounded-full blur-3xl dark:bg-sky-900/20"></div>
        <div className="absolute bottom-0 left-[20%] w-[40%] h-[40%] bg-yellow-100/60 rounded-full blur-3xl dark:bg-yellow-900/20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-rose-100 text-rose-600 text-sm font-bold uppercase tracking-wider animate-fade-in-up dark:bg-slate-800 dark:border-slate-700 dark:text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              #1 Choice for New Moms
            </div>
            
            <Heading as="h1" size="xl" className="font-serif text-slate-900 dark:text-white leading-[1.1] text-5xl sm:text-6xl lg:text-7xl">
              {headline}
            </Heading>
            
            <Text className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
              {subheadline}
            </Text>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
              <Button className="px-10 py-5 text-lg rounded-full shadow-xl shadow-rose-500/20 bg-rose-500 text-white hover:bg-rose-600 hover:scale-105 transition-all duration-300 w-full sm:w-auto dark:shadow-rose-900/40">
                {primaryCta.label}
              </Button>
              {secondaryCta && (
                <Button variant="secondary" className="px-10 py-5 text-lg rounded-full bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 w-full sm:w-auto dark:bg-slate-800 dark:border-slate-700 dark:text-rose-300 dark:hover:bg-slate-700">
                  {secondaryCta.label}
                </Button>
              )}
            </div>

            {/* Stats Row */}
            {stats && stats.length > 0 && (
              <div className="flex items-center justify-center lg:justify-start gap-8 pt-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-2xl dark:bg-slate-800 dark:text-white">
                      🏆
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-bold text-slate-900 dark:text-white leading-none">
                        {stat.value}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mt-1">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hero Image with Floating Elements */}
          <div className="relative lg:h-[700px] flex items-center justify-center">
            <div className="relative w-full max-w-md lg:max-w-full aspect-[4/5] lg:aspect-auto lg:h-full">
              {/* Main Image Frame */}
              <div className="absolute inset-4 bg-white rounded-[3rem] shadow-2xl rotate-3 z-10 dark:bg-slate-800"></div>
              <div className="absolute inset-4 bg-rose-100 rounded-[3rem] -rotate-3 z-0 dark:bg-rose-900/30"></div>
              
              <div className="absolute inset-0 z-20 rounded-[3rem] overflow-hidden shadow-xl border-8 border-white dark:border-slate-800">
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
              </div>

              {/* Floating Badge 1 */}
              <div className="absolute top-12 -left-6 z-30 bg-white p-4 rounded-2xl shadow-xl border border-slate-50 animate-bounce-slow hidden sm:block dark:bg-slate-800 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl dark:bg-green-900/30">🌿</div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">100% Organic</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Certified Cotton</div>
                  </div>
                </div>
              </div>

              {/* Floating Badge 2 */}
              <div className="absolute bottom-20 -right-6 z-30 bg-white p-4 rounded-2xl shadow-xl border border-slate-50 animate-bounce-slow delay-700 hidden sm:block dark:bg-slate-800 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl dark:bg-yellow-900/30">👶</div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Safe for Baby</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Dermatologist Tested</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
