import Link from "next/link"
import Navbar from "src/components/Navbar"
import Footer from "src/components/Footer"
import { queryProducts } from "src/app/actions/productActions"
import { getCategories } from "src/app/actions/categoryActions"
import { Search, MapPin, CheckCircle, SlidersHorizontal, ChevronRight, X } from "lucide-react"

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    location?: string
    minPrice?: string
    maxPrice?: string
    minQty?: string
    verified?: string
    rating?: string
    page?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams
  
  // Parse search filters
  const q = resolvedParams.q || ""
  const category = resolvedParams.category || ""
  const location = resolvedParams.location || ""
  const minPrice = resolvedParams.minPrice ? parseFloat(resolvedParams.minPrice) : undefined
  const maxPrice = resolvedParams.maxPrice ? parseFloat(resolvedParams.maxPrice) : undefined
  const minQty = resolvedParams.minQty ? parseInt(resolvedParams.minQty) : undefined
  const verified = resolvedParams.verified === "true"
  const rating = resolvedParams.rating ? parseFloat(resolvedParams.rating) : undefined
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1

  // 1. Fetch data in parallel on the server
  const [categories, searchResults] = await Promise.all([
    getCategories(),
    queryProducts({
      q,
      category,
      location,
      minPrice,
      maxPrice,
      minQty,
      verified,
      rating,
      page,
      limit: 12,
    }),
  ])

  const { products, total, pages, currentPage } = searchResults

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        
        {/* Breadcrumb / Headline */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Link href="/" className="hover:text-primary transition">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-600">Trade Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {q ? `Sourcing results for "${q}"` : "Global Supply Directory"}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Found {total} matched products from verified manufacturers.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
              Showing {(currentPage - 1) * 12 + 1} - {Math.min(currentPage * 12, total)} of {total}
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          
          {/* Filtering Sidebar - Server Component Form */}
          <aside className="w-full lg:w-64 bg-white border border-slate-100 rounded-2xl p-6 shrink-0 lg:sticky lg:top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                Filters Drawer
              </h3>
              <Link href="/search" className="text-xs font-bold text-rose-500 hover:underline">
                Clear All
              </Link>
            </div>

            <form action="/search" method="GET" className="flex flex-col gap-6">
              
              {/* Maintain keyword search */}
              {q && <input type="hidden" name="q" value={q} />}

              {/* Category selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</label>
                <select
                  name="category"
                  defaultValue={category}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat: any) => (
                    <option key={cat._id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seller Location */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Supplier City</label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    defaultValue={location}
                    placeholder="E.g. Pune, Noida"
                    className="w-full text-xs font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  />
                  <MapPin className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Price Range */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Price Tier (INR)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    defaultValue={resolvedParams.minPrice || ""}
                    placeholder="Min"
                    className="w-1/2 text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none text-center focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  />
                  <span className="text-slate-300 text-xs">-</span>
                  <input
                    type="number"
                    name="maxPrice"
                    defaultValue={resolvedParams.maxPrice || ""}
                    placeholder="Max"
                    className="w-1/2 text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none text-center focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  />
                </div>
              </div>

              {/* MoQ */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Max MoQ</label>
                <input
                  type="number"
                  name="minQty"
                  defaultValue={resolvedParams.minQty || ""}
                  placeholder="E.g. 50"
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                />
              </div>

              {/* Verified Supplier Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="verified"
                  value="true"
                  id="verified-checkbox"
                  defaultChecked={verified}
                  className="w-4.5 h-4.5 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label htmlFor="verified-checkbox" className="text-xs font-bold text-slate-600 select-none cursor-pointer">
                  Verified Exporters Only
                </label>
              </div>

              {/* Apply Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-extrabold tracking-wide transition shadow-md shadow-primary/15"
              >
                Apply Sourcing Filters
              </button>

            </form>
          </aside>

          {/* Catalog grid */}
          <div className="flex-1 w-full">
            {products.length === 0 ? (
              
              /* Beautiful Empty State */
              <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl p-8 flex flex-col items-center max-w-lg mx-auto">
                <div className="w-16 h-16 bg-slate-50 border border-dashed rounded-full flex items-center justify-center text-slate-400 mb-6">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-800">No products match your criteria</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  We couldn't find any listings matching your search. Try clearing some filters or post a sourcing inquiry to request pricing details from suppliers.
                </p>
                <div className="flex gap-3 mt-8">
                  <Link
                    href="/search"
                    className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
                  >
                    Clear All Filters
                  </Link>
                  <Link
                    href="/buyer/inquiries/new"
                    className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold transition"
                  >
                    Post Sourcing Inquiry (RFQ)
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                
                {/* Catalog Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((prod: any, idx: number) => {
                    const displayPrice = prod.price.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
                    return (
                      <div
                        key={idx}
                        className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:shadow-xl hover:shadow-slate-100/30 hover:border-slate-200 transition-all duration-300 overflow-hidden relative"
                      >
                        {prod.isSponsored && (
                          <span className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-accent text-white text-[9px] font-extrabold rounded uppercase tracking-wider">
                            Sponsored
                          </span>
                        )}

                        {/* Image Container */}
                        <div className="aspect-[4/3] w-full bg-slate-100 relative overflow-hidden shrink-0">
                          <img
                            src={prod.images?.[0] || "https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=400&auto=format&fit=crop"}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Contents */}
                        <div className="p-4 flex flex-col flex-1">
                          
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                            <span className="truncate max-w-[120px]">
                              {prod.category?.name || "Premium Wholesale"}
                            </span>
                            {prod.seller?.isVerified && (
                              <span className="text-emerald-500 flex items-center gap-0.5 font-extrabold uppercase tracking-wide">
                                <CheckCircle className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/product/${prod.slug}`}
                            className="font-bold text-slate-800 dark:text-slate-200 text-sm hover:text-primary transition line-clamp-2 min-h-[40px] leading-tight"
                          >
                            {prod.name}
                          </Link>

                          {/* Price and MOQ stats */}
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between gap-1">
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-400 font-semibold">Wholesale Price</span>
                              <span className="text-md sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                                {displayPrice} <span className="text-xs text-slate-400 font-medium font-sans">/ {prod.unit}</span>
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] block text-slate-400 font-semibold uppercase tracking-wider">Min. Order</span>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {prod.minOrderQuantity} {prod.unit}s
                              </span>
                            </div>
                          </div>

                          {/* Supplier details card */}
                          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/20 flex flex-col gap-1 mt-4">
                            <Link
                              href={`/store/${prod.seller?.slug}`}
                              className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-primary transition truncate"
                            >
                              {prod.seller?.companyName || "Verified Partner"}
                            </Link>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">
                                {prod.seller?.contactInfo?.address || "India"}
                              </span>
                            </div>
                          </div>

                          {/* Action button */}
                          <Link
                            href={`/product/${prod.slug}?inquiry=true`}
                            className="w-full text-center py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-extrabold tracking-wide mt-4 shadow-sm shadow-accent/10 transition-colors shrink-0"
                          >
                            Get Best Price
                          </Link>

                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination Controls */}
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    {Array.from({ length: pages }).map((_, pageIdx) => {
                      const pageNum = pageIdx + 1
                      const isActive = pageNum === currentPage

                      // Build href
                      const pageParams = new URLSearchParams()
                      if (q) pageParams.set("q", q)
                      if (category) pageParams.set("category", category)
                      if (location) pageParams.set("location", location)
                      if (resolvedParams.minPrice) pageParams.set("minPrice", resolvedParams.minPrice)
                      if (resolvedParams.maxPrice) pageParams.set("maxPrice", resolvedParams.maxPrice)
                      if (resolvedParams.minQty) pageParams.set("minQty", resolvedParams.minQty)
                      if (verified) pageParams.set("verified", "true")
                      pageParams.set("page", pageNum.toString())

                      return (
                        <Link
                          key={pageNum}
                          href={`/search?${pageParams.toString()}`}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold border transition ${
                            isActive
                              ? "bg-primary text-white border-primary"
                              : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          {pageNum}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
