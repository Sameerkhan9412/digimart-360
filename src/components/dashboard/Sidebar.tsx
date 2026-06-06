"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShieldCheck,
  FolderTree,
  Settings,
  Store,
  MessageSquare,
  Sparkles,
  CreditCard,
  User,
  LogOut,
  FolderGit,
} from "lucide-react"
import Image from "next/image"

interface SidebarProps {
  user: {
    id: string
    name: string
    email: string
    role: "admin" | "seller" | "buyer"
  }
}

export default function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const adminLinks = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Seller Audits", href: "/admin/verifications", icon: ShieldCheck },
    { label: "Trade Categories", href: "/admin/categories", icon: FolderTree },
    { label: "AI & System", href: "/admin/settings", icon: Settings },
  ]

  const sellerLinks = [
    { label: "Performance", href: "/seller", icon: LayoutDashboard },
    { label: "Catalog Listings", href: "/seller/products", icon: Store },
    { label: "CRM Leads Funnel", href: "/seller/crm", icon: MessageSquare },
    { label: "Store Customizer", href: "/seller/storefront", icon: Sparkles },
    { label: "Plan & Billing", href: "/seller/billing", icon: CreditCard },
  ]

  const buyerLinks = [
    { label: "Sent Inquiries", href: "/buyer", icon: MessageSquare },
    { label: "Saved Listings", href: "/buyer/bookmarks", icon: FolderGit },
    { label: "Company Profile", href: "/buyer/profile", icon: User },
  ]

  // Select navigation set based on role
  let navItems = buyerLinks
  if (user.role === "admin") navItems = adminLinks
  else if (user.role === "seller") navItems = sellerLinks

  const activeLinkClass = "bg-primary/10 text-primary font-bold dark:bg-primary/20"
  const inactiveLinkClass = "text-slate-600 hover:text-primary hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900 font-semibold"

  return (
    <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 flex flex-col h-screen sticky top-0 shrink-0">
      
      {/* Brand logo header */}
      <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-50 dark:border-slate-900 shrink-0">
        {/* <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-extrabold text-xs">
          D
        </div>
        <span className="font-extrabold text-sm text-slate-800 dark:text-white">
          DIGIMART<span className="text-primary">360</span>
        </span> */}
        <Link href={"/"}>
                  <Image src="/logo.jpeg" alt="Logo" width={120} height={48} className="w-auto" />
        </Link>

      </div>

      {/* Main navigation list */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 overflow-y-auto shrink-0">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-3 mb-2 block">
          {user.role.toUpperCase()} Workspace
        </span>

        {navItems.map((item, idx) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 ${
                isActive ? activeLinkClass : inactiveLinkClass
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User profile footer */}
      <div className="p-4 border-t border-slate-50 dark:border-slate-900 flex flex-col gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-950">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 uppercase">
            {user.name.substring(0, 2)}
          </div>
          <div className="overflow-hidden">
            <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate leading-none">
              {user.name}
            </h5>
            <span className="text-[10px] text-slate-400 font-medium truncate block mt-1">
              {user.email}
            </span>
          </div>
        </div>

        <form action="/api/auth/logout" method="POST" className="w-full">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout Account
          </button>
        </form>
      </div>

    </aside>
  )
}
