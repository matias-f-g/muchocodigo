"""
EL IMPOSTOR (para jugar en PC, desde la terminal)

Este programa es una versión del conocido juego para celulares llamado "El impostor".
Los datos (las categorías y las palabras) son tomados desde el archivo "datos_impostor.csv".
(Para que funcione, tanto "impostor.py" como "datos_impostor.csv" deben estar en la misma carpeta).

Existen muchas maneras de tomar los datos desde un archivo .xlsx o .csv (sin ninguna librería, con csv,
con pandas, etc.), y muchas maneras de almacenarlos (listas, diccionarios, etc.). Acá uso csv de forma
bastante artesanal. Quizás el pedazo de código que toma los datos parece medio raro, pero simplemente
genera una lista de listas, lo cual hace que sea muy cómodo borrar y leer datos desde allí.

En cuanto al juego, es el de siempre, pero le agregué un sistema de puntos y fijé algunas cosas, como por
ejemplo el número máximo de jugadores y el número máximo de rondas.
"""

import csv, random

MAX_CANT_JUGADORES = 100
MAX_CANT_RONDAS = 11


def main():

    items = [] # Acá se van a guardar las palabras o items (el "contenido" de las categorías)

    with open("datos_impostor.csv") as file:
        reader = csv.reader(file)

        categorias = next(reader)   # El primer renglón es la lista con los nombres de las categorías

        for _ in range(len(categorias)): # Se crea una lista para después almacenar las palabras de cada categoría
            items.append([])

        for row in reader:  # Se leen el resto de los renglones, guardando cada item en su lista correspondiente
            i = 0
            for item in row:
                items[i].append(item)
                i += 1

    # Se ingresan los nombres de los jugadores, se estandarizan sus nombres (cada nombre y/o apellido con mayúscula) y se les asigna el puntaje inicial 0

    print("\nAhora debe ingresar los nombres de los jugadores. Deben ser al menos tres. Para finalizar, ingrese el nombre 'Listo'\n\n")

    jugadores = []

    nombre = addNameSafely(jugadores)
    while ((nombre != "listo") and (len(jugadores) < MAX_CANT_JUGADORES)):
        nombre = addNameSafely(jugadores)

    for i in range(len(jugadores)):
        jugador = [jugadores[i].title(), 0]
        jugadores[i] = jugador


    # Acá empieza el juego

    
    print("\n----------------------------------------------------\n")

    opcion = int(input("Una ronda de prueba (0) o empezar a jugar (1)?: "))

    if opcion == 0:
        randCatElem = ["Personajes de la tele", "Homero Sipmson"]
        randImpostor = random.choice(jugadores)
        mostrarElemTutorial(jugadores, randCatElem, randImpostor)
        print("El impostor gana si nadie lo descubre. En caso contrario, pierde.\n")
        opcion = int(input("El jugador " + randImpostor[0] + ", ¿ganó (1) o no ganó (2)?: "))
        print("\n(La pregunta anterior es para practicar y dejar en claro que el impostor puede ganar o no ganar. Los puntos empiezan a contar cuando se inicia el juego)\n")
        opcion = int(input("¿Empezar el juego (1), salir (2)?: "))
        print("\n----------------------------------------------------\n")


    if opcion != 2:
        
        cant_rondas = 0

        while ((opcion != 2) and (cant_rondas < MAX_CANT_RONDAS)):
            cant_rondas += 1
            randCatElem = dameUnRandom(items, categorias)
            randImpostor = random.choice(jugadores)
            mostrarElem(jugadores, randCatElem, randImpostor)
            opcion = int(input("El jugador " + randImpostor[0] + ", ¿ganó (1) o no ganó (2)?: "))
            actualizarPuntos(jugadores, randImpostor, opcion)
            opcion = int(input("¿Seguir jugando (1), finalizar (2)?: "))
            print("\n----------------------------------------------------\n")



        print("\n-------------------------------\n")
        print(f"Cantidad de rondas jugadas: {cant_rondas}\n")
        print("Puntajes de los jugadores: ")
        for j in jugadores:
            print("-->", j[0], "quedó con", j[1])
        print("\n-------------------------------\n\n")







# ----------------------------- Funciones -----------------------------


# Esta función evita nombres repetidos y que el usuario agregue menos de 3 nombres
def addNameSafely(jugadores):
    while True:
        nombre = input("Ingrese un nombre: ").lower()
        if (nombre not in jugadores) and (nombre != "listo"):
            jugadores.append(nombre)
            break
        elif (nombre in jugadores):
            print("\nEse nombre ya existe. Para evitar confusiones, puede ingresar nombre y apellido\n")
        elif (nombre == "listo") and (len(jugadores) < 3):
            print("\nTodavía no llegó a los tres jugadores. Debe ingresar algún nombre válido\n")
        else:
            break
    print()
    return nombre


# Esta función hace lo siguiente:
#   1° elige al azar una categoría no vacía;
#   2° elige al azar un item dentro de esa categoría; y
#   3° se queda con ambas elecciones y borra el item elegido de items[] para que no vuelva a salir
def dameUnRandom(items, categorias):
    num_cat = random.randint(0, (len(categorias) - 1))
    while (len(items[num_cat]) == 0):
        num_cat = random.randint(0, (len(categorias) - 1))
    rand_cat = categorias[num_cat]
    rand_elem = random.choice(items[num_cat])
    items[num_cat].remove(rand_elem)
    return rand_cat, rand_elem


# Esta función les muestra a todos los jugadores (salvo el impostor) la categoría y el ítem seleccionado; al impostor le muestra únicamente la categoría
def mostrarElem(jugadores, randCatElem, randImpostor):
    for j in jugadores:
        if (j != randImpostor):
            listo = input(j[0])
            print("Categoría:", randCatElem[0])
            print("Palabra:", randCatElem[1])
        else:
            listo = input(j[0])
            print("Categoría:", randCatElem[0])
        listo = input("¿Listo?")
        print("\n" * 40)
    listo = input("Momento del debate")
    print()


# Esta función hace lo mismo, con algunas explicaciones para los usuarios
def mostrarElemTutorial(jugadores, randCatElem, randImpostor):
    for j in jugadores:
        listo = input(f"{j[0]} (acá hay que pasarle el celu a {j[0]}) (Si ya lo tenés, presioná enter)")
        print("Categoría:", randCatElem[0])
        if (j != randImpostor):
            print("Palabra:", randCatElem[1])
        else:
            print("Solamente podés ver la categoría, por lo tanto, ¡sos el impostor! Cuidá que no te descubran")
        listo = input("¿Listo? (Si estás listo, presioná enter)")
        print("\n" * 40)
    listo = input("Momento del debate (acá discuten y votan al presunto impostor)")
    print()


# Esta función le suma 1 al impostor (si ganó), o le suma 1 a cada jugador (si el impostor perdió)
def actualizarPuntos(jugadores, randImpostor, opcion):
    if (opcion == 1):
        jugadores[jugadores.index(randImpostor)][1] += 1
    else:
        for j in jugadores:
            if (j != randImpostor):
                j[1] += 1



# ----------------------------- Programa principal -----------------------------

main()

