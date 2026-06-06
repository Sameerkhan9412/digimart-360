import { getSellerProfile } from "src/app/actions/storefrontActions"
import BillingPlans from "src/components/dashboard/BillingPlans"
import { redirect } from "next/navigation"

export default async function SellerBillingPage() {
  const seller = await getSellerProfile()

  if (!seller) {
    redirect("/auth/login")
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div className="border-b border-slate-100 pb-5 shrink-0">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sans">
          Subscription Tiers & Billing
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Scale your catalog upload boundaries and unlock premium lead features. All charges are securely processed.
        </p>
      </div>

      <BillingPlans currentPlan={seller.subscriptionPlan} sellerId={seller._id.toString()} />

    </div>
  )
}
