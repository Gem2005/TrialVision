import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Database, Wrench, Microscope, Brain, LineChart, ArrowRight } from "lucide-react"
import { ProcessTimeline } from "@/components/process-timeline"
import { FeatureImportanceChart } from "@/components/feature-importance-chart"
import { ModelComparisonChart } from "@/components/model-comparison-chart"
import { ShapExplanationChart } from "@/components/shap-explanation-chart"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <LineChart className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Clinical Trial Predictor</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#overview" className="text-sm font-medium hover:underline">
              Overview
            </Link>
            <Link href="#process" className="text-sm font-medium hover:underline">
              Process
            </Link>
            <Link href="#results" className="text-sm font-medium hover:underline">
              Results
            </Link>
            <Link href="#explanations" className="text-sm font-medium hover:underline">
              Explanations
            </Link>
          </nav>
          <Link href="/predict" className="no-underline">
            <Button>Try the Model</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <section id="overview" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Predicting Clinical Trial Completion
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Using machine learning to predict whether a clinical trial will be completed, while providing
                  explanations for the predictions.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/predict" className="no-underline">
                    <Button size="lg">
                      Explore the Model
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg">
                    View Documentation
                  </Button>
                </div>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl">
                <Image
                  src="/placeholder.svg?height=720&width=1280"
                  alt="Clinical trial prediction dashboard visualization"
                  width={1280}
                  height={720}
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section id="process" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How We Did It</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our approach combines structured and unstructured data to build a robust prediction model.
                </p>
              </div>
            </div>
            <div className="mx-auto mt-16 max-w-5xl">
              <ProcessTimeline />
            </div>
          </div>
        </section>

        <section id="details" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <Tabs defaultValue="data" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="data">Data Collection</TabsTrigger>
                <TabsTrigger value="preparation">Data Preparation</TabsTrigger>
                <TabsTrigger value="features">Feature Selection</TabsTrigger>
                <TabsTrigger value="model">Model Building</TabsTrigger>
              </TabsList>
              <TabsContent value="data" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Data Collection
                    </CardTitle>
                    <CardDescription>Gathering structured and unstructured clinical trial data</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">Data Sources</h3>
                      <ul className="space-y-2 list-disc pl-5">
                        <li>Structured data (participants, study type, duration)</li>
                        <li>Unstructured data (study descriptions, eligibility criteria)</li>
                        <li>Metadata about trial sponsors and locations</li>
                        <li>Historical completion rates by therapeutic area</li>
                      </ul>
                      <h3 className="text-xl font-bold mt-6">Challenges</h3>
                      <ul className="space-y-2 list-disc pl-5">
                        <li>Missing values in key fields</li>
                        <li>Imbalanced dataset (more incomplete than completed trials)</li>
                        <li>Inconsistent formatting in text descriptions</li>
                        <li>Varying levels of detail across different trials</li>
                      </ul>
                    </div>
                    <div className="relative aspect-square overflow-hidden rounded-xl">
                      <Image
                        src="/placeholder.svg?height=600&width=600"
                        alt="Data collection visualization"
                        width={600}
                        height={600}
                        className="object-cover"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="preparation" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Data Preparation
                    </CardTitle>
                    <CardDescription>Cleaning and transforming the data for analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">Preprocessing Steps</h3>
                      <ul className="space-y-2 list-disc pl-5">
                        <li>Removed duplicate and missing entries</li>
                        <li>Processed text fields using NLP techniques</li>
                        <li>Converted categorical variables to numerical representations</li>
                        <li>Normalized numerical features to common scales</li>
                        <li>Split data into training, validation, and test sets</li>
                      </ul>
                      <h3 className="text-xl font-bold mt-6">Text Processing</h3>
                      <ul className="space-y-2 list-disc pl-5">
                        <li>Tokenization of study descriptions</li>
                        <li>Removal of stop words and medical jargon normalization</li>
                        <li>TF-IDF vectorization of text fields</li>
                        <li>Entity recognition for medical conditions and treatments</li>
                      </ul>
                    </div>
                    <div className="relative aspect-square overflow-hidden rounded-xl">
                      <Image
                        src="/placeholder.svg?height=600&width=600"
                        alt="Data preparation workflow"
                        width={600}
                        height={600}
                        className="object-cover"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="features" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Microscope className="h-5 w-5" />
                      Feature Selection
                    </CardTitle>
                    <CardDescription>Identifying the most predictive factors for trial completion</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">Key Features</h3>
                      <ul className="space-y-2 list-disc pl-5">
                        <li>Eligibility criteria complexity and specificity</li>
                        <li>Study title clarity and focus</li>
                        <li>Number of participants and enrollment rate</li>
                        <li>Medical conditions under investigation</li>
                        <li>Study phase and intervention type</li>
                        <li>Geographic distribution of trial sites</li>
                        <li>Sponsor type (industry, academic, government)</li>
                      </ul>
                      <h3 className="text-xl font-bold mt-6">Selection Methods</h3>
                      <ul className="space-y-2 list-disc pl-5">
                        <li>Recursive feature elimination</li>
                        <li>Principal component analysis</li>
                        <li>Correlation analysis to remove redundant features</li>
                        <li>Domain expert validation of selected features</li>
                      </ul>
                    </div>
                    <div className="h-full flex items-center justify-center">
                      <FeatureImportanceChart />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="model" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Model Building
                    </CardTitle>
                    <CardDescription>Training and optimizing machine learning models</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">Model Development</h3>
                      <ul className="space-y-2 list-disc pl-5">
                        <li>Started with Logistic Regression (81% accuracy)</li>
                        <li>Improved results using Random Forest (95% accuracy)</li>
                        <li>Experimented with XGBoost and neural networks</li>
                        <li>Hyperparameter tuning using grid search</li>
                        <li>Cross-validation to ensure model robustness</li>
                      </ul>
                      <h3 className="text-xl font-bold mt-6">Handling Imbalanced Data</h3>
                      <ul className="space-y-2 list-disc pl-5">
                        <li>Applied SMOTE (Synthetic Minority Over-sampling Technique)</li>
                        <li>Used class weights to penalize misclassification of minority class</li>
                        <li>Evaluated using precision, recall, and F1-score</li>
                        <li>Optimized for balanced performance across classes</li>
                      </ul>
                    </div>
                    <div className="h-full flex items-center justify-center">
                      <ModelComparisonChart />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section id="results" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Results & Explanations</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Not just predicting outcomes, but understanding why trials succeed or fail.
                </p>
              </div>
            </div>
            <div className="mx-auto mt-16 max-w-5xl">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Prediction Explanations
                  </CardTitle>
                  <CardDescription>
                    Using SHAP (Shapley Additive Explanations) to interpret model predictions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-8 lg:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">Key Findings</h3>
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border bg-card">
                          <h4 className="font-semibold text-green-600">Factors Increasing Completion Chances</h4>
                          <ul className="mt-2 space-y-1 list-disc pl-5">
                            <li>Clear, specific eligibility criteria</li>
                            <li>Concise and focused study title</li>
                            <li>Realistic enrollment targets</li>
                            <li>Industry-sponsored trials</li>
                            <li>Later phase studies (Phase 3, 4)</li>
                          </ul>
                        </div>
                        <div className="p-4 rounded-lg border bg-card">
                          <h4 className="font-semibold text-red-600">Factors Decreasing Completion Chances</h4>
                          <ul className="mt-2 space-y-1 list-disc pl-5">
                            <li>Vague or overly complex descriptions</li>
                            <li>Very restrictive eligibility criteria</li>
                            <li>Low enrollment rates in early stages</li>
                            <li>Rare disease studies with small populations</li>
                            <li>Multiple geographic regions (coordination challenges)</li>
                          </ul>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg border bg-card mt-4">
                        <h4 className="font-semibold">Practical Applications</h4>
                        <ul className="mt-2 space-y-1 list-disc pl-5">
                          <li>Trial design optimization before launch</li>
                          <li>Early intervention for at-risk trials</li>
                          <li>Resource allocation based on completion probability</li>
                          <li>Improved planning for pharmaceutical pipelines</li>
                        </ul>
                      </div>
                    </div>
                    <div className="h-full flex items-center justify-center">
                      <ShapExplanationChart />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="try-it" className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Try the Prediction Model
                </h2>
                <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Input your clinical trial parameters and see the predicted completion probability.
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm space-y-2">
                <Link href="/predict" className="no-underline">
                  <Button size="lg" variant="secondary" className="w-full">
                    Launch Predictor Tool
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/predict" className="no-underline">
                  <Button size="lg" className="mt-8">
                    Try and Explore
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">© 2025 Clinical Trial Predictor. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

