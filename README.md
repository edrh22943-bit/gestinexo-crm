# gestinexo-crm

CRM multiempresa para Gestinexo.

## Stack

- Next.js (App Router) + TypeScript (strict) + Tailwind CSS
- Supabase (Auth + PostgreSQL + RLS)
- Destino de deploy: Vercel

## Scripts

```bash
npm install
npm run dev      # desarrollo local
npm run build    # verificación de compilación
npm test         # tests (tenant scope + aislamiento RLS A↛B + payloads)
npm run lint
```

## Variables de entorno

Copia `.env.example` → `.env.local` y completa valores de tu proyecto Supabase.
Nunca expongas `SUPABASE_SERVICE_ROLE_KEY` al cliente.
`SUPABASE_SERVICE_ROLE_KEY` es necesaria en el servidor para el bootstrap de
organización/negocio al registrarse.

## Cómo probar (Fase 2)

1. Configura `.env.local` con URL, anon key y service role.
2. `npm run dev` → abre `/register`.
3. Crea cuenta (organización + negocio). Si Auth exige confirmar email, confírmalo y entra en `/login`.
4. En `/dashboard` verás conteos; en `/contacts` y `/leads` el CRUD.
5. Teléfono de contacto en E.164 (ej. `+51987654321`).

## Migraciones

SQL en `supabase/migrations/`. **No aplicar a producción sin autorización explícita** (ver `.cursor/rules`).

## Estructura

```
supabase/migrations/    # schema + RLS (Fase 1)
src/
  proxy.ts              # refresh sesión + guards (Next 16)
  app/
    (auth)/             # login / registro
    (dashboard)/        # dashboard, contactos, leads
    api/webhooks/whatsapp/  # reservado: webhook WhatsApp
  components/
  lib/
    auth/               # sesión + membresía activa
    contacts/ leads/    # payloads con tenant scope
    supabase/           # client / server / admin / proxy
    rls/                # helpers + tests de aislamiento
    tenant/             # scope + bootstrap registro
  types/
```

Documentación de alcance: `MVP_SCOPE.md`. Decisiones: `DECISIONS.md`. Reglas del agente: `.cursor/rules`.
