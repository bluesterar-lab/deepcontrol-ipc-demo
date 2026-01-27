'use client';

import { useRef, useEffect } from 'react';

interface BuildingAnimationProps {
  scene: number;
}

export default function BuildingAnimation({ scene }: BuildingAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const animationTimeRef = useRef<number>(0);
  const sceneRef = useRef<number>(scene);
  const isMountedRef = useRef<boolean>(false);
  
  const scale = 1.0;
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  useEffect(() => {
    if (sceneRef.current !== scene) {
      sceneRef.current = scene;
      animationTimeRef.current = 0;
      timeRef.current = 0;
    }
  }, [scene]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let canvasWidth = 0;
    let canvasHeight = 0;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvasWidth = rect.width * 2;
        canvasHeight = rect.height * 2;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = (timestamp: number) => {
      if (!timeRef.current) {
        timeRef.current = timestamp;
      }
      
      const deltaTime = timestamp - timeRef.current;
      timeRef.current = timestamp;
      
      animationTimeRef.current += deltaTime * 0.002;
      
      // 简单绘制测试
      ctx.fillStyle = '#0a1628';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // 绘制旋转圆圈
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const radius = 100 + Math.sin(animationTimeRef.current * 3) * 20;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.fill();
      
      // 绘制旋转的粒子
      for (let i = 0; i < 8; i++) {
        const angle = animationTimeRef.current * 2 + (i * Math.PI / 4);
        const x = centerX + Math.cos(angle) * (radius + 40);
        const y = centerY + Math.sin(angle) * (radius + 40);
        
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff88';
        ctx.fill();
      }
      
      // 显示场景和时间
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`场景 ${scene}`, centerX, centerY - 50);
      ctx.font = '24px system-ui';
      ctx.fillText(`时间: ${animationTimeRef.current.toFixed(2)}s`, centerX, centerY + 50);
      
      // 在左下角显示调试信息
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`动画运行中: ${animationTimeRef.current.toFixed(1)}s`, 20, canvasHeight - 20);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [scene]);
  
  return (
    <div className="w-full h-full absolute inset-0 relative bg-slate-900">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
}
