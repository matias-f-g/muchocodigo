"""This module displays the basic operations on binary search trees.

For good explanations of how these algorithms work, you can refer to
Chapter 4 of Data Structures and Algorithm Analysis in Java (3rd Edition)
by Mark Allen Weiss.
"""

import sys
import pygame
from pygame.locals import *

# Recommendation: Adjust these values ​​to your screen size.
SREEN_WIDTH = 1200
SCREEN_HEIGHT = 680
HALF_WIDTH = SREEN_WIDTH // 2
HALF_HEIGHT = SCREEN_HEIGHT // 2

FPS = 48

START_SCREEN = K_s
ADD = K_a
REMOVE = K_r
PREORDEN = K_u
INORDEN = K_i
POSTORDEN = K_o
FIND = K_f

VALID_KEYS = (START_SCREEN, ADD, REMOVE, PREORDEN, INORDEN, POSTORDEN, FIND)

WHITE = (255, 255, 255)
GREY = (120, 120, 120)
BLACK = (0, 0, 0)
LIGHT_GREEN = (0, 200, 0)
GREEN = (0, 170, 0)
DARK_GREEN = (0, 60, 0)
LIGHT_BLUE = (0, 170, 228)
LIGHT_BLUE2 = (81, 209, 246)
ORANGE = (255, 165, 0)
RED = (255, 0, 0)

BACKGROUND_COLOR = BLACK
NODE_INT_COLOR = DARK_GREEN
NODE_EXT_COLOR = GREEN
NODE_INT_COLOR_H = LIGHT_GREEN
NODE_EXT_COLOR_H = GREEN
EDGE_COLOR = GREEN

NODE_RADIUS = 16
NODE_STROKE = 2
EDGE_X = SREEN_WIDTH // 4
EDGE_Y = NODE_RADIUS * 5
EDGE_STROKE = NODE_STROKE

DATA_FONT_SIZE = NODE_RADIUS

ROOT_X = SREEN_WIDTH // 2
ROOT_Y = NODE_RADIUS * 3


def main():
    global FPSCLOCK, DISPLAYSURF, NODE_FONT
    pygame.init()
    FPSCLOCK = pygame.time.Clock()
    DISPLAYSURF = pygame.display.set_mode((SREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption('Binary Search Tree (BST)')
    NODE_FONT = pygame.font.Font('freesansbold.ttf', DATA_FONT_SIZE)

    while True:
        # This is the start screen
        tree = create_tree()
        print_indications()
        back_to_start_screen = False

        while not back_to_start_screen:
            check_for_quit()
            # This is where the tree editing and visualization live
            for event in pygame.event.get():
                if (event.type == KEYDOWN) and (event.key in VALID_KEYS):
                    if event.key == START_SCREEN:
                        back_to_start_screen = True
                    elif event.key in (ADD, REMOVE, FIND):
                        number = gimmie_a_number(event.key)
                        if number is not None:
                            if event.key == ADD:
                                tree = add_binary_element(tree, number)
                            elif event.key == REMOVE:
                                tree = remove_anim(tree, number) 
                            else:
                                contains_anim(tree, number)
                    elif event.key in (PREORDEN, INORDEN, POSTORDEN):
                        some_traversal(tree, event.key)
                    redraw_tree(tree)
                    print_indications()
            pygame.display.update()
            FPSCLOCK.tick(FPS)



def quit_program():
    pygame.quit()
    sys.exit()


def check_for_quit():
    for event in pygame.event.get(QUIT):
        quit_program()


def print_indications():
    subtitle_font  = pygame.font.Font('freesansbold.ttf', 18)
    subtitle_surf  = subtitle_font.render("'a' --> add, 'r' --> remove, 'f' --> find, 'i' --> in-order traversal, 'u' --> pre-order, 'o' --> post-order, 's' --> restart", True, GREY)
    DISPLAYSURF.blit(subtitle_surf,  subtitle_surf.get_rect(center=(HALF_WIDTH, SCREEN_HEIGHT - 72)))


class BinaryNode:
    """The node contains some data, but also its own coordenates and edge_x."""
    def __init__(self, data, pos_x, pos_y, edge_x):
        self.data = data
        self.coords = (pos_x, pos_y)
        # This is the horizontal distance with the parent node 
        self.edge_x = edge_x
        self.left = None
        self.right = None


def add_binary_element(t, data, prev_node=None, pos_x=ROOT_X, pos_y=ROOT_Y, edge_x=EDGE_X):
    """Does the classic insert(), but with animation."""
    if t is None:
        new_node = BinaryNode(data, pos_x, pos_y, edge_x)
        if prev_node:
            draw_edge(prev_node, new_node)
        draw_node(new_node)
        return new_node
    else:
        if data < t.data:
            t.left = add_binary_element(t.left, data, t, pos_x-edge_x, pos_y+EDGE_Y, edge_x//2)
        elif t.data < data:
            t.right = add_binary_element(t.right, data, t, pos_x+edge_x, pos_y+EDGE_Y, edge_x//2)
        else:
            pass # It's a duplicate; we just ignore it
    return t


def contains_anim(tree, data):
    """The classic contains(), but animating the search, and then cleaning the changes."""
    contains(tree, data)
    for _ in range(2):
        check_for_quit()
        pygame.time.wait(1000)
    redraw_tree(tree)


def contains(t, data):
    """The classic contains(), but animating the search."""
    if t is None:
        return False
    else:
        if data == t.data:
            draw_node(t, LIGHT_BLUE, LIGHT_BLUE2, True)
            return True
        elif data < t.data:
            draw_node(t, NODE_INT_COLOR_H, NODE_EXT_COLOR_H, True)
            return contains(t.left, data)
        else:
            draw_node(t, NODE_INT_COLOR_H, NODE_EXT_COLOR_H, True)
            return contains(t.right, data)


def remove_anim(tree, data):
    if tree is None:
        return None
    tree = remove(tree, data)
    pygame.time.wait(1000)
    return tree


def remove(t, data):
    """Remove the node from the tree data type, but not from the screen."""
    if t is None:
        return None
    
    if data == t.data:
        draw_node(t, RED, WHITE, True)
        pygame.time.wait(1000)
        if not t.left or not t.right:
            if t.left:
                t = t.left
            else:
                t = t.right
        else:
            t.data = find_min(t.right).data
            t.right = remove(t.right, t.data)
    elif data < t.data:
        draw_node(t, ORANGE, NODE_EXT_COLOR_H, True)
        t.left = remove(t.left, data)
    else:
        draw_node(t, ORANGE, NODE_EXT_COLOR_H, True)
        t.right = remove(t.right, data)

    return t


def find_min(t):
    if t is None:
        return None
    while t.left:
        t = t.left
    return t


def some_traversal(tree, the_choice):
    if the_choice == PREORDEN:
        highlight_preorden(tree)
    elif the_choice == INORDEN:
        highlight_inorden(tree)
    else:
        highlight_postorden(tree)
    for _ in range(2):
        check_for_quit()
        pygame.time.wait(1000)


def highlight_preorden(t):
    """Animates preorden traversal, highlighting the nodes."""
    if t is not None:
        draw_node(t, NODE_INT_COLOR_H, NODE_EXT_COLOR_H, True)
        highlight_preorden(t.left)
        highlight_preorden(t.right)


def highlight_inorden(t):
    """Animates inorder traversal, highlighting the nodes."""
    if t is not None:
        highlight_inorden(t.left)
        draw_node(t, NODE_INT_COLOR_H, NODE_EXT_COLOR_H, True)
        highlight_inorden(t.right)


def highlight_postorden(t):
    """Animates postorden traversal, highlighting the nodes."""
    if t is not None:
        highlight_postorden(t.left)
        highlight_postorden(t.right)
        draw_node(t, NODE_INT_COLOR_H, NODE_EXT_COLOR_H, True)


def redraw_tree(t):
    """Draw the tree from scratch and recalculte the position of the nodes."""
    DISPLAYSURF.fill(BACKGROUND_COLOR)
    if t is not None:
        t.coords = (ROOT_X, ROOT_Y)
        t.edge_x = EDGE_X
        draw_node(t, NODE_INT_COLOR, NODE_EXT_COLOR, False)
        redraw_subtree(t, t.left, ROOT_X-EDGE_X, ROOT_Y+EDGE_Y, EDGE_X//2)
        redraw_subtree(t, t.right, ROOT_X+EDGE_X, ROOT_Y+EDGE_Y, EDGE_X//2)
    pygame.display.update()


def redraw_subtree(prev_node, t, pos_x, pos_y, edge_x):
    if t is not None:
        t.coords = (pos_x, pos_y)
        t.edge_x = edge_x
        draw_edge(prev_node, t, False)
        draw_node(t, NODE_INT_COLOR, NODE_EXT_COLOR, False)
        redraw_subtree(t, t.left, pos_x-edge_x, pos_y+EDGE_Y, edge_x//2)
        redraw_subtree(t, t.right, pos_x+edge_x, pos_y+EDGE_Y, edge_x//2)


def draw_node(node, color_int=NODE_INT_COLOR, color_ext=NODE_EXT_COLOR, update_and_wait=True):
    check_for_quit()

    pygame.draw.circle(DISPLAYSURF, color_int, node.coords, NODE_RADIUS)
    pygame.draw.circle(DISPLAYSURF, color_ext, node.coords, NODE_RADIUS, NODE_STROKE)

    textSurfaceObj = NODE_FONT.render(f"{node.data}", True, WHITE)
    DISPLAYSURF.blit(textSurfaceObj, textSurfaceObj.get_rect(center=node.coords))

    if update_and_wait:
        pygame.display.update()
        pygame.time.wait(500)


def draw_edge(prev_node, node, update_and_wait=True):
    check_for_quit()
    div_animation = 32
    partial_x, partial_y = prev_node.coords
    diff_x = prev_node.edge_x / div_animation
    diff_y = EDGE_Y / div_animation

    if node.data < prev_node.data:
        diff_x *= -1

    velocity = 16
    acceleration = 8

    for _ in range(div_animation):
        velocity += acceleration
        partial_x += diff_x
        partial_y += diff_y
        pygame.draw.line(DISPLAYSURF, EDGE_COLOR, prev_node.coords, (partial_x, partial_y), EDGE_STROKE)
        draw_node(prev_node, NODE_INT_COLOR, NODE_EXT_COLOR, False)
        if update_and_wait:
            pygame.display.update()
            FPSCLOCK.tick(velocity)


def create_tree():
    """Welcome screen: collect numbers until Enter is pressed alone, then build the tree.
    
    This function was partially created with AI.
    """

    DISPLAYSURF.fill(BACKGROUND_COLOR)

    title_font = pygame.font.Font('freesansbold.ttf', 40)
    subtitle_font  = pygame.font.Font('freesansbold.ttf', 22)
    hint_font  = pygame.font.Font('freesansbold.ttf', 20)

    title_surf = title_font.render("Type numbers to build your binary search tree", True, WHITE)
    subtitle_surf  = subtitle_font.render("For example: press 2, then 7, then Enter, and you'll get 27", True, WHITE)
    hint_surf  = hint_font.render("Press Enter alone when you're done", True, GREEN)

    DISPLAYSURF.blit(title_surf, title_surf.get_rect(center=(HALF_WIDTH, HALF_HEIGHT - 120)))
    DISPLAYSURF.blit(subtitle_surf,  subtitle_surf.get_rect(center=(HALF_WIDTH, HALF_HEIGHT - 60)))
    DISPLAYSURF.blit(hint_surf,  hint_surf.get_rect(center=(HALF_WIDTH, HALF_HEIGHT)))
    pygame.display.update()

    numbers = []
    while True:
        number = gimmie_a_number()
        if number is None:      # bare Enter = done
            break
        numbers.append(number)

        # Give feedback: show how many nodes are queued
        feedback_font = pygame.font.Font('freesansbold.ttf', 20)
        feedback_surf = feedback_font.render(f"Queued: {numbers}", True, LIGHT_BLUE)
        feedback_rect = feedback_surf.get_rect(center=(HALF_WIDTH, HALF_HEIGHT + 60))
        pygame.draw.rect(DISPLAYSURF, BLACK, feedback_rect.inflate(10, 10))  # clear old text
        DISPLAYSURF.blit(feedback_surf, feedback_rect)
        pygame.display.update()

    # Build and draw the tree
    DISPLAYSURF.fill(BACKGROUND_COLOR)
    pygame.display.update()

    tree = None
    for number in numbers:
        tree = add_binary_element(tree, number)

    return tree


def gimmie_a_number(some_placeholder=None):
    """Blocks until the user types a number and presses Enter.

    Returns an int, or None if the user pressed Enter with empty input.
    This function was partially created with AI.
    """

    input_str = ""
    input_font = pygame.font.Font('freesansbold.ttf', 36)
    box_rect = pygame.Rect(100, SCREEN_HEIGHT - 110, SREEN_WIDTH - 200, 60)

    if some_placeholder is not None:
        place_texts = {ADD: "Add a node", REMOVE: "Remove a node", FIND: "Find a node"}
        place_font = pygame.font.Font('freesansbold.ttf', 20)
        place_surf = place_font.render(place_texts[some_placeholder], True, GREY)
        place_rect = place_surf.get_rect(center=(HALF_WIDTH, SCREEN_HEIGHT - 80))

    while True:
        for event in pygame.event.get():
            if event.type == QUIT:
                quit_program()
            if event.type == KEYDOWN:
                if event.unicode.isdigit():
                    if len(input_str) < 2:
                        input_str += event.unicode
                elif event.key == K_BACKSPACE:
                    input_str = input_str[:-1]
                elif event.key in (K_RETURN, K_KP_ENTER):
                    return int(input_str) if input_str else None

        # Redraw the input box every frame
        pygame.draw.rect(DISPLAYSURF, WHITE, box_rect)
        text_surf = input_font.render(input_str, True, BLACK)
        text_rect = text_surf.get_rect(center=box_rect.center)
        DISPLAYSURF.blit(text_surf, text_rect)
        if (len(input_str) == 0) and (some_placeholder is not None):
            DISPLAYSURF.blit(place_surf, place_rect)
        pygame.display.update()
        FPSCLOCK.tick(FPS)



if __name__ == '__main__':
    main()
