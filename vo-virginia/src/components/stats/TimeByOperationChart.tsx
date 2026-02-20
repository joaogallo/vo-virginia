"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts"

interface AvgTimeByOperation {
  operation: string
  averageTimeMs: number
}

interface TimeByOperationChartProps {
  data: AvgTimeByOperation[]
}

const OPERATION_CONFIG: Record<string, { label: string; color: string }> = {
  ADDITION: { label: "Adição", color: "#22c55e" },
  SUBTRACTION: { label: "Subtração", color: "#3b82f6" },
  MULTIPLICATION: { label: "Multiplicação", color: "#f97316" },
  DIVISION: { label: "Divisão", color: "#a855f7" },
}

export default function TimeByOperationChart({ data }: TimeByOperationChartProps) {
  if (data.length === 0) return null

  const chartData = data.map((d) => ({
    ...d,
    label: OPERATION_CONFIG[d.operation]?.label || d.operation,
    seconds: +(d.averageTimeMs / 1000).toFixed(1),
    color: OPERATION_CONFIG[d.operation]?.color || "#6b7280",
  }))

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg">
      <ResponsiveContainer width="100%" height={Math.max(120, data.length * 50 + 40)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}s`}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 12, fill: "#374151", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null
              const d = payload[0].payload
              return (
                <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-sm">
                  <p className="font-bold text-gray-700">{d.label}</p>
                  <p className="text-gray-600">{d.seconds}s em média</p>
                </div>
              )
            }}
          />
          <Bar dataKey="seconds" radius={[0, 6, 6, 0]} barSize={24}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
