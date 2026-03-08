import random, pygame, sys
from pygame.locals import *
from laberinto0 import *


"""
EL NACIMIENTO DE UN LABERINTO

Este programa muestra de forma animada y en etapas cómo se crea cada uno de los cinco tipos de laberintos disponibles en laberinto0.py.
En términos generales, las etapas son:

    1) Se esboza el laberinto, o sea, se generan de manera random las primeras paredes.

    2) Se detectan y numeran los sectores. Si existe más de un sector, significa que quedó fragmentado.

    3) Si hubiera más de un sector (cosa que suele suceder), se unifican hasta que haya uno solo. Esto significa que ahora sí
        tenemos un laberinto de verdad: o sea, que podemos ir de cualquier punto del laberinto a cualquier otro punto.

    4) Se muestra el resultado sin los sectores numerados.

Los cinco tipos u opciones de laberintos son los que se nombran en animacionPresentarOpcion().
Para ver en detalle el código de cada uno, puede ir a laberinto0.py, esbozarLaberinto().
"""


BORDE = 4
DOBLEBORDE = BORDE * 2
MEDIOBORDE = BORDE // 2 - 1
ANCHO_LIENZO = 1000
ALTO_LIENZO = 500
ANCHO_PANTALLA = ANCHO_LIENZO + DOBLEBORDE
ALTO_PANTALLA = ALTO_LIENZO + DOBLEBORDE

assert ((BORDE % 2) == 0) and ((ANCHO_LIENZO % 2) == 0) and ((ALTO_LIENZO % 2) == 0), 'Convendría que las dimensiones sean números pares'

TAM_LADOS = [100, 100, 50, 100, 50]

for lado in TAM_LADOS:
    assert ((ALTO_LIENZO % lado) == 0) and ((ANCHO_LIENZO % lado) == 0), 'Convendría que las dimensiones del lienzo sean divisibles por el tamaño del lado del cuadrado'

COLOR_FONDO = (0, 0, 0)
COLOR_PARED = (50, 200, 50)
COLOR_CONECTOR = (30, 30, 230)
BLANCO = (250, 250, 250)

ARRIBA = 'arriba'
ABAJO = 'abajo'
IZQUIERDA = 'izquierda'
DERECHA = 'derecha'


def main():
    global FPSCLOCK, FPS, DISPLAYSURF, LADO, N_FILAS, N_COLUMNAS
    pygame.init()
    FPSCLOCK = pygame.time.Clock()
    FPS = 24
    DISPLAYSURF = pygame.display.set_mode((ANCHO_PANTALLA, ALTO_PANTALLA))
    pygame.display.set_caption('Laberinto')

    activarAnimacion()

    for opcion in range(len(TAM_LADOS)):
        chequearCierreDelPrograma()
        animacionPresentarOpcion(opcion)
        LADO, N_FILAS, N_COLUMNAS = prepararDimensiones((opcion), TAM_LADOS, ALTO_LIENZO, ANCHO_LIENZO)
        compartirGlobales(DISPLAYSURF, N_FILAS, N_COLUMNAS, BORDE, LADO, ANCHO_PANTALLA, ALTO_PANTALLA, COLOR_FONDO, COLOR_PARED, FPSCLOCK, FPS)
        generarOpcion(opcion)
        FPS += 12

    cerrarPrograma()



def animacionPresentarOpcion(opcion):
    descripcion_opcion = ["Por filas",
                         "Fila superior, fila inferior, columna izquierda, columna derecha",
                         "Desde las columnas del medio hacia los costados (con tres filas intercaladas)",
                         "Se completan todos los cudrados y luego se aplica el algoritmo para unir sectores",
                         "En espiral desde el centro, y después se rellena el perímetro"]

    pygame.time.wait(500)
    alto_rect = 0
    dif = 1
    while (alto_rect < ((ALTO_PANTALLA // 2) - 50)):
        chequearCierreDelPrograma()
        alto_rect += dif
        dif += 2
        pygame.draw.rect(DISPLAYSURF, COLOR_PARED, (0, (ALTO_PANTALLA // 4), ANCHO_PANTALLA, alto_rect))
        pygame.display.update()
        FPSCLOCK.tick(FPS)
    pygame.time.wait(500)

    fontObj = pygame.font.Font('freesansbold.ttf', 26)
    textSurfaceObj = fontObj.render(f"Opción {opcion}", True, BLANCO)
    textRectObj = textSurfaceObj.get_rect()
    textRectObj.center = (ANCHO_PANTALLA // 2, ALTO_PANTALLA // 2 - 50)
    DISPLAYSURF.blit(textSurfaceObj, textRectObj)
    fontObj = pygame.font.Font('freesansbold.ttf', 24)
    textSurfaceObj = fontObj.render(f"{descripcion_opcion[opcion]}", True, BLANCO)
    textRectObj = textSurfaceObj.get_rect()
    textRectObj.center = (ANCHO_PANTALLA // 2, ALTO_PANTALLA // 2 + 10)
    DISPLAYSURF.blit(textSurfaceObj, textRectObj)

    pygame.display.update()
    for _ in range(5):
        chequearCierreDelPrograma()
        pygame.time.wait(1000)
    pygame.draw.rect(DISPLAYSURF, COLOR_FONDO, (0, 0, ANCHO_PANTALLA, ALTO_PANTALLA))
    pygame.display.update()


def generarOpcion(opcion):
    laberinto = generarLaberinto(opcion)
    for _ in range(4):
        chequearCierreDelPrograma()
        pygame.time.wait(1000)
    dibujarLaberinto(laberinto)
    for _ in range(5):
        chequearCierreDelPrograma()
        pygame.time.wait(1000)
    borrarLaberinto(laberinto)



if __name__ == '__main__':
    main()

