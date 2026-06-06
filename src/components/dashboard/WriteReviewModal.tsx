"use client"

import React, { useState } from "react"
import { useToast } from "src/components/ui/Toast"
import { createProductReview } from "src/app/actions/reviewActions"
import { Star, X, Sparkles, MessageSquare, ShieldCheck } from "lucide-react"

interface WriteReviewModalProps {
  leadId: string
  productName: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function WriteReviewModal({
  leadId,
  productName,
  isOpen,
  onClose,
  onSuccess
}: WriteReviewModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast("Please select a rating of at least 1 star.", "error")
      return
    }

    if (comment.trim().length < 5) {
      toast("Please write a review comment of at least 5 characters.", "error")
      return
    }

    setLoading(true)

    try {
      const response = await createProductReview({
        leadId,
        rating,
        comment,
      })

      if (response.success) {
        toast("Thank you! Your product review has been submitted successfully.", "success")
        onSuccess()
        onClose()
      } else {
        toast(response.error || "Failed to submit review.", "error")
      }
    } catch (err: any) {
      console.error(err)
      toast("An unexpected error occurred during submission.", "error")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl z-10 overflow-hidden transform transition-all animate-fade-in-up">
        {/* Top brand stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-secondary"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-1.5 mb-6 border-b border-slate-50 dark:border-slate-800/40 pb-4">
          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 self-start">
            <ShieldCheck className="w-3 h-3 text-primary" />
            Verified Purchase Review
          </span>
          <h3 className="text-lg font-extrabold text-slate-850 dark:text-white mt-1">
            Review Sourced Product
          </h3>
          <p className="text-xs text-slate-400 font-semibold truncate">
            {productName}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Star selector */}
          <div className="flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Rate your experience
            </span>
            <div className="flex items-center gap-2.5 my-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isLit = star <= (hoverRating || rating)
                return (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-110 transition duration-100 outline-none"
                  >
                    <Star 
                      className={`w-8 h-8 transition-colors ${
                        isLit 
                          ? "fill-amber-400 text-amber-400 animate-pulse" 
                          : "text-slate-300 dark:text-slate-705"
                      }`} 
                    />
                  </button>
                )
              })}
            </div>
            <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wide h-4">
              {rating === 1 && "Poor Quality"}
              {rating === 2 && "Below Average"}
              {rating === 3 && "Average Performance"}
              {rating === 4 && "Great wholesale product!"}
              {rating === 5 && "Outstanding manufacturer!"}
            </span>
          </div>

          {/* Comment text-area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Review Details
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe product quality, supplier delivery, packaging, and general manufacturing standards..."
              className="w-full text-xs font-semibold p-4 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white resize-none"
            />
            <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                Min. 5 characters required
              </span>
              <span>{comment.length} characters</span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 mt-4 border-t border-slate-50 dark:border-slate-800/40 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 border border-slate-200 dark:border-slate-805 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 text-xs font-bold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0 || comment.trim().length < 5}
              className="w-1/2 py-3 bg-accent hover:bg-accent-hover disabled:bg-slate-100 dark:disabled:bg-slate-850 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md shadow-accent/10 transition flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
