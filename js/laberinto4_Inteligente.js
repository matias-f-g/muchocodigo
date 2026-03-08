/**
 * LABERINTO4_INTELIGENTE.JS
 * Traducción de laberinto4_Inteligente.py a JavaScript.
 * LOS LABERINTOS COMO PUERTA DE ENTRADA A LA INTELIGENCIA ARTIFICIAL
 *
 * Muestra de forma animada cómo funcionan DFS y BFS para resolver laberintos,
 * evidenciando las ventajas y desventajas de cada uno.
 *
 * Uso desde el HTML:
 *   import { iniciarAnimacion } from './laberinto4_Inteligente.js';
 *   await iniciarAnimacion(canvas);
 */

import {
    Config,
    compartirGlobales,
    activarMultisalida,
    desactivarAnimacion,
    generarLaberinto,
    dibujarLaberinto,
    borrarParedes,
    sleep,
    ARRIBA, ABAJO, IZQUIERDA, DERECHA,
} from './laberinto0.js';


// ─────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────

const FPS = 24;

const BORDE        = 4;
const DOBLEBORDE   = BORDE * 2;
const ANCHO_LIENZO = 1000;
const ALTO_LIENZO  = 600;
const ANCHO_PANTALLA = ANCHO_LIENZO + DOBLEBORDE;
const ALTO_PANTALLA  = ALTO_LIENZO  + DOBLEBORDE;

const TAM_LADOS    = [100, 100, 50, 50, 50];
const CANT_NIVELES = TAM_LADOS.length;

const COLOR_FONDO    = '#141414';       // (20, 20, 20)
const COLOR_PARED    = '#32c832';       // (50, 200, 50)
const COLOR_JUGADOR  = '#f0c864';       // (240, 200, 100)
const COLOR_LLEGADA  = '#fafafa';       // (250, 250, 250)
const COLOR_SOLUCION = '#faa01e';       // (250, 160, 30)
const ALPHA_FONDO    = 'rgba(20,20,20,0.47)';  // equivalente a (20,20,20,120) sobre 255


// ─────────────────────────────────────────────
// ESTADO INTERNO
// ─────────────────────────────────────────────

let LADO, N_FILAS, N_COLUMNAS, JUGADOR_RADIO, JUGADOR_DIAMETRO;


// ─────────────────────────────────────────────
// API PÚBLICA
// ─────────────────────────────────────────────

export async function iniciarAnimacion(canvas) {

    canvas.width  = ANCHO_PANTALLA;
    canvas.height = ALTO_PANTALLA;
    desactivarAnimacion();
    activarMultisalida();

    for (let nivel = 0; nivel < CANT_NIVELES; nivel++) {

        // Configurar dimensiones para este nivel
        LADO           = TAM_LADOS[nivel];
        N_FILAS        = Math.floor(ALTO_LIENZO / LADO);
        N_COLUMNAS     = Math.floor(ANCHO_LIENZO / LADO);
        JUGADOR_RADIO  = Math.floor(LADO / 4);
        JUGADOR_DIAMETRO = JUGADOR_RADIO * 2;

        compartirGlobales(canvas, N_FILAS, N_COLUMNAS, BORDE, LADO, COLOR_FONDO, COLOR_PARED);

        const lab = await generarLaberinto(nivel);

        // Punto final aleatorio (alejado del origen para que la búsqueda sea interesante)
        const finalFil = Math.floor(Math.random() * (N_FILAS - 3)) + 3;
        const finalCol = Math.floor(Math.random() * (N_COLUMNAS - 3)) + 3;

        let DFStotal = 0, DFSsolucion = 0, BFStotal = 0, BFSsolucion = 0;

        // Ejecutar DFS (tipo 0) y luego BFS (tipo 1)
        for (let tipoDeBusqueda = 0; tipoDeBusqueda < 2; tipoDeBusqueda++) {

            let { posX, posY, posFil, posCol, finalX, finalY, distancia, porAnalizar, yaConocido }
                = await armarEscenario(canvas, lab, finalFil, finalCol);

            // Búsqueda principal
            while (!(posFil === finalFil && posCol === finalCol)) {

                porAnalizar.delete(`${posFil},${posCol}`);
                yaConocido.set(`${posFil},${posCol}`, distancia);

                if (posFil > 0 &&
                    !lab[posFil][posCol].paredes.includes(ARRIBA) &&
                    !lab[posFil-1][posCol].paredes.includes(ABAJO) &&
                    !yaConocido.has(`${posFil-1},${posCol}`))
                    porAnalizar.set(`${posFil-1},${posCol}`, distancia + 1);

                if (posFil < N_FILAS - 1 &&
                    !lab[posFil][posCol].paredes.includes(ABAJO) &&
                    !lab[posFil+1][posCol].paredes.includes(ARRIBA) &&
                    !yaConocido.has(`${posFil+1},${posCol}`))
                    porAnalizar.set(`${posFil+1},${posCol}`, distancia + 1);

                if (posCol > 0 &&
                    !lab[posFil][posCol].paredes.includes(IZQUIERDA) &&
                    !lab[posFil][posCol-1].paredes.includes(DERECHA) &&
                    !yaConocido.has(`${posFil},${posCol-1}`))
                    porAnalizar.set(`${posFil},${posCol-1}`, distancia + 1);

                if (posCol < N_COLUMNAS - 1 &&
                    !lab[posFil][posCol].paredes.includes(DERECHA) &&
                    !lab[posFil][posCol+1].paredes.includes(IZQUIERDA) &&
                    !yaConocido.has(`${posFil},${posCol+1}`))
                    porAnalizar.set(`${posFil},${posCol+1}`, distancia + 1);

                // DFS: toma el último agregado (stack)
                // BFS: toma el primero (queue)
                // Map preserva el orden de inserción, igual que dict en Python 3.7+
                let proximo;
                if (tipoDeBusqueda === 0) {
                    const entries = [...porAnalizar.entries()];
                    proximo = entries[entries.length - 1];  // último → DFS
                } else {
                    proximo = porAnalizar.entries().next().value;  // primero → BFS
                }

                const [clave, dist] = proximo;
                const [nFil, nCol] = clave.split(',').map(Number);
                distancia = dist;
                posFil = nFil;
                posCol = nCol;

                ({ posX, posY } = await moverBuscador(canvas, posX, posY, posFil, posCol, COLOR_JUGADOR));
            }


            yaConocido.set(`${posFil},${posCol}`, distancia);
            const total = yaConocido.size - 1;
            const camino = procesarRecorrido(yaConocido, lab);
            await caminarSolucion(canvas, camino);

            if (tipoDeBusqueda === 0) {
                DFStotal    = total;
                DFSsolucion = camino.length;
            } else {
                BFStotal    = total;
                BFSsolucion = camino.length;
            }
        }

        await presentarResultados(canvas, lab, DFStotal, DFSsolucion, BFStotal, BFSsolucion);
    }

}


// ─────────────────────────────────────────────
// ARMAR ESCENARIO
// Equivalente a armarEscenario() de Python.
// ─────────────────────────────────────────────

async function armarEscenario(canvas, lab, finalFil, finalCol) {
    const ctx = canvas.getContext('2d');

    dibujarLaberinto(lab);
    await sleep(1000);

    const posX   = BORDE + LADO / 2 + 1;
    const posY   = BORDE + LADO / 2 + 1;
    const posFil = 0;
    const posCol = 0;

    ctx.beginPath();
    ctx.arc(posX, posY, JUGADOR_RADIO, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_JUGADOR;
    ctx.fill();

    const finalX = finalCol * LADO + JUGADOR_RADIO + BORDE + 1;
    const finalY = finalFil * LADO + JUGADOR_RADIO + BORDE + 1;
    ctx.fillStyle = COLOR_LLEGADA;
    ctx.fillRect(finalX, finalY, JUGADOR_DIAMETRO, JUGADOR_DIAMETRO);

    await sleep(1000);

    const distancia   = 0;
    const porAnalizar = new Map();
    porAnalizar.set(`${posFil},${posCol}`, distancia);
    const yaConocido = new Map();

    return { posX, posY, posFil, posCol, finalX, finalY, distancia, porAnalizar, yaConocido };
}


// ─────────────────────────────────────────────
// MOVER BUSCADOR
// Equivalente a mover() de Python.
// Tiene dos modos: exploración (COLOR_JUGADOR) y solución (COLOR_SOLUCION).
// ─────────────────────────────────────────────

async function moverBuscador(canvas, posX, posY, posFil, posCol, color) {
    const ctx  = canvas.getContext('2d');
    const antX = posX;
    const antY = posY;

    if (color === COLOR_JUGADOR) {
        // Efecto de huella semitransparente sobre el paso anterior
        // Equivalente al flashSurf con ALPHA_FONDO de Python
        ctx.fillStyle = ALPHA_FONDO;
        ctx.fillRect(posX - JUGADOR_RADIO, posY - JUGADOR_RADIO, JUGADOR_DIAMETRO, JUGADOR_DIAMETRO);
    }

    const nX = posCol * LADO + LADO / 2 + BORDE + 1;
    const nY = posFil * LADO + LADO / 2 + BORDE + 1;

    ctx.beginPath();
    ctx.arc(nX, nY, JUGADOR_RADIO, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    if (color !== COLOR_JUGADOR) {
        // Línea conectora entre pasos de la solución
        ctx.strokeStyle = color;
        ctx.lineWidth   = DOBLEBORDE;
        ctx.lineCap     = 'round';
        ctx.beginPath();
        ctx.moveTo(antX, antY);
        ctx.lineTo(nX, nY);
        ctx.stroke();
    }

    await sleep(300);
    return { posX: nX, posY: nY };
}


// ─────────────────────────────────────────────
// PROCESAR RECORRIDO
// Equivalente a procesarRecorrido() de Python.
// Reconstruye el camino óptimo desde el Map yaConocido.
// En Python usaba popitem() que saca el último elemento del dict.
// En JS con Map hacemos lo mismo: sacamos la última entrada.
// ─────────────────────────────────────────────

function procesarRecorrido(yaConocido, lab) {
    // Sacar el último elemento (equivalente a popitem() de Python)
    const keys     = [...yaConocido.keys()];
    const lastKey  = keys[keys.length - 1];
    const distancia = yaConocido.get(lastKey);
    yaConocido.delete(lastKey);

    const [iFin, jFin] = lastKey.split(',').map(Number);
    const camino = [[iFin, jFin]];
    let nPasos   = 0;

    while (camino.length < distancia) {
        const entries = [...yaConocido.entries()];
        const lastEntry = entries[entries.length - 1];
        const [clave, _] = lastEntry;
        yaConocido.delete(clave);

        const [iInst, jInst] = clave.split(',').map(Number);
        const [iActual, jActual] = camino[nPasos];

        if (sonVecinos(iActual, jActual, iInst, jInst, lab)) {
            camino.push([iInst, jInst]);
            nPasos++;
            // Eliminar todos los items con la misma distancia
            const distInst = yaConocido.get(clave) ?? _;
            for (const [k, v] of [...yaConocido.entries()]) {
                if (v === distInst) yaConocido.delete(k);
            }
        }
    }

    camino.reverse();
    return camino;
}


// ─────────────────────────────────────────────
// SON VECINOS
// Equivalente a sonVecinos() de Python.
// ─────────────────────────────────────────────

function sonVecinos(fil1, col1, fil2, col2, lab) {
    if (fil1 - fil2 === 1 && col1 - col2 === 0) {
        if (!lab[fil1][col1].paredes.includes(ARRIBA) && !lab[fil2][col2].paredes.includes(ABAJO))
            return true;
    } else if (fil1 - fil2 === -1 && col1 - col2 === 0) {
        if (!lab[fil1][col1].paredes.includes(ABAJO) && !lab[fil2][col2].paredes.includes(ARRIBA))
            return true;
    } else if (fil1 - fil2 === 0 && col1 - col2 === 1) {
        if (!lab[fil1][col1].paredes.includes(IZQUIERDA) && !lab[fil2][col2].paredes.includes(DERECHA))
            return true;
    } else if (fil1 - fil2 === 0 && col1 - col2 === -1) {
        if (!lab[fil1][col1].paredes.includes(DERECHA) && !lab[fil2][col2].paredes.includes(IZQUIERDA))
            return true;
    }
    return false;
}


// ─────────────────────────────────────────────
// CAMINAR SOLUCIÓN
// Equivalente a caminarSolucion() de Python.
// ─────────────────────────────────────────────

async function caminarSolucion(canvas, camino) {
    const ctx  = canvas.getContext('2d');
    let posX = BORDE + LADO / 2 + 1;
    let posY = BORDE + LADO / 2 + 1;

    ctx.beginPath();
    ctx.arc(posX, posY, JUGADOR_RADIO, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_SOLUCION;
    ctx.fill();

    for (const [fil, col] of camino) {
        ({ posX, posY } = await moverBuscador(canvas, posX, posY, fil, col, COLOR_SOLUCION));
    }

    await sleep(5000);
}


// ─────────────────────────────────────────────
// PRESENTAR RESULTADOS
// Equivalente a presentarResultados() de Python.
// Muestra una línea divisoria y las estadísticas de DFS vs BFS.
// ─────────────────────────────────────────────

async function presentarResultados(canvas, lab, DFStotal, DFSsolucion, BFStotal, BFSsolucion) {
    const ctx = canvas.getContext('2d');
    const msFrame = Math.floor(1000 / FPS);

    await sleep(1000);

    // Borrar paredes de a una (equivalente al loop borrarParedes de Python)
    for (let i = 0; i < N_FILAS; i++)
        for (let j = 0; j < N_COLUMNAS; j++)
            borrarParedes(i, j);

    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, ANCHO_PANTALLA, ALTO_PANTALLA);

    // Línea divisoria que crece desde arriba (igual que en Python)
    await new Promise(resolve => {
        let altoRect = 0;
        let dif = 1;

        function frame() {
            if (altoRect >= ALTO_PANTALLA) { resolve(); return; }

            altoRect += dif;
            dif += 2;
            altoRect = Math.min(altoRect, ALTO_PANTALLA);

            ctx.fillStyle = COLOR_PARED;
            ctx.fillRect(ANCHO_PANTALLA / 2, 0, BORDE, altoRect);

            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    });

    await sleep(500);

    // Textos DFS (lado izquierdo)
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    ctx.font      = 'bold 32px monospace';
    ctx.fillStyle = COLOR_LLEGADA;
    ctx.fillText('DFS', ANCHO_PANTALLA / 4, ALTO_PANTALLA / 4);

    ctx.font = '24px monospace';
    ctx.fillText(`Pasos totales: ${DFStotal}`,              ANCHO_PANTALLA / 4, ALTO_PANTALLA / 2 - 30);
    ctx.fillText(`Pasos para llegar a destino: ${DFSsolucion}`, ANCHO_PANTALLA / 4, ALTO_PANTALLA / 2 + 40);

    // Textos BFS (lado derecho)
    ctx.font = 'bold 32px monospace';
    ctx.fillText('BFS', (ANCHO_PANTALLA / 4) * 3, ALTO_PANTALLA / 4);

    ctx.font = '24px monospace';
    ctx.fillText(`Pasos totales: ${BFStotal}`,              (ANCHO_PANTALLA / 4) * 3, ALTO_PANTALLA / 2 - 30);
    ctx.fillText(`Pasos para llegar a destino: ${BFSsolucion}`, (ANCHO_PANTALLA / 4) * 3, ALTO_PANTALLA / 2 + 40);

    await sleep(8000);
}