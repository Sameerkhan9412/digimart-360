import Link from "next/link"
import { connectDB } from "src/lib/database/db"
import { User } from "src/lib/database/models/User"
import { Seller } from "src/lib/database/models/Seller"
import { Product } from "src/lib/database/models/Product"
import { Lead } from "src/lib/database/models/Lead"
import {
  Users,
  Store,
  Box,
  MessageSquare,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  CreditCard,
  FolderTree,
  Settings,
} from "lucide-react"

export default async function AdminDashboardPage() {
  let stats = {
    usersCount: 0,
    sellersCount: 0,
    productsCount: 0,
    leadsCount: 0,
    pendingVerifications: 0,
  }

  try {
    await connectDB()
    const [usersCount, sellersCount, productsCount, leadsCount, pendingVerifications] = await Promise.all([
      User.countDocuments(),
      Seller.countDocuments(),
      Product.countDocuments(),
      Lead.countDocuments(),
      Seller.countDocuments({ verificationStatus: "under_review" }),
    ])

    stats = {
      usersCount,
      sellersCount,
      productsCount,
      leadsCount,
      pendingVerifications,
    }
  } catch (err) {
    console.error("Error fetching admin stats:", err)
  }

  // Visual graph data mock
  const monthlyActivity = [
    { month: "Jan", leads: 400, revenue: 120000 },
    { month: "Feb", leads: 600, revenue: 180000 },
    { month: "Mar", leads: 850, revenue: 240000 },
    { month: "Apr", leads: 1100, revenue: 310000 },
    { month: "May", leads: 1400, revenue: 390000 },
    { month: "Jun", leads: stats.leadsCount || 1800, revenue: 485000 },
  ]

  const maxRevenue = Math.max(...monthlyActivity.map((m) => m.revenue))

  return (
    <div className="flex flex-col gap-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Admin Overview</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Global metrics control room for DIGIMART360.
          </p>
        </div>
        
        {stats.pendingVerifications > 0 && (
          <Link
            href="/admin/verifications"
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition animate-bounce shrink-0"
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            {stats.pendingVerifications} Pending Audits
          </Link>
        )}
      </div>

      {/* Grid stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Active Users</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-2">{stats.usersCount}</h3>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              +12.4% MoM
            </span>
          </div>
          <div className="p-3 bg-slate-50 border rounded-xl text-slate-500">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Registered Suppliers</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-2">{stats.sellersCount}</h3>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">
              {stats.pendingVerifications} awaiting verification
            </span>
          </div>
          <div className="p-3 bg-slate-50 border rounded-xl text-slate-500">
            <Store className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Catalog Products</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-2">{stats.productsCount}</h3>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              +8.5% listings
            </span>
          </div>
          <div className="p-3 bg-slate-50 border rounded-xl text-slate-500">
            <Box className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Leads Generated</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-2">{stats.leadsCount}</h3>
            <span className="text-[10px] text-primary font-bold flex items-center gap-0.5 mt-1.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              AI Lead Scoring Active
            </span>
          </div>
          <div className="p-3 bg-slate-50 border rounded-xl text-slate-500">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Analytics Charts & Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        
        {/* Left: Revenue visual bar chart */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm w-full shrink-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase">Platform Revenue Growth (INR)</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Subscription MRR Billing tracker.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold bg-slate-50 px-2.5 py-1 rounded-lg">
              <CreditCard className="w-4 h-4 text-primary" />
              Total: INR 4,85,000
            </div>
          </div>

          {/* Graphical representation using tailwind styling */}
          <div className="flex items-end justify-between gap-4 h-64 pt-6 border-b border-slate-100 px-4">
            {monthlyActivity.map((act, i) => {
              const heightPct = (act.revenue / maxRevenue) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <span className="text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{(act.revenue / 1000).toFixed(0)}k
                  </span>
                  
                  {/* Bar */}
                  <div
                    className="w-full bg-slate-100 group-hover:bg-primary rounded-t-lg transition-all duration-300"
                    style={{ height: `${heightPct}%`, minHeight: "10px" }}
                  />
                  
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-800 transition-colors mt-2">
                    {act.month}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Quick shortcuts and verifications */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm w-full shrink-0">
          <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase mb-4">Quick Workspaces</h3>
          
          <div className="flex flex-col gap-3">
            <Link
              href="/admin/verifications"
              className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-50 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-800">Verification Audits</h5>
                  <p className="text-[9px] text-slate-400 mt-0.5">Approve pending suppliers</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/admin/categories"
              className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-50 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FolderTree className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-800">Categories Matrix</h5>
                  <p className="text-[9px] text-slate-400 mt-0.5">Configure dynamic inputs</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/admin/settings"
              className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-50 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Settings className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-800">System Parameters</h5>
                  <p className="text-[9px] text-slate-400 mt-0.5">Configure OpenAI API key</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  )
}
