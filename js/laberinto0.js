/**
 * LABERINTO0.JS
 * Traducción de laberinto0.py a JavaScript.
 * Módulo compartido por todos los programas de la laberintología.
 *
 * Diferencias principales respecto al original en Python:
 *  - Las variables globales compartidas viven en el objeto Config en lugar
 *    de en el scope global, para no contaminar el entorno del navegador.
 *  - Cada cubículo era una tupla (salidas, paredes, sector); acá es un objeto
 *    { salidas, paredes, sector } para mayor legibilidad.
 *  - pygame.time.wait() se reemplaza con sleep(), que es una Promise asíncrona.
 *    Todas las funciones que usan animación son async y deben llamarse con await.
 *  - El dibujo usa Canvas API (ctx) en lugar de pygame.draw.
 */


// ─────────────────────────────────────────────
// CONSTANTES DE DIRECCIÓN
// ─────────────────────────────────────────────

export const ARRIBA    = 'arriba';
export const ABAJO     = 'abajo';
export const IZQUIERDA = 'izquierda';
export const DERECHA   = 'derecha';

const DIRECCIONES = [ARRIBA, ABAJO, IZQUIERDA, DERECHA];


// ─────────────────────────────────────────────
// COLORES
// ─────────────────────────────────────────────

const COLOR_CONECTOR = 'rgb(30, 30, 230)';
const BLANCO         = 'rgb(250, 250, 250)';


// ─────────────────────────────────────────────
// CONFIGURACIÓN GLOBAL (equivalente a compartirGlobales())
// En Python estas variables se seteaban con compartirGlobales() y vivían
// en el scope del módulo. Acá viven en este objeto, que todos los módulos importan.
// ─────────────────────────────────────────────

export const Config = {
    canvas:         null,   // elemento <canvas> del DOM
    ctx:            null,   // contexto 2D del canvas
    N_FILAS:        0,
    N_COLUMNAS:     0,
    BORDE:          0,
    LADO:           0,
    ANCHO_PANTALLA: 0,
    ALTO_PANTALLA:  0,
    COLOR_FONDO:    '#000000',
    COLOR_PARED:    '#32c832',
    CON_MULTISALIDA: false,
    CON_ANIMACION:   false,
};

export function compartirGlobales(canvas, nFilas, nColumnas, borde, lado, colorFondo, colorPared) {
    Config.canvas         = canvas;
    Config.ctx            = canvas.getContext('2d');
    Config.N_FILAS        = nFilas;
    Config.N_COLUMNAS     = nColumnas;
    Config.BORDE          = borde;
    Config.LADO           = lado;
    Config.ANCHO_PANTALLA = canvas.width;
    Config.ALTO_PANTALLA  = canvas.height;
    Config.COLOR_FONDO    = colorFondo;
    Config.COLOR_PARED    = colorPared;
}

export function activarMultisalida() { Config.CON_MULTISALIDA = true; }
export function desactivarMultisalida() { Config.CON_MULTISALIDA = false; }
export function activarAnimacion()   { Config.CON_ANIMACION = true; }
export function desactivarAnimacion() { Config.CON_ANIMACION = false; }


// ─────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────

// Equivalente a pygame.time.wait(ms): pausa sin bloquear el navegador.
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Equivalente a random.choice(lista).
export function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Equivalente a random.shuffle(lista) — mezcla en el lugar (Fisher-Yates).
export function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

// Crea un rango [0, 1, 2, ..., n-1], equivalente a range(n) de Python.
export function rango(n) {
    return Array.from({ length: n }, (_, i) => i);
}

// Crea una copia de un array y la devuelve mezclada.
export function rangoMezclado(n) {
    const arr = rango(n);
    shuffle(arr);
    return arr;
}


// ─────────────────────────────────────────────
// DIBUJO (equivalente a las funciones pygame.draw de laberinto0.py)
// ─────────────────────────────────────────────

// Equivalente a dibujarCubiculo().
// Dibuja las paredes de un cubículo (i, j) y opcionalmente su número de sector.
export function dibujarCubiculo(i, j, paredes, numSector, conNumero, conEspera = false) {
    const ctx   = Config.ctx;
    const BORDE = Config.BORDE;
    const LADO  = Config.LADO;

    const arIx = j * LADO + BORDE,  arIy = i * LADO + BORDE;
    const abIx = arIx,               abIy = arIy + LADO;
    const arDx = arIx + LADO,        arDy = arIy;
    const abDx = arDx,               abDy = abIy;

    ctx.strokeStyle = Config.COLOR_PARED;
    ctx.lineWidth   = BORDE;
    ctx.lineCap     = 'square';

    ctx.beginPath();
    if (paredes.includes(ARRIBA)) {
        ctx.moveTo(arIx, arIy); ctx.lineTo(arDx, arDy);
    }
    if (paredes.includes(ABAJO)) {
        ctx.moveTo(abIx, abIy); ctx.lineTo(abDx, abDy);
    }
    if (paredes.includes(IZQUIERDA)) {
        ctx.moveTo(arIx, arIy); ctx.lineTo(abIx, abIy);
    }
    if (paredes.includes(DERECHA)) {
        ctx.moveTo(arDx, arDy); ctx.lineTo(abDx, abDy);
    }
    ctx.stroke();

    if (numSector !== null && conNumero) {
        const cx = arIx + LADO / 2;
        const cy = arIy + LADO / 2;
        ctx.fillStyle  = BLANCO;
        ctx.font       = '10px monospace';
        ctx.textAlign  = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(numSector), cx, cy);
    }
}

// Equivalente a dibujarLaberinto().
export function dibujarLaberinto(lab) {
    const ctx = Config.ctx;
    ctx.fillStyle = Config.COLOR_FONDO;
    ctx.fillRect(0, 0, Config.ANCHO_PANTALLA, Config.ALTO_PANTALLA);
    for (let i = 0; i < Config.N_FILAS; i++) {
        for (let j = 0; j < Config.N_COLUMNAS; j++) {
            dibujarCubiculo(i, j, lab[i][j].paredes, lab[i][j].sector, false);
        }
    }
}

// Equivalente a borrarPared() — borra una pared individual dibujando sobre ella con el color de fondo.
export async function borrarPared(i, j, pared, numSectorInicial) {
    const ctx   = Config.ctx;
    const BORDE = Config.BORDE;
    const LADO  = Config.LADO;

    const arIx = j * LADO + BORDE,  arIy = i * LADO + BORDE;
    const abIx = arIx,               abIy = arIy + LADO;
    const arDx = arIx + LADO,        arDy = arIy;
    const abDx = arDx,               abDy = abIy;

    ctx.strokeStyle = Config.COLOR_FONDO;
    ctx.lineWidth   = BORDE;
    ctx.lineCap     = 'square';
    ctx.beginPath();

    // Si la animación está activa, pintamos el número de azul (el "conector")
    if (Config.CON_ANIMACION) {
        cambiarNumero(i, j, COLOR_CONECTOR, numSectorInicial);
        await sleep(1000);
    }

    // Se deja un margen de 2px en los extremos para no borrar las esquinas (igual que en Python)
    if (pared === ARRIBA)     { ctx.moveTo(arIx + 2, arIy); ctx.lineTo(arDx - 2, arDy); }
    if (pared === ABAJO)      { ctx.moveTo(abIx + 2, abIy); ctx.lineTo(abDx - 2, abDy); }
    if (pared === IZQUIERDA)  { ctx.moveTo(arIx, arIy + 2); ctx.lineTo(abIx, abIy - 2); }
    if (pared === DERECHA)    { ctx.moveTo(arDx, arDy + 2); ctx.lineTo(abDx, abDy - 2); }
    ctx.stroke();
}

// Equivalente a cambiarNumero() — actualiza el número de sector visible en un cubículo.
export function cambiarNumero(i, j, color, numSector) {
    const ctx  = Config.ctx;
    const LADO = Config.LADO;
    const BORDE = Config.BORDE;

    const cx = j * LADO + BORDE + LADO / 2;
    const cy = i * LADO + BORDE + LADO / 2;

    // Borra el número anterior
    ctx.fillStyle = Config.COLOR_FONDO;
    ctx.fillRect(cx - 7, cy - 7, 14, 14);

    // Escribe el nuevo
    ctx.fillStyle    = color;
    ctx.font         = '10px monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(numSector), cx, cy);
}

// Equivalente a borrarLaberinto() — borra las paredes de a una, en orden aleatorio.
export async function borrarLaberinto(lab) {
    const pares = [];
    for (let i = 0; i < Config.N_FILAS; i++)
        for (let j = 0; j < Config.N_COLUMNAS; j++)
            pares.push([i, j]);
    shuffle(pares);

    for (const [i, j] of pares) {
        borrarParedes(i, j);
        if (Config.CON_ANIMACION) await sleep(1000 / 60);
    }

    const ctx = Config.ctx;
    ctx.fillStyle = Config.COLOR_FONDO;
    ctx.fillRect(0, 0, Config.ANCHO_PANTALLA, Config.ALTO_PANTALLA);

    if (Config.CON_ANIMACION) await sleep(1500);
}

// Borra todas las paredes de un cubículo individual (pinta sobre ellas con color de fondo).
export function borrarParedes(i, j) {
    const BORDE = Config.BORDE;
    const LADO  = Config.LADO;
    const ctx   = Config.ctx;

    const arIx = j * LADO + BORDE,  arIy = i * LADO + BORDE;
    const abIx = arIx,               abIy = arIy + LADO;
    const arDx = arIx + LADO,        arDy = arIy;
    const abDx = arDx,               abDy = abIy;

    ctx.strokeStyle = Config.COLOR_FONDO;
    ctx.lineWidth   = BORDE;
    ctx.lineCap     = 'square';
    ctx.beginPath();
    ctx.moveTo(arIx + 2, arIy);  ctx.lineTo(arDx - 2, arDy);
    ctx.moveTo(abIx + 2, abIy);  ctx.lineTo(abDx - 2, abDy);
    ctx.moveTo(arIx, arIy + 2);  ctx.lineTo(abIx, abIy - 2);
    ctx.moveTo(arDx, arDy + 2);  ctx.lineTo(abDx, abDy - 2);
    ctx.stroke();
}


// ─────────────────────────────────────────────
// LÓGICA DEL LABERINTO
// ─────────────────────────────────────────────

// Equivalente a generarLados().
// Recibe un cubículo vacío y devuelve un objeto { salidas, paredes, sector }
// con las salidas y paredes generadas aleatoriamente, respetando las restricciones.
export function generarLados(fil, col, lab, buscarleSalida = true) {
    const { N_FILAS, N_COLUMNAS } = Config;

    let posiblesSalidas = [...DIRECCIONES];
    let paredes         = [...DIRECCIONES];
    let salidas         = [];
    const sector        = null;

    // Borde superior
    if (fil === 0) {
        posiblesSalidas = posiblesSalidas.filter(d => d !== ARRIBA);
    } else if (lab[fil - 1][col].paredes !== null) {
        if (lab[fil - 1][col].salidas.includes(ABAJO) || lab[fil - 1][col].paredes.includes(ABAJO)) {
            paredes         = paredes.filter(d => d !== ARRIBA);
            posiblesSalidas = posiblesSalidas.filter(d => d !== ARRIBA);
        }
    }

    // Borde inferior
    if (fil === N_FILAS - 1) {
        posiblesSalidas = posiblesSalidas.filter(d => d !== ABAJO);
    } else if (lab[fil + 1][col].paredes !== null) {
        if (lab[fil + 1][col].salidas.includes(ARRIBA) || lab[fil + 1][col].paredes.includes(ARRIBA)) {
            paredes         = paredes.filter(d => d !== ABAJO);
            posiblesSalidas = posiblesSalidas.filter(d => d !== ABAJO);
        }
    }

    // Borde izquierdo
    if (col === 0) {
        posiblesSalidas = posiblesSalidas.filter(d => d !== IZQUIERDA);
    } else if (lab[fil][col - 1].paredes !== null) {
        if (lab[fil][col - 1].salidas.includes(DERECHA) || lab[fil][col - 1].paredes.includes(DERECHA)) {
            paredes         = paredes.filter(d => d !== IZQUIERDA);
            posiblesSalidas = posiblesSalidas.filter(d => d !== IZQUIERDA);
        }
    }

    // Borde derecho
    if (col === N_COLUMNAS - 1) {
        posiblesSalidas = posiblesSalidas.filter(d => d !== DERECHA);
    } else if (lab[fil][col + 1].paredes !== null) {
        if (lab[fil][col + 1].salidas.includes(IZQUIERDA) || lab[fil][col + 1].paredes.includes(IZQUIERDA)) {
            paredes         = paredes.filter(d => d !== DERECHA);
            posiblesSalidas = posiblesSalidas.filter(d => d !== DERECHA);
        }
    }

    // Elegir salidas al azar
    let nSalidas = 0;
    const maxSalidas = Config.CON_MULTISALIDA ? (Math.random() < 0.5 ? 1 : 2) : 1;

    while (posiblesSalidas.length > 0 && nSalidas < maxSalidas && buscarleSalida) {
        nSalidas++;
        const idx      = Math.floor(Math.random() * posiblesSalidas.length);
        const unaSalida = posiblesSalidas.splice(idx, 1)[0];
        salidas.push(unaSalida);
        paredes = paredes.filter(d => d !== unaSalida);
    }

    if (Config.CON_ANIMACION) {
        dibujarCubiculo(fil, col, paredes, sector, false, true);
    }

    return { salidas, paredes, sector };
}


// Equivalente a esbozarLaberinto().
// Genera un primer boceto del laberinto según la opción elegida (0 a 4).
// El resultado puede estar fragmentado; hay que aplicarle detectarSectores() y unirSectores().
export async function esbozarLaberinto(opcion) {
    const { N_FILAS, N_COLUMNAS } = Config;

    const numsFilas    = rango(N_FILAS);
    const numsColumnas = rango(N_COLUMNAS);
    const numsFilasRan    = rangoMezclado(N_FILAS);
    const numsColumnasRan = rangoMezclado(N_COLUMNAS);

    // Inicializar la matriz con cubículos vacíos
    const lab = [];
    for (let i = 0; i < N_FILAS; i++) {
        const fila = [];
        for (let j = 0; j < N_COLUMNAS; j++) {
            fila.push({ salidas: null, paredes: null, sector: null });
        }
        lab.push(fila);
    }

    // OPCIÓN 0: por filas
    if (opcion === 0) {
        for (const i of numsFilas) {
            for (const j of numsColumnasRan) {
                lab[i][j] = generarLados(i, j, lab);
                if (Config.CON_ANIMACION) await sleep(80);
            }
        }

    // OPCIÓN 1: arriba, abajo, izquierda, derecha, repeat
    } else if (opcion === 1) {
        await opcionDos(lab, N_FILAS, numsFilas, numsColumnas, numsFilasRan, numsColumnasRan);

    // OPCIÓN 2: desde las columnas del medio hacia los costados (con tres filas intercaladas)
    } else if (opcion === 2) {
        const mitad       = Math.floor(numsColumnas.length / 2);
        const primeraMitad  = numsColumnas.slice(mitad);
        const segundaMitad  = numsColumnas.slice(0, mitad).reverse();

        const filaUnCuarto    = Math.floor(numsFilas.length / 4);
        const filaDelMedio    = filaUnCuarto * 2;
        const filaTresCuartos = filaUnCuarto * 3;

        for (const j of numsColumnasRan) {
            lab[filaUnCuarto][j]    = generarLados(filaUnCuarto, j, lab);
            lab[filaDelMedio][j]    = generarLados(filaDelMedio, j, lab);
            lab[filaTresCuartos][j] = generarLados(filaTresCuartos, j, lab);
            if (Config.CON_ANIMACION) await sleep(80);
        }
        for (const j of primeraMitad) {
            for (const i of numsFilasRan) {
                if (lab[i][j].paredes === null) {
                    lab[i][j] = generarLados(i, j, lab);
                    if (Config.CON_ANIMACION) await sleep(60);
                }
            }
        }
        for (const j of segundaMitad) {
            for (const i of numsFilasRan) {
                if (lab[i][j].paredes === null) {
                    lab[i][j] = generarLados(i, j, lab);
                    if (Config.CON_ANIMACION) await sleep(60);
                }
            }
        }

    // OPCIÓN 3: todos los cubículos sin buscar salida, luego el algoritmo une todo
    } else if (opcion === 3) {
        for (const i of numsFilas) {
            for (const j of numsColumnas) {
                lab[i][j] = generarLados(i, j, lab, false);
                if (Config.CON_ANIMACION) await sleep(40);
            }
        }

    // OPCIÓN 4: en espiral desde el centro, más el perímetro con cuadrados sin salida
    } else {
        let pasamosPorOrigen = false;
        let pasamosPorFin    = false;
        let i = Math.floor(N_FILAS / 2);
        let j = Math.floor(N_COLUMNAS / 2);
        let cantDeMov = 1;

        lab[i][j] = generarLados(i, j, lab);
        if (Config.CON_ANIMACION) await sleep(60);

        while (!(pasamosPorOrigen && pasamosPorFin)) {

            let contador = 0;
            while (i > 1 && contador < cantDeMov) { i--; contador++;
                if (lab[i][j].paredes === null) { lab[i][j] = generarLados(i, j, lab); if (Config.CON_ANIMACION) await sleep(60); }
            }
            contador = 0;
            while (j > 1 && contador < cantDeMov) { j--; contador++;
                if (lab[i][j].paredes === null) { lab[i][j] = generarLados(i, j, lab); if (Config.CON_ANIMACION) await sleep(60); }
            }
            if (i === 1 && j === 1) pasamosPorOrigen = true;

            cantDeMov++;
            contador = 0;
            while (i < N_FILAS - 2 && contador < cantDeMov) { i++; contador++;
                if (lab[i][j].paredes === null) { lab[i][j] = generarLados(i, j, lab); if (Config.CON_ANIMACION) await sleep(60); }
            }
            contador = 0;
            while (j < N_COLUMNAS - 2 && contador < cantDeMov) { j++; contador++;
                if (lab[i][j].paredes === null) { lab[i][j] = generarLados(i, j, lab); if (Config.CON_ANIMACION) await sleep(60); }
            }
            if (i === N_FILAS - 2 && j === N_COLUMNAS - 2) pasamosPorFin = true;
            cantDeMov++;
        }
        await opcionDos(lab, 1, numsFilas, numsColumnas, numsFilasRan, numsColumnasRan, false);
    }

    return lab;
}


// Equivalente a opcionDos() — subfunción compartida por las opciones 1 y 4.
export async function opcionDos(lab, cantVueltas, numsFilas, numsColumnas, numsFilasRan, numsColumnasRan, buscarSalida = true) {
    const numsFilasRev    = [...numsFilas].reverse();
    const numsColumnasRev = [...numsColumnas].reverse();

    for (let aux = 0; aux < cantVueltas; aux++) {

        const iUp   = numsFilas[aux];
        const iDown = numsFilasRev[aux];
        const jLeft  = numsColumnas[aux];
        const jRight = numsColumnasRev[aux];

        for (const j of numsColumnasRan) {
            if (lab[iUp][j].salidas === null)   { lab[iUp][j]   = generarLados(iUp,   j, lab, buscarSalida); if (Config.CON_ANIMACION) await sleep(80); }
        }
        for (const j of numsColumnasRan) {
            if (lab[iDown][j].salidas === null)  { lab[iDown][j]  = generarLados(iDown,  j, lab, buscarSalida); if (Config.CON_ANIMACION) await sleep(80); }
        }
        for (const i of numsFilasRan.slice(iUp, iDown + 1)) {
            if (lab[i][jLeft].salidas === null)  { lab[i][jLeft]  = generarLados(i, jLeft,  lab, buscarSalida); if (Config.CON_ANIMACION) await sleep(80); }
        }
        for (const i of numsFilasRan.slice(iUp, iDown + 1)) {
            if (lab[i][jRight].salidas === null) { lab[i][jRight] = generarLados(i, jRight, lab, buscarSalida); if (Config.CON_ANIMACION) await sleep(80); }
        }
        shuffle(numsFilasRan);
        shuffle(numsColumnasRan);
    }
    return lab;
}


// Equivalente a detectarSectores().
// Recorre el laberinto y asigna un número de sector a cada cubículo.
// Devuelve { lab, sectores } donde sectores es una lista de listas de coordenadas [i, j].
export async function detectarSectores(lab) {
    let numSector = 0;
    const sectores = [];

    for (let i = 0; i < Config.N_FILAS; i++) {
        for (let j = 0; j < Config.N_COLUMNAS; j++) {
            if (lab[i][j].sector === null) {
                const { sector } = await identificarSector(i, j, lab, numSector);
                sectores.push(sector);
                numSector++;
            }
        }
    }
    return { lab, sectores };
}


// Equivalente a identificarSector().
// A partir de un cubículo inicial, identifica todos los cubículos conectados (mismo sector).
export async function identificarSector(i0, j0, lab, numSector) {
    const { N_FILAS, N_COLUMNAS } = Config;

    lab[i0][j0].sector = numSector;
    const yaAgregados  = [[i0, j0]];
    const nuevosMiembros = [];

    function agregarVecinos(i, j) {
        const { salidas, paredes } = lab[i][j];
        if (i > 0          && !paredes.includes(ARRIBA)    && lab[i-1][j].sector === null && !lab[i-1][j].paredes.includes(ABAJO))
            nuevosMiembros.push([i-1, j]);
        if (i < N_FILAS-1  && !paredes.includes(ABAJO)     && lab[i+1][j].sector === null && !lab[i+1][j].paredes.includes(ARRIBA))
            nuevosMiembros.push([i+1, j]);
        if (j > 0          && !paredes.includes(IZQUIERDA) && lab[i][j-1].sector === null && !lab[i][j-1].paredes.includes(DERECHA))
            nuevosMiembros.push([i, j-1]);
        if (j < N_COLUMNAS-1 && !paredes.includes(DERECHA) && lab[i][j+1].sector === null && !lab[i][j+1].paredes.includes(IZQUIERDA))
            nuevosMiembros.push([i, j+1]);
    }

    agregarVecinos(i0, j0);
    if (Config.CON_ANIMACION) {
        dibujarCubiculo(i0, j0, lab[i0][j0].paredes, numSector, true, true);
        await sleep(50);
    }

    while (nuevosMiembros.length > 0) {

        const [i, j] = nuevosMiembros.shift();

        // Si ya fue procesado (por otro camino), saltar
        if (lab[i][j].sector !== null) continue;

        lab[i][j].sector = numSector;
        yaAgregados.push([i, j]);

        agregarVecinos(i, j);

        if (Config.CON_ANIMACION) {
            dibujarCubiculo(i, j, lab[i][j].paredes, numSector, true, true);
            await sleep(50);
        }
    }

    return { lab, sector: yaAgregados };
}


// Equivalente a esFronterizo().
// Detecta si un cubículo linda con un cubículo de otro sector.
// Devuelve el lado que hace de frontera, o null si no hay frontera.
export function esFronterizo(lab, conector, numSectorInicial) {
    const [i, j] = conector;
    const { N_FILAS, N_COLUMNAS } = Config;

    if (i !== 0          && lab[i-1][j].sector !== numSectorInicial) return ARRIBA;
    if (i !== N_FILAS-1  && lab[i+1][j].sector !== numSectorInicial) return ABAJO;
    if (j !== 0          && lab[i][j-1].sector !== numSectorInicial) return IZQUIERDA;
    if (j !== N_COLUMNAS-1 && lab[i][j+1].sector !== numSectorInicial) return DERECHA;
    return null;
}


// Equivalente a unirSectores().
// Une todos los sectores del laberinto hasta que quede uno solo.
// Devuelve { lab, conectoresUsados }.
export async function unirSectores(lab, sectores, numSectorInicial) {
    const conectoresUsados = [];
    let posiblesConectores = [...sectores[numSectorInicial]];

    // El número de uniones necesarias es siempre N_sectores - 1
    for (let _ = 0; _ < sectores.length - 1; _++) {

        // Buscar un conector fronterizo válido
        let conector = randomChoice(posiblesConectores);
        let frontera = esFronterizo(lab, conector, numSectorInicial);
        while (frontera === null) {
            posiblesConectores = posiblesConectores.filter(c => c !== conector);
            conector  = randomChoice(posiblesConectores);
            frontera  = esFronterizo(lab, conector, numSectorInicial);
        }

        const [i, j] = conector;
        conectoresUsados.push([i, j, frontera]);

        // Pausa inicial de la unión (según el original)
        if (Config.CON_ANIMACION) await sleep(1000);

        // Identificar el sector que vamos a absorber
        let numNuevoSector;
        if (frontera === ARRIBA) {
            lab[i][j].paredes     = lab[i][j].paredes.filter(d => d !== ARRIBA);
            lab[i-1][j].paredes   = lab[i-1][j].paredes.filter(d => d !== ABAJO);
            await borrarPared(i, j, ARRIBA, numSectorInicial); // <-- AGREGADO AWAIT
            numNuevoSector = lab[i-1][j].sector;
        } else if (frontera === ABAJO) {
            lab[i][j].paredes     = lab[i][j].paredes.filter(d => d !== ABAJO);
            lab[i+1][j].paredes   = lab[i+1][j].paredes.filter(d => d !== ARRIBA);
            await borrarPared(i, j, ABAJO, numSectorInicial); // <-- AGREGADO AWAIT
            numNuevoSector = lab[i+1][j].sector;
        } else if (frontera === IZQUIERDA) {
            lab[i][j].paredes     = lab[i][j].paredes.filter(d => d !== IZQUIERDA);
            lab[i][j-1].paredes   = lab[i][j-1].paredes.filter(d => d !== DERECHA);
            await borrarPared(i, j, IZQUIERDA, numSectorInicial); // <-- AGREGADO AWAIT
            numNuevoSector = lab[i][j-1].sector;
        } else {
            lab[i][j].paredes     = lab[i][j].paredes.filter(d => d !== DERECHA);
            lab[i][j+1].paredes   = lab[i][j+1].paredes.filter(d => d !== IZQUIERDA);
            await borrarPared(i, j, DERECHA, numSectorInicial); // <-- AGREGADO AWAIT
            numNuevoSector = lab[i][j+1].sector;
        }

        // Una vez borrada la pared, cambiamos los números del sector absorbido
        const nuevoSector = sectores[numNuevoSector];
        for (const [fi, fj] of nuevoSector) {
            lab[fi][fj].sector = numSectorInicial;
            if (Config.CON_ANIMACION) {
                cambiarNumero(fi, fj, BLANCO, numSectorInicial);
                await sleep(50);
            }
        }
        posiblesConectores.push(...nuevoSector);
    }

    return { lab, conectoresUsados };
}


// ─────────────────────────────────────────────
// FUNCIONES DE ALTO NIVEL
// Equivalentes a generarLaberinto() y generarLabConConec()
// ─────────────────────────────────────────────

export async function generarLaberinto(opcion) {
    let lab = await esbozarLaberinto(opcion);
    const { sectores } = await detectarSectores(lab);
    const iRand = Math.floor(Math.random() * Config.N_FILAS);
    const jRand = Math.floor(Math.random() * Config.N_COLUMNAS);
    const numSectorIni = lab[iRand][jRand].sector;
    const resultado = await unirSectores(lab, sectores, numSectorIni);
    return resultado.lab;
}

export async function generarLabConConec(opcion) {
    let lab = await esbozarLaberinto(opcion);
    const { sectores } = await detectarSectores(lab);
    const iRand = Math.floor(Math.random() * Config.N_FILAS);
    const jRand = Math.floor(Math.random() * Config.N_COLUMNAS);
    const numSectorIni = lab[iRand][jRand].sector;
    const { lab: labFinal, conectoresUsados } = await unirSectores(lab, sectores, numSectorIni);
    return { lab: labFinal, conectoresUsados };
}