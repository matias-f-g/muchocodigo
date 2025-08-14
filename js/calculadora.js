// ===============================
// CALCULADORA BINARIA - Refactorizada CONSERVADORAMENTE
// Solo se reemplazaron las funciones que son IDÉNTICAS
// ===============================

// Interpretar resultados para cada sistema de representación
// MANTIENE LA LÓGICA ORIGINAL EXACTA
function interpretResults(operation, first, second, result) {
    const firstBit = parseInt(first[0]);
    const secondBit = parseInt(second[0]);
    const resultBit = parseInt(result[0]);
    
    // USAR LA LIBRERÍA COMÚN para estas funciones idénticas
    const { num: firstNum, pot: firstPot } = MuchoCodigoUtils.basicCalculator(first);
    const { num: secondNum, pot: secondPot } = MuchoCodigoUtils.basicCalculator(second);
    const { num: resultNum, pot: resultPot } = MuchoCodigoUtils.basicCalculator(result);
    
    const systems = {
        ubn: {
            first: MuchoCodigoUtils.ubnCalculator(firstBit, firstNum, firstPot),
            second: MuchoCodigoUtils.ubnCalculator(secondBit, secondNum, secondPot),
            result: MuchoCodigoUtils.ubnCalculator(resultBit, resultNum, resultPot)
        },
        sbn: {
            first: MuchoCodigoUtils.sbnCalculator(firstBit, firstNum),
            second: MuchoCodigoUtils.sbnCalculator(secondBit, secondNum),
            result: MuchoCodigoUtils.sbnCalculator(resultBit, resultNum)
        },
        one: {
            first: MuchoCodigoUtils.oneCalculator(firstBit, firstNum, firstPot),
            second: MuchoCodigoUtils.oneCalculator(secondBit, secondNum, secondPot),
            result: MuchoCodigoUtils.oneCalculator(resultBit, resultNum, resultPot)
        },
        two: {
            first: MuchoCodigoUtils.twoCalculator(firstBit, firstNum, firstPot),
            second: MuchoCodigoUtils.twoCalculator(secondBit, secondNum, secondPot),
            result: MuchoCodigoUtils.twoCalculator(resultBit, resultNum, resultPot)
        },
        offset: {
            first: MuchoCodigoUtils.offsetCalculator(firstBit, firstNum, firstPot),
            second: MuchoCodigoUtils.offsetCalculator(secondBit, secondNum, secondPot),
            result: MuchoCodigoUtils.offsetCalculator(resultBit, resultNum, resultPot)
        }
    };
    
    const analysis = {};
    
    for (const [system, values] of Object.entries(systems)) {
        let expected;
        if (operation === 'add') {
            expected = values.first + values.second;
        } else {
            expected = values.first - values.second;
        }
        
        const isCorrect = expected === values.result;
        const operatorSymbol = operation === 'add' ? '+' : '-';
        
        // MEJORA VISUAL: Poner paréntesis si el segundo operando es negativo
        let secondOperandText = values.second.toString();
        if (values.second < 0) {
            secondOperandText = `(${values.second})`;
        }
        
        analysis[system] = {
            text: `${values.first} ${operatorSymbol} ${secondOperandText} = ${values.result}`,
            correct: isCorrect
        };
    }
    
    return analysis;
}

// Función para mostrar errores - MANTIENE LA LÓGICA ORIGINAL EXACTA
function showError(message) {
    document.getElementById('binaryResult').textContent = message;
    document.getElementById('carryFlag').textContent = '-';
    document.getElementById('zeroFlag').textContent = '-';
    
    const analysisItems = ['ubnAnalysis', 'sbnAnalysis', 'oneAnalysis', 'twoAnalysis', 'offsetAnalysis'];
    analysisItems.forEach(id => {
        const element = document.getElementById(id);
        element.textContent = '-';
        element.className = 'analysis-item';
    });
    
    document.getElementById('resultsInfo').classList.add('show');
}

// Función principal para calcular - SOLO cambian las llamadas a funciones idénticas
function calculateBinary() {
    const first = document.getElementById('firstNumber').value.trim();
    const second = document.getElementById('secondNumber').value.trim();
    const operation = document.querySelector('.operation-btn.active').dataset.op;
    
    // Validaciones - USAR LIBRERÍA COMÚN para checkString
    if (!first || !second) {
        showError('Por favor, ingresá ambos operandos');
        return;
    }
    
    if (!MuchoCodigoUtils.checkString(first) || !MuchoCodigoUtils.checkString(second)) {
        showError('Por favor, ingresá números binarios válidos (solo 0s y 1s)');
        return;
    }
    
    if (first.length !== second.length) {
        showError('Los números binarios deben tener la misma longitud');
        return;
    }
    
    // Realizar la operación - USAR LIBRERÍA COMÚN
    let calculationResult;
    if (operation === 'add') {
        calculationResult = MuchoCodigoUtils.addBinary(first, second);
    } else {
        calculationResult = MuchoCodigoUtils.subtractBinary(first, second);
    }
    
    const result = calculationResult.result;
    const carry = calculationResult.carry;
    const zero = MuchoCodigoUtils.zeroFlag(result); // USAR LIBRERÍA COMÚN
    
    // Mostrar resultados básicos
    document.getElementById('binaryResult').textContent = result;
    document.getElementById('carryFlag').textContent = carry;
    document.getElementById('zeroFlag').textContent = zero;
    
    // Realizar análisis de sistemas de representación
    const analysis = interpretResults(operation, first, second, result);
    
    // Mostrar análisis - MANTIENE LA LÓGICA ORIGINAL EXACTA
    const systemNames = {
        ubn: 'BSS',
        sbn: 'BCS', 
        one: 'Ca1',
        two: 'Ca2',
        offset: 'Ex2'
    };
    
    const analysisIds = {
        ubn: 'ubnAnalysis',
        sbn: 'sbnAnalysis',
        one: 'oneAnalysis',
        two: 'twoAnalysis',
        offset: 'offsetAnalysis'
    };
    
    for (const [system, data] of Object.entries(analysis)) {
        const element = document.getElementById(analysisIds[system]);
        element.textContent = `${systemNames[system]}: ${data.text} ${data.correct ? '✓' : '✗'}`;
        element.className = `analysis-item ${data.correct ? 'correct' : 'incorrect'}`;
    }
    
    document.getElementById('resultsInfo').classList.add('show');
}

// Configurar event listeners - SOLO los helpers simples de la librería
function setupEventListeners() {
    // USAR LIBRERÍA COMÚN para validación binaria
    MuchoCodigoUtils.setupBinaryValidation('firstNumber');
    MuchoCodigoUtils.setupBinaryValidation('secondNumber');
    
    // USAR LIBRERÍA COMÚN para Enter key
    MuchoCodigoUtils.setupEnterKey('firstNumber', calculateBinary);
    MuchoCodigoUtils.setupEnterKey('secondNumber', calculateBinary);
    
    // Manejar selección de operación - MANTIENE LÓGICA ORIGINAL
    const operationBtns = document.querySelectorAll('.operation-btn');
    operationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            operationBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', setupEventListeners);