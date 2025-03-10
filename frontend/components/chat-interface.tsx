"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2 } from "lucide-react"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatInterfaceProps {
  trialData: any
  predictionResult: any
  clinicalReport?: string | null // Add clinical report as optional prop
}

export function ChatInterface({ trialData, predictionResult, clinicalReport }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize with a welcome message
  useEffect(() => {
    if (!predictionResult) return
    
    try {
      const topFeatures = predictionResult?.explanation?.top_contributing_features || [];
      
      const initialMessage = `Based on my analysis of your clinical trial data, I can provide additional insights.

The model has predicted that your trial is ${predictionResult.prediction === "Completed" ? "likely to complete" : "at risk of not completing"}.

${topFeatures
  .slice(0, 3)
  .map((feature: { feature: string; impact: number }) => {
    const featureName = feature.feature.charAt(0).toUpperCase() + feature.feature.slice(1).replace(/_/g, " ")
    return `• ${featureName}: ${feature.impact > 0 ? "Positive impact" : "Negative impact"} (${Math.abs(feature.impact).toFixed(2)})`
  })
  .join("\n")}

Would you like me to suggest ways to improve the likelihood of completion, or do you have specific questions about the prediction?`

      setMessages([
        {
          role: "assistant",
          content: initialMessage,
        },
      ])
    } catch (error) {
      console.error("Error setting initial message:", error);
      setMessages([
        {
          role: "assistant",
          content: "I'm ready to help analyze your clinical trial results. What would you like to know?",
        },
      ]);
    }
  }, [predictionResult])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)
    setError(null)

    try {
      // Get the Gemini API key from environment variables
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

      if (!geminiApiKey) {
        throw new Error("Gemini API key not configured")
      }

      // Create a context-rich prompt that includes trial data, prediction results, and the clinical report
      let prompt = `You are an AI assistant analyzing clinical trial data and providing insights based on a prediction model's results.

CLINICAL TRIAL DATA:
Study Title: ${trialData.study_title || "Not provided"}
Condition: ${trialData.condition || "Not provided"}
Intervention: ${trialData.intervention || "Not provided"}
Enrollment Size: ${trialData.enrollment || "Not provided"}
Allocation: ${trialData.Allocation || "Not provided"}
Intervention Model: ${trialData.Intervention_Model || "Not provided"}
Masking: ${trialData.Masking || "Not provided"}
Primary Purpose: ${trialData.Primary_Purpose || "Not provided"}

MODEL PREDICTION:
Predicted Outcome: ${predictionResult.prediction}
Interpretation: ${predictionResult.explanation.interpretation || "No interpretation provided"}

TOP CONTRIBUTING FACTORS:
${predictionResult.explanation.top_contributing_features
  ?.map((feature: {feature: string; impact: number}) => 
    `- ${feature.feature}: Impact score ${feature.impact.toFixed(2)}`
  )
  .join("\n") || "No factors provided"}
`

      // Include clinical report in the prompt if available
      if (clinicalReport) {
        prompt += `\nCLINICAL REPORT SUMMARY:
The generated clinical report includes a detailed analysis of the prediction results, with sections on Executive Summary, Key Factors Analysis, Recommendations, and RNA/DNA Analysis.
`
      }

      // Add user query to prompt
      prompt += `\nUSER QUERY:
${userMessage}

Please provide a helpful, informative response that addresses the user's question based on the clinical trial data and prediction results. If relevant, reference insights from the clinical report.`

      // Call Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const geminiResponse = data?.contents?.[0]?.parts?.[0]?.text || "I couldn't generate a response. Please try again."

      setMessages((prev) => [...prev, { role: "assistant", content: geminiResponse }])
    } catch (err: any) {
      console.error("Error calling Gemini API:", err)
      setError(err.message || "An error occurred")
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm sorry, I encountered an error processing your request. Please try again later." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[500px] border rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
              <Avatar className={message.role === "user" ? "bg-primary" : "bg-muted"}>
                <AvatarFallback>
                  {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-lg p-3 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <div className="whitespace-pre-line">{message.content}</div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <Avatar className="bg-muted">
                <AvatarFallback>
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg p-4 bg-muted flex items-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="mx-auto my-2 px-3 py-1 text-sm bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-md">
            Error: {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Ask about your prediction results..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

