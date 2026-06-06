"use client"

import React, { useState } from "react"
import { useToast } from "./ui/Toast"
import { createLeadInquiry } from "src/app/actions/leadActions"
import { Mail, Phone, Building2, HelpCircle, Sparkles } from "lucide-react"

interface ProductInquiryFormProps {
  sellerId: string
  productId?: string
  productName?: string
  minQty?: number
  unit?: string
  buyerUser?: {
    name: string
    email: string
  }
}

export default function ProductInquiryForm({
  sellerId,
  productId,
  productName,
  minQty = 1,
  unit = "piece",
  buyerUser,
}: ProductInquiryFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      buyerName: formData.get("buyerName") as string,
      buyerEmail: formData.get("buyerEmail") as string,
      buyerPhone: formData.get("buyerPhone") as string,
      buyerCompany: formData.get("buyerCompany") as string,
      message: formData.get("message") as string,
      quantity: parseInt(formData.get("quantity") as string) || minQty,
      targetPrice: parseFloat(formData.get("targetPrice") as string) || 0,
      seller: sellerId,
      product: productId,
    }

    try {
      const response = await createLeadInquiry(data)
      if (response.success) {
        setSuccess(true)
        toast("Your inquiry has been submitted! The seller will contact you shortly.", "success")
      } else {
        toast(response.error || "Failed to submit quote request. Please try again.", "error")
      }
    } catch (err) {
      console.error(err)
      toast("An error occurred during submission.", "error")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg mb-4 animate-bounce">
          ✓
        </div>
        <h4 className="font-extrabold text-slate-800">Inquiry Sent Successfully!</h4>
        <p className="text-slate-400 text-xs mt-2 leading-relaxed">
          DIGIMART360 has dispatched your specifications sheet directly to the supplier. You will receive email copy notifications on future replies.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 text-xs font-bold text-primary hover:underline"
        >
          Send Another Requirement
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
        <div>
          <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">Request Price Quote</h4>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Direct manufacturer contact center.</p>
        </div>
        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          <Sparkles className="w-2.5 h-2.5" />
          AI Scored Lead
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Buyer Contact details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
            <input
              type="text"
              name="buyerName"
              required
              defaultValue={buyerUser?.name || ""}
              placeholder="E.g. John Doe"
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Company Name</label>
            <div className="relative">
              <input
                type="text"
                name="buyerCompany"
                placeholder="E.g. Global Exports Ltd"
                className="w-full text-xs font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
              />
              <Building2 className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <input
                type="email"
                name="buyerEmail"
                required
                defaultValue={buyerUser?.email || ""}
                placeholder="E.g. buyer@company.com"
                className="w-full text-xs font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
              />
              <Mail className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                name="buyerPhone"
                required
                placeholder="E.g. 9876543210"
                className="w-full text-xs font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
              />
              <Phone className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Quantity and Target Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Required Qty ({unit}s)
            </label>
            <input
              type="number"
              name="quantity"
              required
              min={minQty}
              defaultValue={minQty}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Target Price / Unit (INR)
            </label>
            <input
              type="number"
              name="targetPrice"
              placeholder="Optional"
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
            />
          </div>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Requirement Details</label>
          <textarea
            name="message"
            required
            rows={4}
            placeholder={`Describe your wholesale specifications... E.g. We require customized packaging and delivery options for ${productName || "this product"}.`}
            className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-extrabold tracking-wide transition shadow-lg shadow-accent/15 flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Send Buy Inquiry Now"
          )}
        </button>

        <p className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1 leading-relaxed">
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          By sending an inquiry you directly contact the verified manufacturer.
        </p>

      </form>
    </div>
  )
}
