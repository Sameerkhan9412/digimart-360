import { getPendingSellers } from "src/app/actions/adminActions"
import VerificationsList from "src/components/dashboard/VerificationsList"

export default async function AdminVerificationsPage() {
  const result = await getPendingSellers()
  const sellersList = result.success ? result.sellers || [] : []

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div className="border-b border-slate-100 pb-5 shrink-0">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sans">
          Supplier Registration Audits
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Review uploaded registration papers (GST records, ISO approvals) to activate seller trust badges.
        </p>
      </div>

      <VerificationsList initialSellers={sellersList} />

    </div>
  )
}
