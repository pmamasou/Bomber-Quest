/**
 * Bomber Module - Single Responsibility: Handle bomber movement and bomb placement
 * WHY separate: Bomber logic is independent of explosions, map, etc.
 */

class Bomber {
  constructor(startX, startY) {
    this.gridX = startX;
    this.gridY = startY;
    
    // Pixel position for smooth movement
    this.pixelX = startX * GAME_CONFIG.TILE_SIZE;
    this.pixelY = startY * GAME_CONFIG.TILE_SIZE;
    
    // Movement
    this.velocityX = 0;
    this.velocityY = 0;
    this.isMoving = false;
    
    // Bomb management
    this.maxBombs = GAME_CONFIG.BOMB_INITIAL_COUNT;
    this.activeBombs = 0;
    this.canPlaceBomb = true;
    
    // State
    this.isAlive = true;
    this.explosionTimer = null;
  }

  /**
   * Update bomber position based on velocity
   * WHY: Smooth pixel-based movement within grid constraints
   */
  update(gameMap) {
    if (!this.isAlive) return;

    // Apply velocity
    this.pixelX += this.velocityX;
    this.pixelY += this.velocityY;

    // Snap to grid when aligned
    this.gridX = Math.round(this.pixelX / GAME_CONFIG.TILE_SIZE);
    this.gridY = Math.round(this.pixelY / GAME_CONFIG.TILE_SIZE);

    // Collision detection with walls
    if (!gameMap.isWalkable(this.gridX, this.gridY)) {
      // Back up from wall
      this.pixelX -= this.velocityX;
      this.pixelY -= this.velocityY;
      this.gridX = Math.round(this.pixelX / GAME_CONFIG.TILE_SIZE);
      this.gridY = Math.round(this.pixelY / GAME_CONFIG.TILE_SIZE);
    }

    // Keep in bounds
    this.pixelX = Math.max(0, Math.min(this.pixelX, 
      GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.TILE_SIZE));
    this.pixelY = Math.max(0, Math.min(this.pixelY, 
      GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.TILE_SIZE));
  }

  /**
   * Set movement direction
   */
  setVelocity(vx, vy) {
    this.velocityX = vx * GAME_CONFIG.BOMBER_SPEED;
    this.velocityY = vy * GAME_CONFIG.BOMBER_SPEED;
  }

  /**
   * Stop movement
   */
  stopMovement() {
    this.velocityX = 0;
    this.velocityY = 0;
  }

  /**
   * Check if bomber can place a bomb
   */
  canPlaceBombNow() {
    return this.isAlive && this.activeBombs < this.maxBombs;
  }

  /**
   * Register that a bomb was placed
   */
  placeBomb() {
    if (this.canPlaceBombNow()) {
      this.activeBombs++;
      return true;
    }
    return false;
  }

  /**
   * Register that a bomb exploded (freed up bomb slot)
   */
  bombExploded() {
    if (this.activeBombs > 0) {
      this.activeBombs--;
    }
  }

  /**
   * Kill the bomber and mark for explosion animation
   * WHY: Separate from logic so game can show death animation
   */
  die() {
    if (this.isAlive) {
      this.isAlive = false;
      // Could add explosion animation timer here
    }
  }

  /**
   * Get bomber position in grid coordinates
   */
  getGridPosition() {
    return { x: this.gridX, y: this.gridY };
  }

  /**
   * Get bomber position in pixel coordinates (for rendering)
   */
  getPixelPosition() {
    return { x: this.pixelX, y: this.pixelY };
  }

  /**
   * Check if bomber is on a specific grid tile
   */
  isAt(gridX, gridY) {
    return this.gridX === gridX && this.gridY === gridY;
  }
}
