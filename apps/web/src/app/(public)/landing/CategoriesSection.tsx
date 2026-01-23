import { Section, Heading, ResponsiveImage } from "@repo/ui";
import type { Category } from "./types";

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <Section className="py-16 transition-colors duration-300 !bg-sky-100 dark:!bg-slate-900">
      <div className="text-center mb-12">
        <Heading size="lg" className="font-sans text-4xl text-slate-900 dark:text-white font-bold">Shop by Category</Heading>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
        {categories.map((cat) => (
          <div key={cat.id} className="group cursor-pointer text-center">
            <a href={`/products?category=${cat.id}`} className="block">
                <div className="relative aspect-square rounded-md overflow-hidden mb-4 border-4 border-white shadow-lg group-hover:border-sky-200 transition-colors duration-300 dark:border-slate-800 dark:group-hover:border-sky-900">
                <ResponsiveImage
                    src={cat.image}
                    alt={cat.name}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-500 transition-colors dark:text-white dark:group-hover:text-sky-400">
                {cat.name}
                </h3>
            </a>
          </div>
        ))}
      </div>
    </Section>
  );
}
