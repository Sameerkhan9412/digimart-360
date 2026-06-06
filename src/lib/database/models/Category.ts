import mongoose, { Schema, Document, Model } from "mongoose"

export interface ICustomFieldDefinition {
  name: string
  fieldType: "text" | "number" | "date" | "checkbox" | "dropdown" | "radio" | "multi_select" | "file_upload"
  options?: string[] // Optional, for dropdowns, radios, or multi-selects
  required: boolean
}

export interface ICategory extends Document {
  name: string
  slug: string
  parentCategory?: mongoose.Types.ObjectId
  customFields: ICustomFieldDefinition[]
  createdAt: Date
  updatedAt: Date
}

const CustomFieldDefinitionSchema = new Schema<ICustomFieldDefinition>({
  name: { type: String, required: true },
  fieldType: {
    type: String,
    enum: ["text", "number", "date", "checkbox", "dropdown", "radio", "multi_select", "file_upload"],
    required: true,
  },
  options: [{ type: String }],
  required: { type: Boolean, default: false },
})

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    parentCategory: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    customFields: [CustomFieldDefinitionSchema],
  },
  { timestamps: true }
)

export const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema)
