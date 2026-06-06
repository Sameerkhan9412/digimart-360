import nodemailer from "nodemailer"

const SMTP_HOST = process.env.SMTP_HOST || ""
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587")
const SMTP_USER = process.env.SMTP_USER || ""
const SMTP_PASS = process.env.SMTP_PASS || ""
const SMTP_FROM = process.env.SMTP_FROM || '"DIGIMART360" <noreply@digimart360.com>'

// Create SMTP transporter if configs exist, otherwise use a console logger transport
const createTransporter = () => {
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  }

  // Fallback mock transporter for local testing
  return {
    sendMail: async (mailOptions: any) => {
      console.log("\n=================== [MOCK EMAIL SENT] ===================")
      console.log(`From:    ${mailOptions.from}`)
      console.log(`To:      ${mailOptions.to}`)
      console.log(`Subject: ${mailOptions.subject}`)
      console.log("-------------------- CONTENT --------------------")
      console.log(mailOptions.text || mailOptions.html)
      console.log("=========================================================\n")
      return { messageId: "mock-id-" + Math.random().toString(36).substring(7) }
    },
  }
}

const transporter = createTransporter()

export async function sendOTPEmail(email: string, otp: string, name: string): Promise<boolean> {
  const subject = "Verify Your DIGIMART360 Account"
  const html = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fcfcfc;">
      <h2 style="color: #009E49; margin-bottom: 24px;">Welcome to DIGIMART360!</h2>
      <p style="color: #0B2545; font-size: 16px; line-height: 1.5;">Hi ${name},</p>
      <p style="color: #0B2545; font-size: 16px; line-height: 1.5;">To complete your login or registration, please enter the following 6-digit One-Time Password (OTP). This code will expire in 15 minutes.</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <span style="display: inline-block; font-size: 32px; font-weight: 800; color: #009E49; letter-spacing: 6px; padding: 12px 32px; border: 2px dashed #009E49; border-radius: 8px; background-color: #e6f6ed;">
          ${otp}
        </span>
      </div>
      
      <p style="color: #64748b; font-size: 14px; line-height: 1.5;">If you did not request this OTP, please ignore this email. Your account is secure.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #0B2545; font-size: 14px; font-weight: 600;">DIGIMART360 Team</p>
      <p style="color: #64748b; font-size: 12px;">Your Gateway to Global Trade</p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject,
      html,
      text: `Welcome to DIGIMART360! Hi ${name}, your OTP is ${otp}. It will expire in 15 minutes.`,
    })
    return true
  } catch (error) {
    console.error("Error sending OTP email:", error)
    return false
  }
}

export async function sendLeadNotificationEmail(
  sellerEmail: string,
  sellerName: string,
  buyerName: string,
  productName: string,
  quantity: number,
  message: string
): Promise<boolean> {
  const subject = "🔥 New Inquiry Received - DIGIMART360 CRM"
  const html = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fcfcfc;">
      <h2 style="color: #0F4C5C; margin-bottom: 24px;">New Lead Received!</h2>
      <p style="color: #0B2545; font-size: 16px; line-height: 1.5;">Hi ${sellerName},</p>
      <p style="color: #0B2545; font-size: 16px; line-height: 1.5;">You have received a new buyer inquiry on DIGIMART360.</p>
      
      <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <h4 style="margin: 0 0 12px 0; color: #0B2545;">Inquiry Details:</h4>
        <table style="width: 100%; font-size: 14px; color: #0B2545; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; font-weight: 600; width: 120px;">Buyer Name:</td>
            <td style="padding: 4px 0;">${buyerName}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Product:</td>
            <td style="padding: 4px 0;">${productName}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Quantity:</td>
            <td style="padding: 4px 0;">${quantity}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600; vertical-align: top;">Message:</td>
            <td style="padding: 4px 0; font-style: italic;">"${message}"</td>
          </tr>
        </table>
      </div>
      
      <p style="color: #0B2545; font-size: 16px; line-height: 1.5;">Please log into your seller dashboard to view, score, and follow up on this lead.</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://digimart360.com/seller" style="display: inline-block; padding: 12px 28px; background-color: #009E49; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Go to CRM Dashboard
        </a>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #0B2545; font-size: 14px; font-weight: 600;">DIGIMART360 Team</p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: sellerEmail,
      subject,
      html,
      text: `Hi ${sellerName}, you have received a new inquiry from ${buyerName} regarding product: ${productName} (Qty: ${quantity}). Message: "${message}". Log in to your seller dashboard to respond.`,
    })
    return true
  } catch (error) {
    console.error("Error sending lead email:", error)
    return false
  }
}

export async function sendVerificationUpdateEmail(
  email: string,
  name: string,
  status: "approved" | "rejected",
  reason?: string
): Promise<boolean> {
  const subject = status === "approved"
    ? "🎉 Storefront Verification Approved - DIGIMART360"
    : "⚠️ Storefront Verification Rejected - DIGIMART360"

  const html = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #fcfcfc;">
      <h2 style="color: ${status === "approved" ? "#009E49" : "#E37222"}; margin-bottom: 24px;">
        ${status === "approved" ? "Congratulations!" : "Verification Update"}
      </h2>
      <p style="color: #0B2545; font-size: 16px; line-height: 1.5;">Hi ${name},</p>
      <p style="color: #0B2545; font-size: 16px; line-height: 1.5;">
        Your DIGIMART360 seller verification request has been **${status.toUpperCase()}** by our administration team.
      </p>
      
      ${status === "approved"
        ? `<p style="color: #0B2545; font-size: 16px; line-height: 1.5;">Your seller storefront is now verified! A verified badge is shown on your store and your products are ranked higher in buyer searches.</p>`
        : `<div style="background-color: #fffaf0; border: 1px solid #feebc8; padding: 16px; border-radius: 8px; margin: 24px 0;">
             <h4 style="margin: 0 0 8px 0; color: #c05621;">Reason for rejection:</h4>
             <p style="margin: 0; color: #7b341e; font-size: 14px;">${reason || "Please ensure all uploaded verification documents are clear and valid."}</p>
           </div>
           <p style="color: #0B2545; font-size: 16px; line-height: 1.5;">You can re-upload your registration documents in your seller profile settings for re-review.</p>`
      }
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://digimart360.com/seller" style="display: inline-block; padding: 12px 28px; background-color: ${status === "approved" ? "#009E49" : "#0F4C5C"}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Go to Dashboard
        </a>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #0B2545; font-size: 14px; font-weight: 600;">DIGIMART360 Team</p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject,
      html,
      text: `Hi ${name}, your seller verification has been ${status}. ${reason ? "Reason: " + reason : ""}`,
    })
    return true
  } catch (error) {
    console.error("Error sending verification update email:", error)
    return false
  }
}
