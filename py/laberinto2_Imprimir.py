import random, pygame, sys, re, os
from pygame.locals import *
from laberinto0 import *


"""
LABERINTOS PARA IMPRIMIR

Este programa genera un laberinto (con principio arriba a la izquierda y fin abajo a la derecha), y lo guarda en un archivo .png
llamado "laberinto__.png" (donde el __ quiere decir algún número).
El programa indexa las fotos automáticamente, y las almacena en una carpeta llamada "laberintos_fotografiados" (generada por el propio programa).

Para crear tu propio laberinto, podés modificar los siguientes parámetros:
- el tipo de laberinto (cambiando la variable OPCION)
- el grosor de las paredes (cambiando la variable BORDE)
- el ancho y el alto del lienzo (de la pantalla no, eso es automático)
- el tamaño de los cubículos, o sea, las dimensiones de los lados (cambiando la variable LADO)

Los laberintos generados están pensados para ser impresos, por eso tienen el fondo blanco y las paredes negras; sin embargo, también podés modificar eso.
"""


# Elige el tipo de generación del laberinto. Las opciones van del 0 al 4.
# Para conocer cada opción, vea la función "esbozarLaberinto()" del archivo laberinto0, o ejecute el programa laberinto1_Genesis.py.
OPCION = 4

assert OPCION in [0, 1, 2, 3, 4], 'Las opciones válidas van del 0 al 4'

BORDE = 4
DOBLEBORDE = BORDE * 2
ANCHO_LIENZO = 1000
ALTO_LIENZO = 1000
ANCHO_PANTALLA = ANCHO_LIENZO + DOBLEBORDE
ALTO_PANTALLA = ALTO_LIENZO + DOBLEBORDE

assert ((BORDE % 2) == 0) and ((ANCHO_LIENZO % 2) == 0) and ((ALTO_LIENZO % 2) == 0), 'Convendría que las dimensiones sean números pares'

LADO = 50
N_FILAS = ALTO_LIENZO // LADO
N_COLUMNAS = ANCHO_LIENZO // LADO

assert ((ALTO_LIENZO % LADO) == 0) and ((ANCHO_LIENZO % LADO) == 0), 'Convendría que las dimensiones del lienzo sean divisibles por el tamaño del lado del cuadrado'

COLOR_FONDO = (255, 255, 255)
COLOR_PARED = (0, 50, 0)

ARRIBA = 'arriba'
ABAJO = 'abajo'
IZQUIERDA = 'izquierda'
DERECHA = 'derecha'

# Un nombre de archivo es considerado foto de un laberinto si empieza con "laberinto", luego tiene 1 o más dígitos, y termina con ".png"
esLaberintoRegex = re.compile(r"^laberinto_\d+\.png$")


def main():
    pygame.init()
    DISPLAYSURF = pygame.display.set_mode((ANCHO_PANTALLA, ALTO_PANTALLA))
    pygame.display.set_caption('Laberinto')

    compartirGlobales(DISPLAYSURF, N_FILAS, N_COLUMNAS, BORDE, LADO, ANCHO_PANTALLA, ALTO_PANTALLA, COLOR_FONDO, COLOR_PARED)

    # Se esboza el laberinto y se detectan los sectores
    laberinto = esbozarLaberinto(OPCION)
    laberinto, sectores = detectarSectores(laberinto)

    # Se elige como número de sector inicial (para unificar sectores) aquel que esté en el centro
    num_sector_ini = laberinto[N_FILAS // 2][N_COLUMNAS // 2][2]
    laberinto, conectores_usados = unirSectores(laberinto, sectores, num_sector_ini)

    # Acá se abre el camino para el inicio y el fin
    laberinto[0][0][1].remove(ARRIBA)
    laberinto[N_FILAS - 1][N_COLUMNAS - 1][1].remove(ABAJO)

    # Se dibuja
    dibujarLaberinto(laberinto)

    # Calcula el número de laberinto "fotografiado" para ser almacenado correctamente en una carpeta específica para tal fin
    numDelLaberinto, directorio_fotos = calcularNumLabYDir()

    # Se define la ubicación del archivo (es decir, de la foto n° numDelLaberinto)
    ubicacion_foto = os.path.join(directorio_fotos, "laberinto_%s.png" % numDelLaberinto)
    
    # Se toma la foto
    pygame.image.save(DISPLAYSURF, ubicacion_foto)

    cerrarPrograma()



# Esta función realiza varias cosas:
#   1. Calcula cuántos laberintos fueron "fotografiados" para deterinar el índice de la siguiente "foto" y devuelve dicho número (en la variable numDelLaberinto)
#   2. Si la carpeta "laberintos_fotografiados" no existe, la crea.
#   3. Devuelve la ubicación a donde irá a parar el archivo (en la variable directorio_fotos)
def calcularNumLabYDir():
    directorio_actual = os.getcwd() # Capta el directorio (o carpeta) en el cual "estamos parados", es decir, get the current working directory
    directorio_fotos = os.path.join(directorio_actual, "laberintos_fotografiados") # Se define la ubicación de la carpeta donde van a ir las fotos

    # Si esa carpeta no existe, hay que crearla
    if not os.path.exists(directorio_fotos):
        os.makedirs(directorio_fotos)
        return 1, directorio_fotos

    # Si ya existe, hay que ver cuántos laberintos ya tiene, y devolver el número correspondiente
    else:
        archivos_encontrados = os.listdir(directorio_fotos) # Una lista ordenada con los nombres de todos los archivos de la carpeta "laberintos_fotografiados"
        indices_econtrados = [0] # Se agrega un cero, solo por si alguien deja la carpeta "laberintos_fotografiados" vacía
        for nombre_archivo in archivos_encontrados: # Solamente cuentan como fotos de laberinto los archivos que cumplan el regex previamente definido
            if esLaberintoRegex.search(nombre_archivo):
                indices_econtrados.append(int(nombre_archivo[10:(len(nombre_archivo) - 4)])) # Del nombre del archivo, nos quedamos solamente con su índice
        indices_econtrados = (sorted(indices_econtrados))
        numDelLaberinto = indices_econtrados[-1] + 1
        return numDelLaberinto, directorio_fotos



if __name__ == '__main__':
    main()

