"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  User,
  FolderGit,
  LogOut,
  ChevronDown,
  Settings,
  ShieldCheck,
  Store,
  CreditCard,
  MessageSquare
} from "lucide-react"

interface UserDropdownProps {
  user: {
    id: string
    name: string
    email: string
    role: "admin" | "seller" | "buyer"
  }
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const initials = user.name.substring(0, 2).toUpperCase()

  // Define role badges
  const roleBadges = {
    admin: "bg-purple-100 text-purple-750 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900",
    seller: "bg-emerald-100 text-emerald-750 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900",
    buyer: "bg-indigo-100 text-indigo-750 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900"
  }

  const roleLabels = {
    admin: "Administrator",
    seller: "Verified Supplier",
    buyer: "Corporate Buyer"
  }

  // Dashboard link based on role
  const dashboardHref = user.role === "admin" ? "/admin" : user.role === "seller" ? "/seller" : "/buyer"

  // Quick menu links based on role
  const links = {
    admin: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Seller Audits", href: "/admin/verifications", icon: ShieldCheck },
      { label: "Trade Categories", href: "/admin/categories", icon: Settings }
    ],
    seller: [
      { label: "Performance", href: "/seller", icon: LayoutDashboard },
      { label: "Catalog Listings", href: "/seller/products", icon: Store },
      { label: "CRM Leads", href: "/seller/crm", icon: MessageSquare },
      { label: "Plan & Billing", href: "/seller/billing", icon: CreditCard }
    ],
    buyer: [
      { label: "Dashboard Hub", href: "/buyer", icon: LayoutDashboard },
      { label: "Sent Inquiries", href: "/buyer", icon: MessageSquare },
      { label: "Saved Listings", href: "/buyer/bookmarks", icon: FolderGit },
      { label: "Company Profile", href: "/buyer/profile", icon: User }
    ]
  }

  const menuLinks = links[user.role] || []

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Profile Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition duration-150"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary text-white font-extrabold text-xs flex items-center justify-center shadow-sm uppercase shrink-0">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-tight">
            {user.name}
          </span>
          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
            {user.role}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Floating Menu Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 flex flex-col gap-1.5 animate-fade-in-down">
          
          {/* Header info */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center uppercase shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden flex-1">
              <h5 className="font-extrabold text-xs text-slate-850 dark:text-slate-200 truncate leading-tight">
                {user.name}
              </h5>
              <span className="text-[9px] text-slate-400 font-semibold truncate block mt-0.5 mb-1.5">
                {user.email}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold border uppercase tracking-wider ${roleBadges[user.role]}`}>
                {roleLabels[user.role]}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="px-2 py-1 flex flex-col gap-0.5">
            {menuLinks.map((item, index) => {
              const Icon = item.icon
              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 transition duration-150"
                >
                  <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Footer logout */}
          <div className="px-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <form action="/api/auth/logout" method="POST" className="w-full">
              <button
                type="submit"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition duration-150 text-left"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Logout Account</span>
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  )
}
