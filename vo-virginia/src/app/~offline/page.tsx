"use client"

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">📡</div>
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-4">
          Sem conexão
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Parece que você está sem internet. Verifique sua conexão e tente
          novamente.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-green-400 to-green-600 text-white font-display text-xl font-bold rounded-2xl py-4 px-8 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
        >
          Tentar novamente
        </button>
      </div>
    </main>
  )
}
