import Image from "next/image"
import voTransparente from "@/media/vo-transparente.png"

export default function JogarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 w-full">
      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col items-center">
        {children}
      </div>

      {/* Imagem decorativa à direita — apenas desktop */}
      <div className="hidden lg:flex items-end justify-center w-64 xl:w-80 shrink-0 sticky top-16 h-[calc(100vh-4rem)] pr-4">
        <Image
          src={voTransparente}
          alt="Vó Virgínia"
          className="object-contain max-h-full w-auto"
          priority
        />
      </div>
    </div>
  )
}
