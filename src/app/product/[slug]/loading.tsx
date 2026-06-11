import React from "react"
import { ProductPageSkeleton, ShimmerBase } from "src/components/ui/Shimmer"
import Navbar from "src/components/Navbar"
import Footer from "src/components/Footer"

export default function ProductLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full flex flex-col gap-6">
        {/* Breadcrumb Skeleton */}
        <div className="flex gap-2 items-center mb-4">
          <ShimmerBase className="h-3.5 w-12" />
          <span className="text-slate-350">/</span>
          <ShimmerBase className="h-3.5 w-24" />
          <span className="text-slate-355">/</span>
          <ShimmerBase className="h-3.5 w-32" />
        </div>

        {/* Gallery + Details Columns */}
        <ProductPageSkeleton />
      </main>
      <Footer />
    </div>
  )
}
