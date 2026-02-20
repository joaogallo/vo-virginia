"use client"

export default function ExportPdfButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer print:hidden"
    >
      Exportar PDF
    </button>
  )
}
