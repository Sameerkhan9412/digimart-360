import Link from "next/link"
import { notFound } from "next/navigation"
import Navbar from "src/components/Navbar"
import Footer from "src/components/Footer"
import ProductInquiryForm from "src/components/ProductInquiryForm"
import { getStorefrontBySlug } from "src/app/actions/storefrontActions"
import {
  MapPin,
  CheckCircle,
  ShieldCheck,
  Building,
  Phone,
  MessageCircle,
  FileText,
  Calendar,
  Award,
  User,
  Clock,
  ExternalLink,
  ChevronRight,
} from "lucide-react"

interface StorefrontPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function SellerStorefrontPage({ params }: StorefrontPageProps) {
  const resolvedParams = await params
  
  const storefrontData = await getStorefrontBySlug(resolvedParams.slug)
  if (!storefrontData) {
    notFound()
  }

  const { seller, products } = storefrontData

  // Fallback default theme configurations
  const theme = seller.customTheme || {
    primaryColor: "#009E49",
    secondaryColor: "#0F4C5C",
    font: "Plus Jakarta Sans",
    layoutVariant: "modern",
  }

  // Generate WhatsApp dynamic text url
  const cleanPhone = seller.contactInfo?.whatsapp || seller.contactInfo?.phone || ""
  const whatsappNumber = cleanPhone.replace(/[^0-9]/g, "")
  const whatsappUrl = `https://wa.me/${whatsappNumber.startsWith("91") ? whatsappNumber : "91" + whatsappNumber}?text=Hi,%20I%20visited%20your%20storefront%20on%20DIGIMART360%20and%20would%20like%20to%20inquire%20about%20your%20trade%2520listings.`

  return (
    <div
      className="flex flex-col min-h-screen bg-slate-50/50"
      style={{
        fontFamily: theme.font ? `'${theme.font}', sans-serif` : "inherit",
        // Inject seller custom colors as standard CSS variables
        ['--theme-primary' as any]: theme.primaryColor || "#009E49",
        ['--theme-primary-hover' as any]: (theme.primaryColor + "e0") || "#00803B",
        ['--theme-secondary' as any]: theme.secondaryColor || "#0F4C5C",
      }}
    >
      <Navbar />

      {/* Hero Banner Section with Parallax Grid Overlay */}
      <section className="relative w-full h-80 sm:h-96 bg-slate-950 overflow-hidden shrink-0">
        <img
          src={seller.banner || "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=1200&auto=format&fit=crop"}
          alt={`${seller.companyName} Banner`}
          className="w-full h-full object-cover opacity-50 scale-105 transition-transform duration-1000"
        />
        {/* Subtle grid pattern over banner */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
      </section>

      {/* Dynamic Profile Header Overlap block */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 sm:-mt-44 relative z-10 w-full mb-10 shrink-0">
        <div className="bg-white  backdrop-blur-md border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left w-full">
            {/* Double Border Glow Logo Container */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-2xl border-4 border-slate-50 flex items-center justify-center shrink-0 shadow-lg overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--theme-primary)]/5 to-transparent pointer-events-none" />
              <img
                src={seller.logo || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=200&auto=format&fit=crop"}
                alt={seller.companyName}
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain group-hover:scale-105 transition duration-300"
              />
            </div>
            
            <div className="flex-1 mt-2 ">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
                  {seller.companyName}
                </h1>
                
                {seller.isVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-extrabold border border-emerald-100 uppercase tracking-wide shadow-sm animate-pulse-subtle">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    Verified Exporter
                  </span>
                )}
              </div>

              {/* Status and Meta Pills */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-5 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{seller.contactInfo?.address || "New Delhi, India"}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Established Manufacturer</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/50 text-emerald-700">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Active Supplier</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick CTA Actions Sidebar */}
          <div className="flex sm:flex-row lg:flex-col gap-3.5 w-full lg:w-60 shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-white text-xs font-extrabold transition-all duration-200 shadow-lg shadow-emerald-600/10 hover:shadow-xl hover:translate-y-[-2px] bg-emerald-500 hover:bg-emerald-600"
            >
              <MessageCircle className="w-5 h-5 text-white shrink-0" />
              Contact WhatsApp
            </a>
            <a
              href={`tel:${seller.contactInfo?.phone}`}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold transition-all duration-200 hover:translate-y-[-2px]"
            >
              <Phone className="w-5 h-5 text-slate-500 shrink-0" />
              Call Exporter
            </a>
          </div>

        </div>
      </section>

      {/* Main Split Grid layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* Left Grid: About, Milestones, Products list */}
          <div className="lg:col-span-8 flex flex-col gap-8 w-full">
            
            {/* About Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute right-0 top-0 opacity-5 pointer-events-none translate-x-1/4 -translate-y-1/4">
                <Building className="w-64 h-64 text-slate-900" />
              </div>
              
              <h3 className="font-extrabold text-slate-900 text-xl mb-5 flex items-center gap-2 border-b border-slate-50 pb-3">
                <Building className="w-5.5 h-5.5 text-[var(--theme-primary)] shrink-0" />
                About Our Enterprise
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line relative z-10">
                {seller.about || `Welcome to ${seller.companyName}. We are high-quality wholesale manufacturers and global suppliers specialized in delivering industrial-grade materials and products. Conforming to premium validation regulations, we focus on durability, safety, and strict customer satisfaction parameters.`}
              </p>
            </div>

            {/* Timeline Milestones */}
            {seller.timeline && seller.timeline.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-sm hover:shadow-md transition-all duration-300">
                <h3 className="font-extrabold text-slate-900 text-xl mb-8 flex items-center gap-2 border-b border-slate-50 pb-3">
                  <Calendar className="w-5.5 h-5.5 text-[var(--theme-primary)] shrink-0" />
                  Corporate Growth Timeline
                </h3>
                
                <div className="relative border-l-2 border-dashed border-slate-200 pl-8 ml-4 flex flex-col gap-6">
                  {seller.timeline.map((node: any, idx: number) => (
                    <div key={idx} className="relative group/node">
                      {/* Timeline dot */}
                      <span className="absolute -left-[41px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white bg-slate-350 shadow-md group-hover/node:bg-[var(--theme-primary)] group-hover/node:scale-110 transition-all duration-300" />
                      
                      <div className="p-5 bg-slate-50/50 border border-slate-100 hover:border-[var(--theme-primary)]/20 hover:bg-white rounded-2xl transition duration-300 hover:shadow-lg">
                        <span className="text-xs font-extrabold text-[var(--theme-primary)] uppercase tracking-wide">
                          Year {node.year}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-base mt-1 tracking-tight">{node.title}</h4>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{node.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Catalog Grid */}
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-xl flex items-center gap-2">
                  <FileText className="w-5.5 h-5.5 text-[var(--theme-primary)] shrink-0" />
                  Wholesale Trade Catalog
                </h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  {products.length} catalog items
                </span>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl p-6 flex flex-col items-center">
                  <Building className="w-12 h-12 text-slate-200 mb-3" />
                  <p className="text-slate-400 text-xs font-bold">No catalog listings have been posted by this seller.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((prod: any, idx: number) => {
                    const priceStr = prod.price.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
                    return (
                      <div
                        key={idx}
                        className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col"
                      >
                        {/* Image aspect box */}
                        <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden shrink-0">
                          <img
                            src={prod.images?.[0] || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400"}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>
                        
                        <div className="p-5 flex flex-col flex-1">
                          <Link
                            href={`/product/${prod.slug}`}
                            className="font-extrabold text-slate-800 text-sm hover:text-[var(--theme-primary)] transition duration-200 line-clamp-2 min-h-[40px] leading-tight tracking-tight"
                          >
                            {prod.name}
                          </Link>
                          
                          <div className="flex flex-col gap-1 mt-4 border-t border-slate-50 pt-4 shrink-0">
                            <div className="flex justify-between items-baseline">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Wholesale Price</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">MOQ</span>
                            </div>
                            <div className="flex justify-between items-baseline gap-2 mt-0.5">
                              <span className="font-extrabold text-base text-slate-900">{priceStr}</span>
                              <span className="text-xs font-extrabold text-slate-700">{prod.minOrderQuantity} {prod.unit || "pcs"}</span>
                            </div>
                          </div>

                          <Link
                            href={`/product/${prod.slug}`}
                            className="mt-4 w-full py-2.5 rounded-xl border border-slate-100 hover:border-[var(--theme-primary)]/20 hover:bg-[var(--theme-primary)]/5 text-[var(--theme-primary)] text-center text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1"
                          >
                            View Details
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
          
          {/* Right Grid: Contact Representative, Certifications badges, RFQ Form */}
          <div className="lg:col-span-4 flex flex-col gap-8 w-full lg:sticky lg:top-24">
            
            {/* Seller Contact Representative Avatar Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <h4 className="font-extrabold text-slate-900 text-xs tracking-wider uppercase mb-4 flex items-center gap-1.5 border-b border-slate-50 pb-3">
                <User className="w-4.5 h-4.5 text-[var(--theme-primary)]" />
                Contact Representative
              </h4>
              
              <div className="flex items-center gap-4 bg-slate-50/70 p-4.5 rounded-2xl border border-slate-150/45">
                <div className="w-12 h-12 rounded-full bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] flex items-center justify-center font-extrabold text-base shrink-0 uppercase shadow-inner">
                  {(seller.contactInfo?.contactPerson || seller.user?.name || "Representative").substring(0, 2)}
                </div>
                <div className="overflow-hidden">
                  <h5 className="font-bold text-sm text-slate-800 truncate leading-none">
                    {seller.contactInfo?.contactPerson || seller.user?.name || "Verified Representative"}
                  </h5>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1.5">
                    {seller.contactInfo?.email || seller.user?.email || "Email undisclosed"}
                  </span>
                </div>
              </div>

              {/* Verified Badge Check indicators */}
              <div className="mt-4 flex flex-col gap-2.5 text-xs text-slate-500 font-semibold px-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                  <span>Authorized Representative</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                  <span>Verified Registration Records</span>
                </div>
              </div>
            </div>

            {/* Certifications badges Wall */}
            {seller.certifications && seller.certifications.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <h4 className="font-extrabold text-slate-900 text-xs tracking-wider uppercase mb-4 flex items-center gap-1.5 border-b border-slate-50 pb-3">
                  <Award className="w-4.5 h-4.5 text-[var(--theme-primary)]" />
                  Supplier Certifications
                </h4>
                <div className="flex flex-col gap-2.5">
                  {seller.certifications.map((cert: string, idx: number) => (
                    <div
                      key={idx}
                      className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-150/45 text-xs font-bold text-slate-700 flex items-center justify-between hover:bg-white hover:border-[var(--theme-primary)]/20 transition duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[var(--theme-primary)] shrink-0" />
                        <span>{cert}</span>
                      </div>
                      <Award className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Quote Form */}
            <div id="inquiry-section">
              <ProductInquiryForm sellerId={seller._id.toString()} minQty={1} />
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
