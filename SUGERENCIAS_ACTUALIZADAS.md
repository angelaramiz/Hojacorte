# Actualización de Sistema de Sugerencias 🎯

## Resumen de Cambios

Se implementó un nuevo sistema de sugerencias **separadas y específicas** para cada etapa del corte, reemplazando la lógica anterior que solo calculaba una sugerencia genérica.

---

## Tres Tipos de Sugerencias

### 1️⃣ **SUGERENCIA DE FONDO** - `generarSugerenciaFondo()`
**Prioridad:** Monedas y billetes pequeños  
**Objetivo:** Armar el fondo usando principalmente:
- ✅ Monedas (¢50, $1, $2, $5, $10)
- ✅ Billetes pequeños ($20, $50)
- ✅ Vales/Bolsas

**Ejemplo:**
```
Monedas (Prioridad):
¢50 x 10 = $5.00
$1 x 20 = $20.00
$5 x 8 = $40.00

Billetes Pequeños:
$20 x 3 = $60.00
$50 x 1 = $50.00

Total Fondo: $175.00
```

---

### 2️⃣ **SUGERENCIA DE CORTE** - `generarSugerenciaCorte()`
**Prioridad:** Billetes grandes (después de restar el fondo)  
**Objetivo:** Usar billetes grandes para facilitar el pago/depósito:
- ✅ Billetes grandes ($100, $200, $500, $1000)
- ✅ Billetes medianos ($50)
- ⚠️ Monedas solo si es necesario para completar

**Ejemplo:**
```
Billetes (Prioridad):
$1000 x 2 = $2000.00
$500 x 1 = $500.00
$100 x 5 = $500.00

Total Corte: $3000.00
```

---

### 3️⃣ **SUGERENCIA DE PROPINA** - `generarSugerenciaPropina()`
**Prioridad:** Billetes medianos a grandes  
**Objetivo:** Sugerir billetes fáciles de entregar como propina:
- ✅ Billetes grandes ($100, $200, $500)
- ✅ Billetes medianos ($50)
- ❌ Monedas (no se consideran)

**Ejemplo:**
```
Billetes Recomendados:
$100 x 2 = $200.00
$50 x 1 = $50.00

Total Propina: $250.00
```

---

## Flujo de Ejecución

```
Usuario hace clic en "Sugerir Fondo"
        ↓
1. Obtener inventario disponible (monedas + billetes + vales)
        ↓
2. Generar SUGERENCIA DE FONDO (con monedas y billetes pequeños)
        ↓
3. Calcular items restantes (después de restar fondo)
        ↓
4. Generar SUGERENCIA DE CORTE (con billetes grandes del inventario restante)
        ↓
5. Generar SUGERENCIA DE PROPINA (con billetes grandes del inventario restante)
        ↓
Modal con 3 PESTAÑAS:
  ├─ Pestaña 1: Fondo
  ├─ Pestaña 2: Corte
  └─ Pestaña 3: Propina
```

---

## Cambios en el Código

### `calculations.js`

**Nuevas funciones:**
```javascript
// Genera sugerencia de fondo con prioridad a monedas y billetes pequeños
export function generarSugerenciaFondo(items, fondoObjetivo)

// Genera sugerencia de corte con prioridad a billetes grandes
export function generarSugerenciaCorte(items, corteObjetivo)

// Genera sugerencia de propina con billetes medianos a grandes
export function generarSugerenciaPropina(items, propinaObjetivo)

// Mantiene compatibilidad con código existente
export function generarSugerencia(items, fondoObjetivo, priorizarMonedas)
```

### `main.js`

**Función actualizada:**
```javascript
function sugerirFondo()
  └─ Ahora calcula TRES sugerencias independientes
  └─ Cada una con su propia prioridad
  └─ Calcula items restantes entre sugerencias
  └─ Muestra tres pestañas en modal
```

### `ui.js`

**Nuevas funciones de generación de mensajes:**
```javascript
export function generarMensajeFondo(sugerencia, fondoObjetivo)
export function generarMensajeCorteRecomendado(sugerencia, corteObjetivo)
export function generarMensajePropina(sugerencia, propinaObjetivo)
```

---

## Mejoras Implementadas

| Aspecto | Antes | Después |
|--------|-------|---------|
| **Sugerencias** | 1 genérica | 3 específicas |
| **Fondo** | Sin prioridad clara | Monedas + billetes pequeños |
| **Corte** | Mismo algoritmo | Billetes grandes |
| **Propina** | No diferenciado | Billetes medianos-grandes |
| **UI** | 1 solo resultado | 3 pestañas navegables |
| **Orden** | Mochila (knapsack) | Descendente por denominación |

---

## Cómo Usar

1. **Inicia un corte** con "Iniciar Corte"
2. **Ingresa todos los datos** (monedas, billetes, tarjetas, gastos)
3. **Haz clic en "Sugerir Fondo"**
4. **Modal aparece con 3 pestañas:**
   - **Pestaña 1 - FONDO:** Cómo armar el fondo óptimo
   - **Pestaña 2 - CORTE:** Cómo hacer el corte de efectivo
   - **Pestaña 3 - PROPINA:** Billetes sugeridos para propina

---

## Notas Técnicas

- ✅ Compatibilidad hacia atrás mantenida
- ✅ Lógica clara y separada por responsabilidad
- ✅ Prioridades definidas por denominación
- ✅ Errores de sintaxis: **CERO**
- ✅ Modular y fácil de mantener

---

## Próximos Pasos (Opcional)

- Agregar persistencia de sugerencias en localStorage
- Implementar historial de sugerencias anteriores
- Agregar gráficos de distribución de denominaciones
- Permitir ajustes manuales de prioridades

---

**Commit:** `fff3fed`  
**Fecha:** 11 de enero de 2026  
**Estado:** ✅ Listo para usar
