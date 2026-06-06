"use server"

import { connectDB } from "src/lib/database/db"
import { Category } from "src/lib/database/models/Category"
import { getAuthUser } from "src/lib/auth/jwt"

export async function getCategories() {
  try {
    await connectDB()
    const categories = await Category.find().populate("parentCategory").lean()
    
    // Format to clean JSON serialization
    return JSON.parse(JSON.stringify(categories))
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function createCategory(data: {
  name: string
  parentCategory?: string | null
  customFields?: Array<{
    name: string
    fieldType: "text" | "number" | "date" | "checkbox" | "dropdown" | "radio" | "multi_select" | "file_upload"
    options?: string[]
    required: boolean
  }>
}) {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized. Administrator access required." }
    }

    if (!data.name) {
      return { success: false, error: "Category name is required." }
    }

    await connectDB()

    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    const existing = await Category.findOne({ slug })
    if (existing) {
      return { success: false, error: "A category with this name or slug already exists." }
    }

    const newCategory = await Category.create({
      name: data.name,
      slug,
      parentCategory: data.parentCategory || undefined,
      customFields: data.customFields || [],
    })

    return { success: true, category: JSON.parse(JSON.stringify(newCategory)) }
  } catch (error: any) {
    console.error("Error creating category:", error)
    return { success: false, error: error.message || "Failed to create category." }
  }
}

export async function updateCategory(
  id: string,
  data: {
    name: string
    parentCategory?: string | null
    customFields?: Array<{
      name: string
      fieldType: "text" | "number" | "date" | "checkbox" | "dropdown" | "radio" | "multi_select" | "file_upload"
      options?: string[]
      required: boolean
    }>
  }
) {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized." }
    }

    await connectDB()

    const category = await Category.findById(id)
    if (!category) {
      return { success: false, error: "Category not found." }
    }

    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    
    // Check slug collision with other categories
    const duplicate = await Category.findOne({ slug, _id: { $ne: id } })
    if (duplicate) {
      return { success: false, error: "Another category is already using this name." }
    }

    category.name = data.name
    category.slug = slug
    category.parentCategory = (data.parentCategory as any) || undefined
    category.customFields = data.customFields || []
    await category.save()

    return { success: true, category: JSON.parse(JSON.stringify(category)) }
  } catch (error: any) {
    console.error("Error updating category:", error)
    return { success: false, error: error.message || "Failed to update category." }
  }
}

export async function deleteCategory(id: string) {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized." }
    }

    await connectDB()

    // Check if there are subcategories
    const children = await Category.findOne({ parentCategory: id })
    if (children) {
      return { success: false, error: "Cannot delete. This category has child subcategories." }
    }

    await Category.findByIdAndDelete(id)
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting category:", error)
    return { success: false, error: "Failed to delete category." }
  }
}
