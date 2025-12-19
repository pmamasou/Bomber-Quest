# 💣 Bomber Quest - Find the Diamond

A fun, browser-based maze exploration game built with vanilla JavaScript and HTML Canvas.

## Game Description

Navigate a 2D maze as a bomber, place bombs to destroy walls, and find the diamond to complete each level. Be careful—you'll die from your own explosions!

### Features
- **3 Progressive Levels** - Each with different layouts and difficulty
- **Bomb Mechanics** - Place bombs, destroy walls, find the exit
- **Score System** - Earn points for destroying walls and completing levels
- **Smooth Movement** - Pixel-perfect collision detection
- **Responsive Design** - Works on desktop and mobile

## How to Play

### Controls
- **Arrow Keys** or **WASD** - Move the bomber
- **SPACE** - Place a bomb
- **Goal** - Find the 💎 diamond to complete the level

### Rules
1. Move around the maze to find the diamond
2. Place bombs to destroy blue walls and create paths
3. Avoid being in the blast radius when bombs explode
4. Complete all 3 levels to win!

## Game Architecture

This game follows professional best practices with **Single Responsibility Principle**:

```
js/
├── constants.js    - All game configuration (no magic numbers!)
├── map.js         - Maze generation and wall management
├── bomber.js      - Player movement and bomb tracking
├── bomb.js        - Bomb mechanics and explosions
├── physics.js     - Collision detection and game state
├── renderer.js    - All drawing and visual rendering
├── game.js        - Game loop and state orchestration
└── main.js        - Entry point and event handling
```

### Design Principles Applied
✅ Single Responsibility - Each module has ONE job
✅ No Magic Numbers - All values extracted to constants
✅ Clean Naming - camelCase for functions, UPPER_SNAKE_CASE for constants
✅ Error Handling - Try-catch and graceful degradation
✅ Separation of Concerns - Logic, rendering, and input are separate
✅ Accessibility - Semantic HTML, proper contrast, keyboard support

## Local Development

### Run Locally
1. Open `index.html` in a web browser (or use a local server)
2. Play the game!

### Using Python HTTP Server (recommended)
```bash
cd Myowngame
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Deployment to Netlify

### Option 1: Drag & Drop (Easiest)
1. Go to [netlify.com](https://netlify.com)
2. Sign up or log in
3. Drag and drop your `Myowngame` folder onto the Netlify deploy area
4. Your game is now live! 🎉

### Option 2: GitHub Integration
1. Push this repo to GitHub
2. Connect your GitHub account to Netlify
3. Select the repository
4. Netlify automatically deploys on every push

### Option 3: CLI Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir="."
```

## Game Configuration

To customize the game, edit `js/constants.js`:

```javascript
GAME_CONFIG.LEVELS[0].wallDensity = 0.5  // More walls
GAME_CONFIG.BOMB_TIMER_MS = 3000        // Longer fuse
GAME_CONFIG.BOMB_BLAST_RADIUS = 3       // Bigger explosion
```

## Future Enhancements
- Enemy bombers (hard mode)
- Power-ups (extra bombs, bigger blast radius)
- Sound effects and background music
- Level editor
- Multiplayer mode
- Mobile touch controls
- Difficulty settings

## Technical Stack
- **Language**: Vanilla JavaScript (ES6)
- **Graphics**: HTML5 Canvas
- **Styling**: CSS3 with flexbox
- **No Dependencies**: Pure vanilla - no frameworks or libraries!

## Browser Compatibility
- Chrome/Edge ✅
- Firefox ✅
- Safari ✅
- Mobile browsers ✅

## Credits
Created with ❤️ following professional game development best practices.

---

**Ready to deploy?** Push to Netlify and share the link!
