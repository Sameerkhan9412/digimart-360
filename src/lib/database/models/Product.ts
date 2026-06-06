import mongoose, { Schema, Document, Model } from "mongoose"

export interface ISEOMetadata {
  title?: string
  description?: string
  keywords?: string[]
}

export interface IProduct extends Document {
  name: string
  slug: string
  description: string
  images: string[]
  videoUrl?: string
  price: number
  minOrderQuantity: number
  unit: string
  category: mongoose.Types.ObjectId
  seller: mongoose.Types.ObjectId
  customAttributes: Record<string, any> // Stores values matching the Category's customFields definitions
  isSponsored: boolean
  isTrending: boolean
  isFeatured: boolean
  rating: number
  reviewsCount: number
  tags: string[]
  seoMetadata: ISEOMetadata
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    videoUrl: { type: String },
    price: { type: Number, required: true },
    minOrderQuantity: { type: Number, default: 1 },
    unit: { type: String, default: "piece" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    seller: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
    customAttributes: { type: Schema.Types.Mixed, default: {} }, // Key-value store for fields
    isSponsored: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    tags: [{ type: String }],
    seoMetadata: {
      title: { type: String },
      description: { type: String },
      keywords: [{ type: String }],
    },
  },
  { timestamps: true }
)

// Add search indexes
ProductSchema.index({ name: "text", description: "text", tags: "text" })

export const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)
