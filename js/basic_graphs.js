/**
 * basic_graphs.js — Interactive directed/unweighted graph builder & analyzer
 * Translated from basic_graphs.py.
 * Matches the original Python/pygame version visually and behaviorally.
 *
 * Difference from the original: screenshots are no longer saved with a
 * sequential index inside a local folder (a browser can't do that). Instead,
 * each screenshot triggers a normal browser download named
 * "graph_<datetime>.png" straight to the user's downloads folder, so names
 * never collide and you can tell when each one was taken.
 */

// ── Constants ────────────────────────────────────────────────────────────────

const SCREEN_WIDTH  = 1200;
const SCREEN_HEIGHT = 680;
const HALF_WIDTH    = SCREEN_WIDTH  / 2;
const HALF_HEIGHT   = SCREEN_HEIGHT / 2;

// Back to initial screen
const START_SCREEN = 'q';
// To change the mode
const CHANGE = 'r';
// Creative mode
const ADD         = 'a';
const CONNECT     = 's';
const REMOVE      = 'd';
const DISCONNECT  = 'f';
const SCREENSHOT  = 'p';
// Analytical mode
const SELECT_INITIAL_NODE = 'z';
const APPLY_DFS = 'x';
const APPLY_BFS = 'c';

const CREATIVE_MODE   = 'Creative mode';
const ANALYTICAL_MODE = 'Analytical mode';

const VALID_CREATIVE_KEYS   = [START_SCREEN, CHANGE, ADD, CONNECT, REMOVE, DISCONNECT, SCREENSHOT];
const VALID_ANALYTICAL_KEYS = [CHANGE, SELECT_INITIAL_NODE, APPLY_DFS, APPLY_BFS];

const WHITE       = '#ffffff';
const GREY        = '#787878';
const BLACK       = '#000000';
const LIGHT_GREEN = '#00c800';
const GREEN       = '#00aa00';
const DARK_GREEN  = '#003c00';
const LIGHT_BLUE  = '#00aae4';
const LIGHT_BLUE2 = '#51d1f6';
const ORANGE      = '#ffa500';
const RED         = '#ff0000';

const BACKGROUND_COLOR = BLACK;
const NODE_INT_COLOR   = DARK_GREEN;
const NODE_EXT_COLOR   = GREEN;
const NODE_INT_COLOR_H = LIGHT_GREEN;
const NODE_EXT_COLOR_H = GREEN;
const EDGE_COLOR       = GREEN;

const NODE_RADIUS   = 16;
const NODE_DIAMETER = NODE_RADIUS * 2;
const NODE_STROKE   = 2;
const EDGE_STROKE   = NODE_STROKE;

const DATA_FONT_SIZE = NODE_RADIUS;

// Adjust this path if arrowR.png lives somewhere else relative to this file.
const ARROW_IMG_PATH = '../../img/arrowR.png';
const ARROW_SCALE = 0.6;

// Holds the preloaded arrow image once iniciarAnimacion() has set it up.
let ARROW_IMG = null;

// ── Utility ───────────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms));

function loadArrowImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload  = () => resolve(img);
        img.onerror = () => reject(new Error(`Could not load arrow image at "${src}"`));
        img.src = src;
    });
}

/** Turns a Date into a filesystem-safe "YYYYMMDD_HHMMSS" string. */
function datetimeForFilename(date = new Date()) {
    const pad = n => String(n).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
           `_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

// ── GraphNode ─────────────────────────────────────────────────────────────────

class GraphNode {
    constructor(data, edges = [], posX = 100, posY = 100) {
        this.data  = data;
        this.coords = [posX, posY];
        this.edges = edges;
    }
}

// ------------------------------------------- BASIC AND GENERAL STUFF

function printHeader(ctx, theHeader) {
    ctx.fillStyle    = GREY;
    ctx.font         = "bold 20px 'FreeSans', Arial, sans-serif";
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(theHeader, HALF_WIDTH, 50);
}

function printIndications(ctx, currentMode, initialNode = null) {
    // Header
    printHeader(ctx, currentMode);

    // Subtle indications
    const subTexts = {
        [CREATIVE_MODE]:   "'r' → switch mode, 'a' → add node, 's' → add edge, 'd' → remove node, 'f' → remove edge, 'q' → restart program, 'p' → screenshot",
        [ANALYTICAL_MODE]: "'r' → switch mode, 'z' → select initial node, 'x' → apply dfs, 'c' → apply bfs"
    };
    ctx.fillStyle    = GREY;
    ctx.font         = "bold 18px 'FreeSans', Arial, sans-serif";
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(subTexts[currentMode], HALF_WIDTH, SCREEN_HEIGHT - 60);

    // One more subtle indication
    if (currentMode === CREATIVE_MODE) {
        ctx.font = "bold 14px 'FreeSans', Arial, sans-serif";
        ctx.fillText('BTW, you can move the nodes using the mouse!', HALF_WIDTH, SCREEN_HEIGHT - 28);
    } else if (initialNode !== null) {
        ctx.font = "bold 14px 'FreeSans', Arial, sans-serif";
        ctx.fillText(`The initial node is ${initialNode}`, HALF_WIDTH, SCREEN_HEIGHT - 28);
    }
}

/**
 * Full-screen message; resolves when the user presses any key.
 * Equivalent to print_sign().
 */
function printSign(ctx, theText) {
    return new Promise(resolve => {
        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        ctx.fillStyle    = WHITE;
        ctx.font         = "bold 42px 'FreeSans', Arial, sans-serif";
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(theText, HALF_WIDTH, HALF_HEIGHT);

        ctx.fillStyle = GREY;
        ctx.font      = "bold 20px 'FreeSans', Arial, sans-serif";
        ctx.fillText('Press any key to continue', HALF_WIDTH, HALF_HEIGHT + 100);

        function handler(e) {
            e.preventDefault();
            document.removeEventListener('keydown', handler);
            resolve();
        }
        document.addEventListener('keydown', handler);
    });
}

// ---------------------------------- GRAPHICS AND CREATIVE MODE STUFF

function getNodeAtPixel(mousex, mousey, graph) {
    for (let index = 0; index < graph.length; index++) {
        const [posX, posY] = graph[index].coords;
        if (
            mousex >= posX - NODE_RADIUS && mousex < posX - NODE_RADIUS + NODE_DIAMETER &&
            mousey >= posY - NODE_RADIUS && mousey < posY - NODE_RADIUS + NODE_DIAMETER
        ) {
            return index;
        }
    }
    return null;
}

/** Converts a mouse event's page coords into canvas-space coords. */
function toCanvasCoords(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    return [
        (e.clientX - rect.left) * (canvas.width  / rect.width),
        (e.clientY - rect.top)  * (canvas.height / rect.height)
    ];
}

/**
 * Drag a selected node with the mouse. Resolves on mouseup.
 * Equivalent to move_node().
 */
function moveNode(canvas, ctx, indexNode, graph) {
    return new Promise(resolve => {
        function moveHandler(e) {
            graph[indexNode].coords = toCanvasCoords(canvas, e);
            redrawGraph(ctx, graph);
        }
        function upHandler() {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
            resolve();
        }
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    });
}

function redrawGraph(ctx, graph) {
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    for (const node of graph) drawNode(ctx, node);
    for (const node of graph) drawEdges(ctx, node);
}

function drawNode(ctx, node, colorInt = NODE_INT_COLOR, colorExt = NODE_EXT_COLOR) {
    const [x, y] = node.coords;

    ctx.beginPath();
    ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = colorInt;
    ctx.fill();
    ctx.strokeStyle = colorExt;
    ctx.lineWidth   = NODE_STROKE;
    ctx.stroke();

    ctx.fillStyle    = WHITE;
    ctx.font         = `bold ${DATA_FONT_SIZE}px 'FreeSans', Arial, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(node.data), x, y);
}

/**
 * Highlights a node and waits 700ms. Equivalent to highlith_node().
 */
async function highlightNode(ctx, node) {
    drawNode(ctx, node, NODE_INT_COLOR_H, NODE_EXT_COLOR_H);
    await sleep(700);
}

function drawEdges(ctx, node) {
    for (const edge of node.edges) {
        drawArrow(ctx, node.coords, edge.coords);
        drawNode(ctx, edge);
    }
    drawNode(ctx, node);
}

/**
 * Draws the connecting line plus an arrowhead rotated to match the edge's
 * direction, centered on the destination node.
 */
function drawArrow(ctx, origin, destiny) {
    const [x1, y1] = origin;
    const [x2, y2] = destiny;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = EDGE_COLOR;
    ctx.lineWidth   = EDGE_STROKE;
    ctx.stroke();

    if (!ARROW_IMG) return;

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const w = ARROW_IMG.width  * ARROW_SCALE;
    const h = ARROW_IMG.height * ARROW_SCALE;

    ctx.save();
    ctx.translate(x2, y2);
    ctx.rotate(angle);
    ctx.drawImage(ARROW_IMG, -w / 2, -h / 2, w, h);
    ctx.restore();
}

/**
 * Text input box on the canvas. Resolves with the trimmed string typed
 * when the user presses Enter. Equivalent to gimmie_input().
 */
function gimmieInput(canvas, ctx, somePlaceholder = null) {
    return new Promise(resolve => {
        let inputStr = '';
        const PLACE_TEXTS = {
            [ADD]:                 'Add a node',
            [CONNECT]:             'Add an edge',
            [REMOVE]:              'Remove a node',
            [DISCONNECT]:          'Remove an edge',
            [SELECT_INITIAL_NODE]: 'Select the initial node'
        };
        const BOX = { x: 100, y: SCREEN_HEIGHT - 110, w: SCREEN_WIDTH - 200, h: 60 };
        const CX  = BOX.x + BOX.w / 2;
        const CY  = BOX.y + BOX.h / 2;

        function renderBox() {
            ctx.fillStyle = WHITE;
            ctx.fillRect(BOX.x, BOX.y, BOX.w, BOX.h);

            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';

            if (inputStr.length > 0) {
                ctx.fillStyle = BLACK;
                ctx.font      = "bold 36px 'FreeSans', Arial, sans-serif";
                ctx.fillText(inputStr, CX, CY);
            } else if (somePlaceholder !== null) {
                ctx.fillStyle = GREY;
                ctx.font      = "bold 20px 'FreeSans', Arial, sans-serif";
                ctx.fillText(PLACE_TEXTS[somePlaceholder] ?? '', CX, CY);
            }
        }

        renderBox();

        function handler(e) {
            // isalnum() equivalent: any letter or digit, in any language
            if (/^[\p{L}\p{N}]$/u.test(e.key) || e.key === ' ') {
                e.preventDefault();
                inputStr += e.key;
                renderBox();
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                inputStr = inputStr.slice(0, -1);
                renderBox();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                document.removeEventListener('keydown', handler);
                resolve(inputStr.trim());
            }
        }
        document.addEventListener('keydown', handler);
    });
}

function getNode(graph, data) {
    for (const node of graph) {
        if (node.data === data) return node;
    }
    return null;
}

function stringCompare(a, b) {
    return a < b ? -1 : (a > b ? 1 : 0);
}

async function addNode(canvas, ctx, graph) {
    const newData = await gimmieInput(canvas, ctx, ADD);

    if (newData.trim() === '') {
        await printSign(ctx, 'You cannot add an empty node');
    } else if (getNode(graph, newData) === null) {
        const newNode = new GraphNode(newData, [], HALF_WIDTH, HALF_HEIGHT);
        graph.push(newNode);
        graph.sort((a, b) => stringCompare(a.data, b.data));
    } else {
        await printSign(ctx, 'That node is already there my friend');
    }

    return graph;
}

async function addEdge(canvas, ctx, graph) {
    redrawGraph(ctx, graph);
    printHeader(ctx, 'Indicate the origin of the edge');
    const nodeA = await gimmieInput(canvas, ctx, CONNECT);

    redrawGraph(ctx, graph);
    printHeader(ctx, 'Indicate the destination of the edge');
    const nodeB = await gimmieInput(canvas, ctx, CONNECT);

    const nodeOrigin = getNode(graph, nodeA);
    const nodeDestin = getNode(graph, nodeB);

    // Check that both nodes exist and that the EDGE ITSELF does not exist yet
    if (nodeOrigin === null || nodeDestin === null || nodeOrigin.edges.includes(nodeDestin)) {
        await printSign(ctx, 'Something went wrong :(');
    } else {
        nodeOrigin.edges.push(nodeDestin);
        nodeOrigin.edges.sort((a, b) => stringCompare(a.data, b.data));
    }

    return graph;
}

async function removeNode(canvas, ctx, graph) {
    const selectedNode = await gimmieInput(canvas, ctx, REMOVE);
    const theNode = getNode(graph, selectedNode);

    // Check that the node exists
    if (theNode === null) {
        await printSign(ctx, 'You cannot eliminate what does not exist');
    } else {
        graph.splice(graph.indexOf(theNode), 1);
        for (const node of graph) {
            const idx = node.edges.indexOf(theNode);
            if (idx !== -1) node.edges.splice(idx, 1);
        }
    }

    return graph;
}

async function removeEdge(canvas, ctx, graph) {
    redrawGraph(ctx, graph);
    printHeader(ctx, 'Indicate the origin of the edge');
    const nodeA = await gimmieInput(canvas, ctx, DISCONNECT);

    redrawGraph(ctx, graph);
    printHeader(ctx, 'Indicate the destination of the edge');
    const nodeB = await gimmieInput(canvas, ctx, DISCONNECT);

    const nodeOrigin = getNode(graph, nodeA);
    const nodeDestin = getNode(graph, nodeB);

    // Check that both nodes exist and that the EDGE ITSELF exists
    if (nodeOrigin === null || nodeDestin === null || !nodeOrigin.edges.includes(nodeDestin)) {
        await printSign(ctx, 'Something went wrong :(');
    } else {
        nodeOrigin.edges.splice(nodeOrigin.edges.indexOf(nodeDestin), 1);
    }

    return graph;
}

// ---------------------------------------------- GENESIS OF THE GRAPH

/**
 * Welcome screen: collect nodes (and their edges) until Enter is pressed
 * alone, then build and return the graph. Equivalent to create_graph().
 */
async function createGraph(canvas, ctx) {
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = WHITE;
    ctx.font      = "bold 36px 'FreeSans', Arial, sans-serif";
    ctx.fillText('Type numbers (or letters) to build your graph, node by node', HALF_WIDTH, HALF_HEIGHT - 140);

    ctx.font = "bold 24px 'FreeSans', Arial, sans-serif";
    ctx.fillText('To add a node, the first element is the data of the node, the rest are the edges', HALF_WIDTH, HALF_HEIGHT - 60);

    ctx.font = "bold 22px 'FreeSans', Arial, sans-serif";
    ctx.fillText('For example: to add a node 1 connected with 2 and 3, enter 1 2 3 and then press Enter', HALF_WIDTH, HALF_HEIGHT);

    ctx.fillStyle = GREEN;
    ctx.font      = "bold 20px 'FreeSans', Arial, sans-serif";
    ctx.fillText("Press Enter alone when you're done", HALF_WIDTH, HALF_HEIGHT + 60);

    const nodesData = [];
    while (true) {
        const oneNodeStr = await gimmieInput(canvas, ctx);
        if (oneNodeStr === '') break;

        const oneNode = oneNodeStr.split(/\s+/).filter(Boolean);
        nodesData.push(oneNode);

        // Give feedback: show how many nodes are queued
        const feedbackY = HALF_HEIGHT + 130;
        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.fillRect(HALF_WIDTH - 500, feedbackY - 25, 1000, 50); // clear old text
        ctx.fillStyle    = LIGHT_BLUE;
        ctx.font         = "bold 20px 'FreeSans', Arial, sans-serif";
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        const preview = nodesData.map(n => `[${n.join(', ')}]`).join(', ');
        ctx.fillText(`Future graph: [${preview}]`, HALF_WIDTH, feedbackY);
    }

    // Build and draw a sketch of the graph
    const graph = makeGraph(nodesData);
    redrawGraph(ctx, graph);

    return graph;
}

function allNumeric(nodesDataClean) {
    for (const k of nodesDataClean.keys()) {
        if (!/^\d+$/.test(k)) return false;
    }
    return true;
}

function makeGraph(nodesData) {
    const graph = [];

    if (nodesData.length === 0) return graph;

    // Clean the input a little bit (remove duplicates, add missing nodes, sort by value, etc.)
    const allTheNodes = new Set();
    for (const nodes of nodesData) {
        for (const n of nodes) allTheNodes.add(n);
    }

    const nodesDataClean = new Map();
    for (const node of allTheNodes) nodesDataClean.set(node, []);

    for (const [node, edges] of nodesDataClean) {
        for (const dirtyNode of nodesData) {
            if (node === dirtyNode[0]) {
                edges.push(...dirtyNode.slice(1));
            }
        }
    }

    // Remove duplicate edges (e.g. the user typed "1 2 2 3"). Written back
    // into the map with .set(), unlike a plain reassignment of the loop
    // variable, which wouldn't actually change anything stored in it.
    for (const [key, edges] of nodesDataClean) {
        nodesDataClean.set(key, [...new Set(edges)]);
    }

    let entries = [...nodesDataClean.entries()];
    if (allNumeric(nodesDataClean)) {
        entries.sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10));
    } else {
        entries.sort((a, b) => stringCompare(a[0], b[0]));
    }

    // Prepare the analytical geometry stuff
    const radius = 200;
    const h = HALF_WIDTH, k = HALF_HEIGHT;
    const angleOfSep = (2 * Math.PI) / entries.length;

    // Create and set the basic data for each node
    entries.forEach(([nData, nEdges], i) => {
        const thisAngle = i * angleOfSep + Math.PI;
        const posX = h + radius * Math.cos(thisAngle);
        const posY = k + radius * Math.sin(thisAngle);
        graph.push(new GraphNode(nData, nEdges, posX, posY));
    });

    // Update the edges with their actual values (they should be a pointer to another node)
    for (const node of graph) {
        const previousEdges = node.edges;
        const actualEdges = [];

        for (const pEdge of previousEdges) {
            const aEdge = getNode(graph, pEdge);
            if (aEdge !== null) actualEdges.push(aEdge);
        }

        node.edges = actualEdges;
    }

    return graph;
}

// --------------------------------------------- ANALYTICAL MODE STUFF

async function getInitialNode(canvas, ctx, graph) {
    let initialNode = await gimmieInput(canvas, ctx, SELECT_INITIAL_NODE);
    let theNode = getNode(graph, initialNode);

    while (theNode === null) {
        await printSign(ctx, 'You have to select a VALID initial node');
        redrawGraph(ctx, graph);
        initialNode = await gimmieInput(canvas, ctx, SELECT_INITIAL_NODE);
        theNode = getNode(graph, initialNode);
    }

    return initialNode;
}

async function dfs(ctx, graph, initialNode) {
    // For good measure, it's a good idea to always check that the initial node exists
    const firstNode = getNode(graph, initialNode);

    if (firstNode === null) {
        await printSign(ctx, 'You have to select an initial node');
    } else {
        const visited = [];
        await dfsHelper(ctx, visited, firstNode);
        await sleep(2000); // 4 waits of 500ms in the original
    }
}

async function dfsHelper(ctx, visited, nextNode) {
    await highlightNode(ctx, nextNode);
    visited.push(nextNode);

    for (const ed of nextNode.edges) {
        if (!visited.includes(ed)) {
            await dfsHelper(ctx, visited, ed);
        }
    }
}

async function bfs(ctx, graph, initialNode) {
    const firstNode = getNode(graph, initialNode);

    if (firstNode === null) {
        await printSign(ctx, 'You have to select an initial node');
    } else {
        // Mark a node as visited the moment it's enqueued (not when it's
        // dequeued) — otherwise two nodes pointing at the same node can
        // both enqueue it before either gets processed, and it ends up
        // in the queue (and highlighted) twice.
        const visited = [firstNode];
        const queue = [firstNode];

        while (queue.length > 0) {
            const currentNode = queue.shift();
            await highlightNode(ctx, currentNode);

            for (const ed of currentNode.edges) {
                if (!visited.includes(ed)) {
                    visited.push(ed);
                    queue.push(ed);
                }
            }
        }

        await sleep(2000); // 4 waits of 500ms in the original
    }
}

// -------------------------------------------------- SCREENSHOT STUFF

/**
 * Redraws the graph and downloads it as "graph_<datetime>.png" straight
 * to the browser's downloads folder. Equivalent to take_screenshot(), but
 * using a datetime-based name instead of a sequential index read from disk
 * (a browser has no access to the downloads folder's contents).
 */
function takeScreenshot(ctx, graph) {
    redrawGraph(ctx, graph);

    const filename = `graph_${datetimeForFilename()}.png`;
    const link = document.createElement('a');
    link.download = filename;
    link.href = ctx.canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ------------------------------------------------------- EVENT HELPERS

/**
 * Waits for either a keydown among validKeys, or a mousedown on the canvas.
 * Used by creative mode, which reacts to both.
 */
function waitForCreativeEvent(canvas, validKeys) {
    return new Promise(resolve => {
        function keyHandler(e) {
            if (validKeys.includes(e.key)) {
                e.preventDefault();
                cleanup();
                resolve({ type: 'key', key: e.key });
            }
        }
        function mouseHandler(e) {
            const [x, y] = toCanvasCoords(canvas, e);
            cleanup();
            resolve({ type: 'mousedown', x, y });
        }
        function cleanup() {
            document.removeEventListener('keydown', keyHandler);
            canvas.removeEventListener('mousedown', mouseHandler);
        }
        document.addEventListener('keydown', keyHandler);
        canvas.addEventListener('mousedown', mouseHandler);
    });
}

/** Blocks until one of the specified keys is pressed. */
function waitForKey(validKeys) {
    return new Promise(resolve => {
        function handler(e) {
            if (validKeys.includes(e.key)) {
                e.preventDefault();
                document.removeEventListener('keydown', handler);
                resolve(e.key);
            }
        }
        document.addEventListener('keydown', handler);
    });
}

// ------------------------------------------------------------ MODE LOOPS

/**
 * Creative mode loop. Resolves with { backToStart: true } if 'q' was
 * pressed, or { backToStart: false } if the mode was switched to analytical.
 */
async function creativeModeLoop(canvas, ctx, graph) {
    while (true) {
        const ev = await waitForCreativeEvent(canvas, VALID_CREATIVE_KEYS);

        if (ev.type === 'mousedown') {
            const indexNode = getNodeAtPixel(ev.x, ev.y, graph);
            if (indexNode !== null) {
                await moveNode(canvas, ctx, indexNode, graph);
                printIndications(ctx, CREATIVE_MODE);
            }
            continue;
        }

        const key = ev.key;
        if (key === START_SCREEN) {
            return { backToStart: true };
        }

        redrawGraph(ctx, graph);

        if (key === CHANGE) {
            if (graph.length > 0) {
                return { backToStart: false };
            } else {
                await printSign(ctx, 'To access analytical mode, there must be a graph!');
                redrawGraph(ctx, graph);
                printIndications(ctx, CREATIVE_MODE);
            }
        } else {
            if (key === ADD) await addNode(canvas, ctx, graph);
            else if (key === CONNECT) await addEdge(canvas, ctx, graph);
            else if (key === REMOVE) await removeNode(canvas, ctx, graph);
            else if (key === DISCONNECT) await removeEdge(canvas, ctx, graph);
            else if (key === SCREENSHOT) takeScreenshot(ctx, graph);

            redrawGraph(ctx, graph);
            printIndications(ctx, CREATIVE_MODE);
        }
    }
}

/**
 * Analytical mode loop. Resolves with the (possibly updated) initialNode
 * once the user switches back to creative mode.
 */
async function analyticalModeLoop(canvas, ctx, graph, initialNode) {
    while (true) {
        const key = await waitForKey(VALID_ANALYTICAL_KEYS);
        redrawGraph(ctx, graph);

        if (key === CHANGE) {
            return initialNode;
        } else {
            if (key === SELECT_INITIAL_NODE) {
                initialNode = await getInitialNode(canvas, ctx, graph);
            } else if (key === APPLY_DFS) {
                await dfs(ctx, graph, initialNode);
            } else if (key === APPLY_BFS) {
                await bfs(ctx, graph, initialNode);
            }
        }

        redrawGraph(ctx, graph);
        printIndications(ctx, ANALYTICAL_MODE, initialNode);
    }
}

// ── Entry point ───────────────────────────────────────────────────────────────

export async function iniciarAnimacion() {
    const canvas = document.getElementById('treeGraphCanvas');
    const ctx    = canvas.getContext('2d');

    // Make canvas focusable so keyboard events are natural for the user
    if (!canvas.hasAttribute('tabindex')) canvas.setAttribute('tabindex', '0');
    canvas.focus();

    try {
        ARROW_IMG = await loadArrowImage(ARROW_IMG_PATH);
    } catch (err) {
        console.error(err);
        // Arrows just won't be drawn if the image fails to load; edges (lines)
        // still work fine.
    }

    // Outer loop: start screen → creative/analytical modes → repeat on 'q'
    while (true) {
        const graph = await createGraph(canvas, ctx);
        printIndications(ctx, CREATIVE_MODE);

        let initialNode = null;
        let backToStart = false;

        while (!backToStart) {
            const creativeResult = await creativeModeLoop(canvas, ctx, graph);
            if (creativeResult.backToStart) {
                backToStart = true;
                break;
            }

            printIndications(ctx, ANALYTICAL_MODE, initialNode);
            initialNode = await analyticalModeLoop(canvas, ctx, graph, initialNode);
            printIndications(ctx, CREATIVE_MODE);
        }
    }
}
