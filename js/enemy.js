/**
 * Enemy Module - Single Responsibility: Handle enemy movement and AI
 * Enemies patrol and hunt the player, placing bombs strategically
 */

class Enemy {
  constructor(startX, startY, gameMap) {
    this.gridX = startX;
    this.gridY = startY;
    
    // Pixel position
    this.pixelX = startX * GAME_CONFIG.TILE_SIZE;
    this.pixelY = startY * GAME_CONFIG.TILE_SIZE;
    
    // Movement
    this.velocityX = 0;
    this.velocityY = 0;
    
    // AI
    this.decisionCounter = 0;
    this.gameMap = gameMap;
    this.isAlive = true;
    
    // Don't spawn on each other
    this.spawnX = startX;
    this.spawnY = startY;
  }

  /**
   * Update enemy position and AI
   */
  update(gameMap, bomber, bombManager) {
    if (!this.isAlive) return;

    // Make AI decision periodically
    this.decisionCounter++;
    if (this.decisionCounter >= GAME_CONFIG.ENEMY_DECISION_INTERVAL) {
      this.decisionCounter = 0;
      this.makeDecision(bomber, gameMap, bombManager);
    }

    // Apply movement
    this.pixelX += this.velocityX;
    this.pixelY += this.velocityY;

    // Snap to grid
    this.gridX = Math.round(this.pixelX / GAME_CONFIG.TILE_SIZE);
    this.gridY = Math.round(this.pixelY / GAME_CONFIG.TILE_SIZE);

    // Collision detection
    if (!gameMap.isWalkable(this.gridX, this.gridY) || bombManager.hasBombAt(this.gridX, this.gridY)) {
      this.pixelX -= this.velocityX;
      this.pixelY -= this.velocityY;
      this.gridX = Math.round(this.pixelX / GAME_CONFIG.TILE_SIZE);
      this.gridY = Math.round(this.pixelY / GAME_CONFIG.TILE_SIZE);
      this.velocityX = 0;
      this.velocityY = 0;
    }

    // Keep in bounds
    this.pixelX = Math.max(0, Math.min(this.pixelX, 
      GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.TILE_SIZE));
    this.pixelY = Math.max(0, Math.min(this.pixelY, 
      GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.TILE_SIZE));
  }

  /**
   * AI decision making - move toward player or patrol
   */
  makeDecision(bomber, gameMap, bombManager) {
    const bomberPos = bomber.getGridPosition();
    const distance = Math.abs(bomberPos.x - this.gridX) + Math.abs(bomberPos.y - this.gridY);
    
    // If close to player, chase them
    if (distance < 6) {
      this.chasePlayer(bomber);
    } else {
      // Otherwise, patrol randomly
      this.patrol(gameMap, bombManager);
    }
  }

  /**
   * Chase the player
   */
  chasePlayer(bomber) {
    const bomberPos = bomber.getGridPosition();
    const dx = bomberPos.x - this.gridX;
    const dy = bomberPos.y - this.gridY;

    // Move toward player
    if (Math.abs(dx) > Math.abs(dy)) {
      this.velocityX = dx > 0 ? GAME_CONFIG.ENEMY_SPEED : -GAME_CONFIG.ENEMY_SPEED;
      this.velocityY = 0;
    } else {
      this.velocityX = 0;
      this.velocityY = dy > 0 ? GAME_CONFIG.ENEMY_SPEED : -GAME_CONFIG.ENEMY_SPEED;
    }
  }

  /**
   * Random patrol movement
   */
  patrol(gameMap, bombManager) {
    const directions = [
      { vx: GAME_CONFIG.ENEMY_SPEED, vy: 0 },
      { vx: -GAME_CONFIG.ENEMY_SPEED, vy: 0 },
      { vx: 0, vy: GAME_CONFIG.ENEMY_SPEED },
      { vx: 0, vy: -GAME_CONFIG.ENEMY_SPEED },
      { vx: 0, vy: 0 }
    ];

    const dir = directions[Math.floor(Math.random() * directions.length)];
    this.velocityX = dir.vx;
    this.velocityY = dir.vy;
  }

  /**
   * Kill the enemy
   */
  die() {
    this.isAlive = false;
  }

  /**
   * Get enemy position
   */
  getGridPosition() {
    return { x: this.gridX, y: this.gridY };
  }

  /**
   * Get enemy pixel position (for rendering)
   */
  getPixelPosition() {
    return { x: this.pixelX, y: this.pixelY };
  }

  /**
   * Check if enemy is at position
   */
  isAt(gridX, gridY) {
    return this.gridX === gridX && this.gridY === gridY;
  }
}

/**
 * Enemy Manager - manages collection of enemies
 */
class EnemyManager {
  constructor() {
    this.enemies = [];
  }

  /**
   * Add a new enemy
   */
  addEnemy(gridX, gridY, gameMap) {
    const enemy = new Enemy(gridX, gridY, gameMap);
    this.enemies.push(enemy);
    return enemy;
  }

  /**
   * Update all enemies
   */
  update(gameMap, bomber, bombManager) {
    for (const enemy of this.enemies) {
      if (enemy.isAlive) {
        enemy.update(gameMap, bomber, bombManager);
      }
    }
  }

  /**
   * Get all living enemies
   */
  getEnemies() {
    return this.enemies.filter(e => e.isAlive);
  }

  /**
   * Check if bomber collides with any enemy
   */
  checkCollision(bomber) {
    const pos = bomber.getGridPosition();
    return this.enemies.some(enemy => 
      enemy.isAlive && enemy.isAt(pos.x, pos.y)
    );
  }

  /**
   * Clear all enemies
   */
  clear() {
    this.enemies = [];
  }
}
