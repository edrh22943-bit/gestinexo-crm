# Registro de Decisiones Técnicas

Este archivo sirve para que el Agente registre las decisiones importantes que toma, para que el dueño del proyecto (Dante Rojas) las revise cuando tenga tiempo.

## Formato
| Fecha | Decisión | Alternativas | Motivo |
|-------|----------|--------------|--------|

## Decisiones registradas
| Fecha | Decisión | Alternativas | Motivo |
|-------|----------|--------------|--------|
| 2026-11-16 | Usar `phone_e164` para contactos | String libre | E.164 es el estándar para WhatsApp |
| 2026-11-17 | Scaffold con `src/` + App Router + Tailwind v4 (Next 16) | App en raíz sin `src/`; Tailwind v3 | Alineado a create-next-app actual; alias `@/*` → `src/*` |
| 2026-11-17 | Vitest para tests unitarios de tenant | Jest; solo Playwright | Ligero para helpers de aislamiento multi-tenant en Fase 0 |
| 2026-11-17 | Route groups `(auth)` / `(dashboard)` + `api/webhooks/whatsapp` vacíos | Crear rutas reales ya | Reserva estructura del MVP sin UI ni endpoints prematuros |
| 2026-11-17 | Tabla `users` = membresía (`auth_user_id` + `organization_id` + `business_id` + role) | `profiles` separado + `memberships`; 1 user = 1 negocio | Un auth user puede pertenecer a varios negocios; roles MVP `admin`/`vendedor` |
| 2026-11-17 | RLS vía `is_business_member(org, business)` SECURITY DEFINER | Policies con JOIN directo a `users` | Evita recursión RLS al consultar `users`; misma regla en todas las tablas de negocio |
| 2026-11-17 | Tabla `pipeline_stages` además de `pipelines` | Solo `pipelines` + stage como texto en leads | MVP exige leads vinculados a etapas; etapas con `organization_id`+`business_id` y RLS |
| 2026-11-17 | Tests RLS con store in-memory que refleja policies (+ asserts del SQL) | Solo tests contra Supabase live / Docker Postgres | CI sin proyecto Supabase ni migraciones aplicadas; no se ejecutan migraciones sin autorización |
| 2026-11-17 | Clientes `@supabase/ssr` (browser/server) + admin service-role separado | Un solo cliente supabase-js | Cookies de sesión en App Router; service role nunca en frontend |
