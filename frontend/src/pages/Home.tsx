import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  FolderOpen,
  Banknote,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { fetchUnidades, type UnidadResumen } from '@/lib/api'

// ── Utilidades ────────────────────────────────────────────────────────────────

const formatMXN = (n: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(n)

function groupByAlcaldia(items: UnidadResumen[]) {
  const map = new Map<string, UnidadResumen[]>()
  for (const item of items) {
    const bucket = map.get(item.alcaldia) ?? []
    bucket.push(item)
    map.set(item.alcaldia, bucket)
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'es'))
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function Home() {
  const [unidades, setUnidades] = useState<UnidadResumen[]>([])
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  const load = () => {
    setStatus('loading')
    fetchUnidades()
      .then((data) => { setUnidades(data); setStatus('ok') })
      .catch(() => setStatus('error'))
  }

  useEffect(() => { load() }, [])

  const grupos = groupByAlcaldia(unidades)
  const totalMonto = unidades.reduce((s, u) => s + u.monto_total, 0)
  const totalProyectos = unidades.reduce((s, u) => s + u.num_proyectos, 0)

  return (
    <div className="min-h-screen font-[family-name:var(--font-body)]" style={{ backgroundColor: '#f4f3ef' }}>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <header style={{ backgroundColor: '#1b2032' }} className="px-6 pt-10 pb-16 md:pt-14 md:pb-24">
        <div className="max-w-5xl mx-auto">

          {/* Logotipo/marca */}
          <div className="flex items-center gap-2.5 mb-10">
            <span
              className="text-[10px] font-semibold tracking-[0.25em] uppercase px-2.5 py-1 rounded"
              style={{ backgroundColor: '#e8971f', color: '#1b2032' }}
            >
              PiPP
            </span>
            <span className="text-[#6b7896] text-xs tracking-wider uppercase">
              Ciudad de México
            </span>
          </div>

          {/* Titular principal */}
          <h1
            className="text-white leading-[1.1] mb-6"
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 'clamp(2rem, 5vw, 3.75rem)',
              fontWeight: 500,
            }}
          >
            ¿En qué se gastó el<br />
            presupuesto participativo<br />
            <span style={{ color: '#e8971f' }}>de tu colonia?</span>
          </h1>

          <p className="text-[#8d97ae] text-base md:text-lg max-w-xl leading-relaxed mb-10">
            Consulta proyectos, montos y contratos del presupuesto participativo
            de la Ciudad de México. Toda la información es pública.
          </p>

          {/* Totales globales */}
          {status === 'ok' && (
            <div className="flex flex-wrap gap-6 pt-8 border-t border-[#2a3149]">
              <Stat
                icon={<MapPin size={14} />}
                label="colonias"
                value={String(unidades.length)}
              />
              <Stat
                icon={<FolderOpen size={14} />}
                label="proyectos totales"
                value={String(totalProyectos)}
              />
              <Stat
                icon={<Banknote size={14} />}
                label="monto total contratado"
                value={formatMXN(totalMonto)}
              />
            </div>
          )}
        </div>
      </header>

      {/* ── Contenido ───────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-6 py-12">

        {status === 'loading' && <SkeletonGrid />}
        {status === 'error' && <ErrorState onRetry={load} />}

        {status === 'ok' && grupos.map(([alcaldia, items]) => (
          <section key={alcaldia} className="mb-12">
            {/* Encabezado de alcaldía */}
            <h2 className="flex items-center gap-3 mb-5 text-[#9ca3af] text-xs font-semibold tracking-[0.18em] uppercase">
              <span className="flex-1 h-px bg-[#dddbd4]" />
              {alcaldia}
              <span className="flex-1 h-px bg-[#dddbd4]" />
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((u) => (
                <ColoniaCard key={u.id} unidad={u} />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* ── Pie ─────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#dddbd4] py-8 px-6 text-center text-[#9ca3af] text-xs">
        Plataforma de Integridad del Presupuesto Participativo ·{' '}
        <span className="italic">datos de demostración</span>
      </footer>
    </div>
  )
}

// ── Componentes internos ──────────────────────────────────────────────────────

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[#6b7896] text-[11px] uppercase tracking-wider mb-1">
        {icon}
        {label}
      </div>
      <div className="text-white font-semibold text-lg">{value}</div>
    </div>
  )
}

function ColoniaCard({ unidad }: { unidad: UnidadResumen }) {
  return (
    <Link
      to={`/colonia/${unidad.id}`}
      className="group flex flex-col bg-white rounded-2xl p-6 border border-[#e8e7e3] shadow-sm
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8971f]"
    >
      {/* Fila superior: alcaldía + flecha */}
      <div className="flex items-center justify-between mb-5">
        <span
          className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full"
          style={{ backgroundColor: '#fef3e2', color: '#9a5c00' }}
        >
          {unidad.alcaldia}
        </span>
        <ArrowRight
          size={16}
          className="text-[#d1cfc9] group-hover:text-[#e8971f] group-hover:translate-x-0.5 transition-all duration-200"
        />
      </div>

      {/* Nombre de la colonia */}
      <h3
        className="text-[#1b2032] leading-tight mb-6 flex-1"
        style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
          fontWeight: 500,
        }}
      >
        {unidad.nombre}
      </h3>

      {/* Estadísticas */}
      <div className="flex items-center gap-4 pt-4 border-t border-[#f0efe9]">
        <div className="flex items-center gap-1.5">
          <FolderOpen size={13} className="text-[#b0ada6]" />
          <span className="text-sm font-semibold text-[#1b2032]">
            {unidad.num_proyectos}
          </span>
          <span className="text-sm text-[#b0ada6]">
            {unidad.num_proyectos === 1 ? 'proyecto' : 'proyectos'}
          </span>
        </div>
        <div className="w-px h-3.5 bg-[#e8e7e3]" />
        <div className="flex items-center gap-1.5">
          <Banknote size={13} className="text-[#b0ada6]" />
          <span className="text-sm font-bold" style={{ color: '#1b2032' }}>
            {formatMXN(unidad.monto_total)}
          </span>
        </div>
      </div>
    </Link>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-6 border border-[#e8e7e3] animate-pulse"
        >
          <div className="h-5 w-28 bg-[#f0efe9] rounded-full mb-5" />
          <div className="h-7 w-3/4 bg-[#f0efe9] rounded mb-2" />
          <div className="h-5 w-1/2 bg-[#f0efe9] rounded mb-8" />
          <div className="h-px bg-[#f0efe9] mb-4" />
          <div className="h-4 w-2/3 bg-[#f0efe9] rounded" />
        </div>
      ))}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-20 gap-4">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#fef3e2' }}
      >
        <AlertTriangle size={22} style={{ color: '#e8971f' }} />
      </div>
      <h3
        className="text-xl text-[#1b2032]"
        style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 500 }}
      >
        No se pudo cargar la información
      </h3>
      <p className="text-[#9ca3af] text-sm max-w-xs">
        Verifica que el servidor esté en línea e intenta de nuevo.
      </p>
      <button
        onClick={onRetry}
        className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-colors hover:opacity-90"
        style={{ backgroundColor: '#1b2032' }}
      >
        <RefreshCw size={13} />
        Reintentar
      </button>
    </div>
  )
}
