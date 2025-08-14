// ===============================
// PUNTO FLOTANTE - Refactorizado CONSERVADORAMENTE
// Solo se reemplazaron las funciones que son IDÉNTICAS
// ===============================

// ===============================
// FUNCIONES ÚNICAS (sin cambios)
// ===============================

// Función para mantisa entera - MODIFICADA para manejar -0
function mantisaEntera(opt2, mantStr) {
    const { num, pot } = MuchoCodigoUtils.basicCalculator(mantStr); // USAR LIBRERÍA COMÚN
    const fBit = parseInt(mantStr[0]);
    
    if (opt2 === 0) {
        return { 
            value: MuchoCodigoUtils.ubnCalculator(fBit, num, pot), 
            isNegativeZero: false 
        };
    } else {
        // BCS: detectar -0 (primer bit = 1 y resto = 0)
        const isNegativeZero = (fBit === 1 && num === 0);
        const value = MuchoCodigoUtils.sbnCalculator(fBit, num);
        return { 
            value: isNegativeZero ? 0 : value, 
            isNegativeZero 
        };
    }
}

// Función para mantisa fraccionaria BSS
function ubnFrac(mantStr) {
    let num = 0;
    let pot = 1;
    
    for (let i = 0; i < mantStr.length; i++) {
        pot = pot * 2;
        num = num + ((1 / pot) * parseInt(mantStr[i]));
    }
    
    return { value: num, isNegativeZero: false };
}

// Función para mantisa fraccionaria BCS - MODIFICADA para manejar -0
function sbnFrac(mantStr) {
    let num = 0;
    let pot = 1;
    
    // Calcular la parte fraccionaria (sin el bit de signo)
    for (let i = 1; i < mantStr.length; i++) {
        pot = pot * 2;
        num = num + ((1 / pot) * parseInt(mantStr[i]));
    }
    
    const fBit = parseInt(mantStr[0]);
    
    // Detectar -0 (primer bit = 1 y resto = 0)
    const isNegativeZero = (fBit === 1 && num === 0);
    
    if (fBit === 1) {
        num = num * -1;
    }
    
    return { 
        value: isNegativeZero ? 0 : num, 
        isNegativeZero 
    };
}

// Función para mantisa fraccionaria
function mantisaFraccionaria(opt2, mantStr) {
    if (opt2 === 0) {
        return ubnFrac(mantStr);
    } else {
        return sbnFrac(mantStr);
    }
}

// Función para calcular exponente - NUEVA función para manejar -0
function calcularExponente(sistemaExponente, exponenteStr) {
    const { num, pot } = MuchoCodigoUtils.basicCalculator(exponenteStr);
    const fBit = parseInt(exponenteStr[0]);
    let result, isNegativeZero = false;
    
    switch (sistemaExponente) {
        case 0: // BSS
            result = MuchoCodigoUtils.ubnCalculator(fBit, num, pot);
            break;
        case 1: // BCS
            isNegativeZero = (fBit === 1 && num === 0);
            result = MuchoCodigoUtils.sbnCalculator(fBit, num);
            break;
        case 2: // Ca1
            // En Ca1, si todos los bits son 1, es -0
            isNegativeZero = exponenteStr.split('').every(bit => bit === '1');
            result = MuchoCodigoUtils.oneCalculator(fBit, num, pot);
            break;
        case 3: // Ca2
            result = MuchoCodigoUtils.twoCalculator(fBit, num, pot);
            break;
        case 4: // Ex2
            result = MuchoCodigoUtils.offsetCalculator(fBit, num, pot);
            break;
    }
    
    return { 
        value: isNegativeZero ? 0 : result, 
        isNegativeZero 
    };
}

// Función para mostrar error (específica para este HTML)
function mostrarError(mensaje) {
    const resultsContent = document.getElementById('results-content');
    resultsContent.innerHTML = `<div class="error-message">${mensaje}</div>`;
    document.getElementById('results-section').classList.add('show');
}

// Función para mostrar resultados - MODIFICADA para manejar -0
function mostrarResultados(mantisaResult, exponenteResult, potenciaDos, numeroFinal, mantisaIsNegativeZero) {
    const resultsContent = document.getElementById('results-content');
    
    // Formatear mantisa
    const mantisaDisplay = mantisaResult.isNegativeZero ? '-0' : mantisaResult.value.toFixed(8);
    
    // Formatear exponente
    const exponenteDisplay = exponenteResult.isNegativeZero ? '-0' : exponenteResult.value;
    
    // Formatear resultado final
    let finalDisplay;
    if (mantisaIsNegativeZero) {
        finalDisplay = '-0';
    } else {
        finalDisplay = numeroFinal.toFixed(8);
    }
    
    // Siempre reconstruir el HTML de resultados para asegurar que los elementos existan
    resultsContent.innerHTML = `
        <div class="result-item">
            <div class="result-label">Mantisa interpretada:</div>
            <div class="result-value" id="mantisa-result">${mantisaDisplay}</div>
        </div>
        <div class="result-item">
            <div class="result-label">Exponente interpretado:</div>
            <div class="result-value" id="exponente-result">${exponenteDisplay}</div>
        </div>
        <div class="result-item">
            <div class="result-label">Valor de 2<sup>exponente</sup>:</div>
            <div class="result-value" id="potencia-result">${potenciaDos.toFixed(8)}</div>
        </div>
        <div class="result-item">
            <div class="result-label">Número final (mantisa × 2<sup>exponente</sup>):</div>
            <div class="result-value" id="final-result">${finalDisplay}</div>
        </div>
    `;
    
    document.getElementById('results-section').classList.add('show');
}

// Función principal de cálculo - MODIFICADA para usar las nuevas funciones
function calcularPuntoFlotante() {
    // Obtener configuración de mantisa
    const tipoMantisa = parseInt(document.querySelector('input[name="mantisa-tipo"]:checked').value);
    const sistemaMantisa = parseInt(document.querySelector('input[name="mantisa-sistema"]:checked').value);
    
    // Obtener configuración de exponente
    const sistemaExponente = parseInt(document.querySelector('input[name="exp-sistema"]:checked').value);
    
    // Obtener valores de entrada
    const mantisaStr = document.getElementById('mantisa-input').value.trim();
    const exponenteStr = document.getElementById('exponente-input').value.trim();
    
    // Validaciones - USAR LIBRERÍA COMÚN
    if (!mantisaStr || !exponenteStr) {
        mostrarError('Por favor, ingresá tanto la mantisa como el exponente');
        return;
    }
    
    if (!MuchoCodigoUtils.checkString(mantisaStr)) {
        mostrarError('La mantisa debe ser un número binario válido (solo 0s y 1s)');
        return;
    }
    
    if (!MuchoCodigoUtils.checkString(exponenteStr)) {
        mostrarError('El exponente debe ser un número binario válido (solo 0s y 1s)');
        return;
    }
    
    // Validación de longitud mínima
    if (mantisaStr.length < 2) {
        mostrarError('Debe ingresar al menos dos bits en la mantisa');
        return;
    }
    
    if (exponenteStr.length < 2) {
        mostrarError('Debe ingresar al menos dos bits en el exponente');
        return;
    }
    
    try {
        // Calcular mantisa
        let mantisaResult;
        if (tipoMantisa === 0) {
            // Mantisa entera
            mantisaResult = mantisaEntera(sistemaMantisa, mantisaStr);
        } else {
            // Mantisa fraccionaria
            mantisaResult = mantisaFraccionaria(sistemaMantisa, mantisaStr);
        }
        
        // Calcular exponente
        const exponenteResult = calcularExponente(sistemaExponente, exponenteStr);
        
        // Calcular resultado final
        const potenciaDos = Math.pow(2, exponenteResult.value);
        const numeroFinal = mantisaResult.value * potenciaDos;
        
        // Mostrar resultados
        mostrarResultados(mantisaResult, exponenteResult, potenciaDos, numeroFinal, mantisaResult.isNegativeZero);
        
    } catch (error) {
        mostrarError('Error en el cálculo. Por favor, verificá los valores ingresados.');
        console.error(error);
    }
}

// Event listeners - USAR LIBRERÍA COMÚN donde sea posible
document.addEventListener('DOMContentLoaded', function() {
    const mantisaInput = document.getElementById('mantisa-input');
    const exponenteInput = document.getElementById('exponente-input');
    
    // USAR LIBRERÍA COMÚN para validación binaria
    MuchoCodigoUtils.setupBinaryValidation('mantisa-input');
    MuchoCodigoUtils.setupBinaryValidation('exponente-input');
    
    // USAR LIBRERÍA COMÚN para Enter key
    MuchoCodigoUtils.setupEnterKey('mantisa-input', calcularPuntoFlotante);
    MuchoCodigoUtils.setupEnterKey('exponente-input', calcularPuntoFlotante);
    
    // Validación visual en tiempo real para longitud mínima
    function setupMinLengthValidation(inputElement, fieldName) {
        inputElement.addEventListener('input', function() {
            if (this.value.length === 1) {
                this.style.borderColor = '#ff4444';
                this.style.boxShadow = '0 0 5px rgba(255, 68, 68, 0.5)';
                this.title = `${fieldName} debe tener al menos 2 bits`;
            } else if (this.value.length >= 2) {
                this.style.borderColor = '';
                this.style.boxShadow = '';
                this.title = '';
            }
        });
    }
    
    setupMinLengthValidation(mantisaInput, 'La mantisa');
    setupMinLengthValidation(exponenteInput, 'El exponente');
    
    // Actualizar placeholder según el tipo de mantisa seleccionado (lógica específica)
    const mantisaTipoRadios = document.querySelectorAll('input[name="mantisa-tipo"]');
    mantisaTipoRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === '0') {
                mantisaInput.placeholder = 'Ej: 101101';
            } else {
                mantisaInput.placeholder = 'Ej: 01011010';
            }
        });
    });
});