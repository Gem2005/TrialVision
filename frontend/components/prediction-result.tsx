import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { CheckCircle, XCircle, BarChart3, TrendingUp, TrendingDown, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Add these imports
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import * as docx from 'docx';

interface FeatureImpact {
  feature: string
  impact: number
}

interface PredictionResultProps {
  result: {
    prediction: string
    enrollment: number
    Allocation: string
    study_title: string
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

// Fix the FeatureImpactChart component
const FeatureImpactChart = ({ features }: { features: FeatureImpact[] }) => {
  // More robust check to ensure features is an array
  if (!features || !Array.isArray(features) || features.length === 0) return null;
  
  try {
    const chartData = features.map(f => ({
      name: featureLabels[f.feature] || f.feature,
      impact: parseFloat(f.impact.toFixed(2)),
      fill: f.impact > 0 ? "#4ade80" : "#f87171"
    }));
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Feature Impact Distribution</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={['dataMin', 'dataMax']} />
            <YAxis type="category" dataKey="name" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="impact" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (error) {
    console.error("Error rendering feature impact chart:", error);
    return null; // Safely return null if chart creation fails
  }
};

export function PredictionResult({ result }: PredictionResultProps) {
  const isCompleted = result.prediction === "Completed"
  const [clinicalReport, setClinicalReport] = useState<string | null>(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)

  // Update the generateClinicalReport function
  const generateClinicalReport = async () => {
    setIsGeneratingReport(true);
    setReportError(null);
    
    try {
      // Add this safety check
      const topFeatures = Array.isArray(result.explanation?.top_contributing_features) 
        ? result.explanation.top_contributing_features 
        : [];
        
      // Update the report prompt in your generateClinicalReport function
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const reportPrompt = `
Generate a comprehensive clinical trial report based on the prediction that this trial is "${result.prediction}".

Trial Title: ${result.study_title || "Unnamed Trial"}
Current Date: ${currentDate}
Prediction: ${result.prediction}

${isCompleted ? 
  "Focus on success factors and replication strategies, including potential RNA/DNA analysis insights." :
  "Focus on failure factors and corrective actions, including potential RNA/DNA analysis insights."}

Include these detailed sections:
1. Executive Summary - Provide a concise overview of the findings and key recommendations
2. Trial Overview - Include trial parameters like enrollment (${result.enrollment}), allocation (${result.Allocation}), etc.
3. Statistical Analysis - Analyze the prediction confidence and statistical significance
4. Key Contributing Factors - Detailed analysis of each factor that influenced the prediction
5. Risk Assessment - Evaluate potential risks to trial completion
6. Recommendations - Specific, actionable steps to improve

Contributing factors from our analysis:
${topFeatures.length > 0
  ? topFeatures.map(f => 
      `- ${featureLabels[f.feature] || f.feature}: Impact score ${f.impact.toFixed(2)}`
    ).join("\n")
  : "No contributing factors available"}

Model's interpretation: ${result.explanation?.interpretation || "No interpretation available"}

Format the report professionally with markdown headings and bullet points.
`;

      // Call our Next.js API route for Gemini
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: reportPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      setClinicalReport(data.response);
      
      // Call the callback if provided
      // if (onReportGenerated) {
      //   onReportGenerated(data.response);
      // if (onReportGenerated) {
      //   onReportGenerated(data.response);
      // }
        } catch (error: any) {
      console.error("Error generating report:", error);
      setReportError(error.message || "Failed to generate clinical report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Add these functions to your component
  const downloadPdf = () => {
    if (!clinicalReport) return;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text("Clinical Trial Report", 20, 20);
    doc.setFontSize(12);
    
    // Format and add content (this is simplified - you'll need to format it better)
    const textLines = clinicalReport.split('\n');
    let y = 30;
    textLines.forEach(line => {
      if (line.startsWith('#')) {
        doc.setFontSize(14);
        doc.text(line.replace(/#/g, '').trim(), 20, y);
        doc.setFontSize(12);
      } else {
        doc.text(line, 20, y);
      }
      y += 10;
      if (y > 280) { // New page if needed
        doc.addPage();
        y = 20;
      }
    });
    
    doc.save(`clinical-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const downloadDocx = async () => {
    if (!clinicalReport) return;
    
    const doc = new docx.Document({
      sections: [
        {
          properties: {},
          children: [
            new docx.Paragraph({
              text: "Clinical Trial Report",
              heading: docx.HeadingLevel.HEADING_1
            }),
            ...clinicalReport.split('\n').map(line => {
              if (line.startsWith('# ')) {
                return new docx.Paragraph({
                  text: line.replace('# ', ''),
                  heading: docx.HeadingLevel.HEADING_1
                });
              } else if (line.startsWith('## ')) {
                return new docx.Paragraph({
                  text: line.replace('## ', ''),
                  heading: docx.HeadingLevel.HEADING_2
                });
              } else {
                return new docx.Paragraph(line);
              }
            })
          ]
        }
      ]
    });
    
    docx.Packer.toBlob(doc).then((blob: Blob) => {
      saveAs(blob, `clinical-report-${new Date().toISOString().slice(0, 10)}.docx`);
    });
  };

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
          <FeatureImpactChart features={result.explanation.top_contributing_features} />
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

          {/* Update the report display */}
          {clinicalReport && !isGeneratingReport && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="report">
                <AccordionTrigger>View Complete Clinical Report</AccordionTrigger>
                <AccordionContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {/* Add charts before markdown content */}
                    <FeatureImpactChart 
                      features={result.explanation?.top_contributing_features} 
                    />
                    
                    <div className="mt-6">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {clinicalReport.replace('[DIAGRAM: Feature Impact Distribution]', '')}
                      </ReactMarkdown>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </CardContent>
        {clinicalReport && (
          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadPdf}>
                <FileText className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={downloadDocx}>
                <FileText className="mr-2 h-4 w-4" />
                Download DOCX
              </Button>
            </div>
            <Button variant="outline" onClick={() => setClinicalReport(null)}>
              Reset Report
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

