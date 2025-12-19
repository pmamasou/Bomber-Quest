/**
 * Main Module - Single Responsibility: Entry point and event wiring
 * WHY separate: Keeps main.js clean and focused on setup
 */

let game = null;

/**
 * Initialize game when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  try {
    game = new Game('game-canvas');
    game.start();

    // Wire up keyboard events
    document.addEventListener('keydown', (e) => game.handleKeyDown(e));
    document.addEventListener('keyup', (e) => game.handleKeyUp(e));

    // Wire up button
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        if (game) {
          game.restartGame();
        }
      });
    }
  } catch (error) {
    console.error('Failed to initialize game:', error);
    // Display error to user
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FF6B6B';
      ctx.font = '20px Arial';
      ctx.fillText('Error loading game. Check console.', 50, 50);
    }
  }
});

/**
 * Cleanup when page unloads
 */
window.addEventListener('beforeunload', () => {
  if (game) {
    game.stop();
  }
});
