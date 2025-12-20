/**
 * Game Module - Orchestrates all game logic with difficulty, lives, and enemies
 */

class Game {
  constructor(canvasId) {
    this.renderer = new GameRenderer(canvasId);
    
    // Game state
    this.selectedDifficulty = null;
    this.currentLevelIndex = 0;
    this.score = 0;
    this.lives = GAME_CONFIG.MAX_LIVES;
    this.highScore = this.loadHighScore();
    
    this.gameMap = null;
    this.bomber = null;
    this.bombManager = null;
    this.enemyManager = null;
    
    this.isGameRunning = false;
    this.gameOver = false;
    this.timeRemaining = 0;
    
    // Input
    this.keys = {};
    
    // Animation frame
    this.animationFrameId = null;
    
    // Initialize
    this.init();
  }

  /**
   * Initialize the game (show difficulty selection)
   */
  init() {
    this.showDifficultySelection();
  }

  /**
   * Show difficulty selection menu
   */
  showDifficultySelection() {
    const diffScreen = document.getElementById('difficulty-screen');
    const gameScreen = document.getElementById('game-screen');
    
    if (diffScreen) diffScreen.classList.remove('hidden');
    if (gameScreen) gameScreen.classList.add('hidden');
  }

  /**
   * Start a new game with selected difficulty
   */
  startGame(difficulty) {
    this.selectedDifficulty = difficulty;
    this.currentLevelIndex = 0;
    this.score = 0;
    this.lives = GAME_CONFIG.MAX_LIVES;
    this.gameOver = false;
    
    // Filter levels by difficulty
    const difficultyLevels = GAME_CONFIG.LEVELS.filter(l => l.difficulty === difficulty);
    this.difficultyLevels = difficultyLevels;
    
    // Show game screen
    const diffScreen = document.getElementById('difficulty-screen');
    const gameScreen = document.getElementById('game-screen');
    
    if (diffScreen) diffScreen.classList.add('hidden');
    if (gameScreen) gameScreen.classList.remove('hidden');
    
    this.startLevel();
    this.gameLoop();
  }

  /**
   * Start a new level
   */
  startLevel() {
    if (this.currentLevelIndex >= this.difficultyLevels.length) {
      this.endGame('You completed all levels!');
      return;
    }

    const levelConfig = this.difficultyLevels[this.currentLevelIndex];
    
    // Create game objects
    this.gameMap = new GameMap(levelConfig);
    this.bomber = new Bomber(GAME_CONFIG.BOMBER_START_X, GAME_CONFIG.BOMBER_START_Y);
    this.bombManager = new BombManager();
    this.enemyManager = new EnemyManager();
    
    // Set bomb count for this level
    this.bomber.maxBombs = levelConfig.bombCount;
    this.bomber.activeBombs = 0;
    
    // Spawn enemies
    for (let i = 0; i < levelConfig.enemyCount; i++) {
      const spawnX = 14 - (i * 2);
      const spawnY = 14 - (i * 2);
      if (spawnX > 2 && spawnY > 2) {
        this.enemyManager.addEnemy(spawnX, spawnY, this.gameMap);
      }
    }
    
    // Set time limit
    this.timeRemaining = levelConfig.timeLimit;
    this.levelConfig = levelConfig;
    
    this.isGameRunning = true;
    this.updateUI();
  }

  /**
   * Main game loop - update game state
   */
  update() {
    if (!this.isGameRunning || this.gameOver) return;

    // Update timer
    this.timeRemaining -= 1 / GAME_CONFIG.FRAME_RATE;
    if (this.timeRemaining <= 0) {
      this.loseGame('Time\'s up!');
      return;
    }

    // Update bomber position based on input
    const moveX = (this.keys['ArrowRight'] || this.keys['d'] ? 1 : 0) - 
                  (this.keys['ArrowLeft'] || this.keys['a'] ? 1 : 0);
    const moveY = (this.keys['ArrowDown'] || this.keys['s'] ? 1 : 0) - 
                  (this.keys['ArrowUp'] || this.keys['w'] ? 1 : 0);
    
    this.bomber.setVelocity(moveX, moveY);
    this.bomber.update(this.gameMap);

    // Check for bomb placement
    if (this.keys[' ']) {
      this.keys[' '] = false;
      this.placeBomb();
    }

    // Update bombs
    this.bombManager.update();

    // Update enemies
    this.enemyManager.update(this.gameMap, this.bomber, this.bombManager);

    // Check collisions with explosions
    if (Physics.isBomberInExplosion(this.bomber, this.bombManager)) {
      this.loseGame('Caught in explosion!');
      return;
    }

    // Check collisions with enemies
    if (this.enemyManager.checkCollision(this.bomber)) {
      this.loseGame('Hit by enemy!');
      return;
    }

    // Check win condition
    if (Physics.isBomberOnDiamond(this.bomber, this.gameMap)) {
      this.winLevel();
    }

    // Process explosions and wall destruction
    this.processBombExplosions();
  }

  /**
   * Try to place a bomb
   */
  placeBomb() {
    const { x, y } = this.bomber.getGridPosition();
    
    if (!Physics.canPlaceBombHere(x, y, this.gameMap, this.bombManager)) {
      return;
    }

    if (!this.bomber.placeBomb()) {
      return;
    }

    const onBombExplode = (blastTiles) => {
      this.handleBombExplosion(blastTiles);
    };

    this.bombManager.addBomb(x, y, onBombExplode);
  }

  /**
   * Handle bomb explosion
   */
  handleBombExplosion(blastTiles) {
    const explosionResult = Physics.handleBombExplosion(
      blastTiles, 
      this.gameMap, 
      this.bomber
    );

    this.bomber.bombExploded();

    if (explosionResult.bomberHit) {
      this.loseGame('Hit by own bomb!');
    }

    // Points for destroyed walls
    this.score += explosionResult.destroyedWalls.length * 10;
    
    // Check if enemies were hit
    for (const tile of blastTiles) {
      for (const enemy of this.enemyManager.getEnemies()) {
        if (enemy.isAt(tile.x, tile.y)) {
          enemy.die();
          this.score += 50;
        }
      }
    }

    this.updateUI();
  }

  /**
   * Process bomb explosions
   */
  processBombExplosions() {
    // Already handled by bombManager.update()
  }

  /**
   * Handle level win
   */
  winLevel() {
    this.isGameRunning = false;
    this.score += 200; // Bonus
    this.updateUI();
    
    this.showGameModal(
      `Level ${this.currentLevelIndex + 1} Complete!`,
      `Great job! Score: ${this.score}`,
      () => this.nextLevel()
    );
  }

  /**
   * Handle lose
   */
  loseGame(reason = 'Game Over!') {
    if (!this.isGameRunning) return;
    
    this.bomber.die();
    this.isGameRunning = false;
    this.lives--;
    
    if (this.lives <= 0) {
      this.gameOverScreen();
    } else {
      this.showGameModal(
        reason,
        `Lives remaining: ${this.lives}`,
        () => this.restartLevel()
      );
    }
  }

  /**
   * Game over screen
   */
  gameOverScreen() {
    this.gameOver = true;
    
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    
    this.showGameModal(
      'Game Over!',
      `Final Score: ${this.score}\nHigh Score: ${this.highScore}`,
      () => this.backToMenu()
    );
  }

  /**
   * Next level
   */
  nextLevel() {
    this.currentLevelIndex++;
    this.startLevel();
  }

  /**
   * Restart current level
   */
  restartLevel() {
    this.startLevel();
  }

  /**
   * End game (all levels completed)
   */
  endGame(message) {
    this.gameOver = true;
    this.isGameRunning = false;
    
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    
    this.showGameModal(
      'Victory!',
      `${message}\nFinal Score: ${this.score}`,
      () => this.backToMenu()
    );
  }

  /**
   * Back to menu
   */
  backToMenu() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.init();
  }

  /**
   * Show modal
   */
  showGameModal(title, message, onClose) {
    const modal = document.getElementById('game-modal');
    const titleEl = document.getElementById('modal-title');
    const messageEl = document.getElementById('modal-message');
    const button = document.getElementById('modal-btn');

    if (!modal) return;

    titleEl.textContent = title;
    messageEl.textContent = message;
    
    modal.classList.remove('hidden');
    
    const handleClick = () => {
      modal.classList.add('hidden');
      button.removeEventListener('click', handleClick);
      if (onClose) onClose();
    };
    
    button.addEventListener('click', handleClick);
  }

  /**
   * Update UI
   */
  updateUI() {
    document.getElementById('lives').textContent = Math.max(0, this.lives);
    document.getElementById('level').textContent = this.currentLevelIndex + 1;
    document.getElementById('score').textContent = this.score;
    document.getElementById('timer').textContent = Math.ceil(this.timeRemaining);
    document.getElementById('high-score').textContent = this.highScore;
  }

  /**
   * Handle keyboard
   */
  handleKeyDown(event) {
    const key = event.key;
    if (key === ' ') {
      event.preventDefault();
    }
    this.keys[key] = true;
  }

  /**
   * Handle key release
   */
  handleKeyUp(event) {
    this.keys[event.key] = false;
  }

  /**
   * Render
   */
  render() {
    this.renderer.render(this.gameMap, this.bomber, this.bombManager, this.enemyManager);
    this.updateUI();
  }

  /**
   * Game loop
   */
  gameLoop() {
    this.update();
    this.render();
    if (this.isGameRunning && !this.gameOver) {
      this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }
  }

  /**
   * Start game
   */
  start() {
    this.gameLoop();
  }

  /**
   * Stop game
   */
  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Load high score from localStorage
   */
  loadHighScore() {
    const saved = localStorage.getItem('bomberQuestHighScore');
    return saved ? parseInt(saved) : 0;
  }

  /**
   * Save high score to localStorage
   */
  saveHighScore() {
    localStorage.setItem('bomberQuestHighScore', this.highScore.toString());
  }
}
