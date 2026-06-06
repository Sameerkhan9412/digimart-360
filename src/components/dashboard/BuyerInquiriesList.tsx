"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Clock, Store, ArrowUpRight, Star, ShieldCheck, PenTool } from "lucide-react"
import WriteReviewModal from "./WriteReviewModal"

interface BuyerInquiriesListProps {
  inquiries: any[]
  initialReviewsMap: Record<string, any>
}

export default function BuyerInquiriesList({
  inquiries,
  initialReviewsMap
}: BuyerInquiriesListProps) {
  const router = useRouter()
  const [reviewsMap, setReviewsMap] = useState<Record<string, any>>(initialReviewsMap)
  const [showModal, setShowModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<{ id: string; productName: string } | null>(null)

  const handleOpenReview = (leadId: string, productName: string) => {
    setSelectedLead({ id: leadId, productName })
    setShowModal(true)
  }

  const handleReviewSuccess = () => {
    // Refresh the router to reload server data
    router.refresh()
  }

  const statusColors = {
    new: "bg-slate-100 text-slate-800",
    contacted: "bg-sky-50 text-sky-700",
    qualified: "bg-indigo-50 text-indigo-700",
    negotiation: "bg-amber-50 text-amber-700",
    won: "bg-emerald-50 text-emerald-700 border-emerald-100",
    lost: "bg-rose-50 text-rose-700",
  }

  return (
    <div className="bg-white border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm shrink-0">
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-750">
          <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Inquired Product</th>
              <th className="px-6 py-4">Supplier Store</th>
              <th className="px-6 py-4">RFQ Quantity</th>
              <th className="px-6 py-4">Status Stage</th>
              <th className="px-6 py-4">Submitted Date</th>
              <th className="px-6 py-4 text-right">Actions / Ratings</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq: any) => {
              const hasProduct = !!inq.product
              const hasSeller = !!inq.seller
              const review = reviewsMap[inq._id.toString()]
              const isWon = inq.status === "won"

              return (
                <tr key={inq._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition">
                  {/* Product detail column */}
                  <td className="px-6 py-4">
                    {hasProduct ? (
                      <Link href={`/product/${inq.product.slug}`} className="font-bold text-slate-800 hover:text-primary hover:underline transition truncate max-w-[200px] block">
                        {inq.product.name}
                      </Link>
                    ) : (
                      <span className="font-bold text-slate-800 italic">General Sourcing Inquiry</span>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 italic max-w-sm">
                      "{inq.message}"
                    </p>
                  </td>

                  {/* Supplier column */}
                  <td className="px-6 py-4">
                    {hasSeller ? (
                      <div className="flex flex-col gap-0.5">
                        <Link href={`/store/${inq.seller.slug}`} className="font-bold text-slate-700 hover:text-primary transition flex items-center gap-1">
                          <Store className="w-3.5 h-3.5 text-slate-400" />
                          {inq.seller.companyName}
                        </Link>
                        <span className="text-[9px] text-slate-400 font-semibold">{inq.seller.contactInfo?.email}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Not found</span>
                    )}
                  </td>

                  {/* Quantity column */}
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-slate-850">{inq.quantity} units</div>
                    {inq.targetPrice > 0 && (
                      <div className="text-[10px] text-accent font-semibold mt-0.5">Target: INR {inq.targetPrice}</div>
                    )}
                  </td>

                  {/* Status column */}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                      statusColors[inq.status as keyof typeof statusColors] || "bg-slate-50 border-slate-100 text-slate-650"
                    }`}>
                      {inq.status}
                    </span>
                  </td>

                  {/* Date column */}
                  <td className="px-6 py-4">
                    <span className="text-slate-450 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </span>
                  </td>

                  {/* Reviews action column */}
                  <td className="px-6 py-4 text-right">
                    {isWon && hasProduct ? (
                      review ? (
                        /* Review already exists badge */
                        <div className="inline-flex flex-col items-end gap-1 select-none">
                          <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs bg-amber-50/50 px-2 py-0.5 rounded-lg border border-amber-100/50">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{review.rating}.0 / 5</span>
                          </div>
                          <span className="text-[8px] text-slate-400 font-semibold italic flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            Reviewed
                          </span>
                        </div>
                      ) : (
                        /* Won lead but not reviewed button */
                        <button
                          onClick={() => handleOpenReview(inq._id, inq.product.name)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-extrabold rounded-lg shadow-sm shadow-emerald-500/10 transition-colors flex items-center gap-1 ml-auto group"
                        >
                          <PenTool className="w-3 h-3" />
                          <span>Leave Review</span>
                        </button>
                      )
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium italic select-none">
                        No reviews available
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Review Modal Trigger */}
      {selectedLead && (
        <WriteReviewModal
          isOpen={showModal}
          leadId={selectedLead.id}
          productName={selectedLead.productName}
          onClose={() => {
            setShowModal(false)
            setSelectedLead(null)
          }}
          onSuccess={handleReviewSuccess}
        />
      )}

    </div>
  )
}
