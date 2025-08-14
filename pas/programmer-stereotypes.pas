{Básicamente es un vector contador que con cada pregunta suma 1 o más puntos a alguna personalidad.
 Al final toma el máximo, y listo}

program test_Programmer_Stereotype;

const n_tipos = 10;

type
    cant_tipo = array [1..10] of integer; // Una por cada tipo
    lista_tipos = (gearhead, minimalist, introvert, brogrammer, woman_who_codes, codefluencer, hacker, TENx_developer, lazy_rich_guy, jaded_old_guy);

var
    respuestas : cant_tipo;
    tu_tipo : lista_tipos;
    resp_char : char;
    i, index_max, real_max : integer;

begin
    writeln();
    writeln('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
    writeln('- - - - ¿Qué {estereo}tipo de programador/a/e sos? - - - -');
    writeln('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
    writeln('Para saberlo, deberás responder 12 preguntas.');
    writeln('Todas son por sí o por no, con s y n, respectivamente.');
    write('Arrancamos?: '); readln(resp_char);
    if (resp_char = 's') then
    begin
        for i := 1 to n_tipos do // Inicializa los estereotipos en 0
            respuestas[i] := 0;
        writeln();
        write('{1} Tenés un iPhone o una MacBook?: '); readln(resp_char);
        if (resp_char = 's') then
        begin
            respuestas[1] := respuestas[1] + 2;
            respuestas[4] := respuestas[4] + 1;
            respuestas[5] := respuestas[5] + 1;
            respuestas[6] := respuestas[6] + 1;
            respuestas[9] := respuestas[9] + 2;
        end
        else
        begin
            respuestas[2] := respuestas[2] + 1;
            respuestas[3] := respuestas[3] + 1;
            respuestas[7] := respuestas[7] + 1;
            respuestas[8] := respuestas[8] + 1;
            respuestas[10] := respuestas[10] + 1;
        end;
        write('{2} Preferís hablar con ChatGPT antes que con tus compañerxs de la facu?: '); readln(resp_char);
        if (resp_char = 's') then
        begin
            respuestas[1] := respuestas[1] + 1;
            respuestas[3] := respuestas[3] + 1;
        end
        else
        begin
            respuestas[2] := respuestas[2] + 1;
            respuestas[4] := respuestas[4] + 1;
            respuestas[5] := respuestas[5] + 1;
            respuestas[6] := respuestas[6] + 1;
            respuestas[7] := respuestas[7] + 1;
            respuestas[8] := respuestas[8] + 1;
            respuestas[9] := respuestas[9] + 1;
            respuestas[10] := respuestas[10] + 1;
        end;
        write('{3} Te instalarías un chip de Neuralink?: '); readln(resp_char);
        if (resp_char = 's') then
            respuestas[1] := respuestas[1] + 2
        else
        begin
            respuestas[2] := respuestas[2] + 1;
            respuestas[3] := respuestas[3] + 1;
            respuestas[4] := respuestas[4] + 1;
            respuestas[5] := respuestas[5] + 1;
            respuestas[6] := respuestas[6] + 1;
            respuestas[7] := respuestas[7] + 1;
            respuestas[8] := respuestas[8] + 1;
            respuestas[9] := respuestas[9] + 1;
            respuestas[10] := respuestas[10] + 1;
        end;
        write('{4} Usás Linux?: '); readln(resp_char);
        if (resp_char = 's') then
        begin
            write('{4.2} Kali Linux?: '); readln(resp_char);
            if (resp_char = 's') then
                respuestas[7] := respuestas[7] + 2
            else
            begin
                write('{4.2} Arch Linux?: '); readln(resp_char);
                if (resp_char = 's') then
                    respuestas[8] := respuestas[8] + 2
                else
                begin
                    respuestas[2] := respuestas[2] + 1;
                    respuestas[3] := respuestas[3] + 1;
                    respuestas[10] := respuestas[10] + 1;
                end;
            end;
        end
        else
        begin
            respuestas[1] := respuestas[1] + 1;
            respuestas[4] := respuestas[4] + 1;
            respuestas[5] := respuestas[5] + 1;
            respuestas[6] := respuestas[6] + 1;
            respuestas[9] := respuestas[9] + 1;
        end;
        write('{5} Tu normalidad es como vivir en cuarentena?: '); readln(resp_char);
        if (resp_char = 's') then
        begin
            respuestas[2] := respuestas[2] + 1;
            respuestas[3] := respuestas[3] + 2;
            respuestas[7] := respuestas[7] + 1;
            respuestas[10] := respuestas[10] + 1;
        end
        else
        begin
            respuestas[1] := respuestas[1] + 1;
            respuestas[4] := respuestas[4] + 1;
            respuestas[5] := respuestas[5] + 1;
            respuestas[6] := respuestas[6] + 1;
            respuestas[8] := respuestas[8] + 1;
            respuestas[9] := respuestas[9] + 1;
        end;
        write('{6} Creés que el test driven development es para perdedores?: '); readln(resp_char);
        if (resp_char = 's') then
        begin
            respuestas[4] := respuestas[4] + 2;
            respuestas[6] := respuestas[6] + 2;
            respuestas[9] := respuestas[9] + 1;
        end
        else
        begin
            respuestas[1] := respuestas[1] + 1;
            respuestas[2] := respuestas[2] + 1;
            respuestas[3] := respuestas[3] + 1;
            respuestas[5] := respuestas[5] + 1;
            respuestas[7] := respuestas[7] + 1;
            respuestas[8] := respuestas[8] + 1;
            respuestas[10] := respuestas[10] + 1;
        end;
        write('{7} Tu hobby principal es twittear cosas sobre programación?: '); readln(resp_char);
        if (resp_char = 's') then
        begin
            respuestas[1] := respuestas[1] + 1;
            respuestas[4] := respuestas[4] + 1;
            respuestas[6] := respuestas[6] + 2;
        end
        else
        begin
            respuestas[2] := respuestas[2] + 1;
            respuestas[3] := respuestas[3] + 1;
            respuestas[5] := respuestas[5] + 1;
            respuestas[7] := respuestas[7] + 1;
            respuestas[8] := respuestas[8] + 1;
            respuestas[9] := respuestas[9] + 1;
            respuestas[10] := respuestas[10] + 1;
        end;
        write('{8} Sos capaz de hackear el SIU Guaraní desde una netbook del Conectar Igualdad?: '); readln(resp_char);
        if (resp_char = 's') then
        begin
            respuestas[7] := respuestas[7] + 3;
            respuestas[8] := respuestas[8] + 1;
        end
        else
        begin
            respuestas[1] := respuestas[1] + 1;
            respuestas[2] := respuestas[2] + 1;
            respuestas[3] := respuestas[3] + 1;
            respuestas[4] := respuestas[4] + 1;
            respuestas[5] := respuestas[5] + 1;
            respuestas[6] := respuestas[6] + 1;
            respuestas[9] := respuestas[9] + 1;
            respuestas[10] := respuestas[10] + 1;
        end;
        write('{9} Podrías codear algo que normalmente lleva días en pocos minutos (sin usar IA)?: '); readln(resp_char);
        if (resp_char = 's') then
        begin
            respuestas[8] := respuestas[8] + 2;
        end
        else
        begin
            respuestas[1] := respuestas[1] + 1;
            respuestas[2] := respuestas[2] + 1;
            respuestas[3] := respuestas[3] + 1;
            respuestas[4] := respuestas[4] + 1;
            respuestas[5] := respuestas[5] + 1;
            respuestas[6] := respuestas[6] + 1;
            respuestas[7] := respuestas[7] + 1;
            respuestas[9] := respuestas[9] + 1;
            respuestas[10] := respuestas[10] + 1;
        end;
        write('{10} Tu lengua materna es C?: '); readln(resp_char);
        if (resp_char = 's') then
        begin
            respuestas[10] := respuestas[10] + 2;
        end
        else
        begin
            respuestas[1] := respuestas[1] + 1;
            respuestas[2] := respuestas[2] + 1;
            respuestas[3] := respuestas[3] + 1;
            respuestas[4] := respuestas[4] + 1;
            respuestas[5] := respuestas[5] + 1;
            respuestas[6] := respuestas[6] + 1;
            respuestas[7] := respuestas[7] + 1;
            respuestas[8] := respuestas[8] + 1;
            respuestas[9] := respuestas[9] + 1;
        end;
        write('{11} Tu código proviene principalmente de Stack Overflow?: '); readln(resp_char);
        if (resp_char = 's') then
        begin
            respuestas[2] := respuestas[2] + 1;
            respuestas[4] := respuestas[4] + 1;
            respuestas[6] := respuestas[6] + 1;
            respuestas[9] := respuestas[9] + 2;
        end
        else
        begin
            respuestas[3] := respuestas[3] + 1;
            respuestas[5] := respuestas[5] + 1;
            respuestas[7] := respuestas[7] + 1;
            respuestas[8] := respuestas[8] + 1;
            respuestas[10] := respuestas[10] + 1;
        end;
        write('{12} Usas corpiño?: '); readln(resp_char);
        if (resp_char = 's') then
        begin
            respuestas[5] := respuestas[5] + 3;
        end
        else
        begin
            respuestas[1] := respuestas[1] + 1;
            respuestas[5] := respuestas[5] - 2;
            respuestas[2] := respuestas[2] + 1;
            respuestas[3] := respuestas[3] + 1;
            respuestas[4] := respuestas[4] + 1;
            respuestas[6] := respuestas[6] + 1;
            respuestas[7] := respuestas[7] + 1;
            respuestas[8] := respuestas[8] + 1;
            respuestas[9] := respuestas[9] + 1;
            respuestas[10] := respuestas[10] + 1;
        end;
        {Acá comienza el análisis de las respuestas}
        real_max := respuestas[1];
        index_max := 1;
        for i := 2 to n_tipos do
        begin    
            if (respuestas[i] > real_max) then
            begin
                real_max := respuestas[i];
                index_max := i;
            end;
        end;
        index_max := index_max - 1;
        tu_tipo := lista_tipos(index_max);
        writeln();
        writeln();
        writeln('Congratulations!! You are the ', tu_tipo, ' stereotype');
        writeln();
        writeln('(Si no sabés qué significa, podés verlo en YouTube buscando "10 Programmer Stereotypes, Fireship")');
    end
    else
        writeln('gracias vuelva prontoss');
end.
