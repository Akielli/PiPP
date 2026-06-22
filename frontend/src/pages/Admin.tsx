import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, LogOut, ShieldCheck, Building2 } from 'lucide-react'
import { fetchMe, logout, type UsuarioActual } from '@/lib/api'

const ROL_LABEL: Record<string, string> = {
  iecm: 'IECM (alcance global)',
  alcaldia: 'Alcaldía',
}

export default function Admin() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState<UsuarioActual | null>(null)
  const [status, setStatus] = useState<'loading' | 'ok'>('loading')

  useEffect(() => {
    fetchMe()
      .then((u) => {
        setUsuario(u)
        setStatus('ok')
      })
      .catch(() => navigate('/admin/login', { replace: true }))
  }, [navigate])

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  // Mientras verifica la sesión, evita parpadeo de contenido protegido
  if (status === 'loading' || !usuario) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#f4f3ef' }}
      >
        <Loader2 size={28} className="animate-spin" style={{ color: '#e8971f' }} aria-label="Cargando" />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen font-[family-name:var(--font-body)]"
      style={{ backgroundColor: '#f4f3ef' }}
    >
      {/* Encabezado */}
      <header style={{ backgroundColor: '#1b2032' }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="text-[10px] font-semibold tracking-[0.25em] uppercase px-2.5 py-1 rounded"
              style={{ backgroundColor: '#e8971f', color: '#1b2032' }}
            >
              PiPP
            </span>
            <span className="text-[#8d97ae] text-xs tracking-wider uppercase">
              Portal de carga
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-[#8d97ae] hover:text-white transition-colors text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#e8971f] rounded px-2 py-1"
          >
            <LogOut size={15} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-[#e8e7e3] shadow-sm p-8">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
            style={{ backgroundColor: '#fef3e2' }}
          >
            <ShieldCheck size={24} style={{ color: '#e8971f' }} aria-hidden="true" />
          </div>

          <h1
            className="text-[#1b2032] leading-tight mb-2"
            style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.75rem', fontWeight: 500 }}
          >
            Hola, {usuario.username}
          </h1>

          <p className="text-[#6b7280] mb-6">
            Has iniciado sesión en el portal de carga.
          </p>

          <dl className="space-y-3 border-t border-[#f0efe9] pt-6">
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-[#b0ada6] flex-shrink-0" aria-hidden="true" />
              <div>
                <dt className="text-[11px] text-[#9ca3af] uppercase tracking-wider">Rol</dt>
                <dd className="text-sm font-medium text-[#1b2032]">
                  {ROL_LABEL[usuario.rol] ?? usuario.rol}
                </dd>
              </div>
            </div>

            {usuario.rol === 'alcaldia' && usuario.alcaldia && (
              <div className="flex items-center gap-3">
                <Building2 size={16} className="text-[#b0ada6] flex-shrink-0" aria-hidden="true" />
                <div>
                  <dt className="text-[11px] text-[#9ca3af] uppercase tracking-wider">Alcaldía</dt>
                  <dd className="text-sm font-medium text-[#1b2032]">{usuario.alcaldia}</dd>
                </div>
              </div>
            )}
          </dl>

          {/* Aviso de que la carga real aún no existe */}
          <div
            className="mt-8 rounded-xl p-4 text-sm text-[#6b7280]"
            style={{ backgroundColor: '#f0efe9', borderLeft: '3px solid #d1cfc9' }}
          >
            La carga de datos (CSV del IECM y formulario de alcaldía) se habilitará
            en las siguientes etapas.
          </div>
        </div>
      </main>
    </div>
  )
}
