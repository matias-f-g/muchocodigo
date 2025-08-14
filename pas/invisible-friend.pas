{ Este problema es ideal para poner en práctica el tema de la dimensión lógica de un array.
  Básicamente, lo que hay que hacer es reordenar los elementos de un array de forma aleatoria,
  con algunas restricciones para que nadie sea su propio amigo invisible y esas cosas. Además,
  hay que estar atentis de que el experimento no termine en un loop infinito, por eso conviene
  poner algo para cortarlo si lo random malio sal}

program invisible_friend;

const
    limit_f = 100;
    limit_l = limit_f * 2;

var
    names : array [1..limit_f] of string;
    friends_num : array [1..limit_f] of integer;
    friends : set of 1..limit_f;
    rand_f, i : 1..limit_f;
    this_name : string;
    n_part, loop_limit : integer;
    okay : boolean;

begin
    randomize();
    writeln('- - - - - - - - - - - - - - - - - - - - - - - - - -');
    writeln('- - - - - - INVISIBLE FRIEND GENERATOR - - - - - -');
    writeln;
    writeln('You can add up to 100 names.');
    writeln('When you are done, just type "ready".');
    writeln();
    n_part := 0;
    readln(this_name);
    while (this_name <> 'ready') and (n_part < limit_f) do
    begin
        n_part := n_part + 1;
        names[n_part] := this_name;
        readln(this_name);
    end;
    writeln();
    writeln('-------------------------------------');
    writeln();
    if (n_part > 1) then
    begin
        okay := false;
        while (okay = false) do
        begin
            friends := [];
            okay := true;
            for i := 1 to n_part do
            begin
                loop_limit := 0;
                repeat
                    rand_f := random(n_part) + 1;
                    loop_limit := loop_limit + 1;
                until ((not (rand_f in friends)) and (rand_f <> i)) or (loop_limit = limit_l);
                if (loop_limit = limit_l) then
                begin
                    okay := false;
                    break;
                end;
                friends := friends + [rand_f];
                friends_num[i] := rand_f;
            end;
        end;
        for i := 1 to n_part do
            writeln(names[i], ' your friend is ', names[friends_num[i]]);
    end
    else
        writeln('Farewell my friend');
end.
