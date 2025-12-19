/**
 * Renderer Module - Single Responsibility: Handle all drawing/rendering
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
    this.ctx.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
  }

  /**
   * Draw grid lines for visual reference
   */
  drawGrid() {
    this.ctx.strokeStyle = GAME_CONFIG.COLORS.GRID_LINE;
    this.ctx.lineWidth = 0.5;

    for (let i = 0; i <= GAME_CONFIG.GRID_WIDTH; i++) {
      const x = i * GAME_CONFIG.TILE_SIZE;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, GAME_CONFIG.CANVAS_HEIGHT);
      this.ctx.stroke();
    }

    for (let i = 0; i <= GAME_CONFIG.GRID_HEIGHT; i++) {
      const y = i * GAME_CONFIG.TILE_SIZE;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(GAME_CONFIG.CANVAS_WIDTH, y);
      this.ctx.stroke();
    }
  }

  /**
   * Draw the map (walls and diamond)
   */
  drawMap(gameMap) {
    const grid = gameMap.getGrid();

    for (let y = 0; y < GAME_CONFIG.GRID_HEIGHT; y++) {
      for (let x = 0; x < GAME_CONFIG.GRID_WIDTH; x++) {
        const tile = grid[y][x];
        const pixelX = x * GAME_CONFIG.TILE_SIZE;
        const pixelY = y * GAME_CONFIG.TILE_SIZE;

        if (tile === GAME_CONFIG.WALL_TYPES.DESTRUCTIBLE) {
          this.drawTile(pixelX, pixelY, GAME_CONFIG.COLORS.DESTRUCTIBLE_WALL);
        } else if (tile === GAME_CONFIG.WALL_TYPES.INDESTRUCTIBLE) {
          this.drawTile(pixelX, pixelY, GAME_CONFIG.COLORS.INDESTRUCTIBLE_WALL);
        } else if (tile === GAME_CONFIG.WALL_TYPES.DIAMOND) {
          this.drawDiamond(pixelX, pixelY);
        }
      }
    }
  }

  /**
   * Draw a single tile
   */
  drawTile(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x + 2, y + 2, GAME_CONFIG.TILE_SIZE - 4, GAME_CONFIG.TILE_SIZE - 4);
  }

  /**
   * Draw the diamond (goal)
   */
  drawDiamond(x, y) {
    const size = GAME_CONFIG.TILE_SIZE - 8;
    const centerX = x + GAME_CONFIG.TILE_SIZE / 2;
    const centerY = y + GAME_CONFIG.TILE_SIZE / 2;

    this.ctx.fillStyle = GAME_CONFIG.COLORS.DIAMOND;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY - size / 2); // Top
    this.ctx.lineTo(centerX + size / 2, centerY);  // Right
    this.ctx.lineTo(centerX, centerY + size / 2); // Bottom
    this.ctx.lineTo(centerX - size / 2, centerY); // Left
    this.ctx.closePath();
    this.ctx.fill();

    // Add sparkle effect
    this.ctx.strokeStyle = GAME_CONFIG.COLORS.DIAMOND;
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
    const size = GAME_CONFIG.TILE_SIZE - 8;
    
    this.ctx.fillStyle = GAME_CONFIG.COLORS.BOMBER;
    this.ctx.beginPath();
    this.ctx.arc(
      x + GAME_CONFIG.TILE_SIZE / 2,
      y + GAME_CONFIG.TILE_SIZE / 2,
      size / 2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Draw eyes
    this.ctx.fillStyle = '#fff';
    const eyeSize = 3;
    this.ctx.fillRect(x + 10, y + 12, eyeSize, eyeSize);
    this.ctx.fillRect(x + 20, y + 12, eyeSize, eyeSize);
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

      // Draw bomb as a circle
      this.ctx.fillStyle = GAME_CONFIG.COLORS.BOMB;
      this.ctx.beginPath();
      this.ctx.arc(
        pixelX + GAME_CONFIG.TILE_SIZE / 2,
        pixelY + GAME_CONFIG.TILE_SIZE / 2,
        GAME_CONFIG.TILE_SIZE / 3,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      // Draw fuse
      this.ctx.strokeStyle = GAME_CONFIG.COLORS.BOMB;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(
        pixelX + GAME_CONFIG.TILE_SIZE / 2,
        pixelY + GAME_CONFIG.TILE_SIZE / 3
      );
      this.ctx.lineTo(
        pixelX + GAME_CONFIG.TILE_SIZE / 2,
        pixelY + GAME_CONFIG.TILE_SIZE / 4
      );
      this.ctx.stroke();
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

        this.ctx.fillStyle = GAME_CONFIG.COLORS.EXPLOSION;
        this.ctx.globalAlpha = 0.7;
        this.ctx.fillRect(pixelX, pixelY, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
        this.ctx.globalAlpha = 1.0;

        // Draw explosion particles
        this.ctx.fillStyle = '#FF8C00';
        this.ctx.beginPath();
        this.ctx.arc(
          pixelX + GAME_CONFIG.TILE_SIZE / 2,
          pixelY + GAME_CONFIG.TILE_SIZE / 2,
          GAME_CONFIG.TILE_SIZE / 3,
          0,
          Math.PI * 2
        );
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
      this.ctx.fillStyle = GAME_CONFIG.COLORS.ENEMY;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX - size / 2, centerY - size / 3);
      this.ctx.lineTo(centerX + size / 2, centerY - size / 3);
      this.ctx.lineTo(centerX + size / 2, centerY + size / 3);
      // Wavy bottom
      for (let i = 0; i < 3; i++) {
        const waveX = centerX + size / 2 - (i + 1) * size / 3;
        const waveY = centerY + size / 3;
        this.ctx.lineTo(waveX, waveY - size / 6);
      }
      this.ctx.lineTo(centerX - size / 2, centerY + size / 3);
      this.ctx.closePath();
      this.ctx.fill();

      // Draw eyes
      this.ctx.fillStyle = '#fff';
      const eyeSize = 3;
      this.ctx.fillRect(centerX - 7, centerY - 4, eyeSize, eyeSize);
      this.ctx.fillRect(centerX + 4, centerY - 4, eyeSize, eyeSize);

      // Draw evil pupils
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(centerX - 6, centerY - 3, 2, 2);
      this.ctx.fillRect(centerX + 5, centerY - 3, 2, 2);
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
