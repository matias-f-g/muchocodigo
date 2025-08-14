program MattDecipher;

var
    key, i, letter : integer;
    plain_text, coded_text : string;

begin
    writeln('(Just for lowercase texts)');
    write('Coded text: '); readln(coded_text);
    for key := 1 to 25 do
    begin
        plain_text := coded_text;
        for i := 1 to length(coded_text) do
        begin
            letter := ord(coded_text[i]);
            if (letter > 96) and (letter < 123) then
                letter := ((letter - key - 71) mod 26) + 97; // -71 ya que es como hacer -97 + 26
            plain_text[i] := chr(letter);
        end;
        writeln('Key ', key, ', plain text: ', plain_text);
    end;
end.