/**
 * ============================================
 * MÓDULO DE SUGERENCIAS DE CORTE
 * ============================================
 * Lógica centralizada para sugerencias de fondo, corte y propina
 * Archivo aislado para fácil debugging y mejora
 */

/**
 * SUGERENCIA DE FONDO
 * 
 * Objetivo: Llenar hasta el monto objetivo usando:
 * 1. Monedas (¢50, $1, $2, $5, $10)
 * 2. Billetes pequeños ($20, $50)
 * 3. Billetes medianos ($100) si es necesario para completar
 * 
 * IMPORTANTE: Si el objetivo no se puede alcanzar con disponible,
 * usa TODO lo disponible hasta llenar el máximo posible
 */
export function generarSugerenciaFondo(items, fondoObjetivo) {
    if (fondoObjetivo <= 0) return [];
    
    console.log('=== FONDO DEBUG ===');
    console.log('Objetivo:', fondoObjetivo);
    console.log('Items disponibles:', items);
    
    // PASO 1: Intentar llenar con monedas y billetes pequeños
    let itemsPreferencia = items.filter(item => item.denominacion <= 50);
    console.log('Items preferencia (<=50):', itemsPreferencia);
    
    // PASO 2: Si no es suficiente, agregar billetes medianos
    if (itemsPreferencia.reduce((a, i) => a + (i.denominacion * i.cantidad), 0) < fondoObjetivo) {
        let itemsMedianos = items.filter(item => item.denominacion > 50 && item.denominacion <= 200);
        itemsPreferencia = [...itemsPreferencia, ...itemsMedianos];
        console.log('Agregados billetes medianos:', itemsMedianos);
    }
    
    // PASO 3: Ordenar ascendente para usar denominaciones pequeñas primero
    let itemsOrdenados = itemsPreferencia.sort((a, b) => a.denominacion - b.denominacion);
    console.log('Items ordenados:', itemsOrdenados);
    
    let sugerencia = [];
    let totalUsado = 0;
    
    // PASO 4: Expandir items para mejor control
    let itemsExpandidos = [];
    for (let item of itemsOrdenados) {
        for (let i = 0; i < item.cantidad; i++) {
            itemsExpandidos.push({ denominacion: item.denominacion });
        }
    }
    console.log('Items expandidos:', itemsExpandidos);
    
    // PASO 5: Usar greedy - agregar items hasta llenar objetivo
    for (let item of itemsExpandidos) {
        if (totalUsado >= fondoObjetivo) {
            console.log('Alcanzado objetivo');
            break;
        }
        
        totalUsado += item.denominacion;
        const existente = sugerencia.find(s => s.denominacion === item.denominacion);
        if (existente) {
            existente.cantidad++;
        } else {
            sugerencia.push({ denominacion: item.denominacion, cantidad: 1 });
        }
    }
    
    console.log('Sugerencia fondo final:', sugerencia);
    console.log('Total usado:', totalUsado);
    console.log('===================\n');
    
    return sugerencia;
}

/**
 * SUGERENCIA DE CORTE
 * 
 * Objetivo: Usar el dinero restante (después de fondo) de forma práctica
 * 
 * Prioridad:
 * 1. Billetes grandes ($1000, $500, $200, $100)
 * 2. Billetes medianos ($50, $20)
 * 3. Monedas como último recurso
 * 
 * LÍMITE: No exceder más del 10% del objetivo
 */
export function generarSugerenciaCorte(items, corteObjetivo) {
    if (corteObjetivo <= 0) {
        console.log('Corte objetivo es 0 o negativo');
        return [];
    }
    
    console.log('=== CORTE DEBUG ===');
    console.log('Objetivo:', corteObjetivo);
    console.log('Items disponibles:', items);
    
    // PASO 1: Ordenar descendente (billetes grandes primero)
    let itemsOrdenados = [...items].sort((a, b) => b.denominacion - a.denominacion);
    console.log('Items ordenados (descendente):', itemsOrdenados);
    
    let sugerencia = [];
    let totalUsado = 0;
    let limiteMaximo = corteObjetivo * 1.1; // Máximo 10% exceso
    
    console.log('Límite máximo permitido:', limiteMaximo);
    
    // PASO 2: Expandir items
    let itemsExpandidos = [];
    for (let item of itemsOrdenados) {
        for (let i = 0; i < item.cantidad; i++) {
            itemsExpandidos.push({ denominacion: item.denominacion });
        }
    }
    
    // PASO 3: Seleccionar items inteligentemente
    for (let item of itemsExpandidos) {
        // Si ya alcanzamos el objetivo, parar
        if (totalUsado >= corteObjetivo) {
            console.log('Alcanzado objetivo de corte');
            break;
        }
        
        // Si agregar este item excede el límite, skip
        if (totalUsado + item.denominacion > limiteMaximo) {
            console.log(`Skip: ${totalUsado} + ${item.denominacion} = ${totalUsado + item.denominacion} > ${limiteMaximo}`);
            continue;
        }
        
        totalUsado += item.denominacion;
        const existente = sugerencia.find(s => s.denominacion === item.denominacion);
        if (existente) {
            existente.cantidad++;
        } else {
            sugerencia.push({ denominacion: item.denominacion, cantidad: 1 });
        }
    }
    
    console.log('Sugerencia corte final:', sugerencia);
    console.log('Total usado:', totalUsado);
    console.log('===================\n');
    
    return sugerencia;
}

/**
 * SUGERENCIA DE PROPINA
 * 
 * Objetivo: Usar billetes fáciles de entregar
 * 
 * Prioridad:
 * 1. Billetes medianos-grandes ($100, $200, $500, $1000)
 * 2. Billetes pequeños ($50, $20) si es necesario
 * 3. NO usar monedas
 * 
 * LÍMITE: No exceder más del 5% del objetivo
 */
export function generarSugerenciaPropina(items, propinaObjetivo) {
    if (propinaObjetivo <= 0) {
        console.log('Propina objetivo es 0 o negativo');
        return [];
    }
    
    console.log('=== PROPINA DEBUG ===');
    console.log('Objetivo:', propinaObjetivo);
    console.log('Items disponibles:', items);
    
    // PASO 1: Filtrar solo billetes >= $50
    let itemsValidos = items.filter(item => item.denominacion >= 50);
    console.log('Items válidos (>=50):', itemsValidos);
    
    if (itemsValidos.length === 0) {
        console.log('No hay billetes disponibles para propina');
        return [];
    }
    
    // PASO 2: Ordenar descendente
    let itemsOrdenados = itemsValidos.sort((a, b) => b.denominacion - a.denominacion);
    console.log('Items ordenados (descendente):', itemsOrdenados);
    
    let sugerencia = [];
    let totalUsado = 0;
    let limiteMaximo = propinaObjetivo * 1.05; // Máximo 5% exceso
    
    console.log('Límite máximo permitido:', limiteMaximo);
    
    // PASO 3: Expandir items
    let itemsExpandidos = [];
    for (let item of itemsOrdenados) {
        for (let i = 0; i < item.cantidad; i++) {
            itemsExpandidos.push({ denominacion: item.denominacion });
        }
    }
    
    // PASO 4: Seleccionar items inteligentemente
    for (let item of itemsExpandidos) {
        // Si ya alcanzamos el objetivo, parar
        if (totalUsado >= propinaObjetivo) {
            console.log('Alcanzado objetivo de propina');
            break;
        }
        
        // Si agregar este item excede el límite, skip
        if (totalUsado + item.denominacion > limiteMaximo) {
            console.log(`Skip: ${totalUsado} + ${item.denominacion} = ${totalUsado + item.denominacion} > ${limiteMaximo}`);
            continue;
        }
        
        totalUsado += item.denominacion;
        const existente = sugerencia.find(s => s.denominacion === item.denominacion);
        if (existente) {
            existente.cantidad++;
        } else {
            sugerencia.push({ denominacion: item.denominacion, cantidad: 1 });
        }
    }
    
    console.log('Sugerencia propina final:', sugerencia);
    console.log('Total usado:', totalUsado);
    console.log('===================\n');
    
    return sugerencia;
}

/**
 * FUNCIÓN AUXILIAR: Calcular inventario restante
 * 
 * Resta los items usados en la sugerencia del inventario disponible
 */
export function restarInventario(itemsDisponibles, itemsUsados) {
    console.log('Restando inventario...');
    console.log('Disponibles:', itemsDisponibles);
    console.log('Usados:', itemsUsados);
    
    const itemsRestantes = itemsDisponibles.map(item => ({
        ...item,
        cantidad: item.cantidad - (itemsUsados.find(s => s.denominacion === item.denominacion)?.cantidad || 0)
    })).filter(item => item.cantidad > 0);
    
    console.log('Restantes:', itemsRestantes);
    
    return itemsRestantes;
}

/**
 * FUNCIÓN AUXILIAR: Calcular total de una sugerencia
 */
export function calcularTotalSugerencia(sugerencia) {
    return sugerencia.reduce((total, item) => total + (item.denominacion * item.cantidad), 0);
}

/**
 * FUNCIÓN AUXILIAR: Generar sugerencias completas (fondo + corte + propina)
 */
export function generarSugerenciasCompletas(items, fondoObjetivo, corteObjetivo, propinaObjetivo) {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║         GENERANDO SUGERENCIAS COMPLETAS              ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    // PASO 1: Fondo
    const sugerenciaFondo = generarSugerenciaFondo(items, fondoObjetivo);
    const totalFondo = calcularTotalSugerencia(sugerenciaFondo);
    
    // PASO 2: Calcular inventario restante después del fondo
    const itemsRestantesDespuesFondo = restarInventario(items, sugerenciaFondo);
    
    // PASO 3: Corte
    const sugerenciaCorte = generarSugerenciaCorte(itemsRestantesDespuesFondo, corteObjetivo);
    const totalCorte = calcularTotalSugerencia(sugerenciaCorte);
    
    // PASO 4: Calcular inventario restante después del corte
    const itemsRestantesDespuesCorte = restarInventario(itemsRestantesDespuesFondo, sugerenciaCorte);
    
    // PASO 5: Propina
    const sugerenciaPropina = generarSugerenciaPropina(itemsRestantesDespuesCorte, propinaObjetivo);
    const totalPropina = calcularTotalSugerencia(sugerenciaPropina);
    
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                    RESUMEN FINAL                      ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`FONDO:   Objetivo $${fondoObjetivo.toFixed(2)} → Sugerido $${totalFondo.toFixed(2)}`);
    console.log(`CORTE:   Objetivo $${corteObjetivo.toFixed(2)} → Sugerido $${totalCorte.toFixed(2)}`);
    console.log(`PROPINA: Objetivo $${propinaObjetivo.toFixed(2)} → Sugerido $${totalPropina.toFixed(2)}\n`);
    
    return {
        fondo: { items: sugerenciaFondo, total: totalFondo },
        corte: { items: sugerenciaCorte, total: totalCorte },
        propina: { items: sugerenciaPropina, total: totalPropina }
    };
}
