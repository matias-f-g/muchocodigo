// ===============================
// CONVERSOR BINARIO - Refactorizado CONSERVADORAMENTE
// Solo se reemplazaron las funciones que son IDÉNTICAS
// ===============================

// ===============================
// FUNCIONES ORIGINALES (sin cambios, son únicas)
// ===============================

// Convertir decimal a binario básico
function basicTranslator(decNum, nBits) {
    let absNum = Math.abs(decNum);
    let binaryStr = '';
    let pot = 1;
    
    if (absNum === 0) {
        binaryStr = '0';
        pot = Math.pow(2, nBits - 1);
    } else {
        while (absNum > 0) {
            binaryStr = (absNum % 2) + binaryStr;
            absNum = Math.floor(absNum / 2);
            pot *= 2;
        }
    }
    
    // Ajustar potencia según bits requeridos
    pot = Math.pow(2, nBits - 1);
    
    return { binaryStr, pot };
}

// Traductor para binario sin signo
function ubnTranslator(decNum, nBits, binaryStr, originalInput) {
    if (decNum < 0 || originalInput.includes('-')) {
        return 'No definido para números negativos';
    }
    
    if (binaryStr.length > nBits) {
        return 'Fuera de rango';
    }
    
    // Agregar ceros a la izquierda si es necesario
    return binaryStr.padStart(nBits, '0');
}

// Traductor para binario con signo
function sbnTranslator(decNum, nBits, binaryStr) {
    if (binaryStr.length + 1 > nBits) {
        return 'Fuera de rango';
    }
    
    let result = binaryStr.padStart(nBits, '0');
    
    if (decNum < 0) {
        result = '1' + result.substring(1);
    }
    
    if (decNum === 0) {
        let positiveZero = '0'.repeat(nBits);
        let negativeZero = '1' + '0'.repeat(nBits - 1);
        return `${positiveZero} para 0 y ${negativeZero} para -0`;
    }
    
    return result;
}

// Traductor para complemento a 1
function oneTranslator(decNum, nBits, sbnStr) {
    if (sbnStr === 'Fuera de rango') {
        return sbnStr;
    }
    
    if (sbnStr.includes('para 0')) {
        let allOnes = '1'.repeat(nBits);
        let allZeros = '0'.repeat(nBits);
        return `${allZeros} para 0 y ${allOnes} para -0`;
    }
    
    if (decNum < 0) {
        let result = sbnStr.split('');
        for (let i = 1; i < result.length; i++) {
            result[i] = result[i] === '1' ? '0' : '1';
        }
        return result.join('');
    }
    
    return sbnStr;
}

// Traductor para complemento a 2 - MODIFICADO
function twoTranslator(decNum, nBits, pot, sbnStr, originalInput) {
    if (sbnStr === 'Fuera de rango') {
        // Caso especial: -2^(n-1)
        if (decNum === -pot) {
            return '1' + '0'.repeat(nBits - 1);
        }
        return sbnStr;
    }
    
    // Verificar si el usuario ingresó específicamente "-0"
    if (originalInput === '-0') {
        return 'No puede representar el -0';
    }
    
    if (sbnStr.includes('para 0') || decNum === 0) {
        return '0'.repeat(nBits);
    }
    
    if (decNum < 0) {
        let binary = sbnStr.split('');
        
        // Encontrar el último 1 desde la derecha
        let i = binary.length - 1;
        while (i > 0 && binary[i] === '0') {
            i--;
        }
        
        // Invertir todos los bits a la izquierda del último 1
        for (let j = i - 1; j >= 1; j--) {
            binary[j] = binary[j] === '1' ? '0' : '1';
        }
        
        return binary.join('');
    }
    
    return sbnStr;
}

// Traductor para offset binary - MODIFICADO
function offsetTranslator(twoStr, originalInput) {
    if (twoStr === 'Fuera de rango') {
        return twoStr;
    }
    
    // Verificar si el usuario ingresó específicamente "-0"
    if (originalInput === '-0') {
        return 'No puede representar el -0';
    }
    
    let result = twoStr.split('');
    result[0] = result[0] === '1' ? '0' : '1';
    return result.join('');
}

// ===============================
// FUNCIONES MEJORADAS (las del final)
// ===============================

// Función mejorada para mostrar errores (elimina duplicación)
function showError(message, isBinary = true) {
    const resultsContainer = isBinary ? 'binaryResults' : 'decimalResults';
    const resultIds = isBinary 
        ? ['ubnResult', 'sbnResult', 'oneResult', 'twoResult', 'offsetResult']
        : ['ubnDecResult', 'sbnDecResult', 'oneDecResult', 'twoDecResult', 'offsetDecResult'];
    
    // Limpiar clases de error anteriores
    const errorItems = document.querySelectorAll(`#${resultsContainer} .result-item.error-result`);
    errorItems.forEach(item => item.classList.remove('error-result'));
    
    // Configurar resultados
    resultIds.forEach((id, index) => {
        document.getElementById(id).textContent = index === 0 ? message : '-';
    });
    
    // Marcar el primer resultado como error
    const firstItem = document.querySelector(`#${resultsContainer} .result-item`);
    firstItem?.classList.add('error-result');
    
    document.getElementById(resultsContainer).classList.add('show');
}

// Función para limpiar errores anteriores (reutilizable)
function clearPreviousErrors(isBinary = true) {
    const resultsContainer = isBinary ? 'binaryResults' : 'decimalResults';
    const errorItems = document.querySelectorAll(`#${resultsContainer} .result-item.error-result`);
    errorItems.forEach(item => item.classList.remove('error-result'));
}

// Función principal para convertir binario a decimal (USAR LIBRERÍA COMÚN)
function convertBinaryToDecimal() {
    const input = document.getElementById('binaryInput').value.trim();
    
    if (!MuchoCodigoUtils.checkString(input)) {
        showError('Por favor, ingresá un número binario válido (solo 0s y 1s)');
        return;
    }
    
    clearPreviousErrors(true);
    
    // CAMBIO 1: Si hay un solo bit, solo mostrar BSS
    if (input.length === 1) {
        const singleBitValue = parseInt(input);
        
        document.getElementById('ubnResult').textContent = singleBitValue;
        document.getElementById('sbnResult').textContent = '-';
        document.getElementById('oneResult').textContent = '-';
        document.getElementById('twoResult').textContent = '-';
        document.getElementById('offsetResult').textContent = '-';
        
        document.getElementById('binaryResults').classList.add('show');
        return;
    }
    
    const firstBit = parseInt(input[0]);
    const { num, pot } = MuchoCodigoUtils.basicCalculator(input);
    
    // Calcular todos los sistemas de representación - USAR LIBRERÍA COMÚN
    let results = {
        ubn: MuchoCodigoUtils.ubnCalculator(firstBit, num, pot),
        sbn: MuchoCodigoUtils.sbnCalculator(firstBit, num),
        one: MuchoCodigoUtils.oneCalculator(firstBit, num, pot),
        two: MuchoCodigoUtils.twoCalculator(firstBit, num, pot),
        offset: MuchoCodigoUtils.offsetCalculator(firstBit, num, pot)
    };
    
    // CAMBIO 2: Chequear -0 para BCS
    if (firstBit === 1 && num === 0) {
        results.sbn = '-0';
    }
    
    // CAMBIO 3: Chequear -0 para Ca1
    // En Ca1, si todos los bits son 1, representa -0
    if (input.split('').every(bit => bit === '1')) {
        results.one = '-0';
    }
    
    // Mostrar resultados
    document.getElementById('ubnResult').textContent = results.ubn;
    document.getElementById('sbnResult').textContent = results.sbn;
    document.getElementById('oneResult').textContent = results.one;
    document.getElementById('twoResult').textContent = results.two;
    document.getElementById('offsetResult').textContent = results.offset;
    
    document.getElementById('binaryResults').classList.add('show');
}

// Función principal para convertir decimal a binario (mejorada) - MODIFICADA
function convertDecimalToBinary() {
    const decimalInput = document.getElementById('decimalInput').value;
    const bitsInput = document.getElementById('bitsInput').value;
    
    if (!decimalInput || !bitsInput) {
        showError('Por favor, completá ambos campos', false);
        return;
    }
    
    const decNum = parseInt(decimalInput);
    const nBits = parseInt(bitsInput);
    
    if (nBits < 1 || nBits > 32) {
        showError('El número de bits debe estar entre 1 y 32', false);
        return;
    }
    
    clearPreviousErrors(false);
    
    const { binaryStr, pot } = basicTranslator(decNum, nBits);
    
    // Calcular todos los sistemas de representación - AHORA PASAMOS originalInput
    const ubn = ubnTranslator(decNum, nBits, binaryStr, decimalInput);
    const sbn = sbnTranslator(decNum, nBits, binaryStr);
    const one = oneTranslator(decNum, nBits, sbn);
    const two = twoTranslator(decNum, nBits, pot, sbn, decimalInput);
    const offset = offsetTranslator(two, decimalInput);
    
    // Mostrar resultados
    document.getElementById('ubnDecResult').textContent = ubn;
    document.getElementById('sbnDecResult').textContent = sbn;
    document.getElementById('oneDecResult').textContent = one;
    document.getElementById('twoDecResult').textContent = two;
    document.getElementById('offsetDecResult').textContent = offset;
    
    document.getElementById('decimalResults').classList.add('show');
}

// Event listeners mejorados
function setupEventListeners() {
    // USAR LIBRERÍA COMÚN para validación binaria
    MuchoCodigoUtils.setupBinaryValidation('binaryInput');
    
    // USAR LIBRERÍA COMÚN para Enter key
    MuchoCodigoUtils.setupEnterKey('binaryInput', convertBinaryToDecimal);
    MuchoCodigoUtils.setupEnterKey('decimalInput', convertDecimalToBinary);
    MuchoCodigoUtils.setupEnterKey('bitsInput', convertDecimalToBinary);
    
    const decimalInput = document.getElementById('decimalInput');
    const bitsInput = document.getElementById('bitsInput');
    
    // Validación simplificada para input decimal
    decimalInput.addEventListener('input', (e) => {
        let value = e.target.value;
        
        // Permitir solo dígitos y un signo menos al principio
        value = value.replace(/[^0-9-]/g, '');
        
        // Asegurar que el signo menos esté solo al principio
        if (value.includes('-')) {
            const hasLeadingMinus = value.startsWith('-');
            value = value.replace(/-/g, '');
            if (hasLeadingMinus) value = '-' + value;
        }
        
        e.target.value = value;
    });
    
    // Validación para input de bits (solo números positivos)
    bitsInput.addEventListener('input', (e) => {
        // Solo permitir dígitos del 0-9
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
}

// Inicializar event listeners cuando se carga la página
document.addEventListener('DOMContentLoaded', setupEventListeners);