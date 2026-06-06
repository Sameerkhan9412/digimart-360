import Link from "next/link"
import { getSellerProfile } from "src/app/actions/storefrontActions"
import { Product } from "src/lib/database/models/Product"
import { Lead } from "src/lib/database/models/Lead"
import { connectDB } from "src/lib/database/db"
import {
  TrendingUp,
  Box,
  MessageSquare,
  Sparkles,
  CreditCard,
  PlusCircle,
  ShieldCheck,
  ChevronRight,
  UserCheck,
} from "lucide-react"

export default async function SellerDashboardPage() {
  const seller = await getSellerProfile()
  if (!seller) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border p-8 max-w-lg mx-auto">
        <h3 className="font-extrabold text-slate-800">Supplier Profile Missing</h3>
        <p className="text-slate-400 text-xs mt-2 leading-relaxed">
          Please contact system support. Your seller account does not have an initialized business profile document.
        </p>
      </div>
    )
  }

  let catalogCount = 0
  let leadsCount = 0
  let recentLeads: any[] = []

  try {
    await connectDB()
    const [prodCount, totalLeads, dbLeads] = await Promise.all([
      Product.countDocuments({ seller: seller._id }),
      Lead.countDocuments({ seller: seller._id }),
      Lead.find({ seller: seller._id })
        .populate("product", "name images")
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),
    ])

    catalogCount = prodCount
    leadsCount = totalLeads
    recentLeads = JSON.parse(JSON.stringify(dbLeads))
  } catch (err) {
    console.error("Error reading seller counts:", err)
  }

  // Plan limits mapping
  const planLimits = {
    free: { products: 10, leads: 5 },
    silver: { products: 50, leads: 25 },
    gold: { products: 200, leads: 100 },
    platinum: { products: 9999, leads: 9999 },
  }
  const planKey = (seller.subscriptionPlan || "free") as keyof typeof planLimits
  const activeLimits = planLimits[planKey] || planLimits.free
  
  const productPct = Math.min((catalogCount / activeLimits.products) * 100, 100)
  const leadPct = Math.min((leadsCount / activeLimits.leads) * 100, 100)

  return (
    <div className="flex flex-col gap-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Welcome, {seller.companyName}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Supplier performance overview and lead center.
          </p>
        </div>

        {/* Verification status header */}
        <div className="flex items-center gap-2.5 shrink-0">
          {seller.isVerified ? (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl border border-emerald-100">
              <ShieldCheck className="w-4.5 h-4.5" />
              Verified Exporter Profile
            </span>
          ) : (
            <Link
              href="/seller/billing"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-600 text-xs font-bold rounded-xl border border-amber-100 hover:bg-amber-100/50 transition"
            >
              <UserCheck className="w-4.5 h-4.5" />
              Pending Auditing Verification
            </Link>
          )}
        </div>
      </div>

      {/* Grid overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Storefront Listings</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-2">{catalogCount}</h3>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">
              Plan Limit: {activeLimits.products === 9999 ? "Unlimited" : activeLimits.products} listings
            </span>
          </div>
          <div className="p-3 bg-slate-50 border rounded-xl text-slate-500">
            <Box className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">RFQs Received</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-2">{leadsCount}</h3>
            <span className="text-[10px] text-slate-450 font-bold text-primary flex items-center gap-0.5 mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Real-time Leads Inbox
            </span>
          </div>
          <div className="p-3 bg-slate-50 border rounded-xl text-slate-500">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Billing Plan</span>
            <h3 className="text-lg font-extrabold text-primary uppercase mt-2">
              {seller.subscriptionPlan} Tier
            </h3>
            <Link href="/seller/billing" className="text-[10px] text-slate-400 hover:text-primary font-bold hover:underline block mt-1.5">
              Upgrade Subscription Plan
            </Link>
          </div>
          <div className="p-3 bg-slate-50 border rounded-xl text-slate-500">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Subscription quotas & Recents split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        
        {/* Left: Quota meters & CRM stats */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm w-full shrink-0 flex flex-col gap-6">
          <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase">Sourcing Plan Quotas</h3>
          
          {/* Products quota */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-bold text-slate-600">Product listings usage</span>
              <span className="font-extrabold text-slate-850">
                {catalogCount} / {activeLimits.products === 9999 ? "∞" : activeLimits.products}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${productPct}%` }} />
            </div>
          </div>

          {/* Leads quota */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-bold text-slate-600">Unlocked RFQ leads</span>
              <span className="font-extrabold text-slate-850">
                {leadsCount} / {activeLimits.leads === 9999 ? "∞" : activeLimits.leads}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${leadPct}%` }} />
            </div>
          </div>

          <div className="border-t border-slate-50 pt-4 flex flex-wrap gap-2.5 mt-2 shrink-0">
            <Link
              href="/seller/products?action=new"
              className="flex-1 flex items-center justify-center gap-1 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-extrabold tracking-wide transition shadow-md shadow-primary/15"
            >
              <PlusCircle className="w-4 h-4" />
              Add Product
            </Link>
            <Link
              href="/seller/storefront"
              className="flex-1 flex items-center justify-center gap-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              Build Store
            </Link>
          </div>
        </div>

        {/* Right: Recent Inquiries preview with AI scores */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm w-full shrink-0 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase">Recent Sourcing Leads</h3>
            <Link href="/seller/crm" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
              Open CRM
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="text-center py-10 bg-slate-50/20 border border-dashed rounded-xl flex flex-col items-center p-4">
              <p className="text-slate-400 text-xs font-semibold">No inquiries received yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentLeads.map((lead) => (
                <div key={lead._id} className="p-3.5 border rounded-xl flex items-center justify-between gap-4 transition hover:bg-slate-50/30">
                  <div className="overflow-hidden">
                    <h5 className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                      RFQ for {lead.product?.name || "General specifications"}
                    </h5>
                    <div className="flex items-center gap-2.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">
                      <span>Buyer: {lead.buyerDetails?.name}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span>Qty: {lead.quantity}</span>
                    </div>
                  </div>

                  {/* Score badge */}
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex flex-col items-center justify-center border shrink-0 ${
                      lead.leadScore >= 75
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : lead.leadScore >= 50
                        ? "bg-amber-50 text-amber-600 border-amber-100"
                        : "bg-slate-50 text-slate-600 border-slate-100"
                    }`}
                  >
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-semibold leading-none mb-0.5">Score</span>
                    {lead.leadScore}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
