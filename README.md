# PiPP — Plataforma de Integridad del Presupuesto Participativo

Tablero ciudadano para consultar proyectos, contratos y empresas del presupuesto participativo de la Ciudad de México.

> **AVISO IMPORTANTE — PROTOTIPO**
> Este repositorio contiene únicamente **datos 100% ficticios** creados para demostrar la funcionalidad de la plataforma. Los nombres de empresas, personas, montos, RFC y cualquier otro dato son inventados. No representan información real ni acusan a nadie.

---

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Python · FastAPI · asyncpg · Pydantic v2 |
| Frontend | React · TypeScript · Vite · Tailwind CSS v4 · Shadcn/UI · React Router · Leaflet |
| Base de datos | PostgreSQL (local) |
| Mapas | CartoDB Light tiles (sin API key) |

---

## Requisitos previos

- Python 3.11+
- Node.js 18+
- PostgreSQL instalado y corriendo localmente

---

## Configuración

El archivo `.env` **no está en el repositorio** (está en `.gitignore` por seguridad). Debes crearlo a mano a partir del ejemplo:

```bash
cp backend/.env.example backend/.env
```

Luego edita `backend/.env` y pon la contraseña real de tu base de datos.

---

## Base de datos

**Crear usuario y base de datos** (solo la primera vez):

```bash
sudo -u postgres psql -c "CREATE USER pipp WITH PASSWORD 'tu_contraseña';"
sudo -u postgres psql -c "CREATE DATABASE pipp_dev OWNER pipp;"
```

**Aplicar el esquema de tablas:**

```bash
psql -U pipp -d pipp_dev -f backend/db/schema.sql
```

**Poblar con datos de prueba** (borra y recrea todos los datos):

```bash
cd backend
.venv/bin/python db/seed.py
```

---

## Levantar el proyecto

### Backend (puerto 8000)

```bash
cd backend
python -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn main:app --reload --port 8000
```

### Frontend (puerto 5173)

```bash
cd frontend
npm install
npm run dev
```

El frontend hace proxy de `/api` al backend automáticamente.

---

## Rutas del frontend

| Ruta | Descripción |
|---|---|
| `/` | Lista de colonias agrupadas por alcaldía |
| `/colonia/:id` | Proyectos y contratos de una unidad territorial |
| `/contrato/:id` | Detalle completo: empresa, plazos, beneficiarios |
| `/mapa` | Mapa con marcadores coloreados por nivel de riesgo |

## Endpoints de la API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Verificación de conexión a la base de datos |
| GET | `/api/unidades` | Lista de unidades territoriales con resumen |
| GET | `/api/unidades/{id}` | Detalle de una unidad territorial |
| GET | `/api/unidades/{id}/proyectos` | Proyectos y contratos de una colonia |
| GET | `/api/contratos/{id}` | Detalle completo de un contrato |
| GET | `/api/proyectos` | Todos los proyectos con coordenadas (para el mapa) |

---

## Estructura de carpetas

```
PiPP/
├── backend/
│   ├── db/
│   │   ├── schema.sql      # Definición de tablas
│   │   └── seed.py         # Datos ficticios de prueba
│   ├── .env.example        # Plantilla de variables de entorno
│   ├── config.py           # Configuración (lee .env)
│   ├── main.py             # App FastAPI y pool de conexiones
│   ├── models.py           # Modelos Pydantic
│   ├── router.py           # Endpoints de la API
│   └── requirements.txt    # Dependencias Python
└── frontend/
    ├── src/
    │   ├── lib/api.ts       # Tipos y funciones fetch
    │   ├── pages/           # Home, Colonia, Contrato, Mapa
    │   └── components/      # Componentes Shadcn/UI
    ├── index.html
    └── vite.config.ts       # Proxy /api → localhost:8000
```

---

Las decisiones de diseño y el backlog viven en `PiPP_CONTEXT.md`.
