/**
 * Physics Module - Single Responsibility: Handle collision detection and game state checks
 * Keeps all physics/collision logic in one place
 */

class Physics {
  /**
   * Check if bomber collides with explosion
   */
  static isBomberInExplosion(bomber, bombManager) {
    const { x, y } = bomber.getGridPosition();
    return bombManager.isInExplosion(x, y);
  }

  /**
   * Check if bomber reached the diamond
   */
  static isBomberOnDiamond(bomber, gameMap) {
    const { x, y } = bomber.getGridPosition();
    return gameMap.getTile(x, y) === GAME_CONFIG.WALL_TYPES.DIAMOND;
  }

  /**
   * Check if bomber can place a bomb at current position
   */
  static canPlaceBombHere(gridX, gridY, gameMap, bombManager) {
    // Can't place if there's already a bomb there
    if (bombManager.hasBombAt(gridX, gridY)) {
      return false;
    }

    // Can't place on walls
    if (!gameMap.isWalkable(gridX, gridY)) {
      return false;
    }

    return true;
  }

  /**
   * Process explosion effects (destroy walls, etc)
   * WHY: Centralize all effects in one place for easier debugging
   */
  static processExplosion(blastTiles, gameMap) {
    const destroyedWalls = [];

    for (const tile of blastTiles) {
      const { x, y } = tile;
      
      // Stop at indestructible walls
      if (gameMap.getTile(x, y) === GAME_CONFIG.WALL_TYPES.INDESTRUCTIBLE) {
        continue;
      }

      // Destroy destructible walls
      if (gameMap.destroyWall(x, y)) {
        destroyedWalls.push(tile);
      }
    }

    return destroyedWalls;
  }

  /**
   * Handle bomb explosion: destroy walls and notify caller
   * This is called when a bomb actually explodes
   */
  static handleBombExplosion(blastTiles, gameMap, bomber) {
    // Check if bomber is in blast radius
    const bomberPos = bomber.getGridPosition();
    const bomberHit = blastTiles.some(tile => 
      tile.x === bomberPos.x && tile.y === bomberPos.y
    );

    // Process wall destruction
    Physics.processExplosion(blastTiles, gameMap);

    return {
      bomberHit,
      destroyedWalls: blastTiles
    };
  }
}
