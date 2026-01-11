// Función para verificar si hay datos en la tabla o en localStorage
function verificarDatos() {
    const idsToCheck = [
        'row-2-col-3', 'row-3-col-4', 'row-4-col-2', 'row-4-col-3', 'row-5-col-2', 'row-5-col-3',
        'row-5-col-4', 'row-6-col-2', 'row-6-col-3', 'row-7-col-2', 'row-7-col-3', 'row-7-col-4',
        'row-8-col-2', 'row-8-col-3', 'row-8-col-5', 'row-9-col-3', 'row-9-col-4', 'row-10-col-2',
        'row-10-col-3', 'row-10-col-4', 'row-11-col-2', 'row-11-col-3', 'row-11-col-4', 'row-12-col-2',
        'row-12-col-3', 'row-12-col-4', 'row-13-col-2', 'row-13-col-3', 'row-13-col-4', 'row-14-col-2',
        'row-14-col-3', 'row-15-col-2', 'row-15-col-3', 'row-19-col-1', 'row-19-col-4', 'row-21-col-1',
        'row-21-col-4'
    ];

    let hayDatosEnTabla = idsToCheck.some(id => {
        let element = document.getElementById(id);
        return element && element.textContent.trim() !== '';
    });

    let hayDatosEnLocalStorage = localStorage.getItem('corteInProgress') !== null;

    if (hayDatosEnTabla || hayDatosEnLocalStorage) {
        document.getElementById('limpiarTablaBtn').disabled = false;
    } else {
        document.getElementById('limpiarTablaBtn').disabled = true;
    }
}
// Llama a la función verificarDatos al cargar la página
window.addEventListener('load', verificarDatos);

// Modifica la función iniciarCorte para incluir la verificación de datos

async function iniciarCorte() {
    let currentStep = 0;

    if (localStorage.getItem('corteInProgress')) {
        const { isConfirmed } = await Swal.fire({
            title: 'Continuar desde el último guardado',
            text: 'Se encontró un corte en progreso. ¿Desea continuar desde donde se interrumpió?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        });

        if (isConfirmed) {
            const savedData = JSON.parse(localStorage.getItem('corteInProgress'));
            for (const [key, value] of Object.entries(savedData.values)) {
                let element = document.getElementById(key);
                if (element) {
                    element.textContent = value;
                }
            }
            currentStep = savedData.currentStep;
        } else {
            localStorage.removeItem('corteInProgress');
        }
    }

    // Resto del código para obtener valores e interactuar con el usuario
    // Función para obtener el valor ingresado
    async function getValue(promptText, showDenyButton = false) {
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

        if (result.isDenied) {
            return 'done';
        }

        if (result.dismiss === Swal.DismissReason.cancel || result.dismiss === Swal.DismissReason.backdrop || result.dismiss === Swal.DismissReason.esc) {
            return 'cancel';
        }

        return result.value ? parseFloat(result.value) : null;
    }

    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('swal2-close')) {
            Swal.close();
            event.target.closest('.swal2-container').__cancelled = true;
            verificarDatos(); // Verificar datos después de cerrar el Swal
        }
    });

    const saveDataToLocalStorage = () => {
        const dataToSave = {
            values: {},
            currentStep: currentStep
        };
        elements.forEach(element => {
            const value = document.getElementById(element.id).textContent.trim();
            if (value && !isNaN(value)) {
                dataToSave.values[element.id] = value;
            }
            const ttlId = element.id.replace('col-2', 'col-3');
            const ttlValue = document.getElementById(ttlId).textContent.trim();
            if (ttlValue && !isNaN(ttlValue)) {
                dataToSave.values[ttlId] = ttlValue;
            }
        });
        totals.forEach(total => {
            const value = document.getElementById(total.id).textContent.trim();
            if (value && !isNaN(value)) {
                dataToSave.values[total.id] = value;
            }
        });
        const additionalIds = ['row-8-col-5', 'row-2-col-3', 'row-9-col-3', 'row-19-col-1', 'row-21-col-1', 'row-19-col-4', 'row-21-col-4'];
        additionalIds.forEach(id => {
            const value = document.getElementById(id).textContent.trim();
            if (value && !isNaN(value)) {
                dataToSave.values[id] = value;
            }
        });

        localStorage.setItem('corteInProgress', JSON.stringify(dataToSave));
        verificarDatos(); // Verificar datos después de guardar en localStorage
    };

    var elements = [
        { id: 'row-4-col-2', promptText: 'Ingrese el valor para ¢50, Cat', multiplier: 0.5 },
        { id: 'row-5-col-2', promptText: 'Ingrese el valor para $1, Cat', multiplier: 1 },
        { id: 'row-6-col-2', promptText: 'Ingrese el valor para $2, Cat', multiplier: 2 },
        { id: 'row-7-col-2', promptText: 'Ingrese el valor para $5, Cat', multiplier: 5 },
        { id: 'row-8-col-2', promptText: 'Ingrese el valor para $10, Cat', multiplier: 10 },
        { id: 'row-10-col-2', promptText: 'Ingrese el valor para $20, Cat', multiplier: 20 },
        { id: 'row-11-col-2', promptText: 'Ingrese el valor para $50, Cat', multiplier: 50 },
        { id: 'row-12-col-2', promptText: 'Ingrese el valor para $100, Cat', multiplier: 100 },
        { id: 'row-13-col-2', promptText: 'Ingrese el valor para $200, Cat', multiplier: 200 },
        { id: 'row-14-col-2', promptText: 'Ingrese el valor para $500, Cat', multiplier: 500 },
        { id: 'row-15-col-2', promptText: 'Ingrese el valor para $1,000, Cat', multiplier: 1000 }
    ];

    var totals = [
        { id: 'row-3-col-4', promptText: 'Ingrese el valor para T.Débito' },
        { id: 'row-5-col-4', promptText: 'Ingrese el valor para T.Crédito' },
        { id: 'row-7-col-4', promptText: 'Ingrese el valor para T.Amex' }
    ];

    var totalMonedas = 0;
    var totalBilletes = 0;
    var primerDatoIngresado = false;

    for (; currentStep < elements.length; currentStep++) {
        const element = elements[currentStep];
        const value = await getValue(element.promptText);
        if (document.querySelector('.swal2-container').__cancelled) {
            saveDataToLocalStorage();
            verificarDatos();
            return;
        }
        if (value === 'cancel') {
            saveDataToLocalStorage();
            verificarDatos();
            return;
        }
        if (value !== null && value !== 'done') {
            document.getElementById(element.id).textContent = value;
            if (element.multiplier) {
                const ttlValue = value * element.multiplier;
                const ttlId = element.id.replace('col-2', 'col-3');
                document.getElementById(ttlId).textContent = ttlValue.toFixed(2);
                if (element.id >= 'row-4-col-2' && element.id <= 'row-8-col-2') {
                    totalMonedas += ttlValue;
                } else if (element.id >= 'row-10-col-2' && element.id <= 'row-15-col-2') {
                    totalBilletes += ttlValue;
                }
            }
            if (!primerDatoIngresado) {
                primerDatoIngresado = true;
                document.getElementById('limpiarTablaBtn').disabled = false; // Habilitar botón "Limpiar Tabla"
            }
        }
    }

    for (; currentStep - elements.length < totals.length; currentStep++) {
        const total = totals[currentStep - elements.length];
        const value = await getValue(total.promptText);
        if (document.querySelector('.swal2-container').__cancelled) {
            saveDataToLocalStorage();
            verificarDatos();
            return;
        }
        if (value === 'cancel') {
            saveDataToLocalStorage();
            verificarDatos();
            return;
        }
        if (value !== null && value !== 'done') {
            document.getElementById(total.id).textContent = value.toFixed(2);
            if (!primerDatoIngresado) {
                primerDatoIngresado = true;
                document.getElementById('limpiarTablaBtn').disabled = false; // Habilitar botón "Limpiar Tabla"
            }
        }
    }

    var totalGastosVales = 0;
    const gastosResult = await getGastoValue('Ingrese los gastos', 'row-9-col-4');
    if (gastosResult) {
        gastosResult.forEach(gasto => {
            totalGastosVales += gasto.amount;
        });
    }
    document.getElementById('row-8-col-5').textContent = totalGastosVales.toFixed(2);

    // Guardar datos en localStorage
    saveDataToLocalStorage();
    document.getElementById('row-2-col-3').textContent = totalMonedas.toFixed(2);
    document.getElementById('row-9-col-3').textContent = totalBilletes.toFixed(2);

    var fondo = parseFloat(document.getElementById('row-15-col-4').textContent) || 0;
    var tEfectivoSF = totalMonedas + totalBilletes + totalGastosVales - fondo;
    document.getElementById('row-19-col-1').textContent = tEfectivoSF.toFixed(2);

    var tEfectivoCF = totalMonedas + totalBilletes + totalGastosVales;
    document.getElementById('row-21-col-1').textContent = tEfectivoCF.toFixed(2);

    var tDebito = parseFloat(document.getElementById('row-3-col-4').textContent) || 0;
    var tCredito = parseFloat(document.getElementById('row-5-col-4').textContent) || 0;
    var tAmex = parseFloat(document.getElementById('row-7-col-4').textContent) || 0;
    var tTarjetas = tDebito + tCredito + tAmex;
    document.getElementById('row-19-col-4').textContent = tTarjetas.toFixed(2);

    var tFinal = tEfectivoCF + tTarjetas;
    document.getElementById('row-21-col-4').textContent = tFinal.toFixed(2);

    // Guardar datos en localStorage
    saveDataToLocalStorage();

    document.getElementById('sugerirFondoBtn').disabled = false;
    document.getElementById('limpiarTablaBtn').disabled = false;
    document.getElementById('editarValorBtn').disabled = false;
    document.getElementById('ajustarCorteBtn').disabled = false;


    // Limpiar datos guardados en localStorage al finalizar correctamente
    localStorage.removeItem('corteInProgress');
    verificarDatos();
}

let propinasEfectivo = { monedas: {}, billetes: {}, total: 0 };
let propinasTarjeta = { monedas: {}, billetes: {}, total: 0 };

async function actualizarPropina(celdaId, tipoPropina) {
    let formValues;

    if (tipoPropina === 'Propina en Tarjeta') {
        const { value } = await Swal.fire({
            title: 'Ingresa el valor de propinas tarjeta',
            input: 'number',
            inputAttributes: {
                autocapitalize: 'off',
                step: 'any'
            },
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar'
        });

        if (value) {
            formValues = { total: parseFloat(value) };
            document.getElementById(celdaId).textContent = value;
            propinasTarjeta.total = formValues.total;
            restarDeTotal('row-19-col-4', formValues.total);
        }
    } else {
        const { value: formValues } = await Swal.fire({
            title: `Ingrese la cantidad para ${tipoPropina}`,
            html: `
                <h3>Monedas:</h3>
                <div>$10 x <input id="moneda10" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
                <div>$5 x <input id="moneda5" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
                <div>$2 x <input id="moneda2" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
                <div>$1 x <input id="moneda1" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
                <h3>Billetes:</h3>
                <div>$1000 x <input id="billete1000" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
                <div>$500 x <input id="billete500" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
                <div>$200 x <input id="billete200" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
                <div>$100 x <input id="billete100" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
                <div>$50 x <input id="billete50" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
                <div>$20 x <input id="billete20" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
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

        if (formValues) {
            const total = calcularTotal(formValues);
            document.getElementById(celdaId).textContent = total;

            if (celdaId === 'row-17-col-1') {
                propinasEfectivo = formValues;
                propinasEfectivo.total = total;
                restarDeTotal('row-19-col-1', total);
                restarDeTotal('row-21-col-1', total);
            }
        }
    }

    document.getElementById('sugerirFondoBtn').disabled = false; // Habilitar botón "Sugerir Fondo"
    document.getElementById('limpiarTablaBtn').disabled = false;
}

function calcularCorteRestante(sugerencia) {
    const corteRestante = {};

    const monedas = [
        { denominacion: 0.5, id: 'row-4-col-2' },
        { denominacion: 1, id: 'row-5-col-2' },
        { denominacion: 2, id: 'row-6-col-2' },
        { denominacion: 5, id: 'row-7-col-2' },
        { denominacion: 10, id: 'row-8-col-2' }
    ];

    const billetes = [
        { denominacion: 20, id: 'row-10-col-2' },
        { denominacion: 50, id: 'row-11-col-2' },
        { denominacion: 100, id: 'row-12-col-2' },
        { denominacion: 200, id: 'row-13-col-2' },
        { denominacion: 500, id: 'row-14-col-2' },
        { denominacion: 1000, id: 'row-15-col-2' }
    ];

    monedas.forEach(moneda => {
        const cantidad = parseInt(document.getElementById(moneda.id).textContent) || 0;
        const cantidadFondo = sugerencia.filter(item => item.denominacion === moneda.denominacion && item.denominacion < 20).reduce((acc, item) => acc + item.cantidad, 0);
        corteRestante[moneda.denominacion] = cantidad - cantidadFondo;
    });

    billetes.forEach(billete => {
        const cantidad = parseInt(document.getElementById(billete.id).textContent) || 0;
        const cantidadFondo = sugerencia.filter(item => item.denominacion === billete.denominacion && item.denominacion >= 20).reduce((acc, item) => acc + item.cantidad, 0);
        corteRestante[billete.denominacion] = cantidad - cantidadFondo;
    });

    return corteRestante;
}

function generarContenidoPropinas() {
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

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('row-17-col-1').addEventListener('click', () => {
        actualizarPropina('row-17-col-1', 'Propina en Efectivo');
    });

    document.getElementById('row-17-col-4').addEventListener('click', () => {
        actualizarPropina('row-17-col-4', 'Propina en Tarjeta');
    });
});

// Otras funciones auxiliares
function calcularTotal(formValues) {
    const monedas = formValues.monedas;
    const billetes = formValues.billetes;

    const totalMonedas = Object.keys(monedas).reduce((acc, key) => acc + (parseInt(key) * parseFloat(monedas[key] || 0)), 0);
    const totalBilletes = Object.keys(billetes).reduce((acc, key) => acc + (parseInt(key) * parseFloat(billetes[key] || 0)), 0);

    return totalMonedas + totalBilletes;
}

function restarDeTotal(celdaTotalId, cantidad) {
    let totalActual = parseFloat(document.getElementById(celdaTotalId).textContent) || 0;
    totalActual -= parseFloat(cantidad);
    document.getElementById(celdaTotalId).textContent = totalActual.toFixed(2);
}

function actualizarTotalesFinales() {
    const tEfectivoCF = parseFloat(document.getElementById('row-21-col-1').textContent) || 0;
    const tTarjetas = parseFloat(document.getElementById('row-19-col-4').textContent) || 0;
    const tFinal = tEfectivoCF + tTarjetas;
    document.getElementById('row-21-col-4').textContent = tFinal.toFixed(2);
}

// Función para mostrar propinas en la pestaña de propinas dentro de SweetAlert
function mostrarPropinasEnSugerencia(totalPropinas, combinacionPropinas) {
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

    // Propinas en efectivo
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

    // Corte restante
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

    if (detalleMonedasPropinas) {
        mensaje += `${detalleMonedasPropinas}`;
    }

    if (detalleBilletesPropinas) {
        mensaje += `${detalleBilletesPropinas}`;
    }

    if (detalleMonedasCorte) {
        mensaje += `${detalleMonedasCorte}`;
    }

    if (detalleBilletesCorte) {
        mensaje += `${detalleBilletesCorte}`;
    }

    mensaje += `<br>Total de Monedas: $${totalMonedas.toFixed(2)}<br>`;
    mensaje += `Total de Billetes: $${totalBilletes.toFixed(2)}<br>`;
    mensaje += `<br>Total: $${(totalMonedas + totalBilletes).toFixed(2)}`;

    return mensaje;
}

window.actualizarTotal = function () {
    const monedas = ['10', '5', '2', '1'].reduce((acc, key) => {
        acc[key] = document.getElementById(`moneda${key}`).value || 0;
        return acc;
    }, {});

    const billetes = ['1000', '500', '200', '100', '50', '20'].reduce((acc, key) => {
        acc[key] = document.getElementById(`billete${key}`).value || 0;
        return acc;
    }, {});

    const total = calcularTotal({ monedas, billetes });
    document.getElementById('total').textContent = total.toFixed(2);
}

function restarDeTotal(celdaTotalId, cantidad) {
    let totalActual = parseFloat(document.getElementById(celdaTotalId).textContent) || 0;
    totalActual -= parseFloat(cantidad);
    document.getElementById(celdaTotalId).textContent = totalActual.toFixed(2);
}

function actualizarTotalesFinales() {
    const tEfectivoCF = parseFloat(document.getElementById('row-21-col-1').textContent) || 0;
    const tTarjetas = parseFloat(document.getElementById('row-19-col-4').textContent) || 0;
    const tFinal = tEfectivoCF + tTarjetas;
    document.getElementById('row-21-col-4').textContent = tFinal.toFixed(2);
}
// Función para limpiar la tabla y localStorage
function limpiarTabla() {
    const idsToClear = [
        'row-2-col-3', 'row-3-col-4', 'row-4-col-2', 'row-4-col-3', 'row-5-col-2', 'row-5-col-3',
        'row-5-col-4', 'row-6-col-2', 'row-6-col-3', 'row-7-col-2', 'row-7-col-3', 'row-7-col-4',
        'row-8-col-2', 'row-8-col-3', 'row-8-col-5', 'row-9-col-3', 'row-9-col-4', 'row-10-col-2',
        'row-10-col-3', 'row-10-col-4', 'row-11-col-2', 'row-11-col-3', 'row-11-col-4', 'row-12-col-2',
        'row-12-col-3', 'row-12-col-4', 'row-13-col-2', 'row-13-col-3', 'row-13-col-4', 'row-14-col-2',
        'row-14-col-3', 'row-15-col-2', 'row-15-col-3', 'row-17-col-1', 'row-17-col-4', 'row-19-col-1', 'row-19-col-4', 'row-21-col-1',
        'row-21-col-4'
    ];

    idsToClear.forEach(id => {
        let element = document.getElementById(id);
        if (element) {
            element.textContent = '';
        }
    });

    document.getElementById('sugerirFondoBtn').disabled = true;
    document.getElementById('limpiarTablaBtn').disabled = true;
    document.getElementById('ajustarCorteBtn').disabled = true;

    localStorage.removeItem('corteInProgress');

    verificarDatos();
}

// Función para mostrar formulario de gastos con SweetAlert2
async function getGastoValue(promptText, gastoId) {
    let allValues = [];
    let currentIndex = parseInt(gastoId.split('-')[1]) - 9;
    let maxIndex = 4; // 5 espacios de gastos en total (del 9 al 13)

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

                if (!nextResult.isConfirmed) {
                    break;
                }
            } else {
                break;
            }
        } else {
            break;
        }
    }

    // Aplicar los valores a las celdas correspondientes
    allValues.forEach(value => {
        const cellId = `row-${value.index + 9}-col-4`;
        const cell = document.getElementById(cellId);
        if (cell) {
            cell.setAttribute('data-type', value.dataType);
            cell.textContent = value.displayText;
        }
    });

    // Limpiar las celdas restantes si se finalizó antes de llenar todos los espacios
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

// Función para sugerir la mejor combinación para el fondo
// Algoritmo de Mochila
let priorizarMonedas = true;

// Función de mochila
function knapsack(items, capacity) {
    let dp = Array(items.length + 1).fill().map(() => Array(capacity + 1).fill(0));

    for (let i = 1; i <= items.length; i++) {
        for (let w = 0; w <= capacity; w++) {
            if (items[i - 1].denominacion <= w) {
                dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - items[i - 1].denominacion] + items[i - 1].denominacion);
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

// Generar sugerencia
function generarSugerencia(items, fondoObjetivo, priorizarMonedas) {
    // Ordenar items de menor a mayor denominación
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

    // Consolidar los elementos seleccionados
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

// Generar mensaje de sugerencia
function generarMensaje(sugerencia) {
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

function generarMensajeCorte(corteRestante) {
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
// Función para crear el contenido de las "pestañas" en SweetAlert2
function crearContenidoPestanas(sugerencia) {
    const mensaje = generarMensaje(sugerencia);
    const contenidoPropinas = mostrarPropinasEnSugerencia(propinasEfectivo.total + propinasTarjeta.total, sugerencia);

    return `
        <div>
            <div id="tab-container" style="text-align: center; margin-bottom: 10px;">
                <button id="tab-1" class="swal2-styled tab-btn" onclick="mostrarTab('tab1')">Fondo</button>
                <button id="tab-2" class="swal2-styled tab-btn" onclick="mostrarTab('tab2')">Corte</button>
                <button id="tab-3" class="swal2-styled tab-btn" onclick="mostrarTab('tab3')">Propinas</button>
            </div>
            <div id="tab1" class="tab-content">${mensaje}</div>
            <div id="tab2" class="tab-content" style="display:none;">Contenido de Corte</div>
            <div id="tab3" class="tab-content" style="display:none;">${contenidoPropinas}</div>
        </div>
    `;
}

// Mostrar la pestaña seleccionada
function mostrarTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(tabId).style.display = 'block';
}

// Sugerir fondo
function sugerirFondo() {
    const fondoObjetivo = parseFloat(document.getElementById('row-15-col-4').textContent) || 3000;

    // Obtener las cantidades de monedas, billetes y vales actuales de la tabla
    const items = [...obtenerMonedas(), ...obtenerBilletes(), ...obtenerVales()];

    // Generar sugerencia para el fondo
    const sugerenciaFondo = generarSugerencia(items, fondoObjetivo, priorizarMonedas);

    // Calcular corte restante después de asignar el fondo
    const corteRestante = calcularCorteRestante(sugerenciaFondo);

    // Generar contenido para cada pestaña
    const contenidoFondo = generarMensaje(sugerenciaFondo); // Detalle del fondo
    const contenidoCorte = generarMensajeCorte(corteRestante); // Detalle del corte
    const contenidoPropinas = generarContenidoPropinas(); // Detalle de propinas

    // Mostrar en un modal con pestañas
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
            sugerirFondo(); // Reiniciar sugerencia
        } else if (result.isDenied) {
            priorizarMonedas = !priorizarMonedas; // Cambiar prioridad
            sugerirFondo(); // Reiniciar sugerencia con nueva prioridad
        }
    });

    mostrarTab('tab1'); // Mostrar la pestaña de Fondo por defecto
}

function crearContenidoPestanas(contenidoFondo, contenidoCorte, contenidoPropinas) {
    return `
        <div>
            <div id="tab-container" style="text-align: center; margin-bottom: 10px;">
                <button id="tab-1" class="swal2-styled tab-btn" onclick="mostrarTab('tab1')">Fondo</button>
                <button id="tab-2" class="swal2-styled tab-btn" onclick="mostrarTab('tab2')">Corte</button>
                <button id="tab-3" class="swal2-styled tab-btn" onclick="mostrarTab('tab3')">Propinas</button>
            </div>
            <div id="tab1" class="tab-content">${contenidoFondo}</div>
            <div id="tab2" class="tab-content" style="display:none;">${contenidoCorte}</div>
            <div id="tab3" class="tab-content" style="display:none;">${contenidoPropinas}</div>
        </div>
    `;
}

function mostrarTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(tabId).style.display = 'block';
}

// funciones para el botin editar valor
let editTimeout;

function habilitarEdicion() {
    Swal.fire({
        title: 'Aviso',
        text: 'Toca cualquier celda para editar',
        timer: 1000,
        timerProgressBar: true,
        showConfirmButton: false,
    }).then(() => {
        let celdas = document.querySelectorAll('td[id^="row-"][id$="-col-2"], td[id="row-3-col-4"], td[id="row-5-col-4"], td[id="row-7-col-4"],td[id="row-9-col-4"], td[id="row-10-col-4"], td[id="row-11-col-4"],td[id="row-12-col-4"],td[id="row-13-col-4"]');
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
                timer: 2000,
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
        }, 5000); // 5 segundos de espera
    });
}

function editarCelda(event) {
    clearTimeout(editTimeout);
    let celda = event.target;
    let tipo = celda.previousElementSibling ? celda.previousElementSibling.textContent : '';

    // Si la celda es una de las tarjetas o vales/bolsas, tomar el texto del encabezado por ID
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
        }).catch(error => {
            console.error('Error al editar la celda:', error);
        });
    } else {
        Swal.fire({
            title: 'Editar valor',
            text: `¿Deseas editar el valor de ${tipo}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No',
        }).then(result => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Nuevo valor',
                    text: `Ingresa el nuevo valor para ${tipo}`,
                    input: 'number',
                    inputAttributes: {
                        'aria-label': 'Nuevo valor'
                    },
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

async function editarGastoCelda(promptText, gastoId) {
    const cell = document.getElementById(gastoId);
    const cellText = cell ? cell.textContent : '';

    // Agregar un console.log para verificar el valor de cellText
    console.log("Valor de cellText:", cellText);

    let initialType = '';
    let initialValeAmount = '';
    let initialMonedaType = '';
    let initialMonedaAmount = '';

    // Determinar el tipo y los valores iniciales basados en cellText
    if (cellText.includes('Vales')) {
        initialType = 'vales';
        initialValeAmount = cellText.split('=')[1].trim(); // Extraer cantidad de vales
    } else {
        const parts = cellText.split('=');
        if (parts.length === 2) {
            const possibleMonedaType = parseFloat(parts[0].trim());
            if (!isNaN(possibleMonedaType) && possibleMonedaType >= 0.5 && possibleMonedaType <= 10) {
                initialType = 'bolsaMonedas';
                initialMonedaType = parts[0].trim(); // Extraer tipo de moneda
                initialMonedaAmount = parts[1].trim(); // Extraer cantidad de dinero
            }
        }
    }

    // Generar HTML basado en initialType
    function createInputHTML() {
        if (initialType === 'vales') {
            return `
                <div id="vales-input">
                    <input id="vales-amount" type="number" class="swal2-input" placeholder="Cantidad de Vales" value="${initialValeAmount}">
                </div>
            `;
        } else if (initialType === 'bolsaMonedas') {
            return `
                <div id="bolsa-input">
                    <input id="moneda-type" type="number" class="swal2-input" placeholder="Tipo de Moneda (Valor)" value="${initialMonedaType}">
                    <input id="moneda-amount" type="number" class="swal2-input" placeholder="Cantidad de Dinero" value="${initialMonedaAmount}">
                </div>
            `;
        }
        return '<div>No se detectó un tipo válido</div>';
    }

    // Validar y obtener los valores del formulario
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
        title: `${promptText}`,
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
        const cellId = gastoId;
        const cell = document.getElementById(cellId);
        if (cell) {
            cell.setAttribute('data-type', newValue.dataType);
            cell.textContent = newValue.displayText;
            actualizarTotales();
        }
        return newValue;
    }
    return null;
}

function actualizarTotales() {
    let celdas = document.querySelectorAll('td[id^="row-"][id$="-col-2"], td[id="row-3-col-4"], td[id="row-5-col-4"], td[id="row-7-col-4"], td[id="row-9-col-4"], td[id="row-10-col-4"], td[id="row-11-col-4"], td[id="row-12-col-4"], td[id="row-13-col-4"]');
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
    let valesBolsasCeldas = document.querySelectorAll('td[id="row-9-col-4"], td[id="row-10-col-4"], td[id="row-11-col-4"], td[id="row-12-col-4"], td[id="row-13-col-4"]');
    valesBolsasCeldas.forEach(celda => {
        let valor = parseFloat(celda.textContent.split('=')[1]) || 0;
        totalValesBolsas += valor;
    });

    let row2Col3 = document.getElementById('row-2-col-3');
    if (row2Col3) row2Col3.textContent = totalMonedas.toFixed(2);

    let row9Col3 = document.getElementById('row-9-col-3');
    if (row9Col3) row9Col3.textContent = totalBilletes.toFixed(2);

    let row8Col5 = document.getElementById('row-8-col-5');
    if (row8Col5) row8Col5.textContent = totalValesBolsas.toFixed(2);

    // Actualizar total de efectivo
    let fondo = parseFloat(document.getElementById('row-15-col-4').textContent) || 0;
    let totalEfectivo = totalMonedas + totalBilletes + totalValesBolsas;
    let tEfectivoSF = totalEfectivo - fondo;
    let tEfectivoCF = totalEfectivo;

    let row17Col1 = document.getElementById('row-19-col-1');
    if (row17Col1) row17Col1.textContent = tEfectivoSF.toFixed(2);

    let row19Col1 = document.getElementById('row-21-col-1');
    if (row19Col1) row19Col1.textContent = tEfectivoCF.toFixed(2);

    // Actualizar total final
    let tDebito = parseFloat(document.getElementById('row-3-col-4').textContent) || 0;
    let tCredito = parseFloat(document.getElementById('row-5-col-4').textContent) || 0;
    let tAmex = parseFloat(document.getElementById('row-7-col-4').textContent) || 0;
    let tTarjetas = tDebito + tCredito + tAmex;

    let row17Col4 = document.getElementById('row-19-col-4');
    if (row17Col4) row17Col4.textContent = tTarjetas.toFixed(2);

    let row19Col4 = document.getElementById('row-21-col-4');
    if (row19Col4) row19Col4.textContent = (tEfectivoCF + tTarjetas).toFixed(2);
}

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
                let celdas = document.querySelectorAll('td[id^="row-"][id$="-col-2"], td[id="row-3-col-4"], td[id="row-5-col-4"], td[id="row-7-col-4"],td[id="row-9-col-4"], td[id="row-10-col-4"], td[id="row-11-col-4"],td[id="row-12-col-4"],td[id="row-13-col-4"]');
                celdas.forEach(celda => {
                    celda.style.backgroundColor = '';
                    celda.removeEventListener('click', editarCelda);
                });
            }
        });
    }, 2500);
}

async function ajustarCorte() {
    const { value: formValues } = await Swal.fire({
        title: 'Ajustar Corte',
        html: `
            <h3>Monedas:</h3>
            <div>$10 x <input id="moneda10" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
            <div>$5 x <input id="moneda5" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
            <div>$2 x <input id="moneda2" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
            <div>$1 x <input id="moneda1" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
            <h3>Billetes:</h3>
            <div>$1000 x <input id="billete1000" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
            <div>$500 x <input id="billete500" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
            <div>$200 x <input id="billete200" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
            <div>$100 x <input id="billete100" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
            <div>$50 x <input id="billete50" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
            <div>$20 x <input id="billete20" type="number" oninput="actualizarTotal()" class="swal2-input" step="any" style="width: 100px; display: inline;"></div>
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
        restarDeTotal(formValues);
        Swal.fire('Corte ajustado', `Se han ajustado los valores del corte por un total de $${total.toFixed(2)}`, 'success');
    }
}

function restarDeTotal(formValues) {
    if (!formValues || typeof formValues !== 'object') {
        console.error('restarDeTotal: formValues no es un objeto válido.', formValues);
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

function actualizarTotal() {
    const monedas = ['10', '5', '2', '1'].reduce((acc, key) => {
        acc[key] = document.getElementById(`moneda${key}`).value || 0;
        return acc;
    }, {});

    const billetes = ['1000', '500', '200', '100', '50', '20'].reduce((acc, key) => {
        acc[key] = document.getElementById(`billete${key}`).value || 0;
        return acc;
    }, {});

    const total = calcularTotal({ monedas, billetes });
    document.getElementById('total').textContent = total.toFixed(2);
}

// Hacer clic en la celda del fondo para editarla
document.getElementById('row-15-col-4').addEventListener('click', function () {
    editarFondo();
});

// Función para editar el valor del fondo
async function editarFondo() {
    const fondoActual = parseFloat(document.getElementById('row-15-col-4').textContent) || 3000;

    const { value: nuevoFondo } = await Swal.fire({
        title: 'Editar Fondo',
        text: 'Ingrese la nueva cantidad para el fondo:',
        input: 'number',
        inputValue: fondoActual, // Mostrar el valor actual como predeterminado
        inputAttributes: {
            step: 'any',
            min: '0'
        },
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
        // Actualizar la celda con el nuevo valor
        document.getElementById('row-15-col-4').textContent = parseFloat(nuevoFondo).toFixed(2);

        // Actualizar los totales relacionados
        actualizarTotales();

        // Guardar el nuevo estado en localStorage si hay un corte en progreso
        if (localStorage.getItem('corteInProgress')) {
            const savedData = JSON.parse(localStorage.getItem('corteInProgress'));
            savedData.values['row-15-col-4'] = parseFloat(nuevoFondo).toFixed(2);
            localStorage.setItem('corteInProgress', JSON.stringify(savedData));
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

function obtenerMonedas() {
    return [
        { denominacion: 0.5, cantidad: parseInt(document.getElementById('row-4-col-2').textContent) || 0 },
        { denominacion: 1, cantidad: parseInt(document.getElementById('row-5-col-2').textContent) || 0 },
        { denominacion: 2, cantidad: parseInt(document.getElementById('row-6-col-2').textContent) || 0 },
        { denominacion: 5, cantidad: parseInt(document.getElementById('row-7-col-2').textContent) || 0 },
        { denominacion: 10, cantidad: parseInt(document.getElementById('row-8-col-2').textContent) || 0 }
    ];
}

function obtenerBilletes() {
    return [
        { denominacion: 20, cantidad: parseInt(document.getElementById('row-10-col-2').textContent) || 0 },
        { denominacion: 50, cantidad: parseInt(document.getElementById('row-11-col-2').textContent) || 0 },
        { denominacion: 100, cantidad: parseInt(document.getElementById('row-12-col-2').textContent) || 0 },
        { denominacion: 200, cantidad: parseInt(document.getElementById('row-13-col-2').textContent) || 0 },
        { denominacion: 500, cantidad: parseInt(document.getElementById('row-14-col-2').textContent) || 0 },
        { denominacion: 1000, cantidad: parseInt(document.getElementById('row-15-col-2').textContent) || 0 }
    ];
}

function obtenerVales() {
    const valesCeldas = [
        'row-9-col-4', 'row-10-col-4', 'row-11-col-4', 'row-12-col-4', 'row-13-col-4'
    ];
    return valesCeldas.map(id => {
        const valor = parseFloat(document.getElementById(id)?.textContent.split('=')[1]) || 0;
        return { denominacion: 'vales', cantidad: valor };
    }).filter(item => item.cantidad > 0);
}
