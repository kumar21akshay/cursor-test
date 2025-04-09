document.addEventListener('DOMContentLoaded', () => {
    // Create chat container
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';
    chatContainer.innerHTML = `
        <div class="chat-header">
            <span>RC Gaming Assistant</span>
            <button class="minimize-chat">−</button>
        </div>
        <div class="chat-messages"></div>
        <div class="chat-input">
            <input type="text" placeholder="Type your message...">
            <button class="send-button">Send</button>
        </div>
    `;
    document.body.appendChild(chatContainer);

    // Game commands and rules
    const gameCommands = {
        'snake': 'snake.html',
        'snake game': 'snake.html',
        'play snake': 'snake.html',
        'tic tac toe': 'tictactoe.html',
        'tictactoe': 'tictactoe.html',
        'play tic tac toe': 'tictactoe.html',
        'x and o': 'tictactoe.html',
        'x o': 'tictactoe.html'
    };

    const gameRules = {
        'snake': [
            "Snake Game Rules:",
            "1. Use arrow keys to control the snake's direction",
            "2. Eat the red food to grow longer and increase your score",
            "3. Avoid hitting the walls or the snake's own body",
            "4. The game ends if the snake crashes into itself or the wall",
            "5. Try to achieve the highest score possible!"
        ],
        'tic tac toe': [
            "Tic Tac Toe Rules:",
            "1. The game is played on a 3x3 grid",
            "2. Players take turns marking a space with X or O",
            "3. The first player to get 3 of their marks in a row (horizontally, vertically, or diagonally) wins",
            "4. If all 9 squares are filled and no player has 3 in a row, the game is a draw",
            "5. Player X always goes first"
        ]
    };

    // Chat functionality
    const chatInput = document.querySelector('.chat-input input');
    const sendButton = document.querySelector('.send-button');
    const minimizeButton = document.querySelector('.minimize-chat');
    const messagesContainer = document.querySelector('.chat-messages');

    // Add message to chat
    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        
        if (Array.isArray(text)) {
            text.forEach(line => {
                const lineElement = document.createElement('div');
                lineElement.textContent = line;
                messageElement.appendChild(lineElement);
            });
        } else {
            messageElement.textContent = text;
        }
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Handle user input
    function handleUserInput(input) {
        if (!input.trim()) return;

        addMessage(input, 'user');
        const response = getResponse(input);
        addMessage(response.message, 'bot');

        if (response.redirect) {
            setTimeout(() => {
                window.location.href = response.redirect;
            }, 1000);
        }

        chatInput.value = '';
    }

    // Get bot response
    function getResponse(input) {
        const lowerInput = input.toLowerCase();
        
        // Check for score requests
        if (lowerInput.includes('score')) {
            const scoreHistory = JSON.parse(localStorage.getItem('snakeScoreHistory') || '[]');
            const highScore = localStorage.getItem('snakeHighScore') || 0;
            
            if (scoreHistory.length === 0) {
                return {
                    message: [
                        "No scores recorded yet!",
                        "Play the Snake game to set your first score."
                    ]
                };
            }

            // Check for highest score query
            if (lowerInput.includes('highest') || lowerInput.includes('high score')) {
                return {
                    message: `The highest score is ${highScore}`
                };
            }

            // Check for specific player score - more strict matching
            const playerMatch = lowerInput.match(/score of (.+)/i) || 
                              lowerInput.match(/score for (.+)/i) ||
                              lowerInput.match(/(.+) score/i) ||
                              lowerInput.match(/what is (.+) score/i) ||
                              lowerInput.match(/what's (.+) score/i);
            
            if (playerMatch) {
                const playerName = playerMatch[1].trim();
                const playerScores = scoreHistory.filter(entry => 
                    entry.player.toLowerCase() === playerName.toLowerCase()
                );

                if (playerScores.length === 0) {
                    return {
                        message: `No scores found for player "${playerName}"`
                    };
                }

                // Get the highest score for this player
                const highestPlayerScore = Math.max(...playerScores.map(entry => entry.score));
                return {
                    message: `${playerName}'s highest score is ${highestPlayerScore}`
                };
            }

            // Only show all scores if explicitly asked for "all scores" or "show scores"
            if (lowerInput.includes('all scores') || lowerInput.includes('show scores') || 
                lowerInput === 'score' || lowerInput === 'scores') {
                let response = [
                    "Here are the recent scores:",
                    `Highest Score: ${highScore}`
                ];

                // Add top 5 scores
                scoreHistory.slice(0, 5).forEach(entry => {
                    response.push(`${entry.player}: ${entry.score} (${entry.date})`);
                });

                return { message: response };
            }

            // Default response for unclear score queries
            return {
                message: [
                    "Please be more specific. You can ask for:",
                    "1. Highest score",
                    "2. Score of a specific player (e.g., 'score of John')",
                    "3. All scores"
                ]
            };
        }
        
        // Check for rules requests first
        if (lowerInput.includes('rules') || lowerInput.includes('how to play') || lowerInput.includes('explain')) {
            if (lowerInput.includes('snake')) {
                return {
                    message: gameRules.snake
                };
            } else if (lowerInput.includes('tic tac toe') || lowerInput.includes('tictactoe') || lowerInput.includes('x and o')) {
                return {
                    message: gameRules['tic tac toe']
                };
            } else if (lowerInput.includes('game')) {
                return {
                    message: [
                        "Which game's rules would you like to know?",
                        "1. Snake Game",
                        "2. Tic Tac Toe",
                        "Please specify the game name in your question."
                    ]
                };
            }
        }

        // Then check for game navigation
        for (const [command, page] of Object.entries(gameCommands)) {
            if (lowerInput.includes(command) && !lowerInput.includes('rules')) {
                return {
                    message: `Taking you to the ${command} game...`,
                    redirect: page
                };
            }
        }

        return {
            message: [
                "I can help you with:",
                "1. Game rules (e.g., 'what are the rules for snake?')",
                "2. Navigating to games (e.g., 'take me to snake game')",
                "3. Checking scores (e.g., 'show me the scores')",
                "Try asking me about any of these!"
            ]
        };
    }

    // Event listeners
    sendButton.addEventListener('click', () => handleUserInput(chatInput.value));
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserInput(chatInput.value);
        }
    });

    minimizeButton.addEventListener('click', () => {
        chatContainer.classList.toggle('minimized');
        minimizeButton.textContent = chatContainer.classList.contains('minimized') ? '+' : '−';
    });

    // Add welcome message
    addMessage([
        "Hello! I'm your gaming assistant.",
        "I can help you with:",
        "1. Navigating to games",
        "2. Explaining game rules",
        "3. Checking game scores",
        "How can I help you today?"
    ], 'bot');
}); 