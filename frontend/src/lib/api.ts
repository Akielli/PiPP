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
  estado_plazo: 'a_tiempo' | 'retrasado' | 'detenido' | null
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
  estado_plazo: 'a_tiempo' | 'retrasado' | 'detenido' | null
  fecha_contratacion_plan: string | null  // "YYYY-MM-DD"
  fecha_contratacion_real: string | null
  fecha_inicio_plan: string | null
  fecha_inicio_real: string | null
  fecha_termino_plan: string | null
  fecha_termino_real: string | null
  proyecto: ProyectoInfo
  empresa: EmpresaInfo
}

export async function fetchContrato(id: string): Promise<ContratoDetalle> {
  const res = await fetch(`/api/contratos/${id}`)
  if (res.status === 404) throw Object.assign(new Error('NOT_FOUND'), { status: 404 })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── Tipos y fetch para el mapa ────────────────────────────────────────────────

export type ProyectoMapa = {
  id: string
  nombre: string
  lat: number
  lng: number
  unidad_territorial: string
  alcaldia: string
  nivel_riesgo: 'bajo' | 'medio' | 'alto' | null
  contrato_id: string | null
  razon_social: string | null
}

export async function fetchProyectosMapa(): Promise<ProyectoMapa[]> {
  const res = await fetch('/api/proyectos')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── Autenticación del portal de carga ─────────────────────────────────────────
//    Todas usan credentials: 'include' para enviar/recibir la cookie de sesión.

export type UsuarioActual = {
  username: string
  rol: 'iecm' | 'alcaldia'
  alcaldia: string | null
}

export async function login(username: string, password: string): Promise<UsuarioActual> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  })
  if (res.status === 401) throw Object.assign(new Error('CREDENCIALES'), { status: 401 })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
}

export async function fetchMe(): Promise<UsuarioActual> {
  const res = await fetch('/api/auth/me', { credentials: 'include' })
  if (res.status === 401) throw Object.assign(new Error('NO_SESSION'), { status: 401 })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
