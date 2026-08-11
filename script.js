// ============================================
// 🎯 FANORONA - Version complète
// ============================================

// ============================================
// CLASSE PRINCIPALE
// ============================================

class FanoronaGame {
  constructor(mode = 'telo') {
    this.mode = mode; // 'telo' ou 'tsivy'
    this.ROWS = 3;
    this.COLS = 3;
    this.board = [];
    this.currentPlayer = 'black';
    this.blackPieces = 0;
    this.whitePieces = 0;
    this.capturedBlack = 0;
    this.capturedWhite = 0;
    this.phase = 'placement'; // 'placement' ou 'movement'
    this.isGameOver = false;
    this.winner = null;
    this.history = [];
    
    this.initGame();
  }

  // ============================================
  // INITIALISATION
  // ============================================

  initGame() {
    // Détermine le nombre de pions selon le mode
    if (this.mode === 'telo') {
      this.PIECES_PER_PLAYER = 3;
      this.ROWS = 3;
      this.COLS = 3;
    } else { // 'tsivy'
      this.PIECES_PER_PLAYER = 22;
      this.ROWS = 5;
      this.COLS = 9;
    }

    // Initialise le plateau vide
    this.board = Array(this.ROWS).fill().map(() => Array(this.COLS).fill(null));
    this.blackPieces = this.PIECES_PER_PLAYER;
    this.whitePieces = this.PIECES_PER_PLAYER;
    this.capturedBlack = 0;
    this.capturedWhite = 0;
    this.currentPlayer = 'black';
    this.phase = 'placement';
    this.isGameOver = false;
    this.winner = null;
    this.history = [];
  }

  // ============================================
  // PLACEMENT DES PIONS
  // ============================================

  placePiece(row, col) {
    if (this.isGameOver) return false;
    if (this.phase !== 'placement') return false;
    if (this.board[row][col] !== null) return false;
    
    // Vérifie si le joueur a encore des pions à placer
    const playerPieces = this.currentPlayer === 'black' ? this.blackPieces : this.whitePieces;
    if (playerPieces <= 0) return false;

    // Place le pion
    this.board[row][col] = this.currentPlayer;
    
    // Met à jour le compteur
    if (this.currentPlayer === 'black') {
      this.blackPieces--;
    } else {
      this.whitePieces--;
    }

    // Historique
    this.history.push({
      type: 'placement',
      row: row,
      col: col,
      player: this.currentPlayer
    });

    // Vérifie la victoire
    if (this.checkWin()) {
      this.isGameOver = true;
      this.winner = this.currentPlayer;
      return true;
    }

    // Change de joueur
    this.switchPlayer();

    // Vérifie si la phase de placement est terminée
    if (this.blackPieces === 0 && this.whitePieces === 0) {
      this.phase = 'movement';
    }

    return true;
  }

  // ============================================
  // DÉPLACEMENT DES PIONS
  // ============================================

  movePiece(fromRow, fromCol, toRow, toCol) {
    if (this.isGameOver) return false;
    if (this.phase !== 'movement') return false;
    if (this.board[fromRow][fromCol] !== this.currentPlayer) return false;
    if (this.board[toRow][toCol] !== null) return false;

    // Vérifie si la case est adjacente
    if (!this.isAdjacent(fromRow, fromCol, toRow, toCol)) return false;

    // Déplace le pion
    this.board[toRow][toCol] = this.currentPlayer;
    this.board[fromRow][fromCol] = null;

    // Historique
    this.history.push({
      type: 'movement',
      fromRow: fromRow,
      fromCol: fromCol,
      toRow: toRow,
      toCol: toCol,
      player: this.currentPlayer,
      captures: []
    });

    // Vérifie les captures
    const captured = this.checkCaptures(toRow, toCol);
    if (captured.length > 0) {
      for (let cap of captured) {
        this.board[cap.row][cap.col] = null;
        if (this.currentPlayer === 'black') {
          this.capturedWhite++;
          this.whitePieces--;
        } else {
          this.capturedBlack++;
          this.blackPieces--;
        }
      }
      this.history[this.history.length - 1].captures = captured;
    }

    // Vérifie la victoire
    if (this.checkWin()) {
      this.isGameOver = true;
      this.winner = this.currentPlayer;
      return true;
    }

    // Vérifie si l'adversaire a encore des pions
    if (this.blackPieces === 0) {
      this.isGameOver = true;
      this.winner = 'white';
      return true;
    }
    if (this.whitePieces === 0) {
      this.isGameOver = true;
      this.winner = 'black';
      return true;
    }

    // Change de joueur
    this.switchPlayer();

    return true;
  }

  // ============================================
  // VÉRIFICATIONS
  // ============================================

  isAdjacent(r1, c1, r2, c2) {
    const dr = Math.abs(r1 - r2);
    const dc = Math.abs(c1 - c2);
    return (dr === 1 && dc === 0) || (dr === 0 && dc === 1) || (dr === 1 && dc === 1);
  }

  checkCaptures(row, col) {
    const captures = [];
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    const opponent = this.currentPlayer === 'black' ? 'white' : 'black';

    for (let [dr, dc] of directions) {
      let r = row + dr;
      let c = col + dc;
      let foundOpponent = false;
      let captureRow = -1, captureCol = -1;

      // Vérifie la percussion (approche)
      if (r >= 0 && r < this.ROWS && c >= 0 && c < this.COLS) {
        if (this.board[r][c] === opponent) {
          // Capture par percussion
          let nr = r + dr;
          let nc = c + dc;
          if (nr >= 0 && nr < this.ROWS && nc >= 0 && nc < this.COLS && this.board[nr][nc] === null) {
            captures.push({ row: r, col: c });
            // Capture en chaîne (pour le mode tsivy)
            if (this.mode === 'tsivy') {
              let chainRow = nr + dr;
              let chainCol = nc + dc;
              while (chainRow >= 0 && chainRow < this.ROWS && chainCol >= 0 && chainCol < this.COLS) {
                if (this.board[chainRow][chainCol] === opponent && 
                    chainRow + dr >= 0 && chainRow + dr < this.ROWS && 
                    chainCol + dc >= 0 && chainCol + dc < this.COLS && 
                    this.board[chainRow + dr][chainCol + dc] === null) {
                  captures.push({ row: chainRow, col: chainCol });
                  chainRow += dr;
                  chainCol += dc;
                } else break;
              }
            }
          }
        }
      }

      // Vérifie l'aspiration (éloignement) - pour le mode tsivy
      if (this.mode === 'tsivy') {
        let ar = row - dr;
        let ac = col - dc;
        if (ar >= 0 && ar < this.ROWS && ac >= 0 && ac < this.COLS) {
          if (this.board[ar][ac] === opponent) {
            let nr = ar - dr;
            let nc = ac - dc;
            if (nr >= 0 && nr < this.ROWS && nc >= 0 && nc < this.COLS && this.board[nr][nc] === null) {
              captures.push({ row: ar, col: ac });
              // Capture en chaîne
              let chainRow = nr - dr;
              let chainCol = nc - dc;
              while (chainRow >= 0 && chainRow < this.ROWS && chainCol >= 0 && chainCol < this.COLS) {
                if (this.board[chainRow][chainCol] === opponent &&
                    chainRow - dr >= 0 && chainRow - dr < this.ROWS &&
                    chainCol - dc >= 0 && chainCol - dc < this.COLS &&
                    this.board[chainRow - dr][chainCol - dc] === null) {
                  captures.push({ row: chainRow, col: chainCol });
                  chainRow -= dr;
                  chainCol -= dc;
                } else break;
              }
            }
          }
        }
      }
    }

    return captures;
  }

  checkWin() {
    // Vérifie si un joueur a aligné 3 pions (pour les deux modes)
    const player = this.currentPlayer;
    
    // Vérification horizontale
    for (let row = 0; row < this.ROWS; row++) {
      if (this.mode === 'telo') {
        if (this.board[row][0] === player && 
            this.board[row][1] === player && 
            this.board[row][2] === player) {
          return true;
        }
      } else {
        // Pour le mode tsivy, alignement de 5
        for (let col = 0; col <= this.COLS - 5; col++) {
          let win = true;
          for (let i = 0; i < 5; i++) {
            if (this.board[row][col + i] !== player) {
              win = false;
              break;
            }
          }
          if (win) return true;
        }
      }
    }

    // Vérification verticale
    for (let col = 0; col < this.COLS; col++) {
      if (this.mode === 'telo') {
        if (this.board[0][col] === player && 
            this.board[1][col] === player && 
            this.board[2][col] === player) {
          return true;
        }
      } else {
        for (let row = 0; row <= this.ROWS - 5; row++) {
          let win = true;
          for (let i = 0; i < 5; i++) {
            if (this.board[row + i][col] !== player) {
              win = false;
              break;
            }
          }
          if (win) return true;
        }
      }
    }

    // Vérification diagonale (pour les deux modes)
    if (this.mode === 'telo') {
      if (this.board[0][0] === player && this.board[1][1] === player && this.board[2][2] === player) return true;
      if (this.board[0][2] === player && this.board[1][1] === player && this.board[2][0] === player) return true;
    } else {
      for (let row = 0; row <= this.ROWS - 5; row++) {
        for (let col = 0; col <= this.COLS - 5; col++) {
          let win = true;
          for (let i = 0; i < 5; i++) {
            if (this.board[row + i][col + i] !== player) {
              win = false;
              break;
            }
          }
          if (win) return true;
        }
      }
      for (let row = 0; row <= this.ROWS - 5; row++) {
        for (let col = 4; col < this.COLS; col++) {
          let win = true;
          for (let i = 0; i < 5; i++) {
            if (this.board[row + i][col - i] !== player) {
              win = false;
              break;
            }
          }
          if (win) return true;
        }
      }
    }

    return false;
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
  }

  // ============================================
  // UTILITAIRES
  // ============================================

  getLegalMoves() {
    const moves = [];
    const player = this.currentPlayer;

    if (this.phase === 'placement') {
      for (let row = 0; row < this.ROWS; row++) {
        for (let col = 0; col < this.COLS; col++) {
          if (this.board[row][col] === null) {
            moves.push({ type: 'placement', row, col });
          }
        }
      }
    } else {
      for (let row = 0; row < this.ROWS; row++) {
        for (let col = 0; col < this.COLS; col++) {
          if (this.board[row][col] === player) {
            const neighbors = this.getNeighbors(row, col);
            for (let n of neighbors) {
              if (this.board[n.row][n.col] === null) {
                moves.push({
                  type: 'movement',
                  fromRow: row,
                  fromCol: col,
                  toRow: n.row,
                  toCol: n.col
                });
              }
            }
          }
        }
      }
    }

    return moves;
  }

  getNeighbors(row, col) {
    const neighbors = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < this.ROWS && nc >= 0 && nc < this.COLS) {
          neighbors.push({ row: nr, col: nc });
        }
      }
    }
    return neighbors;
  }

  // ============================================
  // RENDU CANVAS
  // ============================================

  draw(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const cellWidth = width / this.COLS;
    const cellHeight = height / this.ROWS;
    const radius = Math.min(cellWidth, cellHeight) * 0.35;

    // Fond du plateau
    ctx.fillStyle = '#2d1b0e';
    ctx.fillRect(0, 0, width, height);

    // Grille
    ctx.strokeStyle = '#4a2f1a';
    ctx.lineWidth = 2;
    for (let row = 0; row <= this.ROWS; row++) {
      ctx.beginPath();
      ctx.moveTo(0, row * cellHeight);
      ctx.lineTo(width, row * cellHeight);
      ctx.stroke();
    }
    for (let col = 0; col <= this.COLS; col++) {
      ctx.beginPath();
      ctx.moveTo(col * cellWidth, 0);
      ctx.lineTo(col * cellWidth, height);
      ctx.stroke();
    }

    // Intersections
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const x = col * cellWidth + cellWidth / 2;
        const y = row * cellHeight + cellHeight / 2;
        
        // Case vide
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#5a3f2a';
        ctx.fill();

        // Pion
        const piece = this.board[row][col];
        if (piece) {
          const gradient = ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, radius * 0.1,
            x, y, radius
          );
          
          if (piece === 'black') {
            gradient.addColorStop(0, '#555');
            gradient.addColorStop(1, '#111');
          } else {
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ccc');
          }
          
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
          
          // Bordure
          ctx.strokeStyle = piece === 'black' ? '#333' : '#999';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    }

    // Surbrillance
    if (this.selected) {
      const x = this.selected.col * cellWidth + cellWidth / 2;
      const y = this.selected.row * cellHeight + cellHeight / 2;
      ctx.beginPath();
      ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#f5576c';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }
}

// ============================================
// 🎮 CONTRÔLEUR
// ============================================

class FanoronaController {
  constructor(canvas) {
    this.canvas = canvas;
    this.game = new FanoronaGame('telo');
    this.selected = null;
    this.mode = 'telo';
    
    this.setupEvents();
    this.updateUI();
    this.game.draw(canvas);
  }

  setupEvents() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      const cellWidth = this.canvas.width / this.game.COLS;
      const cellHeight = this.canvas.height / this.game.ROWS;
      const col = Math.floor(x / cellWidth);
      const row = Math.floor(y / cellHeight);
      
      if (row >= 0 && row < this.game.ROWS && col >= 0 && col < this.game.COLS) {
        this.handleClick(row, col);
      }
    });

    // Boutons de mode
    document.getElementById('mode-telo').addEventListener('click', () => {
      this.setMode('telo');
    });
    
    document.getElementById('mode-tsivy').addEventListener('click', () => {
      this.setMode('tsivy');
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
      this.resetGame();
    });
  }

  handleClick(row, col) {
    if (this.game.isGameOver) return;

    // Phase de placement
    if (this.game.phase === 'placement') {
      const success = this.game.placePiece(row, col);
      if (success) {
        this.game.draw(this.canvas);
        this.updateUI();
        this.checkGameOver();
      }
      return;
    }

    // Phase de déplacement
    if (this.game.phase === 'movement') {
      // Sélection d'un pion
      if (this.game.board[row][col] === this.game.currentPlayer) {
        this.selected = { row, col };
        this.game.draw(this.canvas);
        // Dessine la sélection
        this.drawSelection();
        return;
      }

      // Déplacement
      if (this.selected) {
        const success = this.game.movePiece(
          this.selected.row,
          this.selected.col,
          row,
          col
        );
        
        if (success) {
          this.selected = null;
          this.game.draw(this.canvas);
          this.updateUI();
          this.checkGameOver();
        } else {
          // Si le déplacement échoue, on désélectionne
          this.selected = null;
          this.game.draw(this.canvas);
        }
      }
    }
  }

  drawSelection() {
    if (!this.selected) return;
    const ctx = this.canvas.getContext('2d');
    const cellWidth = this.canvas.width / this.game.COLS;
    const cellHeight = this.canvas.height / this.game.ROWS;
    const x = this.selected.col * cellWidth + cellWidth / 2;
    const y = this.selected.row * cellHeight + cellHeight / 2;
    const radius = Math.min(cellWidth, cellHeight) * 0.35;
    
    ctx.beginPath();
    ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#f5576c';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  setMode(mode) {
    this.mode = mode;
    
    // Met à jour les boutons
    document.getElementById('mode-telo').classList.toggle('active', mode === 'telo');
    document.getElementById('mode-tsivy').classList.toggle('active', mode === 'tsivy');
    
    // Met à jour les règles
    this.updateRules(mode);
    
    // Réinitialise le jeu
    this.resetGame();
  }

  resetGame() {
    this.game = new FanoronaGame(this.mode);
    this.selected = null;
    this.game.draw(this.canvas);
    this.updateUI();
    
    // Met à jour les règles
    this.updateRules(this.mode);
  }

  updateUI() {
    const status = document.getElementById('status');
    const game = this.game;
    
    if (game.isGameOver) {
      if (game.winner === 'black') {
        status.textContent = '🏆 Joueur 1 (⚫) a gagné !';
      } else if (game.winner === 'white') {
        status.textContent = '🏆 Joueur 2 (⚪) a gagné !';
      } else {
        status.textContent = '🤝 Match nul !';
      }
      return;
    }

    const phaseText = game.phase === 'placement' ? 'Placement' : 'Déplacement';
    const playerText = game.currentPlayer === 'black' ? '⚫ Joueur 1' : '⚪ Joueur 2';
    status.textContent = `${phaseText} : ${playerText}`;
    
    // Mise à jour des pions capturés
    document.getElementById('captured-black').textContent = game.capturedBlack;
    document.getElementById('captured-white').textContent = game.capturedWhite;
  }

  checkGameOver() {
    if (this.game.isGameOver) {
      this.updateUI();
    }
  }

  updateRules(mode) {
    const rulesDiv = document.getElementById('rules-content');
    if (mode === 'telo') {
      rulesDiv.innerHTML = `
        <h3>🔴 Fanoron-Telo (3 pions)</h3>
        <ul>
          <li>Plateau 3x3</li>
          <li>3 pions par joueur</li>
          <li>Phase 1 : Placement des pions</li>
          <li>Phase 2 : Déplacement d'un pion à la fois</li>
          <li>Objectif : Aligner 3 pions</li>
          <li>Pas de captures dans cette variante</li>
        </ul>
      `;
    } else {
      rulesDiv.innerHTML = `
        <h3>🔴⚪ Fanoron-Tsivy (22 pions)</h3>
        <ul>
          <li>Plateau 5x9</li>
          <li>22 pions par joueur</li>
          <li>Phase 1 : Placement des pions (seulement sur les bords)</li>
          <li>Phase 2 : Déplacement et captures</li>
          <li>Capture par <strong>percussion</strong> (approche)</li>
          <li>Capture par <strong>aspiration</strong> (éloignement)</li>
          <li>Objectif : Capturer tous les pions adverses</li>
        </ul>
        <p style="margin-top:10px;font-style:italic;">💡 Cette variante est utilisée dans le jeu vidéo <strong>Assassin's Creed III</strong> !</p>
      `;
    }
  }
}

// ============================================
// 🚀 DÉMARRAGE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const controller = new FanoronaController(canvas);
  
  // Affiche les règles par défaut
  controller.updateRules('telo');
  
  // Mode par défaut
  document.getElementById('mode-telo').classList.add('active');
});