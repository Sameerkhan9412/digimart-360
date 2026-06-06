import Link from "next/link"
import Navbar from "src/components/Navbar"
import Footer from "src/components/Footer"
import ProductSlider from "src/components/ProductSlider"
import { connectDB } from "src/lib/database/db"
import { Product } from "src/lib/database/models/Product"
import { Category } from "src/lib/database/models/Category"
import { Seller } from "src/lib/database/models/Seller"
import {
  Search,
  CheckCircle,
  ShieldCheck,
  Zap,
  Building,
  TrendingUp,
  Award,
  ChevronRight,
  ArrowRight,
  MapPin,
  MessageSquare,
  Phone,
  HelpCircle,
} from "lucide-react"

// Premium high-res mock data for fallback
const MOCK_CATEGORIES = [
  { name: "Industrial Machinery", slug: "machinery", count: "12,400+ Products", icon: Zap, color: "from-amber-500 to-orange-600" },
  { name: "Medical & Healthcare", slug: "medical", count: "8,900+ Products", icon: CheckCircle, color: "from-emerald-500 to-teal-600" },
  { name: "Apparel & Textiles", slug: "textiles", count: "15,200+ Products", icon: TrendingUp, color: "from-blue-500 to-indigo-600" },
  { name: "Electronics & Electrical", slug: "electronics", count: "14,800+ Products", icon: Building, color: "from-purple-500 to-pink-600" },
  { name: "Agriculture & Food", slug: "agriculture", count: "9,100+ Products", icon: ShieldCheck, color: "from-green-500 to-emerald-600" },
  { name: "Building & Construction", slug: "construction", count: "11,500+ Products", icon: Award, color: "from-red-500 to-orange-600" },
]

const MOCK_PRODUCTS = [
  {
    name: "CNC Fiber Laser Cutting Machine",
    slug: "cnc-fiber-laser-cutter",
    price: 1850000,
    minOrderQuantity: 1,
    unit: "unit",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=400&auto=format&fit=crop",
    sellerName: "Apex Forge Industrial Ltd.",
    sellerSlug: "apex-forge",
    location: "Pune, Maharashtra",
    isSponsored: true,
  },
  {
    name: "High Precision Surgical Scalpel Set",
    slug: "surgical-scalpel-set",
    price: 450,
    minOrderQuantity: 100,
    unit: "box",
    image: "https://images.unsplash.com/photo-1579684389782-64d84b5e901a?q=80&w=400&auto=format&fit=crop",
    sellerName: "Zenith Biotech Surgical",
    sellerSlug: "zenith-biotech",
    location: "Ahmedabad, Gujarat",
    isSponsored: false,
  },
  {
    name: "Organic Cotton Yarn Blended Spools",
    slug: "organic-cotton-yarn",
    price: 180,
    minOrderQuantity: 500,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1528476513691-07e6f563d97f?q=80&w=400&auto=format&fit=crop",
    sellerName: "Heritage Weaves & Spinners",
    sellerSlug: "heritage-weaves",
    location: "Coimbatore, Tamil Nadu",
    isSponsored: true,
  },
  {
    name: "Smart PLC Control Board Panel",
    slug: "smart-plc-control-board",
    price: 12500,
    minOrderQuantity: 5,
    unit: "piece",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop",
    sellerName: "Infratech Electric Controls",
    sellerSlug: "infratech-controls",
    location: "Noida, Uttar Pradesh",
    isSponsored: false,
  },
]

const MOCK_SELLERS = [
  { companyName: "Apex Forge Industrial Ltd.", slug: "apex-forge", logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=100&auto=format&fit=crop", category: "Machinery Manufacturer", certifications: ["ISO 9001:2015", "CE Compliant"] },
  { companyName: "Zenith Biotech Surgical", slug: "zenith-biotech", logo: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=100&auto=format&fit=crop", category: "Medical Consumables Exporter", certifications: ["ISO 13485", "WHO-GMP"] },
  { companyName: "Heritage Weaves & Spinners", slug: "heritage-weaves", logo: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=100&auto=format&fit=crop", category: "Textiles & Cotton Mills", certifications: ["GOTS Certified", "OEKO-TEX"] },
]

export default async function Homepage() {
  let featuredProducts: any[] = []
  let recentProducts: any[] = []
  let categories: any[] = []
  let sellers: any[] = []

  try {
    await connectDB()
    const dbFeatured = await Product.find()
      .populate("seller", "companyName slug contactInfo isVerified")
      .populate("category", "name slug")
      .sort({ isSponsored: -1, rating: -1 })
      .limit(12)
      .lean()
    
    featuredProducts = JSON.parse(JSON.stringify(dbFeatured))

    const dbRecent = await Product.find()
      .populate("seller", "companyName slug contactInfo isVerified")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .limit(12)
      .lean()
    
    recentProducts = JSON.parse(JSON.stringify(dbRecent))

    const dbCategories = await Category.find({ parentCategory: null }).limit(6).lean()
    categories = JSON.parse(JSON.stringify(dbCategories.length > 0 ? dbCategories : await Category.find().limit(6).lean()))
    
    const dbSellers = await Seller.find({ isVerified: true }).limit(3).lean()
    sellers = JSON.parse(JSON.stringify(dbSellers))
  } catch (err) {
    console.log("Database fetch failed on homepage. Falling back to mock data.", err)
  }

  // Populate fallbacks
  const displayFeatured = featuredProducts.length > 0 ? featuredProducts : MOCK_PRODUCTS
  const displayRecent = recentProducts.length > 0 ? recentProducts : [...MOCK_PRODUCTS].reverse()
  const displayCategories = categories.length > 0 
    ? categories.map((cat, idx) => ({
        name: cat.name,
        slug: cat.slug,
        count: "Browse Products",
        icon: MOCK_CATEGORIES[idx % MOCK_CATEGORIES.length].icon,
        color: MOCK_CATEGORIES[idx % MOCK_CATEGORIES.length].color,
      }))
    : MOCK_CATEGORIES
  const displaySellers = sellers.length > 0 ? sellers : MOCK_SELLERS

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full bg-slate-950 overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(0,158,73,0.08)_0%,transparent_60%] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Animated grid lines pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center flex flex-col items-center">
          
          {/* Trust Banner */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-6 animate-pulse">
            <ShieldCheck className="w-3.5 h-3.5" />
            India's Safest B2B Sourcing Hub
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight max-w-4xl">
            Sourcing Reimagined for <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Global Procurement
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base mt-6 max-w-2xl leading-relaxed">
            Connect with verified local manufacturers and wholesale suppliers directly. Eliminate middlemen, lock in contract rates, and score leads with automated AI workflows.
          </p>

          {/* Search Console */}
          <form action="/search" method="GET" className="w-full max-w-2xl bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-2xl shadow-black/40 border border-slate-200/20 flex flex-col sm:flex-row items-center gap-2 mt-10">
            <div className="flex-1 w-full flex items-center gap-2 px-3">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="Ex. CNC machinery, chemicals, surgical gloves..."
                className="w-full bg-transparent text-slate-800 dark:text-white text-sm outline-none border-none focus:ring-0 py-2.5"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-extrabold tracking-wide transition shadow-lg shadow-primary/20 shrink-0"
            >
              Search Suppliers
            </button>
          </form>

          {/* Core Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-slate-400 text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Verified Audited Stores</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-secondary" />
              <span>Direct Manufacturer Rates</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-accent" />
              <span>Secure Razorpay Escrow</span>
            </div>
          </div>

        </div>
      </section>

      {/* Statistics Banner */}
      <section className="w-full bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">12.5M+</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Catalog Listings</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-primary">45,000+</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Verified Sellers</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-secondary">1.8M+</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">RFQ Leads Sent</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-accent">120+</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Trade Countries</div>
          </div>
        </div>
      </section>

      {/* Top Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Global Supply</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Top Industries & Sectors</h2>
          </div>
          <Link href="/search" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline group">
            All Categories
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCategories.map((cat, i) => {
            const Icon = cat.icon
            return (
              <Link
                key={i}
                href={`/search?category=${cat.slug}`}
                className="group relative flex items-center gap-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-xl hover:shadow-slate-100/40 hover:border-slate-200 transition-all duration-300 overflow-hidden"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shrink-0 shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors text-sm sm:text-base">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">{cat.count}</p>
                </div>
                <div className="p-1 bg-slate-50 dark:bg-slate-800 group-hover:bg-primary/10 rounded-lg text-slate-400 group-hover:text-primary transition shrink-0">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="bg-slate-50/50 dark:bg-slate-900/40 py-20 w-full border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">Trending Sourcing</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Featured Wholesale Catalog</h2>
            </div>
            <Link href="/search" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline group">
              Browse All Products
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <ProductSlider products={displayFeatured} />

        </div>
      </section>

      {/* Recently Added Products Showcase */}
      <section className="bg-white dark:bg-slate-950 py-20 w-full border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">New Arrivals</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Recently Listed Trade Catalog</h2>
            </div>
            <Link href="/search?sort=newest" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline group">
              Browse New Listings
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <ProductSlider products={displayRecent} />

        </div>
      </section>

      {/* Verified Suppliers Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Supplier Auditing</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Verified Trade Suppliers</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-3 leading-relaxed">
            Every seller listed below has completed strict business validation checks, including registration document audits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displaySellers.map((seller, i) => (
            <div
              key={i}
              className="flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl transition shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                  <img src={seller.logo} alt={seller.companyName} className="w-10 h-10 object-contain" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm sm:text-base">
                    {seller.companyName}
                  </h4>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mt-0.5">
                    {seller.category || "Supplier & Exporter"}
                  </span>
                </div>
              </div>

              {/* Badges and Certifications */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-extrabold border border-emerald-100">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
                {seller.certifications && seller.certifications.map((cert: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-500 text-[10px] font-semibold border border-slate-200/50">
                    {cert}
                  </span>
                ))}
              </div>

              <p className="text-slate-400 text-xs leading-relaxed mt-4 line-clamp-3">
                High-quality manufacturing procedures providing robust materials to global industries. Compliant with international logistics and quality control guidelines.
              </p>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex gap-2.5 mt-6 shrink-0">
                <Link
                  href={`/store/${seller.slug}`}
                  className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
                >
                  Visit Storefront
                </Link>
                <Link
                  href={`/store/${seller.slug}?inquiry=true`}
                  className="flex-1 text-center py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition"
                >
                  Inquire Now
                </Link>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="bg-slate-50 dark:bg-slate-900/20 py-20 w-full border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <div className="p-2.5 bg-primary/10 rounded-full inline-flex text-primary mb-3">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Trade Support & FAQ</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-3">Common questions for wholesale buyers and suppliers.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">How does DIGIMART360 audit seller verification status?</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-2.5 leading-relaxed">
                Sellers are required to upload government-issued company registration certificates, GST records, or manufacturing certifications (ISO/CE). Our admin team audits these documents against public company registries before enabling the "Verified" trust badge.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">What is the dynamic category custom field system?</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-2.5 leading-relaxed">
                Unlike static templates, administrators configure custom specifications templates (e.g. dimensions, purity, voltage, fiber length) per category. Sellers input these exact specifications during listing creation, showing clean attribute tables to prospective buyers.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">How does the AI lead score assist wholesale exporters?</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-2.5 leading-relaxed">
                When a buyer submits a quote request, our integrated OpenAI parser scores the requirement details from 0 to 100 in real time. It analyzes factors like size constraints, target pricing, time sensitivity, and business registries, listing priority leads at the top of the seller's CRM.
              </p>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  )
}
