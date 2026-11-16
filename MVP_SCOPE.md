# Alcance del MVP

## Lo que SÍ está incluido en el MVP (Fase 1)
- [ ] Autenticación con Supabase Auth (email/password).
- [ ] Modelo multi-tenant: organizaciones, negocios, miembros.
- [ ] RLS en todas las tablas de negocio.
- [ ] CRUD de contactos (con campos básicos: nombre, teléfono, email).
- [ ] CRUD de embudos (pipelines) y etapas.
- [ ] CRUD de oportunidades (leads) vinculadas a contactos y etapas.
- [ ] Integración básica con WhatsApp: recibir webhook, enviar mensaje de texto.
- [ ] Registro básico de mensajes enviados/recibidos (para el módulo de costos).
- [ ] Dashboard simple: conteo de contactos y oportunidades.

## Lo que NO está incluido (no construir todavía)
- ❌ Inteligencia Artificial (asistente, clasificación, resúmenes).
- ❌ Automatizaciones avanzadas (reglas condicionales).
- ❌ Integración con Meta Ads / Facebook Lead Ads.
- ❌ SaaS self-service (pagos, suscripciones, facturación SUNAT).
- ❌ Conciliación automática de costos con Meta.
- ❌ Múltiples números de WhatsApp por negocio.
- ❌ Roles y permisos avanzados (solo admin/vendedor por ahora).

## Regla de oro
Si una tarea no está en la lista "SÍ incluido", el agente debe preguntar antes de implementarla.
