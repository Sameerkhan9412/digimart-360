"use client"

import React, { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "src/components/ui/Toast"
import { verifyOTP, resendOTP } from "src/app/actions/authActions"
import { CheckCircle, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react"

function VerifyOTPForm() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!email) {
      toast("No email address provided for verification. Redirecting...", "error")
      router.push("/auth/register")
    }
  }, [email, router, toast])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const otp = formData.get("otp") as string

    try {
      const result = await verifyOTP({ email, otp })

      if (result.success && result.user) {
        toast("Email verified successfully! Welcome to DIGIMART360.", "success")
        
        // Redirect to dashboard
        if (result.user.role === "admin") {
          router.push("/admin")
        } else if (result.user.role === "seller") {
          router.push("/seller")
        } else {
          router.push("/buyer")
        }
        
        router.refresh()
      } else {
        toast(result.error || "OTP verification failed.", "error")
      }
    } catch (err) {
      console.error(err)
      toast("An error occurred during verification.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return
    setResending(true)
    try {
      const result = await resendOTP(email)
      if (result.success) {
        toast(result.message || "A new OTP code has been sent.", "success")
      } else {
        toast(result.error || "Failed to resend OTP.", "error")
      }
    } catch (err) {
      console.error(err)
      toast("Error resending OTP code.", "error")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
      <div className="text-center mb-6">
        <p className="text-xs text-slate-400">
          A 6-digit One-Time Password was dispatched to: <br />
          <span className="font-bold text-white text-xs mt-1 block">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2">
            Verification OTP Code
          </label>
          <input
            type="text"
            name="otp"
            required
            maxLength={6}
            placeholder="000000"
            className="w-full text-center text-xl tracking-[10px] font-extrabold py-3 rounded-xl border border-slate-800 bg-slate-950 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-extrabold tracking-wide transition shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5 mt-2"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              Verify & Log In
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-800 text-xs">
        <span className="text-slate-500">Didn't receive the email?</span>
        <button
          onClick={handleResend}
          disabled={resending}
          className="font-bold text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
          Resend OTP
        </button>
      </div>

      {/* SSL indicator */}
      <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
        <span>Secure OTP authentication session</span>
      </div>
    </div>
  )
}

export default function VerifyOTPPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(0,158,73,0.06)_0%,transparent_50%] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="font-extrabold text-white text-lg">D</span>
          </div>
          <span className="font-extrabold text-xl text-white tracking-tight">
            DIGIMART<span className="text-primary">360</span>
          </span>
        </Link>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Confirm OTP Verification</h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Enter the verification code to activate your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Suspense fallback={
          <div className="bg-slate-900 border border-slate-800 py-8 px-4 shadow-2xl rounded-2xl sm:px-10 text-center text-slate-400 text-xs">
            Loading OTP panel...
          </div>
        }>
          <VerifyOTPForm />
        </Suspense>
      </div>
    </div>
  )
}
