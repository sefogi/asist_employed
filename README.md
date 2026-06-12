# Sistema de Control de Asistencia de Empleados

Sistema de gestión de asistencia laboral: los empleados fichan entrada/salida y solicitan horas extra; el administrador gestiona empleados, aprueba horas extra y exporta reportes.

## Arquitectura

```
┌──────────────┐      HTTP/JSON       ┌──────────────┐        SQL        ┌──────────────┐
│   Frontend   │ ──────────────────▶  │   API REST   │ ────────────────▶ │  PostgreSQL  │
│ React + Vite │   JWT en cada call   │  Fastify 5   │   pg (pool)       │      16      │
└──────────────┘                      └──────────────┘                   └──────────────┘
```

- **Frontend:** React 19 + TypeScript + Tailwind CSS (`frontend/`)
- **Backend:** Node 22 + Fastify 5 + TypeScript (`backend/`)
- **Base de datos:** PostgreSQL 16 (migraciones SQL versionadas en `backend/migrations/`)
- **Contrato de API:** OpenAPI 3.1 design-first en [`docs/openapi.yaml`](docs/openapi.yaml), servido con Swagger UI en `/api/docs`
- **Seguridad:** contraseñas con bcrypt, sesiones JWT con expiración, autorización por rol en el backend
- **Tests:** vitest contra PostgreSQL real (TDD), incluye test de conformidad con el contrato OpenAPI

## Estructura del repositorio

Monorepo con [pnpm workspaces](https://pnpm.io/workspaces):

```
asist_employed/
├── frontend/             # SPA React (asist-employed-web)
│   ├── src/
│   └── package.json
├── backend/              # API REST (asist-employed-api)
│   ├── src/
│   ├── migrations/       # migraciones SQL versionadas de la BD
│   ├── test/
│   └── package.json
├── docs/
│   └── openapi.yaml      # contrato del API (fuente de verdad)
├── docker-compose.dev.yml
├── pnpm-workspace.yaml
└── package.json          # scripts del workspace
```

## Desarrollo local

Requisitos: Node 22+, pnpm, Docker.

```bash
# 1. Dependencias de todo el workspace (una sola vez, en la raíz)
pnpm install

# 2. Base de datos en Docker (puerto 5433; crea las BD asist y asist_test)
docker compose -f docker-compose.dev.yml up -d

# 3. Variables de entorno
cp backend/.env.example backend/.env      # revisa JWT_SECRET y APP_TIMEZONE
cp frontend/.env.example frontend/.env    # VITE_API_URL

# 4. Migraciones + datos de prueba
pnpm seed

# 5. Arrancar (en dos terminales)
pnpm dev:api    # API en http://localhost:3000 (Swagger en /api/docs)
pnpm dev        # frontend en http://localhost:5173
```

Los tests del backend necesitan la BD de Docker levantada: `pnpm test`.

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

## Migraciones de base de datos

El esquema está versionado con migraciones SQL planas (estilo Flyway, *roll-forward*):

- Cada cambio de esquema es un fichero nuevo en `backend/migrations/`, numerado y **inmutable** una vez aplicado: `001_init.sql`, `002_lo_que_sea.sql`…
- El runner ([backend/src/db/migrate.ts](backend/src/db/migrate.ts)) aplica en orden las pendientes, cada una en su transacción, y registra lo aplicado en la tabla `schema_migrations`. Un advisory lock de Postgres impide que dos instancias migren a la vez.
- El API ejecuta las migraciones pendientes al arrancar, y también puedes lanzarlas a mano con `pnpm migrate`.
- **Nunca edites una migración ya aplicada**: si algo está mal, se corrige con una migración nueva (*roll forward*). No hay migraciones *down*; en producción revertir esquema con datos reales es más peligroso que avanzar.

## Scripts (desde la raíz)

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Frontend en modo desarrollo (Vite) |
| `pnpm dev:api` | API con recarga (tsx watch) |
| `pnpm build` | Compila frontend y backend |
| `pnpm lint` / `pnpm typecheck` | Linter / chequeo de tipos en ambos paquetes |
| `pnpm test` | Suite TDD del backend contra Postgres real |
| `pnpm migrate` / `pnpm seed` | Migraciones / datos iniciales |

## Flujo de trabajo (Git Flow + SemVer)

Ramas:

- **`main`** — solo releases estables, cada una con tag `vX.Y.Z`.
- **`develop`** — integración continua del trabajo terminado.
- **`feature/<nombre>`** — sale de `develop`, vuelve a `develop` con `git merge --no-ff`.
- **`release/X.Y.Z`** — sale de `develop` cuando se prepara una versión; ajustes finales, merge a `main` (+ tag) y de vuelta a `develop`.
- **`hotfix/<nombre>`** — sale de `main` para arreglos urgentes; merge a `main` y `develop`.

Commits con [Conventional Commits](https://www.conventionalcommits.org/es/) (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`…; `!` para breaking changes), que mapean directo a [SemVer](https://semver.org/lang/es/): `fix` → patch, `feat` → minor, breaking → major. Pre-1.0, los breaking changes suben el minor.

## Roadmap

- [x] **Fase 1** — Backend propio (Fastify + PostgreSQL), bcrypt + JWT, contrato OpenAPI, TDD
- [ ] **Fase 2** — Dockerización completa (frontend + API + BD + nginx) para un solo servidor
- [ ] **Fase 3** — Rediseño UX/UI (mobile-first para fichaje, routing, sistema de diseño)
- [ ] **Fase 4** — CI/CD con GitHub Actions (lint + tests + build + deploy)
- [ ] **Fase 5** — Hardening: HTTPS, backups automáticos, rate-limiting

## Licencia

MIT — ver [LICENSE.MD](LICENSE.MD).
