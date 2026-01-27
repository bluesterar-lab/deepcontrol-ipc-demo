'use client';

import { useRef, useEffect } from 'react';

interface BuildingAnimationProps {
  scene: number;
}

export default function BuildingAnimation({ scene }: BuildingAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const currentSceneRef = useRef(scene);
  const prevSceneRef = useRef(scene);
  const transitionProgressRef = useRef(1); // 0-1, 1表示无过渡
  
  useEffect(() => {
    if (currentSceneRef.current !== scene) {
      prevSceneRef.current = currentSceneRef.current;
      currentSceneRef.current = scene;
      transitionProgressRef.current = 0; // 开始过渡
    }
  }, [scene]);
  
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

    // 缓动函数 - easeInOutCubic
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    // 场景1：传统方案痛点
    const drawScene1 = (width: number, height: number, time: number, alpha: number = 1) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('传统PID控制的问题', centerX, 50);

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 120, centerY - 180, 240, 280);

      for (let i = 1; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX - 120, centerY - 180 + i * 55);
        ctx.lineTo(centerX + 120, centerY - 180 + i * 55);
        ctx.stroke();
      }

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX + 120, centerY + 100);
      ctx.lineTo(centerX + 180, centerY + 100);
      ctx.lineTo(centerX + 180, centerY - 150);
      ctx.lineTo(centerX, centerY - 150);
      ctx.lineTo(centerX, centerY + 100);
      ctx.stroke();

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
      ctx.fillText('压力阶跃响应振荡', centerX, centerY + 145);

      for (let i = 0; i < 5; i++) {
        const y = centerY - 155 + i * 55;
        const basePressure = i === 0 ? 80 : i === 1 ? 70 : i === 2 ? 40 : i === 3 ? 20 : 10;
        const fluctuation = Math.sin(time * 5 + i) * 15;
        const barWidth = Math.max(10, basePressure + fluctuation);
        
        ctx.fillStyle = i <= 1 ? '#ef4444' : i === 2 ? '#f97316' : '#eab308';
        ctx.fillRect(centerX + 180, y + 10, barWidth, 35);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.fillText(`${i + 1}楼`, centerX + 180 + barWidth + 8, y + 32);
        
        ctx.font = '11px system-ui, sans-serif';
        const status = i <= 1 ? '超压' : i === 2 ? '不足' : '严重不足';
        ctx.fillStyle = i <= 1 ? '#ef4444' : i === 2 ? '#f97316' : '#eab308';
        ctx.fillText(status, centerX + 180 + barWidth + 45, y + 32);
      }

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

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 80, centerY - 200, 160, 40);
      
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText('水力失衡', centerX, centerY - 175);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText(`能效: ${(65 + Math.sin(time) * 5).toFixed(1)}%`, centerX - 100, centerY + 180);
      ctx.fillText(`响应延迟: ${(1.5 + Math.sin(time * 2) * 0.3).toFixed(1)}s`, centerX + 100, centerY + 180);
      
      ctx.globalAlpha = 1;
    };

    // 场景2：DeepControl系统介入
    const drawScene2 = (width: number, height: number, time: number, alpha: number = 1) => {
      ctx.globalAlpha = alpha;
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
      
      ctx.globalAlpha = 1;
    };

    // 场景3：全感知检测与实时需求
    const drawScene3 = (width: number, height: number, time: number, alpha: number = 1) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('全感知检测网络', centerX, 50);

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 180, centerY - 150, 360, 300);

      const floorLabels = ['5楼', '4楼', '3楼', '2楼', '1楼'];
      floorLabels.forEach((label, i) => {
        const y = centerY - 130 + i * 55;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(label, centerX - 165, y + 20);
      });

      const sensors = [
        { x: centerY - 130, y: -100, type: '压力', value: '0.45 MPa' },
        { x: centerY - 75, y: -50, type: '流量', value: '12.5 m³/h' },
        { x: centerY - 20, y: 0, type: '压力', value: '0.42 MPa' },
        { x: centerY + 35, y: 50, type: '流量', value: '11.8 m³/h' },
        { x: centerY + 90, y: 100, type: '压力', value: '0.40 MPa' }
      ];

      sensors.forEach((sensor, i) => {
        const sx = centerX - 120;
        const sy = sensor.x;
        const blink = Math.sin(time * 5 + i) > 0.3;

        ctx.beginPath();
        ctx.arc(sx, sy, 12, 0, Math.PI * 2);
        ctx.fillStyle = blink ? '#22c55e' : '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('S' + (i + 1), sx, sy + 4);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(sensor.type + ': ' + sensor.value, sx + 20, sy + 4);

        if (i > 0) {
          ctx.beginPath();
          ctx.moveTo(sx, sensors[i - 1].x);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX + 80, centerY);
      ctx.lineTo(centerX + 200, centerY - 80);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX + 200, centerY - 80);
      ctx.lineTo(centerX + 250, centerY - 50);
      ctx.stroke();

      ctx.fillRect(centerX + 200, centerY - 100, 60, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('4G', centerX + 230, centerY - 75);

      ctx.fillRect(centerX + 250, centerY - 70, 60, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('云端', centerX + 280, centerY - 45);

      const cloudData = (time * 2) % 3;
      for (let i = 0; i < 5; i++) {
        const dotX = centerX + 260 + i * 15;
        const dotY = centerY - 40 + Math.sin(time * 3 + i) * 8;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
        ctx.fillStyle = i < cloudData ? '#3b82f6' : '#475569';
        ctx.fill();
      }

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX + 280, centerY - 30);
      ctx.lineTo(centerX + 100, centerY + 50);
      ctx.stroke();

      ctx.fillRect(centerX + 50, centerY + 40, 80, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('边缘控制器', centerX + 90, centerY + 65);

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX + 50, centerY + 60);
      ctx.lineTo(centerX - 100, centerY + 60);
      ctx.lineTo(centerX - 100, centerY + 120);
      ctx.stroke();

      ctx.fillRect(centerX - 140, centerY + 120, 80, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('变频泵', centerX - 100, centerY + 145);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText('采集周期: 50ms', centerX - 100, height - 30);
      ctx.fillText('传感器数: 5个', centerX + 100, height - 30);
      
      ctx.globalAlpha = 1;
    };

    // 场景4：MPC智能决策
    const drawScene4 = (width: number, height: number, time: number, alpha: number = 1) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.fillStyle = '#8b5cf6';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MPC智能决策与精准把控', centerX, 50);

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 200, centerY - 150, 400, 300);

      ctx.beginPath();
      ctx.moveTo(centerX - 150, centerY - 80);
      for (let x = 0; x < 300; x += 3) {
        const smoothResponse = Math.min(100, x * 0.5) + Math.sin(x * 0.05 + time * 2) * 2;
        ctx.lineTo(centerX - 150 + x, centerY - 80 + 120 - smoothResponse);
      }
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#22c55e';
      ctx.font = '14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MPC响应曲线', centerX, centerY - 120);

      const metrics = [
        { name: '超调量', value: '<2%', status: 'normal' },
        { name: '调节时间', value: '3.2s', status: 'normal' },
        { name: '稳定误差', value: '±0.01', status: 'normal' },
        { name: '振荡衰减', value: '95%', status: 'excellent' }
      ];

      metrics.forEach((metric, i) => {
        const mx = centerX - 150 + i * 75;
        const my = centerY + 80;
        
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(mx - 35, my - 35, 70, 70);
        
        ctx.fillStyle = metric.status === 'excellent' ? '#8b5cf6' : '#22c55e';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(metric.name, mx, my - 10);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.fillText(metric.value, mx, my + 15);
      });

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 180, centerY - 180, 120, 30);
      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText('预测模型', centerX - 120, centerY - 160);

      const predictionData = [];
      for (let i = 0; i < 10; i++) {
        predictionData.push(Math.sin(time + i * 0.5) * 0.3 + 0.5);
      }

      for (let i = 0; i < predictionData.length - 1; i++) {
        const x1 = centerX - 170 + i * 12;
        const y1 = centerY - 120 - predictionData[i] * 80;
        const x2 = centerX - 170 + (i + 1) * 12;
        const y2 = centerY - 120 - predictionData[i + 1] * 80;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = i < 3 ? '#8b5cf6' : '#6366f1';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX + 70, centerY - 180, 120, 30);
      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText('优化目标', centerX + 130, centerY - 160);

      const objectives = [
        { text: '压力稳定', achieved: true },
        { text: '能效最优', achieved: true },
        { text: '响应快速', achieved: true }
      ];

      objectives.forEach((obj, i) => {
        const ox = centerX + 80;
        const oy = centerY - 120 + i * 20;
        
        ctx.beginPath();
        ctx.arc(ox, oy, 6, 0, Math.PI * 2);
        ctx.fillStyle = obj.achieved ? '#22c55e' : '#64748b';
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(obj.text, ox + 12, oy + 4);
      });

      const convergenceWave = (time * 3) % 100;
      ctx.beginPath();
      for (let x = 0; x < 100; x++) {
        const waveY = Math.sin((x + convergenceWave) * 0.1) * 10 * Math.exp(-x * 0.03);
        ctx.lineTo(centerX - 50 + x, centerY + 10 + waveY);
      }
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText('振荡减少: 70%', centerX - 100, height - 30);
      ctx.fillText('能效提升: 25%', centerX + 100, height - 30);
      
      ctx.globalAlpha = 1;
    };

    // 场景5：最终效果与价值
    const drawScene5 = (width: number, height: number, time: number, alpha: number = 1) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('最终效果与价值', centerX, 50);

      const improvements = [
        { label: '能效提升', before: '65%', after: '88%', icon: '⚡' },
        { label: '响应时间', before: '1.5s', after: '<1s', icon: '⚡' },
        { label: '压力稳定', before: '±15%', after: '±2%', icon: '📊' },
        { label: '故障预测', before: '无', after: '提前预警', icon: '🎯' }
      ];

      improvements.forEach((imp, i) => {
        const ix = centerX - 200 + i * 100;
        const iy = centerY - 50;
        
        ctx.beginPath();
        ctx.arc(ix, iy, 35, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = imp.icon === '⚡' ? '#f59e0b' : imp.icon === '📊' ? '#3b82f6' : '#22c55e';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.font = '24px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(imp.icon, ix, iy + 8);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.fillText(imp.label, ix, iy + 55);
        
        ctx.font = '12px system-ui, sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('前: ' + imp.before, ix, iy + 75);
        
        ctx.fillStyle = '#22c55e';
        ctx.fillText('后: ' + imp.after, ix, iy + 92);
        
        const arrowProgress = (time * 2 + i * 0.2) % 1;
        const arrowY = iy + 100 + arrowProgress * 30;
        ctx.beginPath();
        ctx.moveTo(ix - 10, arrowY - 5);
        ctx.lineTo(ix, arrowY + 5);
        ctx.lineTo(ix + 10, arrowY - 5);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
      });

      const highlights = [
        '降低运行成本30%',
        '延长设备寿命20%',
        '提升用户满意度',
        '减少维护频次50%'
      ];

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 180, centerY + 100, 360, 80);

      highlights.forEach((highlight, i) => {
        const hx = centerX - 160 + (i % 2) * 170;
        const hy = centerY + 120 + Math.floor(i / 2) * 25;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('✓ ' + highlight, hx, hy);
      });

      const pulse = 1 + Math.sin(time * 3) * 0.05;
      ctx.save();
      ctx.translate(centerX, centerY - 120);
      ctx.scale(pulse, pulse);
      
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓', 0, 5);
      
      ctx.restore();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DeepControl AIPC - 智能二次供水优化解决方案', centerX, height - 30);
      
      ctx.globalAlpha = 1;
    };

    // 根据场景绘制函数
    const drawScene = (sceneNum: number, width: number, height: number, time: number, alpha: number) => {
      switch (sceneNum) {
        case 1: drawScene1(width, height, time, alpha); break;
        case 2: drawScene2(width, height, time, alpha); break;
        case 3: drawScene3(width, height, time, alpha); break;
        case 4: drawScene4(width, height, time, alpha); break;
        case 5: drawScene5(width, height, time, alpha); break;
      }
    };

    const animate = (timestamp: number) => {
      if (!timeRef.current) {
        timeRef.current = timestamp;
      }

      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const deltaTime = timestamp - timeRef.current;
      timeRef.current = timestamp;
      const time = timestamp * 0.001;

      // 更新过渡进度
      if (transitionProgressRef.current < 1) {
        transitionProgressRef.current += deltaTime * 0.001; // 过渡持续约1秒
        if (transitionProgressRef.current > 1) {
          transitionProgressRef.current = 1;
        }
      }

      const progress = easeInOutCubic(transitionProgressRef.current);
      
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (progress < 1) {
        // 过渡中：淡出旧场景 + 淡入新场景 + 缩放效果
        const alphaOut = 1 - progress;
        const alphaIn = progress;
        
        // 旧场景：淡出 + 缩小
        ctx.save();
        ctx.translate(rect.width / 2, rect.height / 2);
        ctx.scale(1 - progress * 0.1, 1 - progress * 0.1);
        ctx.translate(-rect.width / 2, -rect.height / 2);
        drawScene(prevSceneRef.current, rect.width, rect.height, time, alphaOut);
        ctx.restore();
        
        // 新场景：淡入 + 放大
        ctx.save();
        ctx.translate(rect.width / 2, rect.height / 2);
        ctx.scale(0.9 + progress * 0.1, 0.9 + progress * 0.1);
        ctx.translate(-rect.width / 2, -rect.height / 2);
        drawScene(currentSceneRef.current, rect.width, rect.height, time, alphaIn);
        ctx.restore();
      } else {
        // 无过渡：正常绘制新场景
        drawScene(currentSceneRef.current, rect.width, rect.height, time, 1);
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
