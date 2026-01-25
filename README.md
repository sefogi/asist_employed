# Sistema de Control de Asistencia de Empleados

Sistema completo de gestión de asistencia laboral desarrollado con React, TypeScript y Supabase.

## Características

### Para Empleados:

- ✅ Login individual con credenciales personales
- ✅ Ficha personal con información del empleado
- ✅ Marcado de entrada y salida
- ✅ Visualización de horas trabajadas en tiempo real
- ✅ Solicitud de horas extras
- ✅ Historial personal de asistencia

### Para Administradores:

- ✅ Panel de control administrativo
- ✅ Creación de nuevos empleados
- ✅ Lista completa de empleados
- ✅ Control de login vs marcado de asistencia
- ✅ Aprobación de horas extras
- ✅ Historial diario de asistencia
- ✅ Exportación de reportes a HTML/PDF

## Tecnologías

- **Frontend:** React 18 + TypeScript
- **Estilos:** Tailwind CSS
- **Base de Datos:** Supabase (PostgreSQL)
- **Iconos:** Lucide React
- **Build Tool:** Vite

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd employee-attendance-system
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a **Project Settings** → **API**
4. Copia la `URL` y `anon key`

### 4. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y añade tus credenciales:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 5. Ejecutar migraciones de base de datos

Ve al **SQL Editor** en Supabase y ejecuta los archivos en orden:

1. `supabase/migrations/001_create_users_table.sql`
2. `supabase/migrations/002_create_attendance_table.sql`
3. `supabase/migrations/003_create_login_logs_table.sql`
4. `supabase/migrations/004_create_notifications_table.sql`
5. `supabase/migrations/005_create_policies.sql`
6. `supabase/migrations/006_create_functions.sql`
7. `supabase/seed/initial_data.sql` (Datos de prueba)

### 6. Iniciar el proyecto

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Usuarios de Prueba

### Administrador:

- **Email:** admin@empresa.com
- **Password:** admin

### Empleados:

- **Email:** juan@empresa.com | **Password:** 1234
- **Email:** maria@empresa.com | **Password:** 1234
- **Email:** carlos@empresa.com | **Password:** 1234

## Estructura del Proyecto

```
src/
├── components/
│   ├── Auth/          # Componentes de autenticación
│   ├── Employee/      # Componentes de empleados
│   ├── Admin/         # Componentes de administrador
│   └── Shared/        # Componentes compartidos
├── hooks/             # Custom hooks
├── services/          # Servicios de API
│   └── supabase/      # Servicios de Supabase
├── context/           # Context API
├── types/             # TypeScript types
├── utils/             # Funciones utilitarias
└── styles/            # Estilos globales
```

## Seguridad

- Row Level Security (RLS) habilitado en Supabase
- Políticas de acceso por rol
- Validación de datos en frontend y backend
- Contraseñas hasheadas (recomendado usar bcrypt en producción)

## Características Avanzadas

### Control de Login

- Registra cuando el empleado inicia sesión en la app
- Compara hora de login vs hora de marcado
- Detecta empleados logueados sin marcado

### Reportes Exportables

- Exportación a HTML (convertible a PDF)
- Estadísticas diarias
- Información completa de asistencia

### Tiempo Real

- Reloj en vivo
- Contador de horas trabajadas
- Barra de progreso de jornada

## Scripts Disponibles

```bash
npm run dev      # Modo desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
npm run lint     # Ejecutar linter
```

## To-Do / Mejoras Futuras

- [ ] Autenticación con Supabase Auth
- [ ] Notificaciones push
- [ ] Dashboard con gráficas
- [ ] Exportación a Excel/CSV
- [ ] App móvil con React Native
- [ ] Geolocalización para marcado
- [ ] Reconocimiento facial
- [ ] Integración con nómina

## Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver el archivo LICENSE para más detalles

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en el repositorio.

---

Desarrollado con ❤️ usando React + TypeScript + Supabase
