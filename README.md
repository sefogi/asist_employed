# Sistema de Control de Asistencia de Empleados

Sistema de gestión de asistencia laboral: los empleados fichan entrada/salida y solicitan horas extra; el administrador gestiona empleados, aprueba horas extra y exporta reportes.

## Arquitectura

```
┌──────────────┐      HTTP/JSON       ┌──────────────┐        SQL        ┌──────────────┐
│   Frontend   │ ──────────────────▶  │   API REST   │ ────────────────▶ │  PostgreSQL  │
│ React + Vite │   JWT en cada call   │  Fastify 5   │   pg (pool)       │      16      │
└──────────────┘                      └──────────────┘                   └──────────────┘
```

- **Frontend:** React 19 + TypeScript + Tailwind CSS (`src/`)
- **Backend:** Node 22 + Fastify 5 + TypeScript (`backend/`)
- **Base de datos:** PostgreSQL 16 (migraciones SQL puras en `backend/migrations/`)
- **Contrato de API:** OpenAPI 3.1 design-first en [`docs/openapi.yaml`](docs/openapi.yaml), servido con Swagger UI en `/api/docs`
- **Seguridad:** contraseñas con bcrypt, sesiones JWT con expiración, autorización por rol en el backend
- **Tests:** vitest contra PostgreSQL real (TDD), incluye test de conformidad con el contrato OpenAPI

## Desarrollo local

Requisitos: Node 22+, pnpm, Docker.

### 1. Base de datos (Docker)

```bash
docker compose -f docker-compose.dev.yml up -d
```

Levanta PostgreSQL 16 en el puerto **5433** con las bases `asist` (dev) y `asist_test` (tests).

### 2. Backend

```bash
cd backend
cp .env.example .env        # revisa JWT_SECRET y APP_TIMEZONE
pnpm install
pnpm seed                   # aplica migraciones + datos de prueba
pnpm dev                    # API en http://localhost:3000
```

- Documentación interactiva: http://localhost:3000/api/docs
- Tests (necesitan la BD de Docker arriba): `pnpm test`
- Migraciones manuales: `pnpm migrate`

### 3. Frontend

```bash
# en la raíz del repo
cp .env.example .env        # VITE_API_URL=http://localhost:3000/api/v1
pnpm install
pnpm dev                    # http://localhost:5173
```

## Usuarios de prueba (seed)

| Rol | Email | Contraseña |
| --- | --- | --- |
| Admin | admin@empresa.com | cambiar-admin-123 |
| Empleado | juan@empresa.com | empleado-1234 |
| Empleado | maria@empresa.com | empleado-1234 |
| Empleado | carlos@empresa.com | empleado-1234 |

> En producción define `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` antes de ejecutar el seed, o cambia la contraseña tras el primer login.

## API

Contrato completo en [`docs/openapi.yaml`](docs/openapi.yaml). Resumen:

| Método | Ruta | Quién | Descripción |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/login` | público | Login → JWT |
| GET | `/api/v1/auth/me` | autenticado | Usuario actual |
| GET/POST | `/api/v1/employees` | admin | Listar / crear empleados |
| GET/PATCH/DELETE | `/api/v1/employees/:id` | admin (GET también el propio) | Detalle / editar / eliminar |
| GET | `/api/v1/attendance` | autenticado | Empleado: los suyos; admin: todos |
| POST | `/api/v1/attendance/check-in` | empleado | Fichar entrada (hora del servidor) |
| POST | `/api/v1/attendance/check-out` | empleado | Fichar salida |
| POST | `/api/v1/attendance/:id/overtime/request` | empleado dueño | Solicitar horas extra (notifica al admin) |
| POST | `/api/v1/attendance/:id/overtime/approve` | admin | Aprobar horas extra |
| GET | `/api/v1/notifications` | admin | Notificaciones |
| DELETE | `/api/v1/notifications/:id` | admin | Eliminar notificación |
| GET | `/api/v1/login-logs` | admin | Registro de logins |
| GET | `/api/v1/health` | público | Healthcheck |

## Reglas de negocio del fichaje

- La hora de entrada/salida la fija **el servidor**, nunca el cliente.
- Un empleado no puede fichar entrada dos veces el mismo día (índice único en BD para registros abiertos).
- "Hoy" se evalúa en la zona horaria de `APP_TIMEZONE` (formato IANA, p. ej. `Europe/Madrid`).
- Al solicitar horas extra se crea automáticamente una notificación para el admin, ligada al registro de asistencia; al aprobarlas, la notificación se elimina.

## Scripts

| Dónde | Comando | Qué hace |
| --- | --- | --- |
| raíz | `pnpm dev` / `pnpm build` / `pnpm lint` | Frontend |
| backend | `pnpm dev` | API con recarga (tsx watch) |
| backend | `pnpm test` | Suite TDD contra Postgres real |
| backend | `pnpm migrate` / `pnpm seed` | Migraciones / datos iniciales |
| backend | `pnpm build` / `pnpm start` | Compilar y ejecutar producción |

## Roadmap

- [x] **Fase 1** — Backend propio (Fastify + PostgreSQL), bcrypt + JWT, contrato OpenAPI, TDD
- [ ] **Fase 2** — Dockerización completa (frontend + API + BD + nginx) para un solo servidor
- [ ] **Fase 3** — Rediseño UX/UI (mobile-first para fichaje, routing, sistema de diseño)
- [ ] **Fase 4** — CI/CD con GitHub Actions (lint + tests + build + deploy)
- [ ] **Fase 5** — Hardening: HTTPS, backups automáticos, rate-limiting

## Licencia

MIT — ver [LICENSE.MD](LICENSE.MD).
