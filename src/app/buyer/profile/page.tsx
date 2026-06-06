import { getCurrentUser } from "src/app/actions/authActions"
import DashboardSidebar from "src/components/dashboard/Sidebar"
import BuyerProfileForm from "./BuyerProfileForm"
import { redirect } from "next/navigation"

export default async function BuyerProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <DashboardSidebar user={user} />
      
      <main className="flex-1 h-screen overflow-y-auto p-6 md:p-8 bg-slate-50/40 flex flex-col gap-6">
        
        {/* Title */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-5 shrink-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sans">
            Company Profile
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage your corporate B2B buyer credentials and contact specifications.
          </p>
        </div>

        <div className="max-w-2xl">
          <BuyerProfileForm user={user} />
        </div>

      </main>
    </div>
  )
}
