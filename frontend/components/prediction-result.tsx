import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, BarChart3, TrendingUp, TrendingDown } from "lucide-react"

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
            {result.explanation.top_contributing_features.map((feature, index) => (
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

