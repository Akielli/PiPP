from uuid import UUID
from typing import AsyncGenerator

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Request

from models import (
    BeneficiarioInfo,
    ContratoDetalle,
    ContratoResumen,
    EmpresaInfo,
    ProyectoConContrato,
    ProyectoInfo,
    UnidadResumen,
)

router = APIRouter(prefix="/api")


# ── Dependencia: conexión del pool ────────────────────────────────────────────

async def get_conn(request: Request) -> AsyncGenerator[asyncpg.Connection, None]:
    async with request.app.state.db_pool.acquire() as conn:
        yield conn


# ── 1. Lista de unidades territoriales ───────────────────────────────────────

@router.get("/unidades", response_model=list[UnidadResumen])
async def listar_unidades(conn: asyncpg.Connection = Depends(get_conn)):
    rows = await conn.fetch("""
        SELECT
            ut.id,
            ut.nombre,
            ut.alcaldia,
            ut.lat,
            ut.lng,
            COUNT(DISTINCT p.id)    AS num_proyectos,
            COALESCE(SUM(c.monto), 0) AS monto_total
        FROM unidad_territorial ut
        LEFT JOIN proyecto p ON p.ut_id = ut.id
        LEFT JOIN contrato c ON c.proyecto_id = p.id
        GROUP BY ut.id
        ORDER BY ut.alcaldia, ut.nombre
    """)
    return [UnidadResumen(**dict(r)) for r in rows]


# ── 2. Detalle de una unidad territorial ─────────────────────────────────────

@router.get("/unidades/{ut_id}", response_model=UnidadResumen)
async def detalle_unidad(
    ut_id: UUID,
    conn: asyncpg.Connection = Depends(get_conn),
):
    row = await conn.fetchrow("""
        SELECT
            ut.id,
            ut.nombre,
            ut.alcaldia,
            ut.lat,
            ut.lng,
            COUNT(DISTINCT p.id)      AS num_proyectos,
            COALESCE(SUM(c.monto), 0) AS monto_total
        FROM unidad_territorial ut
        LEFT JOIN proyecto p ON p.ut_id = ut.id
        LEFT JOIN contrato c ON c.proyecto_id = p.id
        WHERE ut.id = $1
        GROUP BY ut.id
    """, ut_id)
    if row is None:
        raise HTTPException(status_code=404, detail=f"Unidad territorial {ut_id} no encontrada")
    return UnidadResumen(**dict(row))


# ── 3. Proyectos de una unidad territorial ────────────────────────────────────

@router.get("/unidades/{ut_id}/proyectos", response_model=list[ProyectoConContrato])
async def proyectos_de_unidad(
    ut_id: UUID,
    conn: asyncpg.Connection = Depends(get_conn),
):
    existe = await conn.fetchval(
        "SELECT EXISTS(SELECT 1 FROM unidad_territorial WHERE id = $1)", ut_id
    )
    if not existe:
        raise HTTPException(status_code=404, detail=f"Unidad territorial {ut_id} no encontrada")

    rows = await conn.fetch("""
        SELECT
            p.id,
            p.nombre,
            p.anio,
            p.monto_asignado,
            p.lat,
            p.lng,
            e.razon_social,
            c.id         AS contrato_id,
            c.modalidad,
            c.monto,
            c.avance_pct,
            c.nivel_riesgo
        FROM proyecto p
        LEFT JOIN contrato c ON c.proyecto_id = p.id
        LEFT JOIN empresa  e ON e.id = c.empresa_id
        WHERE p.ut_id = $1
        ORDER BY p.anio DESC, p.nombre
    """, ut_id)

    resultado = []
    for r in rows:
        contrato = None
        if r["modalidad"] is not None:
            contrato = ContratoResumen(
                id=r["contrato_id"],
                razon_social=r["razon_social"],
                modalidad=r["modalidad"],
                monto=r["monto"],
                avance_pct=r["avance_pct"],
                nivel_riesgo=r["nivel_riesgo"],
            )
        resultado.append(ProyectoConContrato(
            id=r["id"],
            nombre=r["nombre"],
            anio=r["anio"],
            monto_asignado=r["monto_asignado"],
            lat=r["lat"],
            lng=r["lng"],
            contrato=contrato,
        ))
    return resultado


# ── 3. Detalle de un contrato ─────────────────────────────────────────────────

@router.get("/contratos/{contrato_id}", response_model=ContratoDetalle)
async def detalle_contrato(
    contrato_id: UUID,
    conn: asyncpg.Connection = Depends(get_conn),
):
    row = await conn.fetchrow("""
        SELECT
            c.id,
            c.modalidad,
            c.monto,
            c.avance_pct,
            c.nivel_riesgo,
            p.id               AS proyecto_id,
            p.nombre           AS proyecto_nombre,
            p.anio,
            p.monto_asignado,
            p.lat              AS proyecto_lat,
            p.lng              AS proyecto_lng,
            ut.nombre          AS ut_nombre,
            ut.alcaldia,
            e.id               AS empresa_id,
            e.razon_social,
            e.rfc,
            e.fecha_constitucion,
            e.domicilio
        FROM contrato c
        JOIN proyecto            p  ON p.id  = c.proyecto_id
        JOIN unidad_territorial  ut ON ut.id = p.ut_id
        JOIN empresa             e  ON e.id  = c.empresa_id
        WHERE c.id = $1
    """, contrato_id)

    if row is None:
        raise HTTPException(status_code=404, detail=f"Contrato {contrato_id} no encontrado")

    beneficiarios = await conn.fetch("""
        SELECT nombre, pct_control
        FROM beneficiario
        WHERE empresa_id = $1
        ORDER BY pct_control DESC
    """, row["empresa_id"])

    return ContratoDetalle(
        id=row["id"],
        modalidad=row["modalidad"],
        monto=row["monto"],
        avance_pct=row["avance_pct"],
        nivel_riesgo=row["nivel_riesgo"],
        proyecto=ProyectoInfo(
            id=row["proyecto_id"],
            nombre=row["proyecto_nombre"],
            anio=row["anio"],
            monto_asignado=row["monto_asignado"],
            lat=row["proyecto_lat"],
            lng=row["proyecto_lng"],
            unidad_territorial=row["ut_nombre"],
            alcaldia=row["alcaldia"],
        ),
        empresa=EmpresaInfo(
            razon_social=row["razon_social"],
            rfc=row["rfc"],
            fecha_constitucion=row["fecha_constitucion"],
            domicilio=row["domicilio"],
            beneficiarios=[
                BeneficiarioInfo(nombre=b["nombre"], pct_control=b["pct_control"])
                for b in beneficiarios
            ],
        ),
    )
