import Link from "next/link"
import Image from "next/image"
import voNetos from "@/media/vo-netos.png"

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center max-w-lg">
        <Image
          src={voNetos}
          alt="Vó Virgínia com os netos"
          width={280}
          height={280}
          className="mx-auto mb-6 rounded-3xl"
          priority
        />
        <h1 className="font-display text-5xl sm:text-6xl font-bold text-gray-800 mb-4">
          Vó Virgínia
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Aprenda matemática brincando! Pratique adição, subtração, multiplicação e divisão de forma divertida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/jogar"
            className="bg-gradient-to-r from-green-400 to-green-600 text-white font-display text-2xl font-bold rounded-2xl py-4 px-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            Jogar!
          </Link>
          <Link
            href="/entrar"
            className="bg-white text-gray-700 font-display text-2xl font-bold rounded-2xl py-4 px-8 border-2 border-gray-200 shadow hover:shadow-md transition-shadow"
          >
            Entrar
          </Link>
        </div>
      </div>
    </main>
  )
}
