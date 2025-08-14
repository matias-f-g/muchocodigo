// ===============================
// MUCHO CÓDIGO - Utilidades Comunes
// Solo las funciones que son EXACTAMENTE iguales
// ===============================

const MuchoCodigoUtils = {
    
    // ===============================
    // VALIDACIONES (estas son idénticas en todos lados)
    // ===============================
    
    // Validar que el string sea binario válido
    checkString(binaryStr) {
        return /^[01]+$/.test(binaryStr) && binaryStr.length > 0;
    },
    
    // ===============================
    // CALCULADORAS BÁSICAS (idénticas en todos los archivos)
    // ===============================
    
    // Calculadora básica para convertir binario a decimal (sin el primer bit)
    basicCalculator(binaryStr) {
        let num = 0;
        let pot = 1;
        
        for (let i = binaryStr.length - 1; i >= 1; i--) {
            num += pot * parseInt(binaryStr[i]);
            pot *= 2;
        }
        
        return { num, pot };
    },
    
    // ===============================
    // SISTEMAS DE REPRESENTACIÓN (idénticos en todos los archivos)
    // ===============================
    
    // Binario sin signo
    ubnCalculator(firstBit, num, pot) {
        return num + (pot * firstBit);
    },
    
    // Binario con signo
    sbnCalculator(firstBit, num) {
        return firstBit === 1 ? -num : num;
    },
    
    // Complemento a 1
    oneCalculator(firstBit, num, pot) {
        if (firstBit === 1) {
            return -((pot - num - 1));
        }
        return num;
    },
    
    // Complemento a 2
    twoCalculator(firstBit, num, pot) {
        if (firstBit === 1) {
            return num - pot;
        }
        return num;
    },
    
    // Exceso a 2
    offsetCalculator(firstBit, num, pot) {
        if (firstBit === 0) {
            return -((pot - num));
        }
        return num;
    },
    
    // ===============================
    // OPERACIONES BINARIAS (copiadas exactamente de calculadora.js)
    // ===============================
    
    // Suma binaria bit por bit
    addBinary(first, second) {
        let result = '';
        let carry = 0;
        const maxLength = Math.max(first.length, second.length);
        
        // Rellenar con ceros a la izquierda para igualar longitudes
        first = first.padStart(maxLength, '0');
        second = second.padStart(maxLength, '0');
        
        for (let i = maxLength - 1; i >= 0; i--) {
            const a = parseInt(first[i]);
            const b = parseInt(second[i]);
            const sum = a + b + carry;
            
            result = (sum % 2) + result;
            carry = sum > 1 ? 1 : 0;
        }
        
        return { result, carry };
    },
    
    // Función auxiliar para "pedir prestado" en la resta binaria
    borrowBit(binaryArray, index) {
        let i = index;
        
        // Buscar el primer bit '1' hacia la izquierda
        while (i >= 0 && binaryArray[i] === '0') {
            binaryArray[i] = '1';
            i--;
        }
        
        if (i >= 0) {
            binaryArray[i] = '0';
            return true;
        }
        
        return false; // No se pudo pedir prestado
    },
    
    // Resta binaria bit por bit
    subtractBinary(first, second) {
        const maxLength = Math.max(first.length, second.length);
        
        // Rellenar con ceros a la izquierda para igualar longitudes
        first = first.padStart(maxLength, '0');
        second = second.padStart(maxLength, '0');
        
        let firstArray = first.split('');
        let result = '';
        let borrow = 0;
        
        for (let i = maxLength - 1; i >= 0; i--) {
            let a = parseInt(firstArray[i]);
            const b = parseInt(second[i]);
            
            if (a < b) {
                if (this.borrowBit(firstArray, i - 1)) {
                    a += 2;
                } else {
                    borrow = 1; // Indica que hubo problemas con el préstamo
                }
            }
            
            const bitResult = Math.abs(a - b) % 2;
            result = bitResult + result;
        }
        
        return { result, carry: borrow };
    },
    
    // ===============================
    // FLAGS (copiado exactamente)
    // ===============================
    
    // Función para verificar si el resultado es cero (Zero Flag)
    zeroFlag(resultStr) {
        return parseInt(resultStr, 2) === 0 ? 1 : 0;
    },
    
    // ===============================
    // VALIDACIONES DE UI (helpers simples y seguros)
    // ===============================
    
    // Configurar validación binaria en un input
    setupBinaryValidation(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^01]/g, '');
        });
    },
    
    // Configurar Enter key en un input
    setupEnterKey(inputId, callback) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                callback();
            }
        });
    }
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.MuchoCodigoUtils = MuchoCodigoUtils;
}