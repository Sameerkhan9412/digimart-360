import Link from "next/link"
import { notFound } from "next/navigation"
import Navbar from "src/components/Navbar"
import Footer from "src/components/Footer"
import ProductImageGallery from "src/components/ProductImageGallery"
import ProductInquiryForm from "src/components/ProductInquiryForm"
import InlineProfileComplete from "src/components/dashboard/InlineProfileComplete"
import { getProductBySlug } from "src/app/actions/productActions"
import { getProductReviews } from "src/app/actions/reviewActions"
import { getCurrentUser } from "src/app/actions/authActions"
import { Product } from "src/lib/database/models/Product"
import { connectDB } from "src/lib/database/db"
import {
  MapPin,
  CheckCircle,
  ShieldCheck,
  Building,
  Phone,
  MessageCircle,
  FileText,
  Star,
  ChevronRight,
  Sparkles,
  Award,
} from "lucide-react"

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    inquiry?: string
  }>
}

export default async function ProductDetailsPage({ params, searchParams }: ProductPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  const currentUser = await getCurrentUser()
  const product = await getProductBySlug(resolvedParams.slug)
  if (!product) {
    notFound()
  }

  // Fetch verified buyer reviews
  const reviewsResult = await getProductReviews(product._id.toString())
  const reviews = reviewsResult.success ? reviewsResult.reviews || [] : []

  // Fetch similar products in the same category, sibling categories, or general catalog fallback
  let similarProducts: any[] = []
  try {
    await connectDB()
    const { Category } = require("src/lib/database/models/Category")
    
    // 1. Try exact category match
    let dbSim = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
    })
      .select("name price unit minOrderQuantity images slug isSponsored")
      .limit(4)
      .lean()
    
    // 2. Sibling category fallback (sharing the same parent category)
    if (dbSim.length < 4 && product.category?.parentCategory) {
      const siblingCategories = await Category.find({ parentCategory: product.category.parentCategory }).select("_id").lean()
      const siblingIds = siblingCategories.map((c: any) => c._id)
      
      const additional = await Product.find({
        category: { $in: siblingIds },
        _id: { $ne: product._id, $nin: dbSim.map(p => p._id) },
      })
        .select("name price unit minOrderQuantity images slug isSponsored")
        .limit(4 - dbSim.length)
        .lean()
      
      dbSim = [...dbSim, ...additional]
    }
    
    // 3. Global catalog fallback if we still don't have 4 products
    if (dbSim.length < 4) {
      const existingIds = [product._id, ...dbSim.map(p => p._id)]
      const fallback = await Product.find({
        _id: { $nin: existingIds },
      })
        .select("name price unit minOrderQuantity images slug isSponsored")
        .limit(4 - dbSim.length)
        .lean()
      
      dbSim = [...dbSim, ...fallback]
    }
    
    similarProducts = JSON.parse(JSON.stringify(dbSim))
  } catch (e) {
    console.error("Error loading similar products:", e)
  }

  const hasInquiryTrigger = resolvedSearchParams.inquiry === "true"

  const displayPrice = product.price.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })

  // WhatsApp click-to-chat URL formation
  const cleanPhone = product.seller?.contactInfo?.whatsapp || product.seller?.contactInfo?.phone || ""
  const whatsappNumber = cleanPhone.replace(/[^0-9]/g, "")
  const whatsappUrl = `https://wa.me/${whatsappNumber.startsWith("91") ? whatsappNumber : "91" + whatsappNumber}?text=Hi,%20I%20am%20interested%20in%20your%20product:%20${encodeURIComponent(product.name)}.%20Please%20provide%20pricing%20details.`

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-primary transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link href="/search" className="hover:text-primary transition">Directory</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link href={`/search?category=${product.category?.slug}`} className="hover:text-primary transition">
            {product.category?.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-slate-600 truncate">{product.name}</span>
        </div>

        {/* Product split view */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* Left: Gallery & video */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            <ProductImageGallery images={product.images || []} productName={product.name} />

            {/* Video container if available */}
            {product.videoUrl && (
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shrink-0">
                <h4 className="font-bold text-slate-800 text-xs tracking-wider uppercase mb-3 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0"></span>
                  Product Video Showcase
                </h4>
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-200">
                  <iframe
                    src={product.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title={`${product.name} Video`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Center: Specs, About */}
          <div className="lg:col-span-4 flex flex-col gap-8 w-full">
            
            {/* Title & Badge block */}
            <div>
              {product.isSponsored && (
                <span className="inline-block px-2.5 py-0.5 rounded bg-accent text-white text-[9px] font-extrabold uppercase tracking-widest mb-3">
                  Sponsored Listing
                </span>
              )}
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-3 mt-4 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-0.5">
                  <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-500" />
                  <span className="text-slate-800 font-extrabold">{product.rating > 0 ? product.rating : "No ratings"}</span>
                  {product.reviewsCount > 0 ? (
                    <span className="text-slate-400 font-medium">({product.reviewsCount} {product.reviewsCount === 1 ? 'Review' : 'Reviews'})</span>
                  ) : (
                    <span className="text-slate-450 italic">(New Catalog Item)</span>
                  )}
                </div>
                <span className="w-px h-3.5 bg-slate-200"></span>
                <span className="text-primary flex items-center gap-0.5 font-bold uppercase tracking-wide">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>
            </div>

            {/* Pricing Details Panel */}
            <div className="p-5 bg-gradient-to-tr from-slate-50 to-white rounded-2xl border border-slate-100 flex items-center justify-between gap-4 shrink-0">
              <div>
                <span className="text-xs text-slate-400 font-semibold">Wholesale Pricing Range</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  {displayPrice} <span className="text-xs font-medium text-slate-500 font-sans">/ {product.unit}</span>
                </div>
              </div>
              <div className="text-right border-l border-slate-200 pl-4 shrink-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Min Order Qty</span>
                <span className="text-sm font-extrabold text-slate-800 mt-1 block">
                  {product.minOrderQuantity} {product.unit}s
                </span>
              </div>
            </div>

            {/* Dynamic specifications table */}
            {product.customAttributes && Object.keys(product.customAttributes).length > 0 && (
              <div className="shrink-0">
                <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" />
                  Product Specifications
                </h3>
                <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-xs text-left text-slate-700">
                    <tbody>
                      {Object.entries(product.customAttributes).map(([key, val]: any, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-bold text-slate-500 bg-slate-50/50 w-1/3 truncate">{key}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {Array.isArray(val) ? val.join(", ") : val.toString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Product description */}
            <div className="shrink-0">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase mb-3 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-primary" />
                Product Details
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-white/50 p-4 border border-slate-100 rounded-2xl">
                {product.description}
              </p>
            </div>

          </div>

          {/* Right: Seller card & RFQ form */}
          <div className="lg:col-span-3 flex flex-col gap-6 w-full lg:sticky lg:top-20">
            
            {/* Supplier Information Panel */}
            <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm shrink-0">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Supplier Profile</h5>
              
              <div className="flex items-center gap-3 mt-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border overflow-hidden flex items-center justify-center shrink-0">
                  <img src={product.seller?.logo || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=100&auto=format&fit=crop"} alt={product.seller?.companyName} className="w-8 h-8 object-contain" />
                </div>
                <div className="overflow-hidden">
                  <Link
                    href={`/store/${product.seller?.slug}`}
                    className="font-bold text-slate-800 hover:text-primary transition truncate block text-sm sm:text-base"
                  >
                    {product.seller?.companyName}
                  </Link>
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{product.seller?.contactInfo?.address || "India"}</span>
                  </span>
                </div>
              </div>

              {/* Trust parameters */}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <span>Verified Manufacturer Badge</span>
                </div>
                {product.seller?.certifications && product.seller.certifications.length > 0 && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <Award className="w-4 h-4 text-secondary shrink-0" />
                    <span className="truncate">{product.seller.certifications.slice(0, 2).join(", ")}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-6">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                  WhatsApp
                </a>
                <a
                  href={`tel:${product.seller?.contactInfo?.phone}`}
                  className="flex items-center justify-center gap-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  Call Seller
                </a>
              </div>
            </div>

            {/* Inquiry form container */}
            <div id="inquiry-form-section">
              {currentUser ? (
                currentUser.phone ? (
                  <ProductInquiryForm
                    sellerId={product.seller?._id.toString()}
                    productId={product._id.toString()}
                    productName={product.name}
                    minQty={product.minOrderQuantity}
                    unit={product.unit}
                    buyerUser={currentUser}
                  />
                ) : (
                  <InlineProfileComplete user={currentUser} />
                )
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm sm:text-base">Unlock Wholesale Pricing</h4>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-2 leading-relaxed">
                    Sign in to your corporate buyer account to contact the supplier and request direct pricing quotes.
                  </p>
                  <Link
                    href={`/auth/login?redirect=/product/${product.slug}`}
                    className="w-full text-center py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-extrabold tracking-wide mt-6 transition shadow-md shadow-primary/10"
                  >
                    Sign In to Request Quote
                  </Link>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Customer Reviews Section */}
        <section className="mt-16 pt-12 border-t border-slate-100 dark:border-slate-800 w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Verified Buyer Reviews</h3>
              <p className="text-xs text-slate-400 mt-1">Direct feedback from verified wholesale purchasers.</p>
            </div>
            
            {product.reviewsCount > 0 && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 dark:border-slate-805 px-4 py-2 rounded-xl">
                <span className="text-xl font-extrabold text-slate-800">{product.rating}</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isLit = star <= Math.round(product.rating)
                      return <Star key={star} className={`w-3.5 h-3.5 ${isLit ? "fill-amber-400 text-amber-400" : "text-slate-250 dark:text-slate-705"}`} />
                    })}
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    {product.reviewsCount} Verified {product.reviewsCount === 1 ? 'Review' : 'Reviews'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-950/20 border dark:border-slate-800 flex items-center justify-center text-slate-350 mx-auto mb-4">
                <Star className="w-5 h-5 text-slate-400" />
              </div>
              <h4 className="font-extrabold text-slate-700 dark:text-slate-200 text-sm">No reviews yet</h4>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                Be the first to review this manufacturer after your trade negotiation is marked as won.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((rev: any) => {
                const initials = rev.buyerName.substring(0, 2).toUpperCase()
                return (
                  <div key={rev._id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col gap-3.5">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center uppercase shrink-0">
                          {initials}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">{rev.buyerName}</h5>
                          <span className="text-[9px] text-slate-400 font-semibold">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 bg-amber-50/50 dark:bg-amber-950/20 px-2.5 py-1 rounded-lg border border-amber-100/50 dark:border-amber-950/30">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isLit = star <= rev.rating
                          return <Star key={star} className={`w-3.5 h-3.5 ${isLit ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-750"}`} />
                        })}
                      </div>
                    </div>
                    <p className="text-xs text-white text-slate-650 leading-relaxed italic p-3 border border-slate-50 rounded-xl">
                      "{rev.comment}"
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Similar Recommendations Section */}
        {similarProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-slate-100 w-full">
            <h3 className="text-lg font-extrabold text-slate-900 mb-8">Similar Sourcing Recommendations</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((prod: any, i: number) => {
                const priceStr = prod.price.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
                return (
                  <div key={i} className="group border border-slate-100 rounded-2xl hover:shadow-lg transition overflow-hidden bg-white">
                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden shrink-0">
                      <img src={prod.images?.[0]} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-4 flex flex-col">
                      <Link href={`/product/${prod.slug}`} className="font-bold text-slate-800 text-xs sm:text-sm hover:text-primary transition line-clamp-2 min-h-[40px] leading-tight">
                        {prod.name}
                      </Link>
                      <div className="flex items-baseline justify-between mt-3">
                        <span className="font-extrabold text-sm text-slate-900">{priceStr}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Min Qty: {prod.minOrderQuantity}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

      </main>

      {/* Sticky Bottom Actions Bar (Mobile First Adaptive Layout) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 p-3 flex gap-3 lg:hidden shadow-2xl">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-extrabold tracking-wide transition"
        >
          <MessageCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
          WhatsApp Seller
        </a>
        <a
          href="#inquiry-form-section"
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-extrabold tracking-wide transition shadow-md shadow-accent/15"
        >
          Get Best Quote
        </a>
      </div>

      <Footer />
    </div>
  )
}
