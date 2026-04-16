/**
 * avl_tree.js — AVL Tree interactive visualizer
 * Translated from AVL_tree.py by Mark Allen Weiss (Ch. 4 reference).
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

const NODE_RADIUS    = 16;
const NODE_STROKE    = 2;
const HEIGHTS_RADIUS = Math.floor(NODE_RADIUS / 2);          // 8
const HEIGHTS_DIST   = Math.floor(NODE_RADIUS * 0.8);        // 12
const HEIGHTS_FONT_SIZE = HEIGHTS_RADIUS + 2;                // 10
const EDGE_X         = SCREEN_WIDTH / 4;                     // 300
const EDGE_Y         = NODE_RADIUS  * 5;                     // 80
const ROOT_X         = SCREEN_WIDTH  / 2;                    // 600
const ROOT_Y         = NODE_RADIUS   * 3;                    // 48
const DATA_FONT_SIZE = NODE_RADIUS;                          // 16

const ALLOWED_IMBALANCE = 1;

const VALID_KEYS = ['s', 'a', 'r', 'f', 'u', 'i', 'o'];

// ── Utility ───────────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── BinaryNode ────────────────────────────────────────────────────────────────

class BinaryNode {
    constructor(data, posX, posY, edgeX, height) {
        this.data    = data;
        this.coords  = [posX, posY];
        this.edgeX   = edgeX;
        this.height  = height;
        this.heightL = -1;
        this.heightR = -1;
        this.left    = null;
        this.right   = null;
    }
}

// ── Drawing primitives ────────────────────────────────────────────────────────

/**
 * Draws the two small height-indicator circles below a node (no wait).
 * Equivalent to draw_heights(..., update_and_wait=False).
 */
function drawHeightsSync(ctx, node, colorInt, colorExt) {
    const [x, y] = node.coords;

    const positions = [
        [x - HEIGHTS_DIST, y + HEIGHTS_DIST, node.heightL],
        [x + HEIGHTS_DIST, y + HEIGHTS_DIST, node.heightR],
    ];

    for (const [hx, hy, val] of positions) {
        ctx.beginPath();
        ctx.arc(hx, hy, HEIGHTS_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = colorInt;
        ctx.fill();
        ctx.strokeStyle = colorExt;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle    = WHITE;
        ctx.font         = `bold ${HEIGHTS_FONT_SIZE}px 'FreeSans', Arial, sans-serif`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(val), hx, hy);
    }
}

/**
 * Draws height circles and waits 800ms.
 * Equivalent to draw_heights(..., update_and_wait=True).
 */
async function drawHeightsAnim(ctx, node, colorInt, colorExt) {
    drawHeightsSync(ctx, node, colorInt, colorExt);
    await sleep(800);
}

/**
 * Draws node + height circles (no wait).
 * Equivalent to draw_node(..., update_and_wait=False).
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

    ctx.fillStyle    = WHITE;
    ctx.font         = `bold ${DATA_FONT_SIZE}px 'FreeSans', Arial, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(node.data), x, y);

    drawHeightsSync(ctx, node, colorInt, colorExt);
}

/**
 * Draws node + height circles, waits 800ms (via drawHeightsAnim).
 * Equivalent to draw_node(..., update_and_wait=True).
 */
async function drawNodeAnim(ctx, node, colorInt = NODE_INT_COLOR, colorExt = NODE_EXT_COLOR) {
    const [x, y] = node.coords;

    ctx.beginPath();
    ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = colorInt;
    ctx.fill();
    ctx.strokeStyle = colorExt;
    ctx.lineWidth = NODE_STROKE;
    ctx.stroke();

    ctx.fillStyle    = WHITE;
    ctx.font         = `bold ${DATA_FONT_SIZE}px 'FreeSans', Arial, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(node.data), x, y);

    await drawHeightsAnim(ctx, node, colorInt, colorExt); // 800ms
}

/**
 * Draws a straight edge instantly; redraws prevNode on top.
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
    drawNodeSync(ctx, prevNode);
}

/**
 * Animated edge that grows with acceleration.
 * Equivalent to draw_edge(..., update_and_wait=True).
 */
async function drawEdgeAnim(ctx, prevNode, node) {
    const DIV = 32;
    let [px, py] = [...prevNode.coords];
    let dx = prevNode.edgeX / DIV;
    let dy = EDGE_Y        / DIV;
    if (node.data < prevNode.data) dx = -dx;

    let velocity = 16;
    const ACCEL  = 8;

    for (let i = 0; i < DIV; i++) {
        velocity += ACCEL;
        px += dx;
        py += dy;

        ctx.beginPath();
        ctx.moveTo(prevNode.coords[0], prevNode.coords[1]);
        ctx.lineTo(px, py);
        ctx.strokeStyle = EDGE_COLOR;
        ctx.lineWidth   = NODE_STROKE;
        ctx.stroke();

        drawNodeSync(ctx, prevNode); // keeps parent on top of growing line
        await sleep(Math.round(1000 / velocity));
    }
}

// ── Height helpers ────────────────────────────────────────────────────────────

function findHeight(node) {
    if (node === null) return -1;
    return Math.max(findHeight(node.left), findHeight(node.right)) + 1;
}

function updateHeights(t) {
    t.heightL = findHeight(t.left);
    t.heightR = findHeight(t.right);
    t.height  = Math.max(t.heightL, t.heightR) + 1;
    return t;
}

// ── AVL rotations (no animation — balance() handles the timing) ───────────────

function rotateWithLeftChild(k2) {
    const k1 = k2.left;
    k2.left   = k1.right;
    k1.right  = k2;
    updateHeights(k2);
    updateHeights(k1);
    return k1;
}

function rotateWithRightChild(k1) {
    const k2 = k1.right;
    k1.right  = k2.left;
    k2.left   = k1;
    updateHeights(k1);
    updateHeights(k2);
    return k2;
}

function doubleWithLeftChild(k3) {
    k3.left = rotateWithRightChild(k3.left);
    return rotateWithLeftChild(k3);
}

function doubleWithRightChild(k3) {
    k3.right = rotateWithLeftChild(k3.right);
    return rotateWithRightChild(k3);
}

// ── Balance ───────────────────────────────────────────────────────────────────

async function balance(ctx, t) {
    if (t === null) return t;

    t = updateHeights(t);
    await drawHeightsAnim(ctx, t, NODE_INT_COLOR_H, NODE_EXT_COLOR_H); // 800ms
    await sleep(1000);

    if ((t.heightL - t.heightR) > ALLOWED_IMBALANCE) {
        // Left subtree too tall
        await drawHeightsAnim(ctx, t, RED, WHITE); // 800ms
        await sleep(1500);
        t = (t.left.heightL >= t.left.heightR)
            ? rotateWithLeftChild(t)
            : doubleWithLeftChild(t);
        await drawNodeAnim(ctx, t, NODE_INT_COLOR_H, NODE_EXT_COLOR_H); // 800ms
        await sleep(2000);

    } else if ((t.heightR - t.heightL) > ALLOWED_IMBALANCE) {
        // Right subtree too tall
        await drawHeightsAnim(ctx, t, RED, WHITE); // 800ms
        await sleep(1500);
        t = (t.right.heightR >= t.right.heightL)
            ? rotateWithRightChild(t)
            : doubleWithRightChild(t);
        await drawNodeAnim(ctx, t, NODE_INT_COLOR_H, NODE_EXT_COLOR_H); // 800ms
        await sleep(2000);
    }

    return t;
}

// ── BST operations ────────────────────────────────────────────────────────────

/**
 * Animated insert + AVL rebalance. Equivalent to add_binary_element().
 */
async function addBinaryElement(
    ctx, t, data,
    prevNode = null,
    height   = 0,
    posX     = ROOT_X,
    posY     = ROOT_Y,
    edgeX    = EDGE_X
) {
    if (t === null) {
        const newNode = new BinaryNode(data, posX, posY, edgeX, height);
        if (prevNode) await drawEdgeAnim(ctx, prevNode, newNode);
        await drawNodeAnim(ctx, newNode);
        return newNode;
    }

    if (data < t.data) {
        t.left  = await addBinaryElement(ctx, t.left,  data, t, height + 1, posX - edgeX, posY + EDGE_Y, Math.floor(edgeX / 2));
    } else if (t.data < data) {
        t.right = await addBinaryElement(ctx, t.right, data, t, height + 1, posX + edgeX, posY + EDGE_Y, Math.floor(edgeX / 2));
    }
    // duplicate → ignored

    return await balance(ctx, t);
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
 * Animated removal + AVL rebalance. Equivalent to remove_anim().
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
        await drawNodeAnim(ctx, t, RED, WHITE); // 800ms via heights
        await sleep(1000);                      // extra 1 000ms

        if (!t.left || !t.right) {
            t = t.left ?? t.right;
        } else {
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

    return await balance(ctx, t);
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

function gimmieANumber(ctx, placeholder = null) {
    return new Promise(resolve => {
        let inputStr = '';

        const PLACE_LABELS = { a: 'Add a node', r: 'Remove a node', f: 'Find a node' };
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
 * Welcome screen: collect numbers, build and return the initial AVL tree.
 * Equivalent to create_tree().
 * Note: after each insertion the tree is redrawn and paused 2s so the user
 * can observe the balance corrections (matches the Python behavior).
 */
async function createTree(ctx) {
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = WHITE;
    ctx.font      = "bold 40px 'FreeSans', Arial, sans-serif";
    ctx.fillText('Type numbers to build your AVL tree', HALF_WIDTH, HALF_HEIGHT - 120);

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

        const FEED_Y = HALF_HEIGHT + 60;
        ctx.fillStyle = BLACK;
        ctx.fillRect(HALF_WIDTH - 450, FEED_Y - 22, 900, 44);
        ctx.fillStyle    = LIGHT_BLUE;
        ctx.font         = "bold 20px 'FreeSans', Arial, sans-serif";
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Queued: [${numbers.join(', ')}]`, HALF_WIDTH, FEED_Y);
    }

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    let tree = null;
    for (const num of numbers) {
        tree = await addBinaryElement(ctx, tree, num);
        redrawTree(ctx, tree);
        await sleep(2000); // extra pause to observe the balanced result
    }
    return tree;
}

// ── Key listener ──────────────────────────────────────────────────────────────

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

    if (!canvas.hasAttribute('tabindex')) canvas.setAttribute('tabindex', '0');
    canvas.focus();

    while (true) {
        const tree = await createTree(ctx);
        printIndications(ctx);
        await mainLoop(ctx, tree);
    }
}