import { CATEGORIES } from "../constants";

interface CategoryFiltersProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilters({
  activeCategory,
  onCategoryChange,
}: CategoryFiltersProps) {
  return (
    <section className="mb-12">
      <div className="flex flex-wrap justify-center gap-4">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center gap-2 rounded-full px-6 py-3 text-lg font-medium shadow-md ring-2 ring-transparent transition-all active:scale-95 focus:ring-primary ${
              activeCategory === category.id
                ? "bg-text-main text-white"
                : "bg-section-bg text-text-main hover:bg-gray-200"
            }`}
          >
            <span
              className={`material-symbols-outlined ${
                activeCategory === category.id ? "text-white" : category.color
              }`}
            >
              {category.icon}
            </span>
            {category.name}
          </button>
        ))}
      </div>
    </section>
  );
}
