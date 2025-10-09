# Plan comprimido de 4 semanas (PWA web – React+Vite)

**Objetivo:** app en **producción** con los flujos críticos instalable como PWA y operable **offline-first**, telemetría básica y runbook de operación.

---

## Jalones (milestones) y criterios de salida

**M1 – Walking skeleton en prod (fin Semana 1)**

* CI/CD funcionando (build, lint, tests, deploy automático a *staging*/*prod* protegidos).
* App-shell PWA (manifest + SW) y *routing* base; login funcional (mock o real).
* **Sincronización inicial** guarda datasets del día en IndexedDB.
* Observabilidad mínima (logs estructurados + métricas de disponibilidad).
  **Criterios:** SW registrado, app instalable; lista del día visible con datos simulados o reales.

**M2 – Primer slice E2E (fin Semana 2)**

* Flujos: **Detalle cliente → Registrar feedback → Finalizar visita (geo + hora)**, online y **offline con cola de reintentos**.
* Contratos de API estabilizados (OpenAPI) para *plan-de-ruta* y *feedback*.
  **Criterios:** E2E pasa en *staging* (Playwright); reintento funciona si corto la red.

**M3 – Núcleo completo + hardening (fin Semana 3)**

* Inteligencia de mercado: **Quiebre stock** e **Inventario propios**; (Competencia = *Should*, sujeto a capacidad).
* Performance y a11y base (presupuesto inicial de bundle y contraste/tamaños táctiles).
  **Criterios:** LCP móvil objetivo (p.ej. ≤2.5s en Android medio), axe sin errores críticos, app usable completamente offline durante una jornada.

**M4 – Release + Hypercare (fin Semana 4)**

* UAT en campo firmado, **Runbook** y **Checklist de release** cerrados, *feature flags* definidos.
* **Go-live** a producción y 3 días de monitoreo intensivo con alertas.
  **Criterios:** tasa de error <2%, tiempo de sincronización dentro de SLA acordado, métricas de negocio visibles.

---

## Calendario por semanas (timeboxes)

### Semana 1 — Habilitación + Sync inicial

* Kickoff, cierre de MVP y **cut-list** (Must/Should/Could).
* CI/CD (lint, test, build, despliegues), *feature flags*, gestión de secretos.
* PWA: manifest, íconos, **Service Worker (app-shell cache-first)**.
* IndexedDB: esquema (`PlanDeRuta`, `Tareas`, `FeedbackPendiente`).
* Pantallas: **Login**, **Preparación/Sync inicial**, **Lista del día** (con “porqué” de visita).
* Telemetría base (traza de sync, errores de UI, *heartbeat*).
  **Entregables:** M1, OpenAPI borrador, guía de *branching* y *DoD*.

### Semana 2 — Slice crítico E2E

* Pantallas: **Detalle cliente** y **Registrar feedback**.
* **Cola offline** (enqueue, backoff, resume) + estados de UI (offline/sincronizando/pendiente).
* **Finalizar visita** (validación geográfica sencilla + notas).
* Endpoints/contratos estabilizados; *mocks* conmutables a real.
* E2E (Playwright) para el slice completo.
  **Entregables:** M2, OpenAPI v1, reporte E2E, tablero con defectos priorizados.

### Semana 3 — Inteligencia de mercado + Hardening

* Flujos: **Quiebre stock** y **Inventario propios** (Competencia si hay capacidad).
* Optimización **perf móvil** (código dividido, imágenes, prefetch), a11y (axe, focus, tamaños táctiles).
* Resiliencia de sync: conflictos y *idempotency*.
* Seguridad: revisión básica (CORS, headers, auth flows).
  **Entregables:** M3, presupuesto de performance cumplido, checklist a11y base.

### Semana 4 — UAT, release y operación

* **UAT en campo** (scripts de prueba por pantalla) y correcciones.
* **Runbook** (salud, rollback, *feature toggles*, KPIs), **Checklist de release**.
* Carga/incidencias: pruebas con dataset realista, alertas y tableros.
* **Go/No-Go**, despliegue, *hypercare* 72h.
  **Entregables:** M4, RC firmado, *postmortem* corto de salida.

---

## WBS (nivel 1–2)

1. **Gestión y Producto**
   1.1 Cierre de MVP + *cut-list*
   1.2 Roadmap 4 semanas + gobernanza (rituales, riesgos, comunicación)
   1.3 Preparación de UAT (scripts, datos, criterios de aceptación)

2. **Frontend PWA (React+Vite)**
   2.1 App-shell, routing, estado, diseño responsivo
   2.2 **Service Worker** (precache, runtime cache), manifest e instalación
   2.3 **IndexedDB** (modelo, migraciones, repositorios)
   2.4 UI críticas: Login, Sync inicial, Lista del día
   2.5 UI slice 1: Detalle cliente, Registrar feedback, Finalizar visita
   2.6 UI slice 2: Quiebre e Inventario (propios; competencia = *Should*)
   2.7 Accesibilidad y performance (presupuesto, medición en CI)

3. **Backend/API**
   3.1 Auth y sesión
   3.2 **Plan de ruta** (GET)
   3.3 **Feedback** (POST con idempotencia)
   3.4 **Intel. mercado** (quiebre/inventario)
   3.5 Telemetría/ingesta (logs/métricas)
   3.6 *Mocks* + *switch* a servicios reales

4. **Sync & Offline**
   4.1 Estrategias de caché (app-shell, datos del día)
   4.2 **Cola offline** (persistencia, backoff, dedupe)
   4.3 Resolución de conflictos y *reconciliation*

5. **DevOps & Infra**
   5.1 CI/CD, *feature flags*, entornos
   5.2 Observabilidad (dashboards, alertas)
   5.3 Seguridad (CSP, headers, secretos)

6. **Calidad**
   6.1 Unit/Component (vitest)
   6.2 E2E (Playwright, escenarios offline)
   6.3 UAT y pruebas de campo

7. **Salida a Producción**
   7.1 **Runbook** y **Checklist de release**
   7.2 Go-live y *hypercare*
   7.3 *Post-release review*

---

## Dependencias y camino crítico

* Contratos **Plan de ruta** y **Feedback** (bloquean slice S2).
* Esquema de **IndexedDB** (bloquea Sync inicial y cola).
* CI/CD y entornos (bloquean M1 y despliegues continuos).
* Dataset realista para UAT (bloquea firma de M4).

---

## Definiciones de calidad (DoR/DoD resumidas)

* **DoR historia:** contrato/diseño enlazado, criterios de aceptación claros, *flags* definidos.
* **DoD historia:** tests unitarios, accesibilidad sin críticos, telemetría, estados offline, *review* UX.
* **DoD release:** PWA instalable, navegación **offline** de flujos clave, LCP móvil ≤ objetivo, alertas operativas activas, rollback verificado.

---

## Riesgos principales y mitigación

* **Integraciones tardías** → *Mocks* desde S1 y *switch* por env/flag.
* **Complejidad offline** → limitar a datasets del día y cola simple; conflictos resueltos por “último éxito” + idempotencia.
* **Perf en móviles de gama media** → presupuesto temprano (S1), medición en CI y *budget gates*.
* **UAT con datos insuficientes** → preparar *fixtures* desde S2, pilotos cortos en S4.
* **Scope creep** → *cut-list* pública; Competencia pasa a *Should* si M2 resbala.

---

## Cut-list (gestión de alcance)

* **Must:** Login, Sync inicial, Lista del día (+“porqué”), Detalle, Feedback, Finalizar visita, Sync final, PWA instalable/offline, telemetría básica.
* **Should:** Quiebre e Inventario propios, validación geográfica básica.
* **Could:** Inventario competencia, KPIs avanzados, personalización.

---

## Rituales y visibilidad

* *Daily* 15’ (bloqueos, foco del día).
* *Planning* semanal (2h) + *Review* (1h) + *Retrospective* (45’).
* Tablero con **M1–M4** y *burn-up* de Must/Should.

---

## Checklist de salida (resumen)

* [ ] PWA instalable + SW activo.
* [ ] App utilizable **offline** todo el día; cola vacía al recuperar conexión.
* [ ] OpenAPI publicado; *healthchecks* verdes.
* [ ] E2E verdes en flujos críticos (incluye cortes de red).
* [ ] Runbook: *feature flags*, métricas, rollback, contactos de guardia.
* [ ] Aprobación UAT y *Go/No-Go* firmado.
