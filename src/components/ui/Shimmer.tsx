import React from "react"

export function ShimmerBase({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-xl ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm relative">
      {/* Image Skeleton */}
      <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden shrink-0">
        <ShimmerBase className="w-full h-full rounded-none" />
      </div>

      {/* Contents */}
      <div className="p-4 flex flex-col flex-1 gap-4">
        {/* Category & Badge */}
        <div className="flex justify-between items-center">
          <ShimmerBase className="h-3 w-16" />
          <ShimmerBase className="h-3 w-12" />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <ShimmerBase className="h-4 w-5/6" />
          <ShimmerBase className="h-4 w-2/3" />
        </div>

        {/* Price & MOQ */}
        <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <ShimmerBase className="h-2 w-14" />
            <ShimmerBase className="h-5 w-24" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <ShimmerBase className="h-2.5 w-12" />
            <ShimmerBase className="h-3 w-16" />
          </div>
        </div>

        {/* Seller Info Panel */}
        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/20 flex flex-col gap-1.5">
          <ShimmerBase className="h-3.5 w-24" />
          <ShimmerBase className="h-3 w-32" />
        </div>

        {/* Button */}
        <ShimmerBase className="h-10 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function SearchPageSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
      {/* Sidebar Skeleton */}
      <aside className="w-full lg:w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shrink-0 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
          <ShimmerBase className="h-5 w-24" />
          <ShimmerBase className="h-4 w-12" />
        </div>

        <div className="flex flex-col gap-1">
          <ShimmerBase className="h-3 w-16 mb-2" />
          <ShimmerBase className="h-10 w-full" />
        </div>

        <div className="flex flex-col gap-1">
          <ShimmerBase className="h-3 w-24 mb-2" />
          <ShimmerBase className="h-10 w-full" />
        </div>

        <div className="flex flex-col gap-1">
          <ShimmerBase className="h-3 w-20 mb-2" />
          <div className="flex gap-2">
            <ShimmerBase className="h-10 flex-1" />
            <ShimmerBase className="h-10 flex-1" />
          </div>
        </div>

        <ShimmerBase className="h-10 w-full rounded-xl mt-4" />
      </aside>

      {/* Grid Skeleton */}
      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <CardSkeleton key={idx} />
        ))}
      </div>
    </div>
  )
}

export function ProductPageSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
      {/* Gallery Skeleton */}
      <div className="lg:col-span-6 flex flex-col gap-4 w-full">
        <div className="aspect-square w-full bg-slate-55 dark:bg-slate-800 border rounded-2xl overflow-hidden relative">
          <ShimmerBase className="w-full h-full rounded-none" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="aspect-square border rounded-xl overflow-hidden relative">
              <ShimmerBase className="w-full h-full rounded-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Product Information Skeletons */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-3">
          <ShimmerBase className="h-4.5 w-24" />
          <ShimmerBase className="h-8 w-11/12" />
          <ShimmerBase className="h-8 w-2/3" />
        </div>

        <div className="flex gap-2.5">
          <ShimmerBase className="h-5 w-28 rounded-full" />
          <ShimmerBase className="h-5 w-20 rounded-full" />
        </div>

        <div className="border-y border-slate-100 dark:border-slate-800 py-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <ShimmerBase className="h-3 w-20" />
            <ShimmerBase className="h-6 w-32" />
          </div>
          <div className="flex flex-col gap-1.5">
            <ShimmerBase className="h-3 w-20" />
            <ShimmerBase className="h-6 w-24" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <ShimmerBase className="h-3.5 w-32 mb-1" />
          <ShimmerBase className="h-4 w-full" />
          <ShimmerBase className="h-4 w-full" />
          <ShimmerBase className="h-4 w-4/5" />
        </div>

        <ShimmerBase className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function StorePageSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Banner Backdrop */}
      <div className="h-48 sm:h-64 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden relative">
        <ShimmerBase className="w-full h-full rounded-none" />
      </div>

      {/* Store Info Banner Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center relative -mt-20 mx-4 sm:mx-8 shadow-lg z-10">
        <div className="w-20 h-20 rounded-2xl border bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative">
          <ShimmerBase className="w-full h-full rounded-none" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <ShimmerBase className="h-6 w-48" />
          <ShimmerBase className="h-4 w-32" />
          <div className="flex gap-2 mt-1">
            <ShimmerBase className="h-5 w-20 rounded-full" />
            <ShimmerBase className="h-5 w-24 rounded-full" />
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto shrink-0 mt-4 sm:mt-0">
          <ShimmerBase className="h-10 w-28 rounded-xl" />
          <ShimmerBase className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <CardSkeleton key={idx} />
        ))}
      </div>
    </div>
  )
}

export function GlobalSpinner() {
  return (
    <div className="min-h-[400px] w-full flex items-center justify-center relative">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-primary rounded-full animate-spin" />
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 animate-pulse">
          Loading Sourcing Platform...
        </span>
      </div>
    </div>
  )
}
