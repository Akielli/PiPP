"""
Autenticación del portal de carga.

Sesión basada en cookie HttpOnly con un token opaco (UUID) almacenado en la
tabla `sesion`. No se usan JWT ni localStorage: el navegador no puede leer la
cookie desde JavaScript, lo que reduce el riesgo de robo de sesión (XSS).
"""

from uuid import UUID

import asyncpg
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Request, Response

from models import LoginRequest, UsuarioActual
from router import get_conn

auth_router = APIRouter(prefix="/api/auth")

COOKIE_NAME = "pipp_session"

# En desarrollo (HTTP local) Secure debe ser False o el navegador no guarda la
# cookie. En producción con HTTPS hay que ponerlo en True.
COOKIE_SECURE = False


def verificar_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


# ── Dependencia: usuario de la sesión actual ──────────────────────────────────

async def usuario_actual(
    request: Request,
    conn: asyncpg.Connection = Depends(get_conn),
) -> UsuarioActual:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="No hay sesión activa")

    try:
        token_uuid = UUID(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Sesión inválida")

    row = await conn.fetchrow("""
        SELECT u.username, u.rol, u.alcaldia
        FROM sesion s
        JOIN usuario u ON u.id = s.usuario_id
        WHERE s.token = $1
    """, token_uuid)

    if row is None:
        raise HTTPException(status_code=401, detail="Sesión inválida")

    return UsuarioActual(**dict(row))


# ── Endpoints ─────────────────────────────────────────────────────────────────

@auth_router.post("/login", response_model=UsuarioActual)
async def login(
    datos: LoginRequest,
    response: Response,
    conn: asyncpg.Connection = Depends(get_conn),
):
    row = await conn.fetchrow(
        "SELECT id, username, password_hash, rol, alcaldia FROM usuario WHERE username = $1",
        datos.username,
    )
    # Mismo mensaje exista o no el usuario, para no revelar cuáles son válidos.
    if row is None or not verificar_password(datos.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    token = await conn.fetchval(
        "INSERT INTO sesion (usuario_id) VALUES ($1) RETURNING token",
        row["id"],
    )

    response.set_cookie(
        key=COOKIE_NAME,
        value=str(token),
        httponly=True,       # inaccesible desde JavaScript
        samesite="lax",      # mitiga CSRF
        secure=COOKIE_SECURE,
        path="/",
    )

    return UsuarioActual(
        username=row["username"],
        rol=row["rol"],
        alcaldia=row["alcaldia"],
    )


@auth_router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    conn: asyncpg.Connection = Depends(get_conn),
):
    token = request.cookies.get(COOKIE_NAME)
    if token:
        try:
            await conn.execute("DELETE FROM sesion WHERE token = $1", UUID(token))
        except ValueError:
            pass
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"ok": True}


@auth_router.get("/me", response_model=UsuarioActual)
async def me(usuario: UsuarioActual = Depends(usuario_actual)):
    return usuario
