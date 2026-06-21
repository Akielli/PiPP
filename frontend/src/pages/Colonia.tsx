import { Link } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'

export default function Colonia() {
  return (
    <div className="min-h-screen bg-[#f4f3ef] flex flex-col items-center justify-center gap-4 px-6">
      <Clock size={32} className="text-slate-300" />
      <p className="font-[family-name:var(--font-display)] text-2xl text-slate-700">
        Próximamente
      </p>
      <p className="text-sm text-slate-400 text-center max-w-xs">
        Esta vista estará disponible en el siguiente paso del proyecto.
      </p>
      <Link
        to="/"
        className="mt-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={15} />
        Volver a la lista de colonias
      </Link>
    </div>
  )
}
