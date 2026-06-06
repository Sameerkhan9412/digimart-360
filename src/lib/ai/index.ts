import { connectDB } from "../database/db"
import { Setting } from "../database/models/Setting"

// Fetch AI settings dynamically from the Database
export async function getAISettings() {
  await connectDB()
  const keySetting = await Setting.findOne({ key: "openai_api_key" })
  const modelSetting = await Setting.findOne({ key: "openai_model" })
  
  return {
    apiKey: keySetting?.value || "",
    model: modelSetting?.value || "gpt-4o-mini",
  }
}

// Global helper to make OpenAI completion requests
async function callOpenAI(
  prompt: string,
  systemPrompt: string,
  jsonFormat = false
): Promise<{ content: string; isMock: boolean }> {
  const { apiKey, model } = await getAISettings()

  if (!apiKey) {
    return { content: "", isMock: true }
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        response_format: jsonFormat ? { type: "json_object" } : undefined,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("OpenAI API error response:", errorData)
      return { content: "", isMock: true }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ""
    return { content, isMock: false }
  } catch (error) {
    console.error("OpenAI request error:", error)
    return { content: "", isMock: true }
  }
}

// 1. Product Description Generator
export async function generateProductDescription(
  productName: string,
  keywords: string[]
): Promise<{ text: string; isMock: boolean }> {
  const systemPrompt = "You are a professional B2B marketing copywriter. Write a detailed, compelling product description focusing on specifications, quality standards, and wholesale benefits."
  const prompt = `Generate a wholesale catalog product description for: "${productName}". Include keywords: ${keywords.join(", ")}.`

  const result = await callOpenAI(prompt, systemPrompt)
  if (result.isMock) {
    const mockDescription = `Premium quality ${productName} designed for industrial and wholesale applications. Fabricated using high-grade materials conforming to international standards. Highlights include high durability, optimal efficiency, and customizable dimensions to suit your specific trade requirements.\n\nKeywords: ${keywords.join(", ")}.`
    return { text: mockDescription, isMock: true }
  }
  return { text: result.content, isMock: false }
}

// 2. SEO Metadata Generator
export async function generateSEOMetadata(
  productName: string,
  description: string
): Promise<{ title: string; description: string; keywords: string[]; isMock: boolean }> {
  const systemPrompt = "You are an SEO expert. Output a JSON object containing: 'title' (max 60 chars), 'description' (max 160 chars), and 'keywords' (array of strings)."
  const prompt = `Generate SEO meta tags for a B2B product page.\nProduct Name: ${productName}\nDescription: ${description}`

  const result = await callOpenAI(prompt, systemPrompt, true)
  if (result.isMock) {
    const cleanName = productName.replace(/[^a-zA-Z0-9 ]/g, "")
    return {
      title: `${cleanName} Wholesale - Manufacturer & Supplier | DIGIMART360`,
      description: `Get best price quotes on high quality ${productName}. Browse specifications and contact verified suppliers directly.`,
      keywords: [cleanName.toLowerCase(), "wholesale supplier", "bulk exporter", "b2b india", "manufacturer pricing"],
      isMock: true,
    }
  }

  try {
    const parsed = JSON.parse(result.content)
    return {
      title: parsed.title || `${productName} | DIGIMART360`,
      description: parsed.description || "",
      keywords: parsed.keywords || [],
      isMock: false,
    }
  } catch {
    return {
      title: `${productName} | DIGIMART360`,
      description: "",
      keywords: [],
      isMock: true,
    }
  }
}

// 3. Product Categorization Suggestion
export async function suggestCategory(
  productName: string,
  categories: { id: string; name: string }[]
): Promise<{ categoryId: string; confidence: number; isMock: boolean }> {
  const categoriesList = categories.map((c) => `${c.id}:${c.name}`).join(", ")
  const systemPrompt = `You are a product database organizer. Out of the following available categories list [id:name], select the single most relevant ID. Output a JSON object with: 'categoryId' and 'confidence' (decimal 0 to 1).\nCategories List: ${categoriesList}`
  const prompt = `Suggest the best category ID for product: "${productName}"`

  const result = await callOpenAI(prompt, systemPrompt, true)
  if (result.isMock) {
    return {
      categoryId: categories[0]?.id || "",
      confidence: 0.8,
      isMock: true,
    }
  }

  try {
    const parsed = JSON.parse(result.content)
    return {
      categoryId: parsed.categoryId || "",
      confidence: parsed.confidence || 0.5,
      isMock: false,
    }
  } catch {
    return {
      categoryId: categories[0]?.id || "",
      confidence: 0.5,
      isMock: true,
    }
  }
}

// 4. Product Tags Generator
export async function generateProductTags(
  productName: string,
  description: string
): Promise<{ tags: string[]; isMock: boolean }> {
  const systemPrompt = "You are a product tagging system. Output a JSON object with a single property 'tags' containing a list of 5-8 search-friendly B2B tags/keywords (all lowercase) for this product."
  const prompt = `Product Name: ${productName}\nDescription: ${description}`

  const result = await callOpenAI(prompt, systemPrompt, true)
  if (result.isMock) {
    const core = productName.toLowerCase().split(" ").slice(0, 3)
    return {
      tags: [...core, "wholesale", "exporter", "industrial", "manufacturer"],
      isMock: true,
    }
  }

  try {
    const parsed = JSON.parse(result.content)
    return {
      tags: parsed.tags || [],
      isMock: false,
    }
  } catch {
    return {
      tags: ["wholesale", "supplier"],
      isMock: true,
    }
  }
}

// 5. CRM Lead Scoring & Reasoning
export async function scoreLead(
  message: string,
  quantity: number,
  targetPrice?: number,
  buyerCompany?: string
): Promise<{ score: number; reasoning: string; isMock: boolean }> {
  const systemPrompt = "You are an AI Sales Operations manager scoring inbound B2B sales inquiries. Analyze the message content, quantity, company info, and target pricing. Output a JSON object with: 'score' (number from 0 to 100 representing probability of sale) and 'reasoning' (short 1-2 sentence explanation)."
  const prompt = `Analyze this lead inquiry:\nMessage: "${message}"\nQuantity Requested: ${quantity}\nTarget Price: ${targetPrice || "Not Specified"}\nBuyer Company: ${buyerCompany || "Not Specified"}`

  const result = await callOpenAI(prompt, systemPrompt, true)
  if (result.isMock) {
    // Basic heuristic scoring for mock mode
    let score = 50
    let reasoning = "Lead shows standard commercial interest."

    if (quantity > 100) {
      score += 20
      reasoning = "High quantity wholesale inquiry indicates a high potential order size."
    }
    if (message.toLowerCase().includes("urgent") || message.toLowerCase().includes("asap")) {
      score += 15
      reasoning += " Buyer indicated time sensitivity (Urgent requirement)."
    }
    if (buyerCompany) {
      score += 10
    }
    
    score = Math.min(score, 99)

    return { score, reasoning, isMock: true }
  }

  try {
    const parsed = JSON.parse(result.content)
    return {
      score: parsed.score || 50,
      reasoning: parsed.reasoning || "Analyzed by AI.",
      isMock: false,
    }
  } catch {
    return {
      score: 50,
      reasoning: "Lead score evaluated.",
      isMock: true,
    }
  }
}
