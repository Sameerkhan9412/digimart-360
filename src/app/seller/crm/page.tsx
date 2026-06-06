import { getSellerLeads } from "src/app/actions/leadActions"
import CRMManager from "src/components/dashboard/CRMManager"
import { redirect } from "next/navigation"

export default async function SellerCRMPage() {
  const result = await getSellerLeads()

  if (!result.success) {
    redirect("/auth/login")
  }

  const leadsList = result.leads || []

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div className="border-b border-slate-100 pb-5 shrink-0">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sans">
          Lead Management CRM
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Monitor incoming RFQs, follow up on client milestones, check AI-evaluated priority scores, and track negotiations.
        </p>
      </div>

      <CRMManager initialLeads={leadsList} />

    </div>
  )
}
