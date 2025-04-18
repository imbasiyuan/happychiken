/**
 * 音效管理类
 * 负责加载和播放游戏中的所有音效和背景音乐
 * 
 * @class AudioManager
 * @version 1.1.2
 * @date 2024-03-17
 */
class AudioManager {
    /**
     * 创建音效管理器实例
     * @constructor
     */
    constructor() {
        // 初始化音效对象
        this.sounds = {};
        // 初始化背景音乐
        this.bgm = null;
        this.bgmVolume = 0.5; // 背景音乐默认音量
        this.bgmLoaded = false; // 背景音乐加载状态
        this.soundsLoaded = false; // 音效加载状态
        
        // 加载所有音效
        this.loadSounds();
        // 加载背景音乐
        this.loadBGM();
        
        console.log('音频管理器初始化完成');
    }

    /**
     * 加载所有音效文件
     * @private
     */
    loadSounds() {
        // 定义需要加载的音效
        const soundFiles = {
            chicken: 'audio/sfx/chicken.mp3',  // 小鸡叫声
            egg: 'audio/sfx/egg.mp3',         // 下蛋音效
            score: 'audio/sfx/score.mp3'       // 得分音效
        };

        let loadedCount = 0;
        const totalSounds = Object.keys(soundFiles).length;

        // 加载每个音效
        for (const [name, path] of Object.entries(soundFiles)) {
            this.sounds[name] = new Audio(path);
            // 设置音效音量为最大
            this.sounds[name].volume = 1.0;
            
            // 添加加载事件监听
            this.sounds[name].addEventListener('canplaythrough', () => {
                loadedCount++;
                if (loadedCount === totalSounds) {
                    this.soundsLoaded = true;
                    console.log('所有音效加载完成');
                }
            });
            
            // 添加错误处理
            this.sounds[name].addEventListener('error', (e) => {
                console.error(`音效加载失败: ${name}`, e);
            });
        }
    }

    /**
     * 加载背景音乐
     * @private
     */
    loadBGM() {
        this.bgm = new Audio('audio/bgm/theme.mp3');
        this.bgm.loop = true; // 设置循环播放
        this.bgm.volume = this.bgmVolume; // 设置音量
        
        // 添加加载事件监听
        this.bgm.addEventListener('canplaythrough', () => {
            this.bgmLoaded = true;
            console.log('背景音乐加载完成');
        });
        
        // 添加错误处理
        this.bgm.addEventListener('error', (e) => {
            console.error('背景音乐加载失败:', e);
        });
    }

    /**
     * 重置并播放背景音乐
     * 如果音乐正在播放，会从头开始播放
     * 如果音乐没有播放，会开始播放
     */
    resetAndPlayBGM() {
        if (!this.bgm || !this.bgmLoaded) {
            console.warn('背景音乐尚未加载完成');
            return;
        }

        try {
            // 将音乐重置到开始位置
            this.bgm.currentTime = 0;
            
            // 如果音乐没有在播放，开始播放
            if (this.bgm.paused) {
                this.bgm.play().catch(error => {
                    console.error('背景音乐播放失败:', error);
                });
            }
            
            console.log('背景音乐已重置并继续播放');
        } catch (error) {
            console.error('重置背景音乐失败:', error);
        }
    }

    /**
     * 暂停背景音乐
     */
    pauseBGM() {
        if (this.bgm) {
            this.bgm.pause();
            console.log('背景音乐已暂停');
        }
    }

    /**
     * 设置背景音乐音量
     * @param {number} volume - 音量值（0.0 到 1.0）
     */
    setBGMVolume(volume) {
        if (this.bgm) {
            this.bgmVolume = Math.max(0, Math.min(1, volume));
            this.bgm.volume = this.bgmVolume;
            console.log(`背景音乐音量已设置为: ${this.bgmVolume}`);
        }
    }

    /**
     * 播放指定音效
     * @param {string} soundName - 要播放的音效名称（'chicken'|'egg'|'score'）
     */
    async play(soundName) {
        const sound = this.sounds[soundName];
        if (!sound) {
            console.warn(`未找到音效: ${soundName}`);
            return;
        }

        try {
            // 如果音效正在播放，重置到开始位置
            sound.currentTime = 0;
            await sound.play();
        } catch (error) {
            console.error(`音效播放失败: ${soundName}`, error);
        }
    }
} 