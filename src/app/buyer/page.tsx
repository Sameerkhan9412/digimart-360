import { getBuyerInquiries } from "src/app/actions/leadActions"
import { getCurrentUser } from "src/app/actions/authActions"
import { getBuyerReviewsMap } from "src/app/actions/reviewActions"
import DashboardSidebar from "src/components/dashboard/Sidebar"
import BuyerInquiriesList from "src/components/dashboard/BuyerInquiriesList"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowUpRight, MessageSquare, Plus } from "lucide-react"

export default async function BuyerDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch inquiries and reviews map in parallel
  const [inquiriesResult, reviewsResult] = await Promise.all([
    getBuyerInquiries(),
    getBuyerReviewsMap()
  ])

  const inquiries = inquiriesResult.success ? inquiriesResult.inquiries || [] : []
  const reviewsMap = reviewsResult.success ? reviewsResult.reviewsMap || {} : {}

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <DashboardSidebar user={user} />
      
      <main className="flex-1 h-screen overflow-y-auto p-6 md:p-8 bg-slate-50/40 flex flex-col gap-6">
        
        {/* Title & Action */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-5 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sans">
              Buyer Dashboard
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Track your submitted trade quotes, monitor replies, and interact with verified suppliers.
            </p>
          </div>
          <Link
            href="/buyer/inquiries/new"
            className="self-start sm:self-center px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-extrabold rounded-xl shadow-sm transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Post New RFQ
          </Link>
        </div>

        {inquiries.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 max-w-lg mx-auto flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-full flex items-center justify-center text-slate-350 mb-5">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-800 dark:text-slate-200">No sent inquiries</h4>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              You haven't requested any pricing quotes yet. Browse our directory and click "Get Best Price" on catalog items to start trade negotiations.
            </p>
            <Link
              href="/search"
              className="mt-6 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1"
            >
              Browse Products
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Inquiries log table */
          <BuyerInquiriesList inquiries={inquiries} initialReviewsMap={reviewsMap} />
        )}

      </main>
    </div>
  )
}

