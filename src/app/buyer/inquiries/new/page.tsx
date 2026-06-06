import { getCurrentUser } from "src/app/actions/authActions"
import { getSourcingCatalogData } from "src/app/actions/leadActions"
import DashboardSidebar from "src/components/dashboard/Sidebar"
import NewInquiryForm from "src/components/dashboard/NewInquiryForm"
import InlineProfileComplete from "src/components/dashboard/InlineProfileComplete"
import { redirect } from "next/navigation"

interface PageProps {
  searchParams: Promise<{
    product?: string
    seller?: string
  }>
}

export default async function NewInquiryPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all sellers and products to populate dropdown selectors
  const result = await getSourcingCatalogData()
  const sellers = result.success ? result.sellers || [] : []
  const products = result.success ? result.products || [] : []

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <DashboardSidebar user={user} />
      
      <main className="flex-1 h-screen overflow-y-auto p-6 md:p-8 bg-slate-50/40 flex flex-col gap-6">
        
        {/* Title */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-5 shrink-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sans">
            Create Sourcing Request
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Request pricing quotes and communicate requirements directly with manufacturers.
          </p>
        </div>

        {user.phone ? (
          <NewInquiryForm
            user={user}
            sellers={sellers}
            products={products}
            initialSellerSlug={resolvedParams.seller}
            initialProductSlug={resolvedParams.product}
          />
        ) : (
          <div className="max-w-2xl mx-auto w-full pt-8">
            <InlineProfileComplete user={user} />
          </div>
        )}

      </main>
    </div>
  )
}

