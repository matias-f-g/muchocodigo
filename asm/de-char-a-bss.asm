; --> Este programa lee un entero positivo desde
; el teclado y lo pasa a binario sin signo
; --> Para que funcione, hay que ir a configuración
; y agregar teclado y pantalla y PIC
; --> Recomendación: usar sin animaciones y a máxima velocidad
; Importante:
; --> Para dejar de ingresar caracteres, presionar Enter

org 1000h
cadena1 db "Ingrese un número natural: "
cadena2 db "En BSS se escribe así: "
cadena3 db "Saludos terrícolas ;)"
cadena4 db "?"

org 1100h
result dw ?
powers dw 1, 10, 100, 1000, 10000
length db ?
chars db ? ; desde 110Dh

org 3000h
; Lee caracteres desde el teclado hasta que se presiona Enter
; Los guarda desde la dirección de chars
; Pone la cantidad en length
READLN: PUSH BX
        PUSH CX
        MOV BX, OFFSET chars
        MOV CL, 0
        LOOP: INT 6
              INC CL
              INC BX
              MOV CH, [BX - 1]
              CMP CH, 0Ah
              JNZ LOOP
        MOV length, CL
        POP CX
        POP BX
        RET ; llega hasta 301Fh

org 3040h ; Imprime el string chars
WRITELN: PUSH AX
         PUSH BX
         MOV BX, OFFSET chars
         MOV AL, length
         int 7
         POP BX
         POP AX
         RET ; llega hasta 304Eh

org 3060h ; Le da a un dígito su valor correspondiente en el sistema decimal
MULT_TEN: PUSH BX
          PUSH DX
          MOV DX, 0
          MOV BX, OFFSET powers
          ADD BL, CH
          PUSH CX
          MOV CX, [BX]
          MUL: ADD DX, CX
               DEC AL
               JNZ MUL
          MOV AX, DX
          POP CX
          POP DX
          POP BX
          RET

org 3100h ; Traduce chars a hexa y lo guarda en result
TO_HEXA: PUSH AX
         PUSH BX
         PUSH CX
         PUSH DX
         MOV DX, 0
         MOV BX, OFFSET chars ; empezamos con chars
         MOV CL, length
         DEC CL
         JZ empty_string
         MOV CH, CL
         DEC CH
         ADD CH, CH
         DIG: MOV AL, [BX]
              AND AX, 000Fh
              JZ NULO
              CALL MULT_TEN
              ADD DX, AX
              NULO: SUB CH, 2
              INC BX
              DEC CL
              JNZ DIG
         empty_string: MOV result, DX ; llegamos al número
         POP DX
         POP CX
         POP BX
         POP AX
         RET

org 3200h ; Traduce un hexa (tomado de result) a BSS (en chars)
TO_BSS: PUSH AX
        PUSH BX
        PUSH CX
        PUSH DX
        MOV DX, result
        MOV BX, OFFSET chars
        CMP DX, 0
        JNZ NOT_ZERO
        MOV BYTE PTR [BX], '0'
        MOV length, 2
        JMP END_IF2
        NOT_ZERO: MOV CL, -1
                  MOV CH, 1
                  empty_bit: INC CL
                             ADD DX, DX
                             JNC empty_bit
                             JC UNO
                  BIT: ADD DX, DX
                       JC UNO
                         CERO: MOV BYTE PTR [BX], '0'
                         JMP END_IF
                         UNO: MOV BYTE PTR  [BX], '1'
                       END_IF: INC BX
                       INC CH
                       INC CL
                       CMP CL, 16
                       JNZ BIT ; lo pasamos a bits en chars
                  MOV BYTE PTR [BX], 0Ah
                  MOV length, CH
        END_IF2: POP DX
        POP CX
        POP BX
        POP AX
        RET

org 2000h
MOV BX, OFFSET cadena1
MOV AL, OFFSET cadena2 - OFFSET cadena1
int 7
CALL READLN
CALL WRITELN
MOV BX, OFFSET cadena2
MOV AL, OFFSET cadena3 - OFFSET cadena2
int 7
CALL TO_HEXA
CALL TO_BSS
CALL WRITELN
MOV BX, OFFSET cadena3
MOV AL, OFFSET cadena4 - OFFSET cadena3
int 7
int 0
end
