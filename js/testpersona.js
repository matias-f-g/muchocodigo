// testpersona.js

// Preguntas del test
const questions = [
    "¿Tenés un iPhone o una MacBook?",
    "¿Preferís hablar con ChatGPT antes que con tus compañerxs de la facu?",
    "¿Te instalarías un chip de Neuralink?",
    "¿Usás Linux?",
    "¿Tu normalidad es como vivir en cuarentena?",
    "¿Creés que el test driven development es para perdedores?",
    "¿Tu hobby principal es twittear cosas sobre programación?",
    "¿Sos capaz de hackear el SIU Guaraní desde una netbook del Conectar Igualdad?",
    "¿Podrías codear algo que normalmente lleva días en pocos minutos (sin usar IA)?",
    "¿Tu lengua materna es C?",
    "¿Tu código proviene principalmente de Stack Overflow?",
    "¿Usas corpiño?"
];

// Subpreguntas para Linux
const linuxSubQuestions = [
    "¿Kali Linux?",
    "¿Arch Linux?"
];

// Tipos de programadores
const programmerTypes = [
    "Gearhead",
    "Minimalist", 
    "Introvert",
    "Brogrammer",
    "Woman who codes",
    "Codefluencer",
    "Hacker",
    "10x Developer",
    "Lazy Rich Guy",
    "Jaded Old Guy"
];

// Descripciones
const typeDescriptions = [
    "Siempre tenés la última tecnología y el setup más caro. Tu amor por los gadgets no tiene límites.",
    "Menos es más. Tu código es elegante, tu setup es simple, y odias la complejidad innecesaria.",
    "Preferís trabajar solo/a, evitas las reuniones, y tu zona de confort está frente a la pantalla.",
    "Gym, código y cerveza. Convertiste la programación en algo cool y social.",
    "Eres especial: a nivel mundial, menos del 25% de les programadores profesionales son mujeres.",
    "Tu vida gira en torno a las redes sociales tech. Tienes más followers que commits.",
    "Eres el/la místico/a del código. Tu conocimiento de sistemas es casi sobrenatural.",
    "Tu productividad desafía las leyes de la física. Mientras otros luchan, tú ya terminaste.",
    "Programas para ganar dinero fácil, no por pasión. Stack Overflow es tu mejor amigo.",
    "Has visto todo en este mundo del desarrollo. Tu cinismo viene con décadas de experiencia."
];

// Puntajes máximos posibles
const maxScores = [13, 12, 13, 13, 14, 14, 15, 14, 14, 13];

let scores = new Array(10).fill(0);
let currentQuestion = 0;
let isLinuxUser = false;
let linuxSubQuestion = -1; // -1 = no estamos en subpreguntas; 0 = Kali, 1 = Arch

// Referencias DOM
const startScreen = document.getElementById('start-screen');
const questionScreen = document.getElementById('question-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const restartBtn = document.getElementById('restart-btn');
const questionTitle = document.getElementById('question-title');
const questionText = document.getElementById('question-text');
const currentQuestionSpan = document.getElementById('current-question');
const progressFill = document.getElementById('progress-fill');
const resultType = document.getElementById('result-type');
const resultDescription = document.getElementById('result-description');
const finalType = document.getElementById('final-type');
const finalScore = document.getElementById('final-score');

// Cambiar pantallas
function showScreen(screen) {
    document.querySelectorAll('.test-screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

// Progreso (dejamos la barra simple por ahora, la ajustamos después si querés)
function updateProgress() {
    const totalQuestions = questions.length;
    // Nota: la barra no cuenta subpreguntas aún; lo hacemos cuando quieras
    const progress = ((currentQuestion) / totalQuestions) * 100;
    progressFill.style.width = `${progress}%`;
    currentQuestionSpan.textContent = `${Math.min(currentQuestion + 1, totalQuestions)} de ${totalQuestions}`;
    questionTitle.textContent = `Pregunta ${Math.min(currentQuestion + 1, totalQuestions)}/${totalQuestions}`;
}

// Mostrar pregunta o subpregunta
function displayQuestion() {
    if (linuxSubQuestion >= 0 && linuxSubQuestion < linuxSubQuestions.length) {
        // Estamos dentro del bloque Linux -> mostrar subpregunta correspondiente
        questionText.textContent = linuxSubQuestions[linuxSubQuestion];
    } else {
        // Pregunta normal
        questionText.textContent = questions[currentQuestion];
    }
    updateProgress();
}

// Procesar respuesta
function processAnswer(answer) {
    const yes = answer === 'yes';

    // --- Caso especial: subpreguntas de Linux ---
    if (linuxSubQuestion >= 0) {
        if (linuxSubQuestion === 0) { // Kali Linux?
            if (yes) {
                // Si usa Kali, sumar al HACKER (índice 6)
                scores[6] += 2;
                // según Pascal: si dice SÍ a Kali -> termina bloque Linux y sigue
                endLinuxBlock();
                return;
            } else {
                // Si NO usa Kali -> preguntar Arch
                linuxSubQuestion = 1;
                displayQuestion();
                return;
            }
        }

        if (linuxSubQuestion === 1) { // Arch Linux?
            if (yes) {
                // Si usa Arch, sumar puntos para 10x Developer (índice 7)
                scores[7] += 2;
            } else {
                // Si NO usa Arch (pero sí usa algún otro Linux), según tu Pascal:
                // respuestas[2] := respuestas[2] + 1;  => Pascal 1-based index 2 -> JS index 1
                // respuestas[3] := respuestas[3] + 1;  => Pascal index 3 -> JS index 2
                // respuestas[10] := respuestas[10] + 1; => Pascal index 10 -> JS index 9
                scores[1] += 1; // Minimalist (JS idx 1)
                scores[2] += 1; // Introvert  (JS idx 2)
                scores[9] += 1; // Jaded Old Guy (JS idx 9)
            }
            // terminar bloque Linux y continuar
            endLinuxBlock();
            return;
        }
    }

    // --- Lógica principal para preguntas normales ---
    switch(currentQuestion) {
        case 0:
            if (yes) { scores[0]+=2; scores[3]++; scores[4]++; scores[5]++; scores[8]+=2; }
            else { scores[1]++; scores[2]++; scores[6]++; scores[7]++; scores[9]++; }
            break;
        case 1:
            if (yes) { scores[0]++; scores[2]++; }
            else { for(let i of [1,3,4,5,6,7,8,9]) scores[i]++; }
            break;
        case 2:
            if (yes) { scores[0]+=2; }
            else { for(let i=1;i<10;i++) scores[i]++; }
            break;
        case 3: // ¿Usás Linux?
            if (yes) {
                isLinuxUser = true;
                linuxSubQuestion = 0; // arrancamos por Kali
                displayQuestion();
                return; // NO avanzar currentQuestion aún
            } else {
                scores[0]++; scores[3]++; scores[4]++; scores[5]++; scores[8]++;
            }
            break;
        case 4:
            if (yes) { scores[1]++; scores[2]+=2; scores[6]++; scores[9]++; }
            else { for(let i of [0,3,4,5,7,8]) scores[i]++; }
            break;
        case 5:
            if (yes) { scores[3]+=2; scores[5]+=2; scores[8]++; }
            else { for(let i of [0,1,2,4,6,7,9]) scores[i]++; }
            break;
        case 6:
            if (yes) { scores[0]++; scores[3]++; scores[5]+=2; }
            else { for(let i of [1,2,4,6,7,8,9]) scores[i]++; }
            break;
        case 7:
            if (yes) { scores[6]+=3; scores[7]++; }
            else { for(let i=0;i<10;i++) if(i!==6 && i!==7) scores[i]++; }
            break;
        case 8:
            if (yes) { scores[7]+=2; }
            else { for(let i=0;i<10;i++) if(i!==7) scores[i]++; }
            break;
        case 9:
            if (yes) { scores[9]+=2; }
            else { for(let i=0;i<9;i++) scores[i]++; }
            break;
        case 10:
            if (yes) { scores[1]++; scores[3]++; scores[5]++; scores[8]+=2; }
            else { for(let i of [2,4,6,7,9]) scores[i]++; }
            break;
        case 11:
            if (yes) { scores[4]+=3; }
            else { scores[0]++; scores[4]-=2; for(let i of [1,2,3,5,6,7,8,9]) scores[i]++; }
            break;
    }

    // Avanzar
    currentQuestion++;
    if (currentQuestion < questions.length) displayQuestion();
    else showResults();
}

// Finaliza bloque de subpreguntas Linux y continúa
function endLinuxBlock() {
    linuxSubQuestion = -1;
    isLinuxUser = false;
    currentQuestion++; // ya contabilizamos la pregunta "Usás Linux?"
    if (currentQuestion < questions.length) displayQuestion();
    else showResults();
}

// Mostrar resultados
function showResults() {
    let maxScore = Math.max(...scores);
    let winnerIndex = scores.indexOf(maxScore);
    if (maxScore < 0) maxScore = 0;
    const certaintyPercentage = Math.round((maxScore / maxScores[winnerIndex]) * 100);
    resultType.textContent = programmerTypes[winnerIndex];
    resultDescription.textContent = typeDescriptions[winnerIndex];
    finalType.textContent = programmerTypes[winnerIndex];
    finalScore.textContent = `${certaintyPercentage}%`;
    showScreen(resultScreen);
}

// Reset
function resetTest() {
    currentQuestion = 0;
    scores = new Array(10).fill(0);
    isLinuxUser = false;
    linuxSubQuestion = -1;
    showScreen(startScreen);
}

// Eventos
startBtn.addEventListener('click', () => { showScreen(questionScreen); displayQuestion(); });
yesBtn.addEventListener('click', () => processAnswer('yes'));
noBtn.addEventListener('click', () => processAnswer('no'));
restartBtn.addEventListener('click', resetTest);

// Init
showScreen(startScreen);