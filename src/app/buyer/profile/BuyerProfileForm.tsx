"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "src/components/ui/Toast"
import { updateBuyerProfile } from "src/app/actions/authActions"
import {
  Phone,
  Building2,
  User,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Lock
} from "lucide-react"

interface BuyerProfileFormProps {
  user: {
    id: string
    name: string
    email: string
    phone?: string
    company?: string
    isVerified?: boolean
  }
}

export default function BuyerProfileForm({ user }: BuyerProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(user.name || "")
  const [phone, setPhone] = useState(user.phone || "")
  const [company, setCompany] = useState(user.company || "")

  const isProfileComplete = !!(user.phone && user.phone.trim().length >= 10)

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
        toast("Profile updated successfully!", "success")
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

  // Generate initials for avatar
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "B"

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      
      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row gap-5 items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
        
        <div className="flex items-center gap-4 flex-col sm:flex-row text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 text-primary dark:text-primary-light font-extrabold text-xl flex items-center justify-center border border-primary/20 shrink-0 shadow-inner">
            {initials}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base sm:text-lg">
              {name || "B2B Buyer"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            <span className="inline-block px-2.5 py-0.5 mt-2 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-md">
              Corporate Buyer
            </span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="shrink-0 flex flex-col gap-1.5 items-center sm:items-end">
          {isProfileComplete ? (
            <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950/30 rounded-2xl">
              <ShieldCheck className="w-4.5 h-4.5" />
              <span className="text-xs font-extrabold tracking-wide uppercase">Profile Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-950/30 rounded-2xl">
              <ShieldAlert className="w-4.5 h-4.5" />
              <span className="text-xs font-extrabold tracking-wide uppercase">Profile Incomplete</span>
            </div>
          )}
          <p className="text-[10px] text-slate-400 font-medium text-center sm:text-right max-w-[180px] leading-normal mt-1">
            {isProfileComplete 
              ? "All commercial quote (RFQ) features are unlocked." 
              : "Provide your phone number to unlock pricing quote RFQs."}
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-50 dark:border-slate-850 pb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <div>
            <h4 className="font-extrabold text-slate-800 dark:text-white text-sm sm:text-base">
              Business Contact Details
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Updates will synchronize instantly across existing inquiries and supplier chats.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl">
          
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
                placeholder="E.g. Alexander Pierce"
                className="w-full text-xs font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-slate-50/20 dark:bg-slate-950 text-slate-800 dark:text-white"
              />
              <User className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Email Address (Read-only) */}
          <div className="flex flex-col gap-1.5 opacity-80">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Business Email (Registered)
              </label>
              <span className="text-[9px] text-slate-400 flex items-center gap-0.5 font-bold uppercase tracking-wider">
                <Lock className="w-2.5 h-2.5" /> Read-Only
              </span>
            </div>
            <div className="relative">
              <input
                type="email"
                readOnly
                disabled
                value={user.email}
                className="w-full text-xs font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-100/50 dark:bg-slate-950/40 text-slate-400 cursor-not-allowed outline-none"
              />
              <Mail className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400/80" />
            </div>
            <p className="text-[9px] text-slate-400 leading-normal mt-0.5">
              Contact administration support if you need to modify your primary email address.
            </p>
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
                placeholder="E.g. +91 9876543210 (Min 10 digits)"
                className="w-full text-xs font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-slate-50/20 dark:bg-slate-950 text-slate-800 dark:text-white"
              />
              <Phone className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Company Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Company Name / Trade Reference
            </label>
            <div className="relative">
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="E.g. Global Sourcing Hub Ltd"
                className="w-full text-xs font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-slate-50/20 dark:bg-slate-950 text-slate-800 dark:text-white"
              />
              <Building2 className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-extrabold tracking-wide transition shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5 self-start mt-2 w-full sm:w-auto"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  )
}
