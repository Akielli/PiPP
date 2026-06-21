export type UnidadResumen = {
  id: string
  nombre: string
  alcaldia: string
  lat: number
  lng: number
  num_proyectos: number
  monto_total: number
}

export async function fetchUnidades(): Promise<UnidadResumen[]> {
  const res = await fetch('/api/unidades')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
