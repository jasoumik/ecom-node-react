import type { WhyReason } from "./types";
import { Section, Heading, Text, ResponsiveImage } from "@repo/ui";

interface WhyChooseUsSectionProps {
  title: string;
  reasons: WhyReason[];
}

export function WhyChooseUsSection({ title, reasons }: WhyChooseUsSectionProps) {
  return (
    <Section className="py-32 bg-white relative overflow-hidden dark:bg-slate-900 transition-colors duration-300" style={{ backgroundColor: '' }}>
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 dark:bg-yellow-900/20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 dark:bg-rose-900/20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold uppercase tracking-widest border border-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800">
            Our Promise
          </div>
          <Heading size="lg" className="font-serif text-5xl sm:text-6xl text-slate-900 leading-tight dark:text-white">
            {title}
          </Heading>
          <Text className="text-xl text-slate-600 leading-relaxed dark:text-slate-300">
            We believe in products that are safe for your baby, kind to the planet, and designed for real life.
          </Text>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {reasons.map((reason, index) => (
            <div key={reason.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 hover:-translate-y-2 transition-transform duration-300 group dark:bg-slate-800 dark:border-slate-700 dark:shadow-none">
              <div className="w-20 h-20 rounded-2xl bg-rose-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 rotate-3 group-hover:rotate-0 dark:bg-rose-900/30">
                <div className="text-4xl">
                  {index === 0 ? '🛡️' : index === 1 ? '🌱' : '🤝'}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-serif mb-4 group-hover:text-rose-500 transition-colors dark:text-white dark:group-hover:text-rose-400">
                {reason.title}
              </h3>
              <Text className="text-slate-600 leading-relaxed dark:text-slate-400">
                {reason.description}
              </Text>
            </div>
          ))}
        </div>

        {/* Bottom Image Banner */}
        <div className="mt-24 relative rounded-[3rem] overflow-hidden h-[400px] shadow-2xl dark:shadow-none dark:border dark:border-slate-700">
          <ResponsiveImage
            src="https://picsum.photos/seed/family/1200/600"
            alt="Happy family"
            width={1200}
            height={600}
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-[2s]"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-md px-8 py-4 rounded-full dark:bg-slate-900/90">
              <span className="text-lg font-bold text-slate-900 font-serif dark:text-white">Join 50,000+ Happy Families</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
