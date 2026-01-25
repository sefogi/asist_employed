# Asist Employed

Sistema de gestión de asistencia de empleados con panel de administrador y control de asistencia en tiempo real.

## Descripción

Asist Employed es una aplicación web desarrollada con React y TypeScript que permite:

- **Empleados**: Registrar entrada/salida, ver historial de asistencia y visualizar su perfil
- **Administradores**: Gestionar empleados, ver historial de asistencia diaria, generar reportes

## Características

- ✅ Autenticación de usuarios (empleados y administradores)
- ✅ Control de asistencia en tiempo real con reloj en vivo
- ✅ Historial de asistencia por empleado
- ✅ Panel de administración
- ✅ Gestión de empleados (crear, editar, ver lista)
- ✅ Reportes diarios de asistencia
- ✅ Generación de reportes en PDF
- ✅ Diseño responsivo con Tailwind CSS

## Tecnologías

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Supabase
- **Estilos**: Tailwind CSS
- **Gestión de estado**: Zustand
- **Enrutamiento**: React Router DOM
- **Utilidades**: date-fns, jsPDF
- **Iconos**: Lucide React

## Instalación

### Requisitos previos

- Node.js >= 18
- pnpm

### Pasos

1. Clonar el repositorio
```bash
git clone <repository-url>
cd asist_employed
```

2. Instalar dependencias
```bash
pnpm install
```

3. Configurar variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto:
```
VITE_SUPABASE_URL=<tu-url-supabase>
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```

4. Ejecutar en desarrollo
```bash
pnpm dev
```

5. Construir para producción
```bash
pnpm build
```

## Estructura del Proyecto

```
src/
├── components/
│   ├── Admin/              # Componentes del panel administrativo
│   ├── Auth/               # Componentes de autenticación
│   ├── Employee/           # Componentes para empleados
│   └── Shared/             # Componentes compartidos
├── types/                  # Definiciones de tipos TypeScript
├── utils/                  # Funciones utilitarias
├── supabase/
│   └── migrations/         # Migraciones de base de datos
├── App.tsx                 # Componente raíz
└── main.tsx                # Entrada de la aplicación
```



## Uso

### Para Empleados

1. Inicia sesión con tus credenciales
2. En el panel de empleado puedes:
   * Registrar entrada/salida
   * Ver tu historial de asistencia
   * Ver tu información de perfil

### Para Administradores

1. Inicia sesión con credenciales de administrador
2. En el panel administrativo puedes:
   * Crear nuevos empleados
   * Ver lista de todos los empleados
   * Consultar historial de asistencia diaria
   * Generar reportes

## Scripts Disponibles

* `pnpm dev` - Inicia servidor de desarrollo
* `pnpm build` - Construye la aplicación para producción
* `pnpm preview` - Previsualiza la compilación de producción
* `pnpm lint` - Ejecuta ESLint para verificar el código

## Licencia

Este proyecto está bajo licencia MIT privada. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## Autor

Proyecto desarrollado por sebastian forero

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request con tus cambios.
