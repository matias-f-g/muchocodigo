program sudoku_solver2;

uses SysUtils;

type
    possible_n = set of 1..9;
    square_of_pos = array[1..3, 1..3] of possible_n;
    sudoku_arr = array[1..9, 1..9] of integer;

procedure generate_sketch (var sudoku : sudoku_arr);
var
    m, n, i : integer;
    this_line : string;
begin
    writeln('----------------------------------------------------------------------------------');
    writeln('-----------------------------SUDOKU SOLVER 3000-----------------------------------');
    writeln('----------------------------------------------------------------------------------');
    writeln;
    writeln('Enter the numbers you have in a single row. Proceed line by line. If there is a blank space, set it to 0.');
    writeln;
    writeln('Example: 530070000600195000098000060800060003400803001700020006060000280000419005000080079');
    writeln;
    write('Your sudoku: '); readln(this_line);
    writeln;
    i := 1;
    for m := 1 to 9 do
    begin
        for n := 1 to 9 do
        begin
            sudoku[m][n] := StrToInt(this_line[i]);
            i := i + 1;
        end;
    end;
end;


procedure checkLine (sudoku : sudoku_arr; m : integer; var possibles: possible_n);
var i : integer;
begin
    for i := 1 to 9 do
    begin
        if sudoku[m][i] in possibles then
            possibles := possibles - [sudoku[m][i]];
    end;
end;

procedure checkColumn (sudoku : sudoku_arr; n : integer; var possibles: possible_n);
var i : integer;
begin
    for i := 1 to 9 do
    begin
        if sudoku[i][n] in possibles then
            possibles := possibles - [sudoku[i][n]];
    end;
end;

procedure checkSquare (sudoku : sudoku_arr; m, n : integer; var possibles: possible_n);
var i, j : integer;
begin
    for i := m to (m + 2) do
    begin
        for j := n to (n + 2) do
        begin
            if sudoku[i][j] in possibles then
                possibles := possibles - [sudoku[i][j]];
        end;
    end;
end;

function getNumber (poss : possible_n) : integer;
var i, n : integer;
begin
    n := 0;
    i := 1;
    while (n = 0) do
    begin
        if i in poss then
            n := i
        else
            i := i + 1;
    end;
    getNumber := n;
end;

procedure iniSquare (var sq_of : square_of_pos);
var m, n : integer;
begin
    for m := 1 to 3 do
    begin
        for n := 1 to 3 do
            sq_of[m][n] := [];
    end;
end;

function setSector (x : integer) : integer;
begin
    case x of
        1 : setSector := 1;
        2 : setSector := 4;
        3 : setSector := 7;
    end;
end;

function setPlace (x : integer) : integer;
begin
    case x of
        1, 4, 7 : setPlace := 1;
        2, 5, 8 : setPlace := 2;
        3, 6, 9 : setPlace := 3;
    end;
end;

function isFull (sudoku : sudoku_arr) : boolean;
var
    full : boolean;
    m, n : integer;
begin
    full := true;
    m := 1;
    while (m < 10) and (full) do
    begin
        n := 1;
        while (n < 10) and (full) do
        begin
            if sudoku[m][n] = 0 then
                full := false;
            n := n + 1;
        end;
        m := m + 1;
    end;
    isFull := full;
end;

procedure display_sudoku (sudoku : sudoku_arr);
var m, n: integer;
begin
    for m := 1 to 9 do
    begin
        for n := 1 to 9 do
        begin
            if ((n mod 3) = 0) then
                write(sudoku[m][n], '|')
            else
                write(sudoku[m][n], ' ');
        end;
        writeln;
        if ((m mod 3) = 0) then
        begin
            for n := 1 to 9 do
                write('──');
            writeln;
        end;
    end;
    writeln;
end;

procedure solve_sudoku (var sudoku : sudoku_arr);
var
    sq_of : square_of_pos;
    n_of_pos : array[1..9] of integer;
    possibles : possible_n;
    m, n, mx, nx, mp, np, i, j, k, sx, tx, counter : integer;
begin
    counter := 0;
    repeat
        for m := 1 to 3 do
        begin
            for n := 1 to 3 do
            begin
                // Primero el conteo de las posibilidades del cuadrado
                iniSquare(sq_of);
                mx := setSector(m); // m y n recorren los 9 sectores
                nx := setSector(n); // mx y nx son las esquinas de los sectores (y son valores reales)
                for j := mx to mx + 2 do // j y k son los que recorren los valores reales de los sectores
                begin
                    for k := nx to nx + 2 do
                    begin
                        mp := setPlace(j);
                        np := setPlace(k);
                        if sudoku[j][k] = 0 then
                        begin
                            possibles := [1, 2, 3, 4, 5, 6, 7, 8, 9];
                            checkLine(sudoku, j, possibles);
                            checkColumn(sudoku, k, possibles);
                            checkSquare(sudoku, mx, nx, possibles);
                            sq_of[mp][np] := possibles;
                        end;
                    end;
                end;
                // Por último, ver si hay alguna(s) que aparece(n) una sola vez
                for i := 1 to 9 do
                    n_of_pos[i] := 0;
                for sx := 1 to 3 do
                begin
                    for tx := 1 to 3 do
                    begin
                        for i := 1 to 9 do
                        begin
                            if i in sq_of[sx][tx] then
                                n_of_pos[i] := n_of_pos[i] + 1;
                        end;
                    end;
                end;
                i := 1;
                while (i < 10) do // Moment of truth
                begin
                    if n_of_pos[i] = 1 then
                    begin
                        for sx := 1 to 3 do
                        begin
                            for tx := 1 to 3 do
                            begin
                                if i in sq_of[sx][tx] then
                                    sudoku[mx+(sx-1)][nx+(tx-1)] := i;
                            end;
                        end;
                    end;
                    i := i + 1;
                end;
            end;
        end;
        counter := counter + 1;
    until isFull(sudoku) or (counter = 9000);
    if (counter = 9000) then
        writeln('Cannot be completed in 9000 iterations')
    else
        writeln('Comleted in ', counter, ' iterations');
    writeln;
end;

var
    sudoku : sudoku_arr;

begin
    generate_sketch(sudoku);
    display_sudoku(sudoku);
    solve_sudoku(sudoku);
    display_sudoku(sudoku);
end.