"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, MapPin } from "lucide-react"

export default function NavbarSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [q, setQ] = useState("")
  const [location, setLocation] = useState("")

  // Sync state with URL search parameters
  useEffect(() => {
    setQ(searchParams.get("q") || "")
    setLocation(searchParams.get("location") || "")
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    
    if (q.trim()) params.set("q", q.trim())
    if (location.trim()) params.set("location", location.trim())
    
    router.push(`/search?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="hidden md:flex flex-1 max-w-xl items-center border border-slate-250 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary rounded-full transition-all duration-200 overflow-hidden"
    >
      {/* Location Filter */}
      <div className="flex items-center gap-1.5 px-3.5 border-r border-slate-200 shrink-0 w-36 sm:w-40">
        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="All India..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-transparent border-0 text-xs font-bold outline-none text-slate-700 placeholder-slate-400"
        />
      </div>

      {/* Keyword Search */}
      <div className="flex-1 relative flex items-center">
        <Search className="w-4.5 h-4.5 absolute left-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search products, suppliers, categories..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-transparent border-0 text-xs font-bold outline-none text-slate-700 placeholder-slate-400"
        />
      </div>

      <button
        type="submit"
        className="h-full px-5 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-extrabold tracking-wide transition shrink-0"
      >
        Search
      </button>
    </form>
  )
}
