import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, AlertCircle, Loader2 } from 'lucide-react'
import { login } from '@/lib/api'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      const status = (err as { status?: number })?.status
      setError(
        status === 401
          ? 'Usuario o contraseña incorrectos.'
          : 'No se pudo conectar con el servidor. Intenta de nuevo.',
      )
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 font-[family-name:var(--font-body)]"
      style={{ backgroundColor: '#1b2032' }}
    >
      {/* Marca */}
      <div className="flex items-center gap-2.5 mb-8">
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

      {/* Tarjeta */}
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#e8e7e3] shadow-lg p-8">
        <div className="flex items-center gap-2 mb-1">
          <Lock size={18} className="text-[#1b2032]" aria-hidden="true" />
          <h1
            className="text-[#1b2032]"
            style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.5rem', fontWeight: 500 }}
          >
            Iniciar sesión
          </h1>
        </div>
        <p className="text-sm text-[#6b7280] mb-6">
          Acceso para personal del IECM y de las alcaldías.
        </p>

        {/* Mensaje de error, anunciado por lectores de pantalla */}
        {error && (
          <div
            id="login-error"
            role="alert"
            className="flex items-start gap-2 mb-5 p-3 rounded-lg text-sm"
            style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Usuario */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-[#1b2032] mb-1.5"
            >
              Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'login-error' : undefined}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#d1cfc9] text-[#1b2032]
                         focus:outline-none focus:ring-2 focus:ring-[#e8971f] focus:border-transparent"
            />
          </div>

          {/* Contraseña */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#1b2032] mb-1.5"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'login-error' : undefined}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#d1cfc9] text-[#1b2032]
                         focus:outline-none focus:ring-2 focus:ring-[#e8971f] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full
                       text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e8971f]"
            style={{ backgroundColor: '#e8971f', color: '#1b2032' }}
          >
            {loading && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>

      <p className="text-[#6b7896] text-xs mt-8 text-center max-w-sm">
        El tablero ciudadano es público y no requiere iniciar sesión.
      </p>
    </div>
  )
}
