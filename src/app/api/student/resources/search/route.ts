import { NextRequest, NextResponse } from "next/server"

// Types matching the frontend WebResource interface
interface WebResource {
  title: string
  url: string
  description: string
  type: "book" | "course" | "tutorial" | "documentation" | "article"
  difficulty: "beginner" | "intermediate" | "advanced"
  rating: number
}

// Fallback mock data for development / when API is unavailable
const mockWebResults: WebResource[] = [
  {
    title: "MDN Web Docs – JavaScript",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    description: "Comprehensive documentation for JavaScript, including guides and references.",
    type: "documentation",
    difficulty: "beginner",
    rating: 4.9,
  },
  {
    title: "The Modern JavaScript Tutorial",
    url: "https://javascript.info",
    description: "From basics to advanced topics with simple, detailed explanations.",
    type: "tutorial",
    difficulty: "beginner",
    rating: 4.8,
  },
  {
    title: "You Don't Know JS Yet",
    url: "https://github.com/getify/You-Dont-Know-JS",
    description: "A book series diving deep into the core mechanisms of JavaScript.",
    type: "book",
    difficulty: "advanced",
    rating: 4.7,
  },
  {
    title: "CS50's Introduction to Computer Science",
    url: "https://cs50.harvard.edu/x/",
    description: "Harvard's legendary intro course, covering algorithms, data structures, and more.",
    type: "course",
    difficulty: "beginner",
    rating: 5.0,
  },
]

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json()

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required and must be a string" },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENROUTER_API_KEY

    // If no API key is set, return mock data (useful for development)
    if (!apiKey) {
      console.warn("OPENROUTER_API_KEY not set. Returning mock web resources.")
      return NextResponse.json({ resources: mockWebResults })
    }

    // Build the prompt for OpenRouter
    const prompt = `
You are an educational resource curator. Provide a list of 4-6 high-quality, free online learning resources about "${topic}".
Return ONLY a valid JSON array of objects with the following structure:
[
  {
    "title": "Resource title",
    "url": "Full https URL",
    "description": "Brief 1-2 sentence description",
    "type": "book" | "course" | "tutorial" | "documentation" | "article",
    "difficulty": "beginner" | "intermediate" | "advanced",
    "rating": number between 4.0 and 5.0
  }
]
Do not include any markdown formatting, code blocks, or additional text. Output only the JSON array.
    `.trim()

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "CodeKnight Learning Platform",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // or "google/gemini-2.0-flash-001" for cheaper/faster
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenRouter API error:", response.status, errorText)
      // Fallback to mock data on API failure
      return NextResponse.json({ resources: mockWebResults })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error("No content returned from OpenRouter")
    }

    // Parse the JSON response – sometimes the model wraps it in markdown code blocks
    let parsed: WebResource[]
    try {
      // Remove potential markdown fences
      const cleaned = content.replace(/```json|```/g, "").trim()
      parsed = JSON.parse(cleaned)
    } catch (parseError) {
      console.error("Failed to parse OpenRouter response:", parseError)
      return NextResponse.json({ resources: mockWebResults })
    }

    // Validate the parsed data (basic check)
    if (!Array.isArray(parsed)) {
      throw new Error("Response is not an array")
    }

    // Ensure each item has required fields
    const validResources = parsed.filter((item: any) =>
      item.title && item.url && item.description && item.type && item.difficulty && item.rating
    )

    return NextResponse.json({ resources: validResources.length ? validResources : mockWebResults })
  } catch (error) {
    console.error("Error in /api/student/resources/search:", error)
    // Always return mock data as fallback so the UI never breaks
    return NextResponse.json({ resources: mockWebResults })
  }
}