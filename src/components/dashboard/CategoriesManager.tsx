"use client"

import React, { useState } from "react"
import { useToast } from "src/components/ui/Toast"
import { createCategory, deleteCategory, updateCategory } from "src/app/actions/categoryActions"
import { FolderTree, Plus, Trash, Check, X, ShieldAlert, Pencil } from "lucide-react"

interface CustomFieldInput {
  name: string
  fieldType: "text" | "number" | "date" | "checkbox" | "dropdown" | "radio" | "multi_select" | "file_upload"
  options: string // comma-separated options
  required: boolean
}

interface CategoriesManagerProps {
  initialCategories: any[]
}

export default function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const { toast } = useToast()
  const [categories, setCategories] = useState(initialCategories)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state variables
  const [name, setName] = useState("")
  const [parentCategory, setParentCategory] = useState("")
  const [customFields, setCustomFields] = useState<CustomFieldInput[]>([])

  const addField = () => {
    setCustomFields((prev) => [
      ...prev,
      { name: "", fieldType: "text", options: "", required: false },
    ])
  }

  const removeField = (index: number) => {
    setCustomFields((prev) => prev.filter((_, idx) => idx !== index))
  }

  const updateFieldData = (index: number, key: keyof CustomFieldInput, value: any) => {
    setCustomFields((prev) =>
      prev.map((field, idx) => (idx === index ? { ...field, [key]: value } : field))
    )
  }

  const handleStartEdit = (cat: any) => {
    setEditingId(cat._id)
    setName(cat.name)
    setParentCategory(
      cat.parentCategory?._id || (typeof cat.parentCategory === "string" ? cat.parentCategory : "")
    )
    
    // Map custom fields to input schema structure
    const mappedFields = (cat.customFields || []).map((field: any) => ({
      name: field.name,
      fieldType: field.fieldType,
      options: field.options ? field.options.join(", ") : "",
      required: !!field.required,
    }))
    setCustomFields(mappedFields)
    
    // Scroll up to form on mobile/tablet viewports
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setName("")
    setParentCategory("")
    setCustomFields([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return toast("Category name is required.", "error")
    setLoading(true)

    // Format fields schema payload
    const formattedFields = customFields.map((field) => ({
      name: field.name,
      fieldType: field.fieldType,
      options: field.options ? field.options.split(",").map((o) => o.trim()).filter(Boolean) : [],
      required: field.required,
    }))

    try {
      if (editingId) {
        // Edit flow
        const response = await updateCategory(editingId, {
          name,
          parentCategory: parentCategory || null,
          customFields: formattedFields,
        })

        if (response.success && response.category) {
          toast("Trade Category updated successfully!", "success")
          
          const updatedParentObj = parentCategory
            ? categories.find((c) => c._id === parentCategory)
            : null

          const updatedCat = {
            ...response.category,
            parentCategory: updatedParentObj
              ? { _id: updatedParentObj._id, name: updatedParentObj.name }
              : null,
          }

          setCategories((prev) =>
            prev.map((c) => (c._id === editingId ? updatedCat : c))
          )
          handleCancelEdit()
        } else {
          toast(response.error || "Failed to update category.", "error")
        }
      } else {
        // Create flow
        const response = await createCategory({
          name,
          parentCategory: parentCategory || null,
          customFields: formattedFields,
        })

        if (response.success && response.category) {
          toast("Trade Category created successfully!", "success")
          
          const parentObj = parentCategory
            ? categories.find((c) => c._id === parentCategory)
            : null

          const newCat = {
            ...response.category,
            parentCategory: parentObj
              ? { _id: parentObj._id, name: parentObj.name }
              : null,
          }

          setCategories((prev) => [...prev, newCat])
          setName("")
          setParentCategory("")
          setCustomFields([])
        } else {
          toast(response.error || "Failed to create category.", "error")
        }
      }
    } catch (err) {
      console.error(err)
      toast("Error saving category.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return
    setLoading(true)
    try {
      const response = await deleteCategory(id)
      if (response.success) {
        toast("Category deleted successfully.", "success")
        setCategories((prev) => prev.filter((c) => c._id !== id))
        // If deleting the currently edited item, reset form
        if (editingId === id) handleCancelEdit()
      } else {
        toast(response.error || "Failed to delete category.", "error")
      }
    } catch (err) {
      console.error(err)
      toast("Error deleting category.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
      
      {/* Left Column: Form panel */}
      <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm w-full shrink-0">
        <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase mb-5 border-b border-slate-50 pb-3 flex items-center justify-between">
          <span>{editingId ? "Edit Category" : "Create Category"}</span>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-0.5 normal-case"
            >
              <X className="w-3.5 h-3.5" />
              Cancel Edit
            </button>
          )}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g. Electronics, Medical Supplies"
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-slate-50/20"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Parent Category (Optional)</label>
            <select
              value={parentCategory}
              onChange={(e) => setParentCategory(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-slate-50/20"
            >
              <option value="">No Parent (Root Category)</option>
              {categories
                .filter((c) => !c.parentCategory && c._id !== editingId)
                .map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Dynamic Specifications Schema Builder */}
          <div className="flex flex-col gap-3 mt-2 border-t border-slate-50 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Custom Attributes Schema</label>
              <button
                type="button"
                onClick={addField}
                className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline border border-dashed border-primary/40 px-2.5 py-1 rounded-lg hover:bg-primary/5 transition"
              >
                <Plus className="w-3 h-3" />
                Add Attribute
              </button>
            </div>

            {customFields.length === 0 && (
              <p className="text-[10px] text-slate-400 font-medium italic p-3 text-center border rounded-xl border-dashed bg-slate-50/20">
                No specifications defined. Products will use default description text fields.
              </p>
            )}

            {customFields.map((field, index) => (
              <div key={index} className="flex flex-col gap-3 p-3.5 border border-slate-100 rounded-xl bg-slate-50/30 relative">
                
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-rose-500 rounded p-1 hover:bg-slate-100 transition"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>

                <div className="grid grid-cols-2 gap-2 pr-6">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Attribute Title</label>
                    <input
                      type="text"
                      placeholder="E.g. Dimensions, Purity"
                      value={field.name}
                      onChange={(e) => updateFieldData(index, "name", e.target.value)}
                      className="w-full text-[10px] font-bold p-2 rounded-lg border border-slate-200 outline-none bg-white focus:border-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Field Type</label>
                    <select
                      value={field.fieldType}
                      onChange={(e) => updateFieldData(index, "fieldType", e.target.value)}
                      className="w-full text-[10px] font-bold p-2 rounded-lg border border-slate-200 outline-none bg-white focus:border-primary"
                    >
                      <option value="text">Single Line Text</option>
                      <option value="number">Numeric Value</option>
                      <option value="dropdown">Dropdown Select</option>
                      <option value="checkbox">Toggle Checkbox</option>
                      <option value="file_upload">PDF / File Upload</option>
                    </select>
                  </div>
                </div>

                {/* Dropdown Options */}
                {field.fieldType === "dropdown" && (
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Options (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="E.g. Spooled, Wound, Ring Spun"
                      value={field.options}
                      onChange={(e) => updateFieldData(index, "options", e.target.value)}
                      className="w-full text-[10px] font-semibold p-2 rounded-lg border border-slate-200 outline-none bg-white focus:border-primary"
                    />
                  </div>
                )}

                {/* Required switch */}
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="checkbox"
                    id={`required-${index}`}
                    checked={field.required}
                    onChange={(e) => updateFieldData(index, "required", e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor={`required-${index}`} className="text-[9px] font-bold text-slate-500 cursor-pointer select-none">
                    Required specification (Sellers must fill)
                  </label>
                </div>

              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-extrabold tracking-wide transition shadow-lg shadow-primary/20 flex items-center justify-center mt-4 shrink-0"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : editingId ? (
              "Update Sourcing Category"
            ) : (
              "Save Sourcing Category"
            )}
          </button>
        </form>
      </div>

      {/* Right Column: List of current categories */}
      <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm w-full shrink-0">
        <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase mb-5 border-b border-slate-50 pb-3 flex items-center gap-2">
          <FolderTree className="w-4.5 h-4.5 text-primary" />
          Categories Hierarchy
        </h3>

        {categories.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center">
            <ShieldAlert className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-400 text-xs font-semibold">No trade categories found. Build one using the form.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {categories.map((cat) => {
              const hasParent = !!cat.parentCategory
              return (
                <div
                  key={cat._id}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition hover:bg-slate-50/50 ${
                    hasParent ? "border-slate-100 bg-slate-50/20 ml-6" : "border-slate-200 bg-white"
                  }`}
                >
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                      {!hasParent && <FolderTree className="w-3.5 h-3.5 text-primary shrink-0" />}
                      {cat.name}
                    </h5>
                    
                    <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>Slug: {cat.slug}</span>
                      {cat.customFields && cat.customFields.length > 0 && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-primary">{cat.customFields.length} Specs fields</span>
                        </>
                      )}
                      {cat.parentCategory && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>Child of: {cat.parentCategory.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="p-2 border border-slate-100 hover:border-blue-100 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition"
                      title="Edit Category"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat._id)}
                      className="p-2 border border-slate-100 hover:border-rose-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition"
                      title="Delete Category"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
