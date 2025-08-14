{Básicamente, es un juego de preguntas y respuestas que te permite avanzar a medida que vas respondiendo bien.
 Lo único llamativo es que las respuestas están ocultas. Esto lo hice para que cuando uno lo juega desde Pascal
 no pueda mirar la solución. Para eso armé una función de verificación o validación medio así nomás, pero que
 sirve para esto}

program el_tesoro;

function check (x : longInt) : longInt;
begin
    x := (x * 997) + 1;
    x := (x - 3) * 3;
    check := x mod 101;
end;

var
    ele1, ele2 : longInt;

begin
    writeln;
    writeln('---------------------------------------------');
    writeln('- - - - - EL TESORO DE DARDO ROCHA - - - - -');
    writeln;
    writeln('   Cualquier platense sabe dónde queda el Dardo Rocha, y casi cualquiera sabe');
    writeln('que la persona homenajeada por ese edificio fue el fundador de la ciudad de');
    writeln('La Plata. Empero, casi todos desconocen los manuscritos perdidos (hasta hace');
    writeln('una década) de Dardo Rocha. Muchos de ellos abordan, naturalmente, cuestiones');
    writeln('de francmasonería que el autor nunca quiso publicar, pero que sí tuvo');
    writeln('intenciones de compartirlas post mortem con los miembros de su logia. Por');
    writeln('razones desconocidas, los manuscritos no fueron hallados por sus supuestos');
    writeln('destinatarios (ni por nadie más), hasta que un empleado de la Biblioteca de la');
    writeln('UNLP los encontró, por mera casualidad (y mucho fisgonear), dentro de unos');
    writeln('cajones abandonados que se encontraban en un depósito en desuso. Sin dudas,');
    writeln('el más intrigante de ellos, es el que a continuación se detalla. Para completar la');
    writeln('lectura, usted deberá ir respondiendo correctamente a los acertijos que se le irán presentando.');
    writeln;
    writeln('	A los queridos sucesores de la Constancia Nº 7: es de mi más alto agrado');
    writeln('legarles una misión: recuperar aquello que vuestra generación, o la siguiente,');
    writeln('echará en falta, y que deberá restaurar si quiere ver a su tierra en paz.');
    writeln('	Para comodidad de todas las partes involucradas, para representar simbólicamente');
    writeln('esa carencia futura, elegí un punto ubicado en nuestra luminosa Atenas de América.');
    writeln('Sin embargo, no corresponde develar las coordenadas exactas sin antes verificar');
    writeln('la identidad de quien llegara a leer estas palabras. Por este motivo, las coordenadas');
    writeln('están cifradas, al modo en que una allium cepa se conserva a sí misma. Cuando develen');
    writeln('las coordenadas, descubrirán el lugar y el mesaje que lleva oculto.');
    writeln;
    repeat
        writeln('   Par 1. La cantidad de cuadras entre plazas es un número');
        write('perfecto. El primer elemento es igual a el doble de ese número: '); readln(ele1);
        writeln('Sea n el número perfecto anterior. El segundo elemento es la suma entre n y el');
        write('mayor número que aparece en el renglón n del triángulo de Pascal: '); readln(ele2);
        writeln;
    until (check(ele1) = 31) and (check(ele2) = 77);
    repeat
        write('   Par 2. El primer elemento, es el primer cubo: '); readln(ele1);
        write('El segundo, es el tercer cubo: '); readln(ele2);
        writeln;
    until (check(ele1) = 56) and (check(ele2) = 52);
    repeat
        writeln('   Par 3. El primer elemento es el segundo elemento del sistema de');
        write('base dos, tal como lo propusiera Leibniz: '); readln(ele1);
        write('El segundo elemento, es el primo anterior a nuestra logia: '); readln(ele2);
        writeln;
    until (check(ele1) = 56) and (check(ele2) = 1);
    repeat
        writeln('   zlh sh jpbkhk bu wshuv jhyalzphuv kvukl ls lql e lz sh jhssl buv f ls lql f lz');
        writeln('sh hclupkh zlaluah f kvz, lujbluayl ls jluayv kl sh jpyjbumlylujph klmpupkh wvy');
        writeln('svz aylz whylz vykluhkvz hualypvylz');
        write('Primer elemento: '); readln(ele1);
        write('Segundo elemento: '); readln(ele2);
        writeln;
    until (check(ele1) = 56) and (check(ele2) = 77);
    writeln;
    writeln('jvtwhaypvahz kls mbabyv: bu whpz zpu aylulz, uv jhtpuh; zpu lkbjhjpvu, uv wpluzh. lu tpz apltwvz wyvtlap lealukly bu rpsvtlayv kl cphz wvy jhkh kph kl tp nviplyuv. f sv opjl. cblschu h shz nyhuklz viyhz, uv zlhu jvihyklz. f wvy mhcvy: klqlu kl hbavklzaybpyzl. haal. k.y.');
end.
