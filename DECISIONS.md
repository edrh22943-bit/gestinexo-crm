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
