import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  AlertTriangle,
  MapPinOff,
  Building2,
  CalendarDays,
  Banknote,
  ChevronRight,
} from 'lucide-react'
import {
  fetchUnidadById,
  fetchProyectosDeUnidad,
  type UnidadResumen,
  type ProyectoConContrato,
} from '@/lib/api'

// ── Utilidades ────────────────────────────────────────────────────────────────

const formatMXN = (n: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(n)

const MODALIDAD_LABEL: Record<string, string> = {
  adjudicacion_directa: 'Adjudicación directa',
  invitacion_restringida: 'Invitación restringida',
  licitacion: 'Licitación pública',
}

const RIESGO_CONFIG = {
  alto: {
    label: 'Alto',
    border: '#dc2626',
    badgeBg: '#fee2e2',
    badgeText: '#991b1b',
    dot: '#dc2626',
  },
  medio: {
    label: 'Medio',
    border: '#d97706',
    badgeBg: '#fef3e2',
    badgeText: '#92400e',
    dot: '#d97706',
  },
  bajo: {
    label: 'Bajo',
    border: '#059669',
    badgeBg: '#d1fae5',
    badgeText: '#065f46',
    dot: '#059669',
  },
} as const

// ── Página ────────────────────────────────────────────────────────────────────

type Status = 'loading' | 'ok' | 'not_found' | 'error'

export default function Colonia() {
  const { id } = useParams<{ id: string }>()

  const [unidad, setUnidad] = useState<UnidadResumen | null>(null)
  const [proyectos, setProyectos] = useState<ProyectoConContrato[]>([])
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    if (!id) return
    setStatus('loading')

    Promise.all([fetchUnidadById(id), fetchProyectosDeUnidad(id)])
      .then(([ut, ps]) => {
        setUnidad(ut)
        setProyectos(ps)
        setStatus('ok')
      })
      .catch((err: { status?: number }) => {
        setStatus(err?.status === 404 ? 'not_found' : 'error')
      })
  }, [id])

  return (
    <div className="min-h-screen font-[family-name:var(--font-body)]" style={{ backgroundColor: '#f4f3ef' }}>

      {/* ── Encabezado ──────────────────────────────────────────────────────── */}
      <header style={{ backgroundColor: '#1b2032' }} className="px-6 pt-8 pb-12 md:pt-10 md:pb-16">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#6b7896] hover:text-white transition-colors text-sm mb-8"
          >
            <ArrowLeft size={15} />
            Todas las colonias
          </Link>

          {status === 'loading' && (
            <div className="animate-pulse">
              <div className="h-5 w-28 bg-[#2a3149] rounded-full mb-4" />
              <div className="h-10 w-2/3 bg-[#2a3149] rounded mb-2" />
              <div className="h-5 w-1/3 bg-[#2a3149] rounded" />
            </div>
          )}

          {status === 'ok' && unidad && (
            <>
              <span
                className="inline-block text-[11px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full mb-4"
                style={{ backgroundColor: '#e8971f', color: '#1b2032' }}
              >
                {unidad.alcaldia}
              </span>
              <h1
                className="text-white leading-tight mb-3"
                style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                  fontWeight: 500,
                }}
              >
                {unidad.nombre}
              </h1>
              <p className="text-[#8d97ae] text-sm">
                {unidad.num_proyectos}{' '}
                {unidad.num_proyectos === 1 ? 'proyecto' : 'proyectos'} ·{' '}
                {formatMXN(unidad.monto_total)} contratados
              </p>
            </>
          )}

          {(status === 'not_found' || status === 'error') && (
            <h1
              className="text-white"
              style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '2rem', fontWeight: 500 }}
            >
              {status === 'not_found' ? 'Colonia no encontrada' : 'Error al cargar'}
            </h1>
          )}
        </div>
      </header>

      {/* ── Contenido ───────────────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-6 py-10">

        {status === 'loading' && <SkeletonCards />}

        {status === 'not_found' && (
          <div className="flex flex-col items-center text-center py-16 gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#fee2e2' }}
            >
              <MapPinOff size={22} style={{ color: '#dc2626' }} />
            </div>
            <h2
              className="text-xl text-[#1b2032]"
              style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 500 }}
            >
              Esta colonia no existe
            </h2>
            <p className="text-[#9ca3af] text-sm max-w-xs">
              El identificador de la URL no corresponde a ninguna unidad territorial registrada.
            </p>
            <Link
              to="/"
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: '#1b2032' }}
            >
              <ArrowLeft size={13} />
              Ver todas las colonias
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center text-center py-16 gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#fef3e2' }}
            >
              <AlertTriangle size={22} style={{ color: '#e8971f' }} />
            </div>
            <h2
              className="text-xl text-[#1b2032]"
              style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 500 }}
            >
              No se pudo cargar la información
            </h2>
            <p className="text-[#9ca3af] text-sm">
              Verifica que el servidor esté en línea e intenta de nuevo.
            </p>
          </div>
        )}

        {status === 'ok' && (
          <div className="space-y-5">
            {proyectos.map((p) => (
              <ProyectoCard key={p.id} proyecto={p} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-[#dddbd4] py-8 px-6 text-center text-[#9ca3af] text-xs">
        Plataforma de Integridad del Presupuesto Participativo ·{' '}
        <span className="italic">datos de demostración</span>
      </footer>
    </div>
  )
}

// ── Tarjeta de proyecto ───────────────────────────────────────────────────────

function ProyectoCard({ proyecto }: { proyecto: ProyectoConContrato }) {
  const c = proyecto.contrato
  const riesgo = c?.nivel_riesgo && c.nivel_riesgo in RIESGO_CONFIG
    ? RIESGO_CONFIG[c.nivel_riesgo as keyof typeof RIESGO_CONFIG]
    : null

  const cardContent = (
    <div
      className="bg-white rounded-2xl border border-[#e8e7e3] overflow-hidden
                 transition-all duration-200"
      style={riesgo ? { borderLeftWidth: 4, borderLeftColor: riesgo.border } : undefined}
    >
      <div className="p-6">

        {/* Fila superior: semáforo + año */}
        <div className="flex items-center justify-between mb-4">
          {riesgo ? (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: riesgo.badgeBg, color: riesgo.badgeText }}
              aria-label={`Nivel de riesgo: ${riesgo.label}`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: riesgo.dot }}
                aria-hidden="true"
              />
              Riesgo {riesgo.label}
            </span>
          ) : (
            <span className="text-xs text-[#b0ada6]">Sin contrato</span>
          )}
          <div className="flex items-center gap-1 text-[#9ca3af] text-xs">
            <CalendarDays size={12} />
            {proyecto.anio}
          </div>
        </div>

        {/* Nombre del proyecto */}
        <h2
          className="text-[#1b2032] leading-snug mb-2"
          style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: '1.2rem',
            fontWeight: 500,
          }}
        >
          {proyecto.nombre}
        </h2>

        {/* Monto asignado */}
        <div className="flex items-center gap-1.5 text-sm text-[#6b7280] mb-5">
          <Banknote size={14} className="text-[#b0ada6]" />
          <span>Presupuesto asignado:</span>
          <span className="font-semibold text-[#1b2032]">
            {formatMXN(proyecto.monto_asignado)}
          </span>
        </div>

        {/* Sección de contrato */}
        {c && (
          <>
            <div className="border-t border-[#f0efe9] pt-5 space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <Building2 size={14} className="text-[#b0ada6] mt-0.5 flex-shrink-0" />
                <span className="text-[#1b2032] font-medium leading-snug">
                  {c.razon_social}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded border"
                  style={{ borderColor: '#e8e7e3', color: '#6b7280' }}
                >
                  {MODALIDAD_LABEL[c.modalidad] ?? c.modalidad}
                </span>
                <span className="text-[#b0ada6] text-xs">·</span>
                <span className="text-sm text-[#6b7280]">
                  Contrato:{' '}
                  <span className="font-semibold text-[#1b2032]">
                    {formatMXN(c.monto)}
                  </span>
                </span>
              </div>

              {/* Barra de avance */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-[#9ca3af] uppercase tracking-wide">
                    Avance de obra
                  </span>
                  <span className="text-xs font-semibold text-[#1b2032]">
                    {c.avance_pct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f0efe9' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${c.avance_pct}%`, backgroundColor: '#1b2032' }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer de la tarjeta: CTA */}
      {c?.id && (
        <div
          className="px-6 py-3 flex items-center justify-between text-sm font-medium border-t border-[#f0efe9]"
          style={{ color: '#e8971f' }}
        >
          <span>Ver detalle del contrato</span>
          <ChevronRight size={16} />
        </div>
      )}
    </div>
  )

  if (c?.id) {
    return (
      <Link
        to={`/contrato/${c.id}`}
        className="block hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8971f]"
      >
        {cardContent}
      </Link>
    )
  }

  return <div>{cardContent}</div>
}

// ── Skeleton de carga ─────────────────────────────────────────────────────────

function SkeletonCards() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-6 border border-[#e8e7e3] animate-pulse"
        >
          <div className="flex justify-between mb-4">
            <div className="h-5 w-24 bg-[#f0efe9] rounded-full" />
            <div className="h-4 w-12 bg-[#f0efe9] rounded" />
          </div>
          <div className="h-6 w-3/4 bg-[#f0efe9] rounded mb-2" />
          <div className="h-4 w-1/2 bg-[#f0efe9] rounded mb-6" />
          <div className="border-t border-[#f0efe9] pt-5 space-y-3">
            <div className="h-4 w-2/3 bg-[#f0efe9] rounded" />
            <div className="h-1.5 w-full bg-[#f0efe9] rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
