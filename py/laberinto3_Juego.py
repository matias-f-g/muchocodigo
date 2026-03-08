import random, pygame, sys
from pygame.locals import *
from laberinto0 import *


"""
ESCAPE IMPERFECTO

El objetivo del juego es resolver el laberinto, o sea, encontrar el camino desde el inicio (arriba a la izquierda), hasta la meta (un cuadrado blanco).
Para lograrlo, el jugador debe ir desplázandose con las flechitas y sortear los diversos obstáculos que se le presenten.
Hay 5 niveles, numerados del 0 al 4.
"""


FPS = 48

BORDE = 4
DOBLEBORDE = BORDE * 2
ANCHO_LIENZO = 1200
ALTO_LIENZO = 600
ANCHO_PANTALLA = ANCHO_LIENZO + DOBLEBORDE
ALTO_PANTALLA = ALTO_LIENZO + DOBLEBORDE

assert ((BORDE % 2) == 0) and ((ANCHO_LIENZO % 2) == 0) and ((ALTO_LIENZO % 2) == 0), 'Convendría que las dimensiones sean números pares'

TAM_LADOS = [100, 50, 50, 20, 10]
CANT_NIVELES = len(TAM_LADOS)

for lado in TAM_LADOS:
    assert ((ALTO_LIENZO % lado) == 0) and ((ANCHO_LIENZO % lado) == 0), 'Convendría que las dimensiones del lienzo sean divisibles por el tamaño del lado del cuadrado'

CANT_NUBES = [11, 15, 20, 25, 30] # Cantidad de nubes por nivel (si en algún nivel no querés nubes, ponele 0)
NIVELES_CON_LAVA = [1, 2, 3, 4] # Niveles donde hay lava
NIVELES_CON_PASADIZO = [1, 3] # Niveles donde hay algún pasadizo
NIVELES_CON_FALSAS = [2] # Niveles donde hay paredes falsas
NIVELES_CON_VISION_REDUCIDA = [0, 0, 0, 0, 12] # Niveles con rango de visión reducido.
                                               # Si VISION == 0, la visión reducida está desactivada (o sea, la visión es normal, completa).
                                               # Si VISION es algún número positivo, esa es la cantidad de cubículos que se ven.
                                               # Por ejemplo: si VISION == 12, entonces el jugador verá un área de 12 x 12 alrededor suyo.

assert len(CANT_NUBES) == CANT_NIVELES, 'Te faltan definir las nubes de algún nivel'
assert len(NIVELES_CON_VISION_REDUCIDA) == CANT_NIVELES, 'Te faltan definir la visión de algún nivel'
for vision in NIVELES_CON_VISION_REDUCIDA:
    assert (vision % 2 == 0), 'El rango de la visión debería ser un número par (si no, fallan las cuentas)'


COLOR_FONDO = (20, 20, 20)
COLOR_PARED = (50, 200, 50)
COLOR_JUGADOR = (240, 200, 100)
COLOR_LLEGADA = (250, 250, 250)

ARRIBA = 'arriba'
ABAJO = 'abajo'
IZQUIERDA = 'izquierda'
DERECHA = 'derecha'


def main():
    global FPSCLOCK, DISPLAYSURF, BASESURF, FUENTE_COMUN, LADO, N_FILAS, N_COLUMNAS, J_RADIO, J_DIAMETRO, NUBES, LAVA, PASADIZO, FALSAS, VISION
    pygame.init()
    FPSCLOCK = pygame.time.Clock()
    DISPLAYSURF = pygame.display.set_mode((ANCHO_PANTALLA, ALTO_PANTALLA))
    pygame.display.set_caption('Laberinto')
    FUENTE_COMUN = pygame.font.Font('freesansbold.ttf', 32)

    animacionPresentarJuego()

    nivel = 0
    animacionPresentarNivel(nivel)
    BASESURF, LADO, N_FILAS, N_COLUMNAS, J_RADIO, J_DIAMETRO, lab, posX, posY, posFil, posCol, metaX, metaY, metaFil, metaCol, cnc = generarNivel(nivel)
    NUBES, LAVA, PASADIZO, FALSAS, VISION = agregarDificultades(nivel, cnc)

    while True:

        chequearCierreDelPrograma()

        if nivel in NIVELES_CON_LAVA:
            if haMuerto(posFil, posCol):
                animacionPerdedora(lab)
                BASESURF, LADO, N_FILAS, N_COLUMNAS, J_RADIO, J_DIAMETRO, lab, posX, posY, posFil, posCol, metaX, metaY, metaFil, metaCol, cnc = generarNivel(nivel)
                NUBES, LAVA, PASADIZO, FALSAS, VISION = agregarDificultades(nivel, cnc)
            if (random.randint(1, 80) == 40):
                hubo_ampliacion = ampliarLava(lab)
                if not hubo_ampliacion:
                    LAVA = crearLava()
        
        if nivel in NIVELES_CON_PASADIZO:
            if pisaPasadizo(posFil, posCol):
                PASADIZO, posFil, posCol, posX, posY = tomarPasadizo(posFil, posCol, PASADIZO)

        keys = pygame.key.get_pressed()

        if (keys[pygame.K_UP] or keys[pygame.K_DOWN] or keys[pygame.K_LEFT] or keys[pygame.K_RIGHT]):
            if (keys[pygame.K_UP]) and (posFil > 0):
                if (not ARRIBA in lab[posFil][posCol][1]) and (not ABAJO in lab[posFil-1][posCol][1]):
                    posX, posY, posFil, posCol = mover(posX, posY, posFil, posCol, ARRIBA)
            elif (keys[pygame.K_DOWN]) and (posFil < (N_FILAS - 1)):
                if (not ABAJO in lab[posFil][posCol][1]) and (not ARRIBA in lab[posFil+1][posCol][1]):
                    posX, posY, posFil, posCol = mover(posX, posY, posFil, posCol, ABAJO)
            elif (keys[pygame.K_LEFT]) and (posCol > 0):
                if (not IZQUIERDA in lab[posFil][posCol][1]) and (not DERECHA in lab[posFil][posCol-1][1]):
                   posX, posY, posFil, posCol = mover(posX, posY, posFil, posCol, IZQUIERDA)
            elif (keys[pygame.K_RIGHT]) and (posCol < (N_COLUMNAS - 1)):
                if (not DERECHA in lab[posFil][posCol][1]) and (not IZQUIERDA in lab[posFil][posCol+1][1]):
                    posX, posY, posFil, posCol = mover(posX, posY, posFil, posCol, DERECHA)

            if posFil == metaFil and posCol == metaCol:
                nivel += 1
                animacionGanadora(lab, posX, posY, nivel)
                if nivel < CANT_NIVELES:
                    animacionPresentarNivel(nivel)
                    BASESURF, LADO, N_FILAS, N_COLUMNAS, J_RADIO, J_DIAMETRO, lab, posX, posY, posFil, posCol, metaX, metaY, metaFil, metaCol, cnc = generarNivel(nivel)
                    NUBES, LAVA, PASADIZO, FALSAS, VISION = agregarDificultades(nivel, cnc)
                else:
                    cerrarPrograma()
 
        actualizarTodo(posFil, posCol, posX, posY)
        FPSCLOCK.tick(FPS)



def generarNivel(nivel):
    LADO, N_FILAS, N_COLUMNAS, J_RADIO, J_DIAMETRO = prepararEscenario(nivel, TAM_LADOS, ALTO_LIENZO, ANCHO_LIENZO)

    # El nivel 3 es el único cuya meta (o destino final) no se encuentra abajo a la derecha
    if nivel != 3:
        metaFil, metaCol = N_FILAS - 1, N_COLUMNAS - 1
    else:
        metaFil, metaCol = random.randint(N_FILAS - 4, N_FILAS - 1), random.randint((N_COLUMNAS // 2) - 4, (N_COLUMNAS // 2) + 4)

    compartirGlobales(DISPLAYSURF, N_FILAS, N_COLUMNAS, BORDE, LADO, ANCHO_PANTALLA, ALTO_PANTALLA, COLOR_FONDO, COLOR_PARED, FPSCLOCK, FPS)

    cnc = [] # cnc es para guardar los conectores, en caso de que hagan falta para pintar las paredes falsas
    if nivel in NIVELES_CON_FALSAS:
        lab, cnc = generarLabConConec(nivel)
    else:
        lab = generarLaberinto(nivel)

    # Dibuja el laberinto sin actualizar DISPLAYSURF (esto evita que cuando hay visión reducida, se vea momentáneamente todo el laberinto)
    dibujarLaberinto(lab, False)

    posX, posY, posFil, posCol = BORDE + LADO // 2 + 1, BORDE + LADO // 2 + 1, 0, 0
    metaX, metaY = (metaCol * LADO) + J_RADIO + BORDE + 1, (metaFil * LADO) + J_RADIO + BORDE + 1
    
    # El nivel 3 es el único cuya meta (o destino final) es invisible
    if nivel != 3:
        pygame.draw.rect(DISPLAYSURF, COLOR_LLEGADA, (metaX, metaY, J_DIAMETRO, J_DIAMETRO))

    # BASESURF es la imagen de todo el laberinto (con la meta, y sin el jugador)
    BASESURF = DISPLAYSURF.copy()

    return BASESURF, LADO, N_FILAS, N_COLUMNAS, J_RADIO, J_DIAMETRO, lab, posX, posY, posFil, posCol, metaX, metaY, metaFil, metaCol, cnc


def agregarDificultades(nivel, conectores):
    NUBES = crearNubes(CANT_NUBES[nivel])
    if nivel in NIVELES_CON_LAVA:
        LAVA = crearLava()
    else:
        LAVA = []
    if nivel in NIVELES_CON_PASADIZO:
        PASADIZO = crearPasadizo()
    else:
        PASADIZO = []
    if nivel in NIVELES_CON_FALSAS:
        FALSAS = conectores
    else:
        FALSAS = []
    VISION = NIVELES_CON_VISION_REDUCIDA[nivel]
    return NUBES, LAVA, PASADIZO, FALSAS, VISION


def crearNubes(cant_nubes):
    nubes = []
    for _ in range(cant_nubes):
        nubeX, nubeY = random.randint(0, ANCHO_LIENZO), random.randint(0, ALTO_LIENZO)
        ladoNube = random.randint(LADO // 4, LADO * 2)
        tonoNube = random.randint(100, 220)
        colorNube = (tonoNube + random.randint(-5, 5), tonoNube, tonoNube + random.randint(-5, 5))
        nubes.append([nubeX, nubeY, ladoNube, colorNube])
    return nubes


def crearLava():
    lava = []
    lavaFil, lavaCol = random.randint(1, (N_FILAS - 2)), random.randint(1, (N_COLUMNAS - 4))
    lava.append([lavaFil, lavaCol])
    return lava


def crearPasadizo():
    pasadizo = []
    pasaFil, pasaCol = random.randint(2, (N_FILAS // 2)), random.randint(2, (N_COLUMNAS // 2))
    pasadizo.append([pasaFil, pasaCol])
    pasaFil, pasaCol = random.randint((N_FILAS // 2), (N_FILAS - 1)), random.randint((N_COLUMNAS // 2), (N_COLUMNAS - 2))
    pasadizo.append([pasaFil, pasaCol])
    return pasadizo


def pisaPasadizo(posFil, posCol):
    for pasaFil, pasaCol in PASADIZO:
        if pasaFil == posFil and pasaCol == posCol:
            return True
    return False


def tomarPasadizo(posFil, posCol, pasadizo):
    pasadizo.remove([posFil, posCol])
    posFil, posCol = pasadizo[0]
    PASADIZO = crearPasadizo()
    posX, posY = BORDE + LADO // 2 + 1 + (posCol * LADO), BORDE + LADO // 2 + 1 + (posFil * LADO)
    actualizarTodo(posFil, posCol, posX, posY)
    return PASADIZO, posFil, posCol, posX, posY


def ampliarLava(lab):
    cant_lavas = len(LAVA)
    i, j = LAVA[-1]
    if (ARRIBA not in lab[i][j][1]) and (ABAJO not in lab[i - 1][j][1]) and ([i - 1, j] not in LAVA):
        lavaFil, lavaCol = i - 1, j
        LAVA.append([lavaFil, lavaCol])
    if (ABAJO not in lab[i][j][1]) and (ARRIBA not in lab[i + 1][j][1]) and ([i + 1, j] not in LAVA):
        lavaFil, lavaCol = i + 1, j
        LAVA.append([lavaFil, lavaCol])
    if (IZQUIERDA not in lab[i][j][1]) and (DERECHA not in lab[i][j - 1][1]) and ([i, j - 1] not in LAVA):
        lavaFil, lavaCol = i, j - 1
        LAVA.append([lavaFil, lavaCol])
    if (DERECHA not in lab[i][j][1]) and (IZQUIERDA not in lab[i][j + 1][1]) and ([i, j + 1] not in LAVA):
        lavaFil, lavaCol = i, j + 1
        LAVA.append([lavaFil, lavaCol])
    return (cant_lavas != len(LAVA))


def haMuerto(posFil, posCol):
    for lavaFil, lavaCol in LAVA:
        if lavaFil == posFil and lavaCol == posCol:
            return True
    return False


def actualizarTodo(posFil, posCol, posX, posY):
    baseSurf = BASESURF.copy()

    for i in range(len(LAVA)):
        lavaFil, lavaCol = LAVA[i]
        arIzX, arIzY = lavaCol * LADO + DOBLEBORDE, lavaFil * LADO + DOBLEBORDE
        colorLava = (random.randint(240, 255), random.randint(30, 90), random.randint(0, 30))
        pygame.draw.rect(baseSurf, colorLava, (arIzX, arIzY, LADO - DOBLEBORDE, LADO - DOBLEBORDE))

    for i in range(len(PASADIZO)):
        pasaFil, pasaCol = PASADIZO[i]
        arIzX, arIzY = pasaCol * LADO + DOBLEBORDE, pasaFil * LADO + DOBLEBORDE
        colorPasa = (random.randint(0, 25), random.randint(0, 25), random.randint(190, 230))
        pygame.draw.rect(baseSurf, colorPasa, (arIzX, arIzY, LADO - DOBLEBORDE, LADO - DOBLEBORDE))

    for i in range(len(FALSAS)):
        paredFil, paredCol, pared = FALSAS[i]
        baseSurf = dibujarParedFalsa(paredFil, paredCol, pared, baseSurf)

    pygame.draw.circle(baseSurf, COLOR_JUGADOR, (posX, posY), J_RADIO)

    for i in range(len(NUBES)):
        nubeX, nubeY, ladoNube, colorNube = NUBES[i]
        nubeX, nubeY = nubeX + random.randint(-3, 3), nubeY + random.randint(-3, 3)
        NUBES[i][0], NUBES[i][1] = nubeX, nubeY
        pygame.draw.rect(baseSurf, colorNube, (nubeX, nubeY, ladoNube, ladoNube))

    DISPLAYSURF.blit(baseSurf, (0, 0))

    if VISION != 0:
        visionReducida(posFil, posCol)

    pygame.display.update()


def dibujarParedFalsa(i, j, pared, baseSurf):
    arIx, arIy = j * LADO + BORDE, i * LADO + BORDE
    abIx, abIy = arIx, arIy + LADO
    arDx, arDy = arIx + LADO, arIy
    abDx, abDy = arDx, abIy
    if pared == ARRIBA:
        pygame.draw.line(baseSurf, COLOR_PARED, (arIx, arIy), (arDx, arDy), BORDE)
    elif pared == ABAJO:
        pygame.draw.line(baseSurf, COLOR_PARED, (abIx, abIy), (abDx, abDy), BORDE)
    elif pared == IZQUIERDA:
        pygame.draw.line(baseSurf, COLOR_PARED, (arIx, arIy), (abIx, abIy), BORDE)
    else:
        pygame.draw.line(baseSurf, COLOR_PARED, (arDx, arDy), (abDx, abDy), BORDE)
    return baseSurf


def visionReducida(posFil, posCol):
    arIx, arIy = posCol * LADO + BORDE, posFil * LADO + BORDE

    rango_vision = VISION
    mitad_rango = rango_vision // 2

    if (posCol < mitad_rango):
        recX = arIx - LADO * (posCol)
    elif (posCol >= mitad_rango) and (posCol <= (N_COLUMNAS - mitad_rango)):
        recX = arIx - LADO * mitad_rango
    else:
        for x in range(1, mitad_rango):
            if (posCol == (N_COLUMNAS - x)):
                recX = arIx - (LADO * (rango_vision - x))
    
    if (posFil < mitad_rango):
        recY = arIy - LADO * posFil
    elif (posFil >= mitad_rango) and (posFil <= (N_FILAS - mitad_rango)):
        recY = arIy - LADO * mitad_rango
    else:
        for x in range(1, mitad_rango):
            if (posFil == (N_FILAS - x)):
                recY = arIy - (LADO * (rango_vision - x))
        
    copiaSurf = DISPLAYSURF.copy()
    area_recorte = pygame.Rect(recX, recY, ((LADO * rango_vision) + BORDE), (LADO * rango_vision) + BORDE)
    recorte = copiaSurf.subsurface(area_recorte)
    DISPLAYSURF.fill(COLOR_FONDO)
    DISPLAYSURF.blit(recorte, (recX, recY))


def mover(posX, posY, posFil, posCol, dire):
    baseSurf = BASESURF.copy()
    antX, antY = posX, posY
    sub_pasos = 4
    tramo = LADO // sub_pasos

    for _ in range(sub_pasos - 1):
        if dire == ARRIBA:
            posY -= tramo
        elif dire == ABAJO:
            posY += tramo
        elif dire == IZQUIERDA:
            posX -= tramo
        else:
            posX += tramo
        actualizarTodo(posFil, posCol, posX, posY)
        FPSCLOCK.tick(FPS)

    if dire == ARRIBA:
        posY = antY - LADO
        posFil -= 1
    elif dire == ABAJO:
        posY = antY + LADO
        posFil += 1
    elif dire == IZQUIERDA:
        posX = antX - LADO
        posCol -= 1
    else:
        posX = antX + LADO
        posCol += 1
    actualizarTodo(posFil, posCol, posX, posY)
    FPSCLOCK.tick(FPS)

    return posX, posY, posFil, posCol


def animacionPresentarJuego():
    titulo = "ESCAPE IMPERFECTO"
    DISPLAYSURF.fill(COLOR_FONDO)
    pygame.display.update()
    pygame.time.wait(500)
    chequearCierreDelPrograma()
    fuente_titulo = pygame.font.Font('freesansbold.ttf', 64)
    tam_letra = 50
    desplazamiento_izq = (len(titulo) * tam_letra) // 2
    posX, posY = ANCHO_PANTALLA // 2 - desplazamiento_izq, ALTO_PANTALLA // 2 - 70

    for i in range(len(titulo)):
        chequearCierreDelPrograma()
        textSurfaceObj = fuente_titulo.render(f"{titulo[i]}", True, COLOR_PARED)
        textRectObj = textSurfaceObj.get_rect()
        textRectObj.center = (posX + (i * tam_letra), posY)
        DISPLAYSURF.blit(textSurfaceObj, textRectObj)
        pygame.display.update()
        if titulo[i] == " ":
            pygame.time.wait(500)
        elif titulo[i] == "T":
            pygame.time.wait(1500)
        else:
            pygame.time.wait(300 - (i * 10))

    for _ in range(3):
        chequearCierreDelPrograma()
        pygame.time.wait(1000)

    copiaSurf = DISPLAYSURF.copy()

    for _ in range(10):
        chequearCierreDelPrograma()
        DISPLAYSURF.fill(COLOR_FONDO)
        pygame.display.update()
        pygame.time.wait(random.randint(10, 30))
        DISPLAYSURF.blit(copiaSurf, (0, 0))
        pygame.display.update()
        pygame.time.wait(random.randint(10, 30))

    chequearCierreDelPrograma()
    pygame.time.wait(1500)
    DISPLAYSURF.fill(COLOR_FONDO)
    pygame.display.update()
    pygame.time.wait(1000)


def animacionPresentarNivel(nivel):
    texto_por_nivel = ["Por ahora, solo hay nubes inofensivas",
                        "La lava quema. El agua te transporta",
                        "No todas las fronteras son infranqueables",
                        "El destino final habita de centro a sur, sin mostrarse",
                        "Un laberinto de verdad, con el destino final clásico"]

    DISPLAYSURF.fill(COLOR_FONDO)
    pygame.display.update()
    pygame.time.wait(500)
    chequearCierreDelPrograma()

    if nivel != 4:
        textSurfaceObj = FUENTE_COMUN.render(f"Nivel {nivel}", True, COLOR_LLEGADA)
    else:
        textSurfaceObj = FUENTE_COMUN.render(f"El último nivel", True, COLOR_LLEGADA)
    textRectObj = textSurfaceObj.get_rect()
    textRectObj.center = (ANCHO_PANTALLA // 2, ALTO_PANTALLA // 2 - 70)
    DISPLAYSURF.blit(textSurfaceObj, textRectObj)
    textSurfaceObj = FUENTE_COMUN.render(f"{texto_por_nivel[nivel]}", True, COLOR_LLEGADA)
    textRectObj = textSurfaceObj.get_rect()
    textRectObj.center = (ANCHO_PANTALLA // 2, ALTO_PANTALLA // 2 + 20)
    DISPLAYSURF.blit(textSurfaceObj, textRectObj)
    pygame.display.update()

    segundos = nivel + 3
    for _ in range(segundos):
        chequearCierreDelPrograma()
        pygame.time.wait(1000)



def animacionGanadora(lab, posX, posY, nivel):
    pygame.time.wait(1000)
    chequearCierreDelPrograma()
    borrarLaberinto(lab)
    chequearCierreDelPrograma()
    pygame.time.wait(500)

    posX = ANCHO_PANTALLA // 2
    posY = ALTO_PANTALLA // 2 - 20

    DISPLAYSURF.fill(COLOR_FONDO)
    pygame.draw.circle(DISPLAYSURF, COLOR_JUGADOR, (posX, posY), J_RADIO)
    pygame.display.update()
    FPSCLOCK.tick(FPS)

    radio = J_RADIO
    suma = 2
    while (radio < ALTO_PANTALLA // 3):
        chequearCierreDelPrograma()
        radio += suma
        suma += 1
        DISPLAYSURF.fill(COLOR_FONDO)
        pygame.draw.circle(DISPLAYSURF, COLOR_JUGADOR, (posX, posY), radio)
        pygame.display.update()
        FPSCLOCK.tick(FPS)
    pygame.time.wait(500)

    if nivel < CANT_NIVELES:
        textSurfaceObj = FUENTE_COMUN.render("¡Felicitaciones!", True, COLOR_LLEGADA)
        textRectObj = textSurfaceObj.get_rect()
        textRectObj.center = (ANCHO_PANTALLA // 2, ALTO_PANTALLA // 2 - 60)
        DISPLAYSURF.blit(textSurfaceObj, textRectObj)
        textSurfaceObj = FUENTE_COMUN.render(f"Pasaste al nivel {nivel}", True, COLOR_LLEGADA)
        textRectObj = textSurfaceObj.get_rect()
        textRectObj.center = (ANCHO_PANTALLA // 2, ALTO_PANTALLA // 2 + 20)
        DISPLAYSURF.blit(textSurfaceObj, textRectObj)
    else:
        textSurfaceObj = FUENTE_COMUN.render("¡Bien ahí pequeño maze runner!", True, COLOR_LLEGADA)
        textRectObj = textSurfaceObj.get_rect()
        textRectObj.center = (ANCHO_PANTALLA // 2, ALTO_PANTALLA // 2 - 60)
        DISPLAYSURF.blit(textSurfaceObj, textRectObj)
        textSurfaceObj = FUENTE_COMUN.render("Ganaste todos los niveles que había :)", True, COLOR_LLEGADA)
        textRectObj = textSurfaceObj.get_rect()
        textRectObj.center = (ANCHO_PANTALLA // 2, ALTO_PANTALLA // 2 + 20)
        DISPLAYSURF.blit(textSurfaceObj, textRectObj)

    pygame.display.update()
    FPSCLOCK.tick(FPS)
    for _ in range(4):
        chequearCierreDelPrograma()
        pygame.time.wait(1000)


def animacionPerdedora(lab):
    pygame.time.wait(600)
    chequearCierreDelPrograma()
    borrarLaberinto(lab)
    pygame.time.wait(700)
    chequearCierreDelPrograma()

    DISPLAYSURF.fill(COLOR_FONDO)
    pygame.display.update()
    FPSCLOCK.tick(FPS)

    for _ in range(300):
        colorLava = (random.randint(240, 255), random.randint(30, 90), random.randint(0, 30))
        textSurfaceObj = FUENTE_COMUN.render("Te quemaste :(", True, colorLava)
        textRectObj = textSurfaceObj.get_rect()
        textRectObj.center = (ANCHO_PANTALLA // 2, ALTO_PANTALLA // 2 - 40)
        DISPLAYSURF.blit(textSurfaceObj, textRectObj)
        colorLava = (random.randint(240, 255), random.randint(30, 90), random.randint(0, 30))
        textSurfaceObj = FUENTE_COMUN.render("El piso es lava", True, colorLava)
        textRectObj = textSurfaceObj.get_rect()
        textRectObj.center = (ANCHO_PANTALLA // 2, ALTO_PANTALLA // 2 + 20)
        DISPLAYSURF.blit(textSurfaceObj, textRectObj)
        pygame.display.update()
        chequearCierreDelPrograma()
        pygame.time.wait(10)



if __name__ == '__main__':
    main()

