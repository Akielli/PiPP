export type UnidadResumen = {
  id: string
  nombre: string
  alcaldia: string
  lat: number
  lng: number
  num_proyectos: number
  monto_total: number
}

export type ContratoResumen = {
  id: string
  razon_social: string
  modalidad: string
  monto: number
  avance_pct: number
  nivel_riesgo: 'bajo' | 'medio' | 'alto'
}

export type ProyectoConContrato = {
  id: string
  nombre: string
  anio: number
  monto_asignado: number
  lat: number
  lng: number
  contrato: ContratoResumen | null
}

export async function fetchUnidades(): Promise<UnidadResumen[]> {
  const res = await fetch('/api/unidades')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchUnidadById(id: string): Promise<UnidadResumen> {
  const res = await fetch(`/api/unidades/${id}`)
  if (res.status === 404) throw Object.assign(new Error('NOT_FOUND'), { status: 404 })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchProyectosDeUnidad(id: string): Promise<ProyectoConContrato[]> {
  const res = await fetch(`/api/unidades/${id}/proyectos`)
  if (res.status === 404) throw Object.assign(new Error('NOT_FOUND'), { status: 404 })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
