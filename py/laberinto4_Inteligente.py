import random, pygame, sys
from pygame.locals import *
from laberinto0 import *


"""
LOS LABERINTOS COMO PUERTA DE ENTRADA A LA INTELIGENCIA ARTIFICAL

Aquí, el laberinto se resuelve solo (quiero decir, sin su ayuda). Aquí lo resuelven dos algoritmos: depth-first search (DFS) y breadth-first search (BFS).
El objetivo de este programa, es mostrar, de forma animada, cómo se comporta cada algoritmo en la misma situación, para poder compararlos.
Ambos algoritmos se ejecutan en los 5 tipos de laberintos existentes en laberinto0.py.

Algunas aclaraciones:

    1) Esto no es una implementación clásica. Es una implementación libre y adaptada a estos laberintos. Sin embargo, creo
        que resulta interesante para adentrarse en el tema.

    2) Una solución del laberinto se entiende como un camino que vaya desde el punto inicial hasta la meta (el cuadrado blanco).

    3) Para que se noten mejor las diferencias entre los dos algoritmos, en cada laberinto existen varias soluciones posibles.

"""


FPS = 24

BORDE = 4
DOBLEBORDE = BORDE * 2
ANCHO_LIENZO = 1000
ALTO_LIENZO = 600
ANCHO_PANTALLA = ANCHO_LIENZO + DOBLEBORDE
ALTO_PANTALLA = ALTO_LIENZO + DOBLEBORDE

assert ((BORDE % 2) == 0) and ((ANCHO_LIENZO % 2) == 0) and ((ALTO_LIENZO % 2) == 0), 'Convendría que las dimensiones sean números pares'

TAM_LADOS = [100, 100, 50, 50, 50]
CANT_NIVELES = len(TAM_LADOS)

for lado in TAM_LADOS:
    assert ((ALTO_LIENZO % lado) == 0) and ((ANCHO_LIENZO % lado) == 0), 'Convendría que las dimensiones del lienzo sean divisibles por el tamaño del lado del cuadrado'


COLOR_FONDO =   ( 20,  20,  20)
ALPHA_FONDO =   ( 20,  20,  20, 120)
COLOR_PARED =   ( 50, 200,  50)
COLOR_JUGADOR = (240, 200, 100)
COLOR_LLEGADA = (250, 250, 250)
COLOR_SOLUCION = (250, 160, 30)

ARRIBA = 'arriba'
ABAJO = 'abajo'
IZQUIERDA = 'izquierda'
DERECHA = 'derecha'


def main():
    global FPSCLOCK, DISPLAYSURF, LADO, N_FILAS, N_COLUMNAS, JUGADOR_RADIO, JUGADOR_DIAMETRO, FUENTE_TITULO, FUENTE_COMUN
    pygame.init()
    FPSCLOCK = pygame.time.Clock()
    DISPLAYSURF = pygame.display.set_mode((ANCHO_PANTALLA, ALTO_PANTALLA))
    pygame.display.set_caption('Laberinto')
    FUENTE_TITULO = pygame.font.Font('freesansbold.ttf', 32)
    FUENTE_COMUN = pygame.font.Font('freesansbold.ttf', 26)

    activarMultisalida()

    for nivel in range(len(TAM_LADOS)):

        chequearCierreDelPrograma()

        # Cada nivel o escenario tiene distinto tamaño, por eso se definen algunas dimensiones según el nivel.
        LADO, N_FILAS, N_COLUMNAS, JUGADOR_RADIO, JUGADOR_DIAMETRO = prepararEscenario((nivel), TAM_LADOS, ALTO_LIENZO, ANCHO_LIENZO)
        compartirGlobales(DISPLAYSURF, N_FILAS, N_COLUMNAS, BORDE, LADO, ANCHO_PANTALLA, ALTO_PANTALLA, COLOR_FONDO, COLOR_PARED, FPSCLOCK, FPS)
        # Asimismo, se genera un tipo de laberinto particular según el nivel.
        # Algo particular de este programa, es que genera laberintos más "abiertos" que los anteriores (ver la función generarLados()).
        # El objetivo de esto, es que haya más de una solución posible en cada laberinto, lo cual permite evidenciar un poco
        # las ventajas y las desventajas de cada algorimo (ya sea el DFS o el BFS)
        lab = generarLaberinto(nivel)
        # Se elige un punto final (más o menos) aleatorio, por la misma razón recién mencionada.
        finalFil, finalCol = random.randint(3, N_FILAS - 1), random.randint(3, N_COLUMNAS - 1)
        # Se inicializan los "contadores" o "estadísticas" de cada algoritmo
        DFStotal, DFSsolucion, BFStotal, BFSsolucion = 0, 0, 0, 0

        # La búsqueda se realiza dos veces: primero al estilo DFS (tipo_de_busqueda == 0), después al estilo BFS (tipo_de_busqueda == 1)
        for tipo_de_busqueda in range(2):
            chequearCierreDelPrograma()
            # Se inizializan alguas cosas básicas, como la posición del "jugador" o "buscador" y su "conocimiento inicial":
            # la distancia al lugar de origen es 0 (porque ya empieza en su lugar de origen),
            # el diccionario por_analizar simplemente contiene su lugar inicial
            # y el diccionario ya_conocido (encargado de registrar lo que ya se analizó) empieza vacío 
            posX, posY, posFil, posCol, finalX, finalY, distancia, por_analizar, ya_conocido = armarEscenario(lab, finalFil, finalCol)
            # Hasta no llegar a destino, se siguen buscando nuevos lugares para ser analizados.
            # En este contexto, ser analizado significa básicamente chequear si un luegar es o no es el destino final.
            while not (posFil == finalFil and posCol == finalCol):
                chequearCierreDelPrograma()
                del por_analizar[(posFil, posCol)]
                ya_conocido[(posFil, posCol)] = distancia

                if (posFil > 0):
                    if (not ARRIBA in lab[posFil][posCol][1]) and (not ABAJO in lab[posFil-1][posCol][1]) and (not (posFil - 1, posCol) in ya_conocido):
                        por_analizar[(posFil - 1, posCol)] = distancia + 1
                if (posFil < (N_FILAS - 1)):
                    if (not ABAJO in lab[posFil][posCol][1]) and (not ARRIBA in lab[posFil+1][posCol][1]) and (not (posFil + 1, posCol) in ya_conocido):
                        por_analizar[(posFil + 1, posCol)] = distancia + 1
                if (posCol > 0):
                    if (not IZQUIERDA in lab[posFil][posCol][1]) and (not DERECHA in lab[posFil][posCol-1][1]) and (not (posFil, posCol - 1) in ya_conocido):
                        por_analizar[(posFil, posCol - 1)] = distancia + 1
                if (posCol < (N_COLUMNAS - 1)):
                    if (not DERECHA in lab[posFil][posCol][1]) and (not IZQUIERDA in lab[posFil][posCol+1][1]) and (not (posFil, posCol + 1) in ya_conocido):
                        por_analizar[(posFil, posCol + 1)] = distancia + 1

                if tipo_de_busqueda == 0:
                    proximo = list(por_analizar.items())[-1] # Se toma el último que se agregó, tipo un stack. Esto hace que sea DFS
                else:
                    proximo = next(iter(por_analizar.items())) # Se toma el primero que hay, tipo una queue. Esto hace que sea BFS

                posFil, posCol, distancia = proximo[0][0], proximo[0][1], proximo[1]
                posX, posY = mover(posX, posY, posFil, posCol, COLOR_JUGADOR)

            ya_conocido[(posFil, posCol)] = distancia
            total = len(ya_conocido) - 1
            camino = procesarRecorrido(ya_conocido, lab)
            caminarSolucion(camino)

            if tipo_de_busqueda == 0:
                DFStotal, DFSsolucion = total, len(camino)
            else:
                BFStotal, BFSsolucion = total, len(camino)

        presentarResultados(lab, posX, posY, DFStotal, DFSsolucion, BFStotal, BFSsolucion)

    cerrarPrograma()




def presentarResultados(lab, posX, posY, DFStotal, DFSsolucion, BFStotal, BFSsolucion):
    pygame.time.wait(1000)
    pares_ordenados = []
    for i in range(N_FILAS):
        for j in range(N_COLUMNAS):
            borrarParedes(i, j)

    pygame.draw.rect(DISPLAYSURF, COLOR_FONDO, (0, 0, ANCHO_PANTALLA, ALTO_PANTALLA))

    alto_rect = 0
    dif = 1
    while (alto_rect < ALTO_PANTALLA):
        chequearCierreDelPrograma()
        alto_rect += dif
        dif += 2
        pygame.draw.rect(DISPLAYSURF, COLOR_PARED, (ANCHO_PANTALLA // 2, 0, BORDE, alto_rect))
        pygame.display.update()
        FPSCLOCK.tick(FPS)
    pygame.time.wait(500)

    textSurfaceObj = FUENTE_TITULO.render("DFS", True, COLOR_LLEGADA)
    textRectObj = textSurfaceObj.get_rect()
    textRectObj.center = (ANCHO_PANTALLA // 4, ALTO_PANTALLA // 4)
    DISPLAYSURF.blit(textSurfaceObj, textRectObj)

    textSurfaceObj = FUENTE_COMUN.render(f"Pasos totales: {DFStotal}", True, COLOR_LLEGADA)
    textRectObj = textSurfaceObj.get_rect()
    textRectObj.center = (ANCHO_PANTALLA // 4, ALTO_PANTALLA // 2 - 30)
    DISPLAYSURF.blit(textSurfaceObj, textRectObj)

    textSurfaceObj = FUENTE_COMUN.render(f"Pasos para llegar a destino: {DFSsolucion}", True, COLOR_LLEGADA)
    textRectObj = textSurfaceObj.get_rect()
    textRectObj.center = (ANCHO_PANTALLA // 4, ALTO_PANTALLA // 2 + 40)
    DISPLAYSURF.blit(textSurfaceObj, textRectObj)

    textSurfaceObj = FUENTE_TITULO.render("BFS", True, COLOR_LLEGADA)
    textRectObj = textSurfaceObj.get_rect()
    textRectObj.center = ((ANCHO_PANTALLA // 4) * 3, ALTO_PANTALLA // 4)
    DISPLAYSURF.blit(textSurfaceObj, textRectObj)

    textSurfaceObj = FUENTE_COMUN.render(f"Pasos totales: {BFStotal}", True, COLOR_LLEGADA)
    textRectObj = textSurfaceObj.get_rect()
    textRectObj.center = ((ANCHO_PANTALLA // 4) * 3, ALTO_PANTALLA // 2 - 30)
    DISPLAYSURF.blit(textSurfaceObj, textRectObj)

    textSurfaceObj = FUENTE_COMUN.render(f"Pasos para llegar a destino: {BFSsolucion}", True, COLOR_LLEGADA)
    textRectObj = textSurfaceObj.get_rect()
    textRectObj.center = ((ANCHO_PANTALLA // 4) * 3, ALTO_PANTALLA // 2 + 40)
    DISPLAYSURF.blit(textSurfaceObj, textRectObj)

    pygame.display.update()
    FPSCLOCK.tick(FPS)
    for _ in range(7):
        chequearCierreDelPrograma()
        pygame.time.wait(1000)


def armarEscenario(lab, finalFil, finalCol):
    # Se dibuja el laberinto
    dibujarLaberinto(lab)
    pygame.time.wait(1000)
    # Se determina la posición inicial del jugador, en pixeles y en la matriz
    posX, posY, posFil, posCol = BORDE + LADO / 2 + 1, BORDE + LADO / 2 + 1, 0, 0
    pygame.draw.circle(DISPLAYSURF, COLOR_JUGADOR, (posX, posY), JUGADOR_RADIO)
    # Se dibuja el punto de llegada
    finalX, finalY = (finalCol * LADO) + JUGADOR_RADIO + BORDE + 1, (finalFil * LADO) + JUGADOR_RADIO + BORDE + 1
    pygame.draw.rect(DISPLAYSURF, COLOR_LLEGADA, (finalX, finalY, JUGADOR_DIAMETRO, JUGADOR_DIAMETRO))
    # Se actualiza la pantalla
    pygame.display.update()
    pygame.time.wait(1000)
    # Se inicializan los elementos necesarios para llevar adelante la búsqueda
    distancia = 0
    por_analizar = {(posFil, posCol): distancia}
    ya_conocido = {}
    return posX, posY, posFil, posCol, finalX, finalY, distancia, por_analizar, ya_conocido


# Hay dos tipos de movimientos: cuando se está explorando (en cuyo caso, el color es COLOR_JUGADOR) y cuando ya se encontró la solución.
# Cuando se está explorando, no se borra el paso anterior, pero sí se lo tapa un poco, como si quedara una huella.
# Cuando se recorre la solución, se deja cada paso bien pintado de naranja y se agrega un conector (una línea) entre los dos pasos.
def mover(posX, posY, posFil, posCol, color):
    antX, antY = posX, posY
    if color == COLOR_JUGADOR:
        rectangle = pygame.Rect(posX - JUGADOR_RADIO, posY - JUGADOR_RADIO, JUGADOR_DIAMETRO, JUGADOR_DIAMETRO)
        origSurf = DISPLAYSURF.copy()
        flashSurf = pygame.Surface((JUGADOR_DIAMETRO, JUGADOR_DIAMETRO))
        flashSurf = flashSurf.convert_alpha()
        DISPLAYSURF.blit(origSurf, (0, 0))
        flashSurf.fill(ALPHA_FONDO)
        DISPLAYSURF.blit(flashSurf, rectangle.topleft)

    posX, posY = (posCol * LADO) + (LADO / 2) + BORDE + 1, (posFil * LADO) + (LADO / 2) + BORDE + 1
    pygame.draw.circle(DISPLAYSURF, color, (posX, posY), JUGADOR_RADIO)

    if color != COLOR_JUGADOR:
        pygame.draw.line(DISPLAYSURF, color, (antX, antY), (posX, posY), DOBLEBORDE)

    pygame.display.update()
    pygame.time.wait(300)
    return posX, posY


# Esta función recibe un diccionario ("ya_conocido") donde cada clave es una posición única (fil, col) y cada valor es algún entero
# que representa la distancia o el número de pasos necesario para llegar hasta ahí (según el camino que se tomó, no necesariamente es la distancia mínima).
# Lo que hace la función es buscar los pasos, desde el final hasta el principio, guardarlos en una lista,
# y luego invertir esa lista para que queden en orden.
# Para buscar los pasos desde el final hasta el principio, busca un cubículo vecino y, una vez que lo encuentra,
# elimina del diccionario aquellos items que tengan esa misma distancia. Repite este proceso hasta que
# la cantidad de pasos sea igual a la distancia a la que se encuentra el objetivo con respecto al punto inicial, o sea, hasta que len(camino) == distancia.
# Esta parte del programa es quizá la única parte que se diferencia de las implementaciones tradicionales de DFS y BFS.
# Pero bueno, lo importante es que esta función recibe el diccionario "ya_conocido" y devuelve la solución del laberinto.
def procesarRecorrido(ya_conocido, lab):
    instancia = ya_conocido.popitem()
    distancia = instancia[1]
    camino = [instancia[0]]
    n_pasos = 0
    while len(camino) < distancia:
        instancia = ya_conocido.popitem()
        if sonVecinos(camino[n_pasos][0], camino[n_pasos][1], instancia[0][0], instancia[0][1], lab):
            camino.append(instancia[0])
            n_pasos += 1
            ya_conocido = {key: value for key, value in ya_conocido.items() if value != instancia[1]}

    camino.reverse()
    return camino


# Para que un paso entre dos puntos sea "legítimo", deben cumplirse dos condiciones:
#   1) los puntos deben estar o bien a una fila o bien a una columna de distancia;
#   2) no debe haber ninguna pared entre ellos.
def sonVecinos(fil1, col1, fil2, col2, lab):
    if (fil1 - fil2 == 1) and (col1 - col2 == 0):
        if (ARRIBA not in lab[fil1][col1][1]) and (ABAJO not in lab[fil2][col2][1]):
            return True
    elif (fil1 - fil2 == -1) and (col1 - col2 == 0):
        if (ABAJO not in lab[fil1][col1][1]) and (ARRIBA not in lab[fil2][col2][1]):
            return True
    elif (fil1 - fil2 == 0) and (col1 - col2 == 1):
        if (IZQUIERDA not in lab[fil1][col1][1]) and (DERECHA not in lab[fil2][col2][1]):
            return True
    elif (fil1 - fil2 == 0) and (col1 - col2 == -1):
        if (DERECHA not in lab[fil1][col1][1]) and (IZQUIERDA not in lab[fil2][col2][1]):
            return True
    else:
        return False


def caminarSolucion(camino):
    posX, posY, posFil, posCol = BORDE + LADO / 2 + 1, BORDE + LADO / 2 + 1, 0, 0
    pygame.draw.circle(DISPLAYSURF, COLOR_SOLUCION, (posX, posY), JUGADOR_RADIO)
    pygame.display.update()
    for paso in camino:
        chequearCierreDelPrograma()
        posX, posY = mover(posX, posY, paso[0], paso[1], COLOR_SOLUCION)
    for _ in range(5):
        chequearCierreDelPrograma()
        pygame.time.wait(1000)


if __name__ == '__main__':
    main()

