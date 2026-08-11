// ============================================
// ❌⭕ TIC-TAC-TOE - 2 joueurs
// ============================================

class TicTacToe {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.winner = null;
        this.isGameOver = false;
        this.history = [];
        this.scores = [0, 0];
    }

    play(index) {
        if (this.isGameOver) return false;
        if (this.board[index] !== null) return false;

        this.board[index] = this.currentPlayer;
        this.history.push({ index, player: this.currentPlayer });

        if (this.checkWin()) {
            this.winner = this.currentPlayer;
            this.isGameOver = true;
            this.scores[this.currentPlayer === 'X' ? 0 : 1]++;
            return true;
        }

        if (this.board.every(cell => cell !== null)) {
            this.isGameOver = true;
            return true;
        }

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        return true;
    }

    checkWin() {
        const patterns = [
            [0,1,2], [3,4,5], [6,7,8],
            [0,3,6], [1,4,7], [2,5,8],
            [0,4,8], [2,4,6]
        ];

        for (let pattern of patterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                this._winningPattern = pattern;
                return true;
            }
        }
        return false;
    }

    getWinningPattern() {
        return this._winningPattern || [];
    }

    undo() {
        if (this.history.length === 0) return false;
        if (this.isGameOver && this.winner) {
            this.scores[this.winner === 'X' ? 0 : 1]--;
        }

        const lastMove = this.history.pop();
        this.board[lastMove.index] = null;
        this.currentPlayer = lastMove.player;
        this.isGameOver = false;
        this.winner = null;
        this._winningPattern = null;
        return true;
    }

    reset() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.winner = null;
        this.isGameOver = false;
        this.history = [];
        this._winningPattern = null;
    }

    resetScores() {
        this.scores = [0, 0];
    }
}

// ============================================
// 🎨 CONTRÔLEUR
// ============================================

class Controller {
    constructor() {
        this.game = new TicTacToe();
        this.setupEvents();
        this.render();
    }

    setupEvents() {
        document.getElementById('board').addEventListener('click', (e) => {
            const cell = e.target.closest('.cell');
            if (!cell) return;
            if (cell.classList.contains('taken')) return;
            if (this.game.isGameOver) return;

            const index = parseInt(cell.dataset.index);
            this.game.play(index);
            this.render();

            if (this.game.isGameOver && this.game.winner) {
                this.launchConfetti();
            }
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.game.reset();
            this.render();
            document.querySelectorAll('.confetti-container').forEach(el => el.remove());
        });

        document.getElementById('undo-btn').addEventListener('click', () => {
            this.game.undo();
            this.render();
        });

        document.getElementById('reset-score-btn').addEventListener('click', () => {
            this.game.resetScores();
            this.render();
        });
    }

    render() {
        const boardElement = document.getElementById('board');
        const statusElement = document.getElementById('status');
        
        // Efface les lignes de victoire précédentes
        document.querySelectorAll('.win-line').forEach(el => el.remove());

        boardElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (this.game.board[i]) {
                cell.textContent = this.game.board[i];
                cell.classList.add('taken');
                cell.classList.add(this.game.board[i] === 'X' ? 'x' : 'o');
            }
            if (this.game.isGameOver && this.game._winningPattern && 
                this.game._winningPattern.includes(i)) {
                cell.classList.add('win');
            }
            cell.dataset.index = i;
            boardElement.appendChild(cell);
        }

        // Ligne de victoire
        if (this.game.isGameOver && this.game._winningPattern) {
            this.drawWinLine();
        }

        // Statut
        statusElement.className = '';
        if (this.game.isGameOver) {
            if (this.game.winner) {
                statusElement.textContent = `🏆 ${this.game.winner === 'X' ? '❌ Joueur 1' : '⭕ Joueur 2'} a gagné !`;
                statusElement.classList.add('win');
                statusElement.style.color = this.game.winner === 'X' ? '#4facfe' : '#f5576c';
            } else {
                statusElement.textContent = '🤝 Match nul !';
                statusElement.classList.add('win');
                statusElement.style.color = '#ffd700';
            }
        } else {
            statusElement.textContent = `Tour de : ${this.game.currentPlayer === 'X' ? '❌ Joueur 1' : '⭕ Joueur 2'}`;
            statusElement.classList.add(this.game.currentPlayer === 'X' ? 'x-turn' : 'o-turn');
            statusElement.style.color = this.game.currentPlayer === 'X' ? '#4facfe' : '#f5576c';
        }

        document.getElementById('score1').textContent = this.game.scores[0];
        document.getElementById('score2').textContent = this.game.scores[1];

        document.querySelector('.p1').classList.toggle('active', 
            !this.game.isGameOver && this.game.currentPlayer === 'X');
        document.querySelector('.p2').classList.toggle('active', 
            !this.game.isGameOver && this.game.currentPlayer === 'O');

        document.getElementById('undo-btn').disabled = this.game.history.length === 0;
    }

    drawWinLine() {
        const pattern = this.game._winningPattern;
        if (!pattern) return;
        
        const board = document.getElementById('board');
        const cells = board.querySelectorAll('.cell');
        const rect = board.getBoundingClientRect();
        
        // Trouve les coordonnées des cases gagnantes
        const positions = pattern.map(i => {
            const cell = cells[i];
            const cellRect = cell.getBoundingClientRect();
            return {
                x: cellRect.left - rect.left + cellRect.width / 2,
                y: cellRect.top - rect.top + cellRect.height / 2
            };
        });

        const line = document.createElement('div');
        line.className = 'win-line';
        
        const start = positions[0];
        const end = positions[2];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        line.style.width = length + 'px';
        line.style.height = '4px';
        line.style.left = start.x + 'px';
        line.style.top = start.y - 2 + 'px';
        line.style.transform = `rotate(${angle}rad)`;
        line.style.transformOrigin = 'left center';
        line.style.position = 'absolute';
        line.style.pointerEvents = 'none';
        
        board.style.position = 'relative';
        board.appendChild(line);
    }

    launchConfetti() {
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);

        const colors = ['#4facfe', '#f5576c', '#ffd700', '#00f2fe', '#f093fb', '#43e97b'];
        const shapes = ['■', '●', '▲', '★', '♦'];

        for (let i = 0; i < 60; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.textContent = shapes[Math.floor(Math.random() * shapes.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.fontSize = (Math.random() * 10 + 8) + 'px';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confetti.style.animationDelay = (Math.random() * 1.5) + 's';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            container.appendChild(confetti);
        }

        setTimeout(() => {
            container.remove();
        }, 5000);
    }
}

// ============================================
// 🚀 DÉMARRAGE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    new Controller();
});
