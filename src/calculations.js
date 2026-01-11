/**
 * ============================================
 * MÓDULO DE CÁLCULOS Y OPERACIONES
 * ============================================
 * Funciones matemáticas y cálculos de totales
 */

import { CONFIG } from './config.js';

/**
 * Calcula el total de dinero basado en monedas y billetes
 */
export function calcularTotal(formValues) {
    const monedas = formValues.monedas || {};
    const billetes = formValues.billetes || {};

    const totalMonedas = Object.keys(monedas).reduce((acc, key) => 
        acc + (parseInt(key) * parseFloat(monedas[key] || 0)), 0);
    const totalBilletes = Object.keys(billetes).reduce((acc, key) => 
        acc + (parseInt(key) * parseFloat(billetes[key] || 0)), 0);

    return totalMonedas + totalBilletes;
}

/**
 * Resta una cantidad de una celda de total
 */
export function restarDeTotal(celdaTotalId, cantidad) {
    let totalActual = parseFloat(document.getElementById(celdaTotalId).textContent) || 0;
    totalActual -= parseFloat(cantidad);
    document.getElementById(celdaTotalId).textContent = totalActual.toFixed(2);
}

/**
 * Actualiza los totales finales de la tabla
 */
export function actualizarTotalesFinales() {
    const tEfectivoCF = parseFloat(document.getElementById(CONFIG.elementos.totalEfectivoCFCell).textContent) || 0;
    const tTarjetas = parseFloat(document.getElementById(CONFIG.elementos.totalTarjetasCell).textContent) || 0;
    const tFinal = tEfectivoCF + tTarjetas;
    document.getElementById(CONFIG.elementos.totalFinalCell).textContent = tFinal.toFixed(2);
}

/**
 * Obtiene monedas disponibles
 */
export function obtenerMonedas() {
    return CONFIG.monedas.map(moneda => ({
        denominacion: moneda.denominacion,
        cantidad: parseInt(document.getElementById(moneda.id).textContent) || 0
    }));
}

/**
 * Obtiene billetes disponibles
 */
export function obtenerBilletes() {
    return CONFIG.billetes.map(billete => ({
        denominacion: billete.denominacion,
        cantidad: parseInt(document.getElementById(billete.id).textContent) || 0
    }));
}

/**
 * Obtiene vales disponibles
 */
export function obtenerVales() {
    return CONFIG.vales.map(id => {
        const valor = parseFloat(document.getElementById(id)?.textContent.split('=')[1]) || 0;
        return { denominacion: 'vales', cantidad: valor };
    }).filter(item => item.cantidad > 0);
}

/**
 * Calcula el corte restante después de asignar el fondo
 */
export function calcularCorteRestante(sugerencia) {
    const corteRestante = {};

    CONFIG.monedas.forEach(moneda => {
        const cantidad = parseInt(document.getElementById(moneda.id).textContent) || 0;
        const cantidadFondo = sugerencia
            .filter(item => item.denominacion === moneda.denominacion && item.denominacion < 20)
            .reduce((acc, item) => acc + item.cantidad, 0);
        corteRestante[moneda.denominacion] = cantidad - cantidadFondo;
    });

    CONFIG.billetes.forEach(billete => {
        const cantidad = parseInt(document.getElementById(billete.id).textContent) || 0;
        const cantidadFondo = sugerencia
            .filter(item => item.denominacion === billete.denominacion && item.denominacion >= 20)
            .reduce((acc, item) => acc + item.cantidad, 0);
        corteRestante[billete.denominacion] = cantidad - cantidadFondo;
    });

    return corteRestante;
}

/**
 * Algoritmo de mochila para optimizar combinaciones
 */
export function knapsack(items, capacity) {
    let dp = Array(items.length + 1).fill().map(() => Array(capacity + 1).fill(0));

    for (let i = 1; i <= items.length; i++) {
        for (let w = 0; w <= capacity; w++) {
            if (items[i - 1].denominacion <= w) {
                dp[i][w] = Math.max(
                    dp[i - 1][w],
                    dp[i - 1][w - items[i - 1].denominacion] + items[i - 1].denominacion
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    let res = dp[items.length][capacity];
    let w = capacity;
    let selectedItems = [];

    for (let i = items.length; i > 0 && res > 0; i--) {
        if (res != dp[i - 1][w]) {
            selectedItems.push(items[i - 1]);
            res -= items[i - 1].denominacion;
            w -= items[i - 1].denominacion;
        }
    }

    return selectedItems;
}

/**
 * Genera sugerencia de FONDO - Prioridad: monedas y billetes pequeños
 */
export function generarSugerenciaFondo(items, fondoObjetivo) {
    // Ordenar: primero monedas, luego billetes pequeños (20-50), luego billetes medianos, luego vales
    let itemsOrdenados = [...items].sort((a, b) => {
        const esMonedaA = a.denominacion < 20 ? 0 : 1;
        const esMonedaB = b.denominacion < 20 ? 0 : 1;
        if (esMonedaA !== esMonedaB) return esMonedaA - esMonedaB; // Monedas primero
        if (esMonedaA === 0) return a.denominacion - b.denominacion; // Monedas en orden ascendente
        return a.denominacion - b.denominacion; // Billetes en orden ascendente
    });

    let total = 0;
    let sugerencia = [];

    // Usar monedas y billetes pequeños primero
    for (let item of itemsOrdenados) {
        if (total >= fondoObjetivo) break;
        if (item.denominacion < 100) { // Prioridad: monedas y billetes pequeños
            for (let i = 0; i < item.cantidad && total < fondoObjetivo; i++) {
                total += item.denominacion;
                const existente = sugerencia.find(s => s.denominacion === item.denominacion);
                if (existente) {
                    existente.cantidad++;
                } else {
                    sugerencia.push({ denominacion: item.denominacion, cantidad: 1 });
                }
            }
        }
    }

    return sugerencia;
}

/**
 * Genera sugerencia de CORTE - Prioridad: billetes grandes, vales
 */
export function generarSugerenciaCorte(items, corteObjetivo) {
    // Ordenar descendente: billetes grandes primero, luego medianos, luego monedas
    let itemsOrdenados = [...items].sort((a, b) => b.denominacion - a.denominacion);

    let total = 0;
    let sugerencia = [];

    // Usar billetes grandes primero
    for (let item of itemsOrdenados) {
        if (total >= corteObjetivo) break;
        for (let i = 0; i < item.cantidad && total < corteObjetivo; i++) {
            total += item.denominacion;
            const existente = sugerencia.find(s => s.denominacion === item.denominacion);
            if (existente) {
                existente.cantidad++;
            } else {
                sugerencia.push({ denominacion: item.denominacion, cantidad: 1 });
            }
        }
    }

    return sugerencia;
}

/**
 * Genera sugerencia de PROPINA - Prioridad: billetes grandes a medianos
 */
export function generarSugerenciaPropina(items, propinaObjetivo) {
    // Ordenar descendente: billetes grandes y medianos (>= 50)
    let itemsOrdenados = [...items]
        .filter(item => item.denominacion >= 50) // Solo billetes medianos y grandes
        .sort((a, b) => b.denominacion - a.denominacion);

    let total = 0;
    let sugerencia = [];

    for (let item of itemsOrdenados) {
        if (total >= propinaObjetivo) break;
        for (let i = 0; i < item.cantidad && total < propinaObjetivo; i++) {
            total += item.denominacion;
            const existente = sugerencia.find(s => s.denominacion === item.denominacion);
            if (existente) {
                existente.cantidad++;
            } else {
                sugerencia.push({ denominacion: item.denominacion, cantidad: 1 });
            }
        }
    }

    return sugerencia;
}

/**
 * Genera una sugerencia genérica (mantiene compatibilidad con código existente)
 */
export function generarSugerencia(items, fondoObjetivo, priorizarMonedas) {
    if (Array.isArray(items)) {
        items.sort((a, b) => a.denominacion - b.denominacion);
    }

    const allItems = items.reduce((acc, item) => {
        for (let i = 0; i < item.cantidad; i++) {
            acc.push(item);
        }
        return acc;
    }, []);

    const selectedItems = knapsack(allItems, fondoObjetivo);

    const consolidatedItems = selectedItems.reduce((acc, item) => {
        const existingItem = acc.find(i => i.denominacion === item.denominacion);
        if (existingItem) {
            existingItem.cantidad += 1;
        } else {
            acc.push({ ...item, cantidad: 1 });
        }
        return acc;
    }, []);

    return consolidatedItems;
}

/**
 * Actualiza los totales de la tabla basándose en los valores ingresados
 */
export function actualizarTotales() {
    let celdas = document.querySelectorAll(
        'td[id^="row-"][id$="-col-2"], td[id="row-3-col-4"], td[id="row-5-col-4"], ' +
        'td[id="row-7-col-4"], td[id="row-9-col-4"], td[id="row-10-col-4"], ' +
        'td[id="row-11-col-4"], td[id="row-12-col-4"], td[id="row-13-col-4"]'
    );
    
    let totalMonedas = 0;
    let totalBilletes = 0;
    let totalValesBolsas = 0;

    celdas.forEach(celda => {
        let valor = parseFloat(celda.textContent) || 0;
        let denominacionTexto = celda.previousElementSibling ? celda.previousElementSibling.textContent : '';
        let denominacion = 0;

        if (denominacionTexto.includes('$')) {
            denominacion = parseFloat(denominacionTexto.replace('$', '').replace(',', ''));
        } else if (denominacionTexto.includes('¢')) {
            denominacion = parseFloat(denominacionTexto.replace('¢', '')) / 100;
        }

        if (denominacion < 20) {
            totalMonedas += valor * denominacion;
        } else {
            totalBilletes += valor * denominacion;
        }

        let colTotal = celda.nextElementSibling;
        if (colTotal) {
            colTotal.textContent = (valor * denominacion).toFixed(2);
        }
    });

    // Actualizar total de vales y bolsas
    let valesBolsasCeldas = document.querySelectorAll(
        'td[id="row-9-col-4"], td[id="row-10-col-4"], td[id="row-11-col-4"], ' +
        'td[id="row-12-col-4"], td[id="row-13-col-4"]'
    );
    valesBolsasCeldas.forEach(celda => {
        let valor = parseFloat(celda.textContent.split('=')[1]) || 0;
        totalValesBolsas += valor;
    });

    // Actualizar celdas de totales
    let row2Col3 = document.getElementById(CONFIG.elementos.totalMonedasCell);
    if (row2Col3) row2Col3.textContent = totalMonedas.toFixed(2);

    let row9Col3 = document.getElementById(CONFIG.elementos.totalBilletesCell);
    if (row9Col3) row9Col3.textContent = totalBilletes.toFixed(2);

    let row8Col5 = document.getElementById(CONFIG.elementos.totalGastosCell);
    if (row8Col5) row8Col5.textContent = totalValesBolsas.toFixed(2);

    // Actualizar total de efectivo
    let fondo = parseFloat(document.getElementById(CONFIG.elementos.fondoCell).textContent) || 0;
    let totalEfectivo = totalMonedas + totalBilletes + totalValesBolsas;
    let tEfectivoSF = totalEfectivo - fondo;
    let tEfectivoCF = totalEfectivo;

    let row19Col1 = document.getElementById(CONFIG.elementos.totalEfectivoSFCell);
    if (row19Col1) row19Col1.textContent = tEfectivoSF.toFixed(2);

    let row21Col1 = document.getElementById(CONFIG.elementos.totalEfectivoCFCell);
    if (row21Col1) row21Col1.textContent = tEfectivoCF.toFixed(2);

    // Actualizar total final
    let tDebito = parseFloat(document.getElementById('row-3-col-4').textContent) || 0;
    let tCredito = parseFloat(document.getElementById('row-5-col-4').textContent) || 0;
    let tAmex = parseFloat(document.getElementById('row-7-col-4').textContent) || 0;
    let tTarjetas = tDebito + tCredito + tAmex;

    let row19Col4 = document.getElementById(CONFIG.elementos.totalTarjetasCell);
    if (row19Col4) row19Col4.textContent = tTarjetas.toFixed(2);

    let row21Col4 = document.getElementById(CONFIG.elementos.totalFinalCell);
    if (row21Col4) row21Col4.textContent = (tEfectivoCF + tTarjetas).toFixed(2);
}

/**
 * Resta cantidades de monedas y billetes
 */
export function restarDeFormulario(formValues) {
    if (!formValues || typeof formValues !== 'object') {
        console.error('restarDeFormulario: formValues no es un objeto válido.', formValues);
        return;
    }

    const monedas = formValues.monedas || {};
    const billetes = formValues.billetes || {};

    const denominaciones = {
        'monedas': {
            '10': 'row-8-col-2',
            '5': 'row-7-col-2',
            '2': 'row-6-col-2',
            '1': 'row-5-col-2'
        },
        'billetes': {
            '1000': 'row-15-col-2',
            '500': 'row-14-col-2',
            '200': 'row-13-col-2',
            '100': 'row-12-col-2',
            '50': 'row-11-col-2',
            '20': 'row-10-col-2'
        }
    };

    for (const [key, value] of Object.entries(monedas)) {
        if (!denominaciones.monedas[key]) continue;
        const id = denominaciones.monedas[key];
        const currentVal = parseInt(document.getElementById(id).textContent) || 0;
        document.getElementById(id).textContent = currentVal - (parseInt(value) || 0);
    }

    for (const [key, value] of Object.entries(billetes)) {
        if (!denominaciones.billetes[key]) continue;
        const id = denominaciones.billetes[key];
        const currentVal = parseInt(document.getElementById(id).textContent) || 0;
        document.getElementById(id).textContent = currentVal - (parseInt(value) || 0);
    }

    actualizarTotales();
}
