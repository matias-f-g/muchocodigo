{Este programa sirve para pasar de binario a decimal, y de decimal a binario.
Que no te intimide la cantidad de funciones: es bastante fácil de comprender.
Para crearlo, fui copiando el “algoritmo” que usamos en la “vida real”, o sea,
cuando pasamos un número binario a decimal usando lápiz y papel (o la calcula-
dora).
Empecé por el caso más sencillo: el BSS. Después de crear la función para ese
caso, y de revisar cómo funcionaban algunos de los otros sistemas de represen-
tación, me di cuenta que no tenía que volver a calcular todo de nuevo para ca-
da sistema de representación: con una lectura inicial de la cadena binaria era
suficiente. Había que quedarse con dos datos: el valor del módulo, y el del bit
más significativo. A partir de ahí, lo que varía es la interpretación de esas
dos partes. O sea, no sé, capaz lo dijeron 20 veces en clase, pero para mí fue
una revelación.
Después estuve un rato revisando los casos especiales. Y después me puse con el
camino inverso: de decimal a binario.
En este archivo no le di mucha bola a los inputs incorrectos. En la versión de
la página web sí traté de que eso quedara un poco más prolijo.
Tampoco me preocupé demasiado por todos los casos especiales. ¿Te das cuenta
cuáles faltaría tener en cuenta?}

program binary_translator_2ndVersion;

uses SysUtils;

procedure basic_calculator (bi_str: string; var num, pot : longInt);
var i : longInt;
begin
    num := 0;
    pot := 1;
    for i := length(bi_str) downto 2 do
    begin
        num := num + (pot * StrToInt(bi_str[i]));
        pot := pot * 2;
    end;
end;

function ubn_calculator (f_bit, num, pot : longInt) : longInt;
begin
    num := num + (pot * f_bit);
    ubn_calculator := num;
end;

function sbn_calculator (f_bit, num, pot : longInt) : longInt;
begin
    if (f_bit = 1) then
        num := num * (-1);
    sbn_calculator := num;
end;

function one_calculator (f_bit, num, pot : longInt) : longInt;
begin
    if (f_bit = 1) then
        num := (pot - num - 1) * (-1);
    one_calculator := num;
end;

function two_calculator (f_bit, num, pot : longInt) : longInt;
begin
    if (f_bit = 1) then
        num := num - pot;
    two_calculator := num;
end;

function offset_calculator (f_bit, num, pot : longInt) : longInt;
begin
    if (f_bit = 0) then
        num := (pot - num) * (-1);
    offset_calculator := num;
end;

procedure basic_translator (dec_n, n_bits : longInt; var pot : longInt; var b_str : string);
var
    inverted_str : string;
    i, len, aux_digit : integer;
begin
    inverted_str := '';
    dec_n := abs(dec_n);
    pot := 1;
    i := 1;
    repeat
        aux_digit := (dec_n mod 2);
        inverted_str := inverted_str + IntToStr(aux_digit);
        dec_n := dec_n div 2;
        i := i + 1;
        pot := pot * 2;
    until (dec_n = 0);
    if (i >= n_bits) then
        pot := pot div 2;
    for i := i to (n_bits - 1) do
        pot := pot * 2;
    len := length(inverted_str);
    b_str := inverted_str;
    for i := 1 to len do
        b_str[len - (i - 1)] := inverted_str[i];
end;

function ubn_translator (dec_n, n_bits : longInt; bi_str : string) : string;
var
    i, off : integer;
    aux : string;
begin
    if (dec_n >= 0) then
    begin
        if length(bi_str) > n_bits then
            bi_str := 'out of range'
        else
        begin
            if length(bi_str) < n_bits then
            begin
                aux := '';
                off := n_bits - length(bi_str);
                for i := 1 to n_bits do
                    aux := aux + '0';
                for i := length(bi_str) downto 1 do
                    aux[i + off] := bi_str[i];
                bi_str := aux;
            end;
        end;
    end
    else
    begin
        if length(bi_str) > n_bits then
            bi_str := 'not defined and out of range'
        else
            bi_str := 'not defined';
    end;
    ubn_translator := bi_str;
end;

function sbn_translator (dec_n, n_bits : longInt; bi_str : string) : string;
var
    aux, z_aux : string;
    i, j : integer;
begin
    if (length(bi_str) + 1) > n_bits then
        aux := 'out of range'
    else
    begin
        aux := '';
        for i := 1 to n_bits do
            aux := aux + '0';
        if (dec_n < 0) then
            aux[1] := '1';
        i := n_bits;
        j := length(bi_str);
        while (j > 0) do
        begin
            aux[i] := bi_str[j];
            i := i - 1;
            j := j - 1;
        end;
        if (dec_n = 0) then
        begin
            z_aux := aux;
            z_aux[1] := '1';
            aux := aux + ' for 0 and ' + z_aux + ' for -0';
        end;
    end;
    sbn_translator := aux;
end;

function one_translator (dec_n, n_bits : longInt; sbn_str : string) : string;
var
    z_aux, z_aux_minus : string;
    i : integer;
begin
    if (sbn_str <> 'out of range') and (dec_n < 0) then
    begin
        for i := length(sbn_str) downto 2 do
        begin
            if sbn_str[i] = '1' then
                sbn_str[i] := '0'
            else
                sbn_str[i] := '1';
        end;
    end
    else
    begin
        if (dec_n = 0) then
        begin
            z_aux := '';
            z_aux_minus := '';
            for i := 1 to n_bits do
            begin
                z_aux := z_aux + '0';
                z_aux_minus := z_aux_minus + '1';
            end;
            sbn_str := z_aux + ' for 0 and ' + z_aux_minus + ' for -0';
        end;
    end;
    one_translator := sbn_str;
end;

function two_translator (dec_n, n_bits, pot : longInt; sbn_str : string) : string;
var
    i : integer;
begin
    if (sbn_str = 'out of range') then
    begin
        pot := pot * (-1);
        if (dec_n = pot) then
        begin
            sbn_str := '';
            for i := 1 to n_bits do
                sbn_str := sbn_str + '0';
            sbn_str[1] := '1';
        end;
    end
    else
    begin
        if (dec_n < 0) then
        begin
            i := length(sbn_str);
            while (sbn_str[i] = '0') and (i > 1) do
                i := i - 1;
            i := i - 1;
            while (i > 1) do
            begin
                if sbn_str[i] = '1' then
                    sbn_str[i] := '0'
                else
                    sbn_str[i] := '1';
                i := i - 1;
            end;
        end
        else
        begin
            if (dec_n = 0) then
            begin
                sbn_str := '';
                for i := 1 to n_bits do
                    sbn_str := sbn_str + '0';
            end;
        end;
    end;
    two_translator := sbn_str;
end;

function offset_translator (two_str : string) : string;
begin
    if (two_str <> 'out of range') then
    begin
        if two_str[1] = '1' then
            two_str[1] := '0'
        else
            two_str[1] := '1';
    end;
    offset_translator := two_str;
end;

function checkString (bi_str : string) : boolean;
var
    i : integer;
    aux : boolean;
begin
    aux := true;
    for i := 1 to length(bi_str) do
    begin
        if ((bi_str[i] <> '0') and (bi_str[i] <> '1')) then
            aux := false;
    end;
    checkString := aux;
end;

var
    binary_string, aux_string : string;
    option, f_bit, num, pot, decimal_num, n_bits : longInt;

begin
    writeln;
    writeln('------- This is the binary translator -------');
    writeln(' ----------- [just for integers] -----------');
    writeln;
    write('Binary to decimal {0}, decimal to binary {1}: '); readln(option);
    writeln;
    repeat
        writeln('- - - - - - - - - - - - - - - - - - - - - - -');
        writeln;
        if (option = 0) then
        begin
            repeat
                repeat
                    write('// Introduce your unsigned binary number: '); readln(binary_string);
                until checkString(binary_string);
                basic_calculator(binary_string, num, pot);
                f_bit := StrToInt(binary_string[1]);
                writeln('------The unsigned binary number value is ', ubn_calculator(f_bit, num, pot));
                writeln('--------The signed binary number value is ', sbn_calculator(f_bit, num, pot));
                writeln('------------The one´s complement value is ', one_calculator(f_bit, num, pot));
                writeln('------------The two´s complement value is ', two_calculator(f_bit, num, pot));
                writeln('The offset binary (aka excess-N) value is ', offset_calculator(f_bit, num, pot));
                writeln;
                write('Continue {0}, switch to decimal-binary {1}, exit program {2}: '); readln(option);
                writeln;
            until (option <> 0);
        end
        else
        begin
            repeat
                repeat
                    write('// Introduce the number (0 < n < 32) of bits: '); readln(n_bits);
                until (n_bits > 0) and ((n_bits < 32));
                write('// Introduce your decimal number: '); readln(decimal_num);
                basic_translator(decimal_num, n_bits, pot, binary_string);
                writeln('----The unsigned binary number is ', ubn_translator(decimal_num, n_bits, binary_string));
                aux_string := sbn_translator(decimal_num, n_bits, binary_string);
                writeln('------The signed binary number is ', aux_string);
                writeln('----------The one´s complement is ', one_translator(decimal_num, n_bits, aux_string));
                aux_string := two_translator(decimal_num, n_bits, pot, aux_string);
                writeln('----------The two´s complement is ', aux_string);
                writeln('-------------The offset binary is ', offset_translator(aux_string));
                writeln;
                write('Continue {0}, switch to binary-decimal {1}, exit program {2}: '); readln(option);
                writeln;
            until (option <> 0);
            if (option = 1) then
                option := 0;
        end;
    until (option = 2);
end.
