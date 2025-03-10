"use client"

import { useEffect, useRef } from "react"

export function ModelComparisonChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 500
    canvas.height = 400

    // Model performance data
    const models = [
      { name: "Logistic Regression", accuracy: 0.81, precision: 0.79, recall: 0.76, f1: 0.77 },
      { name: "Decision Tree", accuracy: 0.85, precision: 0.83, recall: 0.82, f1: 0.82 },
      { name: "Random Forest", accuracy: 0.95, precision: 0.94, recall: 0.93, f1: 0.93 },
      { name: "XGBoost", accuracy: 0.93, precision: 0.92, recall: 0.91, f1: 0.91 },
      { name: "Neural Network", accuracy: 0.9, precision: 0.89, recall: 0.88, f1: 0.88 },
    ]

    // Chart configuration
    const barWidth = 60
    const barGap = 20
    const groupGap = 40
    const startY = 300
    const startX = 70
    const maxBarHeight = 250

    // Colors for metrics
    const metricColors = {
      accuracy: "#3b82f6", // blue-500
      precision: "#8b5cf6", // violet-500
      recall: "#10b981", // emerald-500
      f1: "#f59e0b", // amber-500
    }

    // Draw title
    ctx.font = "bold 16px sans-serif"
    ctx.fillStyle = "#000"
    ctx.textAlign = "center"
    ctx.fillText("Model Performance Comparison", canvas.width / 2, 25)

    // Draw legend
    const legendItems = [
      { label: "Accuracy", color: metricColors.accuracy },
      { label: "Precision", color: metricColors.precision },
      { label: "Recall", color: metricColors.recall },
      { label: "F1 Score", color: metricColors.f1 },
    ]

    const legendX = 350
    const legendY = 60

    legendItems.forEach((item, i) => {
      // Draw color box
      ctx.fillStyle = item.color
      ctx.fillRect(legendX, legendY + i * 20, 15, 15)

      // Draw label
      ctx.font = "12px sans-serif"
      ctx.fillStyle = "#000"
      ctx.textAlign = "left"
      ctx.fillText(item.label, legendX + 25, legendY + i * 20 + 12)
    })

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(startX, 50)
    ctx.lineTo(startX, startY)
    ctx.lineTo(canvas.width - 20, startY)
    ctx.strokeStyle = "#000"
    ctx.stroke()

    // Draw y-axis labels
    for (let i = 0; i <= 10; i++) {
      const value = i / 10
      const y = startY - value * maxBarHeight

      ctx.font = "12px sans-serif"
      ctx.fillStyle = "#666"
      ctx.textAlign = "right"
      ctx.fillText(value.toFixed(1), startX - 5, y + 4)

      // Draw grid line
      ctx.beginPath()
      ctx.moveTo(startX, y)
      ctx.lineTo(canvas.width - 20, y)
      ctx.strokeStyle = "#ddd"
      ctx.stroke()
    }

    // Draw bars for each model
    models.forEach((model, modelIndex) => {
      const groupX = startX + modelIndex * (4 * barWidth + groupGap)

      // Draw model name
      ctx.font = "12px sans-serif"
      ctx.fillStyle = "#000"
      ctx.textAlign = "center"
      ctx.fillText(model.name, groupX + 2 * barWidth, startY + 20)

      // Draw bars for each metric
      const metrics = [
        { key: "accuracy", value: model.accuracy },
        { key: "precision", value: model.precision },
        { key: "recall", value: model.recall },
        { key: "f1", value: model.f1 },
      ]

      metrics.forEach((metric, metricIndex) => {
        const x = groupX + metricIndex * barWidth
        const height = metric.value * maxBarHeight
        const y = startY - height

        // Draw bar
        ctx.fillStyle = metricColors[metric.key as keyof typeof metricColors]
        ctx.fillRect(x, y, barWidth - 5, height)

        // Draw value on top of bar
        ctx.font = "12px sans-serif"
        ctx.fillStyle = "#000"
        ctx.textAlign = "center"
        ctx.fillText(metric.value.toFixed(2), x + (barWidth - 5) / 2, y - 5)
      })
    })
  }, [])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="max-w-full" style={{ maxHeight: "400px" }} />
    </div>
  )
}

