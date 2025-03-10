import { CheckCircle2, Database, Wrench, Microscope, Brain, BarChart3 } from "lucide-react"

export function ProcessTimeline() {
  const steps = [
    {
      title: "Data Collection",
      description: "Gathered structured and unstructured clinical trial data",
      icon: Database,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
    },
    {
      title: "Data Preparation",
      description: "Cleaned, processed, and transformed the raw data",
      icon: Wrench,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
    },
    {
      title: "Feature Selection",
      description: "Identified the most predictive factors for trial completion",
      icon: Microscope,
      color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
    },
    {
      title: "Model Building",
      description: "Trained and optimized machine learning models",
      icon: Brain,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300",
    },
    {
      title: "Explanation",
      description: "Used SHAP to explain why trials succeed or fail",
      icon: BarChart3,
      color: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
    },
  ]

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 h-full w-0.5 bg-border md:left-1/2 -ml-px"></div>

      <div className="space-y-12">
        {steps.map((step, index) => (
          <div key={index} className={`relative flex items-center ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground md:absolute md:left-1/2 md:-ml-4 z-10">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <div className={`w-full md:w-[calc(50%-2rem)] ${index % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}>
              <div className="rounded-lg border bg-card p-4 shadow-sm">
                <div className={`inline-flex items-center justify-center rounded-full p-2 ${step.color} mb-3`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground mt-1">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

