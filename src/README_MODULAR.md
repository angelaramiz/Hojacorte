/**
 * ============================================
 * DOCUMENTACIÓN DE ESTRUCTURA MODULAR
 * ============================================
 * 
 * La aplicación "Hoja de Corte" ha sido refactorizada
 * en una arquitectura modular con separación de responsabilidades.
 * 
 * ESTRUCTURA DE MÓDULOS:
 * 
 * 1. config.js - CONFIGURACIÓN CENTRALIZADA
 *    - Define todas las constantes de la aplicación
 *    - IDs de celdas de monedas, billetes, tarjetas
 *    - IDs para verificación, limpieza y guardado
 *    - Configuraciones por defecto
 * 
 * 2. storage.js - GESTIÓN DE PERSISTENCIA
 *    - Manejo de localStorage
 *    - Funciones: obtenerDatos, guardarDatos, limpiarDatos
 *    - Restauración de datos guardados
 *    - Construcción de objetos para guardar
 * 
 * 3. calculations.js - OPERACIONES MATEMÁTICAS
 *    - Cálculos de totales
 *    - Algoritmo de mochila (knapsack)
 *    - Generación de sugerencias de fondo
 *    - Cálculo de corte restante
 *    - Funciones: obtenerMonedas, obtenerBilletes, obtenerVales
 * 
 * 4. ui.js - INTERFAZ DE USUARIO
 *    - Manejo de eventos del DOM
 *    - Validación y verificación de datos
 *    - Modales y diálogos con SweetAlert2
 *    - Generación de mensajes y contenido
 *    - Gestión de propinas
 * 
 * 5. main.js - ORQUESTACIÓN PRINCIPAL
 *    - Punto de entrada de la aplicación
 *    - Coordinación de todos los módulos
 *    - Funciones principales: iniciarCorte, sugerirFondo, etc.
 *    - Inicialización y event listeners globales
 * 
 * FLUJO DE DATOS:
 * 
 * 1. Inicialización:
 *    index.html -> main.js -> otros módulos
 * 
 * 2. Entrada de Datos:
 *    Usuario -> UI (modales) -> Cálculos -> Storage -> UI (actualización)
 * 
 * 3. Persistencia:
 *    Datos en tabla -> Storage (localStorage) -> Restauración
 * 
 * CARACTERÍSTICAS CONSERVADAS:
 * 
 * ✓ Todas las funcionalidades originales
 * ✓ Gestión completa de monedas, billetes y tarjetas
 * ✓ Sistema de propinas
 * ✓ Algoritmo de optimización de fondo
 * ✓ Persistencia en localStorage
 * ✓ Edición de valores
 * ✓ Generación de sugerencias
 * ✓ Interfaz completa con SweetAlert2
 * 
 * VENTAJAS DE LA ESTRUCTURA MODULAR:
 * 
 * ✓ Mayor mantenibilidad
 * ✓ Reutilización de código
 * ✓ Separación de responsabilidades
 * ✓ Facilita pruebas unitarias
 * ✓ Mejor organización del código
 * ✓ Escalabilidad
 * 
 * IMPORTACIÓN DE MÓDULOS (ES6):
 * 
 * import { CONFIG } from './config.js';
 * import { obtenerDatos, guardarDatos } from './storage.js';
 * import { calcularTotal, actualizarTotales } from './calculations.js';
 * import { verificarDatos, limpiarTabla } from './ui.js';
 * 
 * FUNCIONES GLOBALES DISPONIBLES:
 * 
 * window.iniciarCorte()
 * window.sugerirFondo()
 * window.habilitarEdicion()
 * window.ajustarCorte()
 * window.limpiarTabla()
 * 
 */
