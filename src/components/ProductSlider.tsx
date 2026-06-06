"use client"

import React, { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, CheckCircle, MapPin } from "lucide-react"

interface ProductSliderProps {
  products: any[]
}

export default function ProductSlider({ products }: ProductSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const checkScrollLimits = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 10)
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10)
    }
  }

  useEffect(() => {
    checkScrollLimits()
    window.addEventListener("resize", checkScrollLimits)
    return () => window.removeEventListener("resize", checkScrollLimits)
  }, [products])

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const offset = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8
      scrollRef.current.scrollTo({
        left: scrollLeft + offset,
        behavior: "smooth",
      })
    }
  }

  // If we have 4 or fewer products, render a standard static grid
  if (products.length <= 4) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((prod, i) => (
          <ProductCard key={i} prod={prod} />
        ))}
      </div>
    )
  }

  return (
    <div className="relative group/slider w-full">
      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        onScroll={checkScrollLimits}
        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 w-full scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((prod, i) => (
          <div key={i} className="snap-start shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]">
            <ProductCard prod={prod} />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showLeftArrow && (
        <button
          onClick={() => handleScroll("left")}
          className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-center text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={() => handleScroll("right")}
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl flex items-center justify-center text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}

function ProductCard({ prod }: { prod: any }) {
  const displayPrice = prod.price.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })

  const sellerSlug = prod.sellerSlug || (prod.seller && prod.seller.slug) || ""
  const sellerName = prod.sellerName || (prod.seller && prod.seller.companyName) || "Premium Supplier"
  const location = prod.location || (prod.seller && prod.seller.contactInfo?.address) || "India"

  return (
    <div className="group flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-150/45 dark:border-slate-800 rounded-2xl hover:shadow-2xl hover:border-slate-250 transition-all duration-300 overflow-hidden relative">
      {/* Sponsored indicator */}
      {prod.isSponsored && (
        <span className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-accent text-white text-[9px] font-extrabold rounded uppercase tracking-wider">
          Sponsored
        </span>
      )}

      {/* Product Image Frame */}
      <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-950 relative overflow-hidden shrink-0">
        <img
          src={prod.image || (prod.images && prod.images[0]) || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400"}
          alt={prod.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
      </div>

      {/* Content details wrapper */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
          <span className="truncate max-w-[120px]">
            {prod.category?.name || "Premium Sourcing"}
          </span>
          <span className="text-emerald-500 flex items-center gap-0.5 font-extrabold uppercase tracking-wide">
            <CheckCircle className="w-3 h-3" />
            Verified
          </span>
        </div>

        <Link
          href={`/product/${prod.slug}`}
          className="font-bold text-slate-800 dark:text-slate-200 text-sm hover:text-primary transition line-clamp-2 min-h-[40px] leading-tight tracking-tight"
        >
          {prod.name}
        </Link>

        {/* Pricing details */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850 flex items-baseline justify-between gap-1">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-semibold">Wholesale Price</span>
            <span className="text-md sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {displayPrice} <span className="text-xs text-slate-400 font-medium font-sans">/ {prod.unit || "piece"}</span>
            </span>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] block text-slate-400 font-semibold uppercase tracking-wider">Min. Order</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {prod.minOrderQuantity} {prod.unit || "piece"}s
            </span>
          </div>
        </div>

        {/* Supplier details card */}
        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/10 flex flex-col gap-1 mt-4">
          <Link
            href={`/store/${sellerSlug}`}
            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-primary transition truncate"
          >
            {sellerName}
          </Link>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </div>

        {/* Call to action */}
        <Link
          href={`/product/${prod.slug}?inquiry=true`}
          className="w-full text-center py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-extrabold tracking-wide mt-4 shadow-sm shadow-accent/10 transition duration-200 shrink-0"
        >
          Get Best Price
        </Link>
      </div>
    </div>
  )
}
