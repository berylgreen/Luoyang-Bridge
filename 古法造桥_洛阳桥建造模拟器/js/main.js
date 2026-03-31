/* ============================================================
   古法造桥 — 主控制器
   Main: Game state machine, screen management, level flow
   ============================================================ */
class Game {
  constructor() {
    this.engine = new GameEngine('game-canvas');
    this.state = 'menu'; // menu, levelIntro, playing, dialog, complete
    this.currentLevel = 0;
    this.totalScore = 0;
    this.levelScores = [];
    this.timer = 0;
    this.levelObj = null;
    this.elements = {};
    this._cacheDOM();
    this._bindUI();
    this.showScreen('menu-screen');
  }

  _cacheDOM() {
    this.elements = {
      menuScreen: document.getElementById('menu-screen'),
      gameScreen: document.getElementById('game-screen'),
      levelIntro: document.getElementById('level-intro'),
      dialogOverlay: document.getElementById('dialog-overlay'),
      dialogIcon: document.getElementById('dialog-icon'),
      dialogTitle: document.getElementById('dialog-title'),
      dialogText: document.getElementById('dialog-text'),
      dialogActions: document.getElementById('dialog-actions'),
      hudLevelInfo: document.getElementById('hud-level-info'),
      hudLevelTitle: document.getElementById('hud-level-title'),
      hudScore: document.getElementById('hud-score'),
      hudTimer: document.getElementById('hud-timer'),
      progressFill: document.getElementById('progress-fill'),
      introNum: document.getElementById('intro-num'),
      introTitle: document.getElementById('intro-title'),
      introDesc: document.getElementById('intro-desc'),
      introTip: document.getElementById('intro-tip'),
      instructionBar: document.getElementById('instruction-bar'),
    };
  }

  _bindUI() {
    document.getElementById('start-btn').addEventListener('click', () => this.startGame());
    document.getElementById('intro-start-btn')?.addEventListener('click', () => this.startLevel());
    document.getElementById('pause-btn')?.addEventListener('click', () => this.pauseGame());
  }

  showScreen(id) {
    ['menu-screen', 'game-screen'].forEach(s => {
      document.getElementById(s)?.classList.toggle('screen--hidden', s !== id);
    });
  }

  // ===== GAME FLOW =====
  startGame() {
    this.currentLevel = 0;
    this.totalScore = 0;
    this.levelScores = [];
    this.showScreen('game-screen');
    this.showLevelIntro();
  }

  showLevelIntro() {
    const lv = GameData.levels[this.currentLevel];
    this.elements.introNum.textContent = `第 ${lv.id} 关 · 共 5 关`;
    this.elements.introTitle.textContent = `${lv.icon} ${lv.name}`;
    this.elements.introDesc.textContent = lv.description;
    this.elements.introTip.textContent = `💡 ${lv.tip}`;
    this.elements.levelIntro.classList.add('level-intro--visible');
    // Force re-animation
    this.elements.levelIntro.querySelectorAll('[class*="intro__"]').forEach(el => {
      el.style.animation = 'none';
      el.offsetHeight; // trigger reflow
      el.style.animation = '';
    });
    this.state = 'levelIntro';
  }

  startLevel() {
    this.elements.levelIntro.classList.remove('level-intro--visible');
    const lv = GameData.levels[this.currentLevel];
    this.elements.hudLevelInfo.textContent = `第 ${lv.id} 关`;
    this.elements.hudLevelTitle.textContent = lv.name;
    this.elements.hudScore.textContent = `⭐ ${this.totalScore}`;
    this.timer = lv.timerSec;
    this.elements.instructionBar.innerHTML = lv.tip.replace(/[【】]/g, '');

    // Initialize level
    const levelKey = `level${lv.id}`;
    this.levelObj = Levels[levelKey];
    this.levelObj.init(this.engine);
    this.state = 'playing';

    // Start the game loop
    this.engine.start(
      (dt) => this.update(dt),
      (ctx) => this.render(ctx)
    );
  }

  update(dt) {
    if (this.state !== 'playing') return;

    // Timer
    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = 0;
      this.levelComplete(this.levelObj.score || 0);
      return;
    }
    this.elements.hudTimer.textContent = `⏱ ${Math.ceil(this.timer)}s`;
    this.elements.hudScore.textContent = `⭐ ${this.totalScore + (this.levelObj.score || 0)}`;

    // Progress bar
    const lv = GameData.levels[this.currentLevel];
    const progress = ((lv.timerSec - this.timer) / lv.timerSec) * 100;
    this.elements.progressFill.style.width = `${progress}%`;

    // Level update
    this.levelObj.update(dt, this.engine, this);
  }

  render(ctx) {
    if (this.levelObj) {
      this.levelObj.render(ctx, this.engine);
    }
  }

  levelComplete(levelScore) {
    if (this.state === 'complete') return;
    this.state = 'complete';
    this.engine.stop();
    this.totalScore += levelScore;
    this.levelScores.push(levelScore);

    const lv = GameData.levels[this.currentLevel];
    const isLast = this.currentLevel >= GameData.levels.length - 1;

    if (isLast) {
      this.showDialog(
        '🎉',
        '洛阳桥建成！',
        `恭喜你！历时六年有余，中国第一座跨海大石桥——洛阳桥全线竣工！<br><br>` +
        `<strong>总得分：${this.totalScore} 分</strong><br><br>` +
        `蔡襄的筏型基础与种蛎固基两大创举，彪炳桥梁工程史册千年。`,
        [
          { text: '📖 查看知识回顾', action: () => this.showKnowledgeReview(), secondary: true },
          { text: '🔄 重新挑战', action: () => { this.hideDialog(); this.startGame(); } }
        ]
      );
    } else {
      this.showDialog(
        lv.icon,
        `${lv.name} · 完成！`,
        `本关得分：<strong>${levelScore} 分</strong><br><br>` +
        `<span style="color:#5ab5b0">📚 知识点：</span>${lv.knowledge}`,
        [
          { text: '进入下一关 →', action: () => { this.hideDialog(); this.currentLevel++; this.showLevelIntro(); } }
        ]
      );
    }
  }

  showKnowledgeReview() {
    let html = '<div style="text-align:left;max-height:300px;overflow-y:auto">';
    GameData.levels.forEach((lv, i) => {
      html += `<div style="margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid hsla(220,30%,35%,0.3)">
        <div style="color:#c9a84c;font-weight:700;margin-bottom:4px">${lv.icon} 第${lv.id}关：${lv.name} — ${this.levelScores[i] || 0}分</div>
        <div style="font-size:0.8rem;color:#9ca3af;line-height:1.6">${lv.knowledge}</div>
      </div>`;
    });
    html += '</div>';
    this.showDialog('📖', '知识回顾 — 洛阳桥五大工程奇迹', html,
      [{ text: '🔄 重新挑战', action: () => { this.hideDialog(); this.startGame(); } }]
    );
  }

  pauseGame() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.engine.stop();
      this.showDialog('⏸️', '游戏暂停', '你正在建造洛阳桥的征途中…',
        [
          { text: '继续', action: () => {
            this.hideDialog();
            this.state = 'playing';
            this.engine.start((dt) => this.update(dt), (ctx) => this.render(ctx));
          }},
          { text: '返回菜单', action: () => { this.hideDialog(); this.showScreen('menu-screen'); }, secondary: true }
        ]
      );
    }
  }

  // ===== DIALOG =====
  showDialog(icon, title, text, buttons) {
    this.elements.dialogIcon.textContent = icon;
    this.elements.dialogTitle.textContent = title;
    this.elements.dialogText.innerHTML = text;
    this.elements.dialogActions.innerHTML = '';
    buttons.forEach(btn => {
      const el = document.createElement('button');
      el.className = `dialog__btn${btn.secondary ? ' dialog__btn--secondary' : ''}`;
      el.textContent = btn.text;
      el.addEventListener('click', btn.action);
      this.elements.dialogActions.appendChild(el);
    });
    this.elements.dialogOverlay.classList.add('dialog-overlay--visible');
  }

  hideDialog() {
    this.elements.dialogOverlay.classList.remove('dialog-overlay--visible');
  }
}

// ===== BOOT =====
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
