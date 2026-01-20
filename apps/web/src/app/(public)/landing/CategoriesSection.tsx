import { Section, Heading, ResponsiveImage } from "@repo/ui";
import type { Category } from "./types";

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <Section className="py-16 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="text-center mb-12">
        <Heading size="lg" className="font-serif text-4xl text-slate-900 dark:text-white">Shop by Category</Heading>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
        {categories.map((cat) => (
          <div key={cat.id} className="group cursor-pointer text-center">
            <div className="relative aspect-square rounded-full overflow-hidden mb-4 border-4 border-slate-50 shadow-lg group-hover:border-rose-100 transition-colors duration-300 dark:border-slate-800 dark:group-hover:border-rose-900">
              <ResponsiveImage
                src={cat.image}
                alt={cat.name}
                width={300}
                height={300}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-500 transition-colors dark:text-white dark:group-hover:text-rose-400">
              {cat.name}
            </h3>
          </div>
        ))}
      </div>
    </Section>
  );
}
