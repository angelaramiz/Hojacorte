# Archivo Aislado de Sugerencias: `src/suggestions.js` 📋

## Propósito

Centralizar toda la lógica de cálculo de sugerencias (fondo, corte, propina) en un archivo separado para:
- ✅ Facilitar debugging
- ✅ Mejorar legibilidad
- ✅ Permitir iteraciones y mejoras
- ✅ Evitar mezclar lógica en múltiples archivos

---

## Estructura del Archivo

```
src/suggestions.js
├─ generarSugerenciaFondo(items, fondoObjetivo)
│  └─ Calcula sugerencia para llenar fondo
│
├─ generarSugerenciaCorte(items, corteObjetivo)
│  └─ Calcula sugerencia para corte restante
│
├─ generarSugerenciaPropina(items, propinaObjetivo)
│  └─ Calcula sugerencia para propina
│
├─ generarSugerenciasCompletas(items, fondoObj, corteObj, propinaObj)
│  └─ Orquestación: ejecuta las 3 sugerencias en secuencia
│
├─ restarInventario(itemsDisponibles, itemsUsados)
│  └─ Calcula inventario restante
│
└─ calcularTotalSugerencia(sugerencia)
   └─ Suma el total de una sugerencia
```

---

## Funciones Principales

### 1. `generarSugerenciaFondo(items, fondoObjetivo)`

**Objetivo:** Llenar hasta `fondoObjetivo` usando dinero disponible

**Algoritmo:**
1. Filtrar monedas y billetes pequeños (≤ $50)
2. Si no alcanza el objetivo, agregar billetes medianos ($100)
3. Ordenar ascendente (denominaciones pequeñas primero)
4. Usar greedy: agregar items hasta llenar objetivo

**Con debugging:** 
- `console.log()` en cada paso
- Muestra items preferencia, items ordenados, items expandidos
- Muestra total usado vs objetivo

**Ejemplo esperado:**
```
Objetivo: $3000
Items disponibles: [¢50×2, $1×2, $2×2, $5×2, $10×2, $20×2, $50×2, $100×8, ...]

Paso 1: Items preferencia (<=50): ¢50, $1, $2, $5, $10, $20, $50
Paso 2: Total disponible = $177 < $3000 → Agregar $100
Paso 3: Items ordenados: ¢50, $1, $2, $5, $10, $20, $50, $100
Paso 4: Usar greedy hasta llenar $3000
  - ¢50 × 2 = $1
  - $1 × 2 = $2
  - $2 × 2 = $4
  - $5 × 2 = $10
  - $10 × 2 = $20
  - $20 × 2 = $40
  - $50 × 2 = $100
  - $100 × 28 = $2800 (si hay disponible)
  - Total: ~$2977 (se acerca a $3000)

Resultado: [$100×28, $50×2, $20×2, $10×2, $5×2, $2×2, $1×2, ¢50×2]
```

---

### 2. `generarSugerenciaCorte(items, corteObjetivo)`

**Objetivo:** Usar billetes grandes para hacer el corte restante

**Algoritmo:**
1. Filtrar billetes grandes (≥ $100), si no hay usar billetes pequeños
2. Ordenar descendente (billetes grandes primero)
3. Usar greedy CON LÍMITE: máximo 10% de exceso sobre objetivo

**Límite Inteligente:**
```javascript
if (totalUsado + item.denominacion <= corteObjetivo * 1.1) {
    // Solo agrega si no excede 10%
}
```

**Con debugging:**
- Muestra objetivo y límite máximo
- Muestra por qué se skippea cada item
- Muestra total usado final

**Ejemplo esperado:**
```
Objetivo: $1368 (del ejemplo del usuario)
Límite máximo: $1503 (10% más)

Billetes grandes disponibles: $1000×1, $500×1, $200×3, $100×6, ...

Greedy descendente:
  - $1000 + 0 = $1000 ≤ $1503 → Agregar ✓
  - $500 + $1000 = $1500 ≤ $1503 → Agregar ✓
  - $200 + $1500 = $1700 > $1503 → SKIP ✗

Resultado: [$1000×1, $500×1]
Total: $1500 (dentro del límite)
```

---

### 3. `generarSugerenciaPropina(items, propinaObjetivo)`

**Objetivo:** Usar billetes medianos-grandes para propina

**Algoritmo:**
1. Filtrar SOLO billetes ≥ $50 (no monedas)
2. Ordenar descendente
3. Usar greedy CON LÍMITE: máximo 5% de exceso

**Límite Inteligente:**
```javascript
if (totalUsado + item.denominacion <= propinaObjetivo * 1.05) {
    // Solo agrega si no excede 5%
}
```

**Ejemplo esperado:**
```
Objetivo: $109 (del ejemplo del usuario)
Límite máximo: $114 (5% más)

Billetes ≥$50 disponibles: $100×1, $50×2, ...

Greedy descendente:
  - $100 + 0 = $100 ≤ $114 → Agregar ✓
  - $50 + $100 = $150 > $114 → SKIP ✗

Resultado: [$100×1]
Total: $100 (dentro del límite)
```

---

### 4. `generarSugerenciasCompletas()` - Orquestación

**Ejecuta los 3 pasos en secuencia correcta:**

```
PASO 1: generarSugerenciaFondo()
    ↓
    Calcula: itemsRestantesDespuesFondo = total - usado_fondo
    ↓
PASO 2: generarSugerenciaCorte(itemsRestantesDespuesFondo)
    ↓
    Calcula: itemsRestantesDespuesCorte = itemsRestantesDespuesFondo - usado_corte
    ↓
PASO 3: generarSugerenciaPropina(itemsRestantesDespuesCorte)
    ↓
RESUMEN: Muestra totales de cada sugerencia
```

**Retorna:**
```javascript
{
    fondo: { items: [...], total: 3000 },
    corte: { items: [...], total: 1500 },
    propina: { items: [...], total: 100 }
}
```

---

## Debugging

El archivo tiene `console.log()` extensivo en cada función:

### Para ver debugging en la consola del navegador:

1. Abre DevTools (F12)
2. Pestaña "Console"
3. Haz clic en "Sugerir Fondo"
4. Verás output detallado como:

```
=== FONDO DEBUG ===
Objetivo: 3000
Items disponibles: Array(11)
Items preferencia (<=50): Array(7)
Agregados billetes medianos: Array(4)
Items ordenados: Array(11)
...
Total usado: 2977
===================

=== CORTE DEBUG ===
Objetivo: 1368
Items disponibles: Array(...)
...
```

---

## Integración con main.js

**Antes:**
```javascript
const sugerenciaFondo = generarSugerenciaFondo(items, fondoObjetivo);
// Calcular restantes manualmente
const itemsRestantes = items.map(...).filter(...);
const sugerenciaCorte = generarSugerenciaCorte(itemsRestantes, corteObjetivo);
// Etc...
```

**Ahora:**
```javascript
const sugerencias = generarSugerenciasCompletas(
    items, 
    fondoObjetivo, 
    corteObjetivo, 
    totalPropinas
);

// Usar resultados
const contenidoFondo = generarMensajeFondo(sugerencias.fondo.items, fondoObjetivo);
const contenidoCorte = generarMensajeCorteRecomendado(sugerencias.corte.items, corteObjetivo);
const contenidoPropinas = generarMensajePropina(sugerencias.propina.items, totalPropinas);
```

---

## Mejoras Futuras

Ahora que la lógica está aislada, es fácil:

1. **Cambiar algoritmo greedy** → Probar con otras estrategias (ej: backtracking, dynamic programming)
2. **Agregar constraints** → Limitar cantidad máxima de billetes a usar
3. **Optimización** → Minimizar cantidad de billetes diferentes
4. **Testing** → Crear pruebas unitarias para cada función
5. **Performance** → Perfilar el código para identificar cuellos de botella

---

## Próximos Pasos

1. **Recarga el navegador**
2. **Abre DevTools (F12)**
3. **Haz clic en "Sugerir Fondo"**
4. **Observa el console.log()** para ver si:
   - El fondo se llena correctamente
   - El corte respeta el límite 10%
   - La propina respeta el límite 5%

---

**Commit:** `dc56466`  
**Archivo:** `src/suggestions.js`  
**Status:** ✅ Listo para debugging y mejora
