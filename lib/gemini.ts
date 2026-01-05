import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "")

// Use the latest available model name
const MODEL_NAME = "gemini-2.5-flash"

export interface AIMessage {
  role: "user" | "ai"
  content: string
  timestamp: number
}

export interface LearningPath {
  topic: string
  steps: {
    title: string
    description: string
    resources: string[]
    estimatedTime: string
  }[]
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

/**
 * Generate an explanation for a topic using Gemini AI
 */
export async function generateTopicExplanation(topic: string, level: "beginner" | "intermediate" | "advanced" = "intermediate"): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })
    
    const prompt = `You are an expert educator. Explain the topic "${topic}" at a ${level} level. 
    Make it clear, engaging, and include practical examples. Keep it concise (around 200-300 words).`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error generating explanation:", error)
    throw new Error("Failed to generate explanation")
  }
}

/**
 * Generate a learning path for a topic
 */
export async function generateLearningPath(topic: string): Promise<LearningPath> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })
    
    const prompt = `Create a comprehensive learning path for "${topic}". 
    Return a JSON object with:
    - topic: string
    - steps: array of {title, description, resources (keywords), estimatedTime}
    Provide 5-7 steps. Be specific and practical.`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    throw new Error("Invalid response format")
  } catch (error) {
    console.error("Error generating learning path:", error)
    throw new Error("Failed to generate learning path")
  }
}

/**
 * Generate quiz questions for a topic
 */
export async function generateQuizQuestions(topic: string, count: number = 5): Promise<QuizQuestion[]> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })
    
    const prompt = `Generate ${count} multiple-choice quiz questions about "${topic}".
    Return a JSON array of objects with:
    - question: string
    - options: array of 4 strings
    - correctAnswer: number (0-3 index)
    - explanation: string (why the answer is correct)
    Make questions challenging but fair.`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    throw new Error("Invalid response format")
  } catch (error) {
    console.error("Error generating quiz:", error)
    throw new Error("Failed to generate quiz questions")
  }
}

/**
 * Chat with AI for learning assistance
 */
export async function chatWithAI(messages: AIMessage[], context?: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })
    
    // Build conversation history
    let prompt = context 
      ? `Context: ${context}\n\nConversation:\n` 
      : "You are a helpful AI tutor. Assist the student with their questions.\n\nConversation:\n"
    
    messages.forEach((msg) => {
      prompt += `${msg.role === "user" ? "Student" : "Tutor"}: ${msg.content}\n`
    })
    
    prompt += "Tutor:"
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error in AI chat:", error)
    throw new Error("Failed to get AI response")
  }
}

/**
 * Solve a problem step by step
 */
export async function solveProblem(problem: string, subject: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })
    
    const prompt = `You are an expert ${subject} tutor. Solve this problem step by step:

Problem: ${problem}

Provide:
1. Problem analysis
2. Step-by-step solution
3. Final answer
4. Key concepts used

Be clear and educational.`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error solving problem:", error)
    throw new Error("Failed to solve problem")
  }
}

/**
 * Generate practice problems
 */
export async function generatePracticeProblems(topic: string, difficulty: "easy" | "medium" | "hard", count: number = 3): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })
    
    const prompt = `Generate ${count} ${difficulty} practice problems about "${topic}".
    Return a JSON array of problem strings. Each problem should be clear and self-contained.`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    throw new Error("Invalid response format")
  } catch (error) {
    console.error("Error generating problems:", error)
    throw new Error("Failed to generate practice problems")
  }
}

/**
 * Get study tips for a topic
 */
export async function getStudyTips(topic: string): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })
    
    const prompt = `Provide 5-7 practical study tips for learning "${topic}".
    Return a JSON array of tip strings. Each tip should be actionable and specific.`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    throw new Error("Invalid response format")
  } catch (error) {
    console.error("Error generating study tips:", error)
    throw new Error("Failed to generate study tips")
  }
}

/**
 * Summarize content
 */
export async function summarizeContent(content: string, maxLength: number = 200): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })
    
    const prompt = `Summarize the following content in approximately ${maxLength} words:

${content}

Provide a clear, concise summary that captures the key points.`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error summarizing content:", error)
    throw new Error("Failed to summarize content")
  }
}
