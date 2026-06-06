import mongoose, { Schema, Document, Model } from "mongoose"

export interface ISetting extends Document {
  key: string
  value: string
  isEncrypted: boolean
  createdAt: Date
  updatedAt: Date
}

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: String, default: "" },
    isEncrypted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const Setting: Model<ISetting> = mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema)
