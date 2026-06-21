#!/usr/bin/env python3
"""
Seed de datos ficticios para pipp_dev.
Limpia todas las tablas y las vuelve a poblar desde cero.
Ejecutar desde backend/: .venv/bin/python db/seed.py
"""

import asyncio
import uuid
from datetime import date
from pathlib import Path

import asyncpg
from dotenv import load_dotenv
import os

load_dotenv(Path(__file__).parent.parent / ".env")
DATABASE_URL = os.environ["DATABASE_URL"]


def uid() -> str:
    return str(uuid.uuid4())


# ── IDs fijos para poder cruzar las llaves foráneas ───────────────────────────

UT1, UT2, UT3 = uid(), uid(), uid()   # Iztapalapa
UT4, UT5, UT6 = uid(), uid(), uid()   # Gustavo A. Madero
UT7, UT8      = uid(), uid()           # Tlalpan

E1  = uid()   # Construcciones Integrales del Anáhuac    — 3 contratos, riesgo alto
E2  = uid()   # Grupo Constructor Pedregal               — 2 contratos
E3  = uid()   # Infraestructura Vial Metropolitana       — 2 contratos
E4  = uid()   # Servicios Urbanos Tepetitlán             — 2 contratos
E5  = uid()   # Pavimentos y Obras Civiles del Sur       — 1 contrato
E6  = uid()   # Constructora Ajusco Verde                — 2 contratos
E7  = uid()   # Mantenimiento Integral Capitalino        — 2 contratos
E8  = uid()   # Obras Públicas Metropolitanas            — 2 contratos
E9  = uid()   # Ingeniería y Construcción Tepeyac        — 1 contrato
E10 = uid()   # Desarrollos Urbanos del Oriente          — 1 contrato

P = [uid() for _ in range(16)]   # 16 proyectos, índice 0-15


# ── Unidades territoriales ────────────────────────────────────────────────────
#    Nombres y alcaldías reales de la CDMX; coordenadas aproximadas públicas.

UNIDADES = [
    # id    nombre                        alcaldia              lat        lng
    (UT1, "Santa Cruz Meyehualco",     "Iztapalapa",        19.373100, -99.050100),
    (UT2, "Ermita Zaragoza",           "Iztapalapa",        19.381200, -99.062300),
    (UT3, "Los Reyes Culhuacán",       "Iztapalapa",        19.347800, -99.014700),
    (UT4, "Nueva Atzacoalco",          "Gustavo A. Madero", 19.501800, -99.102400),
    (UT5, "Martín Carrera",            "Gustavo A. Madero", 19.491200, -99.114700),
    (UT6, "El Arbolillo",              "Gustavo A. Madero", 19.485400, -99.108300),
    (UT7, "San Andrés Totoltepec",     "Tlalpan",           19.280100, -99.119500),
    (UT8, "Pedregal de San Nicolás",   "Tlalpan",           19.294200, -99.146300),
]


# ── Empresas (completamente ficticias) ───────────────────────────────────────
#    RFC con formato persona moral: 3 letras + AAMMDD + 3 homoclave. Inventados.

EMPRESAS = [
    # id   razon_social                                          rfc             fecha_const        domicilio
    (E1,  "Construcciones Integrales del Anáhuac S.A. de C.V.", "CIA890412XH5", date(1989,  4, 12), "Av. Eduardo Molina 2726, Col. Juan González Romero, Gustavo A. Madero, CDMX"),
    (E2,  "Grupo Constructor Pedregal S.A. de C.V.",            "GCP920715MK2", date(1992,  7, 15), "Insurgentes Sur 3493, Of. 201, Col. Pedregal de San Francisco, Coyoacán, CDMX"),
    (E3,  "Infraestructura Vial Metropolitana S.A. de C.V.",    "IVM010328JJ9", date(2001,  3, 28), "Calz. Ignacio Zaragoza 1189, Col. Ejército de Oriente, Iztapalapa, CDMX"),
    (E4,  "Servicios Urbanos Tepetitlán S.A. de C.V.",          "SUT880603RM7", date(1988,  6,  3), "Av. Centenario 215, Col. Nextengo, Azcapotzalco, CDMX"),
    (E5,  "Pavimentos y Obras Civiles del Sur S.A. de C.V.",    "POC970214KN3", date(1997,  2, 14), "Periférico Sur 4320, Of. 8, Col. Jardines del Pedregal, Álvaro Obregón, CDMX"),
    (E6,  "Constructora Ajusco Verde S.A. de C.V.",             "CAV030811BP6", date(2003,  8, 11), "Av. San Fernando 211, Col. Pedregal de San Nicolás, Tlalpan, CDMX"),
    (E7,  "Mantenimiento Integral Capitalino S.A. de C.V.",     "MIC110930LQ1", date(2011,  9, 30), "Eje 6 Sur 900, Of. 14, Col. Viaducto Piedad, Iztacalco, CDMX"),
    (E8,  "Obras Públicas Metropolitanas S.A. de C.V.",         "OPM950515TR8", date(1995,  5, 15), "Blvd. Puerto Aéreo 390, Col. Moctezuma 2a Sección, Venustiano Carranza, CDMX"),
    (E9,  "Ingeniería y Construcción Tepeyac S.A. de C.V.",     "ICT870722GS4", date(1987,  7, 22), "Av. Instituto Politécnico Nacional 5301, Col. Plutarco Elías Calles, GAM, CDMX"),
    (E10, "Desarrollos Urbanos del Oriente S.A. de C.V.",       "DUO050419HT0", date(2005,  4, 19), "Av. Tláhuac 5602, Col. Los Olivos, Tláhuac, CDMX"),
]


# ── Beneficiarios reales (personas físicas ficticias) ─────────────────────────
#    pct_control debe sumar ≤ 100 por empresa (no hay constraint DB, pero es lógico).

BENEFICIARIOS = [
    # empresa_id  nombre                              pct_control
    (E1,  "Jorge Armando Velázquez Romo",       65.00),
    (E1,  "Petra Contreras Fuentes",            35.00),
    (E2,  "Rodrigo Muñoz Zavaleta",            100.00),
    (E3,  "Silvia Inés Pacheco Trujillo",       51.00),
    (E3,  "Antonio Bernal Castaños",            49.00),
    (E4,  "Fernando Lozano Herrera",            80.00),
    (E4,  "María Celeste Olvera Peña",          20.00),
    (E5,  "Enrique Salinas Villanueva",        100.00),
    (E6,  "Laura Beatriz Sandoval Quiroz",      60.00),
    (E6,  "Pablo Monroy Estrada",               40.00),
    (E7,  "Claudia Nieto Guevara",              72.00),
    (E7,  "Samuel Reyes Montoya",               28.00),
    (E8,  "Graciela Fuentes Ochoa",             55.00),
    (E8,  "Víctor Jiménez Aragón",              45.00),
    (E9,  "Alfredo Torres Barragán",           100.00),
    (E10, "Marisol Aguilar Domínguez",          90.00),
    (E10, "Óscar Pérez Zúñiga",                10.00),
]


# ── Proyectos (~2 por UT) ─────────────────────────────────────────────────────
#    lat/lng ligeramente desplazadas del centroide de la UT.

PROYECTOS = [
    # id      ut_id  nombre                                              anio   monto_asignado    lat        lng
    (P[0],  UT1, "Rehabilitación de banquetas y guarniciones",          2023,  3_250_000.00, 19.372800, -99.049800),
    (P[1],  UT1, "Construcción de área deportiva comunitaria",          2024,  8_700_000.00, 19.373600, -99.050500),
    (P[2],  UT2, "Pavimentación de calles secundarias",                 2022,  5_120_000.00, 19.380900, -99.062000),
    (P[3],  UT2, "Modernización de alumbrado público",                  2024,  2_450_000.00, 19.381800, -99.062800),
    (P[4],  UT3, "Mejoramiento de parque vecinal",                      2023,  1_980_000.00, 19.348100, -99.014300),
    (P[5],  UT3, "Red de drenaje sanitario",                            2022,  6_800_000.00, 19.347400, -99.015200),
    (P[6],  UT4, "Rehabilitación de mercado municipal",                 2024, 12_500_000.00, 19.501500, -99.102100),
    (P[7],  UT4, "Pavimentación de vialidad primaria",                  2023,  7_340_000.00, 19.502200, -99.102800),
    (P[8],  UT5, "Construcción de biblioteca comunitaria",              2022,  9_100_000.00, 19.490800, -99.114300),
    (P[9],  UT5, "Rehabilitación de espacios públicos",                 2024,  3_650_000.00, 19.491700, -99.115100),
    (P[10], UT6, "Rehabilitación de unidad deportiva",                  2023, 11_200_000.00, 19.485100, -99.107900),
    (P[11], UT6, "Construcción de centro comunitario",                  2022,  8_900_000.00, 19.485800, -99.108700),
    (P[12], UT7, "Pavimentación de caminos rurales",                    2023,  4_600_000.00, 19.279800, -99.119100),
    (P[13], UT7, "Sistema de captación de agua pluvial",                2024,  7_250_000.00, 19.280500, -99.119900),
    (P[14], UT8, "Rehabilitación de vialidades y accesos",              2022,  5_800_000.00, 19.293900, -99.146000),
    (P[15], UT8, "Construcción de módulo sanitario",                    2024,  2_150_000.00, 19.294600, -99.146700),
]


# ── Contratos ─────────────────────────────────────────────────────────────────
#    E1 gana 3 contratos (todos riesgo alto) — los 3 quedan DETENIDOS con avance bajo.
#    Fechas ancladas a hoy 2026-06-21.
#
#    Distribución de estado_plazo (calculado en Python, no almacenado en BD):
#      a_tiempo : P[2], P[4], P[8], P[9], P[12], P[14]  — 6 contratos
#      retrasado: P[1], P[5], P[7], P[13]                — 4 contratos
#      detenido : P[0], P[3], P[6], P[10], P[11], P[15] — 6 contratos (3 son CIA/E1)
#
# Cada tupla: (proyecto_id, empresa_id, modalidad, monto, avance_pct, nivel_riesgo,
#              contratacion_plan, contratacion_real,
#              inicio_plan,       inicio_real,
#              termino_plan,      termino_real)

CONTRATOS = [
    # P[0] CIA — banquetas — DETENIDO (avance=30 <50, termino_plan 2024-11-30 ya pasó)
    (P[0],  E1,  "adjudicacion_directa",    3_100_000.00,  30, "alto",
     date(2022,10, 1), date(2022,10,20), date(2022,12, 1), date(2023, 1,15), date(2024,11,30), None),

    # P[1] SUT — área deportiva — RETRASADO (avance=62 ≥50, termino_plan 2025-05-31 ya pasó)
    (P[1],  E4,  "licitacion",              8_500_000.00,  62, "medio",
     date(2023, 4, 1), date(2023, 4,15), date(2023, 6, 1), date(2023, 6,15), date(2025, 5,31), None),

    # P[2] GCP — pavimentación — A_TIEMPO (terminó 2022-07-25, antes del plan 2022-07-31)
    (P[2],  E2,  "invitacion_restringida",  4_950_000.00, 100, "bajo",
     date(2021, 6,15), date(2021, 6,20), date(2021, 8, 1), date(2021, 8, 5), date(2022, 7,31), date(2022, 7,25)),

    # P[3] MIC — alumbrado — DETENIDO (avance=45 <50, termino_plan 2025-08-31 ya pasó)
    (P[3],  E7,  "adjudicacion_directa",    2_380_000.00,  45, "medio",
     date(2023, 7,15), date(2023, 7,20), date(2023, 9, 1), date(2023, 9,10), date(2025, 8,31), None),

    # P[4] OPM — parque vecinal — A_TIEMPO (terminó 2023-02-10, antes del plan 2023-02-14)
    (P[4],  E8,  "licitacion",              1_920_000.00, 100, "bajo",
     date(2022, 1,10), date(2022, 1,15), date(2022, 2,15), date(2022, 2,20), date(2023, 2,14), date(2023, 2,10)),

    # P[5] POC — drenaje sanitario — RETRASADO (avance=78 ≥50, termino_plan 2023-10-31 ya pasó)
    (P[5],  E5,  "invitacion_restringida",  6_650_000.00,  78, "alto",
     date(2021, 9,15), date(2021, 9,20), date(2021,11, 1), date(2021,11,10), date(2023,10,31), None),

    # P[6] CIA — mercado municipal — DETENIDO (avance=30 <50, termino_plan 2025-03-14 ya pasó)
    (P[6],  E1,  "adjudicacion_directa",   12_200_000.00,  30, "alto",
     date(2023, 1,15), date(2023, 2,10), date(2023, 3,15), date(2023, 4,20), date(2025, 3,14), None),

    # P[7] IVM — vialidad primaria — RETRASADO (avance=55 ≥50, termino_plan 2024-09-30 ya pasó)
    (P[7],  E3,  "licitacion",              7_180_000.00,  55, "medio",
     date(2022, 8, 1), date(2022, 8,10), date(2022,10, 1), date(2022,10,15), date(2024, 9,30), None),

    # P[8] SUT — biblioteca — A_TIEMPO (en curso, termino_plan 2026-09-30 aún no llega)
    (P[8],  E4,  "invitacion_restringida",  8_950_000.00,  90, "bajo",
     date(2024, 1,15), date(2024, 1,20), date(2024, 3, 1), date(2024, 3,10), date(2026, 9,30), None),

    # P[9] MIC — espacios públicos — A_TIEMPO (en curso, termino_plan 2026-10-31 aún no llega)
    (P[9],  E7,  "adjudicacion_directa",    3_580_000.00,  70, "medio",
     date(2024, 3, 1), date(2024, 3, 8), date(2024, 4,15), date(2024, 4,20), date(2026,10,31), None),

    # P[10] IVM — unidad deportiva — DETENIDO (avance=40 <50, termino_plan 2024-07-31 ya pasó)
    (P[10], E3,  "licitacion",             10_900_000.00,  40, "alto",
     date(2022, 6, 1), date(2022, 6, 5), date(2022, 8, 1), date(2022, 8,10), date(2024, 7,31), None),

    # P[11] CIA — centro comunitario — DETENIDO (avance=15 <50, termino_plan 2025-07-31 ya pasó)
    (P[11], E1,  "invitacion_restringida",  8_760_000.00,  15, "alto",
     date(2023, 6, 1), date(2023, 7, 1), date(2023, 8, 1), date(2023,10,15), date(2025, 7,31), None),

    # P[12] CAV — caminos rurales — A_TIEMPO (en curso, termino_plan 2026-09-14 aún no llega)
    (P[12], E6,  "adjudicacion_directa",    4_480_000.00,  88, "bajo",
     date(2023, 8, 1), date(2023, 8,10), date(2023, 9,15), date(2023, 9,20), date(2026, 9,14), None),

    # P[13] CAV — captación pluvial — RETRASADO (avance=60 ≥50, termino_plan 2025-12-31 ya pasó)
    (P[13], E6,  "licitacion",              7_100_000.00,  60, "medio",
     date(2023,11, 1), date(2023,11, 5), date(2024, 1,15), date(2024, 1,20), date(2025,12,31), None),

    # P[14] GCP — vialidades y accesos — A_TIEMPO (en curso, termino_plan 2026-08-31 aún no llega)
    (P[14], E2,  "invitacion_restringida",  5_700_000.00,  95, "bajo",
     date(2024, 4, 1), date(2024, 4, 5), date(2024, 5,15), date(2024, 5,20), date(2026, 8,31), None),

    # P[15] DUO — módulo sanitario — DETENIDO (avance=25 <50, termino_plan 2025-11-30 ya pasó)
    (P[15], E10, "adjudicacion_directa",    2_100_000.00,  25, "medio",
     date(2023,10, 1), date(2023,10, 8), date(2023,12, 1), date(2023,12,10), date(2025,11,30), None),
]


# ── Inserción ─────────────────────────────────────────────────────────────────

async def seed():
    pool = await asyncpg.create_pool(DATABASE_URL)

    async with pool.acquire() as conn:
        async with conn.transaction():

            print("Limpiando tablas...")
            await conn.execute("""
                TRUNCATE contrato, beneficiario, proyecto, empresa, unidad_territorial
                CASCADE
            """)

            print("Insertando unidades territoriales...")
            await conn.executemany(
                """INSERT INTO unidad_territorial (id, nombre, alcaldia, lat, lng)
                   VALUES ($1, $2, $3, $4, $5)""",
                UNIDADES,
            )

            print("Insertando empresas...")
            await conn.executemany(
                """INSERT INTO empresa (id, razon_social, rfc, fecha_constitucion, domicilio)
                   VALUES ($1, $2, $3, $4, $5)""",
                EMPRESAS,
            )

            print("Insertando proyectos...")
            await conn.executemany(
                """INSERT INTO proyecto (id, ut_id, nombre, anio, monto_asignado, lat, lng)
                   VALUES ($1, $2, $3, $4, $5, $6, $7)""",
                PROYECTOS,
            )

            print("Insertando beneficiarios...")
            await conn.executemany(
                """INSERT INTO beneficiario (id, empresa_id, nombre, pct_control)
                   VALUES (gen_random_uuid(), $1, $2, $3)""",
                BENEFICIARIOS,
            )

            print("Insertando contratos...")
            await conn.executemany(
                """INSERT INTO contrato
                   (id, proyecto_id, empresa_id, modalidad, monto, avance_pct, nivel_riesgo,
                    fecha_contratacion_plan, fecha_contratacion_real,
                    fecha_inicio_plan,       fecha_inicio_real,
                    fecha_termino_plan,      fecha_termino_real)
                   VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)""",
                CONTRATOS,
            )

    await pool.close()

    # Resumen
    pool2 = await asyncpg.create_pool(DATABASE_URL)
    async with pool2.acquire() as conn:
        print("\n── Filas por tabla ──────────────────────────")
        for tabla in ["unidad_territorial", "empresa", "proyecto", "beneficiario", "contrato"]:
            n = await conn.fetchval(f"SELECT COUNT(*) FROM {tabla}")
            print(f"  {tabla:<25} {n:>3} filas")
    await pool2.close()

    print("\nSeed completado.")


if __name__ == "__main__":
    asyncio.run(seed())
