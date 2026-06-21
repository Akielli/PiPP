import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  AlertTriangle,
  FileX,
  Banknote,
  Building2,
  Calendar,
  MapPin,
  Hash,
  Users,
  Info,
} from 'lucide-react'
import {
  fetchContrato,
  type ContratoDetalle,
  type BeneficiarioInfo,
} from '@/lib/api'

// ── Utilidades ────────────────────────────────────────────────────────────────

const formatMXN = (n: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(n)

const formatFecha = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

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
    barFill: '#dc2626',
  },
  medio: {
    label: 'Medio',
    border: '#d97706',
    badgeBg: '#fef3e2',
    badgeText: '#92400e',
    dot: '#d97706',
    barFill: '#d97706',
  },
  bajo: {
    label: 'Bajo',
    border: '#059669',
    badgeBg: '#d1fae5',
    badgeText: '#065f46',
    dot: '#059669',
    barFill: '#059669',
  },
} as const

type Status = 'loading' | 'ok' | 'not_found' | 'error'

// ── Página ────────────────────────────────────────────────────────────────────

export default function Contrato() {
  const { id } = useParams<{ id: string }>()
  const [contrato, setContrato] = useState<ContratoDetalle | null>(null)
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    if (!id) return
    setStatus('loading')
    fetchContrato(id)
      .then((data) => { setContrato(data); setStatus('ok') })
      .catch((err: { status?: number }) => {
        setStatus(err?.status === 404 ? 'not_found' : 'error')
      })
  }, [id])

  const riesgo = contrato
    ? RIESGO_CONFIG[contrato.nivel_riesgo] ?? null
    : null

  return (
    <div
      className="min-h-screen font-[family-name:var(--font-body)]"
      style={{ backgroundColor: '#f4f3ef' }}
    >
      {/* ── Encabezado ──────────────────────────────────────────────────────── */}
      <header style={{ backgroundColor: '#1b2032' }} className="px-6 pt-8 pb-12 md:pt-10 md:pb-16">
        <div className="max-w-2xl mx-auto">

          {/* Enlace de regreso */}
          {status === 'ok' && contrato ? (
            <Link
              to={`/colonia/${contrato.proyecto.ut_id}`}
              className="inline-flex items-center gap-2 text-[#6b7896] hover:text-white transition-colors text-sm mb-8"
            >
              <ArrowLeft size={15} />
              {contrato.proyecto.unidad_territorial}
            </Link>
          ) : (
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-[#6b7896] hover:text-white transition-colors text-sm mb-8"
            >
              <ArrowLeft size={15} />
              Volver
            </button>
          )}

          {/* Skeleton */}
          {status === 'loading' && (
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-40 bg-[#2a3149] rounded" />
              <div className="h-9 w-3/4 bg-[#2a3149] rounded" />
              <div className="h-4 w-1/2 bg-[#2a3149] rounded" />
            </div>
          )}

          {/* Contenido del encabezado */}
          {status === 'ok' && contrato && (
            <>
              {/* Breadcrumb: colonia · alcaldía */}
              <p className="text-[#6b7896] text-xs tracking-wider uppercase mb-3">
                {contrato.proyecto.unidad_territorial} · {contrato.proyecto.alcaldia}
              </p>

              {/* Nombre del proyecto */}
              <h1
                className="text-white leading-tight mb-4"
                style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
                  fontWeight: 500,
                }}
              >
                {contrato.proyecto.nombre}
              </h1>

              {/* Semáforo de riesgo */}
              {riesgo && (
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: riesgo.badgeBg, color: riesgo.badgeText }}
                  aria-label={`Nivel de riesgo: ${riesgo.label}`}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: riesgo.dot }}
                    aria-hidden="true"
                  />
                  Riesgo {riesgo.label}
                </span>
              )}
            </>
          )}

          {(status === 'not_found' || status === 'error') && (
            <h1
              className="text-white"
              style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '2rem', fontWeight: 500 }}
            >
              {status === 'not_found' ? 'Contrato no encontrado' : 'Error al cargar'}
            </h1>
          )}
        </div>
      </header>

      {/* ── Contenido principal ──────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-6 py-10">

        {status === 'loading' && <SkeletonContent />}

        {status === 'not_found' && (
          <EmptyState
            icon={<FileX size={24} style={{ color: '#dc2626' }} />}
            iconBg="#fee2e2"
            title="Este contrato no existe"
            body="El identificador de la URL no corresponde a ningún contrato registrado."
          >
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: '#1b2032' }}
            >
              <ArrowLeft size={13} />
              Volver
            </button>
          </EmptyState>
        )}

        {status === 'error' && (
          <EmptyState
            icon={<AlertTriangle size={24} style={{ color: '#e8971f' }} />}
            iconBg="#fef3e2"
            title="No se pudo cargar la información"
            body="Verifica que el servidor esté en línea e intenta de nuevo."
          />
        )}

        {status === 'ok' && contrato && riesgo && (
          <div className="space-y-6">

            {/* ── 1. Datos del contrato ──────────────────────────────────── */}
            <Section title="Datos del contrato">
              <div className="space-y-4">
                <DataRow icon={<Hash size={15} />} label="Modalidad de contratación">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded border"
                    style={{ borderColor: '#e8e7e3', color: '#6b7280' }}
                  >
                    {MODALIDAD_LABEL[contrato.modalidad] ?? contrato.modalidad}
                  </span>
                </DataRow>

                <DataRow icon={<Banknote size={15} />} label="Monto contratado">
                  <span className="font-bold text-[#1b2032] text-lg">
                    {formatMXN(contrato.monto)}
                  </span>
                </DataRow>

                {/* Barra de avance */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#6b7280]">Avance de obra</span>
                    <span className="text-sm font-bold text-[#1b2032]">
                      {contrato.avance_pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#e8e7e3' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${contrato.avance_pct}%`, backgroundColor: '#1b2032' }}
                    />
                  </div>
                </div>
              </div>
            </Section>

            {/* ── 2. Empresa contratada ──────────────────────────────────── */}
            <Section title="Empresa contratada">
              <div className="space-y-4">
                <div>
                  <p
                    className="text-[#1b2032] leading-snug mb-1"
                    style={{
                      fontFamily: 'Fraunces, Georgia, serif',
                      fontSize: '1.25rem',
                      fontWeight: 500,
                    }}
                  >
                    {contrato.empresa.razon_social}
                  </p>
                </div>

                <DataRow icon={<Hash size={15} />} label="RFC">
                  <span className="font-mono text-sm text-[#1b2032] tracking-wide">
                    {contrato.empresa.rfc}
                  </span>
                </DataRow>

                <DataRow icon={<Calendar size={15} />} label="Fecha de constitución">
                  <span className="text-sm text-[#1b2032]">
                    {formatFecha(contrato.empresa.fecha_constitucion)}
                  </span>
                </DataRow>

                <DataRow icon={<MapPin size={15} />} label="Domicilio">
                  <span className="text-sm text-[#1b2032] leading-snug">
                    {contrato.empresa.domicilio}
                  </span>
                </DataRow>
              </div>
            </Section>

            {/* ── 3. Beneficiarios ───────────────────────────────────────── */}
            <Section
              title="¿Quién controla esta empresa?"
              subtitle="Beneficiarios finales registrados"
              icon={<Users size={16} className="text-[#9ca3af]" />}
            >
              <div className="space-y-5">
                {contrato.empresa.beneficiarios.map((b) => (
                  <BeneficiarioRow key={b.nombre} beneficiario={b} riesgoColor={riesgo.barFill} />
                ))}
                {contrato.empresa.beneficiarios.length === 0 && (
                  <p className="text-sm text-[#9ca3af] italic">
                    No hay beneficiarios registrados para esta empresa.
                  </p>
                )}
              </div>
            </Section>

            {/* ── 4. Nota de responsabilidad ─────────────────────────────── */}
            <div
              className="rounded-xl p-5 flex gap-3"
              style={{ backgroundColor: '#f0efe9', borderLeft: '3px solid #d1cfc9' }}
            >
              <Info size={16} className="text-[#9ca3af] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#6b7280] leading-relaxed">
                <strong className="text-[#1b2032]">Nota sobre el nivel de riesgo.</strong>{' '}
                El semáforo de riesgo es una señal para orientar la investigación ciudadana,
                no una acusación. Un nivel alto indica patrones que merecen mayor
                escrutinio. Rige en todo momento la presunción de inocencia.
              </p>
            </div>

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

// ── Componentes de soporte ────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e7e3] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#f0efe9] flex items-center gap-2">
        {icon}
        <div>
          <h2 className="text-sm font-semibold text-[#1b2032]">{title}</h2>
          {subtitle && (
            <p className="text-[11px] text-[#9ca3af] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function DataRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[#b0ada6] mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-[#9ca3af] uppercase tracking-wider mb-0.5">{label}</p>
        <div>{children}</div>
      </div>
    </div>
  )
}

function BeneficiarioRow({
  beneficiario,
  riesgoColor,
}: {
  beneficiario: BeneficiarioInfo
  riesgoColor: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-center gap-2">
          <Building2 size={13} className="text-[#b0ada6] flex-shrink-0" />
          <span className="text-sm font-semibold text-[#1b2032]">
            {beneficiario.nombre}
          </span>
        </div>
        <span
          className="text-2xl font-bold tabular-nums flex-shrink-0 ml-4"
          style={{ color: riesgoColor }}
        >
          {beneficiario.pct_control.toFixed(0)}%
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: '#f0efe9' }}
        role="meter"
        aria-valuenow={beneficiario.pct_control}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${beneficiario.nombre} controla el ${beneficiario.pct_control}%`}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${beneficiario.pct_control}%`,
            backgroundColor: riesgoColor,
          }}
        />
      </div>
    </div>
  )
}

function EmptyState({
  icon,
  iconBg,
  title,
  body,
  children,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  body: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center text-center py-20 gap-4">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <h2
        className="text-xl text-[#1b2032]"
        style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 500 }}
      >
        {title}
      </h2>
      <p className="text-[#9ca3af] text-sm max-w-xs">{body}</p>
      {children}
    </div>
  )
}

function SkeletonContent() {
  return (
    <div className="space-y-6 animate-pulse">
      {[140, 180, 220].map((h, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-[#e8e7e3] p-6"
          style={{ minHeight: h }}
        >
          <div className="h-4 w-32 bg-[#f0efe9] rounded mb-4" />
          <div className="space-y-3">
            <div className="h-3 w-full bg-[#f0efe9] rounded" />
            <div className="h-3 w-3/4 bg-[#f0efe9] rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
