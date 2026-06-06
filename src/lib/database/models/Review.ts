import mongoose, { Schema, Document, Model } from "mongoose"

export interface IReview extends Document {
  buyer: mongoose.Types.ObjectId
  product: mongoose.Types.ObjectId
  seller: mongoose.Types.ObjectId
  lead: mongoose.Types.ObjectId
  rating: number
  comment: string
  buyerName: string
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    seller: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
    lead: { type: Schema.Types.ObjectId, ref: "Lead", required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    buyerName: { type: String, required: true, trim: true },
  },
  { timestamps: true }
)

// Index for quick queries
ReviewSchema.index({ product: 1, createdAt: -1 })
ReviewSchema.index({ seller: 1 })

export const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema)
