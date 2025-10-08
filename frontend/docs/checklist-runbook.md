# Checklist de Release (PWA – 4 semanas)

> Usa esto como **lista de bloqueo** para el Go/No-Go. Todo ítem marcado es requisito para liberar.

## A. Código, calidad y seguridad

* [ ] Rama `release/x.y.z` creada y **tag** firmado.
* [ ] **Code freeze** aplicado (solo *hotfixes* aprobados).
* [ ] Lint + unit + component + **E2E críticos (incluye modo offline)** en verde.
* [ ] Auditoría de dependencias sin **vulnerabilidades altas** (SCA/SAST).
* [ ] Revisión de **headers** (CSP, HSTS, X-Frame-Options), **CORS** y políticas de cookies.
* [ ] **A11y**: sin errores críticos (axe) en pantallas clave.
* [ ] **Performance budget** cumplido (ej. LCP móvil ≤ 2.5s, bundle inicial ≤ 300KB gzip).

## B. PWA & Offline

* [ ] `manifest.json` válido (name, icons, start_url, display, categories).
* [ ] **Service Worker**: versión de caché incrementada (`CACHE_VERSION`), `skipWaiting` y `clientsClaim` configurados.
* [ ] Estrategias: **precache** app-shell; **runtime** cache para APIs con *stale-while-revalidate* o *network-first* según dato.
* [ ] **IndexedDB** migraciones aplicadas; seed de **datasets del día** probado.
* [ ] **Cola offline**: reintentos con *backoff*, deduplicación e **idempotency key** en requests.

## C. Backend / Contratos

* [ ] **OpenAPI** publicado para `GET /plan-de-ruta`, `POST /feedback`, `POST /quiebre`, `POST /inventario`.
* [ ] *Mocks* conmutables por **feature flag** o variable de entorno.
* [ ] **Health checks** OK; timeouts y *circuit breakers* validados.

## D. Infra & Observabilidad

* [ ] **CI/CD**: pipeline reproduce build de prod (hashes estáticos).
* [ ] Despliegue a **staging** exitoso con *smoke tests*.
* [ ] Dashboards operativos listos: **tasa de error**, **latencia**, **LCP**, **cola offline pendiente**, **sincronización final**.
* [ ] **Alertas** configuradas (severidad/umbral, horarios, canal).
* [ ] **Feature flags** definidos (por ejemplo: `ff_inteligencia_competencia`, `ff_geo_validacion`).

## E. UAT / Negocio / Comunicación

* [ ] **UAT** firmado (checklist por pantalla).
* [ ] **Runbook** actualizado y compartido con Soporte/Operaciones.
* [ ] Plan de comunicación: a usuarios, *stakeholders* y *on-call*.
* [ ] Plan de **rollback** probado en staging (ver Runbook).
* [ ] **Ventana de lanzamiento** y responsables confirmados.

---

## Pasos del día de Release

1. [ ] Verifica ventanas y *on-call* activo.
2. [ ] Crea **artefacto inmutable** (build reproducible, checksum).
3. [ ] **Deploy a staging**, correr *smoke suite* (login, sync inicial, lista del día, detalle→feedback, finalizar visita).
4. [ ] **Deploy a producción** (sin flags nuevos).
5. [ ] Validación canaria: 5–10% de tráfico / 1 región / 30–60 min.
6. [ ] **Habilita flags** progresivamente; monitoriza *dashboards* y alertas.
7. [ ] Si hay degradación: **apagado de flags ⇒ rollback** (ver Runbook).
8. [ ] **Anuncia “Release OK”** y deja Hypercare activo 72h.

---

# Runbook de Operación

## 1. Resumen del servicio

* **Tipo:** PWA offline-first para visitas en campo.
* **Flujos críticos:** Login, **Sincronización inicial**, Lista del día (con “porqué”), **Detalle/Feedback**, **Finalizar visita (geo + hora)**, **Sincronización final**.
* **Datos locales:** IndexedDB (`PlanDeRuta`, `Tareas`, `FeedbackPendiente`).
* **Flags relevantes:** `ff_inteligencia_competencia`, `ff_geo_validacion`, `ff_apis_mock`.

## 2. SLI/SLO operativos

* **Disponibilidad API**: ≥ 99.5%.
* **Latencia `GET /plan-de-ruta` p95**: ≤ 600 ms.
* **Tasa de éxito de sincronización final**: ≥ 98%.
* **Backlog cola offline p95** (elementos pendientes por usuario): ≤ 2 al cierre del día.
* **LCP móvil p75**: ≤ 2.5 s.

## 3. Entornos & accesos

* **Staging**: pruebas y *canaries*.
* **Producción**: *feature flags* para activar capacidades.
* Accesos: despliegue (DevOps), observabilidad (Ops/Soporte), *feature flags* (PM/Tech Lead).

## 4. Despliegue

**Despliegue estándar (CI/CD)**

1. Ejecutar pipeline `deploy-prod` con artefacto `x.y.z`.
2. Validar health checks, versiones de assets y SW activo.
3. Realizar *smoke tests* (GUI o E2E rápidos).
4. Habilitar flags según plan (canario → total).

**Checklist post-deploy**

* [ ] App instalable; SW actualizado en `chrome://serviceworker-internals`/DevTools.
* [ ] Sin errores 5xx o picos de latencia.
* [ ] Métricas de cola offline estables.
* [ ] UAT rápido en 2–3 dispositivos reales (Android gama media).

## 5. Rollback

### 5.1 Rollback lógico (recomendado)

1. **Apaga flags** de la funcionalidad problemática.
2. Si persiste, **redirige** tráfico a la revisión anterior (o reduce canario a 0%).
3. Verifica dashboards y errores; comunica a canal de incidentes.

### 5.2 Rollback de artefacto

1. Desplegar **versión anterior x.y.(z-1)** (artefacto inmutable).
2. Validar *smoke tests*.
3. Forzar **actualización de SW** (si aplica):

   * Publica SW `CACHE_VERSION--` (volver a versión previa) o SW “neutralizador” que **limpia caches** y rehúsa a *claimar* clientes hasta nueva publicación.
4. Comunicar a usuarios si se requiere recargar/ reinstalar PWA.

> Nota: el **Service Worker** hace que el rollback sea distinto a un sitio web tradicional. Mantén **dos SW** listos: el de la versión estable y un **SW de emergencia** que borra caches (`caches.keys() → caches.delete`) y muestra un banner de actualización.

## 6. Observabilidad y alertas

**Dashboards mínimos**

* API: tasa de error, latencia p95, *throughput*.
* Front: JS errors, **LCP**, **CLS**, **FCP**, tasa de instalación PWA.
* Offline: **cola pendiente**, tasa de reintentos, éxito/fracaso de sincronización final.
* Negocio: visitas completadas, feedbacks enviados, ratio rechazos.

**Alertas sugeridas**

* Error rate > 2% (5 min).
* Latencia `plan-de-ruta` p95 > 800 ms (5 min).
* **Backlog cola offline** > 10 durante 30 min (por cohorte).
* Fallos de geolocalización > 20% en finalizar visita (por versión/OS).
* Caída en instalaciones PWA día-a-día > 50%.

## 7. Playbooks de incidentes

### 7.1 “La app carga, pero datos del día no aparecen”

**Síntomas:** lista vacía / datasets desfasados.
**Acciones:**

1. Verifica salud de `GET /plan-de-ruta`.
2. Revisa **migración IndexedDB** en clientes (errores en consola).
3. Indica *workaround*: botón “Reintentar sincronización”.
4. Si es generalizado: **apaga flag** de mejoras recientes de sync y reintenta.
5. Abre *hotfix* si hay cambio de contrato.

### 7.2 “Cola offline crece y no se vacía”

**Síntomas:** `FeedbackPendiente` sube; reintentos fallan.
**Acciones:**

1. Confirma disponibilidad de `POST /feedback`.
2. Revisa **idempotency key** y respuestas 409/429.
3. Eleva *backoff* vía config; habilita *drain mode* (subir concurrencia) si API aguanta.
4. Comunica a campo: mantener app abierta en Wi-Fi para drenar.

### 7.3 “Usuarios no pueden iniciar sesión”

**Síntomas:** 401/403, múltiples reintentos.
**Acciones:**

1. Chequea proveedor de identidad / expiración de tokens.
2. Despliega *hotfix* de refresh token si aplica.
3. Activa **modo lectura** (acceso offline a datos del día) y comunica.

### 7.4 “Geolocalización falla al finalizar visita”

**Síntomas:** error de permisos o precisión.
**Acciones:**

1. Verifica permisos del navegador y HTTPS.
2. Baja temporalmente el umbral de precisión por **flag**.
3. Permite *graceful degradation* (captura manual + justificativo) por flag.

### 7.5 “Degradación de performance en móviles”

**Síntomas:** LCP alto, bloqueos.
**Acciones:**

1. Inspecciona *long tasks* y tamaño de bundle.
2. Activa **variantes ligeras** por flag (sin mapas, sin animaciones).
3. Rehabilita *code splitting* agresivo o desactiva módulos pesados.

### 7.6 “Service Worker desactualizado o bug en caché”

**Síntomas:** UI vieja, recursos 404, *mixed versions*.
**Acciones:**

1. Verifica `serviceWorker` versión en header/DevTools.
2. Publica **SW de emergencia** que limpia caches y fuerza *update*.
3. Comunica a usuarios: “Recargar” o reiniciar PWA.

### 7.7 “Errores 5xx en API de inteligencia de mercado”

**Acciones:**

1. Apaga `ff_inteligencia_competencia`.
2. Mantén **quiebre** e **inventario propios** si son estables; si no, modo **solo captura local** (pendiente a cola).
3. Coordina con equipo de datos para *rollback*.

## 8. Mantenimiento preventivo

* **Rotación de secretos** (trimestral o ante incidente).
* Limpieza de **caches** viejas vía SW (cada release).
* Revisión de **presupuesto de performance** y a11y (mensual).
* Revisión de **contratos** y pruebas de compatibilidad (por release).
* Auditoría de permisos (geo, notificaciones).

## 9. Gestión de cambios y comunicación

* Plantilla de **RFC/CR** con impacto, riesgo y plan de rollback.
* Canales: `#release`, `#incident`, correo a usuarios clave.
* Formato de aviso a campo: “qué cambia”, “beneficio”, “si falla, qué hacer”.

## 10. Contactos y escalación

* **On-call técnico** (24x7 en ventana de hypercare, horario laboral después).
* **Escalación**: Soporte → Tech Lead → Arquitectura/Seguridad → Dirección.
* **Tiempos objetivo**: Triage 15’, contención 60’, resolución 4h.

---

## Anexos (plantillas rápidas)

**Banner de modo offline** (texto recomendado)

> “Estás sin conexión. Puedes seguir trabajando; enviaremos automáticamente cuando vuelva la red.”

**Mensaje de cola atascada**

> “Tenemos envíos pendientes. Mantén la app abierta con conexión estable para sincronizar.”

**Criterios de Smoke Test post-deploy**

* Login OK.
* **Sync inicial** descarga datasets (contador > 0).
* Lista del día muestra 3+ clientes con “porqué”.
* **Detalle** permite registrar **feedback** y queda **pendiente** si corto red.
* **Finalizar visita** con geo y sync final exitoso.

