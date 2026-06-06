import { z } from "zod"

// Authentication Schemas
export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["buyer", "seller"], {
    message: "Please select a valid role",
  }),
})

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export const VerifyOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export const ResetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

// Product Listing Schemas
export const ProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be a positive number"),
  minOrderQuantity: z.number().int().positive("Minimum order quantity must be at least 1"),
  unit: z.string().default("piece"),
  category: z.string().min(1, "Category is required"),
  images: z.array(z.string()).min(1, "At least one product image is required"),
  videoUrl: z.string().url("Please enter a valid video URL").optional().or(z.literal("")),
  customAttributes: z.record(z.string(), z.any()).default({}),
  tags: z.array(z.string()).default([]),
  isSponsored: z.boolean().default(false),
})

// Buyer Inquiry (RFQ) Schemas
export const LeadSchema = z.object({
  buyerName: z.string().min(2, "Name must be at least 2 characters"),
  buyerEmail: z.string().email("Please enter a valid email address"),
  buyerPhone: z.string().min(10, "Please enter a valid phone number (at least 10 digits)"),
  buyerCompany: z.string().optional(),
  message: z.string().min(10, "Please include detailed requirements (at least 10 characters)"),
  quantity: z.number().int().positive("Quantity must be a positive number"),
  targetPrice: z.number().positive("Target price must be a positive number").optional().or(z.literal(0)),
  product: z.string().optional(),
  seller: z.string().min(1, "Seller reference is required"),
})

// Seller Custom Storefront Schemas
export const TimelineNodeSchema = z.object({
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  title: z.string().min(2, "Milestone title is required"),
  description: z.string().min(5, "Milestone description is required"),
})

export const SellerStorefrontSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  about: z.string().optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Valid email required"),
  address: z.string().optional(),
  whatsapp: z.string().optional(),
  contactPerson: z.string().optional().or(z.literal("")),
  timeline: z.array(TimelineNodeSchema).default([]),
  certifications: z.array(z.string()).default([]),
  theme: z.object({
    primaryColor: z.string().default("#009E49"),
    secondaryColor: z.string().default("#0F4C5C"),
    font: z.string().default("Plus Jakarta Sans"),
    layoutVariant: z.enum(["minimal", "modern", "bold"]).default("modern"),
  }).default({
    primaryColor: "#009E49",
    secondaryColor: "#0F4C5C",
    font: "Plus Jakarta Sans",
    layoutVariant: "modern",
  }),
})
