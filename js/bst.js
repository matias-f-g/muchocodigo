/**
 * bst.js — Binary Search Tree interactive visualizer
 * Translated from binary_search_tree.py by Mark Allen Weiss (Ch. 4 reference).
 * Matches the original Python/pygame version visually and behaviorally.
 */

// ── Constants ────────────────────────────────────────────────────────────────

const SCREEN_WIDTH  = 1200;
const SCREEN_HEIGHT = 680;
const HALF_WIDTH    = SCREEN_WIDTH  / 2;
const HALF_HEIGHT   = SCREEN_HEIGHT / 2;

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

const NODE_RADIUS = 16;
const NODE_STROKE = 2;
const EDGE_X      = SCREEN_WIDTH / 4;   // 300
const EDGE_Y      = NODE_RADIUS * 5;    // 80
const ROOT_X      = SCREEN_WIDTH  / 2;  // 600
const ROOT_Y      = NODE_RADIUS   * 3;  // 48
const DATA_FONT_SIZE = NODE_RADIUS;     // 16

const VALID_KEYS = ['s', 'a', 'r', 'f', 'u', 'i', 'o'];

// ── Utility ───────────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── BinaryNode ────────────────────────────────────────────────────────────────

class BinaryNode {
    constructor(data, posX, posY, edgeX) {
        this.data   = data;
        this.coords = [posX, posY];
        this.edgeX  = edgeX;
        this.left   = null;
        this.right  = null;
    }
}

// ── Drawing primitives ────────────────────────────────────────────────────────

/**
 * Draws a node synchronously (no wait). Equivalent to draw_node(..., update_and_wait=False).
 */
function drawNodeSync(ctx, node, colorInt = NODE_INT_COLOR, colorExt = NODE_EXT_COLOR) {
    const [x, y] = node.coords;

    ctx.beginPath();
    ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = colorInt;
    ctx.fill();
    ctx.strokeStyle = colorExt;
    ctx.lineWidth = NODE_STROKE;
    ctx.stroke();

    ctx.fillStyle = WHITE;
    ctx.font = `bold ${DATA_FONT_SIZE}px 'FreeSans', Arial, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(node.data), x, y);
}

/**
 * Draws a node and waits 500ms. Equivalent to draw_node(..., update_and_wait=True).
 */
async function drawNodeAnim(ctx, node, colorInt = NODE_INT_COLOR, colorExt = NODE_EXT_COLOR) {
    drawNodeSync(ctx, node, colorInt, colorExt);
    await sleep(500);
}

/**
 * Draws a straight edge instantly. Redraws prevNode on top so the line doesn't overlap it.
 * Equivalent to draw_edge(..., update_and_wait=False).
 */
function drawEdgeSync(ctx, prevNode, node) {
    const [x1, y1] = prevNode.coords;
    const [x2, y2] = node.coords;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = EDGE_COLOR;
    ctx.lineWidth   = NODE_STROKE;
    ctx.stroke();
    // Keep the parent node circle clean on top of the line start
    drawNodeSync(ctx, prevNode);
}

/**
 * Animated edge: grows from prevNode toward node with acceleration.
 * Equivalent to draw_edge(..., update_and_wait=True).
 */
async function drawEdgeAnim(ctx, prevNode, node) {
    const DIV_ANIMATION = 32;
    let [px, py] = [...prevNode.coords];
    let dx = prevNode.edgeX / DIV_ANIMATION;
    let dy = EDGE_Y        / DIV_ANIMATION;
    if (node.data < prevNode.data) dx = -dx;

    let velocity     = 16;
    const ACCEL      = 8;

    for (let i = 0; i < DIV_ANIMATION; i++) {
        velocity += ACCEL;
        px += dx;
        py += dy;

        ctx.beginPath();
        ctx.moveTo(prevNode.coords[0], prevNode.coords[1]);
        ctx.lineTo(px, py);
        ctx.strokeStyle = EDGE_COLOR;
        ctx.lineWidth   = NODE_STROKE;
        ctx.stroke();

        // Keep prevNode drawn on top of the growing line
        drawNodeSync(ctx, prevNode);

        await sleep(Math.round(1000 / velocity));
    }
}

// ── BST operations ────────────────────────────────────────────────────────────

/**
 * Classic insert with animation. Equivalent to add_binary_element().
 */
async function addBinaryElement(
    ctx, t, data,
    prevNode = null,
    posX  = ROOT_X,
    posY  = ROOT_Y,
    edgeX = EDGE_X
) {
    if (t === null) {
        const newNode = new BinaryNode(data, posX, posY, edgeX);
        if (prevNode) await drawEdgeAnim(ctx, prevNode, newNode);
        await drawNodeAnim(ctx, newNode);
        return newNode;
    }

    if (data < t.data) {
        t.left  = await addBinaryElement(ctx, t.left,  data, t, posX - edgeX, posY + EDGE_Y, Math.floor(edgeX / 2));
    } else if (t.data < data) {
        t.right = await addBinaryElement(ctx, t.right, data, t, posX + edgeX, posY + EDGE_Y, Math.floor(edgeX / 2));
    }
    // duplicate → ignored

    return t;
}

function findMin(t) {
    if (!t) return null;
    while (t.left) t = t.left;
    return t;
}

/**
 * Animated search. Equivalent to contains_anim().
 */
async function containsAnim(ctx, tree, data) {
    await contains(ctx, tree, data);
    await sleep(2000);
    redrawTree(ctx, tree);
}

async function contains(ctx, t, data) {
    if (t === null) return false;

    if (data === t.data) {
        await drawNodeAnim(ctx, t, LIGHT_BLUE, LIGHT_BLUE2);
        return true;
    } else if (data < t.data) {
        await drawNodeAnim(ctx, t, NODE_INT_COLOR_H, NODE_EXT_COLOR_H);
        return await contains(ctx, t.left, data);
    } else {
        await drawNodeAnim(ctx, t, NODE_INT_COLOR_H, NODE_EXT_COLOR_H);
        return await contains(ctx, t.right, data);
    }
}

/**
 * Animated removal. Equivalent to remove_anim().
 */
async function removeAnim(ctx, tree, data) {
    if (tree === null) return null;
    tree = await remove(ctx, tree, data);
    await sleep(1000);
    return tree;
}

async function remove(ctx, t, data) {
    if (t === null) return null;

    if (data === t.data) {
        // Highlight in red, then wait before restructuring
        await drawNodeAnim(ctx, t, RED, WHITE);  // 500 ms inside
        await sleep(1000);                        // extra 1 000 ms

        if (!t.left || !t.right) {
            t = t.left ?? t.right;
        } else {
            // Two children: replace with in-order successor
            t.data  = findMin(t.right).data;
            t.right = await remove(ctx, t.right, t.data);
        }
    } else if (data < t.data) {
        await drawNodeAnim(ctx, t, ORANGE, NODE_EXT_COLOR_H);
        t.left  = await remove(ctx, t.left,  data);
    } else {
        await drawNodeAnim(ctx, t, ORANGE, NODE_EXT_COLOR_H);
        t.right = await remove(ctx, t.right, data);
    }

    return t;
}

// ── Traversals ────────────────────────────────────────────────────────────────

async function someTraversal(ctx, tree, key) {
    if      (key === 'u') await highlightPreorden(ctx, tree);
    else if (key === 'i') await highlightInorden(ctx, tree);
    else                  await highlightPostorden(ctx, tree);
    await sleep(2000);
}

async function highlightPreorden(ctx, t) {
    if (t) {
        await drawNodeAnim(ctx, t, NODE_INT_COLOR_H, NODE_EXT_COLOR_H);
        await highlightPreorden(ctx, t.left);
        await highlightPreorden(ctx, t.right);
    }
}

async function highlightInorden(ctx, t) {
    if (t) {
        await highlightInorden(ctx, t.left);
        await drawNodeAnim(ctx, t, NODE_INT_COLOR_H, NODE_EXT_COLOR_H);
        await highlightInorden(ctx, t.right);
    }
}

async function highlightPostorden(ctx, t) {
    if (t) {
        await highlightPostorden(ctx, t.left);
        await highlightPostorden(ctx, t.right);
        await drawNodeAnim(ctx, t, NODE_INT_COLOR_H, NODE_EXT_COLOR_H);
    }
}

// ── Full-tree redraw (no animation) ──────────────────────────────────────────

function redrawSubtree(ctx, prevNode, t, posX, posY, edgeX) {
    if (t) {
        t.coords = [posX, posY];
        t.edgeX  = edgeX;
        drawEdgeSync(ctx, prevNode, t);
        drawNodeSync(ctx, t);
        redrawSubtree(ctx, t, t.left,  posX - edgeX, posY + EDGE_Y, Math.floor(edgeX / 2));
        redrawSubtree(ctx, t, t.right, posX + edgeX, posY + EDGE_Y, Math.floor(edgeX / 2));
    }
}

function redrawTree(ctx, t) {
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    if (t) {
        t.coords = [ROOT_X, ROOT_Y];
        t.edgeX  = EDGE_X;
        drawNodeSync(ctx, t);
        redrawSubtree(ctx, t, t.left,  ROOT_X - EDGE_X, ROOT_Y + EDGE_Y, Math.floor(EDGE_X / 2));
        redrawSubtree(ctx, t, t.right, ROOT_X + EDGE_X, ROOT_Y + EDGE_Y, Math.floor(EDGE_X / 2));
    }
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function printIndications(ctx) {
    ctx.fillStyle    = GREY;
    ctx.font         = "bold 18px 'FreeSans', Arial, sans-serif";
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
        "'a' → add,  'r' → remove,  'f' → find,  'i' → in-order,  'u' → pre-order,  'o' → post-order,  's' → restart",
        HALF_WIDTH, SCREEN_HEIGHT - 72
    );
}

// ── Number input ──────────────────────────────────────────────────────────────

/**
 * Shows an input box on the canvas and returns a Promise<number|null>.
 * Resolves with an integer when the user presses Enter, or null on empty Enter.
 * Equivalent to gimmie_a_number().
 */
function gimmieANumber(ctx, placeholder = null) {
    return new Promise(resolve => {
        let inputStr = '';

        const PLACE_LABELS = { a: 'Add a node', r: 'Remove a node', f: 'Find a node' };
        const BOX = { x: 100, y: SCREEN_HEIGHT - 110, w: SCREEN_WIDTH - 200, h: 60 };
        const CX  = BOX.x + BOX.w / 2;
        const CY  = BOX.y + BOX.h / 2;

        function renderBox() {
            // White input rectangle
            ctx.fillStyle = WHITE;
            ctx.fillRect(BOX.x, BOX.y, BOX.w, BOX.h);

            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';

            if (inputStr.length > 0) {
                ctx.fillStyle = BLACK;
                ctx.font      = "bold 36px 'FreeSans', Arial, sans-serif";
                ctx.fillText(inputStr, CX, CY);
            } else if (placeholder !== null) {
                ctx.fillStyle = GREY;
                ctx.font      = "bold 20px 'FreeSans', Arial, sans-serif";
                ctx.fillText(PLACE_LABELS[placeholder] ?? '', CX, CY);
            }
        }

        renderBox();

        function handler(e) {
            e.preventDefault();

            if (/^\d$/.test(e.key) && inputStr.length < 2) {
                inputStr += e.key;
                renderBox();
            } else if (e.key === 'Backspace') {
                inputStr = inputStr.slice(0, -1);
                renderBox();
            } else if (e.key === 'Enter') {
                document.removeEventListener('keydown', handler);
                // Erase the input box before returning
                ctx.fillStyle = BLACK;
                ctx.fillRect(BOX.x - 4, BOX.y - 4, BOX.w + 8, BOX.h + 8);
                resolve(inputStr ? parseInt(inputStr, 10) : null);
            }
        }

        document.addEventListener('keydown', handler);
    });
}

// ── Start screen / tree builder ───────────────────────────────────────────────

/**
 * Welcome screen: collect numbers, build and return the initial tree.
 * Equivalent to create_tree().
 */
async function createTree(ctx) {
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = WHITE;
    ctx.font      = "bold 40px 'FreeSans', Arial, sans-serif";
    ctx.fillText('Type numbers to build your binary search tree', HALF_WIDTH, HALF_HEIGHT - 120);

    ctx.font = "bold 22px 'FreeSans', Arial, sans-serif";
    ctx.fillText("For example: press 2, then 7, then Enter, and you'll get 27", HALF_WIDTH, HALF_HEIGHT - 60);

    ctx.fillStyle = GREEN;
    ctx.font      = "bold 20px 'FreeSans', Arial, sans-serif";
    ctx.fillText("Press Enter alone when you're done", HALF_WIDTH, HALF_HEIGHT);

    const numbers = [];

    while (true) {
        const number = await gimmieANumber(ctx);
        if (number === null) break;
        numbers.push(number);

        // Feedback: show queued numbers
        const FEED_Y = HALF_HEIGHT + 60;
        ctx.fillStyle = BLACK;
        ctx.fillRect(HALF_WIDTH - 450, FEED_Y - 22, 900, 44);
        ctx.fillStyle    = LIGHT_BLUE;
        ctx.font         = "bold 20px 'FreeSans', Arial, sans-serif";
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Queued: [${numbers.join(', ')}]`, HALF_WIDTH, FEED_Y);
    }

    // Clear screen and animate tree construction
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    let tree = null;
    for (const num of numbers) {
        tree = await addBinaryElement(ctx, tree, num);
    }
    return tree;
}

// ── Key listener ──────────────────────────────────────────────────────────────

/**
 * Blocks until one of the specified keys is pressed.
 */
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

// ── Main loop ─────────────────────────────────────────────────────────────────

async function mainLoop(ctx, tree) {
    while (true) {
        const key = await waitForKey(VALID_KEYS);

        if (key === 's') return; // back to start screen

        if (['a', 'r', 'f'].includes(key)) {
            const number = await gimmieANumber(ctx, key);
            if (number !== null) {
                if      (key === 'a') tree = await addBinaryElement(ctx, tree, number);
                else if (key === 'r') tree = await removeAnim(ctx, tree, number);
                else                  await containsAnim(ctx, tree, number);
            }
        } else {
            // u / i / o
            await someTraversal(ctx, tree, key);
        }

        redrawTree(ctx, tree);
        printIndications(ctx);
    }
}

// ── Entry point ───────────────────────────────────────────────────────────────

export async function iniciarAnimacion() {
    const canvas = document.getElementById('treeGraphCanvas');
    const ctx    = canvas.getContext('2d');

    // Make canvas focusable so keyboard events are natural for the user
    if (!canvas.hasAttribute('tabindex')) canvas.setAttribute('tabindex', '0');
    canvas.focus();

    // Outer loop: start screen → main editing loop → repeat
    while (true) {
        const tree = await createTree(ctx);
        printIndications(ctx);
        await mainLoop(ctx, tree);
    }
}