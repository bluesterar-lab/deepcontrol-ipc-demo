'use client';

import { useRef, useEffect } from 'react';

interface BuildingAnimationProps {
  scene: number;
}

export default function BuildingAnimation({ scene }: BuildingAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置Canvas尺寸
    const setCanvasSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(dpr, dpr);
      }
    };

    setCanvasSize();
    const resizeHandler = () => setCanvasSize();
    window.addEventListener('resize', resizeHandler);

    // 动画循环
    const animate = (timestamp: number) => {
      if (!timeRef.current) {
        timeRef.current = timestamp;
      }

      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const time = (timestamp - timeRef.current) * 0.001;

      // 清空画布
      ctx.clearRect(0, 0, width, height);
      
      // 绘制背景
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 绘制旋转的圆圈1
      const radius1 = 60 + Math.sin(time * 2) * 15;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius1, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();

      // 绘制旋转的圆圈2
      const radius2 = 40 + Math.cos(time * 3) * 10;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius2, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.fill();

      // 绘制旋转的粒子
      for (let i = 0; i < 6; i++) {
        const angle = time * 1.5 + (i * Math.PI / 3);
        const distance = 120 + Math.sin(time * 2 + i) * 20;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? '#10b981' : '#f59e0b';
        ctx.fill();
      }

      // 绘制场景文本
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`场景 ${scene}`, centerX, centerY - 100);

      // 绘制时间文本
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`动画时间: ${time.toFixed(1)}s`, centerX, centerY + 100);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [scene]);

  return (
    <div className="w-full h-full relative bg-slate-900">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full absolute inset-0"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* 后备显示 - 如果Canvas不工作 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-500 mb-2">场景 {scene}</div>
          <div className="text-slate-400">动画正在加载...</div>
        </div>
      </div>
    </div>
  );
}
