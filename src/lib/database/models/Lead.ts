import mongoose, { Schema, Document, Model } from "mongoose"

export interface ILeadNote {
  text: string
  author: string
  date: Date
}

export interface ILeadActivity {
  action: string
  description: string
  date: Date
}

export interface ILead extends Document {
  buyer?: mongoose.Types.ObjectId
  buyerDetails: {
    name: string
    email: string
    phone: string
    company?: string
  }
  seller: mongoose.Types.ObjectId
  product?: mongoose.Types.ObjectId
  message: string
  quantity: number
  targetPrice?: number
  status: "new" | "contacted" | "qualified" | "negotiation" | "won" | "lost"
  notes: ILeadNote[]
  activities: ILeadActivity[]
  leadScore: number // AI generated score from 0 to 100
  createdAt: Date
  updatedAt: Date
}

const LeadSchema = new Schema<ILead>(
  {
    buyer: { type: Schema.Types.ObjectId, ref: "User" },
    buyerDetails: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true },
      company: { type: String },
    },
    seller: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    message: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    targetPrice: { type: Number },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "negotiation", "won", "lost"],
      default: "new",
    },
    notes: [
      {
        text: { type: String, required: true },
        author: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    activities: [
      {
        action: { type: String, required: true },
        description: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    leadScore: { type: Number, default: 50, min: 0, max: 100 },
  },
  { timestamps: true }
)

export const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema)
