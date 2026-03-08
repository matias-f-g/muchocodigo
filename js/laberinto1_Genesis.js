/**
 * LABERINTO1_GENESIS.JS
 * Traducción de laberinto1_Genesis.py a JavaScript.
 *
 * Muestra de forma animada cómo se generan los cinco tipos de laberintos,
 * pasando por tres etapas visibles: esbozo → detección de sectores → unión de sectores.
 *
 * Uso desde el HTML:
 *   import { iniciarAnimacion,} from './laberinto1_Genesis.js';
 *
 *   const canvas = document.getElementById('miCanvas');
 *   iniciarAnimacion(canvas);   // arranca la secuencia completa
 */

import {
    Config,
    compartirGlobales,
    activarAnimacion,
    desactivarAnimacion,
    generarLaberinto,
    dibujarLaberinto,
    borrarLaberinto,
    sleep,
} from './laberinto0.js';


// ─────────────────────────────────────────────
// CONSTANTES (equivalentes a las del main() de Python)
// ─────────────────────────────────────────────

const BORDE        = 4;
const ANCHO_LIENZO = 1000;
const ALTO_LIENZO  = 500;

// Tamaño del lado de cada cubículo para cada opción (igual que TAM_LADOS en Python)
const TAM_LADOS = [100, 100, 50, 100, 50];

const COLOR_FONDO    = '#000000';
const COLOR_PARED    = '#32c832';   // (50, 200, 50) en Pygame
const COLOR_PRESENTA = '#32c832';   // el rectángulo verde de la presentación

const DESCRIPCIONES = [
    'Por filas',
    'Fila superior, fila inferior, columna izquierda, columna derecha',
    'Desde las columnas del medio hacia los costados (con tres filas intercaladas)',
    'Se completan todos los cubículos y luego se aplica el algoritmo para unir sectores',
    'En espiral desde el centro, y después se rellena el perímetro',
];


// ─────────────────────────────────────────────
// API PÚBLICA
// ─────────────────────────────────────────────

/**
 * Inicia la secuencia completa de animación para las 5 opciones.
 * @param {HTMLCanvasElement} canvas
 */
export async function iniciarAnimacion(canvas) {

    // El canvas tiene el lienzo más el borde en cada lado
    canvas.width  = ANCHO_LIENZO + BORDE * 2;
    canvas.height = ALTO_LIENZO  + BORDE * 2;

    // Se pinta el fondo de negro
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    activarAnimacion();

    for (let opcion = 0; opcion < TAM_LADOS.length; opcion++) {

        // Configurar dimensiones para esta opción
        const lado      = TAM_LADOS[opcion];
        const nFilas    = Math.floor(ALTO_LIENZO / lado);
        const nColumnas = Math.floor(ANCHO_LIENZO / lado);
        compartirGlobales(canvas, nFilas, nColumnas, BORDE, lado, COLOR_FONDO, COLOR_PARED);

        await animacionPresentarOpcion(canvas, opcion);

        await generarOpcion(opcion);
    }

    desactivarAnimacion();
}

// ─────────────────────────────────────────────
// ANIMACIÓN DE PRESENTACIÓN DE CADA OPCIÓN
// Equivalente a animacionPresentarOpcion() de Python.
//
// En Python: un while loop que dibujaba frame a frame con FPSCLOCK.tick().
// En JS: usamos requestAnimationFrame para que el navegador maneje el timing,
// envuelto en una Promise para poder hacer await y mantener el flujo secuencial.
// ─────────────────────────────────────────────

async function animacionPresentarOpcion(canvas, opcion) {
    const ctx = canvas.getContext('2d');
    const W   = canvas.width;
    const H   = canvas.height;

    await sleep(500);

    // ── Animación del rectángulo verde que crece desde el centro ──
    // En Python crecía sumando una cantidad que aumentaba cada frame (dif += 2).
    // Reproducimos exactamente esa aceleración.
    await new Promise(resolve => {
        let altoRect = 0;
        let dif      = 1;
        const yRect  = H / 4;
        const maxAlto = H / 2 - 50;

        function frame() {
            if (altoRect >= maxAlto)       { resolve(); return; }

            altoRect += dif;
            dif      += 2;
            altoRect  = Math.min(altoRect, maxAlto);

            ctx.fillStyle = COLOR_PRESENTA;
            ctx.fillRect(0, yRect, W, altoRect);

            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    });

    await sleep(500);

    // ── Texto con el número y descripción de la opción ──
    ctx.fillStyle    = '#000000';
    ctx.font         = 'bold 26px monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Opción ${opcion}`, W / 2, H / 2 - 50);

    ctx.font = '20px monospace';
    // La descripción puede ser larga: la partimos si supera el ancho del canvas
    dibujarTextoMultilinea(ctx, DESCRIPCIONES[opcion], W / 2, H / 2 + 10, W - 40, 28);

    await sleep(5000);   // 5 segundos, igual que el "for _ in range(5): wait(1000)" de Python

    // Borrar pantalla antes de empezar la generación
    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, W, H);
}


// ─────────────────────────────────────────────
// GENERACIÓN ANIMADA DE UNA OPCIÓN
// Equivalente a generarOpcion() de Python.
// ─────────────────────────────────────────────

async function generarOpcion(opcion) {

    // generarLaberinto() ya incluye esbozo + detectarSectores + unirSectores,
    // y como CON_ANIMACION está activado, va dibujando paso a paso.
    const lab = await generarLaberinto(opcion);

    // Pausa para contemplar el resultado con los sectores visibles (4 segundos)
    await sleep(4000);

    // Redibujar sin números de sector
    dibujarLaberinto(lab);

    // Pausa para contemplar el laberinto limpio (5 segundos)
    await sleep(5000);

    // Borrar el laberinto de a poco antes de pasar a la siguiente opción
    await borrarLaberinto(lab);
}


// ─────────────────────────────────────────────
// UTILIDAD DE TEXTO
// En Pygame el texto largo simplemente se cortaba; acá lo partimos en líneas
// para que quepa dentro del canvas.
// ─────────────────────────────────────────────

function dibujarTextoMultilinea(ctx, texto, x, y, anchoMax, lineaAlto) {
    const palabras = texto.split(' ');
    let linea = '';
    const lineas = [];

    for (const palabra of palabras) {
        const prueba = linea ? linea + ' ' + palabra : palabra;
        if (ctx.measureText(prueba).width > anchoMax && linea) {
            lineas.push(linea);
            linea = palabra;
        } else {
            linea = prueba;
        }
    }
    if (linea) lineas.push(linea);

    const offsetY = -((lineas.length - 1) * lineaAlto) / 2;
    lineas.forEach((l, i) => {
        ctx.fillText(l, x, y + offsetY + i * lineaAlto);
    });
}