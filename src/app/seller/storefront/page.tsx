import { getSellerProfile } from "src/app/actions/storefrontActions"
import StorefrontCustomizer from "src/components/dashboard/StorefrontCustomizer"
import { redirect } from "next/navigation"

export default async function SellerStorefrontConfigPage() {
  const seller = await getSellerProfile()

  if (!seller) {
    redirect("/auth/login")
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div className="border-b border-slate-100 pb-5 shrink-0">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sans">
          Storefront Builder Config
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Customize your public B2B store slug page colors, add company timelines milestones, and attach ISO certification credentials.
        </p>
      </div>

      <StorefrontCustomizer initialSeller={seller} />

    </div>
  )
}
