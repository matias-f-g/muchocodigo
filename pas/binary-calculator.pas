{No tiene mucha ciencia: lo más complicado es el manejo de los strings quizás.
 Básicamente simula una suma o una resta con n bits de la ALU.
 Quedó un poco largo porque da el resultado en muchas representaciones distintas.
 Y le añadí eso más que nada porque las funciones ya las había hecho para el binary-translator,
 y porque hay un ejercicio de la práctica de Organización de computadoras que te pide
 hacer ese análisis.}

program binary_calculator;

uses SysUtils;

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

function zeroFlag (res_int : integer) : integer;
begin
    if (res_int <> 0) then
        zeroFlag := 0
    else
        zeroFlag := 1;
end;

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

procedure ubn_interpreter (opt : integer; ff_bit, fs_bit, fr_bit, fir_num, sec_num, res_num, fir_pot, sec_pot, res_pot : longInt);
var
    num1, num2, num3 : longInt;
    correctness : boolean;
begin
    num1 := ubn_calculator(ff_bit, fir_num, fir_pot);
    num2 := ubn_calculator(fs_bit, sec_num, sec_pot);
    num3 := ubn_calculator(fr_bit, res_num, res_pot);
    if (opt = 0) then
    begin
        correctness := ((num1 + num2) = num3);
        writeln('UBN: ', num1, ' + (', num2, ') = ', num3, ' is ', correctness);
    end
    else
    begin
        correctness := ((num1 - num2) = num3);
        writeln('UBN: ', num1, ' - (', num2, ') = ', num3, ' is ', correctness);
    end;
end;

procedure sbn_interpreter (opt : integer; ff_bit, fs_bit, fr_bit, fir_num, sec_num, res_num, fir_pot, sec_pot, res_pot : longInt);
var
    num1, num2, num3 : longInt;
    correctness : boolean;
begin
    num1 := sbn_calculator(ff_bit, fir_num, fir_pot);
    num2 := sbn_calculator(fs_bit, sec_num, sec_pot);
    num3 := sbn_calculator(fr_bit, res_num, res_pot);
    if (opt = 0) then
    begin
        correctness := ((num1 + num2) = num3);
        writeln('SBN: ', num1, ' + (', num2, ') = ', num3, ' is ', correctness);
    end
    else
    begin
        correctness := ((num1 - num2) = num3);
        writeln('SBN: ', num1, ' - (', num2, ') = ', num3, ' is ', correctness);
    end;
end;

procedure one_interpreter (opt : integer; ff_bit, fs_bit, fr_bit, fir_num, sec_num, res_num, fir_pot, sec_pot, res_pot : longInt);
var
    num1, num2, num3 : longInt;
    correctness : boolean;
begin
    num1 := one_calculator(ff_bit, fir_num, fir_pot);
    num2 := one_calculator(fs_bit, sec_num, sec_pot);
    num3 := one_calculator(fr_bit, res_num, res_pot);
    if (opt = 0) then
    begin
        correctness := ((num1 + num2) = num3);
        writeln('ONE: ', num1, ' + (', num2, ') = ', num3, ' is ', correctness);
    end
    else
    begin
        correctness := ((num1 - num2) = num3);
        writeln('ONE: ', num1, ' - (', num2, ') = ', num3, ' is ', correctness);
    end;
end;

procedure two_interpreter (opt : integer; ff_bit, fs_bit, fr_bit, fir_num, sec_num, res_num, fir_pot, sec_pot, res_pot : longInt);
var
    num1, num2, num3 : longInt;
    correctness : boolean;
begin
    num1 := two_calculator(ff_bit, fir_num, fir_pot);
    num2 := two_calculator(fs_bit, sec_num, sec_pot);
    num3 := two_calculator(fr_bit, res_num, res_pot);
    if (opt = 0) then
    begin
        correctness := ((num1 + num2) = num3);
        writeln('TWO: ', num1, ' + (', num2, ') = ', num3, ' is ', correctness);
    end
    else
    begin
        correctness := ((num1 - num2) = num3);
        writeln('TWO: ', num1, ' - (', num2, ') = ', num3, ' is ', correctness);
    end;
end;

procedure off_interpreter (opt : integer; ff_bit, fs_bit, fr_bit, fir_num, sec_num, res_num, fir_pot, sec_pot, res_pot : longInt);
var
    num1, num2, num3 : longInt;
    correctness : boolean;
begin
    num1 := offset_calculator(ff_bit, fir_num, fir_pot);
    num2 := offset_calculator(fs_bit, sec_num, sec_pot);
    num3 := offset_calculator(fr_bit, res_num, res_pot);
    if (opt = 0) then
    begin
        correctness := ((num1 + num2) = num3);
        writeln('OFF: ', num1, ' + (', num2, ') = ', num3, ' is ', correctness);
    end
    else
    begin
        correctness := ((num1 - num2) = num3);
        writeln('OFF: ', num1, ' - (', num2, ') = ', num3, ' is ', correctness);
    end;
end;

procedure add_by (fir, sec : string; var res : string; var c : integer);
var
    preRes : string;
    i, a, b, aux : integer;
begin
    res := fir;
    c := 0;
    for i := length(fir) downto 1 do
    begin
        a := StrToInt(fir[i]);
        b := StrToInt(sec[i]);
        aux := a + b + c;
        preRes := IntToStr(aux mod 2);
        res[i] := preRes[1];
        if (aux > 1) then
            c := 1
        else
            c := 0;
    end;
end;

procedure borrow_me (i : integer; var fir : string; sec : string; var a, c : integer);
var
    i_aux, digit_int : integer;
    digit_str : string;
begin
    i_aux := i;
    repeat
        i := i_aux;
        while (fir[i] = '0') and (i > 0) do
            i := i - 1;
        if i = 0 then
            c := 1
        else
        begin
            digit_int := StrToInt(fir[i]) - 1;
            digit_str := IntToStr(digit_int);
            fir[i] := digit_str[1];
        end;
        i := i + 1;
        fir[i] := '2';
    until (fir[i_aux] >= sec[i_aux]);
    a := StrToInt(fir[i]);
end;

procedure sub_by (fir, sec : string; var res : string; var c : integer);
var
    preRes : string;
    i, a, b, aux : integer;
begin
    res := fir;
    c := 0;
    for i := length(fir) downto 1 do
    begin
        a := StrToInt(fir[i]);
        b := StrToInt(sec[i]);
        if (a = 0) and (b = 1) then
            borrow_me(i, fir, sec, a, c);
        aux := a - b;
        preRes := IntToStr(aux);
        res[i] := preRes[1];
    end;
end;

var
    fir, sec, res_str : string;
    c, opt : integer;
    fir_num, sec_num, res_num, fir_pot, sec_pot, res_pot, ff_bit, fs_bit, fr_bit : longInt;

begin
    writeln;
    writeln('This program adds or subtracts two binary numbers of the same length');
    writeln('and analyzes the operands with different representation systems,');
    writeln('checking which ones are correct.');
    writeln;
    writeln('-------------------------------------------------------------------');
    writeln;
    write('Add {0}, subtract {1}, or exit program {2}: '); readln(opt);
    while (opt <> 2) do
    begin
        writeln;
        repeat
            write('1st number: '); readln(fir);
        until checkString(fir);
        repeat
            write('2nd number: '); readln(sec);
        until (checkString(sec) and (length(fir) = length(sec)));
        if opt = 0 then
            add_by(fir, sec, res_str, c)
        else
            sub_by(fir, sec, res_str, c);
        writeln('The result: ', res_str);
        writeln('Carry Flag: ', c);
        writeln();
        basic_calculator(fir, fir_num, fir_pot);
        basic_calculator(sec, sec_num, sec_pot);
        basic_calculator(res_str, res_num, res_pot);
        ff_bit := StrToInt(fir[1]);
        fs_bit := StrToInt(sec[1]);
        fr_bit := StrToInt(res_str[1]);
        ubn_interpreter(opt, ff_bit, fs_bit, fr_bit, fir_num, sec_num, res_num, fir_pot, sec_pot, res_pot);
        sbn_interpreter(opt, ff_bit, fs_bit, fr_bit, fir_num, sec_num, res_num, fir_pot, sec_pot, res_pot);
        one_interpreter(opt, ff_bit, fs_bit, fr_bit, fir_num, sec_num, res_num, fir_pot, sec_pot, res_pot);
        two_interpreter(opt, ff_bit, fs_bit, fr_bit, fir_num, sec_num, res_num, fir_pot, sec_pot, res_pot);
        off_interpreter(opt, ff_bit, fs_bit, fr_bit, fir_num, sec_num, res_num, fir_pot, sec_pot, res_pot);
        writeln;
        write('Add {0}, subtract {1}, or exit program {2}: '); readln(opt);
    end;
end.
