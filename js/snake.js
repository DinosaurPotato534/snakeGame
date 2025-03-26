// Snake game implementation in A-Frame - Complete rewrite

// Register A-Frame component for the snake game
AFRAME.registerComponent('snake-game', {
  schema: {
    gridSize: {type: 'number', default: 19},
    cellSize: {type: 'number', default: 1},
    moveInterval: {type: 'number', default: 200},
    debug: {type: 'boolean', default: true},
    fixedCamera: {type: 'boolean', default: true}
  },
  
  init: function() {
    if (!this.el.sceneEl.hasLoaded) {
      this.el.sceneEl.addEventListener('loaded', this.init.bind(this));
      return;
    }
    
    if (this.data.fixedCamera) {
      this.setupFixedCamera();
    }

    this.config = {
      snakeStartLength: 3,
      colors: {
        snakeHead: '#FF5722',
        snakeBody: '#FF9800',
        food: '#F44336'
      }
    };

    this.resetGameState();

    this.setupControls();

    this.createInitialSnake();

    this.spawnFood();
    
    this.startGameTimeout = setTimeout(() => {
      if (this.data.debug) console.log("Starting game movement...");
      this.startGameMovement();
    }, 1000);
  },
  
  resetGameState: function() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
    
    if (this.startGameTimeout) {
      clearTimeout(this.startGameTimeout);
      this.startGameTimeout = null;
    }

    this.clearGameEntities();

    this.snake = [];
    this.direction = {x: 1, y: 0};
    this.nextDirection = {x: 1, y: 0};
    this.food = null;
    this.score = 0;
    this.gameOver = false;
    
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
      scoreElement.textContent = '0';
    } else if (this.data.debug) {
      console.warn("Score element not found!");
    }
    
    if (this.data.debug) console.log("Game state reset.");
  },
  
  clearGameEntities: function() {
    const entities = document.querySelectorAll('.snake-segment, .food-item');
    entities.forEach(entity => {
      if (entity && entity.parentNode) {
        entity.parentNode.removeChild(entity);
      }
    });
    
    this.snake = [];
    this.food = null;
  },
  
  createInitialSnake: function() {
    if (this.data.debug) console.log("Creating initial snake...");
    
    this.snake.forEach(segment => {
      if (segment.element && segment.element.parentNode) {
        segment.element.parentNode.removeChild(segment.element);
      }
    });
    
    this.snake = [];
    
    for (let i = 0; i < this.config.snakeStartLength; i++) {
      const position = {x: -i, y: 0, z: 0.5};
      const isHead = i === 0;
      
      this.addSnakeSegment(position, isHead);
    }
    
    if (this.data.debug) console.log(`Snake created with ${this.snake.length} segments.`);
  },
  
  addSnakeSegment: function(position, isHead) {
    const scene = this.el.sceneEl;
    const segment = document.createElement('a-box');

    segment.setAttribute('position', `${position.x} ${position.z} ${position.y}`);
    segment.setAttribute('width', this.data.cellSize);
    segment.setAttribute('height', this.data.cellSize);
    segment.setAttribute('depth', this.data.cellSize);

    segment.setAttribute('color', isHead ? this.config.colors.snakeHead : this.config.colors.snakeBody);

    segment.classList.add('snake-segment');

    scene.appendChild(segment);

    this.snake.push({
      x: position.x,
      y: position.y,
      element: segment,
      isHead: isHead
    });
  },
  
  spawnFood: function() {
    if (this.data.debug) console.log("Spawning food...");

    if (this.food && this.food.element) {
      if (this.food.element.parentNode) {
        this.food.element.parentNode.removeChild(this.food.element);
      }
    }

    let validPosition = false;
    let x, y;
    const halfGrid = Math.floor(this.data.gridSize / 2);
    
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!validPosition && attempts < maxAttempts) {
      x = Math.floor(Math.random() * this.data.gridSize) - halfGrid;
      y = Math.floor(Math.random() * this.data.gridSize) - halfGrid;
      
      validPosition = !this.snake.some(segment => segment.x === x && segment.y === y);
      attempts++;
    }
    
    if (!validPosition) {
      if (this.data.debug) console.warn("Could not find valid food position after max attempts!");
      return;
    }

    const scene = this.el.sceneEl;
    const foodEntity = document.createElement('a-sphere');
    
    foodEntity.setAttribute('position', `${x} 0.5 ${y}`);
    foodEntity.setAttribute('radius', this.data.cellSize / 2);
    foodEntity.setAttribute('color', this.config.colors.food);
    foodEntity.classList.add('food-item');
    
    scene.appendChild(foodEntity);
    this.food = { x, y, element: foodEntity };
    
    if (this.data.debug) console.log(`Food spawned at (${x}, ${y}).`);
  },
  
  startGameMovement: function() {
    if (this.data.debug) console.log("Game movement started.");
    this.gameInterval = setInterval(() => this.gameStep(), this.data.moveInterval);
  },
  
  gameStep: function() {
    if (this.gameOver) return;

    this.direction = {...this.nextDirection};

    const head = this.snake[0];

    const newX = head.x + this.direction.x;
    const newY = head.y + this.direction.y;

    const halfGrid = Math.floor(this.data.gridSize / 2);
    if (Math.abs(newX) > halfGrid || Math.abs(newY) > halfGrid) {
      if (this.data.debug) console.log(`Wall collision at (${newX}, ${newY}). Grid bounds: ±${halfGrid}`);
      this.handleGameOver();
      return;
    }

    for (let i = 0; i < this.snake.length - 1; i++) {
      if (this.snake[i].x === newX && this.snake[i].y === newY) {
        if (this.data.debug) console.log(`Self collision at (${newX}, ${newY}) with segment ${i}`);
        this.handleGameOver();
        return;
      }
    }

    const newHead = {
      x: newX,
      y: newY,
      isHead: true
    };

    const scene = this.el.sceneEl;
    const headElement = document.createElement('a-box');
    
    headElement.setAttribute('position', `${newHead.x} 0.5 ${newHead.y}`);
    headElement.setAttribute('width', this.data.cellSize);
    headElement.setAttribute('height', this.data.cellSize);
    headElement.setAttribute('depth', this.data.cellSize);
    headElement.setAttribute('color', this.config.colors.snakeHead);
    headElement.classList.add('snake-segment');
    
    scene.appendChild(headElement);
    newHead.element = headElement;

    if (this.snake[0]) {
      this.snake[0].isHead = false;
      this.snake[0].element.setAttribute('color', this.config.colors.snakeBody);
    }

    this.snake.unshift(newHead);

    if (this.food && newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score += 10;
      document.getElementById('score').textContent = this.score;
      
      if (this.food.element && this.food.element.parentNode) {
        this.food.element.parentNode.removeChild(this.food.element);
      }

      this.spawnFood();
    } else {
      const tail = this.snake.pop();
      if (tail && tail.element && tail.element.parentNode) {
        tail.element.parentNode.removeChild(tail.element);
      }
    }
  },
  
  handleGameOver: function() {
    if (this.gameOver) return;
    
    this.gameOver = true;
    
    if (this.data.debug) console.log(`Game over! Score: ${this.score}`);
    
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }

    setTimeout(() => {
      alert(`Game Over! Your score was ${this.score}. Press OK to restart.`);
      
      this.resetGameState();
      this.createInitialSnake();
      this.spawnFood();
      
      this.startGameTimeout = setTimeout(() => {
        this.gameOver = false;
        this.startGameMovement();
      }, 500);
    }, 100);
  },
  
  setupControls: function() {
    if (this.data.debug) console.log("Setting up controls...");
    
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }
    
    this.keydownHandler = (event) => {
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          if (this.direction.y !== 1) {
            this.nextDirection = {x: 0, y: -1};
          }
          break;
        case 'ArrowDown':
        case 's':
          if (this.direction.y !== -1) {
            this.nextDirection = {x: 0, y: 1};
          }
          break;
        case 'ArrowLeft':
        case 'a':
          if (this.direction.x !== 1) {
            this.nextDirection = {x: -1, y: 0};
          }
          break;
        case 'ArrowRight':
        case 'd':
          if (this.direction.x !== -1) {
            this.nextDirection = {x: 1, y: 0};
          }
          break;
      }
    };
    
    document.addEventListener('keydown', this.keydownHandler);
  },
  
  setupFixedCamera: function() {
    const cameraEl = document.querySelector('a-camera');
    if (cameraEl) {
      cameraEl.setAttribute('look-controls', {enabled: false});
      cameraEl.setAttribute('wasd-controls', {enabled: false});
      
      cameraEl.addEventListener('mousedown', function(e) { e.stopPropagation(); }, false);
      cameraEl.addEventListener('mouseup', function(e) { e.stopPropagation(); }, false);
      cameraEl.addEventListener('touchstart', function(e) { e.stopPropagation(); }, false);
      cameraEl.addEventListener('touchend', function(e) { e.stopPropagation(); }, false);
    }

    const sceneEl = this.el.sceneEl;
    sceneEl.setAttribute('vr-mode-ui', {enabled: false});
  },
  
  remove: function() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    
    if (this.startGameTimeout) {
      clearTimeout(this.startGameTimeout);
    }
    
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }
    
    this.clearGameEntities();
  }
});
