/**
 * LABERINTO3_JUEGO.JS
 * Traducción de laberinto3_Juego.py a JavaScript.
 * ESCAPE IMPERFECTO
 *
 * El objetivo del juego es resolver el laberinto, o sea, encontrar el camino
 * desde el inicio (arriba a la izquierda), hasta la meta (un cuadrado blanco).
 * Hay 5 niveles, numerados del 0 al 4.
 *
 * Uso desde el HTML:
 *   import { iniciarJuego } from './laberinto3_Juego.js';
 *   await iniciarJuego(canvas);
 */

import {
    Config,
    compartirGlobales,
    desactivarAnimacion,
    generarLaberinto,
    generarLabConConec,
    dibujarLaberinto,
    borrarLaberinto,
    borrarPared,
    sleep,
    rango,
    ARRIBA, ABAJO, IZQUIERDA, DERECHA,
} from './laberinto0.js';


// ─────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────

const FPS = 48;

const BORDE        = 4;
const DOBLEBORDE   = BORDE * 2;
const ANCHO_LIENZO = 1200;
const ALTO_LIENZO  = 600;
const ANCHO_PANTALLA = ANCHO_LIENZO + DOBLEBORDE;
const ALTO_PANTALLA  = ALTO_LIENZO  + DOBLEBORDE;

const TAM_LADOS   = [100, 50, 50, 20, 10];
const CANT_NIVELES = TAM_LADOS.length;

const CANT_NUBES              = [11, 15, 20, 25, 30];
const NIVELES_CON_LAVA        = [1, 2, 3, 4];
const NIVELES_CON_PASADIZO    = [1, 3];
const NIVELES_CON_FALSAS      = [2];
const NIVELES_CON_VISION_REDUCIDA = [0, 0, 0, 0, 12];

const COLOR_FONDO   = '#141414';   // (20, 20, 20)
const COLOR_PARED   = '#32c832';   // (50, 200, 50)
const COLOR_JUGADOR = '#f0c864';   // (240, 200, 100)
const COLOR_LLEGADA = '#fafafa';   // (250, 250, 250)


const teclasPulsadas = {};

// Registramos los eventos una sola vez para toda la sesión
window.addEventListener('keydown', (e) => {
    teclasPulsadas[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    teclasPulsadas[e.key] = false;
});


// ─────────────────────────────────────────────
// ESTADO DEL JUEGO (equivalente a las variables globales de Python)
// ─────────────────────────────────────────────

let LADO, N_FILAS, N_COLUMNAS, J_RADIO, J_DIAMETRO;
let NUBES, LAVA, PASADIZO, FALSAS, VISION;
let lab, baseSurfData;   // baseSurfData es la ImageData del laberinto base (equivalente a BASESURF)
let posX, posY, posFil, posCol;
let metaX, metaY, metaFil, metaCol;


// Control del game loop
let _loopId       = null;


// ─────────────────────────────────────────────
// API PÚBLICA
// ─────────────────────────────────────────────

export async function iniciarJuego(canvas) {
    canvas.width  = ANCHO_PANTALLA;
    canvas.height = ALTO_PANTALLA;
    Object.keys(teclasPulsadas).forEach(k => delete teclasPulsadas[k]);
    desactivarAnimacion();

    await animacionPresentarJuego(canvas);

    await new Promise(async resolve => {

        let nivel = 0;
        await animacionPresentarNivel(canvas, nivel);
        await cargarNivel(canvas, nivel);

        // Game loop principal (equivalente al while True de Python)
        async function gameLoop() {
            const ctx = canvas.getContext('2d');

            // Chequear lava
            if (NIVELES_CON_LAVA.includes(nivel)) {
                if (haMuerto(posFil, posCol)) {
                    cancelAnimationFrame(_loopId);
                    await animacionPerdedora(canvas, lab);
                    await cargarNivel(canvas, nivel);
                    _loopId = requestAnimationFrame(gameLoop);
                    return;
                }
                if (Math.floor(Math.random() * 80) === 39) {
                    const huboAmpliacion = ampliarLava(lab);
                    if (!huboAmpliacion) LAVA = crearLava();
                }
            }

            // Chequear pasadizo
            if (NIVELES_CON_PASADIZO.includes(nivel)) {
                if (pisaPasadizo(posFil, posCol)) {
                    cancelAnimationFrame(_loopId);
                    ({ posFil, posCol, posX, posY } = await tomarPasadizo(canvas, posFil, posCol, PASADIZO));
                }
            }

            // Movimiento
            let movido = false;
            if (teclasPulsadas['ArrowUp'] && posFil > 0) {
                if (!lab[posFil][posCol].paredes.includes(ARRIBA) && !lab[posFil-1][posCol].paredes.includes(ABAJO)) {
                    cancelAnimationFrame(_loopId);
                    ({ posX, posY, posFil, posCol } = await mover(canvas, posX, posY, posFil, posCol, ARRIBA));
                    movido = true;
                }
            } else if (teclasPulsadas['ArrowDown'] && posFil < N_FILAS - 1) {
                if (!lab[posFil][posCol].paredes.includes(ABAJO) && !lab[posFil+1][posCol].paredes.includes(ARRIBA)) {
                    cancelAnimationFrame(_loopId);
                    ({ posX, posY, posFil, posCol } = await mover(canvas, posX, posY, posFil, posCol, ABAJO));
                    movido = true;
                }
            } else if (teclasPulsadas['ArrowLeft'] && posCol > 0) {
                if (!lab[posFil][posCol].paredes.includes(IZQUIERDA) && !lab[posFil][posCol-1].paredes.includes(DERECHA)) {
                    cancelAnimationFrame(_loopId);
                    ({ posX, posY, posFil, posCol } = await mover(canvas, posX, posY, posFil, posCol, IZQUIERDA));
                    movido = true;
                }
            } else if (teclasPulsadas['ArrowRight'] && posCol < N_COLUMNAS - 1) {
                if (!lab[posFil][posCol].paredes.includes(DERECHA) && !lab[posFil][posCol+1].paredes.includes(IZQUIERDA)) {
                    cancelAnimationFrame(_loopId);
                    ({ posX, posY, posFil, posCol } = await mover(canvas, posX, posY, posFil, posCol, DERECHA));
                    movido = true;
                }
            }

            // Chequear llegada a la meta
            if (movido && posFil === metaFil && posCol === metaCol) {
                nivel++;
                cancelAnimationFrame(_loopId);
                await animacionGanadora(canvas, lab, posX, posY, nivel);
                if (nivel < CANT_NIVELES) {
                    await animacionPresentarNivel(canvas, nivel);
                    await cargarNivel(canvas, nivel);
                    _loopId = requestAnimationFrame(gameLoop);
                } else {
                    resolve();
                }
                return;
            }

            actualizarTodo(canvas);
            _loopId = requestAnimationFrame(gameLoop);
        }

        _loopId = requestAnimationFrame(gameLoop);
    });

}



// ─────────────────────────────────────────────
// GENERACIÓN DE NIVEL
// Equivalente a generarNivel() de Python
// ─────────────────────────────────────────────

async function cargarNivel(canvas, nivel) {
    const ctx = canvas.getContext('2d');

    LADO       = TAM_LADOS[nivel];
    N_FILAS    = Math.floor(ALTO_LIENZO / LADO);
    N_COLUMNAS = Math.floor(ANCHO_LIENZO / LADO);
    J_RADIO    = Math.floor(LADO / 4);
    J_DIAMETRO = J_RADIO * 2;

    // La meta del nivel 3 es aleatoria; en el resto siempre es abajo a la derecha
    if (nivel !== 3) {
        metaFil = N_FILAS - 1;
        metaCol = N_COLUMNAS - 1;
    } else {
        metaFil = Math.floor(Math.random() * 4) + (N_FILAS - 4);
        metaCol = Math.floor(Math.random() * 9) + (Math.floor(N_COLUMNAS / 2) - 4);
    }

    compartirGlobales(canvas, N_FILAS, N_COLUMNAS, BORDE, LADO, COLOR_FONDO, COLOR_PARED);

    let cnc = [];
    if (NIVELES_CON_FALSAS.includes(nivel)) {
        const resultado = await generarLabConConec(nivel);
        lab = resultado.lab;
        cnc = resultado.conectoresUsados;
    } else {
        lab = await generarLaberinto(nivel);
    }

    // Dibujar laberinto base
    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, ANCHO_PANTALLA, ALTO_PANTALLA);
    dibujarLaberinto(lab);

    posX   = BORDE + Math.floor(LADO / 2) + 1;
    posY   = BORDE + Math.floor(LADO / 2) + 1;
    posFil = 0;
    posCol = 0;
    metaX  = metaCol * LADO + J_RADIO + BORDE + 1;
    metaY  = metaFil * LADO + J_RADIO + BORDE + 1;

    // La meta del nivel 3 es invisible
    if (nivel !== 3) {
        ctx.fillStyle = COLOR_LLEGADA;
        ctx.fillRect(metaX, metaY, J_DIAMETRO, J_DIAMETRO);
    }

    // Guardar el estado base del canvas (equivalente a BASESURF = DISPLAYSURF.copy())
    baseSurfData = ctx.getImageData(0, 0, ANCHO_PANTALLA, ALTO_PANTALLA);

    const dificultades = agregarDificultades(nivel, cnc);
    NUBES    = dificultades.NUBES;
    LAVA     = dificultades.LAVA;
    PASADIZO = dificultades.PASADIZO;
    FALSAS   = dificultades.FALSAS;
    VISION   = dificultades.VISION;
}


// ─────────────────────────────────────────────
// DIFICULTADES
// Equivalente a agregarDificultades() de Python
// ─────────────────────────────────────────────

function agregarDificultades(nivel, conectores) {
    const NUBES    = crearNubes(CANT_NUBES[nivel]);
    const LAVA     = NIVELES_CON_LAVA.includes(nivel)     ? crearLava()     : [];
    const PASADIZO = NIVELES_CON_PASADIZO.includes(nivel) ? crearPasadizo() : [];
    const FALSAS   = NIVELES_CON_FALSAS.includes(nivel)   ? conectores      : [];
    const VISION   = NIVELES_CON_VISION_REDUCIDA[nivel];
    return { NUBES, LAVA, PASADIZO, FALSAS, VISION };
}

function crearNubes(cantNubes) {
    const nubes = [];
    for (let _ = 0; _ < cantNubes; _++) {
        const nubeX    = Math.floor(Math.random() * ANCHO_LIENZO);
        const nubeY    = Math.floor(Math.random() * ALTO_LIENZO);
        const ladoNube = Math.floor(Math.random() * (LADO * 2 - LADO / 4 + 1)) + Math.floor(LADO / 4);
        const tono     = Math.floor(Math.random() * 121) + 100;
        const colorNube = [
            tono + Math.floor(Math.random() * 11) - 5,
            tono,
            tono + Math.floor(Math.random() * 11) - 5
        ];
        nubes.push([nubeX, nubeY, ladoNube, colorNube]);
    }
    return nubes;
}

function crearLava() {
    const lavaFil = Math.floor(Math.random() * (N_FILAS - 3)) + 1;
    const lavaCol = Math.floor(Math.random() * (N_COLUMNAS - 5)) + 1;
    return [[lavaFil, lavaCol]];
}

function crearPasadizo() {
    const pasadizo = [];
    pasadizo.push([
        Math.floor(Math.random() * (N_FILAS / 2 - 2)) + 2,
        Math.floor(Math.random() * (N_COLUMNAS / 2 - 2)) + 2
    ]);
    pasadizo.push([
        Math.floor(Math.random() * (N_FILAS - N_FILAS / 2)) + Math.floor(N_FILAS / 2),
        Math.floor(Math.random() * (N_COLUMNAS - 2 - N_COLUMNAS / 2)) + Math.floor(N_COLUMNAS / 2)
    ]);
    return pasadizo;
}

function pisaPasadizo(pFil, pCol) {
    return PASADIZO.some(([f, c]) => f === pFil && c === pCol);
}

async function tomarPasadizo(canvas, pFil, pCol, pasadizo) {
    const idx = pasadizo.findIndex(([f, c]) => f === pFil && c === pCol);
    pasadizo.splice(idx, 1);
    [pFil, pCol] = pasadizo[0];
    PASADIZO = crearPasadizo();
    const nX = BORDE + Math.floor(LADO / 2) + 1 + pCol * LADO;
    const nY = BORDE + Math.floor(LADO / 2) + 1 + pFil * LADO;
    actualizarTodo(canvas);
    return { posFil: pFil, posCol: pCol, posX: nX, posY: nY };
}

function ampliarLava(lab) {
    const cantAntes = LAVA.length;
    const [i, j] = LAVA[LAVA.length - 1];

    if (i > 0 && !lab[i][j].paredes.includes(ARRIBA) && !lab[i-1][j].paredes.includes(ABAJO) &&
        !LAVA.some(([f,c]) => f === i-1 && c === j))
        LAVA.push([i-1, j]);
    if (i < N_FILAS-1 && !lab[i][j].paredes.includes(ABAJO) && !lab[i+1][j].paredes.includes(ARRIBA) &&
        !LAVA.some(([f,c]) => f === i+1 && c === j))
        LAVA.push([i+1, j]);
    if (j > 0 && !lab[i][j].paredes.includes(IZQUIERDA) && !lab[i][j-1].paredes.includes(DERECHA) &&
        !LAVA.some(([f,c]) => f === i && c === j-1))
        LAVA.push([i, j-1]);
    if (j < N_COLUMNAS-1 && !lab[i][j].paredes.includes(DERECHA) && !lab[i][j+1].paredes.includes(IZQUIERDA) &&
        !LAVA.some(([f,c]) => f === i && c === j+1))
        LAVA.push([i, j+1]);

    return cantAntes !== LAVA.length;
}

function haMuerto(pFil, pCol) {
    return LAVA.some(([f, c]) => f === pFil && c === pCol);
}


// ─────────────────────────────────────────────
// ACTUALIZACIÓN DEL FRAME
// Equivalente a actualizarTodo() de Python.
// En Python se copiaba BASESURF y se dibujaba encima.
// En JS se restaura la ImageData base y se dibuja encima.
// ─────────────────────────────────────────────

function actualizarTodo(canvas) {
    const ctx = canvas.getContext('2d');

    // Restaurar el laberinto base (equivalente a baseSurf = BASESURF.copy())
    ctx.putImageData(baseSurfData, 0, 0);

    // Lava
    for (const [lFil, lCol] of LAVA) {
        const arIzX = lCol * LADO + DOBLEBORDE;
        const arIzY = lFil * LADO + DOBLEBORDE;
        const r = Math.floor(Math.random() * 16) + 240;
        const g = Math.floor(Math.random() * 61) + 30;
        const b = Math.floor(Math.random() * 31);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(arIzX, arIzY, LADO - DOBLEBORDE, LADO - DOBLEBORDE);
    }

    // Pasadizo
    for (const [pFil, pCol] of PASADIZO) {
        const arIzX = pCol * LADO + DOBLEBORDE;
        const arIzY = pFil * LADO + DOBLEBORDE;
        const r = Math.floor(Math.random() * 26);
        const g = Math.floor(Math.random() * 26);
        const b = Math.floor(Math.random() * 41) + 190;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(arIzX, arIzY, LADO - DOBLEBORDE, LADO - DOBLEBORDE);
    }

    // Paredes falsas
    for (const [pFil, pCol, pared] of FALSAS) {
        dibujarParedFalsa(ctx, pFil, pCol, pared);
    }

    // Jugador
    ctx.beginPath();
    ctx.arc(posX, posY, J_RADIO, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_JUGADOR;
    ctx.fill();

    // Nubes
    for (const nube of NUBES) {
        nube[0] += Math.floor(Math.random() * 7) - 3;
        nube[1] += Math.floor(Math.random() * 7) - 3;
        const [nX, nY, ladoNube, [nr, ng, nb]] = nube;
        ctx.fillStyle = `rgb(${nr},${ng},${nb})`;
        ctx.fillRect(nX, nY, ladoNube, ladoNube);
    }

    // Visión reducida
    if (VISION !== 0) {
        visionReducida(canvas, posFil, posCol);
    }
}

function dibujarParedFalsa(ctx, i, j, pared) {
    const arIx = j * LADO + BORDE,  arIy = i * LADO + BORDE;
    const abIx = arIx,               abIy = arIy + LADO;
    const arDx = arIx + LADO,        arDy = arIy;
    const abDx = arDx,               abDy = abIy;

    ctx.strokeStyle = COLOR_PARED;
    ctx.lineWidth   = BORDE;
    ctx.lineCap     = 'square';
    ctx.beginPath();
    if (pared === ARRIBA)    { ctx.moveTo(arIx, arIy); ctx.lineTo(arDx, arDy); }
    if (pared === ABAJO)     { ctx.moveTo(abIx, abIy); ctx.lineTo(abDx, abDy); }
    if (pared === IZQUIERDA) { ctx.moveTo(arIx, arIy); ctx.lineTo(abIx, abIy); }
    if (pared === DERECHA)   { ctx.moveTo(arDx, arDy); ctx.lineTo(abDx, abDy); }
    ctx.stroke();
}

// Equivalente a visionReducida() de Python.
// En Pygame se recortaba un área de la superficie y se pegaba sobre fondo.
// En JS se usa una máscara de recorte (clip) para mostrar solo el área visible.
function visionReducida(canvas, pFil, pCol) {
    const ctx       = canvas.getContext('2d');
    const mitad     = VISION / 2;
    const arIx      = pCol * LADO + BORDE;
    const arIy      = pFil * LADO + BORDE;

    let recX, recY;

    if (pCol < mitad) {
        recX = arIx - LADO * pCol;
    } else if (pCol <= N_COLUMNAS - mitad) {
        recX = arIx - LADO * mitad;
    } else {
        for (let x = 1; x < mitad; x++) {
            if (pCol === N_COLUMNAS - x) recX = arIx - LADO * (VISION - x);
        }
    }

    if (pFil < mitad) {
        recY = arIy - LADO * pFil;
    } else if (pFil <= N_FILAS - mitad) {
        recY = arIy - LADO * mitad;
    } else {
        for (let x = 1; x < mitad; x++) {
            if (pFil === N_FILAS - x) recY = arIy - LADO * (VISION - x);
        }
    }

    const anchoVision = LADO * VISION + BORDE;
    const altoVision  = LADO * VISION + BORDE;

    // Guardar el área visible
    const recorte = ctx.getImageData(recX, recY, anchoVision, altoVision);

    // Tapar todo con el color de fondo
    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, ANCHO_PANTALLA, ALTO_PANTALLA);

    // Restaurar solo el área visible
    ctx.putImageData(recorte, recX, recY);
}


// ─────────────────────────────────────────────
// MOVIMIENTO
// Equivalente a mover() de Python.
// En Python bloqueaba con FPSCLOCK.tick(); acá usa await sleep() entre sub-pasos.
// ─────────────────────────────────────────────

async function mover(canvas, pX, pY, pFil, pCol, dire) {
    const antX    = pX;
    const antY    = pY;
    const subPasos = 4;
    const tramo   = Math.floor(LADO / subPasos);
    const msFrame = Math.floor(1000 / FPS);

    for (let _ = 0; _ < subPasos - 1; _++) {
        if (dire === ARRIBA)    pY -= tramo;
        if (dire === ABAJO)     pY += tramo;
        if (dire === IZQUIERDA) pX -= tramo;
        if (dire === DERECHA)   pX += tramo;
        posX = pX; posY = pY;
        actualizarTodo(canvas);
        await sleep(msFrame);
    }

    if (dire === ARRIBA)    { pY = antY - LADO; pFil--; }
    if (dire === ABAJO)     { pY = antY + LADO; pFil++; }
    if (dire === IZQUIERDA) { pX = antX - LADO; pCol--; }
    if (dire === DERECHA)   { pX = antX + LADO; pCol++; }

    posX = pX; posY = pY; posFil = pFil; posCol = pCol;
    actualizarTodo(canvas);
    await sleep(msFrame);

    return { posX: pX, posY: pY, posFil: pFil, posCol: pCol };
}


// ─────────────────────────────────────────────
// ANIMACIONES
// ─────────────────────────────────────────────

// Equivalente a animacionPresentarJuego() de Python.
// Las letras aparecen de a una, con distintas velocidades según el carácter.
async function animacionPresentarJuego(canvas) {
    const ctx    = canvas.getContext('2d');
    const titulo = 'ESCAPE IMPERFECTO';
    const tamLetra = 50;
    const desplIzq = (titulo.length * tamLetra) / 2;
    const tX = ANCHO_PANTALLA / 2 - desplIzq;
    const tY = ALTO_PANTALLA / 2 - 70;

    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, ANCHO_PANTALLA, ALTO_PANTALLA);
    await sleep(500);

    ctx.font      = 'bold 64px monospace';
    ctx.fillStyle = COLOR_PARED;
    ctx.textBaseline = 'middle';

    for (let i = 0; i < titulo.length; i++) {
        ctx.fillText(titulo[i], tX + i * tamLetra, tY);

        if (titulo[i] === ' ')       await sleep(500);
        else if (titulo[i] === 'T')  await sleep(1500);
        else                         await sleep(Math.max(30, 300 - i * 10));
    }

    await sleep(3000);

    // Efecto de parpadeo (equivalente al loop de 10 iteraciones de Python)
    const snapshot = ctx.getImageData(0, 0, ANCHO_PANTALLA, ALTO_PANTALLA);
    for (let _ = 0; _ < 10; _++) {
        ctx.fillStyle = COLOR_FONDO;
        ctx.fillRect(0, 0, ANCHO_PANTALLA, ALTO_PANTALLA);
        await sleep(Math.floor(Math.random() * 21) + 10);
        ctx.putImageData(snapshot, 0, 0);
        await sleep(Math.floor(Math.random() * 21) + 10);
    }

    await sleep(1500);
    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, ANCHO_PANTALLA, ALTO_PANTALLA);
    await sleep(1000);
}

// Equivalente a animacionPresentarNivel() de Python.
async function animacionPresentarNivel(canvas, nivel) {
    const ctx = canvas.getContext('2d');
    const textoPorNivel = [
        'Por ahora, solo hay nubes inofensivas',
        'La lava quema. El agua te transporta',
        'No todas las fronteras son infranqueables',
        'El destino final habita de centro a sur, sin mostrarse',
        'Un laberinto de verdad, con el destino final clásico',
    ];

    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, ANCHO_PANTALLA, ALTO_PANTALLA);
    await sleep(500);

    ctx.font         = 'bold 32px monospace';
    ctx.fillStyle    = COLOR_LLEGADA;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    const tituloNivel = nivel !== 4 ? `Nivel ${nivel}` : 'El último nivel';
    ctx.fillText(tituloNivel, ANCHO_PANTALLA / 2, ALTO_PANTALLA / 2 - 70);
    ctx.fillText(textoPorNivel[nivel], ANCHO_PANTALLA / 2, ALTO_PANTALLA / 2 + 20);

    const segundos = nivel + 3;
    await sleep(segundos * 1000);
}

// Equivalente a animacionGanadora() de Python.
// El jugador crece hasta llenar la pantalla.
async function animacionGanadora(canvas, lab, pX, pY, nivel) {
    const ctx     = canvas.getContext('2d');
    const msFrame = Math.floor(1000 / FPS);

    await sleep(1000);
    await borrarLaberinto(lab);
    await sleep(500);

    pX = ANCHO_PANTALLA / 2;
    pY = ALTO_PANTALLA / 2 - 20;

    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, ANCHO_PANTALLA, ALTO_PANTALLA);
    ctx.beginPath();
    ctx.arc(pX, pY, J_RADIO, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_JUGADOR;
    ctx.fill();

    let radio = J_RADIO;
    let suma  = 2;
    while (radio < ALTO_PANTALLA / 3) {
        radio += suma;
        suma  += 1;
        ctx.fillStyle = COLOR_FONDO;
        ctx.fillRect(0, 0, ANCHO_PANTALLA, ALTO_PANTALLA);
        ctx.beginPath();
        ctx.arc(pX, pY, radio, 0, Math.PI * 2);
        ctx.fillStyle = COLOR_JUGADOR;
        ctx.fill();
        await sleep(msFrame);
    }
    await sleep(500);

    ctx.font         = 'bold 32px monospace';
    ctx.fillStyle    = COLOR_LLEGADA;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    if (nivel < CANT_NIVELES) {
        ctx.fillText('¡Felicitaciones!', ANCHO_PANTALLA / 2, ALTO_PANTALLA / 2 - 60);
        ctx.fillText(`Pasaste al nivel ${nivel}`, ANCHO_PANTALLA / 2, ALTO_PANTALLA / 2 + 20);
    } else {
        ctx.fillText('¡Bien ahí pequeño maze runner!', ANCHO_PANTALLA / 2, ALTO_PANTALLA / 2 - 60);
        ctx.fillText('Ganaste todos los niveles que había :)', ANCHO_PANTALLA / 2, ALTO_PANTALLA / 2 + 20);
    }

    await sleep(4000);
}

// Equivalente a animacionPerdedora() de Python.
// El texto "Te quemaste" parpadea en colores de lava.
async function animacionPerdedora(canvas, lab) {
    const ctx = canvas.getContext('2d');

    await sleep(600);
    await borrarLaberinto(lab);
    await sleep(700);

    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, ANCHO_PANTALLA, ALTO_PANTALLA);

    ctx.font         = 'bold 32px monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    for (let _ = 0; _ < 300; _++) {
        const r1 = Math.floor(Math.random() * 16) + 240;
        const g1 = Math.floor(Math.random() * 61) + 30;
        const b1 = Math.floor(Math.random() * 31);
        ctx.fillStyle = COLOR_FONDO;
        ctx.fillRect(0, 0, ANCHO_PANTALLA, ALTO_PANTALLA);
        ctx.fillStyle = `rgb(${r1},${g1},${b1})`;
        ctx.fillText('Te quemaste :(', ANCHO_PANTALLA / 2, ALTO_PANTALLA / 2 - 40);
        const r2 = Math.floor(Math.random() * 16) + 240;
        const g2 = Math.floor(Math.random() * 61) + 30;
        const b2 = Math.floor(Math.random() * 31);
        ctx.fillStyle = `rgb(${r2},${g2},${b2})`;
        ctx.fillText('El piso es lava', ANCHO_PANTALLA / 2, ALTO_PANTALLA / 2 + 20);
        await sleep(10);
    }
}