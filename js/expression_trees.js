/**
 * expression_trees.js — Expression Trees interactive visualizer
 * Translated from Pygame to JavaScript Canvas.
 */

const SCREEN_WIDTH  = 1200;
const SCREEN_HEIGHT = 680;
const HALF_WIDTH    = SCREEN_WIDTH  / 2;
const HALF_HEIGHT   = SCREEN_HEIGHT / 2;

const WHITE       = '#ffffff';
const GREY        = '#787878';
const BLACK       = '#000000';
const GREEN       = '#00aa00';
const DARK_GREEN  = '#003c00';
const DARK_RED    = '#aa0000';
const RED         = '#ff0000';

const BACKGROUND_COLOR = BLACK;
const NODE_INT_COLOR   = DARK_GREEN;
const NODE_EXT_COLOR   = GREEN;
const EDGE_COLOR       = GREEN;

const NODE_RADIUS = 16;
const NODE_STROKE = 2;
const EDGE_X      = SCREEN_WIDTH / 4;
const EDGE_Y      = NODE_RADIUS * 5;
const EDGE_STROKE = NODE_STROKE
const DATA_FONT_SIZE = NODE_RADIUS;

const ROOT_X = SCREEN_WIDTH / 2;
const ROOT_Y = NODE_RADIUS * 3;

const VALID_OPERATORS = ["+", "-", "*", "/", "°"];
const VALID_BRACES    = ["(", ")"];
const OPERATOR_RANK   = { "+": 0, "-": 0, "*": 1, "/": 1, "°": 2 };

// ── Utility ───────────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms));

const isNumeric = str => /^[0-9]+$/.test(str);
const isAlpha   = str => /^[a-zA-Z]+$/.test(str);

// ── BinaryNode ────────────────────────────────────────────────────────────────

class BinaryNode {
    constructor(data, posX = null, posY = null, edgeX = null) {
        this.data   = data;
        this.coords = [posX, posY];
        this.edgeX  = edgeX;
        this.left   = null;
        this.right  = null;
    }
}

// ── Logic ─────────────────────────────────────────────────────────────────────

function checkTypeOfTree(expression) {
    for (let element of expression) {
        if (isNumeric(element)) return true;
        if (isAlpha(element)) return false;
    }
    return false;
}

function doOperation(operandA, operandB, operator) {
    const a = parseInt(operandA, 10);
    const b = parseInt(operandB, 10);
    
    if (operator === "/" && b === 0) {
        throw new Error("Oops! Division by zero is a dangerous game. We don't play that game here.");
    }

    switch (operator) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/": return a / b;
        case "°": return Math.pow(a, b);
        default:  throw new Error("One of the operators wasn't alright.");
    }
}

// Custom pop to prevent empty stack errors
function safePop(stack) {
    if (stack.length === 0) {
        throw new Error("Bad expression. Bad.");
    }
    return stack.pop();
}

function fromPrefix(expression, numericTree) {
    let stackTree = [];
    let auxStack  = [];

    for (let element of expression) {
        if (isNumeric(element) || isAlpha(element)) {
            auxStack.push(new BinaryNode(element));
            while (auxStack.length > 0) {
                if (stackTree.length === 0) break; // Safety check
                let top = stackTree[stackTree.length - 1];
                if (top.left === null || top.right === null) {
                    if (top.left === null) {
                        top.left = safePop(auxStack);
                    } else {
                        top.right = safePop(auxStack);
                    }
                } else {
                    auxStack.push(safePop(stackTree));
                }
            }
        } else if (VALID_OPERATORS.includes(element)) {
            stackTree.push(new BinaryNode(element));
        }
    }

    if (stackTree.length > 1) {
        auxStack.push(safePop(stackTree));
        while (stackTree.length > 1) {
            let top = stackTree[stackTree.length - 1];
            if (top.left === null || top.right === null) {
                if (top.left === null) top.left = safePop(auxStack);
                else top.right = safePop(auxStack);
            } else {
                auxStack.push(safePop(stackTree));
            }
        }
        if (stackTree[0].left === null) stackTree[0].left = safePop(auxStack);
        if (stackTree[0].right === null) stackTree[0].right = safePop(auxStack);
    }

    if (stackTree.length === 0) throw new Error("Bad expression. Bad.");
    let expressionTree = stackTree.pop();
    let finalResult = numericTree ? treeToEquation(expressionTree) : null;

    return { expressionTree, finalResult };
}

function fromInfixToPostfix(expression) {
    let auxStack = [];
    let postfixList = [];

    for (let element of expression) {
        if (isNumeric(element) || isAlpha(element)) {
            postfixList.push(element);
        } else if (VALID_BRACES.includes(element)) {
            if (element === "(") {
                auxStack.push(element);
            } else {
                let stackElement = safePop(auxStack);
                while (stackElement !== "(") {
                    postfixList.push(stackElement);
                    stackElement = safePop(auxStack);
                }
            }
        } else if (VALID_OPERATORS.includes(element)) {
            while (true) {
                if (auxStack.length === 0 || 
                    !VALID_OPERATORS.includes(auxStack[auxStack.length - 1]) || 
                    OPERATOR_RANK[element] > OPERATOR_RANK[auxStack[auxStack.length - 1]]) {
                    auxStack.push(element);
                    break;
                } else {
                    postfixList.push(safePop(auxStack));
                }
            }
        }
    }

    while (auxStack.length > 0) {
        let el = auxStack.pop();
        if (VALID_BRACES.includes(el)) throw new Error("Braces aren't okay.");
        postfixList.push(el);
    }

    return postfixList;
}

function fromPostfix(expression, numericTree) {
    let stackTree = [];

    for (let element of expression) {
        if (isNumeric(element) || isAlpha(element)) {
            stackTree.push(new BinaryNode(element));
        } else if (VALID_OPERATORS.includes(element)) {
            let root = new BinaryNode(element);
            root.right = safePop(stackTree);
            root.left  = safePop(stackTree);
            stackTree.push(root);
        }
    }

    if (stackTree.length !== 1) throw new Error("Bad expression. Bad.");
    
    let expressionTree = stackTree.pop();
    let finalResult = numericTree ? treeToEquation(expressionTree) : null;

    return { expressionTree, finalResult };
}

function treeToEquation(tree) {
    let operandA = calculateSubtree(tree.left);
    let operandB = calculateSubtree(tree.right);
    let result = doOperation(operandA, operandB, tree.data);
    return Math.round(result * 100) / 100; // Equivalente a round(val, 2)
}

function calculateSubtree(subtree) {
    if (subtree.left === null && subtree.right === null) {
        return subtree.data;
    } else {
        let operandA = calculateSubtree(subtree.left);
        let operandB = calculateSubtree(subtree.right);
        return doOperation(operandA, operandB, subtree.data);
    }
}

// ── Traversals to String ──────────────────────────────────────────────────────

function treeToPrefix(tree) {
    if (!tree) return null;
    return treeToPrefixHelper(tree).trim();
}

function treeToPrefixHelper(tree) {
    let expr = " " + tree.data;
    if (tree.left)  expr += treeToPrefixHelper(tree.left);
    if (tree.right) expr += treeToPrefixHelper(tree.right);
    return expr;
}

function treeToInfix(tree) {
    if (!tree) return null;
    let expr = treeToInfixHelper(tree).trim();
    return expr.slice(1, -1); // Cut external braces
}

function treeToInfixHelper(tree) {
    let expr = "";
    if (tree.left) expr += "(" + treeToInfixHelper(tree.left);
    
    if (VALID_OPERATORS.includes(tree.data)) expr += " " + tree.data + " ";
    else expr += tree.data;

    if (tree.right) expr += treeToInfixHelper(tree.right) + ")";
    return expr;
}

function treeToPostfix(tree) {
    if (!tree) return null;
    return treeToPostfixHelper(tree).trim();
}

function treeToPostfixHelper(tree) {
    let expr = "";
    if (tree.left)  expr += treeToPostfixHelper(tree.left);
    if (tree.right) expr += treeToPostfixHelper(tree.right);
    return expr + " " + tree.data;
}

// ── Drawing primitives ────────────────────────────────────────────────────────

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
}

async function drawEdgeAnim(ctx, prevNode, toTheLeft) {
    const DIV = 32;
    let [px, py] = [...prevNode.coords];
    let dx = prevNode.edgeX / DIV;
    let dy = EDGE_Y        / DIV;
    
    if (toTheLeft) dx = -dx;

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
        ctx.lineWidth   = EDGE_STROKE;
        ctx.stroke();

        drawNodeSync(ctx, prevNode);
        await sleep(Math.round(1000 / velocity));
    }
}

async function redrawSubtree(ctx, prevNode, t, posX, posY, edgeX, fromTheLeft) {
    if (t) {
        t.coords = [posX, posY];
        t.edgeX  = edgeX;
        await drawEdgeAnim(ctx, prevNode, fromTheLeft);
        drawNodeSync(ctx, t);
        await redrawSubtree(ctx, t, t.left,  posX - edgeX, posY + EDGE_Y, Math.floor(edgeX / 2), true);
        await redrawSubtree(ctx, t, t.right, posX + edgeX, posY + EDGE_Y, Math.floor(edgeX / 2), false);
    }
}

async function redrawTree(ctx, t) {
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    if (t) {
        t.coords = [ROOT_X, ROOT_Y];
        t.edgeX  = EDGE_X;
        drawNodeSync(ctx, t);
        await redrawSubtree(ctx, t, t.left,  ROOT_X - EDGE_X, ROOT_Y + EDGE_Y, Math.floor(EDGE_X / 2), true);
        await redrawSubtree(ctx, t, t.right, ROOT_X + EDGE_X, ROOT_Y + EDGE_Y, Math.floor(EDGE_X / 2), false);
    }
}

function displaySomeText(ctx, text, heightOffset, xValue, color = WHITE) {
    ctx.fillStyle    = color;
    ctx.font         = "bold 21px 'FreeSans', Arial, sans-serif";
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, xValue, SCREEN_HEIGHT - heightOffset);
}

// ── UI and Input Helpers ──────────────────────────────────────────────────────

function gimmieInput(ctx, isOption = false) {
    return new Promise(resolve => {
        let inputStr = '';
        const BOX = { x: 100, y: SCREEN_HEIGHT - 110, w: SCREEN_WIDTH - 200, h: 60 };
        const CX  = BOX.x + BOX.w / 2;
        const CY  = BOX.y + BOX.h / 2;

        function renderBox() {
            ctx.fillStyle = WHITE;
            ctx.fillRect(BOX.x, BOX.y, BOX.w, BOX.h);
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle    = BLACK;
            ctx.font         = "bold 36px 'FreeSans', Arial, sans-serif";
            ctx.fillText(inputStr, CX, CY);
        }

        renderBox();

        function handler(e) {
            // Prevent default browser actions for these keys
            if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
                e.preventDefault();
            }

            if (e.key === 'Backspace') {
                inputStr = inputStr.slice(0, -1);
                renderBox();
            } else if (e.key === 'Enter') {
                if (isOption && !['0','1','2'].includes(inputStr.trim())) {
                    inputStr = ''; // Force correct input for option
                    renderBox();
                    return;
                }
                document.removeEventListener('keydown', handler);
                resolve(inputStr.trim());
            } else if (e.key.length === 1) {
                inputStr += e.key;
                renderBox();
            }
        }

        document.addEventListener('keydown', handler);
    });
}

function pressEnterToContinue(ctx) {
    return new Promise(resolve => {
        ctx.fillStyle    = GREY;
        ctx.font         = "bold 16px 'FreeSans', Arial, sans-serif";
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("Press Enter to continue", HALF_WIDTH, SCREEN_HEIGHT - 40);

        function handler(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.removeEventListener('keydown', handler);
                resolve();
            }
        }
        document.addEventListener('keydown', handler);
    });
}

async function showErrorScreen(ctx, errorMsg) {
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    ctx.fillStyle    = RED;
    ctx.font         = "bold 40px 'FreeSans', Arial, sans-serif";
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("Error!", HALF_WIDTH, HALF_HEIGHT - 40);

    ctx.fillStyle    = WHITE;
    ctx.font         = "bold 24px 'FreeSans', Arial, sans-serif";
    ctx.fillText(errorMsg, HALF_WIDTH, HALF_HEIGHT + 20);

    await pressEnterToContinue(ctx);
}

// ── Main Flow ─────────────────────────────────────────────────────────────────

async function mainMenu(ctx) {
    const TYPE_EXP = ["prefix", "infix", "postfix"];
    const EXAMPLES = [
        "* + 1 + 2 30 - 4 * 5 6   or like    * + I + J K - C * A B",
        "(2 + 50) * 5    or like    (8 + 2)-(5 * (2 + 2*1))/2",
        "100 5 3 * + 1 +    or like    I J K + + A B * C - *"
    ];

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = GREEN;
    ctx.font      = "bold 50px 'FreeSans', Arial, sans-serif";
    ctx.fillText("*FIX TO *FIX TRANSLATOR", HALF_WIDTH, HALF_HEIGHT - 120);

    ctx.fillStyle = WHITE;
    ctx.font      = "bold 22px 'FreeSans', Arial, sans-serif";
    ctx.fillText("Select [0] from prefix, [1] from infix or [2] from postfix", HALF_WIDTH, HALF_HEIGHT - 60);

    const optionStr = await gimmieInput(ctx, true);
    const option = parseInt(optionStr, 10);

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    ctx.fillStyle = WHITE;
    ctx.font      = "bold 26px 'FreeSans', Arial, sans-serif";
    ctx.fillText(`You should write something like   ${EXAMPLES[option]}`, HALF_WIDTH, HALF_HEIGHT - 150);

    ctx.font      = "bold 22px 'FreeSans', Arial, sans-serif";
    ctx.fillText("Write each operand separated by spaces. If you write AB the program will read 'AB', not 'A' and 'B'", HALF_WIDTH, HALF_HEIGHT - 85);

    ctx.fillStyle = DARK_RED;
    ctx.font      = "bold 18px 'FreeSans', Arial, sans-serif";
    ctx.fillText("Be careful: if the expression is not correct, it will throw an error", HALF_WIDTH, HALF_HEIGHT - 20);

    ctx.fillStyle = GREY;
    ctx.fillText("+ to add, - to subtract, * to multiply, / to divide and ° to raise to a power", HALF_WIDTH, HALF_HEIGHT + 40);

    ctx.fillStyle = GREEN;
    ctx.font      = "bold 20px 'FreeSans', Arial, sans-serif";
    ctx.fillText(`Insert the ${TYPE_EXP[option]} expression`, HALF_WIDTH, HALF_HEIGHT + 175);

    let rawExpression = await gimmieInput(ctx, false);
    
    // Split by non-word characters but keep delimiters, then filter out empty strings
    let expressionList = rawExpression.split(/(\W)/).filter(item => item.trim() !== '');

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    return { option, expression: expressionList };
}

async function showInfo(ctx, expressionTree, finalResult) {
    await redrawTree(ctx, expressionTree);
    await sleep(1000);
    
    displaySomeText(ctx, `Prefix: ${treeToPrefix(expressionTree)}`, 220, SCREEN_WIDTH / 4);
    displaySomeText(ctx, `Postfix: ${treeToPostfix(expressionTree)}`, 220, (SCREEN_WIDTH / 4) * 3);
    displaySomeText(ctx, `Infix: ${treeToInfix(expressionTree)}`, 170, HALF_WIDTH);
    
    if (finalResult !== null) {
        displaySomeText(ctx, `The result is = ${finalResult}`, 100, HALF_WIDTH, GREEN);
    }
}

export async function iniciarAnimacionExpresiones() {
    const canvas = document.getElementById('treeGraphCanvas');
    const ctx    = canvas.getContext('2d');

    if (!canvas.hasAttribute('tabindex')) canvas.setAttribute('tabindex', '0');
    canvas.focus();

    while (true) {
        try {
            const { option, expression } = await mainMenu(ctx);
            const isNumericTree = checkTypeOfTree(expression);
            
            let resultData;

            if (option === 0) {
                resultData = fromPrefix(expression, isNumericTree);
            } else if (option === 1) {
                let postFixList = fromInfixToPostfix(expression);
                resultData = fromPostfix(postFixList, isNumericTree);
            } else if (option === 2) {
                resultData = fromPostfix(expression, isNumericTree);
            }

            await showInfo(ctx, resultData.expressionTree, resultData.finalResult);
            await pressEnterToContinue(ctx);

        } catch (error) {
            // Acá atajamos los pop() vacíos, divisiones por cero, o cualquier otro error
            console.error(error);
            await showErrorScreen(ctx, error.message || "Bad expression. Bad.");
        }
    }
}