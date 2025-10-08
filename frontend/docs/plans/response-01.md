  ✅ Respuesta a tu Pregunta: ¿Cuál Opción?

  Ninguna de las 3. Propongo Opción 4 (Mejorada):

  Para M1 - Plan Estructurado:

  Sesión 1: Especificación de Componentes (AHORA - 1 hora)

  Crear:
  - docs/specs/components/design-tokens-spec.md
  - docs/specs/components/button-spec.md
  - docs/specs/components/input-spec.md
  - docs/specs/components/form-field-spec.md
  - docs/specs/components/alert-spec.md

  Cada spec debe incluir:
  - TypeScript interface completo
  - Props con descripción
  - Variantes visuales
  - Estados (hover, focus, disabled, error)
  - Accessibility requirements
  - Ejemplos de uso

  Sesión 2: Especificación de US-A1 (1 hora)

  Crear:
  - docs/specs/features/us-a1-login-spec.md

  Debe incluir:
  - User flow (paso a paso)
  - Wireframe/descripción de UI
  - Validaciones (campo requerido, formato)
  - Estados (loading, error, success)
  - Offline behavior
  - IndexedDB schema para sesión
  - API contract (mock)
  - Test scenarios

  Sesión 3: Implementar Componentes (2 horas)

  # Seguir specs EXACTAMENTE
  # Si surge duda → Volver a spec y clarificar
  # Checkpoints cada componente

  Sesión 4: Implementar US-A1 (2-3 horas)

  # Seguir spec de US-A1
  # Usar componentes ya implementados
  # Checkpoints: ¿Funciona? ¿Tests pasan?

  ---
  🎯 Ventajas de Este Enfoque

  1. Foco Claro

  - Siempre sabes: "Estoy en Sesión X, implementando Y según spec Z"
  - Si Claude se desvía → "Wait, check the spec"

  2. Recovery Fácil

  - Nueva sesión? → Leer master-plan.md y spec actual
  - Contexto perdido? → Spec tiene toda la info

  3. Consistencia

  - Specs previenen decisiones ad-hoc
  - Todos los componentes siguen mismo patrón

  4. Verificable

  - Spec = Contrato
  - Implementación cumple contrato o no (binario)

  5. Documentación Automática

  - Specs sirven como documentación
  - Nuevos devs leen specs, entienden sistema

  ---
  🔧 Herramientas Adicionales

  1. Master Plan (Living Document)

  # Master Plan - M1 Week 1

  ## Current Status:
  **US-A1 Login - Step 2/5: Implementing components**

  ## Completed:
  - [x] Prototype analysis
  - [x] Component inventory
  - [x] Recommendations document

  ## In Progress:
  - [ ] Component specs (Button, Input, FormField, Alert, Icon)

  ## Next:
  - [ ] US-A1 specification
  - [ ] Component implementation
  - [ ] US-A1 implementation
  - [ ] US-B1 specification
  - ...

  ## Blockers:
  None

  ## Decisions Log:
  - 2025-09-30: Decided on contract-first approach
  - 2025-09-30: 5 components for phase 0

  2. Checkpoint Prompts

  Cada 30-45 min, preguntarte:
  1. ¿Estoy siguiendo el plan actual?
  2. ¿He completado lo que dice la spec?
  3. ¿Necesito actualizar algún documento?
  4. ¿Qué sigue según master-plan.md?

  3. Template para Specs

  Usar plantillas consistentes para todos los specs

  ---
  💡 Respondiendo Directamente

  ¿Estás en lo correcto?

  ✅ SÍ, 100%. La estrategia de especificar antes de implementar es correcta.

  ¿Crear definiciones antes?

  ✅ SÍ, CRÍTICO. Especialmente interfaces TypeScript. Esto previene inconsistencias.

  ¿Mejores formas de usar Claude?

  ✅ SÍ:
  1. Sesiones cortas y focalizadas (1-2 horas max)
  2. Un objetivo por sesión (spec O implementation, no ambos)
  3. Documentar TODO antes de codificar
  4. Referencias constantes a specs durante implementación
  5. Usar TODO lists activamente
  6. Checkpoints explícitos

  ---
  🚀 Mi Recomendación Para AHORA

  Opción 4 (la mejor):

  Sesión ACTUAL (próximos 60 min):
  1. Crear design tokens spec (15 min)
  2. Crear Button spec (10 min)
  3. Crear Input spec (10 min)
  4. Crear FormField spec (10 min)
  5. Crear Alert spec (10 min)
  6. Guardar en docs/specs/components/
  7. DETENER sesión, revisar specs

  Sesión SIGUIENTE:
  1. Revisar specs
  2. Aprobar o ajustar
  3. Implementar componentes siguiendo specs
  4. Verificar contra specs

  Esto te da:
  - 🎯 Foco claro
  - 📋 Documentación de referencia
  - ✅ Criterios de éxito claros
  - 🔄 Punto de recuperación si te pierdes

  ---
  ¿Procedemos con crear las specs de componentes primero?

  Esto es MUY recomendable antes de escribir una línea de código.
