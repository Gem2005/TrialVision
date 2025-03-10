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
}

export function ChatInterface({ trialData, predictionResult }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize with a welcome message
  useEffect(() => {
    const initialMessage = `Based on my analysis of your clinical trial data, I can provide additional insights about the prediction.
    
The model has predicted that your trial is ${predictionResult.prediction === "Completed" ? "likely to complete" : "at risk of not completing"}.

${predictionResult.explanation.top_contributing_features
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

    // Simulate API call delay
    setTimeout(() => {
      // Mock response based on user input
      let response = ""

      if (userMessage.toLowerCase().includes("improve") || userMessage.toLowerCase().includes("suggestion")) {
        response = `Here are some suggestions to improve the likelihood of completion:

1. ${predictionResult.prediction === "Completed" ? "Maintain" : "Increase"} your enrollment target: Consider ${predictionResult.prediction === "Completed" ? "maintaining your current" : "increasing your"} enrollment size to ensure statistical power.

2. Simplify eligibility criteria: Make your inclusion/exclusion criteria clearer and less restrictive where possible.

3. Consider your intervention model: ${trialData.Intervention_Model ? `Your current model (${trialData.Intervention_Model}) ${predictionResult.prediction === "Completed" ? "is working well" : "might be too complex"}` : "Choose an intervention model that balances scientific rigor with practical implementation"}.

4. Optimize study design: Ensure your masking and allocation strategies are appropriate for your research question.

Would you like more specific recommendations for any of these areas?`
      } else if (userMessage.toLowerCase().includes("risk") || userMessage.toLowerCase().includes("challenge")) {
        response = `Based on your trial design, here are the key risk factors to monitor:

1. ${predictionResult.explanation.top_contributing_features[0].impact < 0 ? `${predictionResult.explanation.top_contributing_features[0].feature.charAt(0).toUpperCase() + predictionResult.explanation.top_contributing_features[0].feature.slice(1).replace(/_/g, " ")}: This is your highest risk factor` : "Enrollment challenges: Even though your enrollment plan looks good, this is often a challenge for many trials"}

2. Protocol complexity: ${trialData.criteria.length > 200 ? "Your eligibility criteria are quite detailed, which may create recruitment challenges" : "Keep your protocol as streamlined as possible"}

3. Operational execution: Ensure you have adequate site support and monitoring

4. Regulatory considerations: Plan for potential regulatory delays or changes in requirements

Would you like a more detailed risk mitigation plan?`
      } else if (userMessage.toLowerCase().includes("explain") || userMessage.toLowerCase().includes("why")) {
        response = `Let me explain more about why the model made this prediction:

The algorithm analyzed patterns from thousands of previous clinical trials and identified key factors that correlate with completion status.

For your specific trial:

${predictionResult.explanation.top_contributing_features
  .map((feature: { feature: string; impact: number }) => {
    const featureName = feature.feature.charAt(0).toUpperCase() + feature.feature.slice(1).replace(/_/g, " ")
    let explanation = ""

    if (feature.feature === "enrollment") {
      explanation =
        feature.impact > 0
          ? "Higher enrollment numbers typically indicate better planning and resources"
          : "Lower enrollment may suggest recruitment challenges"
    } else if (feature.feature === "criteria") {
      explanation =
        feature.impact > 0
          ? "Your eligibility criteria are clear and well-defined"
          : "Your eligibility criteria may be too restrictive or complex"
    } else if (feature.feature === "Intervention_Model") {
      explanation =
        feature.impact > 0
          ? `Your intervention model (${trialData.Intervention_Model}) is associated with higher completion rates`
          : `Your intervention model (${trialData.Intervention_Model}) may add complexity`
    } else {
      explanation =
        feature.impact > 0
          ? "This factor positively influenced the prediction"
          : "This factor negatively influenced the prediction"
    }

    return `• ${featureName}: ${explanation} (Impact: ${feature.impact.toFixed(2)})`
  })
  .join("\n\n")}

The model combines these factors using a Random Forest algorithm to make its final prediction.`
      } else {
        response = `Thank you for your question. Based on the clinical trial information you've provided:

Study: "${trialData.study_title}"
Condition: ${trialData.condition}
Intervention: ${trialData.intervention}

The model has analyzed various aspects of your trial design and predicted ${predictionResult.prediction === "Completed" ? "successful completion" : "potential completion challenges"}.

The most influential factors were:
• ${predictionResult.explanation.top_contributing_features[0].feature.charAt(0).toUpperCase() + predictionResult.explanation.top_contributing_features[0].feature.slice(1).replace(/_/g, " ")} (Impact: ${predictionResult.explanation.top_contributing_features[0].impact.toFixed(2)})
• ${predictionResult.explanation.top_contributing_features[1].feature.charAt(0).toUpperCase() + predictionResult.explanation.top_contributing_features[1].feature.slice(1).replace(/_/g, " ")} (Impact: ${predictionResult.explanation.top_contributing_features[1].impact.toFixed(2)})

Is there a specific aspect of the prediction you'd like me to elaborate on?`
      }

      setMessages((prev) => [...prev, { role: "assistant", content: response }])
      setIsLoading(false)
    }, 1500)
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

