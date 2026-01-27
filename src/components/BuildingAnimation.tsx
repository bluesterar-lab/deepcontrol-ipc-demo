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

    // 场景1：传统方案痛点（深化版）
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

      // 绘制建筑
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 120, centerY - 180, 240, 280);

      // 楼层
      for (let i = 1; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX - 120, centerY - 180 + i * 55);
        ctx.lineTo(centerX + 120, centerY - 180 + i * 55);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 管道系统
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX + 120, centerY + 100);
      ctx.lineTo(centerX + 180, centerY + 100);
      ctx.lineTo(centerX + 180, centerY - 150);
      ctx.lineTo(centerX, centerY - 150);
      ctx.lineTo(centerX, centerY + 100);
      ctx.stroke();

      // 压力振荡动画
      ctx.beginPath();
      ctx.moveTo(centerX - 80, centerY + 120);
      for (let x = 0; x < 160; x += 3) {
        const oscillation = Math.sin(time * 4 + x * 0.08) * 25 * Math.exp(-x * 0.008);
        ctx.lineTo(centerX - 80 + x, centerY + 120 + oscillation);
      }
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('压力阶跃响应振荡', centerX, centerY + 145);

      // 水压分布（动态）
      for (let i = 0; i < 5; i++) {
        const y = centerY - 155 + i * 55;
        const basePressure = i === 0 ? 80 : i === 1 ? 70 : i === 2 ? 40 : i === 3 ? 20 : 10;
        const fluctuation = Math.sin(time * 5 + i) * 15;
        const barWidth = Math.max(10, basePressure + fluctuation);
        
        ctx.fillStyle = i <= 1 ? '#ef4444' : i === 2 ? '#f97316' : '#eab308';
        ctx.fillRect(centerX + 180, y + 10, barWidth, 35);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${i + 1}楼`, centerX + 180 + barWidth + 8, y + 32);
        
        ctx.font = '11px system-ui, sans-serif';
        const status = i <= 1 ? '超压' : i === 2 ? '不足' : '严重不足';
        ctx.fillStyle = i <= 1 ? '#ef4444' : i === 2 ? '#f97316' : '#eab308';
        ctx.fillText(status, centerX + 180 + barWidth + 45, y + 32);
      }

      // 水流方向箭头（动态）
      const flowOffset = (time * 2) % 60;
      for (let i = 0; i < 3; i++) {
        const fy = centerY + 70 + (flowOffset + i * 20) % 60 - 30;
        ctx.beginPath();
        ctx.moveTo(centerX + 140, fy);
        ctx.lineTo(centerX + 150, fy - 5);
        ctx.lineTo(centerX + 150, fy + 5);
        ctx.closePath();
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
      }

      // 问题标注框
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 80, centerY - 200, 160, 40);
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('水力失衡', centerX, centerY - 175);

      // 效率数据
      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText(`能效: ${(65 + Math.sin(time) * 5).toFixed(1)}%`, centerX - 100, centerY + 180);
      ctx.fillText(`响应延迟: ${(1.5 + Math.sin(time * 2) * 0.3).toFixed(1)}s`, centerX + 100, centerY + 180);
    };

    // 场景2：DeepControl系统介入（深化版）
    const drawScene2 = (width: number, height: number, time: number) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DeepControl AIPC 系统架构', centerX, 50);

      const layers = [
        { name: '应用层', desc: '监控与控制', color: '#3b82f6', y: centerY - 140 },
        { name: '算法层', desc: 'MPC优化算法', color: '#0ea5e9', y: centerY - 70 },
        { name: '数据层', desc: '数据存储分析', color: '#06b6d4', y: centerY },
        { name: '通信层', desc: '4G/以太网', color: '#10b981', y: centerY + 70 },
        { name: '感知层', desc: '传感器采集', color: '#22c55e', y: centerY + 140 }
      ];

      layers.forEach((layer, index) => {
        const pulse = 1 + Math.sin(time * 2 + index * 0.6) * 0.06;
        
        ctx.save();
        ctx.translate(centerX, layer.y);
        ctx.scale(pulse, pulse);

        ctx.fillStyle = layer.color;
        ctx.fillRect(-120, -30, 240, 60);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-120, -30, 240, 60);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(layer.name, 0, -5);

        ctx.font = '12px system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(layer.desc, 0, 15);

        ctx.restore();

        if (index < layers.length - 1) {
          ctx.beginPath();
          ctx.moveTo(centerX, layer.y + 30);
          ctx.lineTo(centerX, layers[index + 1].y - 30);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(centerX - 10, layers[index + 1].y - 35);
          ctx.lineTo(centerX, layers[index + 1].y - 28);
          ctx.lineTo(centerX + 10, layers[index + 1].y - 35);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.stroke();

          const dataPos = (time * 2 + index * 0.3) % 1;
          const dataY = layer.y + 30 + dataPos * (layers[index + 1].y - layer.y - 60);
          ctx.beginPath();
          ctx.arc(centerX, dataY, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#60a5fa';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(centerX, dataY, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      });

      const capabilities = [
        { icon: '📊', text: '实时监测', y: centerY - 80 },
        { icon: '⚡', text: '<1s响应', y: centerY },
        { icon: '🎯', text: '精准控制', y: centerY + 80 }
      ];

      capabilities.forEach((cap, i) => {
        const cx = centerX + 180;
        const cy = cap.y;
        
        ctx.beginPath();
        ctx.arc(cx, cy, 25, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '16px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(cap.icon, cx, cy + 6);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText(cap.text, cx, cy + 45);
      });

      ctx.strokeStyle = '#475569';
      ctx.strokeRect(centerX - 280, centerY - 100, 80, 200);
      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('泵房', centerX - 240, centerY - 110);

      const sensorPoints = [
        { x: centerY - 60, y: -25 },
        { x: centerY, y: 0 },
        { x: centerY + 60, y: 25 }
      ];
      sensorPoints.forEach((pt, i) => {
        const blink = Math.sin(time * 4 + i) > 0.3;
        ctx.beginPath();
        ctx.arc(centerX - 260, pt.x, 8, 0, Math.PI * 2);
        ctx.fillStyle = blink ? '#22c55e' : '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    };

    // 场景3：全感知与实时需求检测
    const drawPressureSensor = (x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);

      const t = Date.now() * 0.001;

      ctx.fillStyle = '#475569';
      ctx.fillRect(-15, 0, 30, 20);

      ctx.beginPath();
      ctx.arc(0, -10, 25, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.stroke();

      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 0.75) + (i * Math.PI * 0.5 / 11);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 15, -10 + Math.sin(angle) * 15);
        ctx.lineTo(Math.cos(angle) * (i % 3 === 0 ? 10 : 12), -10 + Math.sin(angle) * (i % 3 === 0 ? 10 : 12));
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

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

    const drawScene3 = (width: number, height: number, time: number) => {
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
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('实时数据', cx - 280, cy - 180);

      const dataItems = [
        { label: '楼顶压力', value: `${(0.35 + Math.sin(time * 3) * 0.05).toFixed(2)} MPa`, color: '#ef4444' },
        { label: '泵房压力', value: `${(0.48 + Math.cos(time * 2) * 0.03).toFixed(2)} MPa`, color: '#3b82f6' },
        { label: '流量', value: `${(12 + Math.sin(time) * 2).toFixed(1)} m³/h`, color: '#22c55e' },
        { label: '转速', value: `${(1450 + Math.cos(time * 2) * 50).toFixed(0)} rpm`, color: '#f59e0b' }
      ];

      dataItems.forEach((item, i) => {
        const dy = cy - 155 + i * 35;
        
        ctx.beginPath();
        ctx.arc(cx - 270, dy, 5, 0, Math.PI * 2);
        ctx.fillStyle = item.color;
        ctx.fill();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText(item.label, cx - 255, dy + 4);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(item.value, cx - 100, dy + 4);
      });

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('工作流程：楼顶压力 → 4G → 云端 → 边缘控制器 → 水泵', cx, height - 30);
    };

    // 场景4：MPC智能决策（深化版）
    const drawScene4 = (width: number, height: number, time: number) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MPC 模型预测控制', centerX, 50);

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 180, centerY - 120, 360, 150);

      ctx.fillStyle = '#64748b';
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText('预测窗口 (未来N步)', centerX, centerY - 130);

      ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const tx = centerX - 120 + i * 60;
        ctx.beginPath();
        ctx.moveTo(tx, centerY - 120);
        ctx.lineTo(tx, centerY + 30);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '10px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`t+${i}`, tx, centerY + 45);
      }

      const currentPos = (time * 0.5) % 240 - 120;
      ctx.beginPath();
      ctx.moveTo(centerX + currentPos, centerY - 120);
      ctx.lineTo(centerX + currentPos, centerY + 30);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText('当前', centerX + currentPos, centerY - 135);

      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(centerX - 120, centerY);
      for (let i = 0; i < 240; i++) {
        const x = centerX - 120 + i;
        const y = centerY + Math.sin(time * 2 + i * 0.08) * 35;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.moveTo(centerX - 120, centerY);
      for (let i = 0; i < 240; i++) {
        const x = centerX - 120 + i;
        const y = centerY + Math.sin(time * 2 + i * 0.08) * 15 * Math.exp(-i * 0.01);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'left';
      
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(centerX - 250, centerY - 180);
      ctx.lineTo(centerX - 200, centerY - 180);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillText('原始响应', centerX - 190, centerY - 176);

      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(centerX - 250, centerY - 155);
      ctx.lineTo(centerX - 200, centerY - 155);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillText('MPC优化', centerX - 190, centerY - 151);

      const controlVars = [
        { name: '压力', unit: 'MPa', color: '#ef4444', base: 0.35 },
        { name: '流量', unit: 'm³/h', color: '#3b82f6', base: 12 },
        { name: '能耗', unit: 'kW', color: '#22c55e', base: 5.5 },
        { name: '转速', unit: 'rpm', color: '#f59e0b', base: 1450 }
      ];

      controlVars.forEach((v, i) => {
        const vx = centerX - 200 + i * 100;
        const vy = centerY + 90;

        ctx.beginPath();
        ctx.arc(vx, vy, 35, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = v.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(v.name, vx, vy - 5);

        const variation = Math.sin(time * 3 + i) * 0.1;
        const displayValue = (v.base * (1 + variation)).toFixed(v.name === '转速' ? 0 : 1);
        ctx.fillStyle = v.color;
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.fillText(`${displayValue} ${v.unit}`, vx, vy + 12);

        const optPulse = Math.sin(time * 4 + i) * 5;
        ctx.beginPath();
        ctx.arc(vx, vy, 38 + optPulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(16, 185, 129, ${1 - Math.abs(optPulse) / 5})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('多变量协调优化，振荡减少70%', centerX, height - 50);
    };

    // 场景5：最终效果（深化版）
    const drawScene5 = (width: number, height: number, time: number) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.fillStyle = '#8b5cf6';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('最终效果与价值', centerX, 50);

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 80, centerY - 140, 160, 220);

      for (let i = 1; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX - 80, centerY - 140 + i * 45);
        ctx.lineTo(centerX + 80, centerY - 140 + i * 45);
        ctx.stroke();
      }

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('改进前', centerX - 180, centerY - 150);

      for (let i = 0; i < 4; i++) {
        const y = centerY - 120 + i * 45;
        const prevHeight = i === 0 ? 70 : i === 1 ? 60 : i === 2 ? 30 : 15;
        
        ctx.fillStyle = i <= 1 ? '#ef4444' : '#f97316';
        ctx.fillRect(centerX - 210, y, prevHeight, 30);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px system-ui, sans-serif';
        ctx.fillText(`${i + 1}楼`, centerX - 250, y + 20);
      }

      ctx.fillStyle = '#64748b';
      ctx.fillText('改进后', centerX + 180, centerY - 150);

      for (let i = 0; i < 4; i++) {
        const y = centerY - 120 + i * 45;
        const postHeight = 45 + Math.sin(time * 2 + i) * 5;
        
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(centerX + 130, y, postHeight, 30);
        
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`${i + 1}楼`, centerX + 180 + postHeight, y + 20);
      }

      const arrowOffset = Math.sin(time * 2) * 10;
      ctx.beginPath();
      ctx.moveTo(centerX - 140, centerY);
      ctx.lineTo(centerX - 80, centerY + arrowOffset);
      ctx.lineTo(centerX - 140, centerY + arrowOffset * 2);
      ctx.closePath();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(centerX + 80, centerY + arrowOffset);
      ctx.lineTo(centerX + 140, centerY);
      ctx.lineTo(centerX + 80, centerY - arrowOffset);
      ctx.closePath();
      ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.fill();

      const metrics = [
        { label: '能耗降低', value: '45%', color: '#22c55e', icon: '⚡' },
        { label: '效率提升', value: '60%', color: '#3b82f6', icon: '📈' },
        { label: '响应速度', value: '<1s', color: '#8b5cf6', icon: '⚡' },
        { label: '可用性', value: '99.5%', color: '#f59e0b', icon: '✓' }
      ];

      metrics.forEach((m, i) => {
        const mx = centerX - 180 + i * 100;
        const my = centerY + 100;

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(mx - 40, my - 35, 80, 70, 8);
        ctx.fill();

        ctx.strokeStyle = m.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(mx - 40, my - 35, 80, 70, 8);
        ctx.stroke();

        ctx.font = '16px system-ui, sans-serif';
        ctx.fillText(m.icon, mx, my - 18);

        ctx.fillStyle = m.color;
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(m.value, mx, my + 8);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px system-ui, sans-serif';
        ctx.fillText(m.label, mx, my + 25);

        const blink = Math.sin(time * 3 + i) > 0.5;
        if (blink) {
          ctx.beginPath();
          ctx.arc(mx, my - 35, 3, 0, Math.PI * 2);
          ctx.fillStyle = m.color;
          ctx.fill();
        }
      });

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓ 优化目标达成', centerX, height - 80);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(centerX - 100, centerY - 180, 200, 30);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 100, centerY - 180, 200, 30);

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText('系统运行状态：正常', centerX, centerY - 158);

      const runHours = Math.floor(8760 + Math.sin(time) * 100);
      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText(`7×24小时稳定运行 | 累计 ${runHours} 小时`, centerX, height - 50);
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
          drawScene3(rect.width, rect.height, time);
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
    <div className="w-full h-full relative bg-slate-900" style={{ zIndex: 0 }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full absolute inset-0"
        style={{ 
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
    </div>
  );
}
