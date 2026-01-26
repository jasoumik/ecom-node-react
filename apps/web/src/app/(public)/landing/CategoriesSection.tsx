import { Section, Heading, ResponsiveImage } from "@repo/ui";
import type { Category } from "./types";

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <Section className="py-16 bg-white dark:bg-slate-950">
      <div className="text-center mb-12">
        <Heading size="lg" className="font-sans text-slate-900 dark:text-white mb-2 font-bold">Shop by Category</Heading>
        <p className="text-slate-500 dark:text-slate-400">Find everything you need for your little one.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
        {categories.map((category) => (
          <a 
            key={category.id} 
            href={`/products?category=${category.id}`}
            className="group flex flex-col items-center text-center"
          >
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 relative">
                <ResponsiveImage
                    src={category.image}
                    alt={category.name}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            </div>
            <h3 className="mt-4 font-bold text-slate-900 dark:text-white text-lg group-hover:text-sky-500 transition-colors">{category.name}</h3>
          </a>
        ))}
      </div>
    </Section>
  );
}
