# 用户故事1：小鸡角色实现

## 状态
- [x] 基础角色创建
- [x] 随机移动实现
- [x] 点击检测
- [x] 点击动画效果

## 完成情况
1. 基础实现：
   - 创建了100x100像素大小的小鸡角色
   - 使用外部图片资源作为小鸡贴图
   - 实现了图片加载检测机制

2. 移动系统：
   - 实现了随机移动逻辑
   - 移动速度为2像素/帧
   - 添加了画布边界检测，确保小鸡不会移出画面

3. 交互系统：
   - 实现了圆形碰撞检测，使点击更容易
   - 添加了点击反馈动画（放大效果）
   - 动画持续10帧，最大放大1.25倍

## 技术实现
```javascript
class Chicken {
    // 初始化小鸡属性
    constructor(canvas) {
        this.width = 100;  // 小鸡宽度
        this.height = 100; // 小鸡高度
        this.speed = 2;    // 移动速度
    }

    // 随机移动逻辑
    move() {
        this.x += Math.random() * this.speed * 2 - this.speed;
        this.y += Math.random() * this.speed * 2 - this.speed;
    }

    // 点击检测
    isPointInside(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        const radius = this.width / 2;
        return (dx * dx + dy * dy) <= (radius * radius);
    }
}
```

## 下一步计划
1. 添加小鸡动画效果（翅膀扇动）
2. 优化移动算法，使运动更自然
3. 添加音效反馈

## 验收标准
1. 小鸡外观可爱，符合2岁幼儿审美
2. 小鸡能在屏幕范围内随机移动
3. 小鸡移动时有简单的动画效果
4. 小鸡始终保持在屏幕可见范围内

## 技术实现

### 小鸡类设计
```javascript
class Chicken {
    constructor(canvas) {
        this.x = 0;          // 小鸡的X坐标
        this.y = 0;          // 小鸡的Y坐标
        this.speed = 2;      // 移动速度
        this.canvas = canvas;
    }

    // 随机移动
    move() {
        // 随机改变位置
        this.x += Math.random() * this.speed * 2 - this.speed;
        this.y += Math.random() * this.speed * 2 - this.speed;
        
        // 确保小鸡在画布范围内
        this.keepInBounds();
    }

    // 保持在画布范围内
    keepInBounds() {
        this.x = Math.max(0, Math.min(this.x, this.canvas.width));
        this.y = Math.max(0, Math.min(this.y, this.canvas.height));
    }
}
```

### 资源需求
1. 小鸡图片资源
   - 基础站立姿势
   - 移动动画帧

### 实现步骤
1. 创建小鸡图片资源
2. 实现小鸡类的基本功能
3. 实现随机移动逻辑
4. 添加简单动画效果

## 测试要点
1. 小鸡移动范围检查
2. 动画流畅性测试
3. 确保小鸡不会移出屏幕

## 变更日志

| 版本   | 变更               | 描述                   |
|-------|-------------------|------------------------|
| 1.0.0 | 初始版本          | 初始用户故事            |
| 1.1.0 | 简化版本          | 简化为基本实现需求      | 