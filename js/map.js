/**
 * Map Module - Single Responsibility: Create, manage, and render the game maze
 * Handles wall generation, collision detection map, and layout
 */

class GameMap {
  constructor(levelConfig) {
    this.levelConfig = levelConfig;
    this.grid = [];
    this.generateMap();
  }

  /**
   * Generate the game map with destructible and indestructible walls
   * WHY: Map needs to be generated each level with slightly different wall layouts
   */
  generateMap() {
    const { GRID_WIDTH, GRID_HEIGHT, WALL_TYPES } = GAME_CONFIG;
    
    // Initialize empty grid
    this.grid = Array(GRID_HEIGHT)
      .fill(null)
      .map(() => Array(GRID_WIDTH).fill(WALL_TYPES.EMPTY));

    // Create border of indestructible walls
    for (let x = 0; x < GRID_WIDTH; x++) {
      this.grid[0][x] = WALL_TYPES.INDESTRUCTIBLE;
      this.grid[GRID_HEIGHT - 1][x] = WALL_TYPES.INDESTRUCTIBLE;
    }
    for (let y = 0; y < GRID_HEIGHT; y++) {
      this.grid[y][0] = WALL_TYPES.INDESTRUCTIBLE;
      this.grid[y][GRID_WIDTH - 1] = WALL_TYPES.INDESTRUCTIBLE;
    }

    // Create grid pattern of indestructible walls (checkerboard at even positions)
    for (let y = 2; y < GRID_HEIGHT - 1; y += 2) {
      for (let x = 2; x < GRID_WIDTH - 1; x += 2) {
        this.grid[y][x] = WALL_TYPES.INDESTRUCTIBLE;
      }
    }

    // Add destructible walls randomly
    for (let y = 1; y < GRID_HEIGHT - 1; y++) {
      for (let x = 1; x < GRID_WIDTH - 1; x++) {
        // Skip if already a wall or in starting area
        if (this.grid[y][x] !== WALL_TYPES.EMPTY) continue;
        if (x < 3 && y < 3) continue; // Keep starting area clear
        
        if (Math.random() < this.levelConfig.wallDensity) {
          this.grid[y][x] = WALL_TYPES.DESTRUCTIBLE;
        }
      }
    }

    // Place diamond
    this.grid[this.levelConfig.diamondY][this.levelConfig.diamondX] = WALL_TYPES.DIAMOND;
  }

  /**
   * Check if a position is walkable (no walls or bombs)
   * Used for collision detection and pathfinding
   */
  isWalkable(gridX, gridY, ignoreItems = []) {
    // Bounds check
    if (gridX < 0 || gridY < 0 || gridX >= GAME_CONFIG.GRID_WIDTH || gridY >= GAME_CONFIG.GRID_HEIGHT) {
      return false;
    }

    const tileType = this.grid[gridY][gridX];
    
    // Can't walk through walls
    if (tileType === GAME_CONFIG.WALL_TYPES.DESTRUCTIBLE || 
        tileType === GAME_CONFIG.WALL_TYPES.INDESTRUCTIBLE) {
      return false;
    }

    return true;
  }

  /**
   * Destroy a destructible wall at grid position
   */
  destroyWall(gridX, gridY) {
    if (this.isValidPosition(gridX, gridY) && 
        this.grid[gridY][gridX] === GAME_CONFIG.WALL_TYPES.DESTRUCTIBLE) {
      this.grid[gridY][gridX] = GAME_CONFIG.WALL_TYPES.EMPTY;
      return true;
    }
    return false;
  }

  /**
   * Check if position is within grid bounds
   */
  isValidPosition(gridX, gridY) {
    return gridX >= 0 && gridY >= 0 && 
           gridX < GAME_CONFIG.GRID_WIDTH && 
           gridY < GAME_CONFIG.GRID_HEIGHT;
  }

  /**
   * Get tile type at position
   */
  getTile(gridX, gridY) {
    if (!this.isValidPosition(gridX, gridY)) {
      return GAME_CONFIG.WALL_TYPES.INDESTRUCTIBLE;
    }
    return this.grid[gridY][gridX];
  }

  /**
   * Get the complete grid (for rendering)
   */
  getGrid() {
    return this.grid;
  }
}
