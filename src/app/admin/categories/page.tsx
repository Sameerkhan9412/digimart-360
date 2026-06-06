import { getCategories } from "src/app/actions/categoryActions"
import CategoriesManager from "src/components/dashboard/CategoriesManager"

export default async function AdminCategoriesPage() {
  const categoriesList = await getCategories()

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div className="border-b border-slate-100 pb-5 shrink-0">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sans">
          Trade Categories Directory
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Add industrial sector hierarchies, nest subcategories, and append custom specifications templates.
        </p>
      </div>

      <CategoriesManager initialCategories={categoriesList} />

    </div>
  )
}
