import { getSellerProfile } from "src/app/actions/storefrontActions"
import { getCategories } from "src/app/actions/categoryActions"
import { Product } from "src/lib/database/models/Product"
import CatalogManager from "src/components/dashboard/CatalogManager"
import { connectDB } from "src/lib/database/db"
import { redirect } from "next/navigation"

export default async function SellerProductsPage() {
  const seller = await getSellerProfile()

  if (!seller) {
    redirect("/auth/login")
  }

  let productsList: any[] = []
  let categoriesList: any[] = []

  try {
    await connectDB()
    const [dbProducts, dbCategories] = await Promise.all([
      Product.find({ seller: seller._id }).sort({ createdAt: -1 }).lean(),
      getCategories(),
    ])

    productsList = JSON.parse(JSON.stringify(dbProducts))
    categoriesList = dbCategories
  } catch (err) {
    console.error("Error loading products catalog lists:", err)
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div className="border-b border-slate-100 pb-5 shrink-0">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sans">
          Trade Catalog Management
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Publish industrial catalog listings, map dynamic specification attributes, and leverage AI copywriters.
        </p>
      </div>

      <CatalogManager initialProducts={productsList} categories={categoriesList} />

    </div>
  )
}
