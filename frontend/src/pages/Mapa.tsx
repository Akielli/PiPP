import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ArrowLeft, Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { fetchProyectosMapa, type ProyectoMapa } from '@/lib/api'

// ── Configuración del mapa ────────────────────────────────────────────────────

const CDMX: [number, number] = [19.43, -99.13]
const CDMX_ZOOM = 11

const RIESGO = {
  alto:   { color: '#dc2626', label: 'Alto',  badgeBg: '#fee2e2', badgeText: '#991b1b' },
  medio:  { color: '#d97706', label: 'Medio', badgeBg: '#fef3e2', badgeText: '#92400e' },
  bajo:   { color: '#059669', label: 'Bajo',  badgeBg: '#d1fae5', badgeText: '#065f46' },
  null:   { color: '#6b7280', label: '—',     badgeBg: '#f3f4f6', badgeText: '#374151' },
} as const

function markerIcon(color: string) {
  return L.divIcon({
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};
      border:2.5px solid white;
      box-shadow:0 1px 5px rgba(0,0,0,.35);
    "></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -12],
  })
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function Mapa() {
  const [proyectos, setProyectos] = useState<ProyectoMapa[]>([])
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  const load = () => {
    setStatus('loading')
    fetchProyectosMapa()
      .then((d) => { setProyectos(d); setStatus('ok') })
      .catch(() => setStatus('error'))
  }

  useEffect(() => { load() }, [])

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>

      {/* Barra superior */}
      <header
        style={{ backgroundColor: '#1b2032', zIndex: 1000, flexShrink: 0 }}
        className="px-5 py-3.5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[#6b7896] hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Volver a la lista</span>
            <span className="sm:hidden">Lista</span>
          </Link>
          <span className="w-px h-4 bg-[#2a3149]" />
          <span
            className="text-white text-sm"
            style={{ fontFamily: 'Fraunces, Georgia, serif' }}
          >
            Mapa de proyectos
          </span>
        </div>
        <span
          className="text-[10px] font-semibold tracking-[0.25em] uppercase px-2.5 py-1 rounded"
          style={{ backgroundColor: '#e8971f', color: '#1b2032' }}
        >
          PiPP
        </span>
      </header>

      {/* Área del mapa */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Cargando */}
        {status === 'loading' && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
            style={{ backgroundColor: '#f4f3ef' }}
          >
            <Loader2 size={28} className="animate-spin" style={{ color: '#e8971f' }} />
            <p className="text-sm text-[#6b7280]">Cargando proyectos…</p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6 z-10"
            style={{ backgroundColor: '#f4f3ef' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#fef3e2' }}
            >
              <AlertTriangle size={22} style={{ color: '#e8971f' }} />
            </div>
            <p
              className="text-lg text-[#1b2032]"
              style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 500 }}
            >
              No se pudo cargar el mapa
            </p>
            <p className="text-sm text-[#9ca3af]">
              Verifica que el servidor esté en línea.
            </p>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: '#1b2032' }}
            >
              <RefreshCw size={13} />
              Reintentar
            </button>
          </div>
        )}

        {/* Mapa */}
        {status === 'ok' && (
          <MapContainer
            center={CDMX}
            zoom={CDMX_ZOOM}
            style={{ height: '100%', width: '100%' }}
            zoomControl
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              maxZoom={19}
            />

            {proyectos.map((p) => {
              const key = (p.nivel_riesgo ?? 'null') as keyof typeof RIESGO
              const cfg = RIESGO[key]
              return (
                <Marker
                  key={p.id}
                  position={[p.lat, p.lng]}
                  icon={markerIcon(cfg.color)}
                >
                  <Popup minWidth={220} maxWidth={280}>
                    <PopupContent proyecto={p} cfg={cfg} />
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        )}

        {/* Leyenda */}
        {status === 'ok' && (
          <div
            style={{
              position: 'absolute',
              bottom: 40,     /* sobre el crédito de Leaflet */
              right: 12,
              zIndex: 1000,
              backgroundColor: 'white',
              borderRadius: 12,
              padding: '10px 14px',
              boxShadow: '0 2px 10px rgba(0,0,0,.15)',
              border: '1px solid #e8e7e3',
              minWidth: 130,
            }}
          >
            <p style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 8,
            }}>
              Nivel de riesgo
            </p>
            {(['alto', 'medio', 'bajo'] as const).map((k) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%',
                  backgroundColor: RIESGO[k].color,
                  flexShrink: 0,
                  border: '1.5px solid white',
                  boxShadow: '0 1px 2px rgba(0,0,0,.2)',
                }} />
                <span style={{ fontSize: 12, color: '#1b2032' }}>
                  {RIESGO[k].label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Contenido del popup ───────────────────────────────────────────────────────

function PopupContent({
  proyecto: p,
  cfg,
}: {
  proyecto: ProyectoMapa
  cfg: { color: string; label: string; badgeBg: string; badgeText: string }
}) {
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, lineHeight: 1.45 }}>

      {/* Nombre */}
      <p style={{
        fontFamily: 'Fraunces, Georgia, serif',
        fontSize: 15,
        fontWeight: 500,
        color: '#1b2032',
        marginBottom: 3,
        lineHeight: 1.3,
      }}>
        {p.nombre}
      </p>

      {/* Colonia · Alcaldía */}
      <p style={{ color: '#6b7280', fontSize: 11, marginBottom: 8 }}>
        {p.unidad_territorial} · {p.alcaldia}
      </p>

      {/* Empresa */}
      {p.razon_social && (
        <p style={{ color: '#374151', fontSize: 12, marginBottom: 8 }}>
          {p.razon_social}
        </p>
      )}

      {/* Semáforo */}
      {p.nivel_riesgo && (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '2px 9px',
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 600,
          backgroundColor: cfg.badgeBg,
          color: cfg.badgeText,
          marginBottom: 10,
        }}>
          <span style={{
            width: 6, height: 6,
            borderRadius: '50%',
            backgroundColor: cfg.color,
            display: 'inline-block',
          }} />
          Riesgo {cfg.label}
        </span>
      )}

      {/* Enlace al detalle */}
      {p.contrato_id && (
        <div style={{ marginTop: 4 }}>
          <Link
            to={`/contrato/${p.contrato_id}`}
            style={{
              color: '#e8971f',
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Ver detalle del contrato →
          </Link>
        </div>
      )}
    </div>
  )
}
