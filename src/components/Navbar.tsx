import Link from "next/link"
import { getCurrentUser } from "src/app/actions/authActions"
import { PlusCircle, ArrowRight } from "lucide-react"
import Image from "next/image"
import NavbarSearch from "./NavbarSearch"
import UserDropdown from "./UserDropdown"
import { Suspense } from "react"


export default async function Navbar() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 dark:border-slate-800 bg-white backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {/* <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20">
            <span className="font-extrabold text-white text-xl tracking-tight">D</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-slate-900 dark:text-white leading-none tracking-tight">
              DIGIMART<span className="text-primary">360</span>
            </span>
            <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
              Global B2B Portal
            </span>
          </div> */}
          <Image src="/logo.jpeg" alt="Logo" width={120} height={48} className="w-auto" />
        </Link>

        {/* Global Search Bar Wrapper */}
        <Suspense fallback={
          <div className="hidden md:flex flex-1 max-w-xl h-10 bg-slate-100 dark:bg-slate-900 rounded-full animate-pulse border border-slate-200 dark:border-slate-850" />
        }>
          <NavbarSearch />
        </Suspense>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-4">
          <Link
            href="/search"
            className="text-sm font-bold text-slate-650 hover:text-primary transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary hover:after:w-full after:transition-all after:duration-250"
          >
            Browse Trade
          </Link>
          
          <span className="w-px h-5 bg-slate-200 hidden sm:block"></span>

          {user ? (
            <UserDropdown user={user} />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-slate-700 hover:text-primary px-3 py-1.5 rounded-lg transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center gap-1 text-xs font-semibold text-white bg-primary hover:bg-primary-hover px-4 py-2 rounded-lg shadow-sm shadow-primary/15 transition-all"
              >
                Join Free
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}


          {/* Call to action for quick requirements */}
          <Link
            href="/buyer/inquiries/new"
            className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-accent hover:bg-accent-hover shadow-sm shadow-accent/15 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Post Buy Requirement
          </Link>
        </nav>
      </div>
    </header>
  )
}
