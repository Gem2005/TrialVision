import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { CheckCircle, XCircle, BarChart3, TrendingUp, TrendingDown, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface FeatureImpact {
  feature: string
  impact: number
}

interface PredictionResultProps {
  result: {
    prediction: string
    explanation: {
      top_contributing_features: FeatureImpact[]
      interpretation: string
    }
  }
}

// Map feature names to more readable labels
const featureLabels: Record<string, string> = {
  study_title: "Study Title",
  criteria: "Eligibility Criteria",
  enrollment: "Enrollment Size",
  Allocation: "Allocation Method",
  Intervention_Model: "Intervention Model",
  Masking: "Masking Type",
  Primary_Purpose: "Primary Purpose",
  intervention: "Intervention",
  condition: "Condition",
}

export function PredictionResult({ result }: PredictionResultProps) {
  const isCompleted = result.prediction === "Completed"
  const [clinicalReport, setClinicalReport] = useState<string | null>(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)

  const generateClinicalReport = async () => {
    setIsGeneratingReport(true)
    setReportError(null)
    
    try {
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      console.log("Gemini API Key:", geminiApiKey)
      if (!geminiApiKey) {
        throw new Error("Gemini API key not configured")
      }

      // Build a prompt based on the prediction outcome
      const reportPrompt = `
Generate a detailed clinical trial report based on the prediction that this trial is "${result.prediction}".

${isCompleted ? 
  "Focus on success factors and replication strategies, including potential RNA/DNA analysis insights." :
  "Focus on failure factors and corrective actions, including potential RNA/DNA analysis insights."}

Include these sections:
1. Executive Summary
2. Key Factors Analysis
3. Recommendations
4. RNA/DNA Analysis Insights (hypothetical)

Contributing factors from our analysis:
${result.explanation.top_contributing_features.map(f => 
  `- ${featureLabels[f.feature] || f.feature}: Impact score ${f.impact.toFixed(2)}`
).join("\n")}

Model's interpretation: ${result.explanation.interpretation}

Format the report professionally with markdown headings and bullet points.
`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: reportPrompt }],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const generatedReport = data?.contents?.[0]?.parts?.[0]?.text || "No report content generated."
      setClinicalReport(generatedReport)
    } catch (error: any) {
      console.error("Error generating report:", error)
      setReportError(error.message || "Failed to generate clinical report")
    } finally {
      setIsGeneratingReport(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card
        className={
          isCompleted
            ? "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900"
            : "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900"
        }
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isCompleted ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500" />
                <span className="text-green-600 dark:text-green-500">Predicted to Complete</span>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
                <span className="text-red-600 dark:text-red-500">Predicted Not to Complete</span>
              </>
            )}
          </CardTitle>
          <CardDescription className="text-foreground/80">{result.explanation.interpretation}</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top Contributing Factors
          </CardTitle>
          <CardDescription>These factors had the most significant impact on the prediction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {result.explanation?.top_contributing_features?.length ? (
              result.explanation.top_contributing_features.map((feature, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{featureLabels[feature.feature] || feature.feature}</span>
                    <span className={`flex items-center ${feature.impact > 0 ? "text-green-600" : "text-red-600"}`}>
                      {feature.impact > 0 ? (
                        <TrendingUp className="mr-1 h-4 w-4" />
                      ) : (
                        <TrendingDown className="mr-1 h-4 w-4" />
                      )}
                      {Math.abs(feature.impact).toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full ${feature.impact > 0 ? "bg-green-500" : "bg-red-500"}`}
                      style={{ width: `${Math.abs(feature.impact) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {feature.impact > 0
                      ? `This factor increased the likelihood of completion.`
                      : `This factor decreased the likelihood of completion.`}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No contributing factors available
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Clinical Report Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Clinical Trial Report
          </CardTitle>
          <CardDescription>
            Generate a comprehensive clinical report with insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!clinicalReport && !isGeneratingReport && !reportError && (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Get a detailed report including success factors, RNA/DNA analysis, and recommendations
              </p>
              <Button onClick={generateClinicalReport}>
                <FileText className="mr-2 h-4 w-4" />
                Generate Clinical Report
              </Button>
            </div>
          )}

          {isGeneratingReport && (
            <div className="flex items-center justify-center py-12 flex-col">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-center text-muted-foreground">Generating comprehensive clinical report...</p>
            </div>
          )}

          {reportError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{reportError}</AlertDescription>
            </Alert>
          )}

          {clinicalReport && !isGeneratingReport && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="report">
                <AccordionTrigger>View Complete Clinical Report</AccordionTrigger>
                <AccordionContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ 
                      __html: clinicalReport
                        .replace(/\n/g, '<br>')
                        .replace(/#{1,6}\s+(.*?)$/gm, '<h3 class="font-bold text-lg mt-4 mb-2">$1</h3>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/- (.*?)$/gm, '<li>$1</li>').replace(/(?:<li>[\s\S]*?<\/li>)/g, match => `<ul class="list-disc ml-6 my-2">${match}</ul>`)
                    }} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </CardContent>
        {clinicalReport && (
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={() => setClinicalReport(null)}>
              Reset Report
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

