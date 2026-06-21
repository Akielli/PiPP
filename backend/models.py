from datetime import date
from uuid import UUID
from pydantic import BaseModel


class UnidadResumen(BaseModel):
    id: UUID
    nombre: str
    alcaldia: str
    lat: float
    lng: float
    num_proyectos: int
    monto_total: float


class ContratoResumen(BaseModel):
    razon_social: str | None = None
    modalidad: str | None = None
    monto: float | None = None
    avance_pct: int | None = None
    nivel_riesgo: str | None = None


class ProyectoConContrato(BaseModel):
    id: UUID
    nombre: str
    anio: int
    monto_asignado: float
    lat: float
    lng: float
    contrato: ContratoResumen | None = None


class BeneficiarioInfo(BaseModel):
    nombre: str
    pct_control: float


class EmpresaInfo(BaseModel):
    razon_social: str
    rfc: str
    fecha_constitucion: date
    domicilio: str
    beneficiarios: list[BeneficiarioInfo]


class ProyectoInfo(BaseModel):
    id: UUID
    nombre: str
    anio: int
    monto_asignado: float
    lat: float
    lng: float
    unidad_territorial: str
    alcaldia: str


class ContratoDetalle(BaseModel):
    id: UUID
    modalidad: str
    monto: float
    avance_pct: int
    nivel_riesgo: str
    proyecto: ProyectoInfo
    empresa: EmpresaInfo
