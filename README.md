# Reporting Dashboard — Prueba Técnica

## Para Empezar

1. Leé **[INSTRUCTIONS.md](INSTRUCTIONS.md)** para los detalles completos de la prueba.

2. Instalá dependencias:
```bash
npm install
```

3. Configurá tu base de datos PostgreSQL y ejecutá el script de seed:
```bash
psql -U tu_usuario -d tu_base_de_datos -f database/seed.sql
```

4. Configurá Prisma para conectarte a la base de datos:
   - Asegurate de tener `DATABASE_URL` en tu `.env` apuntando a tu PostgreSQL.
   - Generá el cliente Prisma:
     ```bash
     npx prisma generate
     ```
   - Aplicá el esquema a la base de datos:
     ```bash
     npx prisma db push
     ```

5. Iniciá el servidor de desarrollo:
```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) para ver la app.

## Arquitectura y Decisiones Clave

La aplicación sigue una arquitectura híbrida server-side/client-side para optimizar la experiencia del usuario:

- **Carga Inicial (Server-Side)**: En `page.tsx`, se llama directamente a `getReportingData` con valores por defecto (últimos 7 días, métricas básicas) para renderizar datos inmediatamente sin esperar a la API. Esto asegura que el usuario vea contenido desde el primer load.

- **Interactividad (Client-Side)**: El componente `Reporting.tsx` maneja cambios en filtros (fechas y métricas) llamando al endpoint `/api/reporting` vía fetch. Esto permite actualizaciones dinámicas sin recargar la página.

- **Función de Reporting (`lib/reporting.ts`)**: 
  - Usa `Promise.all` para consultar en paralelo las tablas `google_ads_data`, `meta_ads_data` y `store_data`, filtradas por `account_id`/`store_id` y rango de fechas.
  - Une los datos en un `dailyMap` para crear un array `daily` con filas por fecha, asegurando que todas las fechas en el rango estén presentes (incluso si faltan datos).
  - Renombra columnas para evitar conflictos: por ejemplo, `spend` de Meta se convierte en `meta_spend`, y de Google en `google_spend`. Esto permite calcular métricas derivadas como `total_spend = meta_spend + google_spend`.
  - Calcula métricas usando definiciones funcionales (ej. `meta_cpm = (meta_spend / meta_impressions) * 1000`).
  - Retorna `totals` (agregados sobre el período) y `daily` (desglose diario).

- **UI con shadcn/ui**: Componentes como `Card`, `Table`, `DropdownMenu` para una interfaz limpia y compatible con modo oscuro (predeterminado).

## Pre-instalado

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (listo para usar — agregá componentes con `npx shadcn@latest add [componente]`)
- **Prisma** (ORM para PostgreSQL)
