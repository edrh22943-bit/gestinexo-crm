# gestinexo-crm

CRM multiempresa para Gestinexo.

## Stack

- Next.js (App Router) + TypeScript (strict) + Tailwind CSS
- Supabase (Auth + PostgreSQL + RLS) — clientes y migraciones Fase 1
- Destino de deploy: Vercel

## Scripts

```bash
npm install
npm run dev      # desarrollo local
npm run build    # verificación de compilación
npm test         # tests (tenant scope + aislamiento RLS A↛B)
npm run lint
```

## Variables de entorno

Copia `.env.example` → `.env.local` y completa valores de tu proyecto Supabase.
Nunca expongas `SUPABASE_SERVICE_ROLE_KEY` al cliente.

## Migraciones

SQL en `supabase/migrations/`. **No aplicar a producción sin autorización explícita** (ver `.cursor/rules`).

## Estructura base

```
supabase/migrations/    # schema + RLS (Fase 1)
src/
  app/                  # App Router (rutas, API)
    (auth)/             # reservado: autenticación
    (dashboard)/        # reservado: UI de producto
    api/webhooks/whatsapp/  # reservado: webhook WhatsApp
  components/
  hooks/
  lib/
    supabase/           # client / server / admin
    rls/                # helpers + tests de aislamiento
    tenant/             # assertTenantScope / toTenantFilter
  types/
```

Documentación de alcance: `MVP_SCOPE.md`. Decisiones: `DECISIONS.md`. Reglas del agente: `.cursor/rules`.
