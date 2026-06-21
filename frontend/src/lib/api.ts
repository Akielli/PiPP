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

// ── Tipos para el detalle de contrato ─────────────────────────────────────────

export type BeneficiarioInfo = {
  nombre: string
  pct_control: number
}

export type EmpresaInfo = {
  razon_social: string
  rfc: string
  fecha_constitucion: string   // "YYYY-MM-DD"
  domicilio: string
  beneficiarios: BeneficiarioInfo[]
}

export type ProyectoInfo = {
  id: string
  ut_id: string
  nombre: string
  anio: number
  monto_asignado: number
  lat: number
  lng: number
  unidad_territorial: string
  alcaldia: string
}

export type ContratoDetalle = {
  id: string
  modalidad: string
  monto: number
  avance_pct: number
  nivel_riesgo: 'bajo' | 'medio' | 'alto'
  proyecto: ProyectoInfo
  empresa: EmpresaInfo
}

export async function fetchContrato(id: string): Promise<ContratoDetalle> {
  const res = await fetch(`/api/contratos/${id}`)
  if (res.status === 404) throw Object.assign(new Error('NOT_FOUND'), { status: 404 })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
