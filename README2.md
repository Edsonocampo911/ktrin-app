# KTRIN - Sistema Operativo de Eventos

> Gestión digital de eventos con validación QR. Profesionalizando el sector de eventos en Paraguay.

## 🚀 Características Principales

- **Gestión de Eventos:** Crea y administra eventos de manera profesional
- **Validación QR:** Sistema seguro de validación de servicios mediante códigos QR
- **Soporte Multi-rol:** Organizadores, proveedores y invitados
- **PWA:** Funciona como aplicación web progresiva
- **Responsive:** Diseño adaptable a todos los dispositivos
- **Tema Oscuro:** Soporte para modo oscuro

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Navegador moderno

## 🔧 Instalación

1. **Clonar el repositorio:**
```bash
git clone <repo-url>
cd ktrin-app
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🏃 Desarrollo

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Luego abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🏗️ Build para Producción

```bash
npm run build
npm start
```

## 📦 Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)          # Páginas de autenticación
│   ├── (organizer)     # Rutas para organizadores
│   ├── (provider)      # Rutas para proveedores
│   ├── (guest)         # Rutas para invitados
│   └── api/            # Rutas API
├── components/
│   ├── qr/            # Componentes de QR
│   ├── shared/        # Componentes compartidos
│   └── ui/            # Componentes UI (Shadcn)
├── lib/
│   └── supabase/      # Cliente y configuración de Supabase
├── stores/            # Estados globales (Zustand)
└── types/             # Tipos TypeScript
```

## 🔐 Seguridad

- Validaciones de autenticación en el servidor
- Proteción de rutas sensibles
- Variables de entorno seguras
- Rate limiting recomendado en producción

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Settings
3. Deploy automático en cada push a main

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Variables de Entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=          # URL de tu proyecto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Clave anónima de Supabase
SUPABASE_SERVICE_ROLE_KEY=         # (Opcional) Clave de servicio

# App
NEXT_PUBLIC_APP_VERSION=            # Versión de la app
NEXT_PUBLIC_APP_NAME=               # Nombre de la app
```

## 🧪 Testing

Ejecuta tests:

```bash
npm run test
```

## 🐛 Solución de Problemas

### Error de permisos de cámara
- Asegúrate de que el navegador tiene permisos de cámara
- Recarga la página después de permitir permisos
- Intenta con HTTPS (requerido para acceso a cámara)

### Errores de autenticación
- Verifica que tus variables de entorno son correctas
- Asegúrate de que el usuario existe en Supabase
- Revisa los logs de Supabase para más detalles

### Build errors
- Asegúrate de que instalaste todas las dependencias: `npm install`
- Limpia el caché: `rm -rf .next node_modules`
- Reinstala dependencias: `npm install`

## 🤝 Contribuyendo

```bash
# Crea una rama de feature
git checkout -b feature/nombre-feature

# Haz tus cambios y commits
git commit -am 'Describe tus cambios'

# Push a tu rama
git push origin feature/nombre-feature

# Abre un Pull Request
```

## 📄 Licencia

Todos los derechos reservados © 2026 KTRIN. Contacta con el equipo para más información.

## 📧 Soporte

Para reportar bugs o sugerencias, contacta con el equipo de desarrollo.

---

**Última actualización:** 22 de Marzo de 2026  
**Versión:** 1.0.0
