"use client"

import { useEffect, useRef } from "react"

export function FeatureImportanceChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 500
    canvas.height = 400

    // Feature importance data
    const features = [
      { name: "Eligibility Criteria", importance: 0.28 },
      { name: "Study Title", importance: 0.22 },
      { name: "Enrollment Rate", importance: 0.18 },
      { name: "Medical Condition", importance: 0.12 },
      { name: "Study Phase", importance: 0.09 },
      { name: "Geographic Spread", importance: 0.07 },
      { name: "Sponsor Type", importance: 0.04 },
    ]

    // Sort by importance
    features.sort((a, b) => b.importance - a.importance)

    // Colors
    const barColors = [
      "#3b82f6", // blue-500
      "#4f46e5", // indigo-600
      "#8b5cf6", // violet-500
      "#a855f7", // purple-500
      "#d946ef", // fuchsia-500
      "#ec4899", // pink-500
      "#f43f5e", // rose-500
    ]

    // Draw horizontal bar chart
    const barHeight = 40
    const barGap = 20
    const maxBarWidth = 350
    const startY = 50
    const startX = 140

    // Draw title
    ctx.font = "bold 16px sans-serif"
    ctx.fillStyle = "#000"
    ctx.textAlign = "center"
    ctx.fillText("Feature Importance", canvas.width / 2, 25)

    // Draw bars
    features.forEach((feature, i) => {
      const y = startY + i * (barHeight + barGap)

      // Draw feature name
      ctx.font = "14px sans-serif"
      ctx.fillStyle = "#000"
      ctx.textAlign = "right"
      ctx.fillText(feature.name, startX - 10, y + barHeight / 2 + 5)

      // Draw bar
      const barWidth = feature.importance * maxBarWidth
      ctx.fillStyle = barColors[i % barColors.length]
      ctx.fillRect(startX, y, barWidth, barHeight)

      // Draw percentage
      ctx.font = "14px sans-serif"
      ctx.fillStyle = "#000"
      ctx.textAlign = "left"
      ctx.fillText(`${Math.round(feature.importance * 100)}%`, startX + barWidth + 10, y + barHeight / 2 + 5)
    })
  }, [])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="max-w-full" style={{ maxHeight: "400px" }} />
    </div>
  )
}

