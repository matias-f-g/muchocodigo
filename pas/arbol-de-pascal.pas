program arbolDePascalRELOADED;

type
    arbol = ^nodo;
    nodo = record
        dato : extended;
        renglon : integer; // renglón del triángulo
        BI : arbol; // bro izquierdo
        BD : arbol; // bro derecho
        HI : arbol; // hijo izquierdo
        HD : arbol; // hijo derecho
    end;

// Crea la raíz del árbol, es decir, el primer nodo
procedure crearArbol(var a : arbol; v : extended);
begin
    new(a);
    a^.dato := v;
    a^.renglon := 1;
    a^.BI := nil;
    a^.BD := nil;
    a^.HI := nil;
    a^.HD := nil;
end;

// Este módulo crea un hijo izquierdo, es decir, el primer nodo de cada renglón (si
// miramos el renglón de izquierda a derecha)
procedure crearHI(padre : arbol);
var nuevo : arbol;
begin
    new(nuevo);
    nuevo^.dato := padre^.dato;
    nuevo^.renglon := padre^.renglon + 1;
    nuevo^.BI := nil;
    nuevo^.BD := nil;
    nuevo^.HI := nil;
    nuevo^.HD := nil;
    padre^.HI := nuevo;
end;

// Crea un hijo derecho, sumando lo que tenga cada uno de sus padres
// o sea: su padre directo, y su tío derecho
procedure crearHD(padre : arbol);
var nuevo, aux : arbol; numBD : extended;
begin
    if (padre^.BD <> nil) then
    begin
        aux := padre^.BD;
        numBD := aux^.dato;
    end
    else
        numBD := 0;
    new(nuevo);
    nuevo^.dato := numBD + padre^.dato;
    nuevo^.renglon := padre^.renglon + 1;
    nuevo^.BD := nil;
    nuevo^.HI := nil;
    nuevo^.HD := nil;
    aux := padre^.HI; // lo hermana con su bro izquierdo
    aux^.BD := nuevo;
    nuevo^.BI := padre^.HI;
    padre^.HD := nuevo; // le dice al padre que ahora tiene un hijo derecho
end;

// Genera renglones (cargando los nodos de izquierda a derecha) hasta llegar al renglón límite
procedure cargarRenglones(a : arbol; r : integer);
var aux, pri : arbol; i, j : integer;
begin
    for i := 2 to r do // En cada iteración de este for se genera un nuevo renglón; itera hasta llegar a r (el renglón límite)
    begin
        pri := a; // primero salva el puntero que apunta al primer nodo del renglón
        crearHI(a); // después crea los dos primeros nodos (el hijo izquierdo y el derecho del primer nodo del renglón superior)
        crearHD(a);
        for j := 2 to (i - 1) do // sigue creando hijos derechos hasta llegar al límite del renglón
        begin
            a := a^.BD; // se desplaza a la derecha
            aux := a^.BI; // le dice a ese nuevo nodo que ya tiene un hijo izquierdo
            a^.HI := aux^.HD;
            crearHD(a); // y luego le crea el hijo derecho
        end;
        a := pri^.HI; // Se prepara para la siguiente iteración, bajando al árbol llamado "a" un renglón más abajo
    end;
end;


// Imprime todo el árbol de forma recursiva e iterativa.
// O sea, avanza de renglón a renglón de forma recursiva
// pero cada renglón se recorre de izquierda a derecha iterativamente, con un while
procedure imprimirArbol(a : arbol);
var aux : arbol;
begin
    if (a <> nil) then
    begin
        aux := a;
        while (aux <> nil) do
        begin
            write(aux^.dato:0:2, ' ');
            aux := aux^.BD;
        end;
        writeln;
        imprimirArbol(a^.HI);
    end;
end;

// Retorna la suma de todos los elementos de un renglón
// Se asume que el renglón está dentro de los límites del triángulo que fue calculado
function sumameRenglon(a : arbol; r : integer) : extended;
var sumaTotal : extended;
begin
    while (a^.renglon < r) do
        a := a^.HI;
    sumaTotal := 0;
    while (a <> nil) do
    begin
        sumaTotal := sumaTotal + a^.dato;
        a := a^.BD;
    end;
    sumameRenglon := sumaTotal;
end;

var a : arbol;
    valor : extended;
    r, n : integer;

begin
    write('Elija un valor inicial (un número real): '); read(valor);
    crearArbol(a, valor);
    writeln;
    repeat
        write('Elija hasta qué renglón quiere visualizar (entre 1 y 24): '); readln(r);
    until (r >= 1) and (r < 25);
    cargarRenglones(a, r);
    writeln;
    imprimirArbol(a);
    writeln;
    repeat
        write('Elija un renglón y le diré la suma total de sus elementos: '); readln(n);
    until (n >= 1) and (n <= r);
    writeln('La suma total es ', sumameRenglon(a, n):0:2);
end.
