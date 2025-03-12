export class Snake {
  constructor(canvas, auth) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridSize = 20;
    this.snake = [{ x: 5, y: 5 }];
    this.direction = 'right';
    this.food = this.generateFood();
    this.score = 0;
    this.gameOver = false;
    this.gameLoop = null;
    this.speed = 100;
    this.snakeHead = new Image();
    this.snakeBody = new Image();
    this.snakeHead.src = '/snake-head.svg';
    this.snakeBody.src = '/snake-body.svg';
    this.auth = auth;

    this.bindControls();
    this.updateLeaderboard();
  }

  saveHighScore() {
    if (this.auth.isLoggedIn()) {
      this.auth.saveHighScore(this.score);
      this.updateLeaderboard();
    }
  }

  updateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';

    const allHighScores = this.auth.getAllHighScores();
    allHighScores.forEach((scoreData, index) => {
      const item = document.createElement('div');
      item.className = 'leaderboard-item';
      item.innerHTML = `
        <span class="leaderboard-rank">#${index + 1}</span>
        <span class="leaderboard-username">${scoreData.username}</span>
        <span class="leaderboard-score">${scoreData.score}</span>
      `;
      leaderboardList.appendChild(item);
    });
  }

  bindControls() {
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (this.direction !== 'down') this.direction = 'up';
          break;
        case 'ArrowDown':
          if (this.direction !== 'up') this.direction = 'down';
          break;
        case 'ArrowLeft':
          if (this.direction !== 'right') this.direction = 'left';
          break;
        case 'ArrowRight':
          if (this.direction !== 'left') this.direction = 'right';
          break;
      }
    });
  }

  generateFood() {
    const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
    const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
    return { x, y };
  }

  update() {
    if (this.gameOver) return;

    const head = { ...this.snake[0] };

    switch (this.direction) {
      case 'up': head.y--; break;
      case 'down': head.y++; break;
      case 'left': head.x--; break;
      case 'right': head.x++; break;
    }

    // 检查碰撞
    if (this.checkCollision(head)) {
      this.gameOver = true;
      return;
    }

    this.snake.unshift(head);

    // 检查是否吃到食物
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      document.getElementById('scoreValue').textContent = this.score;
      this.food = this.generateFood();
    } else {
      this.snake.pop();
    }
  }

  checkCollision(head) {
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
      head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
      if (!this.gameOver) {
        this.saveHighScore();
      }
      return true;
    }

    // 检查自身碰撞
    const collision = this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    if (collision && !this.gameOver) {
      this.saveHighScore();
    }
    return collision;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制蛇身
    if (this.snake.length > 1) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = '#4CAF50';
      this.ctx.lineWidth = this.gridSize - 2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      // 创建贝塞尔曲线的控制点
      const points = this.snake.map(segment => ({
        x: segment.x * this.gridSize + this.gridSize / 2,
        y: segment.y * this.gridSize + this.gridSize / 2
      }));

      this.ctx.moveTo(points[0].x, points[0].y);

      // 使用贝塞尔曲线连接蛇身各个部分
      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        this.ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }

      // 连接到最后一个点
      if (points.length > 1) {
        const lastPoint = points[points.length - 1];
        this.ctx.lineTo(lastPoint.x, lastPoint.y);
      }

      this.ctx.stroke();
    }

    // 绘制蛇头
    const head = this.snake[0];
    const x = head.x * this.gridSize;
    const y = head.y * this.gridSize;

    this.ctx.save();
    this.ctx.translate(x + this.gridSize / 2, y + this.gridSize / 2);

    switch (this.direction) {
      case 'up': this.ctx.rotate(-Math.PI / 2); break;
      case 'down': this.ctx.rotate(Math.PI / 2); break;
      case 'left': this.ctx.rotate(Math.PI); break;
      case 'right': this.ctx.rotate(0); break;
    }

    this.ctx.drawImage(
      this.snakeHead,
      -this.gridSize / 2,
      -this.gridSize / 2,
      this.gridSize,
      this.gridSize
    );
    this.ctx.restore();

    // 绘制食物
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(
      this.food.x * this.gridSize,
      this.food.y * this.gridSize,
      this.gridSize - 2,
      this.gridSize - 2
    );

    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = 'white';
      this.ctx.font = '30px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('游戏结束!', this.canvas.width / 2, this.canvas.height / 2);

      // 显示重新开始按钮
      const startButton = document.getElementById('startButton');
      startButton.style.display = 'block';
      startButton.textContent = '重新开始';
    }
  }

  start() {
    // 清除现有的游戏循环
    this.stop();

    // 重置游戏状态
    this.snake = [{ x: 5, y: 5 }];
    this.direction = 'right';
    this.score = 0;
    this.gameOver = false;
    document.getElementById('scoreValue').textContent = this.score;
    this.food = this.generateFood();

    // 清除游戏结束的遮罩层和文本
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 隐藏开始按钮
    const startButton = document.getElementById('startButton');
    startButton.style.display = 'none';

    // 显示倒计时
    const countdown = document.querySelector('.countdown');
    countdown.textContent = '3';
    countdown.classList.add('show');

    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        countdown.textContent = count;
      } else if (count === 0) {
        countdown.textContent = 'GO!';
      } else {
        clearInterval(countdownInterval);
        countdown.classList.remove('show');
        // 开始游戏循环
        this.gameLoop = setInterval(() => {
          this.update();
          this.draw();
        }, this.speed);
      }
    }, 1000);
  }

  stop() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }
}
