{Este programa utiliza muchas de las funciones ya creadas en
 los programas anteriores (binary translator y binary calculator)
 para calcular números binarios en punto flotante, o sea con
 matisa y exponente de distintos tipos}

program puntos_flotantes;

uses SysUtils, Math;

procedure basic_int_calc (bi_str: string; var num, pot : longInt);
var i : integer;
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


function manti_entera (opt2 : integer; mant_str : string) : longInt;
var
    num, pot, f_bit : longInt;
begin
    basic_int_calc(mant_str, num, pot);
    f_bit := StrToInt(mant_str[1]);
    if opt2 = 0 then
        manti_entera := ubn_calculator(f_bit, num, pot)
    else
        manti_entera := sbn_calculator(f_bit, num, pot);
end;

function ubn_frac (mant_str : string) : real;
var i : integer;
    pot : longInt;
    num : real;
begin
    num := 0;
    pot := 1;
    for i := 1 to length(mant_str) do
    begin
        pot := pot * 2;
        num := num + ((1/pot) * StrToInt(mant_str[i]));
    end;
    ubn_frac := num;
end;

function sbn_frac (mant_str : string) : real;
var i : integer;
    pot : longInt;
    num : real;
begin
    num := 0;
    pot := 1;
    for i := 2 to length(mant_str) do
    begin
        pot := pot * 2;
        num := num + ((1/pot) * StrToInt(mant_str[i]));
    end;
    if mant_str[1] = '1' then
        num := num * (-1);
    sbn_frac := num;
end;

function manti_fracc (opt2 : integer; mant_str : string) : real;
begin
    if opt2 = 0 then
        manti_fracc := ubn_frac (mant_str)
    else
        manti_fracc := sbn_frac (mant_str);
end;

var
    opt1, opt2 : integer;
    bi_str : string;
    mant_num, expo_num : real;
    f_bit, num, pot : longInt;

begin
    write('Mantisa entera {0}, fraccionaria {1}: '); readln(opt1);
    write('Expresada en BSS {0}, BCS {1}: '); readln(opt2);
    write('Ingrese la mantisa: '); readln(bi_str);
    case opt1 of
        0 : mant_num := manti_entera(opt2, bi_str);
        1 : mant_num := manti_fracc(opt2, bi_str);
    end;
    writeln(mant_num:0:8);
    write('Exponente en BSS {0}, BCS {1}, Ca1{2}, Ca2{3}, Ex{4}: '); readln(opt1);
    write('Ingrese el exponente: '); readln(bi_str);
    basic_int_calc(bi_str, num, pot);
    f_bit := StrToInt(bi_str[1]);
    case opt1 of
        0 : expo_num := ubn_calculator(f_bit, num, pot);
        1 : expo_num := sbn_calculator(f_bit, num, pot);
        2 : expo_num := one_calculator(f_bit, num, pot);
        3 : expo_num := two_calculator(f_bit, num, pot);
        4 : expo_num := offset_calculator(f_bit, num, pot);
    end;
    expo_num := power(2, expo_num);
    expo_num := mant_num * expo_num;
    writeln('El número es: ', expo_num:0:8);
end.
