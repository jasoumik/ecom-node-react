import { Section, Heading, ResponsiveImage } from "@repo/ui";
import type { Category } from "./types";

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <Section className="py-12 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="text-center mb-8">
        <Heading size="lg" className="font-sans text-3xl text-slate-900 dark:text-white font-bold">Shop by Category</Heading>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl mx-auto px-4">
        {categories.map((cat) => (
          <div key={cat.id} className="group cursor-pointer text-center">
            <a href={`/products?category=${cat.id}`} className="block">
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 border-2 border-slate-50 shadow-md group-hover:border-sky-100 transition-colors duration-300 dark:border-slate-800 dark:group-hover:border-sky-900">
                <ResponsiveImage
                    src={cat.image}
                    alt={cat.name}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-500 transition-colors dark:text-white dark:group-hover:text-sky-400">
                {cat.name}
                </h3>
            </a>
          </div>
        ))}
      </div>
    </Section>
  );
}
