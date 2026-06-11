import React from "react"
import { GlobalSpinner } from "src/components/ui/Shimmer"
import Navbar from "src/components/Navbar"
import Footer from "src/components/Footer"

export default function RootLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center w-full">
        <GlobalSpinner />
      </main>
      <Footer />
    </div>
  )
}
