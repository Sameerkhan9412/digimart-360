import mongoose, { Schema, Document, Model } from "mongoose"

export interface ISubscriptionPlan extends Document {
  name: "free" | "silver" | "gold" | "platinum"
  price: number // monthly price
  durationMonths: number
  productLimit: number
  leadLimit: number
  hasHomepagePromotion: boolean
  priorityRanking: boolean
  hasAnalytics: boolean
  isEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: {
      type: String,
      enum: ["free", "silver", "gold", "platinum"],
      required: true,
      unique: true,
    },
    price: { type: Number, required: true, min: 0 },
    durationMonths: { type: Number, default: 1 },
    productLimit: { type: Number, required: true, default: 10 },
    leadLimit: { type: Number, required: true, default: 5 },
    hasHomepagePromotion: { type: Boolean, default: false },
    priorityRanking: { type: Boolean, default: false },
    hasAnalytics: { type: Boolean, default: false },
    isEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const SubscriptionPlan: Model<ISubscriptionPlan> =
  mongoose.models.SubscriptionPlan || mongoose.model<ISubscriptionPlan>("SubscriptionPlan", SubscriptionPlanSchema)
