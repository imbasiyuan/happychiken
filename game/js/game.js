// 计分系统类：负责管理游戏分数、显示和动画效果
// 修改历史：
// 2024-03-xx: 创建基础计分系统
// 2024-03-xx: 添加分数动画效果
class ScoreSystem {
    constructor() {
        // 基础属性
        this.score = 0;                // 当前分数
        this.scoreDisplay = document.querySelector('.score');  // 分数显示元素
        this.animating = false;        // 是否正在播放分数动画
        this.eggCount = 0;             // 产生的鸡蛋总数（仅用于调试）
        console.log('计分系统初始化完成');
    }

    // 增加分数并播放动画效果
    // points: 要增加的分数，默认为1
    addScore(points = 1) {
        this.score += points;
        this.eggCount++;
        this.updateDisplay();
        this.playScoreAnimation();
        console.log(`得分！当前分数：${this.score}，总共下了${this.eggCount}个蛋`);
    }

    // 更新分数显示
    updateDisplay() {
        this.scoreDisplay.textContent = `得分：${this.score}`;  // 只显示分数
    }

    // 播放分数增加时的动画效果
    playScoreAnimation() {
        if (this.animating) return;
        this.animating = true;
        
        // 放大效果
        this.scoreDisplay.style.transform = 'scale(1.2)';
        this.scoreDisplay.style.color = '#ff6b6b';
        
        // 200毫秒后恢复原状
        setTimeout(() => {
            this.scoreDisplay.style.transform = 'scale(1)';
            this.scoreDisplay.style.color = '#333';
            this.animating = false;
        }, 200);
    }
}

// 鸡蛋类：负责鸡蛋的显示、下落和计分触发
// 修改历史：
// 2024-03-xx: 创建基础鸡蛋系统
// 2024-03-xx: 修改为固定下落距离后停止
class Egg {
    constructor(x, y, canvas, onScore) {
        // 位置和大小属性
        this.x = x;                    // 鸡蛋X坐标
        this.y = y;                    // 鸡蛋Y坐标
        this.startY = y;               // 初始Y坐标，用于计算下落距离
        this.width = 30;               // 鸡蛋宽度，单位：像素
        this.height = 40;              // 鸡蛋高度，单位：像素
        
        // 渲染相关属性
        this.canvas = canvas;          // 画布对象
        this.ctx = canvas.getContext('2d');
        this.isVisible = true;         // 是否可见
        
        // 下落相关属性
        this.fallSpeed = 5;            // 下落速度，单位：像素/帧
        this.isStopped = false;        // 是否已停止下落
        this.hasScored = false;        // 是否已计分
        this.onScore = onScore;        // 计分回调函数
        
        console.log('新鸡蛋已创建');
    }

    // 更新鸡蛋位置和状态
    update() {
        if (this.isStopped) return;    // 如果已经停止，不再更新位置

        // 计算下落距离
        const fallDistance = this.y - this.startY;
        
        // 如果下落距离小于30像素且还没有停止
        if (fallDistance < 30) {
            this.y += this.fallSpeed;
        } else if (!this.hasScored) {
            // 到达指定高度，停止并计分
            this.isStopped = true;
            this.hasScored = true;
            if (this.onScore) {
                console.log('鸡蛋停止下落，计分！');
                this.onScore();
            }
        }
    }

    // 绘制鸡蛋
    draw() {
        if (!this.isVisible) return;

        this.ctx.save();
        
        // 绘制鸡蛋主体（白色填充 + 黑色轮廓）
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        
        // 绘制椭圆形鸡蛋
        this.ctx.beginPath();
        this.ctx.ellipse(
            this.x,
            this.y,
            this.width/2,
            this.height/2,
            0,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.stroke();
        
        // 添加高光效果（右上角小椭圆）
        this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
        this.ctx.beginPath();
        this.ctx.ellipse(
            this.x - this.width/6,
            this.y - this.height/6,
            this.width/6,
            this.height/6,
            0,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        this.ctx.restore();
    }

    // 检查鸡蛋是否已经停止
    hasLanded() {
        return this.isStopped;
    }
}

// 小鸡类：负责小鸡的显示、移动和交互
// 修改历史：
// 2024-03-xx: 创建基础小鸡系统
// 2024-03-xx: 添加弹跳动画
// 2024-03-xx: 添加方向翻转
class Chicken {
    constructor(canvas) {
        // 渲染相关属性
        this.canvas = canvas;          // 画布对象
        this.ctx = canvas.getContext('2d');
        this.sprite = new Image();     // 小鸡图片
        this.sprite.src = 'assets/images/chicken.png';
        this.isImageLoaded = false;    // 图片是否加载完成
        
        // 位置和大小属性
        this.x = canvas.width / 2;     // X坐标（画布中心）
        this.y = canvas.height / 2;    // Y坐标（画布中心）
        this.width = 120;              // 小鸡宽度，单位：像素
        this.height = 120;             // 小鸡高度，单位：像素
        
        // 移动相关属性
        this.speed = 2;                // 基础移动速度
        this.targetX = this.x;         // 目标X坐标
        this.targetY = this.y;         // 目标Y坐标
        this.moveTimer = 0;            // 移动计时器
        this.moveInterval = 60;        // 改变方向的间隔帧数
        this.easing = 0.05;            // 平滑移动系数（0-1）
        this.lastX = this.x;           // 上一帧X坐标
        this.lastY = this.y;           // 上一帧Y坐标
        
        // 动画相关属性
        this.isClicked = false;        // 是否被点击
        this.clickAnimationFrame = 0;  // 点击动画帧计数
        this.bounceHeight = 10;        // 弹跳高度，单位：像素
        this.bounceSpeed = 0.4;        // 弹跳速度，值越大动画越快
        this.bounceTime = 0;           // 弹跳计时器
        this.isMoving = false;         // 是否在移动

        // 图片加载完成回调
        this.sprite.onload = () => {
            this.isImageLoaded = true;
        };
    }

    // 处理小鸡的随机移动
    move() {
        this.moveTimer++;
        
        // 记录移动前的位置（用于判断移动方向）
        this.lastX = this.x;
        this.lastY = this.y;
        
        // 每隔一定时间更新目标位置
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            
            // 在当前位置的基础上，随机选择新的目标位置
            const range = 300;         // 移动范围，单位：像素
            this.targetX = this.x + (Math.random() - 0.5) * range;
            this.targetY = this.y + (Math.random() - 0.5) * range;
            
            // 确保目标位置在画布范围内
            this.targetX = Math.max(this.width/2, Math.min(this.targetX, this.canvas.width - this.width/2));
            this.targetY = Math.max(this.height/2, Math.min(this.targetY, this.canvas.height - this.height/2));
        }
        
        // 平滑移动到目标位置
        this.x += (this.targetX - this.x) * this.easing;
        this.y += (this.targetY - this.y) * this.easing;
        
        // 检查是否在移动（用于控制动画）
        const dx = this.x - this.lastX;
        const dy = this.y - this.lastY;
        this.isMoving = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1;

        // 更新弹跳动画
        if (this.isMoving) {
            this.bounceTime += this.bounceSpeed;
        }
        
        // 确保当前位置在画布范围内
        this.keepInBounds();
    }

    // 确保小鸡保持在画布范围内
    keepInBounds() {
        this.x = Math.max(this.width/2, Math.min(this.x, this.canvas.width - this.width/2));
        this.y = Math.max(this.height/2, Math.min(this.y, this.canvas.height - this.height/2));
    }

    // 检查点击是否命中小鸡（使用圆形碰撞检测）
    isPointInside(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        const radius = this.width / 2;
        return (dx * dx + dy * dy) <= (radius * radius);
    }

    // 处理点击事件，触发点击动画
    onClick() {
        this.isClicked = true;
        this.clickAnimationFrame = 10;  // 动画持续10帧
    }

    // 获取下蛋位置（在小鸡正下方）
    getEggPosition() {
        return {
            x: this.x,
            y: this.y + this.height/2
        };
    }

    // 绘制小鸡
    draw() {
        if (!this.isImageLoaded) return;

        this.ctx.save();
        
        // 计算弹跳偏移
        let bounceOffset = 0;
        if (this.isMoving) {
            bounceOffset = Math.sin(this.bounceTime) * this.bounceHeight;
        }

        // 应用弹跳效果和点击动画
        if (this.clickAnimationFrame > 0) {
            const scale = 1 + (this.clickAnimationFrame / 40);
            this.ctx.translate(this.x, this.y + bounceOffset);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-this.x, -(this.y + bounceOffset));
            this.clickAnimationFrame--;
        } else {
            // 只应用弹跳效果
            this.ctx.translate(0, bounceOffset);
        }

        // 根据移动方向翻转图片
        const dx = this.x - this.lastX;
        if (dx > 0.1) {  // 向右移动
            this.ctx.scale(-1, 1);  // 水平翻转
            this.ctx.drawImage(
                this.sprite,
                -this.x - this.width/2,  // 注意：翻转后需要调整x坐标
                this.y - this.height/2,
                this.width,
                this.height
            );
        } else {  // 向左移动或静止
            this.ctx.drawImage(
                this.sprite,
                this.x - this.width/2,
                this.y - this.height/2,
                this.width,
                this.height
            );
        }

        this.ctx.restore();
    }
}

// 游戏主类：负责游戏的初始化、更新和渲染循环
// 修改历史：
// 2024-03-xx: 创建基础游戏系统
// 2024-03-xx: 添加鸡蛋管理
// 2024-03-xx: 优化渲染顺序
class Game {
    constructor() {
        console.log('开始初始化游戏...');
        
        // 游戏基础属性
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 设置画布尺寸
        this.canvas.width = 1080;
        this.canvas.height = 720;
        
        this.isRunning = false;        // 游戏是否运行中
        this.audioManager = new AudioManager(); // 创建音频管理器（保持单个实例）
        
        // 初始化游戏对象
        try {
            console.log('初始化游戏组件...');
            this.initializeGame();
            
            // 绑定事件处理
            this.handleClick = this.handleClick.bind(this);
            this.gameLoop = this.gameLoop.bind(this);
            this.reset = this.reset.bind(this);
            this.handleKeyDown = this.handleKeyDown.bind(this);
            
            this.canvas.addEventListener('click', this.handleClick);
            
            // 绑定重置按钮事件
            const resetButton = document.querySelector('.reset-button');
            resetButton.addEventListener('click', this.reset);
            
            // 创建并绑定开始按钮事件
            this.createStartButton();
            
            // 立即绘制一次背景，确保画布不是黑的
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 添加键盘按下事件监听器
            document.addEventListener('keydown', this.handleKeyDown);
            
            console.log('游戏组件初始化完成');
        } catch (error) {
            console.error('游戏初始化失败:', error);
        }
    }

    // 初始化游戏组件
    initializeGame() {
        this.chicken = new Chicken(this.canvas);
        this.eggs = [];                // 鸡蛋数组
        this.scoreSystem = new ScoreSystem();
        this.clickCount = 0;           // 点击次数统计
    }

    // 重置游戏
    reset() {
        console.log('重置游戏...');
        
        // 停止当前游戏循环
        this.isRunning = false;
        
        // 等待一帧确保游戏循环完全停止
        requestAnimationFrame(() => {
            // 清空画布
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 重新初始化游戏组件（不包括音频管理器）
            this.initializeGame();
            
            // 绘制初始背景
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 重置并继续播放背景音乐
            this.audioManager.resetAndPlayBGM();
            
            // 重新开始游戏
            this.isRunning = true;
            this.gameLoop();
            
            console.log('游戏已重置');
        });
    }

    // 创建开始按钮
    createStartButton() {
        const startButton = document.createElement('button');
        startButton.textContent = '开始游戏';
        startButton.className = 'start-button';
        startButton.style.position = 'absolute';
        startButton.style.left = '50%';
        startButton.style.top = '50%';
        startButton.style.transform = 'translate(-50%, -50%)';
        startButton.style.padding = '15px 30px';
        startButton.style.fontSize = '24px';
        startButton.style.backgroundColor = '#4CAF50';
        startButton.style.color = 'white';
        startButton.style.border = 'none';
        startButton.style.borderRadius = '5px';
        startButton.style.cursor = 'pointer';
        startButton.style.zIndex = '1000';

        startButton.addEventListener('click', () => {
            // 播放背景音乐
            this.audioManager.resetAndPlayBGM();
            // 移除开始按钮
            startButton.remove();
            // 开始游戏
            this.isRunning = true;
            this.gameLoop();
        });

        document.body.appendChild(startButton);
    }

    // 处理画布点击事件
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (this.chicken.isPointInside(x, y)) {
            this.triggerChickenAction();
            this.clickCount++;
        } else {
            console.log(`点击未命中小鸡。点击位置：(${x.toFixed(0)}, ${y.toFixed(0)})`);
        }
    }

    // 处理键盘按下事件
    handleKeyDown(event) {
        // 检查是否按下了空格键 (keyCode 32) 或 (key ' ')
        if (event.key === ' ' || event.keyCode === 32) {
            // 阻止空格键的默认行为（例如滚动页面）
            event.preventDefault();
            // 触发与点击小鸡相同的动作
            this.triggerChickenAction();
        }
    }

    // 触发小鸡动作的通用函数
    triggerChickenAction() {
        if (!this.isRunning || !this.chicken) return; // 确保游戏正在运行且小鸡存在

        // 播放小鸡叫声
        this.audioManager.play('chicken');
        // 获取下蛋位置
        const { x, y } = this.chicken.getEggPosition();
        // 创建新鸡蛋
        const egg = this.createEgg(x, y);
        // 播放下蛋音效
        this.audioManager.play('egg');
        // 添加到鸡蛋列表
        this.eggs.push(egg);
        // 触发小鸡点击动画
        this.chicken.onClick();
    }

    // 游戏主循环
    gameLoop() {
        // 如果游戏未运行，立即返回
        if (!this.isRunning) {
            console.log('游戏循环停止');
            return;
        }

        try {
            // 1. 清空画布
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 2. 绘制背景
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // 3. 更新小鸡位置
            this.chicken.move();
            
            // 4. 更新和绘制所有鸡蛋
            let activeEggs = 0;
            this.eggs.forEach(egg => {
                if (!egg.hasScored) activeEggs++;
                egg.update();
                egg.draw();
            });

            // 5. 最后绘制小鸡（确保在最上层）
            this.chicken.draw();

            // 限制最大蛋数为500
            if (this.eggs.length > 500) {
                this.eggs = this.eggs.slice(-500);
            }
        } catch (error) {
            console.error('游戏循环出错:', error);
            this.isRunning = false;
            return;
        }

        // 只有在游戏仍在运行时才继续循环
        if (this.isRunning) {
            requestAnimationFrame(this.gameLoop);
        }
    }

    // 初始化并启动游戏
    init() {
        console.log('启动游戏...');
        // 不再自动开始游戏循环，等待用户点击开始按钮
    }

    createEgg(x, y) {
        const egg = new Egg(x, y, this.canvas, () => {
            this.scoreSystem.addScore();
            // 播放得分音效
            this.audioManager.play('score');
        });
        egg.onLand = () => {
            if (!egg.hasScored) {
                this.scoreSystem.addScore();
                // 播放得分音效
                this.audioManager.play('score');
                egg.hasScored = true;
            }
        };
        return egg;
    }
}

// 当页面加载完成时启动游戏
window.addEventListener('load', () => {
    console.log('页面加载完成，创建游戏实例...');
    const game = new Game();
    game.init();
}); 