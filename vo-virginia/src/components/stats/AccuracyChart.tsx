"use client"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

interface DailyProgress {
  date: string
  total: number
  correct: number
  accuracyPercent: number
}

interface AccuracyChartProps {
  data: DailyProgress[]
}

function formatDate(dateStr: string) {
  const [, m, d] = dateStr.split("-")
  return `${d}/${m}`
}

export default function AccuracyChart({ data }: AccuracyChartProps) {
  if (data.length < 2) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg text-center text-gray-400 text-sm">
        Dados insuficientes para gráfico (mínimo 2 dias de atividade).
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null
              const d = payload[0].payload as DailyProgress
              return (
                <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-sm">
                  <p className="font-bold text-gray-700">{formatDate(d.date)}</p>
                  <p className="text-green-600">{d.accuracyPercent}% de precisão</p>
                  <p className="text-gray-500">{d.correct}/{d.total} questões</p>
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="accuracyPercent"
            stroke="#22c55e"
            strokeWidth={2.5}
            fill="url(#accuracyGradient)"
            dot={{ r: 3, fill: "#22c55e", stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: "#22c55e", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
