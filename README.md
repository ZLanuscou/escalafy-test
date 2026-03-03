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

4. Iniciá el servidor de desarrollo:
```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) para ver la app.

## Pre-instalado

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (listo para usar — agregá componentes con `npx shadcn@latest add [componente]`)
