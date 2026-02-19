import Link from "next/link"
import NavLinks from "@/components/NavLinks"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/jogar" className="font-display text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">🦉</span>
            Vó Virgínia
          </Link>
          <NavLinks />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex py-8">
        {children}
      </main>
    </div>
  )
}
