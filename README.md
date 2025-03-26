# A-Frame Snake Game

A simple 3D snake game built with A-Frame.

## Running the Game

A-Frame requires the game to be served from a web server due to browser security restrictions.

### Option 1: Using the included Node.js server

1. Make sure you have [Node.js](https://nodejs.org/) installed
2. Run the `start-server.bat` file (Windows) or run `node server.js` in your terminal
3. Open your browser and go to http://localhost:8000

### Option 2: Using Python's built-in server

1. Open a command prompt or terminal
2. Navigate to the game directory
3. Run one of these commands depending on your Python version:
   - Python 3: `python -m http.server 8000`
   - Python 2: `python -m SimpleHTTPServer 8000`
4. Open your browser and go to http://localhost:8000

### Option 3: Using VS Code Live Server extension

1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VS Code
2. Right-click on `index.html` and select "Open with Live Server"

## How to Play

- Use arrow keys or WASD to control the snake
- Collect the red spheres to grow your snake and score points
- Avoid hitting the walls or your own body
