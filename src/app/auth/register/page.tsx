"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "src/components/ui/Toast"
import { registerUser } from "src/app/actions/authActions"
import { Mail, Lock, User, ShieldCheck, ArrowRight, ShoppingBag, Store } from "lucide-react"

export default function RegisterPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<"buyer" | "seller">("buyer")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: role,
    }

    try {
      const result = await registerUser(data)

      if (result.success) {
        toast(result.message || "Registration successful! Verification code sent.", "success")
        router.push(`/auth/verify-otp?email=${encodeURIComponent(result.email || "")}`)
      } else {
        toast(result.error || "Failed to register.", "error")
      }
    } catch (err) {
      console.error(err)
      toast("An error occurred during registration.", "error")
    } finally {
      setLoading(false)
    }
  }

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
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Create your B2B profile</h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-bold text-primary hover:underline">
            Sign In here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Role selection buttons */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Register As</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("buyer")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                    role === "buyer"
                      ? "border-primary bg-primary/5 text-white"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <ShoppingBag className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-bold">Wholesale Buyer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("seller")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                    role === "seller"
                      ? "border-primary bg-primary/5 text-white"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Store className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-bold">Trade Exporter</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name / company Representative</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="E.g. John Doe"
                  className="w-full text-xs font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                />
                <User className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Business Email</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="contact@company.com"
                  className="w-full text-xs font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                />
                <Mail className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="At least 6 characters"
                  className="w-full text-xs font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                />
                <Lock className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
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
                  Register Profile
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Secure Trust Alert */}
          <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span>Encrypted Registration Protocol</span>
          </div>

        </div>
      </div>
    </div>
  )
}
