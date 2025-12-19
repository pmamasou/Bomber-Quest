/**
 * Game Constants - No magic numbers!
 * All game values extracted here for easy tuning and maintainability
 */

const GAME_CONFIG = {
  // Canvas settings
  CANVAS_WIDTH: 640,
  CANVAS_HEIGHT: 640,
  
  // Grid settings (640 / 40 = 16x16 grid)
  TILE_SIZE: 40,
  GRID_WIDTH: 16,
  GRID_HEIGHT: 16,
  
  // Bomber settings
  BOMBER_START_X: 1,
  BOMBER_START_Y: 1,
  BOMBER_SPEED: 2, // pixels per frame
  
  // Bomb settings
  BOMB_TIMER_MS: 2000, // Time before bomb explodes
  BOMB_BLAST_RADIUS: 2, // tiles in each direction
  BOMB_INITIAL_COUNT: 1, // Bombs player can have at once
  
  // Level settings
  LEVELS: [
    {
      level: 1,
      wallDensity: 0.3, // 30% destructible walls
      diamondX: 14,
      diamondY: 14,
      timeLimit: 60 // seconds (MVP: no time limit, but structure for future)
    },
    {
      level: 2,
      wallDensity: 0.4, // Harder
      diamondX: 14,
      diamondY: 1,
      timeLimit: 45
    },
    {
      level: 3,
      wallDensity: 0.5, // Even harder
      diamondX: 1,
      diamondY: 14,
      timeLimit: 40
    }
  ],
  
  // Wall types
  WALL_TYPES: {
    EMPTY: 0,
    DESTRUCTIBLE: 1,
    INDESTRUCTIBLE: 2,
    DIAMOND: 3
  },
  
  // Colors
  COLORS: {
    BACKGROUND: '#222',
    GRID_LINE: '#333',
    BOMBER: '#FF6B6B',
    BOMB: '#FFD93D',
    EXPLOSION: '#FF6348',
    DESTRUCTIBLE_WALL: '#4ECDC4',
    INDESTRUCTIBLE_WALL: '#95A5A6',
    DIAMOND: '#FFD700'
  },
  
  // UI
  FRAME_RATE: 60
};

// Lock configuration to prevent accidental modifications
Object.freeze(GAME_CONFIG);
Object.freeze(GAME_CONFIG.WALL_TYPES);
Object.freeze(GAME_CONFIG.COLORS);
Object.freeze(GAME_CONFIG.LEVELS);
