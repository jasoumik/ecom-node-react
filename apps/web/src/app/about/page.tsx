import { Heading, Text, Section, ResponsiveImage } from "@repo/ui";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <div className="relative py-20 bg-sky-50 dark:bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Heading size="xl" className="font-sans text-slate-900 dark:text-white mb-6 font-bold">About Prithibee</Heading>
          <Text className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We are on a mission to provide the safest, most comfortable, and sustainable products for mothers and babies across Bangladesh.
          </Text>
        </div>
      </div>

      {/* Story Section */}
      <Section>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
            <ResponsiveImage 
                src="https://picsum.photos/seed/baby/800/800" 
                alt="Happy Baby" 
                width={800} 
                height={800} 
                className="object-cover w-full h-full"
            />
          </div>
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider dark:bg-sky-900/30 dark:text-sky-400">
              Our Story
            </div>
            <Heading size="lg" className="font-sans text-slate-900 dark:text-white font-bold">Born from Love, Built for Trust</Heading>
            <Text className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Prithibee started with a simple question: "Why is it so hard to find genuine, safe baby products?" 
              As parents ourselves, we understood the anxiety of choosing the right diaper, the right lotion, or the right food for our little ones.
            </Text>
            <Text className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We decided to change that. We curate only the best global and local brands, ensuring every item on our shelf meets strict safety standards. 
              Because your baby deserves the world (Prithibee).
            </Text>
          </div>
        </div>
      </Section>

      {/* Values Section */}
      <Section className="bg-slate-50 dark:bg-slate-900/50">
        <div className="text-center mb-16">
            <Heading size="lg" className="font-sans text-slate-900 dark:text-white mb-4 font-bold">Our Core Values</Heading>
            <Text className="text-slate-600 dark:text-slate-400">The principles that guide everything we do.</Text>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
            {[
                { icon: "🛡️", title: "Safety First", desc: "We never compromise on quality. Every product is vetted for safety." },
                { icon: "🌱", title: "Sustainability", desc: "We prioritize eco-friendly and organic options for a better future." },
                { icon: "🤝", title: "Community", desc: "We are more than a shop; we are a community of parents supporting parents." }
            ].map((value, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-16 h-16 bg-sky-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto shadow-inner">
                        {value.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{value.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{value.desc}</p>
                </div>
            ))}
        </div>
      </Section>

      {/* Team/Contact CTA */}
      <Section>
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <Heading size="xl" className="font-sans font-bold text-white">Join the Prithibee Family</Heading>
                <p className="text-sky-100 text-lg">
                    Have questions or suggestions? We'd love to hear from you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <a href="/contact" className="inline-block bg-white text-sky-600 px-8 py-3 rounded-xl font-bold hover:bg-sky-50 transition-colors shadow-lg">
                        Contact Us
                    </a>
                    <a href="/products" className="inline-block bg-sky-600 text-white border border-sky-400 px-8 py-3 rounded-xl font-bold hover:bg-sky-700 transition-colors">
                        Start Shopping
                    </a>
                </div>
            </div>
        </div>
      </Section>
    </div>
  );
}
