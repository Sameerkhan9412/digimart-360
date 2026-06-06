"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useToast } from "src/components/ui/Toast"
import { createProduct, deleteProduct, getAIDescriptionAction, getAITagsAction, uploadProductImageAction } from "src/app/actions/productActions"
import { Sparkles, Trash, Plus, Check, List, Tag, Sparkle, AlertCircle, Image, UploadCloud } from "lucide-react"

interface CatalogManagerProps {
  initialProducts: any[]
  categories: any[]
}

export default function CatalogManager({ initialProducts, categories }: CatalogManagerProps) {
  const { toast } = useToast()
  const [products, setProducts] = useState(initialProducts)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"list" | "new">("list")

  // Add Product Form State
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState(0)
  const [minOrderQuantity, setMinOrderQuantity] = useState(1)
  const [unit, setUnit] = useState("piece")
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [imagesList, setImagesList] = useState<string[]>([])
  const [urlInput, setUrlInput] = useState("")
  const [uploading, setUploading] = useState(false)
  const [tagsInput, setTagsInput] = useState("")

  const handleAddImageUrl = () => {
    if (!urlInput) return
    if (!urlInput.startsWith("http://") && !urlInput.startsWith("https://")) {
      return toast("Please enter a valid absolute image URL starting with http:// or https://", "error")
    }
    setImagesList((prev) => [...prev, urlInput])
    setUrlInput("")
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setImagesList((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)

    try {
      const newUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Read file as base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = (error) => reject(error)
        })

        const res = await uploadProductImageAction(base64)
        if (res.success && res.url) {
          newUrls.push(res.url)
        } else {
          toast(res.error || `Failed to upload image ${file.name}`, "error")
        }
      }

      if (newUrls.length > 0) {
        setImagesList((prev) => [...prev, ...newUrls])
        toast(`Successfully uploaded ${newUrls.length} image(s)`, "success")
      }
    } catch (err) {
      console.error(err)
      toast("Error uploading image files.", "error")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  // Dynamic fields state variables
  const [dynamicAttributes, setDynamicAttributes] = useState<Record<string, any>>({})

  const activeCategory = categories.find((c) => c._id === selectedCategoryId)

  // Clear dynamic attributes on category change
  useEffect(() => {
    setDynamicAttributes({})
  }, [selectedCategoryId])

  const handleDynamicChange = (fieldName: string, value: any) => {
    setDynamicAttributes((prev) => ({ ...prev, [fieldName]: value }))
  }

  // OpenAI copy assistant
  const handleAIDescGen = async () => {
    if (!name) return toast("Please specify a product name first to generate a description.", "warning")
    setAiLoading(true)
    try {
      const keywords = tagsInput ? tagsInput.split(",").map((k) => k.trim()) : ["wholesale", "premium"]
      const result = await getAIDescriptionAction(name, keywords)
      setDescription(result.text)
      toast("AI product description compiled!", "success")
    } catch (err) {
      console.error(err)
      toast("Error generating copy.", "error")
    } finally {
      setAiLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategoryId) return toast("Please select a product category.", "error")
    if (imagesList.length === 0) return toast("Please provide at least one product catalog image.", "error")
    
    setLoading(true)

    const payload = {
      name,
      description,
      price: parseFloat(price as any) || 0,
      minOrderQuantity: parseInt(minOrderQuantity as any) || 1,
      unit,
      category: selectedCategoryId,
      images: imagesList,
      customAttributes: dynamicAttributes,
      tags: tagsInput ? tagsInput.split(",").map((t) => t.trim().toLowerCase()) : [],
    }

    try {
      const response = await createProduct(payload)
      if (response.success && response.product) {
        toast("Wholesale product listing published successfully!", "success")
        setProducts((prev) => [response.product, ...prev])
        
        // Reset form variables
        setName("")
        setDescription("")
        setPrice(0)
        setMinOrderQuantity(1)
        setUnit("piece")
        setSelectedCategoryId("")
        setImagesList([])
        setUrlInput("")
        setTagsInput("")
        setDynamicAttributes({})
        
        setActiveTab("list")
      } else {
        toast(response.error || "Failed to create product listing.", "error")
      }
    } catch (err) {
      console.error(err)
      toast("Error creating product.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return
    setLoading(true)
    try {
      const response = await deleteProduct(id)
      if (response.success) {
        toast("Listing deleted successfully.", "success")
        setProducts((prev) => prev.filter((p) => p._id !== id))
      } else {
        toast(response.error || "Failed to delete listing.", "error")
      }
    } catch (err) {
      console.error(err)
      toast("Error deleting product.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* Navigation tabs */}
      <div className="flex gap-3 border-b border-slate-100 pb-3 shrink-0">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "list"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-50 hover:bg-slate-100 text-slate-700"
          }`}
        >
          <List className="w-4 h-4" />
          Active Listings ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("new")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "new"
              ? "bg-primary text-white shadow-sm shadow-primary/15"
              : "bg-slate-50 hover:bg-slate-100 text-slate-700"
          }`}
        >
          <Plus className="w-4 h-4" />
          List New Product
        </button>
      </div>

      {activeTab === "list" ? (
        
        /* List Tab View */
        products.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl p-8 max-w-lg mx-auto flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 border rounded-full flex items-center justify-center text-slate-350 mb-5">
              <List className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-800">No active listings</h4>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Your trade catalog is currently empty. List your wholesale items to display them on your store storefront and public search listings.
            </p>
            <button
              onClick={() => setActiveTab("new")}
              className="mt-6 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              List First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 shrink-0">
            {products.map((prod) => {
              const priceStr = prod.price.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
              return (
                <div key={prod._id} className="group border border-slate-100 rounded-2xl hover:shadow-lg transition overflow-hidden bg-white flex flex-col">
                  <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden shrink-0">
                    <img
                      src={prod.images?.[0] || "https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=400&auto=format&fit=crop"}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1 gap-4">
                    <div>
                      <Link href={`/product/${prod.slug}`} className="font-bold text-slate-800 text-sm hover:text-primary transition line-clamp-2 min-h-[40px]">
                        {prod.name}
                      </Link>
                      <div className="flex items-baseline justify-between mt-2.5">
                        <span className="font-extrabold text-slate-900">{priceStr} / {prod.unit}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Min Qty: {prod.minOrderQuantity}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-50 pt-3 flex gap-2 shrink-0 mt-auto">
                      <Link
                        href={`/product/${prod.slug}`}
                        className="flex-1 text-center py-2 rounded-lg border text-slate-700 text-[10px] font-bold hover:bg-slate-50 transition"
                      >
                        Preview
                      </Link>
                      <button
                        onClick={() => handleDelete(prod._id)}
                        className="p-2 border border-slate-100 hover:border-rose-100 hover:bg-rose-50 text-slate-450 hover:text-rose-600 rounded-lg transition shrink-0"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        
        /* New Product Form View */
        <form onSubmit={handleCreate} className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-5 max-w-3xl shrink-0">
          
          <h3 className="font-extrabold text-slate-850 text-sm tracking-wider uppercase border-b border-slate-50 pb-3">
            Catalog details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Title</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="E.g. Spun cotton spool, CNC drill"
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary"
              />
            </div>
            
            {/* Category Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trade Category</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                required
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Price (INR)</label>
              <input
                type="number"
                value={price || ""}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                required
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Min Order Qty</label>
              <div className="flex gap-1 items-center">
                <input
                  type="number"
                  value={minOrderQuantity || ""}
                  onChange={(e) => setMinOrderQuantity(parseInt(e.target.value) || 1)}
                  required
                  className="w-2/3 text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary"
                />
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="pcs"
                  className="w-1/3 text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary text-center"
                />
              </div>
            </div>
          </div>

          {/* Product Images (Upload & URL Integration) */}
          <div className="flex flex-col gap-3 border-t border-slate-50 pt-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Product Images <span className="text-rose-500 font-extrabold">*</span> (Add via upload or external link)
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File uploader */}
              <div className="border border-dashed border-slate-200 hover:border-primary/50 transition rounded-xl p-5 flex flex-col items-center justify-center bg-slate-50/20 relative group min-h-[110px]">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                    <span className="text-[10px] font-bold text-slate-500">Uploading assets to Cloudinary...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center gap-1.5 pointer-events-none">
                    <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-primary transition" />
                    <div>
                      <span className="text-xs font-bold text-slate-700">Click to Upload Images</span>
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5">Supports PNG, JPG, JPEG (multiple allowed)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* URL input */}
              <div className="border border-slate-100 rounded-xl p-4 flex flex-col gap-2 bg-slate-50/10 justify-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Or Add Image URL</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 text-xs font-semibold p-2.5 rounded-lg border border-slate-200 outline-none focus:border-primary bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center"
                  >
                    Add
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                  Enter an absolute image URL (e.g. Unsplash, hosting links) and click "Add".
                </p>
              </div>
            </div>

            {/* Images Preview list */}
            {imagesList.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-2">
                {imagesList.map((imgUrl, index) => (
                  <div key={index} className="aspect-square rounded-xl border border-slate-100 relative group overflow-hidden bg-slate-50 shadow-sm">
                    <img src={imgUrl} alt="Preview" className="w-full h-full object-cover" />
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-primary text-white text-[7px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-white/90 hover:bg-rose-50 hover:text-rose-600 text-slate-400 p-1 rounded-md transition shadow"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Keywords tags */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Search Tags (Comma separated)</label>
            <div className="relative">
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="E.g. industrial, cnc, machinery, spools"
                className="w-full text-xs font-semibold pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary"
              />
              <Tag className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Dynamic specifications builder if category is selected */}
          {activeCategory && activeCategory.customFields && activeCategory.customFields.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-slate-50 pt-4">
              <h4 className="font-extrabold text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">
                Category specifications ({activeCategory.name})
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeCategory.customFields.map((field: any, idx: number) => {
                  const isText = field.fieldType === "text" || field.fieldType === "number" || field.fieldType === "date"
                  const isSelect = field.fieldType === "dropdown" || field.fieldType === "radio" || field.fieldType === "multi_select"
                  const isCheck = field.fieldType === "checkbox"

                  return (
                    <div key={idx} className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {field.name} {field.required && <span className="text-rose-500 font-extrabold">*</span>}
                      </label>
                      
                      {isText && (
                        <input
                          type={field.fieldType === "number" ? "number" : "text"}
                          required={field.required}
                          value={dynamicAttributes[field.name] || ""}
                          onChange={(e) => handleDynamicChange(field.name, e.target.value)}
                          placeholder={`Enter ${field.name.toLowerCase()}`}
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary"
                        />
                      )}

                      {isSelect && (
                        <select
                          required={field.required}
                          value={dynamicAttributes[field.name] || ""}
                          onChange={(e) => handleDynamicChange(field.name, e.target.value)}
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary bg-white"
                        >
                          <option value="">Select Option</option>
                          {field.options && field.options.map((opt: string) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {isCheck && (
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            id={`dynamic-check-${idx}`}
                            checked={!!dynamicAttributes[field.name]}
                            onChange={(e) => handleDynamicChange(field.name, e.target.checked)}
                            className="w-4 h-4 text-primary focus:ring-primary rounded"
                          />
                          <label htmlFor={`dynamic-check-${idx}`} className="text-xs font-bold text-slate-655 cursor-pointer">
                            Enable {field.name.toLowerCase()} option
                          </label>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Description copy content */}
          <div className="flex flex-col gap-1 border-t border-slate-50 pt-4">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Description</label>
              
              <button
                type="button"
                onClick={handleAIDescGen}
                disabled={aiLoading}
                className="flex items-center gap-1.5 text-[9px] font-bold text-primary border border-dashed border-primary/40 px-2.5 py-1.5 rounded-lg hover:bg-primary/5 transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                {aiLoading ? "Generating Description..." : "Generate AI Copy"}
              </button>
            </div>
            
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              placeholder="Describe wholesale benefits, logistics margins, package details..."
              className="w-full text-xs font-semibold p-3.5 rounded-xl border border-slate-200 outline-none focus:border-primary resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white text-xs font-extrabold tracking-wide transition shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5 self-start mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Publish Catalog Product"
            )}
          </button>

        </form>
      )}

    </div>
  )
}
