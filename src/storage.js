/**
 * ============================================
 * MÓDULO DE ALMACENAMIENTO (STORAGE)
 * ============================================
 * Gestiona la persistencia de datos en localStorage
 */

import { CONFIG, STORAGE_KEYS } from './config.js';

/**
 * Obtiene datos del localStorage
 */
export function obtenerDatos() {
    const datos = localStorage.getItem(STORAGE_KEYS.corteInProgress);
    return datos ? JSON.parse(datos) : null;
}

/**
 * Guarda datos en localStorage
 */
export function guardarDatos(datos) {
    localStorage.setItem(STORAGE_KEYS.corteInProgress, JSON.stringify(datos));
}

/**
 * Limpia localStorage
 */
export function limpiarDatos() {
    localStorage.removeItem(STORAGE_KEYS.corteInProgress);
}

/**
 * Verifica si hay un corte en progreso
 */
export function hayCorteEnProgreso() {
    return localStorage.getItem(STORAGE_KEYS.corteInProgress) !== null;
}

/**
 * Restaura los datos guardados en las celdas de la tabla
 */
export function restaurarDatos(datos) {
    if (datos && datos.values) {
        Object.entries(datos.values).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = value;
            }
        });
    }
}

/**
 * Construye el objeto de datos para guardar
 */
export function construirDatosParaGuardar(currentStep) {
    const dataToSave = {
        values: {},
        currentStep: currentStep
    };

    // Guardar monedas y billetes
    [...CONFIG.monedas, ...CONFIG.billetes].forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
            const value = element.textContent.trim();
            if (value && !isNaN(value)) {
                dataToSave.values[item.id] = value;
            }
            const ttlId = item.id.replace('col-2', 'col-3');
            const ttlElement = document.getElementById(ttlId);
            if (ttlElement) {
                const ttlValue = ttlElement.textContent.trim();
                if (ttlValue && !isNaN(ttlValue)) {
                    dataToSave.values[ttlId] = ttlValue;
                }
            }
        }
    });

    // Guardar tarjetas
    CONFIG.tarjetas.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
            const value = element.textContent.trim();
            if (value && !isNaN(value)) {
                dataToSave.values[item.id] = value;
            }
        }
    });

    // Guardar otros valores
    CONFIG.idsSalvables.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const value = element.textContent.trim();
            if (value && !isNaN(value)) {
                dataToSave.values[id] = value;
            }
        }
    });

    return dataToSave;
}
