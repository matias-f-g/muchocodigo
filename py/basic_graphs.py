"""This module allows you to create and analyze directed and unweighted graphs using a GUI."""

import sys
import re
from pathlib import Path
import math
import pygame
from pygame.locals import *

# Recommendation: Adjust these values ​​to your screen size, using even numbers
SREEN_WIDTH = 1200
SCREEN_HEIGHT = 680
HALF_WIDTH = SREEN_WIDTH // 2
HALF_HEIGHT = SCREEN_HEIGHT // 2

FPS = 120

# Back to initial screen
START_SCREEN = K_q
# To change the mode
CHANGE = K_r
# Creative mode
ADD = K_a
CONNECT = K_s
REMOVE = K_d
DISCONNECT = K_f
SCREENSHOT = K_p
# Analytical mode
SELECT_INITIAL_NODE = K_z
APPLY_DFS = K_x
APPLY_BFS = K_c

CREATIVE_MODE = 'Creative mode'
ANALYTICAL_MODE = 'Analytical mode'

VALID_CREATIVE_KEYS = (START_SCREEN, CHANGE, ADD, CONNECT, REMOVE, DISCONNECT, SCREENSHOT)
VALID_ANALYTICAL_KEYS = (CHANGE, SELECT_INITIAL_NODE, APPLY_DFS, APPLY_BFS)

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
NODE_DIAMETER = NODE_RADIUS * 2
NODE_STROKE = 2
EDGE_STROKE = NODE_STROKE

DATA_FONT_SIZE = NODE_RADIUS

GRAPH_DIR = Path(__file__).parent
SCREENSHOT_DIR = GRAPH_DIR / "graphs_screenshots"
ARROW_IMG_PATH = GRAPH_DIR / "arrowR.png"

# A filename is considered to be a screenshot of a graph if it begins with "graph_",
# and then has one or more digits, and ends with ".png"
isGraphRegex = re.compile(r"^graph_\d+\.png$")

assert ARROW_IMG_PATH.exists(), 'The image of the arrow "arrowR.png" is missing'


def main():
    # Some global variables and pygame stuff
    global FPSCLOCK, DISPLAYSURF, NODE_FONT, ARROW_R, ARROW_L
    pygame.init()
    FPSCLOCK = pygame.time.Clock()
    DISPLAYSURF = pygame.display.set_mode((SREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption('Graphing graphs')

    # Some settings for the font and the arrows
    NODE_FONT = pygame.font.Font('freesansbold.ttf', DATA_FONT_SIZE)
    ARROW_R = pygame.image.load(ARROW_IMG_PATH).convert_alpha()
    ARROW_L = ARROW_R
    ARROW_R = pygame.transform.smoothscale_by(ARROW_R, 0.6)
    ARROW_L = pygame.transform.smoothscale_by(ARROW_L, 0.6)
    ARROW_L = pygame.transform.rotozoom(ARROW_R, 180, 1)

    # The variable for the initial node of a graph traversal
    initial_node = None

    # Create (if it does not exist) the directory for screenshots
    SCREENSHOT_DIR.mkdir(exist_ok=True)

    # This is the main loop, the master loop, the program loop
    while True:
        # This is the start screen
        graph = create_graph()
        current_mode = CREATIVE_MODE
        print_indications(current_mode)
        back_to_start_screen = False

        # This is the main "working" loop (for the creative mode and the analytical mode)
        while not back_to_start_screen:

            # This is the creative mode loop
            while (not back_to_start_screen) and (current_mode == CREATIVE_MODE):
                check_for_quit()
                for event in pygame.event.get():
                    if event.type == MOUSEBUTTONDOWN:
                        mousex, mousey = event.pos
                        index_node = getNodeAtPixel(mousex, mousey, graph)
                        if index_node is not None:
                            move_node(index_node, graph)
                            print_indications(current_mode)
                    elif (event.type == KEYDOWN) and (event.key in VALID_CREATIVE_KEYS):
                        if event.key == START_SCREEN:
                            back_to_start_screen = True
                            break
                        redraw_graph(graph)
                        if event.key == CHANGE:
                            if len(graph) > 0:
                                current_mode = ANALYTICAL_MODE
                                print_indications(current_mode, initial_node)
                            else:
                                print_sign('To access analytical mode, there must be a graph!')
                                redraw_graph(graph)
                                print_indications(current_mode)
                        else:
                            if event.key == ADD:
                                graph = add_node(graph)
                            elif event.key == CONNECT:
                                graph = add_edge(graph)
                            elif event.key == REMOVE:
                                graph = remove_node(graph)
                            elif event.key == DISCONNECT:
                                graph = remove_edge(graph)
                            elif event.key == SCREENSHOT:
                                take_screenshot(graph)
                            redraw_graph(graph)
                            print_indications(current_mode)

                pygame.display.update()
                FPSCLOCK.tick(FPS)

            # This is the analytical mode loop
            while (not back_to_start_screen) and (current_mode == ANALYTICAL_MODE):
                check_for_quit()
                for event in pygame.event.get():
                    if (event.type == KEYDOWN) and (event.key in VALID_ANALYTICAL_KEYS):
                        redraw_graph(graph)
                        if event.key == CHANGE:
                            current_mode = CREATIVE_MODE
                            print_indications(current_mode)
                        else:
                            if event.key == SELECT_INITIAL_NODE:
                                initial_node = get_initial_node(graph)
                            elif event.key == APPLY_DFS:
                                dfs(graph, initial_node)
                            elif event.key == APPLY_BFS:
                                bfs(graph, initial_node)
                        
                        redraw_graph(graph)
                        print_indications(current_mode, initial_node)
                
                pygame.display.update()
                FPSCLOCK.tick(FPS)


# ------------------------------------------- BASIC AND GENERAL STUFF

class GraphNode:
    def __init__(self, data, edges=[], pos_x=100, pos_y=100):
        self.data = data
        self.coords = (pos_x, pos_y)
        self.edges = edges


def quit_program():
    pygame.quit()
    sys.exit()


def check_for_quit():
    for event in pygame.event.get(QUIT):
        quit_program()


def print_header(the_header):
    subtitle_font = pygame.font.Font('freesansbold.ttf', 20)
    subtitle_surf = subtitle_font.render(the_header, True, GREY)
    DISPLAYSURF.blit(subtitle_surf, subtitle_surf.get_rect(center=(HALF_WIDTH, 50)))


def print_indications(current_mode, initial_node=None):
    # Header
    print_header(current_mode)

    # Subtle indications
    sub_texts = {CREATIVE_MODE: "'r' --> switch mode, 'a' --> add node, 's' --> add edge, 'd' --> remove node, 'f' --> remove edge, 'q' --> restart program, 'p' --> screenshot",
                ANALYTICAL_MODE: "'r' --> switch mode, 'z' --> select initial node, 'x' apply dfs, 'c' apply bfs"}
    subtitle_font = pygame.font.Font('freesansbold.ttf', 18)
    subtitle_surf = subtitle_font.render(sub_texts[current_mode], True, GREY)
    DISPLAYSURF.blit(subtitle_surf, subtitle_surf.get_rect(center=(HALF_WIDTH, SCREEN_HEIGHT - 60)))

    # One more subtle indication
    if current_mode == CREATIVE_MODE:
        subtitle_font = pygame.font.Font('freesansbold.ttf', 14)
        subtitle_surf = subtitle_font.render('BTW, you can move the nodes using the mouse!', True, GREY)
        DISPLAYSURF.blit(subtitle_surf, subtitle_surf.get_rect(center=(HALF_WIDTH, SCREEN_HEIGHT - 28)))
    else:
        if initial_node is not None:
            subtitle_font = pygame.font.Font('freesansbold.ttf', 14)
            subtitle_surf = subtitle_font.render(f'The initial node is {initial_node}', True, GREY)
            DISPLAYSURF.blit(subtitle_surf, subtitle_surf.get_rect(center=(HALF_WIDTH, SCREEN_HEIGHT - 28)))


def print_sign(the_text):
    DISPLAYSURF.fill(BACKGROUND_COLOR)

    sign_font = pygame.font.Font('freesansbold.ttf', 42)
    sign_surf = sign_font.render(the_text, True, WHITE)
    DISPLAYSURF.blit(sign_surf, sign_surf.get_rect(center=(HALF_WIDTH, HALF_HEIGHT)))

    subtitle_font = pygame.font.Font('freesansbold.ttf', 20)
    subtitle_surf = subtitle_font.render("Press any key to continue", True, GREY)
    DISPLAYSURF.blit(subtitle_surf, subtitle_surf.get_rect(center=(HALF_WIDTH, HALF_HEIGHT + 100)))

    pygame.display.update()

    # Just a simple implementation of "Press any key to continue"
    keep_showing_sign = True
    while keep_showing_sign:
        for event in pygame.event.get():
            if event.type == QUIT:
                quit_program()
            if event.type == KEYDOWN:
                keep_showing_sign = False
        FPSCLOCK.tick(FPS)


# ---------------------------------- GRAPHICS AND CREATIVE MODE STUFF

def getNodeAtPixel(mousex, mousey, graph):
    for index, node in enumerate(graph):
        pos_x, pos_y = node.coords
        node_rect = pygame.Rect(pos_x-NODE_RADIUS, pos_y-NODE_RADIUS, NODE_DIAMETER, NODE_DIAMETER)
        if node_rect.collidepoint(mousex, mousey):
            return index
    return None


def move_node(index_node, graph):
    """Drag a selected node with the mouse."""

    while True:
        for event in pygame.event.get():
            if event.type == MOUSEBUTTONUP:
                return
            if event.type == MOUSEMOTION:
                graph[index_node].coords = event.pos
                redraw_graph(graph)
        FPSCLOCK.tick(FPS)


def redraw_graph(graph):
    DISPLAYSURF.fill(BACKGROUND_COLOR)
    for node in graph:
        draw_node(node)
    for node in graph:
        draw_edges(node)
    pygame.display.update()
    FPSCLOCK.tick(FPS)


def draw_node(node, color_int=NODE_INT_COLOR, color_ext=NODE_EXT_COLOR):
    pygame.draw.circle(DISPLAYSURF, color_int, node.coords, NODE_RADIUS)
    pygame.draw.circle(DISPLAYSURF, color_ext, node.coords, NODE_RADIUS, NODE_STROKE)
    textSurfaceObj = NODE_FONT.render(f"{node.data}", True, WHITE)
    DISPLAYSURF.blit(textSurfaceObj, textSurfaceObj.get_rect(center=node.coords))


def highlith_node(node):
    draw_node(node, NODE_INT_COLOR_H, NODE_EXT_COLOR_H)
    pygame.display.update()
    pygame.time.wait(700)


def draw_edges(node):
    for edge in node.edges:
        draw_arrow(node.coords, edge.coords)
        draw_node(edge)
    draw_node(node)


def draw_arrow(origin, destiny):
    pygame.draw.line(DISPLAYSURF, EDGE_COLOR, origin, destiny, EDGE_STROKE)
    x1, y1 = origin
    x2, y2 = destiny
    opposite = y1 - y2
    adjacent = x2 - x1
    if adjacent == 0:
        adjacent = 0.002
    angle = math.degrees(math.atan(opposite/adjacent))
    if adjacent >= 0:
        this_arrow = pygame.transform.rotozoom(ARROW_R, angle, 1)
    else:
        this_arrow = pygame.transform.rotozoom(ARROW_L, angle, 1)
    rect = this_arrow.get_rect()
    rect.center = destiny
    DISPLAYSURF.blit(this_arrow, rect)


def add_node(graph):

    new_data = gimmie_input(ADD)

    if new_data.strip() == "":
        print_sign('You cannot add an empty node')
    else:
        if get_node(graph, new_data) is None:
            new_node = GraphNode(new_data, [], HALF_WIDTH, HALF_HEIGHT)
            graph.append(new_node)
            graph.sort(key=lambda node : node.data)
        else:
            print_sign('That node is already there my friend')

    return graph


def add_edge(graph):

    redraw_graph(graph)
    print_header('Indicate the origin of the edge')
    node_a = gimmie_input(CONNECT)

    redraw_graph(graph)
    print_header('Indicate the destination of the edge')
    node_b = gimmie_input(CONNECT)

    node_origin = get_node(graph, node_a)
    node_destin = get_node(graph, node_b)

    # Check that both nodes exists and that the EDGE ITSELFT does not exist yet
    if (node_origin is None) or (node_destin is None) or (node_destin in node_origin.edges):
        print_sign('Something went wrong :(')
    else:
        node_origin.edges.append(node_destin)
        node_origin.edges.sort(key= lambda node : node.data)

    return graph


def remove_node(graph):

    selected_node = gimmie_input(REMOVE)

    the_node = get_node(graph, selected_node)

    # Check that the node exist
    if the_node is None:
        print_sign('You cannot eliminate what does not exist')
    else:
        graph.remove(the_node)
        for node in graph:
            if the_node in node.edges:
                node.edges.remove(the_node)

    return graph


def remove_edge(graph):

    redraw_graph(graph)
    print_header('Indicate the origin of the edge')
    node_a = gimmie_input(DISCONNECT)

    redraw_graph(graph)
    print_header('Indicate the destination of the edge')
    node_b = gimmie_input(DISCONNECT)

    node_origin = get_node(graph, node_a)
    node_destin = get_node(graph, node_b)

    # Check that both nodes exists and that the EDGE ITSELFT exist
    if (node_origin is None) or (node_destin is None) or (node_destin not in node_origin.edges):
        print_sign('Something went wrong :(')
    else:
        node_origin.edges.remove(node_destin)

    return graph


# ---------------------------------------------- GENESIS OF THE GRAPH

def create_graph():
    """Welcome screen: collect numbers until Enter is pressed alone, then build the graph."""
    DISPLAYSURF.fill(BACKGROUND_COLOR)

    title_font = pygame.font.Font('freesansbold.ttf', 36)
    subtitle_font1 = pygame.font.Font('freesansbold.ttf', 24)
    subtitle_font2 = pygame.font.Font('freesansbold.ttf', 22)
    hint_font = pygame.font.Font('freesansbold.ttf', 20)

    title_surf = title_font.render("Type numbers (or letters) to build your graph, node by node", True, WHITE)
    subtitle_surf1 = subtitle_font1.render("To add a node, the first element is the data of the node, the rest are the edges", True, WHITE)
    subtitle_surf2 = subtitle_font2.render("For example: to add a node 1 connected with 2 and 3, enter 1 2 3 and then press Enter", True, WHITE)
    hint_surf = hint_font.render("Press Enter alone when you're done", True, GREEN)

    DISPLAYSURF.blit(title_surf, title_surf.get_rect(center=(HALF_WIDTH, HALF_HEIGHT - 140)))
    DISPLAYSURF.blit(subtitle_surf1, subtitle_surf1.get_rect(center=(HALF_WIDTH, HALF_HEIGHT - 60)))
    DISPLAYSURF.blit(subtitle_surf2, subtitle_surf2.get_rect(center=(HALF_WIDTH, HALF_HEIGHT)))
    DISPLAYSURF.blit(hint_surf, hint_surf.get_rect(center=(HALF_WIDTH, HALF_HEIGHT + 60)))
    pygame.display.update()

    nodes_data = []
    while True:
        one_node = gimmie_input()
        if one_node == "":
            break
        one_node = [n.strip() for n in one_node.split()]
        nodes_data.append(one_node)

        # Give feedback: show how many nodes are queued
        feedback_font = pygame.font.Font('freesansbold.ttf', 20)
        feedback_surf = feedback_font.render(f"Future graph: {nodes_data}", True, LIGHT_BLUE)
        feedback_rect = feedback_surf.get_rect(center=(HALF_WIDTH, HALF_HEIGHT + 130))
        pygame.draw.rect(DISPLAYSURF, BLACK, feedback_rect.inflate(10, 10))  # clear old text
        DISPLAYSURF.blit(feedback_surf, feedback_rect)
        pygame.display.update()

    # Build and draw a sketch of the graph
    graph = make_graph(nodes_data)
    redraw_graph(graph)

    return graph


def gimmie_input(some_placeholder=None):
    """It receives data from the keyboard until the user presses Enter."""

    input_str = ""
    input_font = pygame.font.Font('freesansbold.ttf', 36)
    box_rect = pygame.Rect(100, SCREEN_HEIGHT - 110, SREEN_WIDTH - 200, 60)

    if some_placeholder is not None:
        place_texts = {ADD: "Add a node",
                       CONNECT: "Add an edge",
                       REMOVE: "Remove a node",
                       DISCONNECT: "Remove an edge",
                       SELECT_INITIAL_NODE: "Select the initial node"
                       }
        place_font = pygame.font.Font('freesansbold.ttf', 20)
        place_surf = place_font.render(place_texts[some_placeholder], True, GREY)
        place_rect = place_surf.get_rect(center=(HALF_WIDTH, SCREEN_HEIGHT - 80))

    while True:
        for event in pygame.event.get():
            if event.type == QUIT:
                quit_program()
            if event.type == KEYDOWN:
                if event.unicode.isalnum() or event.key == K_SPACE:
                    input_str += event.unicode
                elif event.key == K_BACKSPACE:
                    input_str = input_str[:-1]
                elif event.key in (K_RETURN, K_KP_ENTER):
                    return input_str.strip()

        # Redraw the input box every frame
        pygame.draw.rect(DISPLAYSURF, WHITE, box_rect)
        text_surf = input_font.render(input_str, True, BLACK)
        text_rect = text_surf.get_rect(center=box_rect.center)
        DISPLAYSURF.blit(text_surf, text_rect)
        if (len(input_str) == 0) and (some_placeholder is not None):
            DISPLAYSURF.blit(place_surf, place_rect)
        pygame.display.update()
        FPSCLOCK.tick(FPS)


def make_graph(nodes_data):

    graph = []
    
    if len(nodes_data) == 0:
        return graph
    
    # Clean the input a little bit (remove duplicates, add missing nodes, sort by value, etc.)
    all_the_nodes = []
    for nodes in nodes_data:
        all_the_nodes.extend(nodes)
    
    all_the_nodes = set(all_the_nodes)

    nodes_data_clean = {}
    for node in all_the_nodes:
        nodes_data_clean[node] = []

    for node, edges in nodes_data_clean.items():
        for dirty_node in nodes_data:
            if node == dirty_node[0]:
                edges.extend(dirty_node[1:])
    
    for node in nodes_data_clean:
        nodes_data_clean[node] = list(dict.fromkeys(nodes_data_clean[node]))

    if all_numeric(nodes_data_clean):
        nodes_data_clean = dict(sorted(nodes_data_clean.items(), key=lambda item: int(item[0])))
    else:
        nodes_data_clean = dict(sorted(nodes_data_clean.items(), key=lambda item: item[0]))

    # Prepare the analytical geometry stuff
    radius = 200
    h, k = HALF_WIDTH, HALF_HEIGHT
    angle_of_sep = (2*math.pi) / len(nodes_data_clean)

    # Create and set the basic data for each node
    for i, (n_data, n_edges) in enumerate(nodes_data_clean.items(), 0):
        this_angle = i*angle_of_sep + math.pi
        pos_x = h + radius*math.cos(this_angle)
        pos_y = k + radius*math.sin(this_angle)
        new_node = GraphNode(n_data, n_edges, pos_x, pos_y)
        graph.append(new_node)

    # Update the edges with their actual values (they should be a pointer to another node)
    for node in graph:
        previous_edges = node.edges
        actual_edges = []
        
        for p_edge in previous_edges:
            a_edge = get_node(graph, p_edge)
            if a_edge is not None:
                actual_edges.append(a_edge)
        
        node.edges = actual_edges

    return graph


def get_node(graph, p_edge):
    for node in graph:
        if node.data == p_edge:
            return node
    return None


def all_numeric(some_dict):
    for k in some_dict.keys():
        if k.isnumeric() == False:
            return False
    return True


# --------------------------------------------- ANALYTICAL MODE STUFF

def get_initial_node(graph):
    
    initial_node = gimmie_input(SELECT_INITIAL_NODE)
    the_node = get_node(graph, initial_node)

    while the_node is None:
        print_sign('You have to select a VALID initial node')
        redraw_graph(graph)
        initial_node = gimmie_input(SELECT_INITIAL_NODE)
        the_node = get_node(graph, initial_node)
    
    return initial_node


def dfs(graph, initial_node):
    
    # For good measure, it's a good idea to always check that the initial node exist
    first_node = get_node(graph, initial_node)

    if first_node is None:
        print_sign('You have to select an initial node')
    else:
        visited = []
        dfs_helper(graph, visited, first_node)

        for _ in range(4):
            pygame.time.wait(500)


def dfs_helper(graph, visited, next_node):
    
    highlith_node(next_node)
    visited.append(next_node)

    for ed in next_node.edges:
        if ed not in visited:
            dfs_helper(graph, visited, ed)


def bfs(graph, initial_node):
    first_node = get_node(graph, initial_node)

    if first_node is None:
        print_sign('You have to select an initial node')
    else:
        visited = [first_node]
        queue = [first_node]

        while len(queue) > 0:
            current_node = queue.pop(0)
            highlith_node(current_node)

            for ed in current_node.edges:
                if ed not in visited:
                    visited.append(ed)
                    queue.append(ed)


        for _ in range(4):
            pygame.time.wait(500)


# -------------------------------------------------- SCREENSHOT STUFF

def take_screenshot(graph):
    redraw_graph(graph)
    screenshot_path = SCREENSHOT_DIR / f"graph_{get_next_index()}.png"
    pygame.image.save(DISPLAYSURF, screenshot_path)


def get_next_index():
    """Search the SCREENSHOT_DIR directory and return the next corresponding index."""

    # Get a list of filenames as strings
    filenames = [item.name for item in SCREENSHOT_DIR.iterdir() if item.is_file()]
    
    # We initialize the list of indexes with a zero, in case the directory is empty
    index_found = [0]

    # From each filename of a graph screenshot, we took the number (index)
    for filename in filenames:
        if isGraphRegex.search(filename):
            index_found.append(int(filename[6:(len(filename) - 4)]))
    
    return max(index_found) + 1


if __name__ == '__main__':
    main()
