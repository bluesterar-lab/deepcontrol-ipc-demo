'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import BuildingAnimation from '@/components/BuildingAnimation';

// 场景定义
type Scene = {
  id: number;
  title: string;
  duration: number; // 秒
  subtitle: string;
  description: string;
};

const SCENES: Scene[] = [
  {
    id: 1,
    title: '第一幕：传统方案的痛点',
    duration: 15,
    subtitle: '传统PID控制响应迟缓，压力阶跃响应出现振荡，导致高层水压不足，供水体验差。',
    description: '系统能效低下，水力失衡。低楼层抢占流量，高楼层水压不足。'
  },
  {
    id: 2,
    title: '第二幕：DeepControl 系统的介入',
    duration: 15,
    subtitle: '引入DeepControl AIPC新一代边缘智控，集成五层技术架构，全方位感知泵房运行状态。',
    description: '高精度传感器实时监测，毫秒级响应速度。'
  },
  {
    id: 3,
    title: '第三幕：全感知与实时需求检测',
    duration: 15,
    subtitle: '楼顶压力传感器实时监测水压，通过4G网络传输至云端，云端下发控制指令到泵房边缘控制器，实现按需供水。',
    description: '数据流：楼顶传感器 → 4G → 云端 → 泵房边缘控制器 → 水泵。压力控制从"泵房压力恒定"优化为"楼顶压力恒定"，能效提升45%。'
  },
  {
    id: 4,
    title: '第四幕：最终效果与价值',
    duration: 15,
    subtitle: '效率最大化，楼层用水均匀。能耗降低45%，保障供水连续可靠。',
    description: '7x24小时稳定运行，99.5%系统可用性。'
  },
  {
    id: 5,
    title: '第五幕：不同时段自动调节',
    duration: 15,
    subtitle: '系统自动识别不同时段的用水需求，动态调节水压设定值，实现精准供水和节能优化。',
    description: '早高峰（6-9时）、晚高峰（16-21时）提高压力，低谷期降低压力，全年综合节能23%。'
  },
  {
    id: 6,
    title: '第六幕：MPC 智能决策与精准把控',
    duration: 15,
    subtitle: '基于MPC模型预测控制，实现多变量协调，优于传统PID。实时优化水泵运行组合，精准把控流量。',
    description: '提前预判用水高峰，多变量协调控制。'
  }
];

export default function Home() {
  const [currentScene, setCurrentScene] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 自动播放逻辑
  useEffect(() => {
    if (isPlaying) {
      const interval = 100; // 100ms 更新一次
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          const nextProgress = prev + interval / 1000;
          const safeSceneIndex = Math.max(1, Math.min(currentScene, SCENES.length));
          const currentDuration = SCENES[safeSceneIndex - 1].duration;
          
          if (nextProgress >= currentDuration) {
            // 切换到下一个场景
            if (currentScene < SCENES.length) {
              setCurrentScene((prev) => prev + 1);
              return 0;
            } else {
              // 播放结束
              setIsPlaying(false);
              return currentDuration;
            }
          }
          return nextProgress;
        });
      }, interval);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, currentScene]);

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handlePrev = () => {
    if (currentScene > 1) {
      setCurrentScene((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentScene < SCENES.length) {
      setCurrentScene((prev) => prev + 1);
      setProgress(0);
    }
  };

  const handleSceneSelect = (sceneId: number) => {
    setCurrentScene(sceneId);
    setProgress(0);
  };

  const currentSceneData = SCENES[currentScene - 1];
  const totalDuration = SCENES.reduce((sum, s) => sum + s.duration, 0);
  const currentTime = SCENES.slice(0, Math.max(0, currentScene - 1)).reduce((sum, s) => sum + s.duration, 0) + progress;

  // 确保 currentScene 在有效范围内
  const safeCurrentScene = Math.max(1, Math.min(currentScene, SCENES.length));
  const safeCurrentSceneData = SCENES[safeCurrentScene - 1] || SCENES[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* 顶部标题栏 */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                DeepControl AIPC
              </h1>
              <p className="text-sm text-slate-400">智能二次供水优化演示</p>
            </div>
            <div className="text-sm text-slate-400">
              {currentTime.toFixed(1)}s / {totalDuration}s
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* 主内容区 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧场景列表 */}
          <div className="lg:col-span-1 space-y-2">
            {SCENES.map((scene) => (
              <button
                key={scene.id}
                onClick={() => handleSceneSelect(scene.id)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  currentScene === scene.id
                    ? 'bg-blue-600/20 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50'
                }`}
              >
                <div className="text-xs text-slate-400 mb-1">
                  {(scene.id - 1) * 15}s - {scene.id * 15}s
                </div>
                <div className={`font-semibold ${currentScene === scene.id ? 'text-blue-400' : 'text-slate-200'}`}>
                  {scene.title}
                </div>
              </button>
            ))}
          </div>

          {/* 中间动画区 */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
              {/* 动画容器 */}
              <div className="relative aspect-video bg-gradient-to-b from-slate-900 to-slate-800">
                <BuildingAnimation scene={currentScene} />
                
                {/* 场景标题浮层 */}
                <div className="absolute top-4 left-4 right-4">
                  <h2 className="text-lg font-semibold text-white/90 bg-slate-900/60 backdrop-blur-sm inline-block px-4 py-2 rounded-lg">
                    {safeCurrentSceneData.title}
                  </h2>
                </div>

                {/* 播放控制浮层 */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm rounded-full px-6 py-3 border border-slate-700/50">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handlePrev}
                    disabled={currentScene === 1}
                    className="h-9 w-9"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="default"
                    onClick={handlePlayPause}
                    className="h-10 w-10 rounded-full"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleNext}
                    disabled={currentScene === SCENES.length}
                    className="h-9 w-9"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* 进度条 */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-100"
                    style={{
                      width: `${(currentTime / totalDuration) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 字幕/旁白显示区 */}
            <div className="mt-4 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <p className="text-lg text-slate-100 leading-relaxed">
                    {safeCurrentSceneData.subtitle}
                  </p>
                  <p className="text-sm text-slate-400">
                    {safeCurrentSceneData.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 场景进度指示 */}
            <div className="mt-4 flex items-center gap-2">
              {SCENES.map((scene) => (
                <div
                  key={scene.id}
                  className={`flex-1 h-1 rounded-full transition-all ${
                    scene.id < currentScene
                      ? 'bg-blue-500'
                      : scene.id === currentScene
                      ? 'bg-blue-500/70'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
