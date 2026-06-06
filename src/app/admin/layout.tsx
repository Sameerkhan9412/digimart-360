import { getCurrentUser } from "src/app/actions/authActions"
import DashboardSidebar from "src/components/dashboard/Sidebar"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  
  if (!user || user.role !== "admin") {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <DashboardSidebar user={user} />
      <main className="flex-1 h-screen overflow-y-auto p-6 md:p-8 bg-slate-50/40">
        {children}
      </main>
    </div>
  )
}
