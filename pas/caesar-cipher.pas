program MattCipher;

var
    key, i, letter : integer;
    plain_text, coded_text : string;

begin
    writeln('(Just for lowercase)');
    write('Key number: '); readln(key);
    write('Message: '); readln(plain_text);
    key := key mod 26;
    coded_text := plain_text;
    for i := 1 to length(plain_text) do
    begin
        letter := ord(plain_text[i]);
        if (letter > 96) and (letter < 123) then
            letter := ((letter - 97 + key) mod 26) + 97;
        coded_text[i] := chr(letter);
    end;
    writeln('Coded text: ', coded_text);
end.