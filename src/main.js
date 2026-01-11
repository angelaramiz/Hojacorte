/**
 * ============================================
 * MÓDULO PRINCIPAL - ORQUESTACIÓN
 * ============================================
 * Punto de entrada y coordinación de todos los módulos
 */

import { CONFIG, STORAGE_KEYS } from './config.js';
import {
    obtenerDatos,
    guardarDatos,
    hayCorteEnProgreso,
    restaurarDatos,
    construirDatosParaGuardar,
    limpiarDatos
} from './storage.js';
import {
    calcularTotal,
    actualizarTotales,
    obtenerMonedas,
    obtenerBilletes,
    obtenerVales,
    generarSugerencia,
    calcularCorteRestante,
    restarDeFormulario
} from './calculations.js';
import {
    verificarDatos,
    limpiarTabla,
    getValue,
    getGastoValue,
    actualizarPropina,
    generarMensaje,
    generarMensajeCorte,
    crearContenidoPestanas,
    mostrarTab,
    mostrarPropinasEnSugerencia,
    propinasEfectivo,
    propinasTarjeta,
    generarContenidoPropinas
} from './ui.js';

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Maneja el evento de cierre del Swal para propagar cambios
 */
function setupSwalCloseHandler() {
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('swal2-close')) {
            Swal.close();
            event.target.closest('.swal2-container').__cancelled = true;
            verificarDatos();
        }
    });
}

/**
 * Inicia un nuevo corte
 */
async function iniciarCorte() {
    let currentStep = 0;

    // Verificar si hay un corte en progreso
    if (hayCorteEnProgreso()) {
        const { isConfirmed } = await Swal.fire({
            title: 'Continuar desde el último guardado',
            text: 'Se encontró un corte en progreso. ¿Desea continuar desde donde se interrumpió?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        });

        if (isConfirmed) {
            const savedData = obtenerDatos();
            restaurarDatos(savedData);
            currentStep = savedData.currentStep;
        } else {
            limpiarDatos();
        }
    }

    const saveDataToLocalStorage = () => {
        const dataToSave = construirDatosParaGuardar(currentStep);
        guardarDatos(dataToSave);
        verificarDatos();
    };

    let totalMonedas = 0;
    let totalBilletes = 0;
    let primerDatoIngresado = false;

    // Ingresar monedas
    for (; currentStep < CONFIG.monedas.length; currentStep++) {
        const element = CONFIG.monedas[currentStep];
        const value = await getValue(element.prompt);

        if (document.querySelector('.swal2-container')?.__cancelled) {
            saveDataToLocalStorage();
            return;
        }

        if (value === 'cancel') {
            saveDataToLocalStorage();
            return;
        }

        if (value !== null && value !== 'done') {
            document.getElementById(element.id).textContent = value;
            const ttlValue = value * element.denominacion;
            const ttlId = element.id.replace('col-2', 'col-3');
            document.getElementById(ttlId).textContent = ttlValue.toFixed(2);
            totalMonedas += ttlValue;

            if (!primerDatoIngresado) {
                primerDatoIngresado = true;
                document.getElementById(CONFIG.elementos.limpiarTablaBtn).disabled = false;
            }
        }
    }

    // Ingresar billetes
    for (; currentStep - CONFIG.monedas.length < CONFIG.billetes.length; currentStep++) {
        const element = CONFIG.billetes[currentStep - CONFIG.monedas.length];
        const value = await getValue(element.prompt);

        if (document.querySelector('.swal2-container')?.__cancelled) {
            saveDataToLocalStorage();
            return;
        }

        if (value === 'cancel') {
            saveDataToLocalStorage();
            return;
        }

        if (value !== null && value !== 'done') {
            document.getElementById(element.id).textContent = value;
            const ttlValue = value * element.denominacion;
            const ttlId = element.id.replace('col-2', 'col-3');
            document.getElementById(ttlId).textContent = ttlValue.toFixed(2);
            totalBilletes += ttlValue;

            if (!primerDatoIngresado) {
                primerDatoIngresado = true;
                document.getElementById(CONFIG.elementos.limpiarTablaBtn).disabled = false;
            }
        }
    }

    // Ingresar tarjetas
    let tarjetaIndex = 0;
    for (; tarjetaIndex < CONFIG.tarjetas.length; currentStep++, tarjetaIndex++) {
        const element = CONFIG.tarjetas[tarjetaIndex];
        const value = await getValue(element.prompt);

        if (document.querySelector('.swal2-container')?.__cancelled) {
            saveDataToLocalStorage();
            return;
        }

        if (value === 'cancel') {
            saveDataToLocalStorage();
            return;
        }

        if (value !== null && value !== 'done') {
            document.getElementById(element.id).textContent = value.toFixed(2);
            if (!primerDatoIngresado) {
                primerDatoIngresado = true;
                document.getElementById(CONFIG.elementos.limpiarTablaBtn).disabled = false;
            }
        }
    }

    // Ingresar gastos/vales
    let totalGastosVales = 0;
    const gastosResult = await getGastoValue('Ingrese los gastos', 'row-9-col-4');
    if (gastosResult) {
        gastosResult.forEach(gasto => {
            totalGastosVales += gasto.amount;
        });
    }
    document.getElementById(CONFIG.elementos.totalGastosCell).textContent = totalGastosVales.toFixed(2);

    // Guardar y calcular totales
    saveDataToLocalStorage();
    document.getElementById(CONFIG.elementos.totalMonedasCell).textContent = totalMonedas.toFixed(2);
    document.getElementById(CONFIG.elementos.totalBilletesCell).textContent = totalBilletes.toFixed(2);

    const fondo = parseFloat(document.getElementById(CONFIG.elementos.fondoCell).textContent) || 0;
    const tEfectivoSF = totalMonedas + totalBilletes + totalGastosVales - fondo;
    const tEfectivoCF = totalMonedas + totalBilletes + totalGastosVales;

    document.getElementById(CONFIG.elementos.totalEfectivoSFCell).textContent = tEfectivoSF.toFixed(2);
    document.getElementById(CONFIG.elementos.totalEfectivoCFCell).textContent = tEfectivoCF.toFixed(2);

    const tDebito = parseFloat(document.getElementById('row-3-col-4').textContent) || 0;
    const tCredito = parseFloat(document.getElementById('row-5-col-4').textContent) || 0;
    const tAmex = parseFloat(document.getElementById('row-7-col-4').textContent) || 0;
    const tTarjetas = tDebito + tCredito + tAmex;

    document.getElementById(CONFIG.elementos.totalTarjetasCell).textContent = tTarjetas.toFixed(2);
    document.getElementById(CONFIG.elementos.totalFinalCell).textContent = (tEfectivoCF + tTarjetas).toFixed(2);

    saveDataToLocalStorage();
    document.getElementById(CONFIG.elementos.sugerirFondoBtn).disabled = false;
    document.getElementById(CONFIG.elementos.editarValorBtn).disabled = false;
    document.getElementById(CONFIG.elementos.ajustarCorteBtn).disabled = false;

    limpiarDatos();
    verificarDatos();
}

/**
 * Sugiere el fondo óptimo
 */
function sugerirFondo() {
    const fondoObjetivo = parseFloat(document.getElementById(CONFIG.elementos.fondoCell).textContent) || CONFIG.fondoDefault;
    const items = [...obtenerMonedas(), ...obtenerBilletes(), ...obtenerVales()];
    const sugerenciaFondo = generarSugerencia(items, fondoObjetivo, true);
    const corteRestante = calcularCorteRestante(sugerenciaFondo);

    const contenidoFondo = generarMensaje(sugerenciaFondo);
    const contenidoCorte = generarMensajeCorte(corteRestante);
    const contenidoPropinas = mostrarPropinasEnSugerencia(propinasEfectivo.total + propinasTarjeta.total, sugerenciaFondo);

    Swal.fire({
        title: 'Sugerencia de Corte',
        html: crearContenidoPestanas(contenidoFondo, contenidoCorte, contenidoPropinas),
        width: '600px',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Reiniciar',
        showDenyButton: true,
        denyButtonText: 'Cambiar Prioridad'
    }).then((result) => {
        if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
            sugerirFondo();
        } else if (result.isDenied) {
            sugerirFondo();
        }
    });

    mostrarTab('tab1');
}

/**
 * Habilita edición de celdas
 */
let editTimeout;

function habilitarEdicion() {
    Swal.fire({
        title: 'Aviso',
        text: 'Toca cualquier celda para editar',
        timer: 1000,
        timerProgressBar: true,
        showConfirmButton: false
    }).then(() => {
        let celdas = document.querySelectorAll(
            'td[id^="row-"][id$="-col-2"], td[id="row-3-col-4"], td[id="row-5-col-4"], ' +
            'td[id="row-7-col-4"], td[id="row-9-col-4"], td[id="row-10-col-4"], ' +
            'td[id="row-11-col-4"], td[id="row-12-col-4"], td[id="row-13-col-4"]'
        );
        celdas.forEach(celda => {
            celda.style.backgroundColor = 'yellow';
            celda.addEventListener('click', editarCelda);
        });

        editTimeout = setTimeout(() => {
            Swal.fire({
                title: 'Aviso',
                text: 'Cerrando la edición de valores, pulsa el botón "Continuar" si deseas seguir editando',
                confirmButtonText: 'Continuar',
                timerProgressBar: true,
                timer: 2000
            }).then(result => {
                if (result.isConfirmed) {
                    habilitarEdicion();
                } else {
                    celdas.forEach(celda => {
                        celda.style.backgroundColor = '';
                        celda.removeEventListener('click', editarCelda);
                    });
                }
            });
        }, CONFIG.timeoutEdicion);
    });
}

/**
 * Edita una celda individual
 */
async function editarCelda(event) {
    clearTimeout(editTimeout);
    let celda = event.target;
    let tipo = celda.previousElementSibling ? celda.previousElementSibling.textContent : '';

    const tarjetaIDs = {
        'row-3-col-4': 'T.Débito',
        'row-5-col-4': 'T.Crédito',
        'row-7-col-4': 'T.Amex'
    };

    const valesBolsasIDs = {
        'row-9-col-4': 'ValesBolsas1',
        'row-10-col-4': 'ValesBolsas2',
        'row-11-col-4': 'ValesBolsas3',
        'row-12-col-4': 'ValesBolsas4',
        'row-13-col-4': 'ValesBolsas5'
    };

    if (tarjetaIDs[celda.id]) {
        tipo = tarjetaIDs[celda.id];
    } else if (valesBolsasIDs[celda.id]) {
        tipo = valesBolsasIDs[celda.id];
    } else if (celda.previousElementSibling) {
        tipo = celda.previousElementSibling.textContent;
    }

    if (valesBolsasIDs[celda.id]) {
        editarGastoCelda(`Ingrese el valor para ${tipo}`, celda.id).then(result => {
            if (result) {
                celda.textContent = result.displayText;
                actualizarTotales();
            }
            celda.style.backgroundColor = '';
            celda.removeEventListener('click', editarCelda);
            iniciarTemporizador();
        });
    } else {
        Swal.fire({
            title: 'Editar valor',
            text: `¿Deseas editar el valor de ${tipo}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        }).then(result => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Nuevo valor',
                    text: `Ingresa el nuevo valor para ${tipo}`,
                    input: 'number',
                    showCancelButton: true,
                    confirmButtonText: 'Aceptar',
                    cancelButtonText: 'Cancelar',
                    preConfirm: (nuevoValor) => {
                        if (!nuevoValor) {
                            Swal.showValidationMessage('Debes ingresar un valor');
                        }
                        return nuevoValor;
                    }
                }).then(result => {
                    if (result.isConfirmed) {
                        celda.textContent = result.value;
                        actualizarTotales();
                        celda.style.backgroundColor = '';
                        celda.removeEventListener('click', editarCelda);
                        iniciarTemporizador();
                    }
                });
            } else {
                celda.style.backgroundColor = '';
                celda.removeEventListener('click', editarCelda);
                habilitarEdicion();
            }
        });
    }
}

/**
 * Edita una celda de gasto
 */
async function editarGastoCelda(promptText, gastoId) {
    const cell = document.getElementById(gastoId);
    const cellText = cell ? cell.textContent : '';

    let initialType = '';
    let initialValeAmount = '';
    let initialMonedaType = '';
    let initialMonedaAmount = '';

    if (cellText.includes('Vales')) {
        initialType = 'vales';
        initialValeAmount = cellText.split('=')[1].trim();
    } else {
        const parts = cellText.split('=');
        if (parts.length === 2) {
            const possibleMonedaType = parseFloat(parts[0].trim());
            if (!isNaN(possibleMonedaType) && possibleMonedaType >= 0.5 && possibleMonedaType <= 10) {
                initialType = 'bolsaMonedas';
                initialMonedaType = parts[0].trim();
                initialMonedaAmount = parts[1].trim();
            }
        }
    }

    function createInputHTML() {
        if (initialType === 'vales') {
            return `<div id="vales-input"><input id="vales-amount" type="number" class="swal2-input" placeholder="Cantidad de Vales" value="${initialValeAmount}"></div>`;
        } else if (initialType === 'bolsaMonedas') {
            return `<div id="bolsa-input"><input id="moneda-type" type="number" class="swal2-input" placeholder="Tipo de Moneda (Valor)" value="${initialMonedaType}"><input id="moneda-amount" type="number" class="swal2-input" placeholder="Cantidad de Dinero" value="${initialMonedaAmount}"></div>`;
        }
        return '<div>No se detectó un tipo válido</div>';
    }

    function validateAndGetFormValues() {
        if (initialType === 'vales') {
            const valesAmount = parseFloat(Swal.getPopup().querySelector('#vales-amount').value);
            if (isNaN(valesAmount) || valesAmount <= 0) {
                Swal.showValidationMessage('Por favor, ingrese una cantidad válida para los vales');
                return false;
            }
            return {
                type: 'vales',
                amount: valesAmount,
                displayText: `Vales = ${valesAmount.toFixed(2)}`,
                dataType: 'vales'
            };
        } else if (initialType === 'bolsaMonedas') {
            const monedaType = parseFloat(Swal.getPopup().querySelector('#moneda-type').value);
            const monedaAmount = parseFloat(Swal.getPopup().querySelector('#moneda-amount').value);
            if (isNaN(monedaType) || isNaN(monedaAmount) || monedaType <= 0 || monedaAmount <= 0) {
                Swal.showValidationMessage('Por favor, ingrese valores válidos para el tipo de moneda y la cantidad');
                return false;
            }
            return {
                type: 'bolsaMonedas',
                amount: monedaAmount,
                displayText: `${monedaType} = ${monedaAmount.toFixed(2)}`,
                dataType: 'bolsaMonedas'
            };
        }
        Swal.showValidationMessage('Por favor, seleccione un tipo de gasto');
        return false;
    }

    const swalResult = await Swal.fire({
        title: promptText,
        html: createInputHTML(),
        focusConfirm: false,
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        preConfirm: validateAndGetFormValues
    });

    if (swalResult.isConfirmed) {
        const newValue = { ...swalResult.value };
        const cell = document.getElementById(gastoId);
        if (cell) {
            cell.setAttribute('data-type', newValue.dataType);
            cell.textContent = newValue.displayText;
            actualizarTotales();
        }
        return newValue;
    }
    return null;
}

/**
 * Inicia temporizador para edición
 */
function iniciarTemporizador() {
    editTimeout = setTimeout(() => {
        Swal.fire({
            title: 'Aviso',
            text: 'Cerrado la edición de valores, pulsa el botón "Continuar" si deseas seguir editando',
            confirmButtonText: 'Continuar',
            timerProgressBar: true,
            timer: 1500
        }).then(result => {
            if (result.isConfirmed) {
                habilitarEdicion();
            } else {
                let celdas = document.querySelectorAll(
                    'td[id^="row-"][id$="-col-2"], td[id="row-3-col-4"], td[id="row-5-col-4"], ' +
                    'td[id="row-7-col-4"], td[id="row-9-col-4"], td[id="row-10-col-4"], ' +
                    'td[id="row-11-col-4"], td[id="row-12-col-4"], td[id="row-13-col-4"]'
                );
                celdas.forEach(celda => {
                    celda.style.backgroundColor = '';
                    celda.removeEventListener('click', editarCelda);
                });
            }
        });
    }, CONFIG.timeoutMensajeEdicion);
}

/**
 * Ajusta el corte
 */
async function ajustarCorte() {
    const { value: formValues } = await Swal.fire({
        title: 'Ajustar Corte',
        html: `
            <h3>Monedas:</h3>
            <div>$10 x <input id="moneda10" type="number" oninput="window.actualizarTotalAjuste()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
            <div>$5 x <input id="moneda5" type="number" oninput="window.actualizarTotalAjuste()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
            <div>$2 x <input id="moneda2" type="number" oninput="window.actualizarTotalAjuste()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
            <div>$1 x <input id="moneda1" type="number" oninput="window.actualizarTotalAjuste()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
            <h3>Billetes:</h3>
            <div>$1000 x <input id="billete1000" type="number" oninput="window.actualizarTotalAjuste()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
            <div>$500 x <input id="billete500" type="number" oninput="window.actualizarTotalAjuste()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
            <div>$200 x <input id="billete200" type="number" oninput="window.actualizarTotalAjuste()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
            <div>$100 x <input id="billete100" type="number" oninput="window.actualizarTotalAjuste()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
            <div>$50 x <input id="billete50" type="number" oninput="window.actualizarTotalAjuste()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
            <div>$20 x <input id="billete20" type="number" oninput="window.actualizarTotalAjuste()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
            <br>
            <h3>Total: $<span id="total">0.00</span></h3>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Corregir',
        preConfirm: () => {
            const monedas = {
                '10': document.getElementById('moneda10').value,
                '5': document.getElementById('moneda5').value,
                '2': document.getElementById('moneda2').value,
                '1': document.getElementById('moneda1').value
            };
            const billetes = {
                '1000': document.getElementById('billete1000').value,
                '500': document.getElementById('billete500').value,
                '200': document.getElementById('billete200').value,
                '100': document.getElementById('billete100').value,
                '50': document.getElementById('billete50').value,
                '20': document.getElementById('billete20').value
            };
            return { monedas, billetes };
        }
    });

    if (formValues) {
        const total = calcularTotal(formValues);
        restarDeFormulario(formValues);
        Swal.fire('Corte ajustado', `Se han ajustado los valores del corte por un total de $${total.toFixed(2)}`, 'success');
    }
}

/**
 * Edita el fondo
 */
async function editarFondo() {
    const fondoActual = parseFloat(document.getElementById(CONFIG.elementos.fondoCell).textContent) || CONFIG.fondoDefault;

    const { value: nuevoFondo } = await Swal.fire({
        title: 'Editar Fondo',
        text: 'Ingrese la nueva cantidad para el fondo:',
        input: 'number',
        inputValue: fondoActual,
        inputAttributes: { step: 'any', min: '0' },
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value || isNaN(value) || parseFloat(value) < 0) {
                return 'Por favor, ingrese un valor numérico válido mayor o igual a 0';
            }
        }
    });

    if (nuevoFondo) {
        document.getElementById(CONFIG.elementos.fondoCell).textContent = parseFloat(nuevoFondo).toFixed(2);
        actualizarTotales();

        if (localStorage.getItem(STORAGE_KEYS.corteInProgress)) {
            const savedData = obtenerDatos();
            savedData.values[CONFIG.elementos.fondoCell] = parseFloat(nuevoFondo).toFixed(2);
            guardarDatos(savedData);
        }

        Swal.fire({
            title: 'Fondo Actualizado',
            text: `El fondo se ha actualizado a $${parseFloat(nuevoFondo).toFixed(2)}`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializa la aplicación
 */
function inicializar() {
    console.log('🚀 Inicializando Hoja de Corte...');

    // Setup handlers
    setupSwalCloseHandler();

    // Verificar datos
    verificarDatos();

    // Event listeners para propinas
    const propinasEfectivoCell = document.getElementById(CONFIG.elementos.propinasEfectivoCell);
    if (propinasEfectivoCell) {
        propinasEfectivoCell.addEventListener('click', () => {
            actualizarPropina(CONFIG.elementos.propinasEfectivoCell, 'Propina en Efectivo');
        });
    }

    const propinasTarjetaCell = document.getElementById(CONFIG.elementos.propinasTarjetaCell);
    if (propinasTarjetaCell) {
        propinasTarjetaCell.addEventListener('click', () => {
            actualizarPropina(CONFIG.elementos.propinasTarjetaCell, 'Propina en Tarjeta');
        });
    }

    // Event listener para editar fondo
    const fondoCell = document.getElementById(CONFIG.elementos.fondoCell);
    if (fondoCell) {
        fondoCell.addEventListener('click', editarFondo);
    }

    console.log('✅ Aplicación lista');
}

// Exposer funciones globales
window.iniciarCorte = iniciarCorte;
window.sugerirFondo = sugerirFondo;
window.habilitarEdicion = habilitarEdicion;
window.ajustarCorte = ajustarCorte;
window.limpiarTabla = limpiarTabla;
window.actualizarTotalAjuste = function () {
    const monedas = ['10', '5', '2', '1'].reduce((acc, key) => {
        acc[key] = document.getElementById(`moneda${key}`)?.value || 0;
        return acc;
    }, {});

    const billetes = ['1000', '500', '200', '100', '50', '20'].reduce((acc, key) => {
        acc[key] = document.getElementById(`billete${key}`)?.value || 0;
        return acc;
    }, {});

    const total = calcularTotal({ monedas, billetes });
    const totalEl = document.getElementById('total');
    if (totalEl) totalEl.textContent = total.toFixed(2);
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializar);
window.addEventListener('load', verificarDatos);
