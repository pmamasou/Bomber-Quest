/**
 * Renderer Module - Single Responsibility: Handle all drawing/rendering (Isometric View)
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

    // Isometric settings
    this.isoTileWidth = 80;   // Width of isometric tile
    this.isoTileHeight = 40;  // Height of isometric tile
    this.offsetX = 320;       // Center offset X
    this.offsetY = 100;       // Center offset Y
  }

  /**
   * Convert grid coordinates to isometric screen coordinates
   */
  gridToIso(gridX, gridY) {
    const isoX = (gridX - gridY) * (this.isoTileWidth / 2) + this.offsetX;
    const isoY = (gridX + gridY) * (this.isoTileHeight / 2) + this.offsetY;
    return { x: isoX, y: isoY };
  }

  /**
   * Draw isometric tile (diamond shape)
   */
  drawIsoTile(x, y, color, isWall = false) {
    const w = this.isoTileWidth / 2;
    const h = this.isoTileHeight / 2;

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - h);           // Top
    this.ctx.lineTo(x + w, y);           // Right
    this.ctx.lineTo(x, y + h);           // Bottom
    this.ctx.lineTo(x - w, y);           // Left
    this.ctx.closePath();
    this.ctx.fill();

    // Add border for depth
    this.ctx.strokeStyle = isWall ? '#000' : '#333';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Add subtle shading for 3D effect
    if (isWall) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      this.ctx.beginPath();
      this.ctx.moveTo(x, y - h);
      this.ctx.lineTo(x, y + h);
      this.ctx.lineTo(x - w, y);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }

  /**
   * Clear canvas and draw background
   */
  clear() {
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Add subtle gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, 'rgba(0, 100, 150, 0.1)');
    gradient.addColorStop(1, 'rgba(50, 0, 100, 0.1)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw grid map in isometric view
   */
  drawMap(gameMap) {
    const grid = gameMap.getGrid();
    const WALL_TYPES = GAME_CONFIG.WALL_TYPES;

    // Draw from back to front (depth sorting)
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const tile = grid[y][x];
        const isoPos = this.gridToIso(x, y);

        switch (tile) {
          case WALL_TYPES.EMPTY:
            this.drawIsoTile(isoPos.x, isoPos.y, '#2a5a4a', false);
            break;
          case WALL_TYPES.DESTRUCTIBLE:
            this.drawIsoTile(isoPos.x, isoPos.y, '#4ECDC4', true);
            // Add brick pattern
            this.ctx.strokeStyle = '#2a9d8f';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(isoPos.x - 10, isoPos.y);
            this.ctx.lineTo(isoPos.x + 10, isoPos.y);
            this.ctx.stroke();
            break;
          case WALL_TYPES.INDESTRUCTIBLE:
            this.drawIsoTile(isoPos.x, isoPos.y, '#95A5A6', true);
            // Add X pattern for stone
            this.ctx.strokeStyle = '#5a6c6f';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(isoPos.x - 15, isoPos.y - 10);
            this.ctx.lineTo(isoPos.x + 15, isoPos.y + 10);
            this.ctx.moveTo(isoPos.x - 15, isoPos.y + 10);
            this.ctx.lineTo(isoPos.x + 15, isoPos.y - 10);
            this.ctx.stroke();
            break;
          case WALL_TYPES.DIAMOND:
            this.drawIsoTile(isoPos.x, isoPos.y, '#2a5a4a', false);
            // Draw glowing diamond on top
            this.ctx.fillStyle = '#FFD700';
            this.ctx.shadowColor = '#FFD700';
            this.ctx.shadowBlur = 15;
            this.ctx.beginPath();
            this.ctx.moveTo(isoPos.x, isoPos.y - 15);
            this.ctx.lineTo(isoPos.x + 8, isoPos.y - 5);
            this.ctx.lineTo(isoPos.x, isoPos.y + 5);
            this.ctx.lineTo(isoPos.x - 8, isoPos.y - 5);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            break;
        }
      }
    }
  }

  /**
   * Draw the bomber in isometric view
   */
  drawBomber(bomber) {
    if (!bomber.isAlive) {
      return;
    }

    const { x, y } = bomber.getGridPosition();
    const isoPos = this.gridToIso(x, y);

    // Draw bomber as 3D character
    const size = 16;
    
    // Draw body
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.beginPath();
    this.ctx.ellipse(isoPos.x, isoPos.y - 5, size, size + 5, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw head
    this.ctx.fillStyle = '#FF9999';
    this.ctx.beginPath();
    this.ctx.arc(isoPos.x, isoPos.y - 20, 10, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw eyes with shine
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(isoPos.x - 4, isoPos.y - 22, 2.5, 0, Math.PI * 2);
    this.ctx.arc(isoPos.x + 4, isoPos.y - 22, 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw pupils
    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(isoPos.x - 4, isoPos.y - 21, 1.5, 0, Math.PI * 2);
    this.ctx.arc(isoPos.x + 4, isoPos.y - 21, 1.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw mouth
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(isoPos.x, isoPos.y - 17, 3, 0, Math.PI);
    this.ctx.stroke();
  }

  /**
   * Draw all bombs in isometric view
   */
  drawBombs(bombManager) {
    const bombs = bombManager.getBombs();

    for (const bomb of bombs) {
      const { x, y } = bomb.getPosition();
      const isoPos = this.gridToIso(x, y);

      // Draw bomb body
      this.ctx.fillStyle = '#FFD93D';
      this.ctx.beginPath();
      this.ctx.ellipse(isoPos.x, isoPos.y, 10, 12, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw fuse
      this.ctx.strokeStyle = '#FF6B6B';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(isoPos.x, isoPos.y - 12);
      this.ctx.quadraticCurveTo(isoPos.x + 2, isoPos.y - 18, isoPos.x, isoPos.y - 22);
      this.ctx.stroke();

      // Draw spark
      this.ctx.fillStyle = '#FF4444';
      this.ctx.beginPath();
      this.ctx.arc(isoPos.x, isoPos.y - 22, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /**
   * Draw explosions in isometric view
   */
  drawExplosions(bombManager) {
    const explosions = bombManager.getExplosions();

    for (const explosion of explosions) {
      for (const tile of explosion.tiles) {
        const isoPos = this.gridToIso(tile.x, tile.y);

        // Draw explosion flash
        this.ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
        this.ctx.beginPath();
        this.ctx.moveTo(isoPos.x, isoPos.y - 20);
        this.ctx.lineTo(isoPos.x + 20, isoPos.y);
        this.ctx.lineTo(isoPos.x, isoPos.y + 20);
        this.ctx.lineTo(isoPos.x - 20, isoPos.y);
        this.ctx.closePath();
        this.ctx.fill();

        // Draw explosion particles
        this.ctx.fillStyle = 'rgba(255, 150, 0, 0.7)';
        this.ctx.beginPath();
        this.ctx.arc(isoPos.x, isoPos.y, 12, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  /**
   * Draw all enemies in isometric view
   */
  drawEnemies(enemyManager) {
    const enemies = enemyManager.getEnemies();

    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;

      const { x, y } = enemy.getGridPosition();
      const isoPos = this.gridToIso(x, y);

      // Draw enemy as purple ghost/blob
      this.ctx.fillStyle = '#9B59B6';
      this.ctx.beginPath();
      this.ctx.moveTo(isoPos.x - 15, isoPos.y - 10);
      this.ctx.lineTo(isoPos.x + 15, isoPos.y - 10);
      this.ctx.quadraticCurveTo(isoPos.x + 15, isoPos.y + 10, isoPos.x, isoPos.y + 15);
      this.ctx.quadraticCurveTo(isoPos.x - 15, isoPos.y + 10, isoPos.x - 15, isoPos.y - 10);
      this.ctx.closePath();
      this.ctx.fill();

      // Draw wavy bottom
      this.ctx.strokeStyle = '#6C3A7C';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(isoPos.x - 12, isoPos.y + 12);
      for (let i = 0; i < 4; i++) {
        const waveX = isoPos.x - 12 + (i * 8);
        const waveY = isoPos.y + 12 + (i % 2 ? 3 : 0);
        this.ctx.lineTo(waveX, waveY);
      }
      this.ctx.stroke();

      // Draw eyes
      this.ctx.fillStyle = '#fff';
      this.ctx.beginPath();
      this.ctx.arc(isoPos.x - 6, isoPos.y - 2, 3, 0, Math.PI * 2);
      this.ctx.arc(isoPos.x + 6, isoPos.y - 2, 3, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw evil pupils
      this.ctx.fillStyle = '#000';
      this.ctx.beginPath();
      this.ctx.arc(isoPos.x - 6, isoPos.y - 2, 2, 0, Math.PI * 2);
      this.ctx.arc(isoPos.x + 6, isoPos.y - 2, 2, 0, Math.PI * 2);
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
