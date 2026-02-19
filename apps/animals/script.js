const questionImage = document.getElementById('question-image');
const questionText = document.getElementById('question');
const options = document.querySelectorAll('.option');
const scoreElement = document.getElementById('score');
const opportunitiesElement = document.getElementById('opportunities');

// Añadir sonidos
const errorSound = new Audio('error.mp3');
const winSound = new Audio('win.wav');

// Crear mensaje de "Game Over"
const gameOverMessage = document.createElement('div');
gameOverMessage.id = 'game-over';
gameOverMessage.style.display = 'none';
gameOverMessage.style.position = 'absolute';
gameOverMessage.style.top = '50%';
gameOverMessage.style.left = '50%';
gameOverMessage.style.transform = 'translate(-50%, -50%)';
gameOverMessage.style.fontSize = '3em';
gameOverMessage.style.color = 'red';
gameOverMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
gameOverMessage.style.padding = '20px';
gameOverMessage.style.borderRadius = '10px';
gameOverMessage.style.textAlign = 'center';
gameOverMessage.style.animation = 'fadeIn 2s ease-in-out';
document.body.appendChild(gameOverMessage);

// Inicialización
let shuffledQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let opportunities = 3;

function shuffleQuestions() {
    shuffledQuestions = [...questions];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
    }
}

function updateUI() {
    scoreElement.textContent = `Score: ${score}`;
    opportunitiesElement.textContent = `Opportunities Left: ${opportunities}`;
    gameOverMessage.innerHTML = `GAME OVER<br>Score: ${score}<br>Opportunities Left: ${opportunities}`;
}

function loadQuestion() {
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    questionImage.src = currentQuestion.image;
    questionText.textContent = currentQuestion.question;

    options.forEach((option, index) => {
        option.textContent = currentQuestion.answers[index];
        option.onclick = () => checkAnswer(option.textContent);
    });
}

function checkAnswer(selectedAnswer) {
    const currentQuestion = shuffledQuestions[currentQuestionIndex];

    if (selectedAnswer === currentQuestion.correct) {
        winSound.play(); // Reproducir sonido correcto
        score += 10;
        currentQuestionIndex++;

        if (currentQuestionIndex < shuffledQuestions.length) {
            setTimeout(() => {
                updateUI();
                loadQuestion();
            }, 1000);
        } else {
            setTimeout(() => {
                updateUI();
            }, 1000);
        }
    } else {
        errorSound.play(); // Reproducir sonido de error
        opportunities--;
        updateUI();

        if (opportunities === 0) {
            setTimeout(() => {
                gameOverMessage.style.display = 'block';
                setTimeout(() => {
                    gameOverMessage.style.display = 'none';
                    currentQuestionIndex = 0;
                    score = 0;
                    opportunities = 3;
                    shuffleQuestions();
                    updateUI();
                    loadQuestion();
                }, 4000);
            }, 1000);
        }
    }
}

shuffleQuestions();
updateUI();
loadQuestion();
