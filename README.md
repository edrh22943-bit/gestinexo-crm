# gestinexo-crm

CRM multiempresa para Gestinexo.

## Stack (Fase 0)

- Next.js (App Router) + TypeScript (strict) + Tailwind CSS
- Destino: Supabase (Auth + PostgreSQL + RLS) y Vercel

## Scripts

```bash
npm install
npm run dev      # desarrollo local
npm run build    # verificación de compilación
npm test         # tests unitarios (aislamiento multi-tenant)
npm run lint
```

## Estructura base

```
src/
  app/                  # App Router (rutas, API)
    (auth)/             # reservado: autenticación
    (dashboard)/        # reservado: UI de producto
    api/webhooks/whatsapp/  # reservado: webhook WhatsApp
  components/           # componentes UI (aún vacíos)
  hooks/
  lib/
    supabase/           # clientes Supabase (pendiente)
    tenant/             # helpers de alcance multi-tenant
  types/
```

Documentación de alcance: `MVP_SCOPE.md`. Decisiones: `DECISIONS.md`. Reglas del agente: `.cursor/rules`.
