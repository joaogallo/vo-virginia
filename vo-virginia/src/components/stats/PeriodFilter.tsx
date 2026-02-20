"use client"

export type Period = "7d" | "30d" | "all"

interface PeriodFilterProps {
  value: Period
  onChange: (period: Period) => void
}

const options: { value: Period; label: string }[] = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "all", label: "Tudo" },
]

export default function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            value === opt.value
              ? "bg-green-500 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
