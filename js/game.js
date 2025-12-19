/**
 * Game Module - Single Responsibility: Orchestrate game state and logic
 * Coordinates between all other modules but doesn't implement their details
 */

class Game {
  constructor(canvasId) {
    this.renderer = new GameRenderer(canvasId);
    
    // Game state
    this.currentLevelIndex = 0;
    this.score = 0;
    this.gameMap = null;
    this.bomber = null;
    this.bombManager = null;
    
    this.isGameRunning = false;
    this.isPaused = false;
    this.gameOverReason = null;
    
    // Input
    this.keys = {};
    
    // Animation frame
    this.animationFrameId = null;
    
    // Initialize game
    this.init();
  }

  /**
   * Initialize game - setup first level
   */
  init() {
    this.currentLevelIndex = 0;
    this.score = 0;
    this.startLevel();
  }

  /**
   * Start a new level
   */
  startLevel() {
    const levelConfig = GAME_CONFIG.LEVELS[this.currentLevelIndex];
    
    if (!levelConfig) {
      this.endGame('You completed all levels!');
      return;
    }

    // Create game objects
    this.gameMap = new GameMap(levelConfig);
    this.bomber = new Bomber(GAME_CONFIG.BOMBER_START_X, GAME_CONFIG.BOMBER_START_Y);
    this.bombManager = new BombManager();
    
    this.isGameRunning = true;
    this.gameOverReason = null;
    
    this.updateUI();
  }

  /**
   * Main game loop - update game state
   */
  update() {
    if (!this.isGameRunning || this.isPaused) return;

    // Update bomber position based on input
    const moveX = (this.keys['ArrowRight'] || this.keys['d'] ? 1 : 0) - 
                  (this.keys['ArrowLeft'] || this.keys['a'] ? 1 : 0);
    const moveY = (this.keys['ArrowDown'] || this.keys['s'] ? 1 : 0) - 
                  (this.keys['ArrowUp'] || this.keys['w'] ? 1 : 0);
    
    this.bomber.setVelocity(moveX, moveY);
    this.bomber.update(this.gameMap);

    // Check for bomb placement
    if (this.keys[' ']) {
      this.keys[' '] = false; // Consume key press
      this.placeBomb();
    }

    // Update bombs (check for explosions)
    this.bombManager.update();

    // Process bomb explosions
    this.processBombExplosions();

    // Check win condition
    if (Physics.isBomberOnDiamond(this.bomber, this.gameMap)) {
      this.winLevel();
    }

    // Check lose condition
    if (Physics.isBomberInExplosion(this.bomber, this.bombManager)) {
      this.loseGame();
    }
  }

  /**
   * Try to place a bomb at bomber position
   */
  placeBomb() {
    const { x, y } = this.bomber.getGridPosition();
    
    // Check if can place bomb
    if (!Physics.canPlaceBombHere(x, y, this.gameMap, this.bombManager)) {
      return;
    }

    // Check if bomber can place bomb
    if (!this.bomber.placeBomb()) {
      return;
    }

    // Create bomb with explosion callback
    const onBombExplode = (blastTiles) => {
      this.handleBombExplosion(blastTiles);
    };

    this.bombManager.addBomb(x, y, onBombExplode);
  }

  /**
   * Handle bomb explosion
   */
  handleBombExplosion(blastTiles) {
    // Process explosion in physics
    const explosionResult = Physics.handleBombExplosion(
      blastTiles, 
      this.gameMap, 
      this.bomber
    );

    // Notify bomber that bomb exploded
    this.bomber.bombExploded();

    // Check if bomber was hit
    if (explosionResult.bomberHit) {
      this.loseGame();
    }

    // Award points for destroyed walls
    this.score += explosionResult.destroyedWalls.length * 10;
    this.updateUI();
  }

  /**
   * Process all pending bomb explosions
   */
  processBombExplosions() {
    // Explosions are already processed by bombManager.update()
  }

  /**
   * Handle win condition
   */
  winLevel() {
    this.isGameRunning = false;
    this.score += 100; // Bonus for completing level
    this.updateUI();
    
    // Show win modal
    this.showGameModal(
      `Level ${this.currentLevelIndex + 1} Complete!`,
      `Great job! Score: ${this.score}`,
      () => this.nextLevel()
    );
  }

  /**
   * Handle lose condition
   */
  loseGame() {
    if (!this.isGameRunning) return;
    
    this.bomber.die();
    this.isGameRunning = false;
    
    // Show lose modal
    this.showGameModal(
      'Game Over!',
      'You were caught in an explosion!',
      () => this.restartGame()
    );
  }

  /**
   * Move to next level
   */
  nextLevel() {
    this.currentLevelIndex++;
    this.startLevel();
  }

  /**
   * Restart current level
   */
  restartGame() {
    this.startLevel();
  }

  /**
   * End game (all levels completed)
   */
  endGame(message) {
    this.isGameRunning = false;
    this.showGameModal(
      'Game Complete!',
      `${message}\nFinal Score: ${this.score}`,
      () => this.init()
    );
  }

  /**
   * Show modal dialog
   */
  showGameModal(title, message, onClose) {
    const modal = document.getElementById('game-modal');
    const titleEl = document.getElementById('modal-title');
    const messageEl = document.getElementById('modal-message');
    const button = document.getElementById('modal-btn');

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
   * Update UI (score, level display)
   */
  updateUI() {
    document.getElementById('level').textContent = this.currentLevelIndex + 1;
    document.getElementById('score').textContent = this.score;
  }

  /**
   * Handle keyboard input
   */
  handleKeyDown(event) {
    const key = event.key;
    
    if (key === ' ') {
      event.preventDefault(); // Prevent page scroll
    }
    
    this.keys[key] = true;
  }

  /**
   * Handle keyboard release
   */
  handleKeyUp(event) {
    this.keys[event.key] = false;
  }

  /**
   * Main render loop
   */
  render() {
    this.renderer.render(this.gameMap, this.bomber, this.bombManager);
  }

  /**
   * Game loop - called every frame
   */
  gameLoop() {
    this.update();
    this.render();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  /**
   * Start the game
   */
  start() {
    this.gameLoop();
  }

  /**
   * Stop the game
   */
  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
