"use client"

import React, { useState, useEffect, useRef } from "react"
import { useToast } from "src/components/ui/Toast"
import { createLeadInquiry } from "src/app/actions/leadActions"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Mail,
  Phone,
  Building2,
  HelpCircle,
  Sparkles,
  Search,
  ChevronDown,
  Check,
  Package,
  Store,
  DollarSign,
  AlertTriangle,
  FileText,
  BadgePercent,
  TrendingUp,
  MapPin,
  ShieldCheck,
  CheckSquare,
  Square,
  ArrowRight,
  ArrowLeft,
  ThumbsUp
} from "lucide-react"

interface SellerData {
  _id: string
  companyName: string
  slug: string
  logo?: string
  isVerified: boolean
  contactInfo: {
    phone: string
    email: string
    address?: string
    whatsapp?: string
    contactPerson?: string
  }
}

interface ProductData {
  _id: string
  name: string
  slug: string
  seller: string
  price: number
  unit: string
  minOrderQuantity: number
  images: string[]
}

interface NewInquiryFormProps {
  user: {
    id: string
    name: string
    email: string
    role: "admin" | "seller" | "buyer"
    phone?: string
    company?: string
  }
  sellers: SellerData[]
  products: ProductData[]
  initialSellerSlug?: string | null
  initialProductSlug?: string | null
}

export default function NewInquiryForm({
  user,
  sellers,
  products,
  initialSellerSlug,
  initialProductSlug
}: NewInquiryFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submittedLead, setSubmittedLead] = useState<any>(null)

  // Form Field States
  const [selectedSeller, setSelectedSeller] = useState<SellerData | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [targetPrice, setTargetPrice] = useState<number>(0)
  const [message, setMessage] = useState<string>("")
  
  // Buyer Details
  const [buyerName, setBuyerName] = useState<string>(user.name || "")
  const [buyerEmail, setBuyerEmail] = useState<string>(user.email || "")
  const [buyerPhone, setBuyerPhone] = useState<string>(user.phone || "")
  const [buyerCompany, setBuyerCompany] = useState<string>(user.company || "")

  // Dropdown States
  const [sellerSearch, setSellerSearch] = useState("")
  const [showSellerDropdown, setShowSellerDropdown] = useState(false)
  const [productSearch, setProductSearch] = useState("")
  const [showProductDropdown, setShowProductDropdown] = useState(false)

  // Refs for closing dropdowns on outside click
  const sellerRef = useRef<HTMLDivElement>(null)
  const productRef = useRef<HTMLDivElement>(null)

  // Handle Initial State from parameters
  useEffect(() => {
    // 1. Resolve product slug if present
    const pSlug = initialProductSlug || searchParams.get("product")
    if (pSlug) {
      const prod = products.find(p => p.slug === pSlug || p._id === pSlug)
      if (prod) {
        setSelectedProduct(prod)
        setQuantity(prod.minOrderQuantity || 1)
        // Find seller for this product
        const sell = sellers.find(s => s._id === prod.seller)
        if (sell) {
          setSelectedSeller(sell)
        }
      }
    } else {
      // 2. Resolve seller slug if present
      const sSlug = initialSellerSlug || searchParams.get("seller")
      if (sSlug) {
        const sell = sellers.find(s => s.slug === sSlug || s._id === sSlug)
        if (sell) {
          setSelectedSeller(sell)
        }
      }
    }
  }, [initialSellerSlug, initialProductSlug, searchParams, sellers, products])

  // Click Outside Hook
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sellerRef.current && !sellerRef.current.contains(event.target as Node)) {
        setShowSellerDropdown(false)
      }
      if (productRef.current && !productRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter lists based on searches
  const filteredSellers = sellers.filter(s =>
    s.companyName.toLowerCase().includes(sellerSearch.toLowerCase())
  )

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase())
    if (selectedSeller) {
      return matchesSearch && p.seller === selectedSeller._id
    }
    return matchesSearch
  })

  // Handle selections
  const handleSelectSeller = (seller: SellerData) => {
    setSelectedSeller(seller)
    setSellerSearch("")
    setShowSellerDropdown(false)

    // If there is currently selected product, check if it belongs to this seller. If not, reset it.
    if (selectedProduct && selectedProduct.seller !== seller._id) {
      setSelectedProduct(null)
    }
  }

  const handleSelectProduct = (product: ProductData) => {
    setSelectedProduct(product)
    setQuantity(product.minOrderQuantity || 1)
    setProductSearch("")
    setShowProductDropdown(false)

    // Find and set its seller
    const sell = sellers.find(s => s._id === product.seller)
    if (sell) {
      setSelectedSeller(sell)
    }
  }

  const handleClearSeller = () => {
    setSelectedSeller(null)
    setSelectedProduct(null)
  }

  const handleClearProduct = () => {
    setSelectedProduct(null)
  }

  // Preset click helpers for quantity
  const setQuantityPreset = (val: number) => {
    if (selectedProduct && val < selectedProduct.minOrderQuantity) {
      setQuantity(selectedProduct.minOrderQuantity)
      toast(`Adjusted to supplier minimum order quantity (${selectedProduct.minOrderQuantity} units)`, "info")
    } else {
      setQuantity(val)
    }
  }

  // RFQ Quality Analyzer
  const getRFQStrength = () => {
    const len = message.trim().length
    if (len === 0) return { label: "Empty", score: 0, color: "text-slate-350 bg-slate-100", bar: "w-0 bg-slate-300", tip: "Briefly outline your sourcing goals, materials, sizes, and destination." }
    if (len < 15) return { label: "Very Weak", score: 20, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/20", bar: "w-1/5 bg-rose-500", tip: "Inquiries need at least 10 characters, but manufacturers ignore briefs. Add specifications!" }
    if (len < 50) return { label: "Decent Sourcing Inquiry", score: 50, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20", bar: "w-1/2 bg-amber-500", tip: "Great. Mention customized design, packing criteria, and delivery deadlines for better bids." }
    if (len < 120) return { label: "Highly Solid Brief", score: 85, color: "text-primary bg-primary/10", bar: "w-[85%] bg-primary", tip: "Excellent specifications list! This lead will achieve top AI scoring ranks on supplier CRM dashboards." }
    return { label: "Outstanding RFQ Detail!", score: 100, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20", bar: "w-full bg-indigo-600", tip: "Outstanding layout! Suppliers value precision. Your request is fully detailed." }
  }

  const strength = getRFQStrength()

  // Form checklist verification
  const checklist = {
    sellerChosen: !!selectedSeller,
    moqMet: selectedProduct ? quantity >= selectedProduct.minOrderQuantity : true,
    priceSet: targetPrice > 0,
    descSolid: message.trim().length >= 10,
    buyerDetailsFilled: buyerName.trim().length >= 2 && buyerEmail.includes("@") && buyerPhone.trim().length >= 10
  }

  const checklistTotal = Object.values(checklist).filter(Boolean).length

  // Submit Logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedSeller) {
      toast("Please select a target supplier.", "error")
      return
    }

    if (message.trim().length < 10) {
      toast("Please specify a description of at least 10 characters.", "error")
      return
    }

    if (buyerPhone.trim().length < 10) {
      toast("Please enter a valid 10-digit phone number.", "error")
      return
    }

    setLoading(true)

    const payload = {
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerCompany,
      message,
      quantity,
      targetPrice,
      seller: selectedSeller._id,
      product: selectedProduct ? selectedProduct._id : undefined
    }

    try {
      const response = await createLeadInquiry(payload)
      if (response.success) {
        setSubmittedLead(response.lead)
        setSuccess(true)
        toast("Sourcing RFQ has been successfully sent to supplier!", "success")
      } else {
        toast(response.error || "Failed to submit sourcing inquiry.", "error")
      }
    } catch (err: any) {
      console.error(err)
      toast("An unexpected error occurred during submission.", "error")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl text-center relative overflow-hidden">
          {/* Top colored accent glow */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-emerald-500 to-accent"></div>
          
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-3xl mx-auto mb-6 animate-pulse border border-emerald-500/20">
            ✓
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
            RFQ Submitted Successfully!
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-3 max-w-lg mx-auto leading-relaxed">
            Your wholesale specifications sheet has been scoring-prioritized and dispatched directly to the supplier panel. You will receive email alerts upon replies.
          </p>

          {/* Details summary */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 text-left border border-slate-100 dark:border-slate-800/60 my-8 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200/50 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recipient Supplier</span>
              <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-primary" />
                {selectedSeller?.companyName}
              </span>
            </div>

            {selectedProduct && (
              <div className="flex justify-between items-center pb-3 border-b border-slate-200/50 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inquired Catalog Item</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[220px]">
                  {selectedProduct.name}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200/50 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Quantity</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-white mt-1 block">
                  {quantity} {selectedProduct ? selectedProduct.unit : "units"}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target Unit Price</span>
                <span className="text-sm font-extrabold text-accent mt-1 block">
                  {targetPrice > 0 ? `INR ${targetPrice}` : "Not Specified (Negotiable)"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">AI Lead Score</span>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  <Sparkles className="w-3 h-3 text-primary animate-spin" />
                  Priority Score: {submittedLead?.leadScore || 80}/100
                </span>
                <span className="text-[10px] text-slate-400 italic font-semibold">Priority dispatch completed.</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={() => router.push("/buyer")}
              className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/15 transition flex items-center justify-center gap-1.5"
            >
              Go to Sent Inquiries
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSuccess(false)
                setSelectedSeller(null)
                setSelectedProduct(null)
                setMessage("")
                setQuantity(1)
                setTargetPrice(0)
                setSubmittedLead(null)
              }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl transition"
            >
              Post Another RFQ
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full max-w-6xl mx-auto pb-16">
      
      {/* Left Column: Form Card */}
      <div className="flex-1 w-full flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6 relative">
          
          {/* Header Info */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2 font-sans">
                <FileText className="w-5 h-5 text-primary" />
                Submit Sourcing Request (RFQ)
              </h2>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Provide sourcing requirements below to get direct quotes from suppliers.
              </p>
            </div>
            
            {/* Top Indicator */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="text-[10px] font-bold text-slate-450 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 border px-3 py-1 rounded-full flex items-center gap-1.5 select-none">
                <CheckSquare className="w-3.5 h-3.5 text-primary" />
                {checklistTotal}/5 Checklist
              </span>
            </div>
          </div>

          {/* Supplier Selector */}
          <div className="flex flex-col gap-2" ref={sellerRef}>
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              1. Target Manufacturer <span className="text-rose-500">*</span>
            </label>
            
            {selectedSeller ? (
              // Selected Seller Badge Layout
              <div className="flex items-center justify-between p-3 border-2 border-primary/20 bg-primary/5 rounded-2xl transition-all duration-300">
                <div className="flex items-center gap-3">
                  {selectedSeller.logo ? (
                    <img src={selectedSeller.logo} alt={selectedSeller.companyName} className="w-10 h-10 rounded-xl object-cover border bg-white" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase">
                      {selectedSeller.companyName.substring(0, 2)}
                    </div>
                  )}
                  <div>
                    <h5 className="font-extrabold text-slate-850 dark:text-slate-200 text-xs sm:text-sm flex items-center gap-1">
                      {selectedSeller.companyName}
                      {selectedSeller.isVerified && (
                        <span className="text-[9px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.2 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          Verified
                        </span>
                      )}
                    </h5>
                    {selectedSeller.contactInfo?.address && (
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {selectedSeller.contactInfo.address}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearSeller}
                  className="px-3 py-1.5 border border-slate-200 hover:border-rose-200 dark:border-slate-800 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/20 rounded-xl text-[10px] font-bold transition text-slate-500"
                >
                  Change
                </button>
              </div>
            ) : (
              // Dropdown Input Layout
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSellerDropdown(!showSellerDropdown)}
                  className="w-full flex items-center justify-between p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl text-left text-xs font-semibold text-slate-400 hover:border-primary transition bg-slate-50/50 dark:bg-slate-950"
                >
                  <span className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-slate-400 shrink-0" />
                    {sellerSearch ? sellerSearch : "Search and select a supplier..."}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 transition" />
                </button>

                {showSellerDropdown && (
                  <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-60 flex flex-col animate-fade-in-down">
                    <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-950">
                      <Search className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Type to filter suppliers..."
                        value={sellerSearch}
                        onChange={(e) => setSellerSearch(e.target.value)}
                        className="w-full bg-transparent border-0 text-xs font-bold outline-none text-slate-800 dark:text-white"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto flex-1 py-1">
                      {filteredSellers.length === 0 ? (
                        <div className="p-4 text-center text-[11px] text-slate-400 font-semibold italic">No matching suppliers found.</div>
                      ) : (
                        filteredSellers.map((sell) => (
                          <button
                            type="button"
                            key={sell._id}
                            onClick={() => handleSelectSeller(sell)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left border-b border-slate-50 dark:border-slate-800/10 last:border-0 transition"
                          >
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                              {sell.companyName.substring(0, 2)}
                            </div>
                            <div className="truncate">
                              <h6 className="font-extrabold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1">
                                {sell.companyName}
                                {sell.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                              </h6>
                              <span className="text-[9px] text-slate-400 font-semibold">{sell.contactInfo?.address || "Verified Supplier"}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Selector */}
          <div className="flex flex-col gap-2" ref={productRef}>
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              2. Catalog Item <span className="text-slate-400">(Optional)</span>
            </label>
            
            {selectedProduct ? (
              // Selected Product Badge Layout
              <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl transition-all duration-300">
                <div className="flex items-center gap-3">
                  {selectedProduct.images?.[0] ? (
                    <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-10 h-10 rounded-xl object-cover border bg-white" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm uppercase">
                      <Package className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <h5 className="font-extrabold text-slate-850 dark:text-slate-200 text-xs sm:text-sm line-clamp-1 max-w-[280px]">
                      {selectedProduct.name}
                    </h5>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-2 mt-0.5">
                      <span>Wholesale: INR {selectedProduct.price} / {selectedProduct.unit}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>Min Order: {selectedProduct.minOrderQuantity} {selectedProduct.unit}s</span>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearProduct}
                  className="px-3 py-1.5 border border-slate-200 hover:border-rose-200 dark:border-slate-800 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/20 rounded-xl text-[10px] font-bold transition text-slate-500"
                >
                  Clear
                </button>
              </div>
            ) : (
              // Dropdown Input Layout
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProductDropdown(!showProductDropdown)}
                  className="w-full flex items-center justify-between p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl text-left text-xs font-semibold text-slate-400 hover:border-primary transition bg-slate-50/50 dark:bg-slate-950"
                >
                  <span className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-400 shrink-0" />
                    {selectedSeller ? `Show all ${selectedSeller.companyName} products...` : "Select a product..."}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 transition" />
                </button>

                {showProductDropdown && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-60 flex flex-col animate-fade-in-down">
                    <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-950">
                      <Search className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Type to filter products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full bg-transparent border-0 text-xs font-bold outline-none text-slate-800 dark:text-white"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto flex-1 py-1">
                      {filteredProducts.length === 0 ? (
                        <div className="p-4 text-center text-[11px] text-slate-400 font-semibold italic">No products match search criteria.</div>
                      ) : (
                        filteredProducts.map((prod) => (
                          <button
                            type="button"
                            key={prod._id}
                            onClick={() => handleSelectProduct(prod)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left border-b border-slate-50 dark:border-slate-800/10 last:border-0 transition"
                          >
                            {prod.images?.[0] ? (
                              <img src={prod.images[0]} alt={prod.name} className="w-8 h-8 rounded object-cover border shrink-0 bg-white" />
                            ) : (
                              <div className="w-8 h-8 rounded bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                            <div className="truncate">
                              <h6 className="font-extrabold text-xs text-slate-700 dark:text-slate-200 truncate">{prod.name}</h6>
                              <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-semibold mt-0.5">
                                <span>INR {prod.price} / {prod.unit}</span>
                                <span>•</span>
                                <span>Min Qty: {prod.minOrderQuantity}</span>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sourcing Specifications (Qty & Target Price) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Required Quantity */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                3. Order Quantity ({selectedProduct ? selectedProduct.unit + "s" : "units"}) <span className="text-rose-500">*</span>
              </label>
              
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden focus-within:border-primary transition bg-slate-50/50 dark:bg-slate-950">
                <button
                  type="button"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 10))}
                  className="px-4 py-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-bold transition text-sm"
                >
                  -10
                </button>
                <input
                  type="number"
                  required
                  min={selectedProduct ? selectedProduct.minOrderQuantity : 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full text-center bg-transparent border-0 outline-none text-xs font-extrabold text-slate-850 dark:text-white py-3"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(prev => prev + 10)}
                  className="px-4 py-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-bold transition text-sm"
                >
                  +10
                </button>
              </div>

              {/* Quantity Preset Pill Buttons */}
              <div className="flex flex-wrap gap-1.5 mt-1">
                {[50, 100, 500, 1000, 5000].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setQuantityPreset(preset)}
                    className={`text-[9px] font-extrabold px-2.5 py-1 rounded-lg border transition ${
                      quantity === preset
                        ? "bg-primary text-white border-primary"
                        : "bg-white hover:bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* MOQ warning badge */}
              {selectedProduct && quantity < selectedProduct.minOrderQuantity && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-3 py-1.5 rounded-xl border border-rose-100 dark:border-rose-950/30 mt-2 select-none animate-shake">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Warning: Supplier Minimum Order Quantity is {selectedProduct.minOrderQuantity} {selectedProduct.unit}s.
                </div>
              )}
            </div>

            {/* Target Price */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                4. Target Price / Unit <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
              </label>
              
              <div className="relative">
                <input
                  type="number"
                  placeholder="E.g. 1500"
                  min={0}
                  value={targetPrice || ""}
                  onChange={(e) => setTargetPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full text-xs font-bold pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  INR
                </span>
              </div>

              {selectedProduct && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-slate-400" />
                  Catalog Price: INR {selectedProduct.price} / {selectedProduct.unit}
                </span>
              )}
            </div>
          </div>

          {/* Sourcing details message */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-405 dark:text-slate-500">
                5. Sourcing Requirements <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">
                {message.length} characters
              </span>
            </div>

            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`E.g. We are looking to purchase wholesale quantities of this item. Please provide delivery timelines to Mumbai, custom logo branding details, and pricing schedules for larger orders.`}
              className="w-full text-xs font-semibold p-4 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white resize-none"
            />

            {/* Live RFQ strength indicator */}
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 mt-1 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">RFQ Strength:</span>
                <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${strength.color}`}>
                  {strength.label}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${strength.bar}`}></div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed">
                {strength.tip}
              </p>
            </div>
          </div>

          {/* Buyer credentials section */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-2 flex flex-col gap-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-505 dark:text-slate-400 flex items-center gap-1">
              <Building2 className="w-4 h-4 text-primary" />
              6. Buyer Contact Information
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              These details will be securely shared with the supplier so they can issue verified business quotes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full text-xs font-semibold p-3 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary transition bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Company Name</label>
                <input
                  type="text"
                  value={buyerCompany}
                  onChange={(e) => setBuyerCompany(e.target.value)}
                  placeholder="Optional"
                  className="w-full text-xs font-semibold p-3 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary transition bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Business Email</label>
                <input
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full text-xs font-semibold p-3 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary transition bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Phone / WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="Enter 10-digit number"
                  className="w-full text-xs font-semibold p-3 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary transition bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-4">
            <button
              type="submit"
              disabled={loading || (selectedProduct ? quantity < selectedProduct.minOrderQuantity : false)}
              className="w-full py-4 bg-accent hover:bg-accent-hover disabled:bg-slate-100 dark:disabled:bg-slate-850 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl shadow-lg shadow-accent/15 transition flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Submit Sourcing Inquiry</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-3 flex items-center justify-center gap-1 font-semibold leading-relaxed">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              Quotes are dispatched securely under DIGIMART360 wholesale agreements.
            </p>
          </div>

        </form>
      </div>

      {/* Right Column: Sourcing Advice & Checklists */}
      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
        
        {/* Interactive progress checklist */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5 border-b border-slate-50 dark:border-slate-850 pb-4 mb-4">
            <CheckSquare className="w-4.5 h-4.5 text-primary" />
            RFQ Checklist
          </h3>

          <ul className="flex flex-col gap-4">
            <li className="flex gap-2.5 items-start">
              {checklist.sellerChosen ? (
                <Check className="w-4.5 h-4.5 text-emerald-500 border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-0.5 shrink-0" />
              ) : (
                <Square className="w-4.5 h-4.5 text-slate-300 dark:text-slate-700 shrink-0" />
              )}
              <div className="flex flex-col">
                <span className={`text-[11px] font-extrabold ${checklist.sellerChosen ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                  Select Target Supplier
                </span>
                <span className="text-[9px] text-slate-400 leading-normal">Required reference to direct RFQ.</span>
              </div>
            </li>

            <li className="flex gap-2.5 items-start">
              {selectedProduct ? (
                <Check className="w-4.5 h-4.5 text-emerald-500 border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-0.5 shrink-0" />
              ) : (
                <Square className="w-4.5 h-4.5 text-slate-350 dark:text-slate-750 shrink-0" />
              )}
              <div className="flex flex-col">
                <span className={`text-[11px] font-extrabold ${selectedProduct ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                  Choose Catalog Item
                </span>
                <span className="text-[9px] text-slate-400 leading-normal">Optional. Specific product catalog attachment.</span>
              </div>
            </li>

            <li className="flex gap-2.5 items-start">
              {checklist.moqMet ? (
                <Check className="w-4.5 h-4.5 text-emerald-500 border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-4.5 h-4.5 text-rose-500 border border-rose-200 bg-rose-50 dark:bg-rose-950/20 rounded-lg p-0.5 shrink-0 animate-bounce" />
              )}
              <div className="flex flex-col">
                <span className={`text-[11px] font-extrabold ${checklist.moqMet ? 'text-slate-700 dark:text-slate-300' : 'text-rose-500'}`}>
                  Meet Supplier MOQ
                </span>
                <span className="text-[9px] text-slate-400 leading-normal">Ensure order quantity is above supplier minimum.</span>
              </div>
            </li>

            <li className="flex gap-2.5 items-start">
              {checklist.priceSet ? (
                <Check className="w-4.5 h-4.5 text-emerald-500 border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-0.5 shrink-0" />
              ) : (
                <Square className="w-4.5 h-4.5 text-slate-350 dark:text-slate-750 shrink-0" />
              )}
              <div className="flex flex-col">
                <span className={`text-[11px] font-extrabold ${checklist.priceSet ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                  Specify Target Budget
                </span>
                <span className="text-[9px] text-slate-400 leading-normal">Define unit target cost in INR (optional).</span>
              </div>
            </li>

            <li className="flex gap-2.5 items-start">
              {checklist.descSolid ? (
                <Check className="w-4.5 h-4.5 text-emerald-500 border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-0.5 shrink-0" />
              ) : (
                <Square className="w-4.5 h-4.5 text-slate-350 dark:text-slate-750 shrink-0" />
              )}
              <div className="flex flex-col">
                <span className={`text-[11px] font-extrabold ${checklist.descSolid ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                  Detailed Specifications
                </span>
                <span className="text-[9px] text-slate-400 leading-normal">Write at least 10 characters requirements text.</span>
              </div>
            </li>
          </ul>
        </div>

        {/* AI scoring assistant stats */}
        <div className="bg-gradient-to-tr from-slate-900 via-slate-950 to-emerald-950 dark:from-slate-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
          
          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 self-start">
            <Sparkles className="w-3 h-3 text-primary animate-spin" />
            AI Lead Scoring Priority
          </span>

          <h4 className="font-extrabold text-sm tracking-wide mt-1">Smart Matchmaking Engine</h4>
          <p className="text-[10px] text-slate-450 leading-relaxed">
            DIGIMART360 analyzes your RFQ complexity score in real-time. Detailed inquiries receive a premium ranking on the seller dashboard.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mt-1 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Avg. Response Time</span>
              <span className="text-xs font-bold text-emerald-400">~ 4.8 Hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Estimated Match Rate</span>
              <span className="text-xs font-bold text-primary">94% Success</span>
            </div>
          </div>
        </div>

        {/* Safety guarantees */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-805 dark:text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4.5 h-4.5 text-primary" />
            DIGIMART360 Protections
          </h4>

          <ul className="flex flex-col gap-3">
            <li className="flex gap-2 items-start text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span>Direct communication with verified legal business entities.</span>
            </li>
            <li className="flex gap-2 items-start text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span>Automatic NDA coverage for custom product blueprints.</span>
            </li>
            <li className="flex gap-2 items-start text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span>Dedicated dispute resolution & wholesale escrow support.</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  )
}
