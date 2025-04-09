const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const scoreTableBody = document.querySelector('#scoreTable tbody');
const nameForm = document.getElementById('nameForm');
const gameContent = document.getElementById('gameContent');
const playerNameInput = document.getElementById('playerName');
const startGameBtn = document.getElementById('startGameBtn');
const currentPlayerElement = document.getElementById('currentPlayer');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {};
let direction = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;
let gameSpeed = 100;
let gameStarted = false;
let currentPlayer = '';

// Load score history from localStorage
let scoreHistory = JSON.parse(localStorage.getItem('snakeScoreHistory') || '[]');
updateScoreTable();

highScoreElement.textContent = highScore;

// Handle name form submission
startGameBtn.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    if (playerName) {
        currentPlayer = playerName;
        currentPlayerElement.textContent = playerName;
        nameForm.style.display = 'none';
        gameContent.style.display = 'flex';
        initGame();
        startGame();
    } else {
        alert('Please enter your name to start the game!');
    }
});

function initGame() {
    snake = [
        { x: 5, y: 5 }
    ];
    direction = 'right';
    score = 0;
    scoreElement.textContent = score;
    generateFood();
    drawGame();
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            break;
        }
    }
}

function drawGame() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00ff88';
    for (let segment of snake) {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    }
    
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function moveSnake() {
    const head = { ...snake[0] };
    
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        generateFood();
    } else {
        snake.pop();
    }
}

function gameOver() {
    clearInterval(gameLoop);
    gameStarted = false;
    
    const date = new Date().toLocaleDateString();
    scoreHistory.unshift({ 
        player: currentPlayer,
        date, 
        score 
    });
    
    if (scoreHistory.length > 10) {
        scoreHistory = scoreHistory.slice(0, 10);
    }
    
    localStorage.setItem('snakeScoreHistory', JSON.stringify(scoreHistory));
    updateScoreTable();
    
    // Create game over message with options
    const gameOverMessage = `Game Over! Your score: ${score}\n\nClick OK to play again or Cancel to go back to the menu.`;
    
    if (confirm(gameOverMessage)) {
        // Play again with same player
        initGame();
        startGame();
    } else {
        // Go back to the menu
        nameForm.style.display = 'block';
        gameContent.style.display = 'none';
        playerNameInput.value = '';
    }
}

function updateScoreTable() {
    scoreTableBody.innerHTML = '';
    scoreHistory.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.player}</td>
            <td>${entry.date}</td>
            <td>${entry.score}</td>
        `;
        scoreTableBody.appendChild(row);
    });
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        gameLoop = setInterval(() => {
            moveSnake();
            drawGame();
        }, gameSpeed);
    }
}

document.addEventListener('keydown', (event) => {
    if (!gameStarted) return;
    
    switch (event.key) {
        case 'ArrowUp':
            if (direction !== 'down') direction = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') direction = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') direction = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') direction = 'right';
            break;
    }
}); 