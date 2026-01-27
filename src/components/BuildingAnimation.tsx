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

    // 绘制楼顶压力传感器
    const drawPressureSensor = (x: number, y: number, scale: number = 1) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      // 底座
      ctx.fillStyle = '#475569';
      ctx.fillRect(-15, 0, 30, 20);

      // 压力表外框
      ctx.beginPath();
      ctx.arc(0, -10, 25, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 刻度
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 0.75) + (i * Math.PI * 0.5 / 11);
        const innerRadius = 15;
        const outerRadius = i % 3 === 0 ? 10 : 12;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * innerRadius, -10 + Math.sin(angle) * innerRadius);
        ctx.lineTo(Math.cos(angle) * outerRadius, -10 + Math.sin(angle) * outerRadius);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 指针
      const time = Date.now() * 0.001;
      const needleAngle = (Math.PI * 0.75) + Math.sin(time * 2) * Math.PI * 0.4;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(Math.cos(needleAngle) * 18, -10 + Math.sin(needleAngle) * 18);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 中心点
      ctx.beginPath();
      ctx.arc(0, -10, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();

      // 标签
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('压力传感器', 0, -45);

      ctx.restore();
    };

    // 绘制云端
    const drawCloud = (x: number, y: number, isActive: boolean = false) => {
      ctx.save();
      ctx.translate(x, y);

      const time = Date.now() * 0.001;
      const floatY = isActive ? Math.sin(time * 3) * 3 : 0;
      ctx.translate(0, floatY);

      // 云朵形状
      ctx.beginPath();
      ctx.arc(-20, 0, 20, 0, Math.PI * 2);
      ctx.arc(0, -10, 25, 0, Math.PI * 2);
      ctx.arc(20, 0, 20, 0, Math.PI * 2);
      ctx.arc(-10, 10, 15, 0, Math.PI * 2);
      ctx.arc(10, 10, 15, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? '#60a5fa' : '#94a3b8';
      ctx.fill();

      // 云朵阴影（激活时闪烁）
      if (isActive) {
        const alpha = 0.3 + Math.sin(time * 5) * 0.2;
        ctx.beginPath();
        ctx.arc(-20, 0, 25, 0, Math.PI * 2);
        ctx.arc(0, -10, 30, 0, Math.PI * 2);
        ctx.arc(20, 0, 25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${alpha})`;
        ctx.fill();
      }

      // 标签
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('云端服务器', 0, 45);

      ctx.restore();
    };

    // 绘制4G信号传输
    const draw4GSignal = (x: number, y: number, direction: 'up' | 'down', time: number) => {
      const signalCount = 3;
      for (let i = 0; i < signalCount; i++) {
        const offset = (time * 2 + i * 0.5) % 1.5;
        const signalY = direction === 'up' ? y - offset * 60 : y + offset * 60;
        const alpha = 1 - offset / 1.5;

        ctx.save();
        ctx.translate(x, signalY);
        
        // 信号波纹
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        ctx.restore();
      }

      // 4G标签
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('4G传输', x, y + (direction === 'up' ? -70 : 70));
    };

    // 绘制泵房地下室
    const drawPumpRoom = (x: number, y: number, width: number, height: number) => {
      ctx.save();
      ctx.translate(x, y);

      // 地下室墙壁
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, width, height);

      // 地面线
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 标签
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('二次供水泵房', width / 2, -10);

      ctx.restore();
    };

    // 绘制机柜
    const drawCabinet = (x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);

      // 机柜框架
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, 40, 80);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 40, 80);

      // 机柜门（有透明效果）
      ctx.fillStyle = 'rgba(71, 85, 105, 0.3)';
      ctx.fillRect(2, 2, 36, 76);

      // 指示灯
      const time = Date.now() * 0.001;
      for (let i = 0; i < 4; i++) {
        const blink = Math.sin(time * 3 + i) > 0.3;
        ctx.beginPath();
        ctx.arc(20, 15 + i * 18, 4, 0, Math.PI * 2);
        ctx.fillStyle = blink ? '#22c55e' : '#1e293b';
        ctx.fill();
      }

      ctx.restore();
    };

    // 绘制边缘控制器（小盒子）
    const drawEdgeController = (x: number, y: number, isActive: boolean = false) => {
      ctx.save();
      ctx.translate(x, y);

      const time = Date.now() * 0.001;
      const pulse = isActive ? 1 + Math.sin(time * 4) * 0.05 : 1;
      ctx.scale(pulse, pulse);

      // 盒子主体
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(0, 0, 35, 30);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 35, 30);

      // 指示灯
      ctx.beginPath();
      ctx.arc(17.5, 15, 5, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? '#22c55e' : '#166534';
      ctx.fill();

      // 天线
      ctx.beginPath();
      ctx.moveTo(17.5, 0);
      ctx.lineTo(17.5, -15);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 信号（激活时）
      if (isActive) {
        for (let i = 0; i < 2; i++) {
          const signalRadius = 5 + Math.sin(time * 5 + i * Math.PI) * 3;
          ctx.beginPath();
          ctx.arc(17.5, -15, signalRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(14, 165, 233, ${1 - signalRadius / 8})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // 标签
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('边缘控制器', 17.5, 45);

      ctx.restore();
    };

    // 绘制水泵（POC）
    const drawPump = (x: number, y: number, isActive: boolean = false) => {
      ctx.save();
      ctx.translate(x, y);

      const time = Date.now() * 0.001;

      // 水泵主体
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 0, 50, 40);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 50, 40);

      // 进水口
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(-15, 10, 15, 20);

      // 出水口
      ctx.fillRect(50, 10, 15, 20);

      // 水流动画（激活时）
      if (isActive) {
        const flowOffset = (time * 2) % 30;
        for (let i = 0; i < 3; i++) {
          const waterX = -10 + ((flowOffset + i * 10) % 30);
          ctx.beginPath();
          ctx.arc(waterX, 20, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
        }
        for (let i = 0; i < 3; i++) {
          const waterX = 55 + ((flowOffset + i * 10) % 30);
          ctx.beginPath();
          ctx.arc(waterX, 20, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
        }
      }

      // 运转指示（激活时）
      if (isActive) {
        ctx.beginPath();
        ctx.arc(25, 20, 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        const rotation = time * 5;
        const lineX = 25 + Math.cos(rotation) * 8;
        const lineY = 20 + Math.sin(rotation) * 8;
        ctx.beginPath();
        ctx.moveTo(25, 20);
        ctx.lineTo(lineX, lineY);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 标签
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('主控泵', 25, 55);

      ctx.restore();
    };

    // 绘制建筑轮廓
    const drawBuilding = (x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);

      // 建筑主体
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-60, -200, 120, 200);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(-60, -200, 120, 200);

      // 楼层线
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(-60, -200 + i * 50);
        ctx.lineTo(60, -200 + i * 50);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 窗户
      for (let floor = 0; floor < 4; floor++) {
        for (let win = 0; win < 3; win++) {
          const wx = -40 + win * 40;
          const wy = -180 + floor * 50 + 10;
          ctx.fillStyle = window.Math.floor(Date.now() * 0.001 + floor + win) % 2 === 0 ? '#fef3c7' : '#1e293b';
          ctx.fillRect(wx, wy, 20, 25);
          ctx.strokeStyle = '#475569';
          ctx.strokeRect(wx, wy, 20, 25);
        }
      }

      ctx.restore();
    };

    // 绘制场景3工作流程
    const drawScene3 = (width: number, height: number, time: number) => {
      const centerX = width / 2;
      const centerY = height / 2;

      // 绘制背景
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // 绘制建筑
      drawBuilding(centerX - 100, centerY + 50);

      // 楼顶压力传感器
      const sensorX = centerX - 100;
      const sensorY = centerY - 160;
      drawPressureSensor(sensorX, sensorY);

      // 4G上传信号
      draw4GSignal(sensorX + 60, sensorY - 20, 'up', time);

      // 云端服务器
      const cloudX = centerX + 50;
      const cloudY = centerY - 100;
      drawCloud(cloudX, cloudY, true);

      // 云端下发信号
      draw4GSignal(centerX + 120, centerY, 'down', time);

      // 地下室泵房
      const pumpRoomX = centerX - 150;
      const pumpRoomY = centerY + 80;
      const pumpRoomWidth = 300;
      const pumpRoomHeight = 100;
      drawPumpRoom(pumpRoomX, pumpRoomY, pumpRoomWidth, pumpRoomHeight);

      // 机柜
      drawCabinet(pumpRoomX + 30, pumpRoomY + 10);

      // 边缘控制器
      const controllerX = pumpRoomX + 90;
      const controllerY = pumpRoomY + 30;
      drawEdgeController(controllerX, controllerY, true);

      // 水泵
      const pumpX = pumpRoomX + 180;
      const pumpY = pumpRoomY + 30;
      drawPump(pumpX, pumpY, true);

      // 绘制连接线
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(sensorX + 60, sensorY);
      ctx.lineTo(cloudX, cloudY);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cloudX, cloudY + 40);
      ctx.lineTo(controllerX + 17.5, controllerY - 30);
      ctx.stroke();

      ctx.setLineDash([]);

      // 工作流程说明
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('工作流程：楼顶压力 → 4G传输 → 云端 → 边缘控制器 → 控制水泵', centerX, height - 30);
    };

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

      ctx.clearRect(0, 0, width, height);

      // 根据场景绘制
      switch (scene) {
        case 3:
          drawScene3(width, height, time);
          break;
        default:
          // 其他场景的占位
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, width, height);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`场景 ${scene}`, width / 2, height / 2);
          ctx.font = '14px system-ui, sans-serif';
          ctx.fillText('动画开发中...', width / 2, height / 2 + 30);
      }

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
      <canvas
        ref={canvasRef}
        className="w-full h-full absolute inset-0"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
}
