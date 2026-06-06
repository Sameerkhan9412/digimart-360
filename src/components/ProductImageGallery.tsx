"use client"

import React, { useState } from "react"
import { ZoomIn } from "lucide-react"

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: "none" })

  const displayImages = images.length > 0 ? images : [
    "https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=600&auto=format&fit=crop"
  ]

  const activeImage = displayImages[activeIndex]

  // Image Magnifying Zoom Effect on Hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.pageX - left - window.scrollX) / width) * 100
    const y = ((e.pageY - top - window.scrollY) / height) * 100
    
    setZoomStyle({
      display: "block",
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: "200%", // 2x magnification zoom
    })
  }

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none" })
  }

  return (
    <div className="flex flex-col gap-4">
      
      {/* Primary Display Frame with Zoom */}
      <div
        className="w-full aspect-[4/3] rounded-2xl border border-slate-100 bg-white relative overflow-hidden cursor-crosshair group shrink-0"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={activeImage}
          alt={productName}
          className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-150"
        />
        
        {/* Zoom Overlay panel */}
        <div
          className="absolute inset-0 bg-no-repeat pointer-events-none hidden group-hover:block transition-all duration-75"
          style={zoomStyle}
        />

        <div className="absolute bottom-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-lg text-white group-hover:opacity-0 transition pointer-events-none">
          <ZoomIn className="w-4.5 h-4.5" />
        </div>
      </div>

      {/* Thumbnails Row */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 shrink-0">
          {displayImages.map((img, idx) => {
            const isActive = idx === activeIndex
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 bg-white shadow-sm transition-all duration-200 ${
                  isActive ? "border-primary scale-[0.98]" : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <img src={img} alt={`${productName} thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            )
          })}
        </div>
      )}

    </div>
  )
}
