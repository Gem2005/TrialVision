"use client"

import { useEffect, useRef } from "react"

export function ShapExplanationChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 500
    canvas.height = 400

    // SHAP values data (positive and negative impacts)
    const shapValues = [
      { feature: "Eligibility Criteria", value: 0.32, positive: true },
      { feature: "Study Title", value: 0.28, positive: true },
      { feature: "Enrollment Rate", value: -0.25, positive: false },
      { feature: "Medical Condition", value: -0.18, positive: false },
      { feature: "Study Phase", value: 0.15, positive: true },
      { feature: "Geographic Spread", value: -0.12, positive: false },
      { feature: "Sponsor Type", value: 0.08, positive: true },
    ]

    // Sort by absolute value
    shapValues.sort((a, b) => Math.abs(b.value) - Math.abs(a.value))

    // Chart configuration
    const barHeight = 30
    const barGap = 15
    const startY = 60
    const startX = 250 // Center point
    const maxBarWidth = 200

    // Draw title
    ctx.font = "bold 16px sans-serif"
    ctx.fillStyle = "#000"
    ctx.textAlign = "center"
    ctx.fillText("SHAP Values: Feature Impact on Trial Completion", canvas.width / 2, 25)

    // Draw center line
    ctx.beginPath()
    ctx.moveTo(startX, 50)
    ctx.lineTo(startX, startY + shapValues.length * (barHeight + barGap))
    ctx.strokeStyle = "#666"
    ctx.stroke()

    // Draw bars
    shapValues.forEach((item, i) => {
      const y = startY + i * (barHeight + barGap)

      // Draw feature name
      ctx.font = "14px sans-serif"
      ctx.fillStyle = "#000"
      ctx.textAlign = item.positive ? "right" : "left"
      ctx.fillText(item.feature, item.positive ? startX - 10 : startX + 10, y + barHeight / 2 + 5)

      // Draw bar
      const barWidth = Math.abs(item.value) * maxBarWidth
      ctx.fillStyle = item.positive ? "#10b981" : "#ef4444" // green for positive, red for negative

      if (item.positive) {
        ctx.fillRect(startX, y, barWidth, barHeight)
      } else {
        ctx.fillRect(startX - barWidth, y, barWidth, barHeight)
      }

      // Draw value
      ctx.font = "12px sans-serif"
      ctx.fillStyle = "#000"
      ctx.textAlign = item.positive ? "left" : "right"
      ctx.fillText(
        item.value.toFixed(2),
        item.positive ? startX + barWidth + 5 : startX - barWidth - 5,
        y + barHeight / 2 + 4,
      )
    })

    // Draw legend
    ctx.fillStyle = "#10b981"
    ctx.fillRect(canvas.width - 150, 350, 15, 15)
    ctx.fillStyle = "#ef4444"
    ctx.fillRect(canvas.width - 150, 375, 15, 15)

    ctx.font = "12px sans-serif"
    ctx.fillStyle = "#000"
    ctx.textAlign = "left"
    ctx.fillText("Increases completion", canvas.width - 130, 362)
    ctx.fillText("Decreases completion", canvas.width - 130, 387)
  }, [])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="max-w-full" style={{ maxHeight: "400px" }} />
    </div>
  )
}

