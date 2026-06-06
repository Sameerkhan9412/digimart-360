"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "src/components/ui/Toast"
import { updateBuyerProfile } from "src/app/actions/authActions"
import { Phone, Building2, User, ShieldAlert, Sparkles } from "lucide-react"

interface InlineProfileCompleteProps {
  user: {
    id: string
    name: string
    email: string
    phone?: string
    company?: string
  }
}

export default function InlineProfileComplete({ user }: InlineProfileCompleteProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(user.name || "")
  const [phone, setPhone] = useState(user.phone || "")
  const [company, setCompany] = useState(user.company || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || name.trim().length < 2) {
      toast("Please enter a valid full name (at least 2 characters).", "error")
      return
    }

    if (!phone.trim() || phone.trim().length < 10) {
      toast("A valid phone number of at least 10 digits is required.", "error")
      return
    }

    setLoading(true)

    try {
      const response = await updateBuyerProfile({
        name: name.trim(),
        phone: phone.trim(),
        company: company.trim()
      })

      if (response.success) {
        toast("Profile details updated successfully! Price quoting unlocked.", "success")
        router.refresh()
      } else {
        toast(response.error || "Failed to update profile.", "error")
      }
    } catch (err: any) {
      console.error(err)
      toast("An unexpected error occurred while saving details.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col gap-4 animate-fade-in">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary"></div>
      
      {/* Alert Header */}
      <div className="flex gap-3 items-start border-b border-slate-50 dark:border-slate-850 pb-3">
        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 text-amber-500 border border-amber-100 dark:border-amber-950/30 rounded-xl shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-extrabold text-slate-800 dark:text-white text-sm sm:text-base">
            Complete Buyer Profile
          </h4>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1 leading-normal">
            Verified suppliers require a valid phone number and company reference before receiving wholesale inquiries.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full text-xs font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:border-primary transition bg-slate-50/50 dark:bg-slate-950 text-slate-850 dark:text-white"
            />
            <User className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Phone Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Phone / WhatsApp <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="E.g. 9876543210 (Min 10 digits)"
              className="w-full text-xs font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-slate-205 dark:border-slate-800 outline-none focus:border-primary transition bg-slate-50/50 dark:bg-slate-950 text-slate-850 dark:text-white"
            />
            <Phone className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Company Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Company Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="E.g. Global Trade Corp"
              className="w-full text-xs font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:border-primary transition bg-slate-50/50 dark:bg-slate-950 text-slate-850 dark:text-white"
            />
            <Building2 className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !phone.trim() || phone.trim().length < 10}
          className="w-full py-3 bg-accent hover:bg-accent-hover disabled:bg-slate-105 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md shadow-accent/15 transition flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <span className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Save Details & Unlock</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
