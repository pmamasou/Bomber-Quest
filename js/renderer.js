/**
 * Renderer Module - Single Responsibility: Handle all drawing/rendering (Top-Down 2D)
 * WHY separate: Keeps visual logic independent from game logic
 */

class GameRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas with id "${canvasId}" not found`);
    }
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
  }

  /**
   * Clear canvas and draw background
   */
  clear() {
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw grid map in top-down view with enhanced graphics
   */
  drawMap(gameMap) {
    const grid = gameMap.getGrid();
    const WALL_TYPES = GAME_CONFIG.WALL_TYPES;

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const tile = grid[y][x];
        const pixelX = x * GAME_CONFIG.TILE_SIZE;
        const pixelY = y * GAME_CONFIG.TILE_SIZE;

        switch (tile) {
          case WALL_TYPES.EMPTY:
            this.ctx.fillStyle = '#2a5a4a';
            this.ctx.fillRect(pixelX, pixelY, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
            break;
          case WALL_TYPES.DESTRUCTIBLE:
            this.drawDestructibleWall(pixelX, pixelY);
            break;
          case WALL_TYPES.INDESTRUCTIBLE:
            this.drawIndestructibleWall(pixelX, pixelY);
            break;
          case WALL_TYPES.DIAMOND:
            this.drawDiamondTile(pixelX, pixelY);
            break;
        }
      }
    }
  }

  /**
   * Draw destructible wall with 3D effect
   */
  drawDestructibleWall(x, y) {
    const size = GAME_CONFIG.TILE_SIZE;
    
    // Main wall
    this.ctx.fillStyle = '#4ECDC4';
    this.ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    
    // Top highlight for 3D effect
    this.ctx.fillStyle = '#6EE5DC';
    this.ctx.fillRect(x + 2, y + 2, size - 4, 4);
    
    // Bottom shadow
    this.ctx.fillStyle = '#2a9d8f';
    this.ctx.fillRect(x + 2, y + size - 6, size - 4, 4);
    
    // Brick pattern
    this.ctx.strokeStyle = '#2a7a6f';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x + 2, y + size / 2);
    this.ctx.lineTo(x + size - 2, y + size / 2);
    this.ctx.stroke();
  }

  /**
   * Draw indestructible wall with pattern
   */
  drawIndestructibleWall(x, y) {
    const size = GAME_CONFIG.TILE_SIZE;
    
    // Main wall
    this.ctx.fillStyle = '#95A5A6';
    this.ctx.fillRect(x, y, size, size);
    
    // Add stone pattern
    this.ctx.strokeStyle = '#5a6c6f';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x + 4, y + 4, size - 8, size - 8);
    
    // Diagonal lines for texture
    this.ctx.beginPath();
    this.ctx.moveTo(x + 5, y + 5);
    this.ctx.lineTo(x + size - 5, y + size - 5);
    this.ctx.moveTo(x + size - 5, y + 5);
    this.ctx.lineTo(x + 5, y + size - 5);
    this.ctx.stroke();
  }

  /**
   * Draw diamond tile with glow effect
   */
  drawDiamondTile(x, y) {
    const size = GAME_CONFIG.TILE_SIZE;
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    
    // Base floor
    this.ctx.fillStyle = '#2a5a4a';
    this.ctx.fillRect(x, y, size, size);
    
    // Glowing diamond with shadow
    this.ctx.shadowColor = '#FFD700';
    this.ctx.shadowBlur = 20;
    
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY - 12);
    this.ctx.lineTo(centerX + 12, centerY);
    this.ctx.lineTo(centerX, centerY + 12);
    this.ctx.lineTo(centerX - 12, centerY);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.shadowBlur = 0;
    
    // Border
    this.ctx.strokeStyle = '#FFC700';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  /**
   * Draw the bomber
   */
  drawBomber(bomber) {
    if (!bomber.isAlive) {
      return;
    }

    const { x, y } = bomber.getPixelPosition();
    const centerX = x + GAME_CONFIG.TILE_SIZE / 2;
    const centerY = y + GAME_CONFIG.TILE_SIZE / 2;
    const size = GAME_CONFIG.TILE_SIZE - 8;

    // Draw body
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.beginPath();
    this.ctx.ellipse(centerX, centerY - 2, size / 3, size / 2.5, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw head
    this.ctx.fillStyle = '#FF9999';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY - size / 2 - 3, size / 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw eyes with shine
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(centerX - 4, centerY - size / 2 - 5, 2, 0, Math.PI * 2);
    this.ctx.arc(centerX + 4, centerY - size / 2 - 5, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw pupils
    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(centerX - 4, centerY - size / 2 - 4, 1, 0, Math.PI * 2);
    this.ctx.arc(centerX + 4, centerY - size / 2 - 4, 1, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw mouth
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY - size / 2 - 1, 2, 0, Math.PI);
    this.ctx.stroke();
  }

  /**
   * Draw all bombs
   */
  drawBombs(bombManager) {
    const bombs = bombManager.getBombs();

    for (const bomb of bombs) {
      const { x, y } = bomb.getPosition();
      const pixelX = x * GAME_CONFIG.TILE_SIZE;
      const pixelY = y * GAME_CONFIG.TILE_SIZE;
      const centerX = pixelX + GAME_CONFIG.TILE_SIZE / 2;
      const centerY = pixelY + GAME_CONFIG.TILE_SIZE / 2;

      // Draw bomb body with 3D effect
      this.ctx.fillStyle = '#FFD93D';
      this.ctx.beginPath();
      this.ctx.ellipse(centerX, centerY, GAME_CONFIG.TILE_SIZE / 3, GAME_CONFIG.TILE_SIZE / 2.5, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Highlight on bomb
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.beginPath();
      this.ctx.ellipse(centerX - 3, centerY - 3, GAME_CONFIG.TILE_SIZE / 6, GAME_CONFIG.TILE_SIZE / 5, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw fuse
      this.ctx.strokeStyle = '#FF6B6B';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY - GAME_CONFIG.TILE_SIZE / 3);
      this.ctx.quadraticCurveTo(centerX + 2, centerY - GAME_CONFIG.TILE_SIZE / 2.2, centerX, centerY - GAME_CONFIG.TILE_SIZE / 1.8);
      this.ctx.stroke();

      // Draw spark on fuse
      this.ctx.fillStyle = '#FF4444';
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY - GAME_CONFIG.TILE_SIZE / 1.8, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /**
   * Draw explosions
   */
  drawExplosions(bombManager) {
    const explosions = bombManager.getExplosions();

    for (const explosion of explosions) {
      for (const tile of explosion.tiles) {
        const pixelX = tile.x * GAME_CONFIG.TILE_SIZE;
        const pixelY = tile.y * GAME_CONFIG.TILE_SIZE;
        const centerX = pixelX + GAME_CONFIG.TILE_SIZE / 2;
        const centerY = pixelY + GAME_CONFIG.TILE_SIZE / 2;

        // Draw explosion blast
        this.ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - GAME_CONFIG.TILE_SIZE / 2);
        this.ctx.lineTo(centerX + GAME_CONFIG.TILE_SIZE / 2, centerY);
        this.ctx.lineTo(centerX, centerY + GAME_CONFIG.TILE_SIZE / 2);
        this.ctx.lineTo(centerX - GAME_CONFIG.TILE_SIZE / 2, centerY);
        this.ctx.closePath();
        this.ctx.fill();

        // Draw particle effect
        this.ctx.fillStyle = 'rgba(255, 150, 0, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, GAME_CONFIG.TILE_SIZE / 3, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  /**
   * Draw all enemies
   */
  drawEnemies(enemyManager) {
    const enemies = enemyManager.getEnemies();

    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;

      const { x, y } = enemy.getPixelPosition();
      const centerX = x + GAME_CONFIG.TILE_SIZE / 2;
      const centerY = y + GAME_CONFIG.TILE_SIZE / 2;
      const size = GAME_CONFIG.TILE_SIZE - 8;

      // Draw enemy body (ghost-like)
      this.ctx.fillStyle = '#9B59B6';
      this.ctx.beginPath();
      this.ctx.moveTo(centerX - size / 2, centerY - size / 3);
      this.ctx.lineTo(centerX + size / 2, centerY - size / 3);
      this.ctx.quadraticCurveTo(centerX + size / 2, centerY + size / 3, centerX, centerY + size / 2.5);
      this.ctx.quadraticCurveTo(centerX - size / 2, centerY + size / 3, centerX - size / 2, centerY - size / 3);
      this.ctx.closePath();
      this.ctx.fill();

      // Draw wavy bottom
      this.ctx.strokeStyle = '#6C3A7C';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX - size / 2 + 2, centerY + size / 3);
      for (let i = 0; i < 3; i++) {
        const waveX = centerX - size / 2 + 2 + (i * size / 3);
        const waveY = centerY + size / 3 + (i % 2 ? 3 : 0);
        this.ctx.lineTo(waveX, waveY);
      }
      this.ctx.stroke();

      // Draw eyes
      this.ctx.fillStyle = '#fff';
      this.ctx.beginPath();
      this.ctx.arc(centerX - 5, centerY - 3, 2.5, 0, Math.PI * 2);
      this.ctx.arc(centerX + 5, centerY - 3, 2.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw evil pupils
      this.ctx.fillStyle = '#000';
      this.ctx.beginPath();
      this.ctx.arc(centerX - 5, centerY - 3, 1.5, 0, Math.PI * 2);
      this.ctx.arc(centerX + 5, centerY - 3, 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /**
   * Render entire game state
   */
  render(gameMap, bomber, bombManager, enemyManager) {
    this.clear();
    this.drawMap(gameMap);
    this.drawBombs(bombManager);
    this.drawExplosions(bombManager);
    if (enemyManager) {
      this.drawEnemies(enemyManager);
    }
    this.drawBomber(bomber);
  }
}
