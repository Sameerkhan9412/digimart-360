import mongoose, { Schema, Document, Model } from "mongoose"

export interface ITimelineNode {
  year: number
  title: string
  description: string
}

export interface ICustomTheme {
  primaryColor: string
  secondaryColor: string
  font: string
  layoutVariant: "minimal" | "modern" | "bold"
}

export interface ISeller extends Document {
  user: mongoose.Types.ObjectId
  companyName: string
  slug: string
  logo?: string
  banner?: string
  about?: string
  timeline: ITimelineNode[]
  contactInfo: {
    phone: string
    email: string
    address?: string
    whatsapp?: string
    contactPerson?: string
  }
  isVerified: boolean
  verificationStatus: "pending" | "under_review" | "approved" | "rejected"
  verificationDocuments: string[]
  subscriptionPlan: "free" | "silver" | "gold" | "platinum"
  subscriptionStatus: "active" | "inactive"
  subscriptionExpiresAt?: Date
  customTheme: ICustomTheme
  certifications: string[]
  createdAt: Date
  updatedAt: Date
}

const SellerSchema = new Schema<ISeller>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    companyName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo: { type: String, default: "" },
    banner: { type: String, default: "" },
    about: { type: String, default: "" },
    timeline: [
      {
        year: { type: Number, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    contactInfo: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String },
      whatsapp: { type: String },
      contactPerson: { type: String, default: "" },
    },
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["pending", "under_review", "approved", "rejected"],
      default: "pending",
    },
    verificationDocuments: [{ type: String }],
    subscriptionPlan: {
      type: String,
      enum: ["free", "silver", "gold", "platinum"],
      default: "free",
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active", // Default active for free plan
    },
    subscriptionExpiresAt: { type: Date },
    customTheme: {
      primaryColor: { type: String, default: "#009E49" },
      secondaryColor: { type: String, default: "#0F4C5C" },
      font: { type: String, default: "Plus Jakarta Sans" },
      layoutVariant: { type: String, enum: ["minimal", "modern", "bold"], default: "modern" },
    },
    certifications: [{ type: String }],
  },
  { timestamps: true }
)

export const Seller: Model<ISeller> = mongoose.models.Seller || mongoose.model<ISeller>("Seller", SellerSchema)
