import { ArrowLeft, Clock } from 'lucide-react'

export default function Contrato() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 font-[family-name:var(--font-body)]"
      style={{ backgroundColor: '#f4f3ef' }}
    >
      <Clock size={32} className="text-[#d1cfc9]" />
      <p
        className="text-xl text-[#6b7280]"
        style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 500 }}
      >
        Próximamente
      </p>
      <p className="text-sm text-[#9ca3af] text-center max-w-xs">
        El detalle del contrato estará disponible en el siguiente paso del proyecto.
      </p>
      <button
        onClick={() => window.history.back()}
        className="mt-4 inline-flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#1b2032] transition-colors"
      >
        <ArrowLeft size={15} />
        Volver
      </button>
    </div>
  )
}
