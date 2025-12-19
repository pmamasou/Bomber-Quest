/**
 * Bomb Module - Single Responsibility: Handle bomb placement, timing, and explosions
 * Tracks individual bombs and their lifecycles
 */

class Bomb {
  constructor(gridX, gridY, onExplode) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.createdAt = Date.now();
    this.onExplode = onExplode; // Callback when bomb explodes
    this.hasExploded = false;
  }

  /**
   * Check if bomb should explode based on timer
   */
  shouldExplode() {
    if (this.hasExploded) return false;
    
    const elapsed = Date.now() - this.createdAt;
    return elapsed >= GAME_CONFIG.BOMB_TIMER_MS;
  }

  /**
   * Trigger explosion and call callback
   */
  explode() {
    if (this.hasExploded) return;
    
    this.hasExploded = true;
    
    // Calculate blast radius (4 directions from bomb)
    const blastTiles = this.calculateBlastArea();
    
    if (this.onExplode) {
      this.onExplode(blastTiles);
    }
    
    return blastTiles;
  }

  /**
   * Calculate which tiles are in the blast radius
   * WHY: Separate calculation from explosion so we can query blast area
   */
  calculateBlastArea() {
    const blastTiles = [
      { x: this.gridX, y: this.gridY } // Center
    ];
    
    const { BOMB_BLAST_RADIUS, GRID_WIDTH, GRID_HEIGHT } = GAME_CONFIG;
    
    // Four directions: up, down, left, right
    const directions = [
      { dx: 0, dy: -1 }, // up
      { dx: 0, dy: 1 },  // down
      { dx: -1, dy: 0 }, // left
      { dx: 1, dy: 0 }   // right
    ];

    for (const dir of directions) {
      for (let i = 1; i <= BOMB_BLAST_RADIUS; i++) {
        const x = this.gridX + dir.dx * i;
        const y = this.gridY + dir.dy * i;
        
        // Stop at boundaries
        if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) {
          break;
        }
        
        blastTiles.push({ x, y });
      }
    }

    return blastTiles;
  }

  /**
   * Check if bomb is at a specific position
   */
  isAt(gridX, gridY) {
    return this.gridX === gridX && this.gridY === gridY;
  }

  /**
   * Get bomb position
   */
  getPosition() {
    return { x: this.gridX, y: this.gridY };
  }
}

/**
 * Bomb Manager - manages collection of bombs and their lifecycles
 */
class BombManager {
  constructor() {
    this.bombs = [];
    this.explosions = []; // Track active explosions for animation
  }

  /**
   * Create and add a new bomb
   */
  addBomb(gridX, gridY, onExplode) {
    const bomb = new Bomb(gridX, gridY, onExplode);
    this.bombs.push(bomb);
    return bomb;
  }

  /**
   * Update all bombs (check for explosions)
   */
  update() {
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const bomb = this.bombs[i];
      
      if (bomb.shouldExplode()) {
        const blastArea = bomb.explode();
        this.explosions.push({
          tiles: blastArea,
          createdAt: Date.now()
        });
        
        // Remove exploded bomb
        this.bombs.splice(i, 1);
      }
    }

    // Clean up old explosions (show for 200ms)
    const now = Date.now();
    this.explosions = this.explosions.filter(exp => 
      now - exp.createdAt < 200
    );
  }

  /**
   * Check if a tile has a bomb
   */
  hasBombAt(gridX, gridY) {
    return this.bombs.some(bomb => bomb.isAt(gridX, gridY));
  }

  /**
   * Check if a tile is in explosion
   */
  isInExplosion(gridX, gridY) {
    return this.explosions.some(exp => 
      exp.tiles.some(tile => tile.x === gridX && tile.y === gridY)
    );
  }

  /**
   * Get all bombs
   */
  getBombs() {
    return this.bombs;
  }

  /**
   * Get active explosions
   */
  getExplosions() {
    return this.explosions;
  }

  /**
   * Clear all bombs and explosions
   */
  clear() {
    this.bombs = [];
    this.explosions = [];
  }
}
