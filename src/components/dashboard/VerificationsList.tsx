"use client"

import React, { useState } from "react"
import { useToast } from "src/components/ui/Toast"
import { updateSellerVerification } from "src/app/actions/adminActions"
import { FileText, ShieldCheck, ShieldAlert, Check, X, MapPin } from "lucide-react"

interface VerificationsListProps {
  initialSellers: any[]
}

export default function VerificationsList({ initialSellers }: VerificationsListProps) {
  const { toast } = useToast()
  const [sellers, setSellers] = useState(initialSellers)
  const [loadingSellerId, setLoadingSellerId] = useState<string | null>(null)
  
  // Rejection dialog overlays state
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const handleApprove = async (id: string) => {
    if (!confirm("Approve this seller for storefront listing?")) return
    setLoadingSellerId(id)

    try {
      const result = await updateSellerVerification(id, "approved")
      if (result.success) {
        toast("Seller storefront has been approved and activated!", "success")
        // Update local status
        setSellers((prev) =>
          prev.map((s) => (s._id === id ? { ...s, verificationStatus: "approved", isVerified: true } : s))
        )
      } else {
        toast(result.error || "Approval failed.", "error")
      }
    } catch (err) {
      console.error(err)
      toast("Error approving supplier verification.", "error")
    } finally {
      setLoadingSellerId(null)
    }
  }

  const triggerRejectFlow = (id: string) => {
    setSelectedSellerId(id)
    setShowRejectModal(true)
    setRejectReason("")
  }

  const handleRejectSubmit = async () => {
    if (!selectedSellerId) return
    if (!rejectReason) return toast("Please specify a reason for rejection.", "warning")

    setLoadingSellerId(selectedSellerId)
    setShowRejectModal(false)

    try {
      const result = await updateSellerVerification(selectedSellerId, "rejected", rejectReason)
      if (result.success) {
        toast("Seller storefront has been rejected. Feedback email dispatched.", "warning")
        setSellers((prev) =>
          prev.map((s) => (s._id === selectedSellerId ? { ...s, verificationStatus: "rejected", isVerified: false } : s))
        )
      } else {
        toast(result.error || "Rejection failed.", "error")
      }
    } catch (err) {
      console.error(err)
      toast("Error rejecting seller verification.", "error")
    } finally {
      setLoadingSellerId(null)
      setSelectedSellerId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      
      {sellers.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl p-8 max-w-lg mx-auto flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 border rounded-full flex items-center justify-center text-slate-300 mb-5">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-slate-800">No Audits Pending</h4>
          <p className="text-slate-400 text-xs mt-2 leading-relaxed">
            All registered wholesale sellers have been successfully reviewed. You will receive real-time alerts when new documentation is submitted.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b">
                <tr>
                  <th className="px-6 py-4">Company Details</th>
                  <th className="px-6 py-4">Sourcing Location</th>
                  <th className="px-6 py-4">Verification Files</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller) => {
                  const isPending = seller.verificationStatus === "pending" || seller.verificationStatus === "under_review"
                  const isLoading = seller._id === loadingSellerId

                  return (
                    <tr key={seller._id} className="border-b last:border-0 hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-sm sm:text-base">{seller.companyName}</div>
                        <div className="flex flex-col gap-0.5 mt-1.5 text-[10px] text-slate-400 font-semibold">
                          <div>Contact Email: {seller.contactInfo?.email}</div>
                          <div>Registered Rep: <span className="text-slate-600 font-bold">{seller.user?.name || "N/A"}</span></div>
                          {seller.contactInfo?.contactPerson && seller.contactInfo.contactPerson !== seller.user?.name && (
                            <div>Storefront Rep: <span className="text-slate-600 font-bold">{seller.contactInfo.contactPerson}</span></div>
                          )}
                          {seller.contactInfo?.contactPerson && seller.contactInfo.contactPerson === seller.user?.name && (
                            <div className="text-emerald-600 font-extrabold text-[9px] uppercase tracking-wide flex items-center gap-0.5 mt-0.5">
                              <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                              Same Registered Person
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 font-semibold text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {seller.contactInfo?.address || "Not specified"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {seller.verificationDocuments && seller.verificationDocuments.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {seller.verificationDocuments.map((doc: string, idx: number) => (
                              <a
                                key={idx}
                                href={doc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                              >
                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                File proof {idx + 1}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-semibold italic">No documents uploaded</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                            seller.verificationStatus === "approved"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : seller.verificationStatus === "rejected"
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}
                        >
                          {seller.verificationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right shrink-0">
                        {isPending && (
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleApprove(seller._id)}
                              disabled={isLoading}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold shadow-sm transition flex items-center gap-1 disabled:opacity-50"
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => triggerRejectFlow(seller._id)}
                              disabled={isLoading}
                              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold shadow-sm transition flex items-center gap-1 disabled:opacity-50"
                            >
                              <X className="w-3 h-3" />
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection modal overlay */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border p-6 w-full max-w-md shadow-2xl relative flex flex-col gap-4 animate-scale-up">
            <button
              onClick={() => setShowRejectModal(false)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-50 transition"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h4 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Auditing Feedback Required
            </h4>
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rejection Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ex. The uploaded GST Certificate copy is blurred or expired. Please upload a valid document."
                rows={4}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition resize-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 mt-2 shrink-0">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                Reject Sourcing Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
