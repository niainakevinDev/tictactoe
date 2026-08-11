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
        this.scores = [0, 0]; // [X, O]
    }

    // ============================================
    // JOUER UN COUP
    // ============================================

    play(index) {
        if (this.isGameOver) return false;
        if (this.board[index] !== null) return false;

        // Joue le coup
        this.board[index] = this.currentPlayer;
        this.history.push({ index, player: this.currentPlayer });

        // Vérifie la victoire
        if (this.checkWin()) {
            this.winner = this.currentPlayer;
            this.isGameOver = true;
            this.scores[this.currentPlayer === 'X' ? 0 : 1]++;
            return true;
        }

        // Vérifie le match nul
        if (this.board.every(cell => cell !== null)) {
            this.isGameOver = true;
            return true;
        }

        // Change de joueur
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        return true;
    }

    // ============================================
    // VÉRIFICATION VICTOIRE
    // ============================================

    checkWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Lignes
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colonnes
            [0, 4, 8], [2, 4, 6]             // Diagonales
        ];

        for (let pattern of winPatterns) {
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

    // ============================================
    // ANNULER
    // ============================================

    undo() {
        if (this.history.length === 0) return false;
        if (this.isGameOver && this.winner) {
            // Si victoire, on retire le point
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

    // ============================================
    // RÉINITIALISATION
    // ============================================

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

    // ============================================
    // RENDU HTML
    // ============================================

    render() {
        const boardElement = document.getElementById('board');
        const statusElement = document.getElementById('status');
        
        // Met à jour le plateau
        boardElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (this.board[i]) {
                cell.textContent = this.board[i];
                cell.classList.add('taken');
                cell.classList.add(this.board[i] === 'X' ? 'x' : 'o');
            }
            if (this.isGameOver && this._winningPattern && this._winningPattern.includes(i)) {
                cell.classList.add('win');
            }
            cell.dataset.index = i;
            boardElement.appendChild(cell);
        }

        // Met à jour le statut
        if (this.isGameOver) {
            if (this.winner) {
                statusElement.textContent = `🏆 ${this.winner === 'X' ? '❌ Joueur 1' : '⭕ Joueur 2'} a gagné !`;
                statusElement.style.color = this.winner === 'X' ? '#4facfe' : '#f5576c';
            } else {
                statusElement.textContent = '🤝 Match nul !';
                statusElement.style.color = '#ffd700';
            }
        } else {
            statusElement.textContent = `Tour de : ${this.currentPlayer === 'X' ? '❌ Joueur 1' : '⭕ Joueur 2'}`;
            statusElement.style.color = this.currentPlayer === 'X' ? '#4facfe' : '#f5576c';
        }

        // Met à jour les scores
        document.getElementById('score1').textContent = this.scores[0];
        document.getElementById('score2').textContent = this.scores[1];

        // Met à jour l'activation des joueurs
        document.querySelector('.p1').classList.toggle('active', 
            !this.isGameOver && this.currentPlayer === 'X');
        document.querySelector('.p2').classList.toggle('active', 
            !this.isGameOver && this.currentPlayer === 'O');

        // Bouton undo
        document.getElementById('undo-btn').disabled = this.history.length === 0;
    }
}

// ============================================
// 🎮 CONTRÔLEUR
// ============================================

class Controller {
    constructor() {
        this.game = new TicTacToe();
        this.setupEvents();
        this.game.render();
    }

    setupEvents() {
        // Clic sur une case
        document.getElementById('board').addEventListener('click', (e) => {
            const cell = e.target.closest('.cell');
            if (!cell) return;
            if (cell.classList.contains('taken')) return;
            if (this.game.isGameOver) return;

            const index = parseInt(cell.dataset.index);
            this.game.play(index);
            this.game.render();
        });

        // Nouvelle partie
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.game.reset();
            this.game.render();
        });

        // Annuler
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.game.undo();
            this.game.render();
        });

        // Réinitialiser les scores
        document.getElementById('reset-score-btn').addEventListener('click', () => {
            this.game.resetScores();
            this.game.render();
        });
    }
}

// ============================================
// 🚀 DÉMARRAGE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const controller = new Controller();
});
