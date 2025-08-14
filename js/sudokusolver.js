// sudokusolver.js
// Lógica traducida desde tu Pascal con las correcciones mínimas
// para evitar errores y mostrar siempre el resultado al usuario.

// Estructura de datos
let sudoku = Array(9).fill().map(() => Array(9).fill(0));
// squareOfPossibles será un array 3x3 de Sets que representan posibilidades dentro
// de cada celda del bloque 3x3 (se reinicializa según sea necesario).
let squareOfPossibles = Array(3).fill().map(() => Array(3).fill().map(() => new Set()));

function validateInput(input) {
    if (!input || input.trim() === '') {
        return "Debe ingresar algún sudoku";
    }
    
    // Aceptamos solo exactamente 81 caracteres numéricos (0-9)
    if (input.length !== 81) {
        return "Debe ingresar algún sudoku válido (81 dígitos)";
    }
    
    for (let char of input) {
        if (!/[0-9]/.test(char)) {
            return "Solo se permiten números del 0 al 9";
        }
    }
    
    return null;
}

function generateSketch(inputString) {
    let index = 0;
    for (let m = 0; m < 9; m++) {
        for (let n = 0; n < 9; n++) {
            sudoku[m][n] = parseInt(inputString[index], 10);
            index++;
        }
    }
}

// Revisa fila
function checkLine(sudokuLocal, m, possibles) {
    for (let i = 0; i < 9; i++) {
        if (sudokuLocal[m][i] !== 0) {
            possibles.delete(sudokuLocal[m][i]);
        }
    }
}

// Revisa columna
function checkColumn(sudokuLocal, n, possibles) {
    for (let i = 0; i < 9; i++) {
        if (sudokuLocal[i][n] !== 0) {
            possibles.delete(sudokuLocal[i][n]);
        }
    }
}

// Revisa bloque 3x3 (mx,nx indican inicio del bloque)
function checkSquare(sudokuLocal, m, n, possibles) {
    for (let i = m; i < m + 3; i++) {
        for (let j = n; j < n + 3; j++) {
            if (sudokuLocal[i][j] !== 0) {
                possibles.delete(sudokuLocal[i][j]);
            }
        }
    }
}

function setSector(x) {
    switch (x) {
        case 0: return 0;
        case 1: return 3;
        case 2: return 6;
        default: return 0;
    }
}

function setPlace(x) {
    if (x === 0 || x === 3 || x === 6) return 0;
    if (x === 1 || x === 4 || x === 7) return 1;
    if (x === 2 || x === 5 || x === 8) return 2;
    return 0;
}

function isFull(sudokuLocal) {
    for (let m = 0; m < 9; m++) {
        for (let n = 0; n < 9; n++) {
            if (sudokuLocal[m][n] === 0) {
                return false;
            }
        }
    }
    return true;
}

function displaySudoku(sudokuLocal, title) {
    let display = `<div class="result-item">\n`;
    display += `<div class="result-label">${title}</div>\n`;
    display += `<div class="result-value" style="font-family: 'Courier New', monospace; white-space: pre-line; line-height: 1.2;">`;
    
    for (let m = 0; m < 9; m++) {
        for (let n = 0; n < 9; n++) {
            // Mostrar 0 como punto para que se vea vacio (opcional)
            const val = sudokuLocal[m][n] === 0 ? '.' : sudokuLocal[m][n];
            if ((n + 1) % 3 === 0) {
                display += val + (n === 8 ? '' : ' | ');
            } else {
                display += val + ' ';
            }
        }
        display += '\n';
        if ((m + 1) % 3 === 0 && m !== 8) {
            display += '────────────────────────────\n';
        }
    }
    
    display += `</div></div>`;
    return display;
}

function solveSudoku(sudokuLocal) {
    let counter = 0;
    const maxIterations = 9000;
    
    try {
        do {
            // Recorremos cada bloque 3x3 (m,n) marcando posibilidades
            for (let m = 0; m < 3; m++) {
                for (let n = 0; n < 3; n++) {
                    // Inicializar squareOfPossibles para este bloque
                    for (let i = 0; i < 3; i++) {
                        for (let j = 0; j < 3; j++) {
                            squareOfPossibles[i][j] = new Set();
                        }
                    }
                    
                    let mx = setSector(m);
                    let nx = setSector(n);
                    
                    // Para cada celda vacía del bloque calculo sus posibles
                    for (let j = mx; j < mx + 3; j++) {
                        for (let k = nx; k < nx + 3; k++) {
                            let mp = setPlace(j);
                            let np = setPlace(k);
                            
                            if (sudokuLocal[j][k] === 0) {
                                let possibles = new Set([1,2,3,4,5,6,7,8,9]);
                                checkLine(sudokuLocal, j, possibles);
                                checkColumn(sudokuLocal, k, possibles);
                                checkSquare(sudokuLocal, mx, nx, possibles);
                                squareOfPossibles[mp][np] = possibles;
                            } else {
                                // mantener como empty set si no está vacía
                                squareOfPossibles[mp][np] = new Set();
                            }
                        }
                    }
                    
                    // Contar cuántas veces aparece cada número en las posibilidades del bloque
                    let numberOfPossibilities = Array(10).fill(0);
                    
                    for (let sx = 0; sx < 3; sx++) {
                        for (let tx = 0; tx < 3; tx++) {
                            for (let i = 1; i <= 9; i++) {
                                if (squareOfPossibles[sx][tx].has(i)) {
                                    numberOfPossibilities[i]++;
                                }
                            }
                        }
                    }
                    
                    // Si un número aparece solo una vez en el bloque, lo ponemos en la celda correspondiente
                    for (let i = 1; i <= 9; i++) {
                        if (numberOfPossibilities[i] === 1) {
                            for (let sx = 0; sx < 3; sx++) {
                                for (let tx = 0; tx < 3; tx++) {
                                    if (squareOfPossibles[sx][tx].has(i)) {
                                        // colocar i en la celda correspondiente del sudokuLocal
                                        sudokuLocal[mx + sx][nx + tx] = i;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            counter++;
        } while (!isFull(sudokuLocal) && counter < maxIterations);
        
        return { completed: isFull(sudokuLocal), iterations: counter, maxReached: counter >= maxIterations };
    } catch (err) {
        // Si algo falla, devolvemos la info y el error
        return { completed: false, iterations: counter, maxReached: false, error: String(err) };
    }
}

// --- DOM wiring ---
document.addEventListener('DOMContentLoaded', function() {
    const sudokuInput = document.getElementById('sudokuInput');
    const solveBtn = document.getElementById('solveBtn');
    const sudokuResults = document.getElementById('sudokuResults');

    if (!sudokuInput || !solveBtn || !sudokuResults) {
        console.error('Elementos DOM faltantes');
        return;
    }

    solveBtn.addEventListener('click', function() {
        // Limpiar mensajes previos
        sudokuResults.innerHTML = '';

        const input = sudokuInput.value.trim();
        const validationError = validateInput(input);
        if (validationError) {
            sudokuResults.innerHTML = `
                <div class="result-item error-result">
                    <div class="result-value" style="word-wrap: break-word; overflow-wrap: break-word; word-break: normal; hyphens: none;">${validationError}</div>
                </div>
            `;
            // ESTA ES LA LÍNEA QUE FALTABA: agregar la clase 'show' para mostrar el error
            sudokuResults.classList.add('show');
            return;
        }

        // Generar y mostrar el tablero original
        generateSketch(input);
        let resultsHTML = '';
        resultsHTML += displaySudoku(sudoku, 'Sudoku original:');

        // Resolver en una copia
        let sudokuCopy = sudoku.map(row => [...row]);
        const result = solveSudoku(sudokuCopy);

        if (result.error) {
            // Mostramos el error (no debería ocurrir con el código corregido, pero por si acaso)
            resultsHTML += `
                <div class="result-item error-result">
                    <div class="result-label">Error:</div>
                    <div class="result-value">${result.error}</div>
                </div>
            `;
        }

        if (result.maxReached && !result.completed) {
            resultsHTML += `
                <div class="result-item">
                    <div class="result-label">Resultado:</div>
                    <div class="result-value">Cannot be completed in ${9000} iterations</div>
                </div>
            `;
        } else if (result.completed) {
            resultsHTML += `
                <div class="result-item">
                    <div class="result-label">Resultado:</div>
                    <div class="result-value">Completed in ${result.iterations} iterations</div>
                </div>
            `;
        } else {
            resultsHTML += `
                <div class="result-item">
                    <div class="result-label">Resultado:</div>
                    <div class="result-value">No se pudo completar (iterations: ${result.iterations})</div>
                </div>
            `;
        }

        // Mostrar sudoku (completo o parcial) resultado
        resultsHTML += displaySudoku(sudokuCopy, 'Sudoku resuelto (parcial o completo):');

        sudokuResults.innerHTML = resultsHTML;
        sudokuResults.classList.add('show');
    });

    // Validación en tiempo real para solo permitir dígitos 0-9
    sudokuInput.addEventListener('input', function(e) {
        // Remover cualquier caracter que no sea 0-9
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        
        // Tu código existente para limpiar resultados...
        sudokuResults.innerHTML = `
            <div style="color: var(--text-gray); font-style: italic; text-align: center; padding: 20px;">
                Ingresá los números del sudoku para resolverlo
            </div>
        `;
        sudokuResults.classList.remove('show');
    });

    // Resolver sudoku al presionar Enter en el input
    sudokuInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevenir cualquier comportamiento por defecto
            solveBtn.click(); // Simular click en el botón
        }
    });
});