"""This module translates and displays expression trees using prefix, infix, and postfix notation.

For good explanations of how some of these algorithms work, you can refer to
chapters 3 and 4 of Data Structures and Algorithm Analysis in Java (3rd Edition)
by Mark Allen Weiss. And some of the algorithms that don't appear in that book,
I invented from the pseudocode provided by a course called "Algoritmos y
Estructuras de Datos" (UNLP).
"""

import re
import sys
import pygame
from pygame.locals import *

# Recommendation: Adjust these values ​​to your screen size.
SREEN_WIDTH = 1200
SCREEN_HEIGHT = 680
HALF_WIDTH = SREEN_WIDTH // 2
HALF_HEIGHT = SCREEN_HEIGHT // 2

FPS = 48

WHITE = (255, 255, 255)
GREY = (120, 120, 120)
BLACK = (0, 0, 0)
GREEN = (0, 170, 0)
DARK_GREEN = (0, 60, 0)
DARK_RED = (170, 0, 0)

BACKGROUND_COLOR = BLACK
NODE_INT_COLOR = DARK_GREEN
NODE_EXT_COLOR = GREEN
EDGE_COLOR = GREEN

NODE_RADIUS = 16
NODE_STROKE = 2
EDGE_X = SREEN_WIDTH // 4
EDGE_Y = NODE_RADIUS * 5
EDGE_STROKE = NODE_STROKE

DATA_FONT_SIZE = NODE_RADIUS

ROOT_X = SREEN_WIDTH // 2
ROOT_Y = NODE_RADIUS * 3


VALID_OPERATORS = ("+", "-", "*", "/", "°")
VALID_BRACES = ("(", ")")
OPERATOR_RANK = {"+": 0, "-": 0, "*": 1, "/": 1, "°": 2}



def main():
    global FPSCLOCK, DISPLAYSURF, NODE_FONT
    pygame.init()
    FPSCLOCK = pygame.time.Clock()
    DISPLAYSURF = pygame.display.set_mode((SREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption('Expression trees for letters or integers')
    NODE_FONT = pygame.font.Font('freesansbold.ttf', DATA_FONT_SIZE)

    while True:

        option, expression = main_menu()

        # Check type of tree: numeric (True) or alphabetical (False)
        numeric_tree = check_type_of_tree(expression)

        match option:
            case 0: from_prefix(expression, numeric_tree)
            case 1: from_infix(expression, numeric_tree)
            case 2: from_postfix(expression, numeric_tree)

        press_enter_to_continue()



### ---------------------------------------------------------------------
### FUNCTIONS FOR THE LOGIC OF THE TREES
### ---------------------------------------------------------------------


def check_type_of_tree(expression):
    for element in expression:
        if element.isnumeric():
            return True
        if element.isalpha():
            return False


class BinaryNode:
    """The node contains some data, but also its own coordenates and edge_x."""
    def __init__(self, data, pos_x=None, pos_y=None, edge_x=None):
        self.data = data
        self.coords = (pos_x, pos_y)
        # This is the horizontal distance with the parent node 
        self.edge_x = edge_x
        self.left = None
        self.right = None


def do_operation(operand_a, operand_b, operand):
    operand_a, operand_b = int(operand_a), int(operand_b)
    match operand:
        case "+" : result = operand_a + operand_b
        case "-" : result = operand_a - operand_b
        case "*" : result = operand_a * operand_b
        case "/" : result = operand_a / operand_b
        case "°" : result = operand_a ** operand_b
    return result


def print_tree(t):
    if t is not None:
        print_tree(t.left)
        print(t.data, end=" ")
        print_tree(t.right)


def from_prefix(expression, numeric_tree):
    # Good to know: This is not the conventional solution. It's much more complicated than it should be,
    # but I like it because, as far as I know, it's the only one that solves the problem from
    # left to right without using recursion; and because I created it myself.

    stack_tree = []
    aux_stack = []

    for element in expression:
        if element.isnumeric() or element.isalpha():
            aux_stack.append(BinaryNode(element))
            while len(aux_stack) > 0:
                if (stack_tree[-1].left is None) or (stack_tree[-1].right is None):
                    if stack_tree[-1].left is None:
                        stack_tree[-1].left = aux_stack.pop()
                    else:
                        stack_tree[-1].right = aux_stack.pop()
                else:
                    aux_stack.append(stack_tree.pop())
        elif element in VALID_OPERATORS:
            one_root = BinaryNode(element)
            stack_tree.append(one_root)

    if len(stack_tree) > 1:
        aux_stack.append(stack_tree.pop())
        
        # stack_tree must have only one node (the root).
        while len(stack_tree) > 1:
            if (stack_tree[-1].left is None) or (stack_tree[-1].right is None):
                if (stack_tree[-1].left is None):
                    stack_tree[-1].left = aux_stack.pop()
                else:
                    stack_tree[-1].right = aux_stack.pop()
            else:
                aux_stack.append(stack_tree.pop())
        
        if stack_tree[0].left is None:
            stack_tree[0].left = aux_stack.pop()
        if stack_tree[0].right is None:
            stack_tree[0].right = aux_stack.pop()

    expression_tree = stack_tree.pop()

    final_result = tree_to_equation(expression_tree) if numeric_tree else None

    show_info(expression_tree, final_result)


def from_infix(expression, numeric_tree):
    
    # First step: transform the infix expression to postfix with a stack and a list

    aux_stack = []
    postfix_list = []

    for element in expression:
        if element.isnumeric() or element.isalpha():
            postfix_list.append(element)
        elif element in VALID_BRACES:
            if element == "(":
                aux_stack.append(element)
            else:
                stack_element = aux_stack.pop()
                while (stack_element != "("):
                    postfix_list.append(stack_element)
                    stack_element = aux_stack.pop()
        elif element in VALID_OPERATORS:
            while True:
                if (not aux_stack) or \
                (not aux_stack[-1] in VALID_OPERATORS) or \
                (OPERATOR_RANK[element] > OPERATOR_RANK[aux_stack[-1]]):
                    aux_stack.append(element)
                    break
                else:
                    postfix_list.append(aux_stack.pop())

    for _ in range(len(aux_stack)):
        postfix_list.append(aux_stack.pop())

    # Second step: make a tree with the postifx expression
    expression_tree, final_result = from_postfix(postfix_list, numeric_tree, True)

    show_info(expression_tree, final_result)


def from_postfix(expression, numeric_tree, is_auxiliar=False):

    stack_tree = []

    for element in expression:
        if element.isnumeric() or element.isalpha():
            new_node = BinaryNode(element)
            stack_tree.append(new_node)
        elif element in VALID_OPERATORS:
            one_root = BinaryNode(element)
            one_root.right = stack_tree.pop()
            one_root.left = stack_tree.pop()
            stack_tree.append(one_root)

    expression_tree = stack_tree.pop()

    final_result = tree_to_equation(expression_tree) if numeric_tree else None
    
    if is_auxiliar:
        return expression_tree, final_result
    else:
        show_info(expression_tree, final_result)


def tree_to_equation(tree):
    operand_a = calculate_subtree(tree.left)
    operand_b = calculate_subtree(tree.right)
    return round(do_operation(operand_a, operand_b, tree.data), 2)

def calculate_subtree(subtree):
    if (subtree.left is None) and (subtree.right is None):
        return subtree.data
    else:
        operand_a = calculate_subtree(subtree.left)
        operand_b = calculate_subtree(subtree.right)
        return do_operation(operand_a, operand_b, subtree.data)


def tree_to_prefix(expression_tree):
    if expression_tree is None:
        return None
    else:
        return tree_to_prefix_helper(expression_tree).strip()

def tree_to_prefix_helper(expression_tree):
    prefix_expression = ""
    prefix_expression += " " + str(expression_tree.data)
    if expression_tree.left is not None:
        prefix_expression += tree_to_prefix_helper(expression_tree.left)
    if expression_tree.right is not None:
        prefix_expression += tree_to_prefix_helper(expression_tree.right)
    return prefix_expression


def tree_to_infix(expression_tree):
    if expression_tree is None:
        return None
    else:
        infix_expression = tree_to_infix_helper(expression_tree).strip()
        return infix_expression[1:-1] # To cut the unnecessary external braces

def tree_to_infix_helper(expression_tree):
    infix_expression = ""
    if expression_tree.left is not None:
        infix_expression += "(" + tree_to_infix_helper(expression_tree.left)
    if expression_tree.data in VALID_OPERATORS:
        infix_expression += " " + str(expression_tree.data) + " "
    else:
        infix_expression += str(expression_tree.data)
    if expression_tree.right is not None:
        infix_expression += tree_to_infix_helper(expression_tree.right) + ")"
    return infix_expression


def tree_to_postfix(expression_tree):
    if expression_tree is None:
        return None
    else:
        return tree_to_postfix_helper(expression_tree).strip()

def tree_to_postfix_helper(expression_tree):
    postfix_expression = ""
    if expression_tree.left is not None:
        postfix_expression += tree_to_postfix_helper(expression_tree.left)
    if expression_tree.right is not None:
        postfix_expression += tree_to_postfix_helper(expression_tree.right)
    return postfix_expression + " " + str(expression_tree.data)



### ---------------------------------------------------------------------
### FUNCTIONS FOR THE GRAPHICS
### ---------------------------------------------------------------------



def quit_program():
    pygame.quit()
    sys.exit()


def check_for_quit():
    for event in pygame.event.get(QUIT):
        quit_program()


def main_menu():

    TYPE_EXP = ("prefix", "infix", "postfix")

    EXAMPLES_OF_EXPRESSIONS = ["* + 1 + 2 30 - 4 * 5 6   or like    * + I + J K - C * A B",
                            "(2 + 50) * 5    or like    (8 + 2)-(5 * (2 + 2*1))/2",
                            "100 5 3 * + 1 +    or like    I J K + + A B * C - *"]

    # First screen: Input for the option (prefix, infix or postfix)

    while True:
        check_for_quit()
        DISPLAYSURF.fill(BACKGROUND_COLOR)
        
        title_font = pygame.font.Font('freesansbold.ttf', 50)
        title_surf = title_font.render("*FIX TO *FIX TRANSLATOR", True, GREEN)
        DISPLAYSURF.blit(title_surf, title_surf.get_rect(center=(HALF_WIDTH, HALF_HEIGHT - 120)))

        subtitle_font  = pygame.font.Font('freesansbold.ttf', 22)
        subtitle_surf  = subtitle_font.render("Select [0] from prefix, [1] from infix or [2] from postfix", True, WHITE)
        DISPLAYSURF.blit(subtitle_surf,  subtitle_surf.get_rect(center=(HALF_WIDTH, HALF_HEIGHT - 60)))

        pygame.display.update()
        FPSCLOCK.tick(FPS)
    
        option = gimmie_input()
        
        if (option.strip() == "") or (not option.isnumeric()):
            continue

        option = int(option)
        if option in (0, 1, 2):
            break

    # Second screen: Input for the expression

    DISPLAYSURF.fill(BACKGROUND_COLOR)

    example_text = "You should write something like   " + EXAMPLES_OF_EXPRESSIONS[option]
    indicantion_text = "Write each operand separated by spaces. If you write AB the program will read 'AB', not 'A' and 'B'"
    warning_text = "Be careful when entering an expression: if it is not correct, the program could crash or give an incorrect final result"
    operators_text = "+ to add, - to subtract, * to multiply, / to divide and ° to raise to a power"
    insert_text = f"Insert the {TYPE_EXP[option]} expression"
    
    example_font = pygame.font.Font('freesansbold.ttf', 26)
    indication_font  = pygame.font.Font('freesansbold.ttf', 22)
    warning_font  = pygame.font.Font('freesansbold.ttf', 18)
    operators_font  = pygame.font.Font('freesansbold.ttf', 18)
    insert_font = pygame.font.Font('freesansbold.ttf', 20)

    example_surf = example_font.render(example_text, True, WHITE)
    indication_surf  = indication_font.render(indicantion_text, True, WHITE)
    warning_surf  = warning_font.render(warning_text, True, DARK_RED)
    operators_surf  = operators_font.render(operators_text, True, GREY)
    insert_surf  = insert_font.render(insert_text, True, GREEN)

    DISPLAYSURF.blit(example_surf, example_surf.get_rect(center=(HALF_WIDTH, HALF_HEIGHT - 150)))
    DISPLAYSURF.blit(indication_surf,  indication_surf.get_rect(center=(HALF_WIDTH, HALF_HEIGHT - 85)))
    DISPLAYSURF.blit(warning_surf,  warning_surf.get_rect(center=(HALF_WIDTH, HALF_HEIGHT - 20)))
    DISPLAYSURF.blit(operators_surf,  operators_surf.get_rect(center=(HALF_WIDTH, HALF_HEIGHT + 40)))
    DISPLAYSURF.blit(insert_surf,  insert_surf.get_rect(center=(HALF_WIDTH, HALF_HEIGHT + 175)))
    pygame.display.update()

    expression = gimmie_input()
    expression = re.split(r'(\W)', expression)
    expression = [item for item in expression if item.strip()]

    DISPLAYSURF.fill(BACKGROUND_COLOR)
    pygame.display.update()

    return option, expression


def gimmie_input():
    """It receives data from the keyboard until the user presses Enter."""
    input_str = ""
    input_font = pygame.font.Font('freesansbold.ttf', 36)
    box_rect = pygame.Rect(100, SCREEN_HEIGHT - 110, SREEN_WIDTH - 200, 60)

    while True:
        for event in pygame.event.get():
            if event.type == QUIT:
                quit_program()
            if event.type == KEYDOWN:
                if event.key not in (K_BACKSPACE, K_RETURN, K_KP_ENTER):
                    input_str += event.unicode
                elif event.key == K_BACKSPACE:
                    input_str = input_str[:-1]
                elif event.key in (K_RETURN, K_KP_ENTER):
                    return input_str

        # Redraw the input box every frame
        pygame.draw.rect(DISPLAYSURF, WHITE, box_rect)
        text_surf = input_font.render(input_str, True, BLACK)
        text_rect = text_surf.get_rect(center=box_rect.center)
        DISPLAYSURF.blit(text_surf, text_rect)
        pygame.display.update()
        FPSCLOCK.tick(FPS)


def press_enter_to_continue():
    indication_font = pygame.font.Font('freesansbold.ttf', 16)
    indication_surf = indication_font.render("Press Enter to continue", True, GREY)
    indication_rect = indication_surf.get_rect(center=(HALF_WIDTH, SCREEN_HEIGHT - 40))
    DISPLAYSURF.blit(indication_surf, indication_rect)
    pygame.display.update()

    while True:
        for event in pygame.event.get():
            if event.type == QUIT:
                quit_program()
            if event.type == KEYDOWN and event.key in (K_RETURN, K_KP_ENTER):
                return
        FPSCLOCK.tick(FPS)


def show_info(expression_tree, final_result):
    redraw_tree(expression_tree)
    pygame.time.wait(1000)
    pre_text = f"Prefix: {tree_to_prefix(expression_tree)}"
    display_some_text(pre_text, 220, SREEN_WIDTH//4)
    post_text = f"Postfix: {tree_to_postfix(expression_tree)}"
    display_some_text(post_text, 220, (SREEN_WIDTH//4)*3)
    in_text = f"Infix: {tree_to_infix(expression_tree)}"
    display_some_text(in_text, 170, HALF_WIDTH)
    if final_result is not None:
        result_text = f"The result is = {final_result}"
        display_some_text(result_text, 100, HALF_WIDTH, GREEN)


def display_some_text(some_text, some_height, x_value, color=WHITE):
    some_font = pygame.font.Font('freesansbold.ttf', 21)
    some_surf = some_font.render(some_text, True, color)
    some_rect = some_surf.get_rect(center=(x_value, SCREEN_HEIGHT - some_height))
    DISPLAYSURF.blit(some_surf, some_rect)
    pygame.display.update()
    pygame.time.wait(1000)


def redraw_tree(t):
    """Draw the tree from scratch and recalculte the position of the nodes."""
    DISPLAYSURF.fill(BACKGROUND_COLOR)
    if t is not None:
        t.coords = (ROOT_X, ROOT_Y)
        t.edge_x = EDGE_X
        draw_node(t, NODE_INT_COLOR, NODE_EXT_COLOR)
        redraw_subtree(t, t.left, ROOT_X-EDGE_X, ROOT_Y+EDGE_Y, EDGE_X//2, True)
        redraw_subtree(t, t.right, ROOT_X+EDGE_X, ROOT_Y+EDGE_Y, EDGE_X//2)
    pygame.display.update()


def redraw_subtree(prev_node, t, pos_x, pos_y, edge_x, from_the_left=False):
    if t is not None:
        t.coords = (pos_x, pos_y)
        t.edge_x = edge_x
        draw_edge(prev_node, from_the_left)
        draw_node(t, NODE_INT_COLOR, NODE_EXT_COLOR)
        redraw_subtree(t, t.left, pos_x-edge_x, pos_y+EDGE_Y, edge_x//2, True)
        redraw_subtree(t, t.right, pos_x+edge_x, pos_y+EDGE_Y, edge_x//2)


def draw_node(node, color_int=NODE_INT_COLOR, color_ext=NODE_EXT_COLOR, update_and_wait=True):
    check_for_quit()

    pygame.draw.circle(DISPLAYSURF, color_int, node.coords, NODE_RADIUS)
    pygame.draw.circle(DISPLAYSURF, color_ext, node.coords, NODE_RADIUS, NODE_STROKE)

    textSurfaceObj = NODE_FONT.render(f"{node.data}", True, WHITE)
    DISPLAYSURF.blit(textSurfaceObj, textSurfaceObj.get_rect(center=node.coords))

    if update_and_wait:
        pygame.display.update()
        pygame.time.wait(300)


def draw_edge(prev_node, to_the_left=False):
    check_for_quit()
    div_animation = 32
    partial_x, partial_y = prev_node.coords
    diff_x = prev_node.edge_x / div_animation
    diff_y = EDGE_Y / div_animation

    if to_the_left:
        diff_x *= -1

    velocity = 16
    acceleration = 8

    for _ in range(div_animation):
        velocity += acceleration
        partial_x += diff_x
        partial_y += diff_y
        pygame.draw.line(DISPLAYSURF, EDGE_COLOR, prev_node.coords, (partial_x, partial_y), EDGE_STROKE)
        draw_node(prev_node, NODE_INT_COLOR, NODE_EXT_COLOR, False)
        pygame.display.update()
        FPSCLOCK.tick(velocity)



if __name__ == "__main__":
    main()