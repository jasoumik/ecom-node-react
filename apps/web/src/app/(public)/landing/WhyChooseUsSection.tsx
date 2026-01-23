import type { WhyReason } from "./types";
import { Section, Heading, Text, ResponsiveImage } from "@repo/ui";

interface WhyChooseUsSectionProps {
  title: string;
  reasons: WhyReason[];
}

export function WhyChooseUsSection({ title, reasons }: WhyChooseUsSectionProps) {
  return (
    <Section className="py-16 relative overflow-hidden transition-colors duration-300 bg-white dark:bg-slate-900">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 dark:bg-yellow-900/20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 dark:bg-sky-900/20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white shadow-sm border border-sky-100 text-sky-600 text-sm font-bold uppercase tracking-wider animate-fade-in-up dark:bg-slate-800 dark:border-slate-700 dark:text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            Our Promise
          </div>
          <Heading size="lg" className="font-sans text-3xl sm:text-5xl text-slate-900 leading-tight dark:text-white font-bold">
            {title}
          </Heading>
          <Text className="text-lg text-slate-600 leading-relaxed dark:text-slate-300 font-medium">
            We believe in products that are safe for your baby, nurturing for mom, and kind to the planet.
          </Text>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {reasons.map((reason, index) => (
            <div key={reason.id} className="bg-white p-6 rounded-md shadow-xl shadow-slate-200/40 border border-slate-100 hover:-translate-y-2 transition-transform duration-300 group dark:bg-slate-800 dark:border-slate-700 dark:shadow-none">
              <div className="w-16 h-16 rounded-md bg-sky-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 rotate-3 group-hover:rotate-0 dark:bg-sky-900/30">
                <div className="text-3xl">
                  {index === 0 ? '🛡️' : index === 1 ? '🌱' : '🤝'}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-sans mb-3 group-hover:text-sky-500 transition-colors dark:text-white dark:group-hover:text-sky-400">
                {reason.title}
              </h3>
              <Text className="text-slate-600 leading-relaxed dark:text-slate-400 text-sm">
                {reason.description}
              </Text>
            </div>
          ))}
        </div>

        {/* Bottom Image Banner */}
        <div className="mt-16 relative rounded-md overflow-hidden h-[300px] shadow-2xl dark:shadow-none dark:border dark:border-slate-700">
          <ResponsiveImage
            src="https://picsum.photos/seed/family/1200/600"
            alt="Happy family"
            width={1200}
            height={600}
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-[2s]"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-md dark:bg-slate-900/90">
              <span className="text-base font-bold text-slate-900 font-sans dark:text-white">Join 50,000+ Happy Families</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
