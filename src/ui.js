/**
 * ============================================
 * MÓDULO DE INTERFAZ DE USUARIO
 * ============================================
 * Gestiona todos los eventos y actualizaciones de UI
 */

import { CONFIG } from './config.js';
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
import { guardarDatos, construirDatosParaGuardar, limpiarDatos } from './storage.js';

// Estado global para propinas
export let propinasEfectivo = { monedas: {}, billetes: {}, total: 0 };
export let propinasTarjeta = { monedas: {}, billetes: {}, total: 0 };
let priorizarMonedas = true;
let editTimeout;

/**
 * Verifica si hay datos en la tabla o en localStorage
 */
export function verificarDatos() {
    let hayDatosEnTabla = CONFIG.idsVerificacion.some(id => {
        let element = document.getElementById(id);
        return element && element.textContent.trim() !== '';
    });

    let hayDatosEnLocalStorage = localStorage.getItem('corteInProgress') !== null;

    let btn = document.getElementById(CONFIG.elementos.limpiarTablaBtn);
    if (btn) {
        btn.disabled = !(hayDatosEnTabla || hayDatosEnLocalStorage);
    }
}

/**
 * Limpia toda la tabla y localStorage
 */
export function limpiarTabla() {
    CONFIG.idsLimpiar.forEach(id => {
        let element = document.getElementById(id);
        if (element) {
            element.textContent = '';
        }
    });

    document.getElementById(CONFIG.elementos.sugerirFondoBtn).disabled = true;
    document.getElementById(CONFIG.elementos.limpiarTablaBtn).disabled = true;
    document.getElementById(CONFIG.elementos.ajustarCorteBtn).disabled = true;

    limpiarDatos();
    propinasEfectivo = { monedas: {}, billetes: {}, total: 0 };
    propinasTarjeta = { monedas: {}, billetes: {}, total: 0 };

    verificarDatos();
}

/**
 * Obtiene valores mediante SweetAlert2
 */
export async function getValue(promptText, showDenyButton = false) {
    const result = await Swal.fire({
        title: promptText,
        input: 'number',
        inputAttributes: {
            autocapitalize: 'off',
            inputmode: 'decimal',
            step: 'any'
        },
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        showDenyButton: showDenyButton,
        denyButtonText: 'Listo',
        allowOutsideClick: false,
        allowEscapeKey: false,
        html: `<button class="swal2-close" style="position: absolute; top: 0; right: 0; background: none; border: none; font-size: 1.5em; cursor: pointer;">&times;</button>`
    });

    if (result.isDenied) return 'done';
    if (result.dismiss === Swal.DismissReason.cancel || result.dismiss === Swal.DismissReason.backdrop) return 'cancel';

    return result.value ? parseFloat(result.value) : null;
}

/**
 * Obtiene valores de gastos/vales
 */
export async function getGastoValue(promptText, gastoId) {
    let allValues = [];
    let currentIndex = parseInt(gastoId.split('-')[1]) - 9;
    let maxIndex = 4;

    function createInputHTML() {
        return `
            <select id="gasto-type" class="swal2-input">
                <option value="" disabled selected>Seleccione una opción</option>
                <option value="vales">Vales</option>
                <option value="bolsaMonedas">BolsaMonedas</option>
            </select>
            <div id="vales-input" style="display:none;">
                <input id="vales-amount" type="number" class="swal2-input" placeholder="Cantidad de Vales">
            </div>
            <div id="bolsa-input" style="display:none;">
                <input id="moneda-type" type="number" class="swal2-input" placeholder="Tipo de Moneda (Valor)">
                <input id="moneda-amount" type="number" class="swal2-input" placeholder="Cantidad de Dinero">
            </div>
        `;
    }

    function setupEventListeners() {
        const gastoTypeSelect = Swal.getPopup().querySelector('#gasto-type');
        const valesInput = Swal.getPopup().querySelector('#vales-input');
        const bolsaInput = Swal.getPopup().querySelector('#bolsa-input');
        gastoTypeSelect.addEventListener('change', (event) => {
            if (event.target.value === 'vales') {
                valesInput.style.display = 'block';
                bolsaInput.style.display = 'none';
            } else if (event.target.value === 'bolsaMonedas') {
                valesInput.style.display = 'none';
                bolsaInput.style.display = 'block';
            } else {
                valesInput.style.display = 'none';
                bolsaInput.style.display = 'none';
            }
        });
    }

    function validateAndGetFormValues() {
        const gastoType = Swal.getPopup().querySelector('#gasto-type').value;
        if (gastoType === 'vales') {
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
        } else if (gastoType === 'bolsaMonedas') {
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

    async function showGastoForm(index) {
        return Swal.fire({
            title: `${promptText} (Gasto ${index + 1})`,
            html: createInputHTML(),
            focusConfirm: false,
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonText: 'Agregar',
            cancelButtonText: 'Finalizar',
            didOpen: setupEventListeners,
            preConfirm: validateAndGetFormValues
        });
    }

    while (currentIndex <= maxIndex) {
        const swalResult = await showGastoForm(currentIndex);

        if (swalResult.isConfirmed) {
            allValues.push({ ...swalResult.value, index: currentIndex });
            currentIndex++;

            if (currentIndex <= maxIndex) {
                const nextResult = await Swal.fire({
                    title: '¿Desea agregar otro gasto?',
                    showCancelButton: true,
                    confirmButtonText: 'Sí',
                    cancelButtonText: 'No'
                });

                if (!nextResult.isConfirmed) break;
            } else {
                break;
            }
        } else {
            break;
        }
    }

    allValues.forEach(value => {
        const cellId = `row-${value.index + 9}-col-4`;
        const cell = document.getElementById(cellId);
        if (cell) {
            cell.setAttribute('data-type', value.dataType);
            cell.textContent = value.displayText;
        }
    });

    for (let i = allValues.length; i < 5; i++) {
        const cellId = `row-${i + 9}-col-4`;
        const cell = document.getElementById(cellId);
        if (cell) {
            cell.removeAttribute('data-type');
            cell.textContent = '';
        }
    }

    return allValues.length > 0 ? allValues : null;
}

/**
 * Actualiza propina en celda
 */
export async function actualizarPropina(celdaId, tipoPropina) {
    let formValues;

    if (tipoPropina === 'Propina en Tarjeta') {
        const { value } = await Swal.fire({
            title: 'Ingresa el valor de propinas tarjeta',
            input: 'number',
            inputAttributes: { autocapitalize: 'off', step: 'any' },
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar'
        });

        if (value) {
            formValues = { total: parseFloat(value) };
            document.getElementById(celdaId).textContent = value;
            propinasTarjeta.total = formValues.total;
            const { restarDeTotal } = await import('./calculations.js');
            restarDeTotal(CONFIG.elementos.totalTarjetasCell, formValues.total);
        }
    } else {
        const { value: propinasFormValues } = await Swal.fire({
            title: `Ingrese la cantidad para ${tipoPropina}`,
            html: `
                <h3>Monedas:</h3>
                <div>$10 x <input id="moneda10" type="number" oninput="window.actualizarTotalPropina()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
                <div>$5 x <input id="moneda5" type="number" oninput="window.actualizarTotalPropina()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
                <div>$2 x <input id="moneda2" type="number" oninput="window.actualizarTotalPropina()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
                <div>$1 x <input id="moneda1" type="number" oninput="window.actualizarTotalPropina()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
                <h3>Billetes:</h3>
                <div>$1000 x <input id="billete1000" type="number" oninput="window.actualizarTotalPropina()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
                <div>$500 x <input id="billete500" type="number" oninput="window.actualizarTotalPropina()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
                <div>$200 x <input id="billete200" type="number" oninput="window.actualizarTotalPropina()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
                <div>$100 x <input id="billete100" type="number" oninput="window.actualizarTotalPropina()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
                <div>$50 x <input id="billete50" type="number" oninput="window.actualizarTotalPropina()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
                <div>$20 x <input id="billete20" type="number" oninput="window.actualizarTotalPropina()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
                <br>
                <h3>Total: $<span id="total">0.00</span></h3>
            `,
            focusConfirm: false,
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

        if (propinasFormValues) {
            const total = calcularTotal(propinasFormValues);
            document.getElementById(celdaId).textContent = total;

            if (celdaId === CONFIG.elementos.propinasEfectivoCell) {
                propinasEfectivo = propinasFormValues;
                propinasEfectivo.total = total;
                const { restarDeTotal } = await import('./calculations.js');
                restarDeTotal(CONFIG.elementos.totalEfectivoSFCell, total);
                restarDeTotal(CONFIG.elementos.totalEfectivoCFCell, total);
            }
        }
    }

    document.getElementById(CONFIG.elementos.sugerirFondoBtn).disabled = false;
    document.getElementById(CONFIG.elementos.limpiarTablaBtn).disabled = false;
}

/**
 * Genera contenido de propinas para display
 */
export function generarContenidoPropinas() {
    let contenido = '';
    if (propinasEfectivo.total > 0) {
        contenido += `<h3>Propina Efectivo: $${propinasEfectivo.total.toFixed(2)}</h3>`;
        if (Object.keys(propinasEfectivo.monedas).length > 0) {
            contenido += '<h4>Monedas:</h4>';
            for (let [key, value] of Object.entries(propinasEfectivo.monedas)) {
                if (value > 0) {
                    let subtotal = key * value;
                    contenido += `$${key} x ${value} = $${subtotal.toFixed(2)}<br>`;
                }
            }
        }
        if (Object.keys(propinasEfectivo.billetes).length > 0) {
            contenido += '<h4>Billetes:</h4>';
            for (let [key, value] of Object.entries(propinasEfectivo.billetes)) {
                if (value > 0) {
                    let subtotal = key * value;
                    contenido += `$${key} x ${value} = $${subtotal.toFixed(2)}<br>`;
                }
            }
        }
    }

    if (propinasTarjeta.total > 0) {
        contenido += `<h3>Propina Tarjeta: $${propinasTarjeta.total.toFixed(2)}</h3>`;
    }

    return contenido;
}

/**
 * Genera mensaje de sugerencia
 */
export function generarMensaje(sugerencia) {
    let mensaje = 'Sugerencia para el fondo solicitado:<br>';
    let total = 0;
    let totalMonedas = 0;
    let totalBilletes = 0;

    let monedas = sugerencia.filter(item => item.denominacion < 20);
    let billetes = sugerencia.filter(item => item.denominacion >= 20);

    if (monedas.length > 0) {
        mensaje += 'Monedas:<br>';
        monedas.forEach(item => {
            let denominacion = item.denominacion % 1 === 0 ? item.denominacion.toFixed(0) : item.denominacion.toFixed(2);
            let subtotal = item.denominacion * item.cantidad;
            totalMonedas += subtotal;
            mensaje += `$${denominacion} x ${item.cantidad} = $${subtotal.toFixed(2)}<br>`;
        });
    }

    if (billetes.length > 0) {
        mensaje += 'Billetes:<br>';
        billetes.forEach(item => {
            let denominacion = item.denominacion % 1 === 0 ? item.denominacion.toFixed(0) : item.denominacion.toFixed(2);
            let subtotal = item.denominacion * item.cantidad;
            totalBilletes += subtotal;
            mensaje += `$${denominacion} x ${item.cantidad} = $${subtotal.toFixed(2)}<br>`;
        });
    }

    total = totalMonedas + totalBilletes;
    mensaje += `<br>Total de Monedas: $${totalMonedas.toFixed(2)}<br>`;
    mensaje += `Total de Billetes: $${totalBilletes.toFixed(2)}<br>`;
    mensaje += `<br>Total: $${total.toFixed(2)}`;

    return mensaje;
}

/**
 * Genera mensaje de corte restante
 */
export function generarMensajeCorte(corteRestante) {
    let mensaje = 'Corte restante:<br>';
    let totalMonedas = 0;
    let totalBilletes = 0;

    Object.keys(corteRestante).forEach(denominacion => {
        let cantidad = corteRestante[denominacion];
        if (cantidad > 0) {
            let subtotal = denominacion * cantidad;
            if (denominacion < 20) {
                totalMonedas += subtotal;
                mensaje += `$${denominacion} x ${cantidad} = $${subtotal.toFixed(2)}<br>`;
            } else {
                totalBilletes += subtotal;
                mensaje += `$${denominacion} x ${cantidad} = $${subtotal.toFixed(2)}<br>`;
            }
        }
    });

    let total = totalMonedas + totalBilletes;
    mensaje += `<br>Total de Monedas: $${totalMonedas.toFixed(2)}<br>`;
    mensaje += `Total de Billetes: $${totalBilletes.toFixed(2)}<br>`;
    mensaje += `<br>Total: $${total.toFixed(2)}`;

    return mensaje;
}

/**
 * Crea contenido de pestañas para modal de sugerencia
 */
export function crearContenidoPestanas(contenidoFondo, contenidoCorte, contenidoPropinas) {
    return `
        <div>
            <div id="tab-container" style="text-align: center; margin-bottom: 10px;">
                <button id="tab-1" class="swal2-styled tab-btn" onclick="window.mostrarTab('tab1')">Fondo</button>
                <button id="tab-2" class="swal2-styled tab-btn" onclick="window.mostrarTab('tab2')">Corte</button>
                <button id="tab-3" class="swal2-styled tab-btn" onclick="window.mostrarTab('tab3')">Propinas</button>
            </div>
            <div id="tab1" class="tab-content">${contenidoFondo}</div>
            <div id="tab2" class="tab-content" style="display:none;">${contenidoCorte}</div>
            <div id="tab3" class="tab-content" style="display:none;">${contenidoPropinas}</div>
        </div>
    `;
}

/**
 * Muestra una pestaña específica
 */
export function mostrarTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(tabId).style.display = 'block';
}

/**
 * Genera propinas en sugerencia
 */
export function mostrarPropinasEnSugerencia(totalPropinas, combinacionPropinas) {
    let mensaje = `Propina efectivo: $${propinasEfectivo.total.toFixed(2)}<br>`;
    mensaje += `Propina tarjeta: $${propinasTarjeta.total.toFixed(2)}<br>`;
    mensaje += `Propina total: $${totalPropinas.toFixed(2)}<br><br>`;

    let totalMonedasPropinas = 0;
    let totalBilletesPropinas = 0;
    let totalMonedasCorte = 0;
    let totalBilletesCorte = 0;

    let detalleMonedasPropinas = '';
    let detalleBilletesPropinas = '';
    let detalleMonedasCorte = '';
    let detalleBilletesCorte = '';

    if (Object.keys(propinasEfectivo.monedas).length > 0) {
        detalleMonedasPropinas += '<h4>Monedas (Propinas Efectivo):</h4>';
        Object.entries(propinasEfectivo.monedas).forEach(([denominacion, cantidad]) => {
            if (cantidad > 0) {
                let subtotal = parseFloat(denominacion) * cantidad;
                totalMonedasPropinas += subtotal;
                detalleMonedasPropinas += `$${denominacion} x ${cantidad} = $${subtotal.toFixed(2)}<br>`;
            }
        });
    }

    if (Object.keys(propinasEfectivo.billetes).length > 0) {
        detalleBilletesPropinas += '<h4>Billetes (Propinas Efectivo):</h4>';
        Object.entries(propinasEfectivo.billetes).forEach(([denominacion, cantidad]) => {
            if (cantidad > 0) {
                let subtotal = parseFloat(denominacion) * cantidad;
                totalBilletesPropinas += subtotal;
                detalleBilletesPropinas += `$${denominacion} x ${cantidad} = $${subtotal.toFixed(2)}<br>`;
            }
        });
    }

    detalleMonedasCorte += '<h4>Monedas (Corte Restante):</h4>';
    detalleBilletesCorte += '<h4>Billetes (Corte Restante):</h4>';
    combinacionPropinas.forEach(item => {
        let subtotal = item.denominacion * item.cantidad;
        if (item.denominacion < 20) {
            totalMonedasCorte += subtotal;
            detalleMonedasCorte += `$${item.denominacion} x ${item.cantidad} = $${subtotal.toFixed(2)}<br>`;
        } else {
            totalBilletesCorte += subtotal;
            detalleBilletesCorte += `$${item.denominacion} x ${item.cantidad} = $${subtotal.toFixed(2)}<br>`;
        }
    });

    let totalMonedas = totalMonedasPropinas + totalMonedasCorte;
    let totalBilletes = totalBilletesPropinas + totalBilletesCorte;

    if (detalleMonedasPropinas) mensaje += detalleMonedasPropinas;
    if (detalleBilletesPropinas) mensaje += detalleBilletesPropinas;
    if (detalleMonedasCorte) mensaje += detalleMonedasCorte;
    if (detalleBilletesCorte) mensaje += detalleBilletesCorte;

    mensaje += `<br>Total de Monedas: $${totalMonedas.toFixed(2)}<br>`;
    mensaje += `Total de Billetes: $${totalBilletes.toFixed(2)}<br>`;
    mensaje += `<br>Total: $${(totalMonedas + totalBilletes).toFixed(2)}`;

    return mensaje;
}

// Exposer funciones globales para window
window.actualizarTotalPropina = function () {
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

window.mostrarTab = mostrarTab;
