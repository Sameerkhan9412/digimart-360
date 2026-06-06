"use client"

import React, { useState } from "react"
import { useToast } from "src/components/ui/Toast"
import { updateLeadStage, addLeadNote, triggerAILeadScoring } from "src/app/actions/leadActions"
import { MessageSquare, Calendar, ShieldCheck, User, Sparkles, PlusCircle, ArrowRight, X, Clock, HelpCircle } from "lucide-react"

interface CRMManagerProps {
  initialLeads: any[]
}

const STAGES = [
  { key: "new", label: "New Leads", color: "bg-slate-100 border-slate-200 text-slate-800" },
  { key: "contacted", label: "Contacted", color: "bg-sky-50 border-sky-100 text-sky-850" },
  { key: "qualified", label: "Qualified", color: "bg-indigo-50 border-indigo-100 text-indigo-850" },
  { key: "negotiation", label: "Negotiation", color: "bg-amber-50 border-amber-100 text-amber-850" },
  { key: "won", label: "Won", color: "bg-emerald-50 border-emerald-100 text-emerald-850" },
  { key: "lost", label: "Lost", color: "bg-rose-50 border-rose-100 text-rose-850" },
]

export default function CRMManager({ initialLeads }: CRMManagerProps) {
  const { toast } = useToast()
  const [leads, setLeads] = useState(initialLeads)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  
  // Note creation state
  const [noteText, setNoteText] = useState("")
  const [noteLoading, setNoteLoading] = useState(false)
  const [scoringLoading, setScoringLoading] = useState(false)

  const activeLead = leads.find((l) => l._id === selectedLeadId)

  const handleStageChange = async (leadId: string, newStage: any) => {
    try {
      const response = await updateLeadStage(leadId, newStage)
      if (response.success && response.lead) {
        toast(`Pipeline stage updated to ${newStage.toUpperCase()}.`, "success")
        // Update local state
        setLeads((prev) => prev.map((l) => (l._id === leadId ? response.lead : l)))
      } else {
        toast(response.error || "Failed to update pipeline stage.", "error")
      }
    } catch (err) {
      console.error(err)
      toast("Error shifting stage.", "error")
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLeadId || !noteText) return
    setNoteLoading(true)

    try {
      const response = await addLeadNote(selectedLeadId, noteText)
      if (response.success && response.lead) {
        toast("Follow-up note logged on timeline.", "success")
        setLeads((prev) => prev.map((l) => (l._id === selectedLeadId ? response.lead : l)))
        setNoteText("")
      } else {
        toast(response.error || "Failed to log note.", "error")
      }
    } catch (err) {
      console.error(err)
      toast("Error adding note.", "error")
    } finally {
      setNoteLoading(false)
    }
  }

  const handleAIScoreTrigger = async () => {
    if (!selectedLeadId) return
    setScoringLoading(true)
    try {
      const response = await triggerAILeadScoring(selectedLeadId)
      if (response.success && response.lead) {
        toast(`AI Score evaluated: ${response.lead.leadScore}/100`, "success")
        setLeads((prev) => prev.map((l) => (l._id === selectedLeadId ? response.lead : l)))
      } else {
        toast(response.error || "Error compiling score.", "error")
      }
    } catch (err) {
      console.error(err)
      toast("AI scoring error.", "error")
    } finally {
      setScoringLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start overflow-x-auto pb-4 shrink-0">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage.key)
          
          return (
            <div key={stage.key} className="flex flex-col gap-3 min-w-[200px] bg-slate-50 p-3.5 rounded-2xl border border-slate-150/50">
              <div className="flex justify-between items-center px-1">
                <span className="font-extrabold text-[10px] sm:text-xs text-slate-800 tracking-wide">{stage.label}</span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full shrink-0">
                  {stageLeads.length}
                </span>
              </div>

              {stageLeads.length === 0 ? (
                <div className="text-center py-8 text-[10px] text-slate-400 font-semibold border-2 border-dashed rounded-xl border-slate-200">
                  Empty Stage
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {stageLeads.map((lead) => {
                    const hasProduct = !!lead.product

                    return (
                      <div
                        key={lead._id}
                        onClick={() => setSelectedLeadId(lead._id)}
                        className={`bg-white border rounded-xl p-3 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col gap-2.5 ${
                          selectedLeadId === lead._id ? "border-primary ring-2 ring-primary/5" : "border-slate-150"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1 shrink-0">
                          <h5 className="font-bold text-slate-800 text-xs truncate max-w-[120px]">
                            {hasProduct ? lead.product.name : "RFQ General"}
                          </h5>
                          
                          {/* Score pill */}
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                            lead.leadScore >= 75
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : lead.leadScore >= 50
                              ? "bg-amber-50 text-amber-600 border border-amber-100"
                              : "bg-slate-50 text-slate-500"
                          }`}>
                            {lead.leadScore}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 font-medium line-clamp-2 leading-snug">
                          {lead.message}
                        </p>

                        <div className="flex items-center justify-between border-t border-slate-50 pt-2 shrink-0">
                          <span className="text-[9px] text-slate-400 font-bold truncate max-w-[100px]">
                            {lead.buyerDetails?.name}
                          </span>
                          <span className="text-[8px] text-slate-400 font-semibold">
                            Qty: {lead.quantity}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Detail overlay / right drawer representation */}
      {activeLead && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white border-l border-slate-100 shadow-2xl p-6 sm:p-8 flex flex-col justify-between animate-slide-in">
          
          <div className="flex flex-col gap-6 overflow-y-auto flex-1 pr-2">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-50 pb-4">
              <div>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Lead Details</span>
                <h4 className="font-extrabold text-slate-800 text-lg leading-tight mt-1">
                  RFQ for {activeLead.product?.name || "General specifications"}
                </h4>
              </div>
              <button
                onClick={() => setSelectedLeadId(null)}
                className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Buyer profile details block */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shrink-0">
              <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wide mb-3">Buyer Business Card</h5>
              <table className="w-full text-xs text-slate-600 border-collapse">
                <tbody>
                  <tr>
                    <td className="py-1.5 font-bold text-slate-400 w-24">Buyer:</td>
                    <td className="py-1.5 font-bold text-slate-800">{activeLead.buyerDetails?.name}</td>
                  </tr>
                  {activeLead.buyerDetails?.company && (
                    <tr>
                      <td className="py-1.5 font-bold text-slate-400">Company:</td>
                      <td className="py-1.5 font-semibold text-slate-850">{activeLead.buyerDetails.company}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-1.5 font-bold text-slate-400">Phone:</td>
                    <td className="py-1.5 font-semibold text-slate-850">{activeLead.buyerDetails?.phone}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-bold text-slate-400">Email:</td>
                    <td className="py-1.5 font-semibold text-slate-850">{activeLead.buyerDetails?.email}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-bold text-slate-400">Quantity:</td>
                    <td className="py-1.5 font-extrabold text-primary">{activeLead.quantity} units</td>
                  </tr>
                  {activeLead.targetPrice > 0 && (
                    <tr>
                      <td className="py-1.5 font-bold text-slate-400">Target Price:</td>
                      <td className="py-1.5 font-extrabold text-accent">INR {activeLead.targetPrice}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Inquiry Message Text */}
            <div className="shrink-0">
              <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wide mb-2">Original Inquiry</h5>
              <p className="text-xs text-slate-600 leading-relaxed bg-white border p-4 rounded-xl shadow-sm italic">
                "{activeLead.message}"
              </p>
            </div>

            {/* Stage shifter dropdown */}
            <div className="grid grid-cols-2 gap-4 shrink-0 border-t border-slate-50 pt-4 items-center">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pipeline Funnel Stage</label>
                <select
                  value={activeLead.status}
                  onChange={(e) => handleStageChange(activeLead._id, e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-slate-50/20"
                >
                  {STAGES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* AI Score trigger */}
              <div className="flex flex-col gap-1 justify-end h-full">
                <button
                  onClick={handleAIScoreTrigger}
                  disabled={scoringLoading}
                  className="py-2.5 rounded-xl border border-dashed border-primary text-primary hover:bg-primary/5 text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 h-10 mt-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {scoringLoading ? "Re-Scoring..." : "Run AI Evaluator"}
                </button>
              </div>
            </div>

            {/* Timeline Notes History */}
            <div className="border-t border-slate-50 pt-4 shrink-0 flex flex-col gap-4">
              <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wide">Inquiry History & Notes</h5>
              
              <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1">
                {activeLead.notes && activeLead.notes.map((note: any, nIdx: number) => (
                  <div key={nIdx} className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 flex flex-col gap-1">
                    <div className="flex justify-between items-baseline text-[9px] text-slate-400 font-bold uppercase">
                      <span>{note.author}</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(note.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-650 font-semibold">{note.text}</p>
                  </div>
                ))}
              </div>

              {/* Write note form */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Write a client follow-up note..."
                  required
                  className="flex-1 text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-slate-50/20"
                />
                <button
                  type="submit"
                  disabled={noteLoading}
                  className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm transition shrink-0"
                >
                  Add
                </button>
              </form>
            </div>

          </div>

          <div className="border-t border-slate-100 pt-4 mt-6 flex gap-3 shrink-0">
            <a
              href={`tel:${activeLead.buyerDetails?.phone}`}
              className="flex-1 text-center py-3 rounded-xl border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-extrabold transition"
            >
              Call Buyer
            </a>
            <a
              href={`mailto:${activeLead.buyerDetails?.email}?subject=Inquiry%2520Response%2520-%2520${encodeURIComponent(activeLead.product?.name || "DIGIMART360")}`}
              className="flex-1 text-center py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-extrabold transition"
            >
              Email Reply
            </a>
          </div>

        </div>
      )}

    </div>
  )
}
