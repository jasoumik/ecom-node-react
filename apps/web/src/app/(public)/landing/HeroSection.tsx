import type { HeroContent } from "./types";
import { HeroLayout, Heading, Text, Button, ResponsiveImage } from "@repo/ui";

export function HeroSection(props: HeroContent) {
  const { headline, subheadline, primaryCta, secondaryCta, image, stats } = props;

  return (
    <section className="relative w-full pt-8 pb-16 overflow-hidden bg-[#f0f9ff] dark:bg-slate-950 transition-colors duration-300">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-sky-200/40 rounded-full blur-3xl dark:bg-sky-900/20"></div>
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-3xl dark:bg-blue-900/20"></div>
        <div className="absolute bottom-0 left-[20%] w-[40%] h-[40%] bg-cyan-100/60 rounded-full blur-3xl dark:bg-cyan-900/20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6 text-center lg:text-left w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white shadow-sm border border-sky-100 text-sky-600 text-xs font-bold uppercase tracking-wider animate-fade-in-up dark:bg-slate-800 dark:border-slate-700 dark:text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              #1 Choice for Moms & Babies
            </div>
            
            <Heading as="h1" size="xl" className="font-sans text-slate-900 dark:text-white leading-[1.1] text-4xl sm:text-5xl lg:text-6xl font-bold">
              {headline}
            </Heading>
            
            <Text className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
              {subheadline}
            </Text>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <a href={primaryCta.href} className="w-full sm:w-auto">
                <Button className="px-8 py-4 text-base rounded-md shadow-xl shadow-sky-500/20 bg-sky-500 text-white hover:bg-sky-600 hover:scale-105 transition-all duration-300 w-full dark:shadow-sky-900/40 font-bold">
                  {primaryCta.label}
                </Button>
              </a>
            </div>

            {/* Stats Row */}
            {stats && stats.length > 0 && (
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-md bg-white shadow-md flex items-center justify-center text-xl dark:bg-slate-800 dark:text-white">
                      🏆
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                        {stat.value}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mt-0.5">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hero Image with Floating Elements */}
          <div className="relative lg:h-[500px] flex items-center justify-center w-full">
            <div className="relative w-full max-w-md lg:max-w-full aspect-[4/5] lg:aspect-auto lg:h-full">
              {/* Main Image Frame */}
              <div className="absolute inset-3 bg-white rounded-md shadow-2xl rotate-3 z-10 dark:bg-slate-800"></div>
              <div className="absolute inset-3 bg-sky-100 rounded-md -rotate-3 z-0 dark:bg-sky-900/30"></div>
              
              <div className="absolute inset-0 z-20 rounded-md overflow-hidden shadow-xl border-4 border-white dark:border-slate-800">
                <div className="w-full h-full overflow-hidden rounded-md">
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
              </div>

              {/* Floating Badge 1 */}
              <div className="absolute top-8 -left-4 z-30 bg-white p-3 rounded-md shadow-xl border border-slate-50 animate-bounce-slow hidden sm:block dark:bg-slate-800 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-lg dark:bg-green-900/30">🏷️</div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Top Brands</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">100% Authentic</div>
                  </div>
                </div>
              </div>

              {/* Floating Badge 2 */}
              <div className="absolute bottom-12 -right-4 z-30 bg-white p-3 rounded-md shadow-xl border border-slate-50 animate-bounce-slow delay-700 hidden sm:block dark:bg-slate-800 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-lg dark:bg-yellow-900/30">🚚</div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Fast Delivery</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Nationwide Shipping</div>
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
