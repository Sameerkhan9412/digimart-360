import React from "react"
import { StorePageSkeleton } from "src/components/ui/Shimmer"
import Navbar from "src/components/Navbar"
import Footer from "src/components/Footer"

export default function StoreLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <StorePageSkeleton />
      </main>
      <Footer />
    </div>
  )
}
