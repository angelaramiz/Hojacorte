/**
 * ============================================
 * MÓDULO DE CONFIGURACIÓN
 * ============================================
 * Almacena todas las constantes y configuraciones del sistema
 */

export const CONFIG = {
    // IDs de celdas de monedas
    monedas: [
        { id: 'row-4-col-2', denominacion: 0.5, prompt: 'Ingrese el valor para ¢50, Cat' },
        { id: 'row-5-col-2', denominacion: 1, prompt: 'Ingrese el valor para $1, Cat' },
        { id: 'row-6-col-2', denominacion: 2, prompt: 'Ingrese el valor para $2, Cat' },
        { id: 'row-7-col-2', denominacion: 5, prompt: 'Ingrese el valor para $5, Cat' },
        { id: 'row-8-col-2', denominacion: 10, prompt: 'Ingrese el valor para $10, Cat' }
    ],

    // IDs de celdas de billetes
    billetes: [
        { id: 'row-10-col-2', denominacion: 20, prompt: 'Ingrese el valor para $20, Cat' },
        { id: 'row-11-col-2', denominacion: 50, prompt: 'Ingrese el valor para $50, Cat' },
        { id: 'row-12-col-2', denominacion: 100, prompt: 'Ingrese el valor para $100, Cat' },
        { id: 'row-13-col-2', denominacion: 200, prompt: 'Ingrese el valor para $200, Cat' },
        { id: 'row-14-col-2', denominacion: 500, prompt: 'Ingrese el valor para $500, Cat' },
        { id: 'row-15-col-2', denominacion: 1000, prompt: 'Ingrese el valor para $1,000, Cat' }
    ],

    // IDs de celdas de tarjetas
    tarjetas: [
        { id: 'row-3-col-4', prompt: 'Ingrese el valor para T.Débito' },
        { id: 'row-5-col-4', prompt: 'Ingrese el valor para T.Crédito' },
        { id: 'row-7-col-4', prompt: 'Ingrese el valor para T.Amex' }
    ],

    // IDs de celdas de vales/bolsas
    vales: [
        'row-9-col-4', 'row-10-col-4', 'row-11-col-4', 'row-12-col-4', 'row-13-col-4'
    ],

    // IDs para verificar si hay datos
    idsVerificacion: [
        'row-2-col-3', 'row-3-col-4', 'row-4-col-2', 'row-4-col-3', 'row-5-col-2', 'row-5-col-3',
        'row-5-col-4', 'row-6-col-2', 'row-6-col-3', 'row-7-col-2', 'row-7-col-3', 'row-7-col-4',
        'row-8-col-2', 'row-8-col-3', 'row-8-col-5', 'row-9-col-3', 'row-9-col-4', 'row-10-col-2',
        'row-10-col-3', 'row-10-col-4', 'row-11-col-2', 'row-11-col-3', 'row-11-col-4', 'row-12-col-2',
        'row-12-col-3', 'row-12-col-4', 'row-13-col-2', 'row-13-col-3', 'row-13-col-4', 'row-14-col-2',
        'row-14-col-3', 'row-15-col-2', 'row-15-col-3', 'row-19-col-1', 'row-19-col-4', 'row-21-col-1',
        'row-21-col-4'
    ],

    // IDs para limpiar
    idsLimpiar: [
        'row-2-col-3', 'row-3-col-4', 'row-4-col-2', 'row-4-col-3', 'row-5-col-2', 'row-5-col-3',
        'row-5-col-4', 'row-6-col-2', 'row-6-col-3', 'row-7-col-2', 'row-7-col-3', 'row-7-col-4',
        'row-8-col-2', 'row-8-col-3', 'row-8-col-5', 'row-9-col-3', 'row-9-col-4', 'row-10-col-2',
        'row-10-col-3', 'row-10-col-4', 'row-11-col-2', 'row-11-col-3', 'row-11-col-4', 'row-12-col-2',
        'row-12-col-3', 'row-12-col-4', 'row-13-col-2', 'row-13-col-3', 'row-13-col-4', 'row-14-col-2',
        'row-14-col-3', 'row-15-col-2', 'row-15-col-3', 'row-17-col-1', 'row-17-col-4', 'row-19-col-1', 
        'row-19-col-4', 'row-21-col-1', 'row-21-col-4'
    ],

    // IDs para guardar en localStorage
    idsSalvables: [
        'row-8-col-5', 'row-2-col-3', 'row-9-col-3', 'row-19-col-1', 'row-21-col-1', 'row-19-col-4', 'row-21-col-4'
    ],

    // IDs de elementos de la tabla
    elementos: {
        limpiarTablaBtn: 'limpiarTablaBtn',
        sugerirFondoBtn: 'sugerirFondoBtn',
        editarValorBtn: 'editarValorBtn',
        ajustarCorteBtn: 'ajustarCorteBtn',
        fondoCell: 'row-15-col-4',
        totalMonedasCell: 'row-2-col-3',
        totalBilletesCell: 'row-9-col-3',
        totalGastosCell: 'row-8-col-5',
        totalEfectivoSFCell: 'row-19-col-1',
        totalEfectivoCFCell: 'row-21-col-1',
        totalTarjetasCell: 'row-19-col-4',
        totalFinalCell: 'row-21-col-4',
        propinasEfectivoCell: 'row-17-col-1',
        propinasTarjetaCell: 'row-17-col-4'
    },

    // Valores por defecto
    fondoDefault: 3000,
    timeoutEdicion: 5000,
    timeoutMensajeEdicion: 2500
};

export const STORAGE_KEYS = {
    corteInProgress: 'corteInProgress'
};
