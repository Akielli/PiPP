import { useEffect, useState } from 'react'

type HealthStatus = {
  status: string
  db: string
} | null

export default function App() {
  const [health, setHealth] = useState<HealthStatus>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setError(true))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="rounded-xl border p-8 w-72 text-center space-y-4 shadow-sm">
        <h1 className="text-xl font-semibold">PiPP — Estado del sistema</h1>

        {!health && !error && (
          <p className="text-muted-foreground text-sm">Consultando...</p>
        )}

        {error && (
          <p className="text-destructive text-sm font-medium">
            No se pudo conectar al backend
          </p>
        )}

        {health && (
          <ul className="text-sm space-y-2">
            <li className="flex justify-between">
              <span className="text-muted-foreground">API</span>
              <StatusBadge ok={health.status === 'ok'} />
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Base de datos</span>
              <StatusBadge ok={health.db === 'ok'} />
            </li>
          </ul>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`font-mono font-medium ${ok ? 'text-green-600' : 'text-destructive'}`}
    >
      {ok ? 'ok' : 'error'}
    </span>
  )
}
