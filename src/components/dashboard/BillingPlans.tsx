"use client"

import React, { useState } from "react"
import { useToast } from "src/components/ui/Toast"
import { createSubscriptionOrder, verifySubscriptionPayment, downgradeToFree } from "src/app/actions/subscriptionActions"
import { Check, CreditCard, Sparkles, Zap, ShieldCheck } from "lucide-react"

interface BillingPlansProps {
  currentPlan: string
  sellerId: string
}

const PLANS_DATA = [
  {
    name: "free",
    label: "Free Starter",
    price: "0",
    features: [
      "10 Catalog listings limit",
      "5 Inquiry leads / month",
      "Standard directories sorting",
      "Basic trade timeline builder",
    ],
    color: "border-slate-200 bg-white text-slate-800",
    badge: "Startup",
  },
  {
    name: "silver",
    label: "Silver Sourcing",
    price: "999",
    features: [
      "50 Catalog listings limit",
      "25 Inquiry leads / month",
      "Priority directories ranking",
      "Premium timeline milestones",
      "Basic analytics overview",
    ],
    color: "border-slate-200 hover:border-slate-300 bg-white text-slate-800",
    badge: "Growth",
  },
  {
    name: "gold",
    label: "Gold Corporate",
    price: "2,499",
    features: [
      "200 Catalog listings limit",
      "100 Inquiry leads / month",
      "High priority search ranking",
      "ISO/CE certificate attachments",
      "AI descriptions & tags builder",
      "Full analytics metrics",
    ],
    color: "border-primary/40 bg-gradient-to-tr from-slate-900 to-slate-950 text-white shadow-xl shadow-primary/5",
    badge: "Popular Choice",
  },
  {
    name: "platinum",
    label: "Platinum Enterprise",
    price: "4,999",
    features: [
      "Unlimited product listings",
      "Unlimited inquiry leads",
      "Top-tier sponsored searches",
      "Featured homepage banners",
      "Dedicated account manager",
      "Unlimited AI copy assists",
    ],
    color: "border-slate-200 hover:border-slate-300 bg-white text-slate-800",
    badge: "Scale Out",
  },
]

export default function BillingPlans({ currentPlan, sellerId }: BillingPlansProps) {
  const { toast } = useToast()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [activePlan, setActivePlan] = useState(currentPlan)

  // Razorpay Dynamic Loader
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleUpgrade = async (planName: "silver" | "gold" | "platinum") => {
    setLoadingPlan(planName)
    try {
      const orderResponse = await createSubscriptionOrder(planName)
      
      if (!orderResponse.success) {
        toast(orderResponse.error || "Failed to place subscription order.", "error")
        setLoadingPlan(null)
        return
      }

      // 1. Handle Mock payment sandbox
      if (orderResponse.isMock) {
        toast("Simulating sandbox payment checkout overlay...", "info")
        
        setTimeout(async () => {
          const verifyResponse = await verifySubscriptionPayment({
            razorpay_order_id: orderResponse.orderId || "",
            razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
            razorpay_signature: "sig_mock_digimart",
            planName,
            isMock: true,
          })

          if (verifyResponse.success) {
            toast(verifyResponse.message || "Plan upgraded successfully!", "success")
            setActivePlan(planName)
          } else {
            toast(verifyResponse.error || "Payment verification failed.", "error")
          }
          setLoadingPlan(null)
        }, 1500)
        
        return
      }

      // 2. Handle Live Razorpay checkout integration
      const isRzpLoaded = await loadRazorpayScript()
      if (!isRzpLoaded) {
        toast("Failed to load Razorpay payment portal. Please check your connection.", "error")
        setLoadingPlan(null)
        return
      }

      const options = {
        key: orderResponse.keyId,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: "DIGIMART360",
        description: `Upgrade to ${planName.toUpperCase()} plan`,
        order_id: orderResponse.orderId,
        handler: async (response: any) => {
          setLoadingPlan(planName)
          try {
            const verifyResponse = await verifySubscriptionPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planName,
              isMock: false,
            })

            if (verifyResponse.success) {
              toast(verifyResponse.message || "Payment verified! Plan activated.", "success")
              setActivePlan(planName)
            } else {
              toast(verifyResponse.error || "Verification failed.", "error")
            }
          } catch (err) {
            console.error(err)
            toast("Payment verification error.", "error")
          } finally {
            setLoadingPlan(null)
          }
        },
        prefill: {
          name: orderResponse.companyName,
          email: orderResponse.email,
          contact: orderResponse.phone,
        },
        theme: {
          color: "#009E49", // DIGIMART360 brand emerald green
        },
      }

      const rzpWindow = new (window as any).Razorpay(options)
      rzpWindow.open()
      setLoadingPlan(null)

    } catch (err) {
      console.error(err)
      toast("An error occurred during billing checkout.", "error")
      setLoadingPlan(null)
    }
  }

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your premium plan and return to the Free Starter plan? Your active listings count limits will shrink.")) return
    setLoadingPlan("free")
    try {
      const result = await downgradeToFree()
      if (result.success) {
        toast("Subscription cancelled. Downgraded to free plan.", "warning")
        setActivePlan("free")
      } else {
        toast(result.error || "Error downgrading.", "error")
      }
    } catch (err) {
      console.error(err)
      toast("Error resetting billing plan.", "error")
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="flex flex-col gap-10">
      
      {/* Active plan status alert */}
      <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
            <ShieldCheck className="w-5.5 h-5.5" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">Active Subscription Plan</h4>
            <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5">
              Your trade account is currently subscribed to:{" "}
              <span className="font-extrabold text-primary uppercase">{activePlan}</span>
            </p>
          </div>
        </div>

        {activePlan !== "free" && (
          <button
            onClick={handleCancel}
            disabled={loadingPlan === "free"}
            className="text-xs font-bold text-slate-400 hover:text-rose-500 disabled:opacity-50 transition"
          >
            Cancel Subscription
          </button>
        )}
      </div>

      {/* Grid of plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        {PLANS_DATA.map((plan) => {
          const isCurrent = plan.name === activePlan
          const isFree = plan.name === "free"
          const isLoading = plan.name === loadingPlan

          return (
            <div
              key={plan.name}
              className={`border-2 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 relative overflow-hidden ${plan.color}`}
            >
              
              {/* Badge */}
              <span className={`absolute top-3 right-3 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                plan.name === "gold" ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              }`}>
                {plan.badge}
              </span>

              <div>
                <h4 className="font-extrabold text-sm sm:text-base mb-1">{plan.label}</h4>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-2xl sm:text-3xl font-extrabold">INR {plan.price}</span>
                  <span className="text-xs opacity-60">/ Month</span>
                </div>

                {/* Features Checklist */}
                <ul className="flex flex-col gap-3 mt-6 pt-6 border-t border-slate-150/40 text-xs font-medium">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-tight">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action purchase */}
              <div className="mt-8 pt-6 border-t border-slate-150/40 shrink-0">
                {isCurrent ? (
                  <div className="w-full text-center py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs font-extrabold select-none">
                    Current Active Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.name as any)}
                    disabled={!!loadingPlan || isFree}
                    className={`w-full py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition flex items-center justify-center gap-1 shadow-sm ${
                      plan.name === "gold"
                        ? "bg-primary hover:bg-primary-hover text-white shadow-primary/10"
                        : "bg-slate-50 hover:bg-slate-100 border text-slate-850 hover:border-slate-350"
                    } disabled:opacity-50`}
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-accent" />
                        Upgrade Tier
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          )
        })}
      </div>

    </div>
  )
}
