"use client"

import React, { useState } from "react"
import { useToast } from "src/components/ui/Toast"
import { updateSellerStorefront } from "src/app/actions/storefrontActions"
import { Sparkles, Plus, Trash, Check, Sliders, Image, Award, HeartHandshake } from "lucide-react"

interface TimelineNodeInput {
  year: number
  title: string
  description: string
}

interface StorefrontCustomizerProps {
  initialSeller: any
}

export default function StorefrontCustomizer({ initialSeller }: StorefrontCustomizerProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Form State
  const [companyName, setCompanyName] = useState(initialSeller.companyName || "")
  const [about, setAbout] = useState(initialSeller.about || "")
  const [logo, setLogo] = useState(initialSeller.logo || "")
  const [banner, setBanner] = useState(initialSeller.banner || "")
  
  const [phone, setPhone] = useState(initialSeller.contactInfo?.phone || "")
  const [email, setEmail] = useState(initialSeller.contactInfo?.email || "")
  const [address, setAddress] = useState(initialSeller.contactInfo?.address || "")
  const [whatsapp, setWhatsapp] = useState(initialSeller.contactInfo?.whatsapp || "")
  const [contactPerson, setContactPerson] = useState(initialSeller.contactInfo?.contactPerson || "")
  const [useRegisteredDetails, setUseRegisteredDetails] = useState(false)

  const [timeline, setTimeline] = useState<TimelineNodeInput[]>(initialSeller.timeline || [])
  const [certifications, setCertifications] = useState<string[]>(initialSeller.certifications || [])
  const [newCert, setNewCert] = useState("")

  // Theme state
  const [primaryColor, setPrimaryColor] = useState(initialSeller.customTheme?.primaryColor || "#009E49")
  const [secondaryColor, setSecondaryColor] = useState(initialSeller.customTheme?.secondaryColor || "#0F4C5C")
  const [font, setFont] = useState(initialSeller.customTheme?.font || "Plus Jakarta Sans")
  const [layoutVariant, setLayoutVariant] = useState(initialSeller.customTheme?.layoutVariant || "modern")

  const handleAddTimeline = () => {
    setTimeline((prev) => [...prev, { year: new Date().getFullYear(), title: "", description: "" }])
  }

  const handleRemoveTimeline = (index: number) => {
    setTimeline((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleUpdateTimeline = (index: number, key: keyof TimelineNodeInput, value: any) => {
    setTimeline((prev) =>
      prev.map((node, idx) => (idx === index ? { ...node, [key]: value } : node))
    )
  }

  const handleAddCert = () => {
    if (!newCert) return
    if (certifications.includes(newCert)) return toast("Certification already added.", "warning")
    setCertifications((prev) => [...prev, newCert])
    setNewCert("")
  }

  const handleRemoveCert = (certName: string) => {
    setCertifications((prev) => prev.filter((c) => c !== certName))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      companyName,
      about,
      logo,
      banner,
      phone,
      email,
      address,
      whatsapp,
      contactPerson,
      timeline,
      certifications,
      theme: {
        primaryColor,
        secondaryColor,
        font,
        layoutVariant,
      },
    }

    try {
      const response = await updateSellerStorefront(payload)
      if (response.success) {
        toast("Storefront customizations saved successfully! Visitable on your store page.", "success")
      } else {
        toast(response.error || "Failed to update storefront.", "error")
      }
    } catch (err) {
      console.error(err)
      toast("Error updating store.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
      
      {/* Left Columns: Config parameters */}
      <div className="lg:col-span-8 flex flex-col gap-6 w-full shrink-0">
        
        {/* Company profile */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
          <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase mb-2 border-b border-slate-50 pb-3 flex items-center gap-1.5">
            <Sliders className="w-4.5 h-4.5 text-primary" />
            Company details
          </h3>

          <div className="flex items-center gap-2 bg-slate-50/50 p-3.5 rounded-xl border border-dashed border-slate-200">
            <input
              type="checkbox"
              id="same-person"
              checked={useRegisteredDetails}
              onChange={(e) => {
                const checked = e.target.checked
                setUseRegisteredDetails(checked)
                if (checked) {
                  if (initialSeller.user?.name) {
                    setContactPerson(initialSeller.user.name)
                  }
                  if (initialSeller.user?.email) {
                    setEmail(initialSeller.user.email)
                  }
                  toast("Populated details from registration profile!", "success")
                }
              }}
              className="w-4 h-4 rounded text-primary border-slate-350 focus:ring-primary cursor-pointer"
            />
            <label htmlFor="same-person" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
              Same as registered representative details ({initialSeller.user?.name || "Representative"})
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Person / Rep</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="E.g. Sameer"
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Business Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">WhatsApp (CTA)</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="E.g. 9876543210"
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sourcing Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Company Overview (About)</label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={4}
              placeholder="Describe your manufacturing, logistics and quality assurance operations..."
              className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Banner Images URLs */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
          <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase mb-2 border-b border-slate-50 pb-3 flex items-center gap-1.5">
            <Image className="w-4.5 h-4.5 text-primary" />
            Media Brand assets
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Logo Image URL</label>
              <input
                type="text"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Banner Background URL</label>
              <input
                type="text"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Company Timelines milestones */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3 mb-2">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase flex items-center gap-1.5">
              <HeartHandshake className="w-4.5 h-4.5 text-primary" />
              Company history timeline
            </h3>
            <button
              type="button"
              onClick={handleAddTimeline}
              className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline border border-dashed border-primary/40 px-2.5 py-1 rounded-lg"
            >
              <Plus className="w-3 h-3" />
              Add Milestone
            </button>
          </div>

          {timeline.length === 0 && (
            <p className="text-[10px] text-slate-400 font-medium italic p-3 text-center border rounded-xl border-dashed bg-slate-50/20">
              No milestones defined. Timelines build buyer trust.
            </p>
          )}

          {timeline.map((node, index) => (
            <div key={index} className="flex flex-col gap-3 p-3.5 border border-slate-150 rounded-xl bg-slate-50/20 relative">
              <button
                type="button"
                onClick={() => handleRemoveTimeline(index)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-rose-500 rounded p-1 hover:bg-slate-100 transition"
              >
                <Trash className="w-3.5 h-3.5" />
              </button>

              <div className="grid grid-cols-12 gap-2 pr-6">
                <div className="col-span-3 flex flex-col gap-0.5">
                  <label className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Year</label>
                  <input
                    type="number"
                    value={node.year}
                    onChange={(e) => handleUpdateTimeline(index, "year", parseInt(e.target.value) || 2026)}
                    className="w-full text-[10px] font-bold p-2 rounded-lg border border-slate-200 outline-none bg-white"
                  />
                </div>
                <div className="col-span-9 flex flex-col gap-0.5">
                  <label className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Milestone Title</label>
                  <input
                    type="text"
                    placeholder="E.g. ISO Certification Approved, Spun Mill opened"
                    value={node.title}
                    onChange={(e) => handleUpdateTimeline(index, "title", e.target.value)}
                    className="w-full text-[10px] font-bold p-2 rounded-lg border border-slate-200 outline-none bg-white"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Details</label>
                <input
                  type="text"
                  placeholder="Describe details regarding this trade achievement..."
                  value={node.description}
                  onChange={(e) => handleUpdateTimeline(index, "description", e.target.value)}
                  className="w-full text-[10px] font-semibold p-2 rounded-lg border border-slate-200 outline-none bg-white"
                />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Right Column: Theme styles & Certifications */}
      <div className="lg:col-span-4 flex flex-col gap-6 w-full lg:sticky lg:top-20 shrink-0">
        
        {/* Themes Settings */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h4 className="font-extrabold text-slate-800 text-xs tracking-wider uppercase mb-2 border-b border-slate-50 pb-3 flex items-center gap-1.5">
            <Sliders className="w-4.5 h-4.5 text-primary" />
            Storefront Theme Customizer
          </h4>

          {/* Color pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Primary Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border shrink-0"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full text-[10px] font-bold p-1 border rounded"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Secondary Accent</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border shrink-0"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full text-[10px] font-bold p-1 border rounded"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Layout typography</label>
            <select
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none"
            >
              <option value="Plus Jakarta Sans">Plus Jakarta Sans (Soft Corporate)</option>
              <option value="Outfit">Outfit (Modern Tech SaaS)</option>
              <option value="Inter">Inter (Standard Grid)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Layout variant template</label>
            <select
              value={layoutVariant}
              onChange={(e) => setLayoutVariant(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none"
            >
              <option value="modern">Modern Layout (Cover banner focus)</option>
              <option value="minimal">Minimal Layout (Clean listings focus)</option>
              <option value="bold">Bold Layout (Highlights badges)</option>
            </select>
          </div>
        </div>

        {/* Certifications Card list */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h4 className="font-extrabold text-slate-800 text-xs tracking-wider uppercase mb-2 border-b border-slate-50 pb-3 flex items-center gap-1.5">
            <Award className="w-4.5 h-4.5 text-primary" />
            Store Certifications
          </h4>

          <div className="flex gap-2">
            <input
              type="text"
              value={newCert}
              onChange={(e) => setNewCert(e.target.value)}
              placeholder="E.g. ISO 9001, WHO-GMP"
              className="flex-1 text-[11px] font-semibold p-2 rounded-lg border border-slate-200 outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleAddCert}
              className="px-3 py-2 bg-primary hover:bg-primary-hover text-white text-[10px] font-bold rounded-lg transition shrink-0"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {certifications.map((c) => (
              <span
                key={c}
                className="px-2.5 py-1 rounded-lg bg-slate-50 text-[10px] font-bold border border-slate-150 text-slate-600 flex items-center gap-1 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500 transition cursor-pointer"
                onClick={() => handleRemoveCert(c)}
                title="Click to remove"
              >
                {c}
                <Trash className="w-3 h-3 shrink-0" />
              </span>
            ))}
          </div>
        </div>

        {/* Main Save action */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-extrabold tracking-wide transition shadow-lg shadow-primary/25 flex items-center justify-center gap-1.5 shrink-0"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Save Storefront Settings"
          )}
        </button>

      </div>

    </form>
  )
}
