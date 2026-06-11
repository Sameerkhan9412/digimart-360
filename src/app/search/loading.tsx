import React from "react"
import { SearchPageSkeleton, ShimmerBase } from "src/components/ui/Shimmer"
import Navbar from "src/components/Navbar"
import Footer from "src/components/Footer"

export default function SearchLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full flex flex-col gap-8">
        {/* Header Block Skeletons */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 items-center">
            <ShimmerBase className="h-3 w-12" />
            <span className="text-slate-300">/</span>
            <ShimmerBase className="h-3 w-20" />
          </div>
          <ShimmerBase className="h-9 w-72" />
          <ShimmerBase className="h-4.5 w-96" />
        </div>

        {/* Sidebar + Listings Content Grid */}
        <SearchPageSkeleton />
      </main>
      <Footer />
    </div>
  )
}
