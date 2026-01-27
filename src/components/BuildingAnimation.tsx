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

    // 场景1：传统方案痛点
    const drawScene1 = (width: number, height: number, time: number) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 标题
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('传统PID控制的问题', centerX, 50);

      // 绘制建筑轮廓（简化版）
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 100, centerY - 150, 200, 200);

      // 楼层线
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX - 100, centerY - 150 + i * 50);
        ctx.lineTo(centerX + 100, centerY - 150 + i * 50);
        ctx.stroke();
      }

      // 压力曲线（振荡）
      ctx.beginPath();
      ctx.moveTo(centerX - 80, centerY + 80);
      for (let x = 0; x < 160; x += 5) {
        const oscillation = Math.sin(time * 3 + x * 0.1) * 20;
        const decay = Math.exp(-x * 0.01);
        ctx.lineTo(centerX - 80 + x, centerY + 80 - oscillation * decay);
      }
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText('压力振荡', centerX, centerY + 110);

      // 水压分布（低楼层高，高楼层低）
      for (let i = 0; i < 4; i++) {
        const barHeight = i === 0 ? 60 : i === 1 ? 50 : i === 2 ? 30 : 15;
        const y = centerY - 130 + i * 50;
        
        ctx.fillStyle = i <= 1 ? '#ef4444' : '#f97316';
        ctx.fillRect(centerX + 120, y, barHeight, 30);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${i + 1}楼`, centerX + 120 + barHeight + 5, y + 20);
        ctx.fillText(`${i <= 1 ? '水压过高' : i === 2 ? '水压不足' : '严重不足'}`, centerX + 190, y + 20);
      }

      // 问题标注
      ctx.fillStyle = '#fbbf24';
      ctx.font = '14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('低楼层水压过高，高楼层水压不足', centerX, centerY + 140);
    };

    // 场景2：DeepControl系统介入
    const drawScene2 = (width: number, height: number, time: number) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 标题
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DeepControl AIPC 系统架构', centerX, 50);

      // 五层架构
      const layers = [
        { name: '应用层', color: '#3b82f6', y: centerY - 120 },
        { name: '算法层', color: '#0ea5e9', y: centerY - 60 },
        { name: '数据层', color: '#06b6d4', y: centerY },
        { name: '通信层', color: '#10b981', y: centerY + 60 },
        { name: '感知层', color: '#22c55e', y: centerY + 120 }
      ];

      layers.forEach((layer, index) => {
        const pulse = 1 + Math.sin(time * 2 + index * 0.5) * 0.05;
        
        ctx.save();
        ctx.translate(centerX, layer.y);
        ctx.scale(pulse, pulse);

        // 框
        ctx.fillStyle = layer.color;
        ctx.fillRect(-100, -25, 200, 50);
        
        // 边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-100, -25, 200, 50);

        // 文字
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(layer.name, 0, 8);

        ctx.restore();

        // 连接线
        if (index < layers.length - 1) {
          ctx.beginPath();
          ctx.moveTo(centerX, layer.y + 25);
          ctx.lineTo(centerX, layers[index + 1].y - 25);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.stroke();

          // 箭头
          ctx.beginPath();
          ctx.moveTo(centerX - 8, layers[index + 1].y - 30);
          ctx.lineTo(centerX, layers[index + 1].y - 22);
          ctx.lineTo(centerX + 8, layers[index + 1].y - 30);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // 侧面标注
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('全方位感知', centerX + 130, centerY);
      ctx.fillText('实时监测', centerX + 130, centerY + 20);
    };

    // 场景3：全感知与实时需求检测（已实现）
    const drawPressureSensor = (x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);

      const t = Date.now() * 0.001;

      // 底座
      ctx.fillStyle = '#475569';
      ctx.fillRect(-15, 0, 30, 20);

      // 压力表
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
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 15, -10 + Math.sin(angle) * 15);
        ctx.lineTo(Math.cos(angle) * (i % 3 === 0 ? 10 : 12), -10 + Math.sin(angle) * (i % 3 === 0 ? 10 : 12));
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 指针
      const needleAngle = (Math.PI * 0.75) + Math.sin(t * 2) * Math.PI * 0.4;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(Math.cos(needleAngle) * 18, -10 + Math.sin(needleAngle) * 18);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, -10, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('压力传感器', 0, -45);

      ctx.restore();
    };

    const drawCloud = (x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);

      const t = Date.now() * 0.001;
      ctx.translate(0, Math.sin(t * 3) * 3);

      ctx.beginPath();
      ctx.arc(-20, 0, 20, 0, Math.PI * 2);
      ctx.arc(0, -10, 25, 0, Math.PI * 2);
      ctx.arc(20, 0, 20, 0, Math.PI * 2);
      ctx.arc(-10, 10, 15, 0, Math.PI * 2);
      ctx.arc(10, 10, 15, 0, Math.PI * 2);
      ctx.fillStyle = '#60a5fa';
      ctx.fill();

      const alpha = 0.3 + Math.sin(t * 5) * 0.2;
      ctx.beginPath();
      ctx.arc(-20, 0, 25, 0, Math.PI * 2);
      ctx.arc(0, -10, 30, 0, Math.PI * 2);
      ctx.arc(20, 0, 25, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96, 165, 250, ${alpha})`;
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('云端服务器', 0, 45);

      ctx.restore();
    };

    const draw4GSignal = (x: number, y: number, direction: 'up' | 'down', t: number) => {
      for (let i = 0; i < 3; i++) {
        const offset = (t * 2 + i * 0.5) % 1.5;
        const signalY = direction === 'up' ? y - offset * 60 : y + offset * 60;
        const alpha = 1 - offset / 1.5;

        ctx.beginPath();
        ctx.arc(x, signalY, 8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, signalY, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }

      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('4G', x, y + (direction === 'up' ? -70 : 70));
    };

    const drawPumpRoom = (x: number, y: number, w: number, h: number) => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('二次供水泵房', x + w / 2, y - 10);
    };

    const drawCabinet = (x: number, y: number) => {
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y, 40, 80);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 40, 80);

      ctx.fillStyle = 'rgba(71, 85, 105, 0.3)';
      ctx.fillRect(x + 2, y + 2, 36, 76);

      const t = Date.now() * 0.001;
      for (let i = 0; i < 4; i++) {
        const blink = Math.sin(t * 3 + i) > 0.3;
        ctx.beginPath();
        ctx.arc(x + 20, y + 15 + i * 18, 4, 0, Math.PI * 2);
        ctx.fillStyle = blink ? '#22c55e' : '#1e293b';
        ctx.fill();
      }
    };

    const drawEdgeController = (x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);

      const t = Date.now() * 0.001;
      const pulse = 1 + Math.sin(t * 4) * 0.05;
      ctx.scale(pulse, pulse);

      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(0, 0, 35, 30);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 35, 30);

      ctx.beginPath();
      ctx.arc(17.5, 15, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(17.5, 0);
      ctx.lineTo(17.5, -15);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.stroke();

      for (let i = 0; i < 2; i++) {
        const r = 5 + Math.sin(t * 5 + i * Math.PI) * 3;
        ctx.beginPath();
        ctx.arc(17.5, -15, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(14, 165, 233, ${1 - r / 8})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('边缘控制器', 17.5, 45);

      ctx.restore();
    };

    const drawPump = (x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);

      const t = Date.now() * 0.001;

      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 0, 50, 40);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 50, 40);

      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(-15, 10, 15, 20);
      ctx.fillRect(50, 10, 15, 20);

      const flowOffset = (t * 2) % 30;
      for (let i = 0; i < 3; i++) {
        const wx = -10 + ((flowOffset + i * 10) % 30);
        ctx.beginPath();
        ctx.arc(wx, 20, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
      }
      for (let i = 0; i < 3; i++) {
        const wx = 55 + ((flowOffset + i * 10) % 30);
        ctx.beginPath();
        ctx.arc(wx, 20, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(25, 20, 8, 0, Math.PI * 2);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.stroke();

      const rot = t * 5;
      ctx.beginPath();
      ctx.moveTo(25, 20);
      ctx.lineTo(25 + Math.cos(rot) * 8, 20 + Math.sin(rot) * 8);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('主控泵', 25, 55);

      ctx.restore();
    };

    const drawBuilding = (x: number, y: number) => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x - 60, y - 200, 120, 200);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 60, y - 200, 120, 200);

      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x - 60, y - 200 + i * 50);
        ctx.lineTo(x + 60, y - 200 + i * 50);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (let f = 0; f < 4; f++) {
        for (let w = 0; w < 3; w++) {
          const wx = x - 40 + w * 40;
          const wy = y - 180 + f * 50 + 10;
          ctx.fillStyle = Math.floor(Date.now() * 0.001 + f + w) % 2 === 0 ? '#fef3c7' : '#1e293b';
          ctx.fillRect(wx, wy, 20, 25);
          ctx.strokeStyle = '#475569';
          ctx.strokeRect(wx, wy, 20, 25);
        }
      }
    };

    const drawScene3 = (width: number, height: number) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      drawBuilding(cx - 100, cy + 50);
      drawPressureSensor(cx - 100, cy - 160);
      draw4GSignal(cx - 40, cy - 180, 'up', time);
      drawCloud(cx + 50, cy - 100);
      draw4GSignal(cx + 120, cy, 'down', time);

      drawPumpRoom(cx - 150, cy + 80, 300, 100);
      drawCabinet(cx - 120, cy + 90);
      drawEdgeController(cx - 60, cy + 110);
      drawPump(cx, cy + 110);

      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy - 160);
      ctx.lineTo(cx + 50, cy - 100);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 50, cy - 60);
      ctx.lineTo(cx - 42.5, cy + 80);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('工作流程：楼顶压力 → 4G → 云端 → 边缘控制器 → 水泵', cx, height - 30);
    };

    // 场景4：MPC智能决策
    const drawScene4 = (width: number, height: number, time: number) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 标题
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MPC 模型预测控制', centerX, 50);

      // 预测窗口
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 150, centerY - 100, 300, 120);

      ctx.fillStyle = '#64748b';
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText('预测窗口 (未来N步)', centerX, centerY - 110);

      // 当前时间线
      ctx.beginPath();
      ctx.moveTo(centerX - 50, centerY - 100);
      ctx.lineTo(centerX - 50, centerY + 20);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.fillText('当前', centerX - 50, centerY + 35);

      // 预测曲线
      ctx.beginPath();
      ctx.moveTo(centerX - 50, centerY);
      for (let i = 0; i < 200; i++) {
        const x = centerX - 50 + i;
        const y = centerY + Math.sin(time * 2 + i * 0.05) * 30 + Math.cos(time + i * 0.03) * 20;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 控制变量
      const controlVars = ['压力', '流量', '能耗', '水位'];
      controlVars.forEach((v, i) => {
        const vx = centerX - 200 + i * 100;
        const vy = centerY + 80;

        ctx.beginPath();
        ctx.arc(vx, vy, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(v, vx, vy + 5);

        // 优化指示
        const opt = Math.sin(time * 3 + i) * 10;
        ctx.beginPath();
        ctx.arc(vx, vy, 35 + opt, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(16, 185, 129, ${1 - opt / 10})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // 标注
      ctx.fillStyle = '#10b981';
      ctx.font = '16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('多变量协调优化', centerX, centerY + 150);
    };

    // 场景5：最终效果
    const drawScene5 = (width: number, height: number, time: number) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 标题
      ctx.fillStyle = '#8b5cf6';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('最终效果与价值', centerX, 50);

      // 建筑
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 80, centerY - 120, 160, 180);

      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX - 80, centerY - 120 + i * 45);
        ctx.lineTo(centerX + 80, centerY - 120 + i * 45);
        ctx.stroke();
      }

      // 均匀水压（绿色）
      for (let i = 0; i < 4; i++) {
        const barHeight = 50;
        const y = centerY - 100 + i * 45;
        
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(centerX + 100, y, barHeight, 30);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${i + 1}楼`, centerX + 100 + barHeight + 5, y + 20);
        ctx.fillText('水压正常', centerX + 170, y + 20);
      }

      // 效果数据
      const metrics = [
        { label: '能耗降低', value: '45%', color: '#22c55e' },
        { label: '效率提升', value: '60%', color: '#3b82f6' },
        { label: '系统可用性', value: '99.5%', color: '#8b5cf6' }
      ];

      metrics.forEach((m, i) => {
        const mx = centerX - 150 + i * 120;
        const my = centerY + 100;

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(mx - 50, my - 30, 100, 60);
        ctx.strokeStyle = m.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(mx - 50, my - 30, 100, 60);

        ctx.fillStyle = m.color;
        ctx.font = 'bold 24px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(m.value, mx, my + 5);

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText(m.label, mx, my + 20);
      });

      // 胜利标识
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillText('✓ 目标达成', centerX, height - 50);
    };

    const animate = (timestamp: number) => {
      if (!timeRef.current) {
        timeRef.current = timestamp;
      }

      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const time = (timestamp - timeRef.current) * 0.001;

      ctx.clearRect(0, 0, rect.width, rect.height);

      switch (scene) {
        case 1:
          drawScene1(rect.width, rect.height, time);
          break;
        case 2:
          drawScene2(rect.width, rect.height, time);
          break;
        case 3:
          drawScene3(rect.width, rect.height);
          break;
        case 4:
          drawScene4(rect.width, rect.height, time);
          break;
        case 5:
          drawScene5(rect.width, rect.height, time);
          break;
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
