import './style.css';
import { Snake } from './counter.js';
import { Auth } from './auth.js';

const auth = new Auth();
const canvas = document.getElementById('gameCanvas');
const startButton = document.getElementById('startButton');
const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');
const game = new Snake(canvas, auth);

// 认证状态UI元素
const authStatus = document.getElementById('authStatus');
const usernameInput = document.createElement('input');
usernameInput.type = 'text';
usernameInput.placeholder = '请输入用户名';
usernameInput.className = 'username-input';
const enterButton = document.createElement('button');
enterButton.textContent = '进入游戏';
enterButton.className = 'enter-button';
const authError = document.createElement('div');
authError.className = 'auth-error';

// 添加认证元素到页面
authStatus.innerHTML = '';
authStatus.appendChild(usernameInput);
authStatus.appendChild(enterButton);
authStatus.appendChild(authError);

// 处理进入游戏
enterButton.addEventListener('click', () => {
  const username = usernameInput.value;
  try {
    enterButton.disabled = true;
    enterButton.textContent = '进入中...';
    authError.textContent = '';

    auth.enterGame(username);
    updateAuthStatus();
  } catch (error) {
    authError.textContent = error.message;
  } finally {
    enterButton.disabled = false;
    enterButton.textContent = '进入游戏';
  }
});

// 更新认证状态显示
function updateAuthStatus() {
  const user = auth.getCurrentUser();
  const gameContainer = document.querySelector('.game-container');
  const leaderboard = document.querySelector('.leaderboard');

  if (user) {
    authStatus.innerHTML = `欢迎, ${user.username}! <button class="logout-button" onclick="handleLogout()">退出</button>`;
    gameContainer.classList.add('logged-in');
    leaderboard.style.display = 'block';
    startButton.style.display = 'block';
  } else {
    authStatus.innerHTML = '';
    authStatus.appendChild(usernameInput);
    authStatus.appendChild(enterButton);
    authStatus.appendChild(authError);
    gameContainer.classList.remove('logged-in');
    leaderboard.style.display = 'none';
    game.stop();
  }
}

// 处理退出
window.handleLogout = () => {
  auth.logout();
  updateAuthStatus();
  usernameInput.value = '';
};

// 初始化认证状态
updateAuthStatus();

startButton.addEventListener('click', () => {
  if (!game.gameLoop) {
    game.start();
  } else {
    game.stop();
    game.start();
  }
});

speedRange.addEventListener('input', (e) => {
  const newSpeed = parseInt(e.target.value);
  speedValue.textContent = newSpeed;
  game.speed = newSpeed;
  if (game.gameLoop) {
    game.stop();
    game.start();
  }
});
