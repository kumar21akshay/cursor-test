const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
let cards = [];
let flippedCards = [];
let moves = 0;
let matchedPairs = 0;

function initializeGame() {
    // Create pairs of cards
    cards = [...emojis, ...emojis];
    
    // Shuffle cards
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    // Create card elements
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.textContent = emoji;
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
    
    // Reset game state
    flippedCards = [];
    moves = 0;
    matchedPairs = 0;
    updateMoves();
}

function flipCard() {
    // Don't allow flipping if two cards are already flipped
    if (flippedCards.length === 2) return;
    
    // Don't allow flipping the same card twice
    if (this.classList.contains('flipped')) return;
    
    // Flip the card
    this.classList.add('flipped');
    flippedCards.push(this);
    
    // Check for match when two cards are flipped
    if (flippedCards.length === 2) {
        moves++;
        updateMoves();
        
        const [card1, card2] = flippedCards;
        if (card1.textContent === card2.textContent) {
            // Match found
            matchedPairs++;
            flippedCards = [];
            
            // Check if game is won
            if (matchedPairs === emojis.length) {
                setTimeout(() => {
                    alert(`Congratulations! You won in ${moves} moves!`);
                }, 500);
            }
        } else {
            // No match, flip cards back
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
            }, 1000);
        }
    }
}

function updateMoves() {
    document.getElementById('moves').textContent = moves;
}

function restartGame() {
    initializeGame();
}

// Initialize the game when the page loads
window.onload = initializeGame; 