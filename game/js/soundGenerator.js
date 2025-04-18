/**
 * 音效生成器
 * 用于生成游戏所需的基础音效
 */
class SoundGenerator {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    /**
     * 生成小鸡叫声
     * 使用振荡器生成"咯咯"声
     */
    generateChickenSound() {
        const duration = 0.6;  // 音效持续时间延长到0.6秒
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // 设置更丰富的频率变化，模拟"咯咯"声
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.15);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.3);
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.45);

        // 设置音量变化，最大音量调整到50.0
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(50.0, audioContext.currentTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);

        return this.exportAudio(audioContext, duration);
    }

    /**
     * 生成下蛋音效
     * 使用白噪声生成"啵"声
     */
    generateEggSound() {
        const duration = 0.4;  // 音效持续时间延长到0.4秒
        const audioContext = new AudioContext();
        const bufferSize = audioContext.sampleRate * duration;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // 生成白噪声
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        source.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.value = 600;  // 提高滤波器频率，使声音更清晰

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // 设置音量包络，最大音量调整到50.0
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(50.0, audioContext.currentTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);

        source.start();

        return this.exportAudio(audioContext, duration);
    }

    /**
     * 生成得分音效
     * 使用振荡器生成"叮"声
     */
    generateScoreSound() {
        const duration = 0.4;  // 音效持续时间延长到0.4秒
        const audioContext = new AudioContext();
        
        // 创建主音色振荡器
        const oscillator1 = audioContext.createOscillator();
        const gainNode1 = audioContext.createGain();
        
        // 创建和声振荡器
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();

        // 连接音频节点
        oscillator1.connect(gainNode1);
        oscillator2.connect(gainNode2);
        gainNode1.connect(audioContext.destination);
        gainNode2.connect(audioContext.destination);

        // 设置主音色频率
        oscillator1.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator1.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + duration);

        // 设置和声频率（高八度）
        oscillator2.frequency.setValueAtTime(1760, audioContext.currentTime);
        oscillator2.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + duration);

        // 设置音量包络，主音色音量调整到35.0
        gainNode1.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode1.gain.linearRampToValueAtTime(35.0, audioContext.currentTime + 0.02);
        gainNode1.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);

        // 设置和声音量（调整到15.0）
        gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode2.gain.linearRampToValueAtTime(15.0, audioContext.currentTime + 0.02);
        gainNode2.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);

        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + duration);
        oscillator2.stop(audioContext.currentTime + duration);

        return this.exportAudio(audioContext, duration);
    }

    /**
     * 导出音频为MP3文件
     */
    async exportAudio(audioContext, duration) {
        // 创建离线音频上下文
        const offlineContext = new OfflineAudioContext(1, audioContext.sampleRate * duration, audioContext.sampleRate);
        
        // 等待音频处理完成
        const audioBuffer = await offlineContext.startRendering();
        
        // 将AudioBuffer转换为WAV格式
        const wavBlob = this.audioBufferToWav(audioBuffer);
        return wavBlob;
    }

    /**
     * 将AudioBuffer转换为WAV格式
     */
    audioBufferToWav(buffer) {
        const numOfChan = buffer.numberOfChannels;
        const length = buffer.length * numOfChan * 2;
        const buffer32 = new Float32Array(buffer.length);
        const view = new DataView(new ArrayBuffer(44 + length));
        const data = buffer.getChannelData(0);

        // WAV文件头
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + length, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numOfChan, true);
        view.setUint32(24, buffer.sampleRate, true);
        view.setUint32(28, buffer.sampleRate * 2, true);
        view.setUint16(32, numOfChan * 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, length, true);

        // 写入音频数据
        const volume = 1;
        let index = 44;
        for (let i = 0; i < buffer.length; i++) {
            view.setInt16(index, data[i] * (0x7FFF * volume), true);
            index += 2;
        }

        return new Blob([view], { type: 'audio/wav' });
    }
}

// 辅助函数：写入字符串到DataView
function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// 创建下载链接
function createDownloadLink(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

// 生成并下载所有音效
async function generateAllSounds() {
    const generator = new SoundGenerator();
    
    // 生成并下载小鸡叫声
    const chickenSound = await generator.generateChickenSound();
    createDownloadLink(chickenSound, 'chicken.mp3');
    
    // 生成并下载下蛋音效
    const eggSound = await generator.generateEggSound();
    createDownloadLink(eggSound, 'egg.mp3');
    
    // 生成并下载得分音效
    const scoreSound = await generator.generateScoreSound();
    createDownloadLink(scoreSound, 'score.mp3');
}

// 当页面加载完成时生成音效
window.addEventListener('load', generateAllSounds); 