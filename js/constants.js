/**
 * Game Constants - No magic numbers!
 * All game values extracted here for easy tuning and maintainability
 */

const DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// Generate 5 levels per difficulty (15 total)
const generateLevels = () => {
  const levelConfigs = [];
  let levelNumber = 1;
  
  // EASY: 5 levels
  for (let i = 0; i < 5; i++) {
    levelConfigs.push({
      difficulty: DIFFICULTIES.EASY,
      number: i + 1,
      wallDensity: 0.2 + (i * 0.05),
      diamondX: 14,
      diamondY: 14,
      timeLimit: 120 - (i * 5),
      bombCount: 1,
      enemyCount: 1,
      levelNumber
    });
    levelNumber++;
  }
  
  // MEDIUM: 5 levels
  for (let i = 0; i < 5; i++) {
    levelConfigs.push({
      difficulty: DIFFICULTIES.MEDIUM,
      number: i + 1,
      wallDensity: 0.35 + (i * 0.05),
      diamondX: 14,
      diamondY: 14,
      timeLimit: 100 - (i * 5),
      bombCount: 1 + Math.floor(i / 2),
      enemyCount: 1 + i,
      levelNumber
    });
    levelNumber++;
  }
  
  // HARD: 5 levels
  for (let i = 0; i < 5; i++) {
    levelConfigs.push({
      difficulty: DIFFICULTIES.HARD,
      number: i + 1,
      wallDensity: 0.45 + (i * 0.05),
      diamondX: 14,
      diamondY: 14,
      timeLimit: 80 - (i * 5),
      bombCount: 2 + Math.floor(i / 2),
      enemyCount: 2 + i,
      levelNumber
    });
    levelNumber++;
  }
  
  return levelConfigs;
};

const GAME_CONFIG = {
  // Canvas settings
  CANVAS_WIDTH: 640,
  CANVAS_HEIGHT: 640,
  
  // Grid settings (640 / 40 = 16x16 grid)
  TILE_SIZE: 40,
  GRID_WIDTH: 16,
  GRID_HEIGHT: 16,
  
  // Game settings
  MAX_LIVES: 3,
  FRAME_RATE: 60,
  
  // Bomber settings
  BOMBER_START_X: 1,
  BOMBER_START_Y: 1,
  BOMBER_SPEED: 2, // pixels per frame
  
  // Bomb settings
  BOMB_TIMER_MS: 2000,
  BOMB_BLAST_RADIUS: 2,
  BOMB_INITIAL_COUNT: 1,
  
  // Enemy settings
  ENEMY_SPEED: 1.5,
  ENEMY_DECISION_INTERVAL: 60, // frames between decisions
  
  // Level settings
  LEVELS: generateLevels(),
  
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
    ENEMY: '#9B59B6',
    BOMB: '#FFD93D',
    EXPLOSION: '#FF6348',
    DESTRUCTIBLE_WALL: '#4ECDC4',
    INDESTRUCTIBLE_WALL: '#95A5A6',
    DIAMOND: '#FFD700',
    TEXT: '#FFF',
    TIMER_OK: '#27AE60',
    TIMER_WARN: '#F39C12',
    TIMER_DANGER: '#E74C3C'
  }
};

// Lock configuration
Object.freeze(GAME_CONFIG);
Object.freeze(GAME_CONFIG.WALL_TYPES);
Object.freeze(GAME_CONFIG.COLORS);
Object.freeze(DIFFICULTIES);
