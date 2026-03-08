import random, pygame, sys
from pygame.locals import *

"""
FUNCIONES LABERÍNTICAS

Un laberinto es una matriz de filas (i) y columnas (j), donde cada posición (i, j) de la matriz constituye un "cubículo".
Un cubículo es un espacio cuadrado que puede tener o no tener paredes en cada uno de sus cuatro lados (arriba, abajo, a la derecha y a la izquierda).

Cada cubículo está definido por tres componentes:

    1) salidas: una lista que indica las "salidas" o "aperturas" que tiene un cubículo;
                la presencia de una salida (en determinado lado), indica la ausencia de la pared de ese lado del propio cubículo,
                y la ausencia de la pared inversa del cubículo vecino.
                Entonces, por ejemplo, supongamos que estamos en el primer cubículo de todos, el de arriba a la izquierda (0, 0).
                Si este cubículo tiene una salida a la derecha, eso significa que no va a tener la pared de la derecha,
                y que el cubículo que esté a su derecha, no va a tener la pared en el lado izquierdo (de lo contrario, la salida no iría a ningún lado).
                Las salidas es lo que permite la comunicación entre cubículos.
    2) paredes: una lista que indica las paredes que tiene un cubículo.

    3) sector: una vez bosquejado el laberinto, puede que el resultado sea un laberinto segmentado, o sea, con sectores independientes;
                al revisar el laberinto, uno puede darle un número a cada sector, para lo cual debe etiquetar con un número de sector
                a todos los cubículos que estén dentro del mismo sector. Para eso sirve esta variable: para almacenar el número del sector.

Lo importante es que, al acomodar todos estos cubículos de forma adecuada, es posible formar un laberinto.
Aquí hay varias funciones comunes y básicas que permiten realizar buena parte de esa tarea.
En verdad, primero se declaran algunas variables globales generales (casi todas son constantes), y después vienen las funciones.
"""

# Multisalida significa que, al momento de generar el laberinto, se permite que haya más de una salida por cubículo.
# Por defecto, la multisalida se encuentra desactivada (esto significa que solamente puede haber, como máximo, una salida por cubículo).
# De esta manera, los laberintos son más difíciles y generalmente tienen una única solución.
# Hasta ahora, solamente laberinto4_Inteligente.py requiere que esté activada.
CON_MULTISALIDA = False

# Con animación significa que varias de las funciones que generan el laberinto van mostrando paso a paso lo que hacen, con pausas.
# Por defecto, se encuentra desactivada (solamente la usa laberinto1_Genesis.py).
CON_ANIMACION = False

# Para facilitar las referencias los lados de cada cubículo, están estas constantes, compartidas por todos los programas de la laberintología.
# Simplemente están para facilitar la lectura y la escritura.
ARRIBA = 'arriba'
ABAJO = 'abajo'
IZQUIERDA = 'izquierda'
DERECHA = 'derecha'

# Algunos colores fundamentales
COLOR_CONECTOR = (30, 30, 230)
BLANCO = (250, 250, 250)



# Estas dos funciones (cerrarPrograma() y chequearCierreDelPrograma()) no tienen nada que ver con el laberinto.
# Tienen que ver con la ejecución de los programas en la ventana de Pygame. Están acá porque todos los otros programas las usan.
# Esta función finaliza correctamente la ejecución del programa.
def cerrarPrograma():
    pygame.quit()
    sys.exit()


# Esta función sirve para finalizar correctamente el programa cuando el usuario cliquea en el botón de cerrar ventana (la X de arriba a la derecha).
# Suele usarse en el loop principal de un juego, y en el medio de las animaciones.
def chequearCierreDelPrograma():
    for event in pygame.event.get(QUIT):
        cerrarPrograma()


# Por defecto, la multisalida está desactivada. Pero si se quiere activar, hay que llamar a esta función.
def activarMultisalida():
    global CON_MULTISALIDA
    CON_MULTISALIDA = True


def activarAnimacion():
    global CON_ANIMACION
    CON_ANIMACION = True


# Casi todas las funciones que hay acá, requieren algún tipo de variable global "extranjera" (o sea, que habita fuera de este archivo).
# Para que esas variables globales puedan usarse en todas estas funciones, hay que compartirlas. Por eso existe esta función.
def compartirGlobales(superficie, cant_filas, cant_columnas, grosor_borde, tam_lado, ancho_p, alto_p, c_fondo, c_pared, fpsreloj=None, fps=None):
    global DISPLAYSURF, N_FILAS, N_COLUMNAS, BORDE, LADO, ANCHO_PANTALLA, ALTO_PANTALLA, COLOR_FONDO, COLOR_PARED, FPSCLOCK, FPS
    DISPLAYSURF = superficie
    N_FILAS = cant_filas
    N_COLUMNAS = cant_columnas
    BORDE = grosor_borde
    LADO = tam_lado
    ANCHO_PANTALLA = ancho_p
    ALTO_PANTALLA = alto_p
    COLOR_FONDO = c_fondo
    COLOR_PARED = c_pared
    FPSCLOCK = fpsreloj
    FPS = fps


# Esta función empieza a bosquejar el laberinto. No devuelve un laberinto hecho: devuelve algo que se le parece bastante,
# pero que quizás no tiene solución, debido a que se encuentra fragmentado (es decir, separado en sectores independientes,
# lo cual significa que no se puede ir desde cualquier punto del laberinto a cualquier otro punto). Para que finalmente
# quede bien, hay que aplicarle otras funciones, como detectarSectores() y unirSectores().
# Además, tiene 5 opciones u estilos distintos (numeradas del 0 al 4). Para verlos, ejecute el programa laberinto1_Genesis.py.
def esbozarLaberinto(opcion):
    # Primero se generan algunas listas con los índices para recorrer las filas y las columnas.
    # nums_filas y nums_columnas son normales: 0, 1, 2, ... n - 1
    # nums_filas_ran y nums_columnas_ran están desordenados: 5, 0, 10, ... 3
    nums_filas = []
    nums_columnas = []
    for i in range(N_FILAS):
        nums_filas.append(i)
    for j in range(N_COLUMNAS):
        nums_columnas.append(j)
    nums_filas_ran = nums_filas[:]
    random.shuffle(nums_filas_ran)
    nums_columnas_ran = nums_columnas[:]
    random.shuffle(nums_columnas_ran)

    # Acá se genera la estructura, o sea, se inicializa la matriz vacía (en None) sobre la cual se va a ir armando el laberinto.
    # Cada elemento de la matriz (i, j) es un cubículo, el cual tiene tres componentes: x salidas, x paredes y un sector.
    lab = []
    for i in range(N_FILAS):
        columnas = []
        for j in range(N_COLUMNAS):
            columnas.append((None, None, None))
        lab.append(columnas)

    # OPCIÓN 0: por filas
    if opcion == 0:
        for i in range(N_FILAS):
            for j in nums_columnas_ran:
                lab[i][j] = generarLados(i, j, lab)

    # OPCIÓN 1: arriba, abajo, izquierda, derecha, repeat
    elif opcion == 1:
        lab = opcionDos(lab, N_FILAS, nums_filas, nums_columnas, nums_filas_ran, nums_columnas_ran)

    # OPCIÓN 2: desde las columnas del medio hacia los costados (con tres filas intercaladas)
    elif opcion == 2:
        mitad_columnas = len(nums_columnas) // 2
        primera_mitad = nums_columnas[mitad_columnas : len(nums_columnas)]
        segunda_mitad = nums_columnas[0 : mitad_columnas]
        segunda_mitad.reverse()

        fila_uncuarto = len(nums_filas) // 4
        fila_del_medio = fila_uncuarto * 2
        fila_trescuartos = fila_uncuarto * 3

        for j in nums_columnas_ran:
            lab[fila_uncuarto][j] = generarLados(fila_uncuarto, j, lab)
            lab[fila_del_medio][j] = generarLados(fila_del_medio, j, lab)
            lab[fila_trescuartos][j] = generarLados(fila_trescuartos, j, lab)

        for j in primera_mitad:
            for i in nums_filas_ran:
                if lab[i][j][1] == None:
                    lab[i][j] = generarLados(i, j, lab)
        
        for j in segunda_mitad:
            for i in nums_filas_ran:
                if lab[i][j][1] == None:
                    lab[i][j] = generarLados(i, j, lab)

    # OPCIÓN 3: todo completo
    elif opcion == 3:
        for i in nums_filas:
            for j in nums_columnas:
                lab[i][j] = generarLados(i, j, lab, False)

    # OPCIÓN 4: en espiral desde el centro, más el perímetro con cuadrados sin salida
    else:
        pasamos_por_origen = False
        pasamos_por_fin = False
        i = N_FILAS // 2
        j = N_COLUMNAS // 2
        cant_de_mov = 1

        lab[i][j] = generarLados(i, j, lab) # Primero se genera el cuadrado del centro, y después arranca en espiral

        while not (pasamos_por_origen and pasamos_por_fin):
            contador = 0
            while (i > 1) and (contador < cant_de_mov): # Hacia arriba
                i, contador =  i - 1, contador + 1
                if lab[i][j][1] == None:
                    lab[i][j] = generarLados(i, j, lab)
            contador = 0
            while (j > 1) and (contador < cant_de_mov): # Hacia la izquierda
                j, contador =  j - 1, contador + 1
                if lab[i][j][1] == None:
                    lab[i][j] = generarLados(i, j, lab)
            if (i == 1) and (j == 1):
                pasamos_por_origen = True

            cant_de_mov += 1
            contador = 0
            while (i < (N_FILAS - 2)) and (contador < cant_de_mov): # Hacia abajo
                i, contador =  i + 1, contador + 1
                if lab[i][j][1] == None:
                    lab[i][j] = generarLados(i, j, lab)
            contador = 0
            while (j < (N_COLUMNAS - 2)) and (contador < cant_de_mov): # Hacia la derecha
                j, contador =  j + 1, contador + 1
                if lab[i][j][1] == None:
                    lab[i][j] = generarLados(i, j, lab)
            if (i == (N_FILAS - 2)) and (j == (N_COLUMNAS - 2)):
                pasamos_por_fin = True
            cant_de_mov += 1

        lab = opcionDos(lab, 1, nums_filas, nums_columnas, nums_filas_ran, nums_columnas_ran, False)

    return lab


# Esta es simplemente una subfunción del módulo anterior.
# Está separada porque sirve para generar la opción 2, pero también constribuye con la opción 5.
def opcionDos(lab, cant_vueltas, nums_filas, nums_columnas, nums_filas_ran, nums_columnas_ran, buscarleSalida=True):
    nums_filas_rev = nums_filas[:]
    nums_filas_rev.reverse()
    nums_columnas_rev = nums_columnas[:]
    nums_columnas_rev.reverse()

    for aux in range(cant_vueltas):
        iup = nums_filas[aux] # filas de arriba
        for j in nums_columnas_ran:
            if lab[iup][j][0] == None:
                lab[iup][j] = generarLados(iup, j, lab, buscarleSalida)
        idown = nums_filas_rev[aux] # filas de abajo
        for j in nums_columnas_ran:
            if lab[idown][j][0] == None:
                lab[idown][j] = generarLados(idown, j, lab, buscarleSalida)
        jleft = nums_columnas[aux] # columnas de la izquierda
        for i in nums_filas_ran[iup: idown + 1]:
            if lab[i][jleft][0] == None:
                lab[i][jleft] = generarLados(i, jleft, lab, buscarleSalida)
        jright = nums_columnas_rev[aux] # columnas de la derecha
        for i in nums_filas_ran[iup: idown + 1]:
            if lab[i][jright][0] == None:
                lab[i][jright] = generarLados(i, jright, lab, buscarleSalida)
        random.shuffle(nums_filas_ran)
        random.shuffle(nums_columnas_ran)
    return lab


# Esta función recibe un cubículo vacío y devuelve, según las posibilidades (determinadas por los límites de la matriz y los cubículos vecinos),
# un cubículo con 0, 1 o 2 salidas, alguna(s) parede(s) y el sector aún vacío (ya que eso se puede determinar recién después de bosquejar el laberinto).
def generarLados(fil, col, lab, buscarleSalida=True):
    sector = None
    posibles_salidas = [ARRIBA, ABAJO, IZQUIERDA, DERECHA]
    paredes = [ARRIBA, ABAJO, IZQUIERDA, DERECHA]
    salidas = []

    if fil == 0: # Si el cuadrado actual linda con el lado superior del lienzo, descartamos una posible salida hacia arriba
        posibles_salidas.remove(ARRIBA)
    elif (lab[fil - 1][col][1] != None): # Revisamos el cuadrado superior para ver si tiene una salida para abajo, o una pared abajo
        if (ABAJO in lab[fil - 1][col][0]) or (ABAJO in lab[fil - 1][col][1]):
            paredes.remove(ARRIBA) # Para que no haya paredes duplicadas (y no taparle la entrada al otro)
            posibles_salidas.remove(ARRIBA) # Para no salir por donde ya existe una entrada
    if fil == (N_FILAS - 1): # Misma idea que antes, pero con la parte inferior
        posibles_salidas.remove(ABAJO)
    elif (lab[fil + 1][col][1] != None):
        if (ARRIBA in lab[fil + 1][col][0]) or (ARRIBA in lab[fil + 1][col][1]):
            paredes.remove(ABAJO)
            posibles_salidas.remove(ABAJO)

    # Misma idea que antes, pero para los costados del cuadrado actual
    if col == 0:
        posibles_salidas.remove(IZQUIERDA)
    elif (lab[fil][col - 1][1] != None):
        if (DERECHA in lab[fil][col - 1][0]) or (DERECHA in lab[fil][col - 1][1]):
            paredes.remove(IZQUIERDA)
            posibles_salidas.remove(IZQUIERDA)
    if col == (N_COLUMNAS - 1):
        posibles_salidas.remove(DERECHA)
    elif (lab[fil][col + 1][1] != None):
        if (IZQUIERDA in lab[fil][col + 1][0]) or (IZQUIERDA in lab[fil][col + 1][1]):
            paredes.remove(DERECHA)
            posibles_salidas.remove(DERECHA)

    n_salidas = 0
    max_salidas = 1
    # Para el laberinto4_Inteligente, en caso de resultar posible, se permite una cantidad aleatoria de salidas (entre 1 y 2)
    if CON_MULTISALIDA:
        max_salidas = random.randint(1, 2) 
    while (len(posibles_salidas) > 0) and (n_salidas < max_salidas) and (buscarleSalida == True):
        n_salidas += 1
        una_salida = random.choice(posibles_salidas)
        posibles_salidas.remove(una_salida)
        salidas.append(una_salida)
        if una_salida in paredes:
            paredes.remove(una_salida)

    if CON_ANIMACION:
        chequearCierreDelPrograma()
        dibujarCubiculo(fil, col, paredes, sector, False, True)

    return [salidas, paredes, sector]


# Esta función toma un bosquejo de laberinto, y devuelve dos cosas:
# 1) devuelve el mismo laberinto, pero con los sectores identificados (o sea: le asigna a cada cubículo su número de sector); y
# 2) devuelve una lista de listas llamada "sectores", la cual contiene, en cada lista, los cubículos que pertenecientes a cada sector.
def detectarSectores(lab):
    num_sector = 0
    sectores = []
    for i in range(N_FILAS):
        for j in range(N_COLUMNAS):
            if lab[i][j][2] == None:
                lab, sector = identificarSector(i, j, lab, num_sector)
                sectores.append(sector)
                num_sector += 1

    return lab, sectores


# Una vez que se encuentra un cubículo cuyo número de sector es None, se le asigna un número de sector,
# y a todos sus compañeros del sector (= todos aquellos cubículos que, de alguna manera, están conectados entre sí) se le da el mismo número.
def identificarSector(i, j, lab, num_sector):
    lab[i][j][2] = num_sector
    ya_agregados = [(i, j)]
    nuevos_miembros = []

    if (ARRIBA not in lab[i][j][1]) and (lab[i - 1][j][2] == None) and (ABAJO not in lab[i - 1][j][1]):
        nuevos_miembros.append((i - 1, j))
    if (ABAJO not in lab[i][j][1]) and (lab[i + 1][j][2] == None) and (ARRIBA not in lab[i + 1][j][1]):
        nuevos_miembros.append((i + 1, j))
    if (IZQUIERDA not in lab[i][j][1]) and (lab[i][j - 1][2] == None) and (DERECHA not in lab[i][j - 1][1]):
        nuevos_miembros.append((i, j - 1))
    if (DERECHA not in lab[i][j][1]) and (lab[i][j + 1][2] == None) and (IZQUIERDA not in lab[i][j + 1][1]):
        nuevos_miembros.append((i, j + 1))

    if CON_ANIMACION:
        dibujarCubiculo(i, j, lab[i][j][1], lab[i][j][2], True, True)

    while len(nuevos_miembros) != 0:
        i, j = nuevos_miembros[0]
        lab[i][j][2] = num_sector
        nuevos_miembros.remove((i, j))
        ya_agregados.append((i, j))

        if (ARRIBA not in lab[i][j][1]) and (lab[i - 1][j][2] == None) and (ABAJO not in lab[i - 1][j][1]):
            if ((i - 1, j) not in nuevos_miembros) and ((i - 1, j) not in ya_agregados):
                nuevos_miembros.append((i - 1, j))
        if (ABAJO not in lab[i][j][1]) and (lab[i + 1][j][2] == None) and (ARRIBA not in lab[i + 1][j][1]):
            if ((i + 1, j) not in nuevos_miembros) and ((i + 1, j) not in ya_agregados):
                nuevos_miembros.append((i + 1, j))
        if (IZQUIERDA not in lab[i][j][1]) and (lab[i][j - 1][2] == None) and (DERECHA not in lab[i][j - 1][1]):
            if ((i, j - 1) not in nuevos_miembros) and ((i, j - 1) not in ya_agregados):
                nuevos_miembros.append((i, j - 1))
        if (DERECHA not in lab[i][j][1]) and (lab[i][j + 1][2] == None) and (IZQUIERDA not in lab[i][j + 1][1]):
            if ((i, j + 1) not in nuevos_miembros) and ((i, j + 1) not in ya_agregados):
                nuevos_miembros.append((i, j + 1))

        if CON_ANIMACION:
            chequearCierreDelPrograma()
            dibujarCubiculo(i, j, lab[i][j][1], lab[i][j][2], True, True)

    return lab, ya_agregados


# Una vez identificados los sectores, se buscan los puntos de contacto entre sectores,
# y se conectan entre todos, así no quedan sectores independientes.
# Luego de ejecutar esta función, todo el laberinto pertenecerá al mismo sector.
# Y además del laberinto unificado, se retorna una lista con todos los conectores usados.
# Esto último sirve solamente para las paredes falsas en el juego ESCAPE IMPERFECTO; ver laberinto3_Juego.py.
def unirSectores(lab, sectores, num_sector_inicial):
    
    conectores_usados = []
    posibles_conectores = sectores[num_sector_inicial][:]

    for _ in range(len(sectores) - 1):
        conector = random.choice(posibles_conectores)
        while (esFronterizo(lab, conector, num_sector_inicial) == None):
            posibles_conectores.remove(conector)
            conector = random.choice(posibles_conectores)

        i, j = conector
        frontera = esFronterizo(lab, conector, num_sector_inicial)
        conectores_usados.append((i, j, frontera))

        if CON_ANIMACION and (len(sectores) < 25):
            chequearCierreDelPrograma()
            pygame.time.wait(1000)

        if frontera == ARRIBA:    # cortar por arriba
            if ARRIBA in lab[i][j][1]:
                lab[i][j][1].remove(ARRIBA)
            if ABAJO in lab[i - 1][j][1]:
                lab[i - 1][j][1].remove(ABAJO)
            borrarPared(i, j, ARRIBA, num_sector_inicial)
            num_nuevo_sector = lab[i - 1][j][2]
        elif frontera == ABAJO:  # cortar por abajo
            if ABAJO in lab[i][j][1]:
                lab[i][j][1].remove(ABAJO)
            if ARRIBA in lab[i + 1][j][1]:
                lab[i + 1][j][1].remove(ARRIBA)
            borrarPared(i, j, ABAJO, num_sector_inicial)
            num_nuevo_sector = lab[i + 1][j][2]
        elif frontera == IZQUIERDA:  # cortar por izquierda
            if IZQUIERDA in lab[i][j][1]:
                lab[i][j][1].remove(IZQUIERDA)
            if DERECHA in lab[i][j - 1][1]:
                lab[i][j - 1][1].remove(DERECHA)
            borrarPared(i, j, IZQUIERDA, num_sector_inicial)
            num_nuevo_sector = lab[i][j - 1][2]
        else:                   # cortar por la derecha
            if DERECHA in lab[i][j][1]:
                lab[i][j][1].remove(DERECHA)
            if IZQUIERDA in lab[i][j + 1][1]:
                lab[i][j + 1][1].remove(IZQUIERDA)
            borrarPared(i, j, DERECHA, num_sector_inicial)
            num_nuevo_sector = lab[i][j + 1][2]

        nuevo_sector = sectores[num_nuevo_sector][:]

        for aux in range(len(nuevo_sector)):
            fil, col = nuevo_sector[aux]
            lab[fil][col][2] = num_sector_inicial
            if CON_ANIMACION:
                chequearCierreDelPrograma()
                cambiarNumero(fil, col, BLANCO, num_sector_inicial)

        posibles_conectores.extend(nuevo_sector)

    return lab, conectores_usados


# Esto solamente se usa cuando está activada la animación; sirve para mostrar cómo un sector cambia de número.
def cambiarNumero(i, j, con_color, num_sector_inicial):
    arIx, arIy = j * LADO + BORDE, i * LADO + BORDE 
    centerx = arIx + (LADO // 2)
    centery = arIy + (LADO // 2)

    pygame.draw.rect(DISPLAYSURF, COLOR_FONDO, (centerx - 7, centery - 7, 14, 14))
    fontObj = pygame.font.Font('freesansbold.ttf', 10)
    textSurfaceObj = fontObj.render(str(num_sector_inicial), True, con_color)
    textRectObj = textSurfaceObj.get_rect()
    textRectObj.center = (centerx, centery)
    DISPLAYSURF.blit(textSurfaceObj, textRectObj)

    pygame.display.update()
    pygame.time.wait(50)


# Detecta si un cubículo de un sector está al lado de un cubículo perteneciente a otro sector.
# Si es así, devuelve el lado que está en contacto con ese otro sector, el lado que está haciendo de frontera entre sectores.
# Si sus cubículos vecinos son del mismo sector, devuelve None.
def esFronterizo(lab, conector, num_sector_inicial):
    i = conector[0]
    j = conector[1]

    if (i != 0) and (lab[i - 1][j][2] != num_sector_inicial): # cortar por arriba
       return ARRIBA
    elif (i != (N_FILAS - 1)) and (lab[i + 1][j][2] != num_sector_inicial): # cortar por abajo
        return ABAJO
    elif (j != 0) and (lab[i][j - 1][2] != num_sector_inicial): # cortar por izquierda
        return IZQUIERDA
    elif (j != (N_COLUMNAS - 1)) and (lab[i][j + 1][2] != num_sector_inicial): # cortar por derecha
        return DERECHA
    return None


def dibujarCubiculo(i, j, paredes, num_sector, con_numero, con_espera=False):
    arIx, arIy = j * LADO + BORDE, i * LADO + BORDE
    abIx, abIy = arIx, arIy + LADO
    arDx, arDy = arIx + LADO, arIy
    abDx, abDy = arDx, abIy

    if ARRIBA in paredes:
        pygame.draw.line(DISPLAYSURF, COLOR_PARED, (arIx, arIy), (arDx, arDy), BORDE)
    if ABAJO in paredes:
        pygame.draw.line(DISPLAYSURF, COLOR_PARED, (abIx, abIy), (abDx, abDy), BORDE)
    if IZQUIERDA in paredes:
        pygame.draw.line(DISPLAYSURF, COLOR_PARED, (arIx, arIy), (abIx, abIy), BORDE)
    if DERECHA in paredes:
        pygame.draw.line(DISPLAYSURF, COLOR_PARED, (arDx, arDy), (abDx, abDy), BORDE)

    if (num_sector != None) and (con_numero):
        fontObj = pygame.font.Font('freesansbold.ttf', 10)
        textSurfaceObj = fontObj.render(str(num_sector), True, BLANCO)
        textRectObj = textSurfaceObj.get_rect()
        textRectObj.center = (arIx + (LADO // 2), arIy + (LADO // 2))
        DISPLAYSURF.blit(textSurfaceObj, textRectObj)
    if con_espera:
        pygame.display.update()
        pygame.time.wait(100)


def dibujarLaberinto(lab, con_actualizacion=True):
    DISPLAYSURF.fill(COLOR_FONDO)
    for i in range(N_FILAS):
        for j in range(N_COLUMNAS):
            dibujarCubiculo(i, j, lab[i][j][1], lab[i][j][2], False)
    if con_actualizacion:
        pygame.display.update()


def borrarLaberinto(lab):
    pares_ordenados = []
    for i in range(N_FILAS):
        for j in range(N_COLUMNAS):
            pares_ordenados.append((i, j))
    random.shuffle(pares_ordenados)

    for par in pares_ordenados:
        borrarParedes(par[0], par[1])

    pygame.draw.rect(DISPLAYSURF, COLOR_FONDO, (0, 0, ANCHO_PANTALLA, ALTO_PANTALLA))
    pygame.display.update()
    if CON_ANIMACION:
        pygame.time.wait(1500)


def borrarPared(i, j, pared, num_sector_inicial):
    arIx, arIy = j * LADO + BORDE, i * LADO + BORDE 
    abIx, abIy = arIx, arIy + LADO
    arDx, arDy = arIx + LADO, arIy
    abDx, abDy = arDx, abIy
    if ARRIBA == pared:
        pygame.draw.line(DISPLAYSURF, COLOR_FONDO, (arIx + 2, arIy), (arDx - 2, arDy), BORDE)
    elif ABAJO == pared:
        pygame.draw.line(DISPLAYSURF, COLOR_FONDO, (abIx + 2, abIy), (abDx - 2, abDy), BORDE)
    elif IZQUIERDA == pared:
        pygame.draw.line(DISPLAYSURF, COLOR_FONDO, (arIx, arIy + 2), (abIx, abIy - 2), BORDE)
    else:
        pygame.draw.line(DISPLAYSURF, COLOR_FONDO, (arDx, arDy + 2), (abDx, abDy - 2), BORDE)

    if CON_ANIMACION:
        chequearCierreDelPrograma()
        cambiarNumero(i, j, COLOR_CONECTOR, num_sector_inicial)
        pygame.display.update()
        pygame.time.wait(1000)


def borrarParedes(i, j):
    arIx, arIy = j * LADO + BORDE, i * LADO + BORDE
    abIx, abIy = arIx, arIy + LADO
    arDx, arDy = arIx + LADO, arIy
    abDx, abDy = arDx, abIy
    pygame.draw.line(DISPLAYSURF, COLOR_FONDO, (arIx + 2, arIy), (arDx - 2, arDy), BORDE)
    pygame.draw.line(DISPLAYSURF, COLOR_FONDO, (abIx + 2, abIy), (abDx - 2, abDy), BORDE)
    pygame.draw.line(DISPLAYSURF, COLOR_FONDO, (arIx, arIy + 2), (abIx, abIy - 2), BORDE)
    pygame.draw.line(DISPLAYSURF, COLOR_FONDO, (arDx, arDy + 2), (abDx, abDy - 2), BORDE)
    if CON_ANIMACION:
        FPSCLOCK.tick(FPS)
    pygame.display.update()


def prepararDimensiones(nivel, TAM_LADOS, ALTO_LIENZO, ANCHO_LIENZO):
    LADO = TAM_LADOS[nivel]
    N_FILAS = ALTO_LIENZO // LADO
    N_COLUMNAS = ANCHO_LIENZO // LADO
    return LADO, N_FILAS, N_COLUMNAS


def prepararEscenario(nivel, TAM_LADOS, ALTO_LIENZO, ANCHO_LIENZO):
    LADO, N_FILAS, N_COLUMNAS = prepararDimensiones(nivel, TAM_LADOS, ALTO_LIENZO, ANCHO_LIENZO)
    JUGADOR_RADIO = LADO // 4
    JUGADOR_DIAMETRO = JUGADOR_RADIO * 2
    return LADO, N_FILAS, N_COLUMNAS, JUGADOR_RADIO, JUGADOR_DIAMETRO


# Esta función recibe la opción/nivel del laberinto, y retorna un laberinto
def generarLaberinto(opcion):
    laberinto = esbozarLaberinto(opcion)
    laberinto, sectores = detectarSectores(laberinto)
    num_sector_ini = laberinto[random.randint(0, N_FILAS - 1)][random.randint(0, N_COLUMNAS - 1)][2]
    laberinto, conec = unirSectores(laberinto, sectores, num_sector_ini)
    return laberinto


# Esta función es idéntica a la anterior, pero además del laberinto retorna una lista con los conectores
# usados para unir los sectores (o sea, una lista con las paredes que se quitaron), la cual sirve únicamente
# para generar paredes falsas en el juego ESCAPE IMPERFECTO; ver laberinto3_Juego.py.
def generarLabConConec(opcion):
    laberinto = esbozarLaberinto(opcion)
    laberinto, sectores = detectarSectores(laberinto)
    num_sector_ini = laberinto[random.randint(0, N_FILAS - 1)][random.randint(0, N_COLUMNAS - 1)][2]
    laberinto, conec = unirSectores(laberinto, sectores, num_sector_ini)
    return laberinto, conec

