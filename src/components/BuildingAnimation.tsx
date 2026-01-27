'use client';

import { useRef, useEffect, useState } from 'react';

interface BuildingAnimationProps {
  scene: number;
}

export default function BuildingAnimation({ scene }: BuildingAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  
  // 动画状态
  const [animationTime, setAnimationTime] = useState(0);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 动画循环
    const animate = (timestamp: number) => {
      if (!timeRef.current) {
        timeRef.current = timestamp;
      }
      
      const deltaTime = timestamp - timeRef.current;
      timeRef.current = timestamp;
      
      setAnimationTime((prev) => prev + deltaTime * 0.001);
      
      drawScene(ctx, canvas.width, canvas.height);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [scene, animationTime]);

  // 绘制场景
  const drawScene = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    const time = animationTime;

    switch (scene) {
      case 1:
        drawScene1(ctx, width, height, time);
        break;
      case 2:
        drawScene2(ctx, width, height, time);
        break;
      case 3:
        drawScene3(ctx, width, height, time);
        break;
      case 4:
        drawScene4(ctx, width, height, time);
        break;
      case 5:
        drawScene5(ctx, width, height, time);
        break;
    }
  };

  // 场景1：传统方案的痛点
  const drawScene1 = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const buildingX = width * 0.2;
    const buildingWidth = width * 0.25;
    const buildingHeight = height * 0.7;
    const buildingY = height * 0.25;
    
    // 绘制建筑
    drawBuilding(ctx, buildingX, buildingY, buildingWidth, buildingHeight, 30);
    
    // 绘制底部水泵
    const pumpX = buildingX + buildingWidth / 2;
    const pumpY = buildingY + buildingHeight + 30;
    drawPump(ctx, pumpX, pumpY, '#fbbf24');
    
    // 绘制水管
    const pipeWidth = 8;
    // 主立管
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = pipeWidth;
    ctx.beginPath();
    ctx.moveTo(pumpX, pumpY - 20);
    ctx.lineTo(pumpX, buildingY);
    ctx.stroke();
    
    // 水流动画
    const flowSpeed = time % 2;
    const lowFloorWater = Math.sin(time * 3) * 0.5 + 0.5;
    const highFloorWater = Math.max(0, 1 - lowFloorWater * 1.5);
    
    // 低楼层水流（强）
    for (let i = 1; i <= 5; i++) {
      const floorY = buildingY + buildingHeight - (i / 30) * buildingHeight;
      if (time > 2) {
        // 水龙头图标
        drawWaterTap(ctx, pumpX + buildingWidth / 2 + 10, floorY, '#3b82f6', true);
      }
    }
    
    // 高楼层水流（弱）
    for (let i = 20; i <= 30; i++) {
      const floorY = buildingY + buildingHeight - (i / 30) * buildingHeight;
      if (time > 3) {
        drawWaterTap(ctx, pumpX + buildingWidth / 2 + 10, floorY, '#64748b', highFloorWater > 0.3);
      }
    }
    
    // 压力表
    const pressureGaugeX = width * 0.7;
    const pressureGaugeY = height * 0.4;
    drawPressureGauge(ctx, pressureGaugeX, pressureGaugeY, 0.6 - highFloorWater * 0.3);
    
    // 能耗浮窗
    const energyX = width * 0.6;
    const energyY = height * 0.2;
    drawEnergyWindow(ctx, energyX, energyY, 0.5 + Math.sin(time * 2) * 0.3);
    
    // 文字标注
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('低楼层抢占流量', buildingX + buildingWidth + 20, buildingY + buildingHeight * 0.8);
    ctx.fillText('高层水压不足', buildingX + buildingWidth + 20, buildingY + buildingHeight * 0.3);
  };

  // 场景2：DeepControl系统的介入
  const drawScene2 = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const buildingX = width * 0.15;
    const buildingWidth = width * 0.2;
    const buildingHeight = height * 0.6;
    const buildingY = height * 0.3;
    
    // 绘制建筑
    drawBuilding(ctx, buildingX, buildingY, buildingWidth, buildingHeight, 30);
    
    // 泵房区域
    const pumpRoomX = width * 0.45;
    const pumpRoomY = height * 0.35;
    const pumpRoomWidth = width * 0.5;
    const pumpRoomHeight = height * 0.5;
    
    // 泵房背景
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(pumpRoomX, pumpRoomY, pumpRoomWidth, pumpRoomHeight);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(pumpRoomX, pumpRoomY, pumpRoomWidth, pumpRoomHeight);
    
    // DeepControl设备
    const deviceX = pumpRoomX + pumpRoomWidth / 2;
    const deviceY = pumpRoomY + pumpRoomHeight / 2;
    
    // 设备发光效果
    const glowSize = 20 + Math.sin(time * 2) * 5;
    const gradient = ctx.createRadialGradient(deviceX, deviceY, 0, deviceX, deviceY, glowSize);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(deviceX, deviceY, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // 设备主体
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(deviceX - 40, deviceY - 30, 80, 60);
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3;
    ctx.strokeRect(deviceX - 40, deviceY - 30, 80, 60);
    
    // 设备标签
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DeepControl', deviceX, deviceY - 5);
    ctx.fillText('AIPC', deviceX, deviceY + 10);
    
    // 连接线到云端
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(deviceX, deviceY - 30);
    ctx.lineTo(deviceX, deviceY - 80);
    ctx.lineTo(deviceX + 100, deviceY - 80);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 云端图标
    drawCloud(ctx, deviceX + 140, deviceY - 80);
    
    // 五层架构示意
    const layers = ['物理系统层', '感知与执行层', '网络传输层', '边缘计算层', '云端服务层'];
    layers.forEach((layer, index) => {
      const layerY = pumpRoomY + 60 + index * 45;
      const alpha = Math.min(1, (time - index * 0.5) / 0.5);
      
      if (alpha > 0) {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#334155';
        ctx.fillRect(pumpRoomX + 20, layerY, 200, 30);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(pumpRoomX + 20, layerY, 200, 30);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(layer, pumpRoomX + 30, layerY + 20);
        ctx.globalAlpha = 1;
      }
    });
    
    // 压力传感器和流量计
    if (time > 8) {
      drawSensor(ctx, pumpRoomX + 250, pumpRoomY + 100, '#22c55e', '压力传感器');
      drawSensor(ctx, pumpRoomX + 250, pumpRoomY + 150, '#a855f7', '流量计');
    }
  };

  // 场景3：全感知与实时需求检测
  const drawScene3 = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const buildingX = width * 0.2;
    const buildingWidth = width * 0.25;
    const buildingHeight = height * 0.7;
    const buildingY = height * 0.2;
    
    // 透明化建筑
    ctx.globalAlpha = 0.3;
    drawBuilding(ctx, buildingX, buildingY, buildingWidth, buildingHeight, 30);
    ctx.globalAlpha = 1;
    
    // 数字化水管网络
    const pipeX = buildingX + buildingWidth / 2;
    const pipeWidth = 12;
    
    // 主立管（数字网格效果）
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = pipeWidth;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(pipeX, buildingY + buildingHeight + 30);
    ctx.lineTo(pipeX, buildingY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 数据流粒子
    const particleCount = 10;
    for (let i = 0; i < particleCount; i++) {
      const progress = ((time * 2 + i / particleCount) % 1);
      const y = buildingY + buildingHeight + 30 - progress * (buildingHeight + 30);
      const size = 4 + Math.sin(time * 5 + i) * 2;
      
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(pipeX, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // 数据光晕
      const particleGlow = ctx.createRadialGradient(pipeX, y, 0, pipeX, y, size * 3);
      particleGlow.addColorStop(0, 'rgba(34, 211, 238, 0.5)');
      particleGlow.addColorStop(1, 'rgba(34, 211, 238, 0)');
      ctx.fillStyle = particleGlow;
      ctx.beginPath();
      ctx.arc(pipeX, y, size * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 传感器节点
    const sensorPositions = [0.2, 0.4, 0.6, 0.8];
    sensorPositions.forEach((pos, index) => {
      const sensorY = buildingY + buildingHeight * (1 - pos);
      const pulsePhase = (time * 2 + index) % 1;
      
      // 传感器发光
      const sensorGlow = ctx.createRadialGradient(pipeX + 30, sensorY, 0, pipeX + 30, sensorY, 15 + pulsePhase * 10);
      sensorGlow.addColorStop(0, 'rgba(34, 197, 94, 0.6)');
      sensorGlow.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = sensorGlow;
      ctx.beginPath();
      ctx.arc(pipeX + 30, sensorY, 25, 0, Math.PI * 2);
      ctx.fill();
      
      // 传感器图标
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(pipeX + 30, sensorY, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // 数据标签
      if (pulsePhase < 0.3) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${(Math.random() * 0.5 + 0.3).toFixed(2)} MPa`, pipeX + 45, sensorY + 4);
      }
    });
    
    // 边缘计算中心
    const edgeX = width * 0.7;
    const edgeY = height * 0.5;
    drawEdgeComputer(ctx, edgeX, edgeY);
    
    // 多维数据展示
    const dataTypes = [
      { name: '压力', color: '#22c55e', value: Math.sin(time * 2) * 0.2 + 0.5 },
      { name: '流量', color: '#3b82f6', value: Math.sin(time * 2 + 1) * 0.2 + 0.5 },
      { name: '振动', color: '#f59e0b', value: Math.sin(time * 2 + 2) * 0.2 + 0.5 },
      { name: '电能', color: '#8b5cf6', value: Math.sin(time * 2 + 3) * 0.2 + 0.5 }
    ];
    
    dataTypes.forEach((data, index) => {
      const dataY = height * 0.15 + index * 60;
      const dataX = width * 0.1;
      
      // 数据条
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(dataX, dataY, width * 0.8, 40);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(dataX, dataY, width * 0.8, 40);
      
      // 标签
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(data.name, dataX + 10, dataY + 25);
      
      // 数据条
      ctx.fillStyle = data.color;
      ctx.fillRect(dataX + 100, dataY + 10, data.value * (width * 0.6), 20);
      
      // 数值
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'right';
      ctx.fillText(`${(data.value * 100).toFixed(0)}%`, dataX + width * 0.8 - 10, dataY + 25);
    });
  };

  // 场景4：MPC智能决策
  const drawScene4 = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const centerY = height * 0.5;
    
    // 中央MPC脑图
    const brainX = width * 0.5;
    const brainY = centerY;
    const brainSize = 80 + Math.sin(time * 3) * 5;
    
    // 外围光晕
    const brainGlow = ctx.createRadialGradient(brainX, brainY, 0, brainX, brainY, brainSize * 1.5);
    brainGlow.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    brainGlow.addColorStop(1, 'rgba(59, 130, 246, 0)');
    ctx.fillStyle = brainGlow;
    ctx.beginPath();
    ctx.arc(brainX, brainY, brainSize * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // 脑图主体
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(brainX, brainY, brainSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // MPC文字
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MPC', brainX, brainY + 8);
    
    // 对比区域
    const leftX = width * 0.1;
    const rightX = width * 0.6;
    const chartHeight = height * 0.35;
    const chartY = height * 0.6;
    
    // 左侧：传统PID
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(leftX, chartY, width * 0.35, chartHeight);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(leftX, chartY, width * 0.35, chartHeight);
    
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('传统 PID (振荡)', leftX + width * 0.175, chartY + 25);
    
    // PID曲线（振荡）
    ctx.beginPath();
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 2;
    for (let i = 0; i < width * 0.35; i++) {
      const x = leftX + i;
      const oscillation = Math.sin((i / 10 + time * 3) * 0.5) * 30;
      const y = chartY + chartHeight / 2 + oscillation;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // 右侧：DeepControl MPC
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(rightX, chartY, width * 0.35, chartHeight);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(rightX, chartY, width * 0.35, chartHeight);
    
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DeepControl MPC (平滑)', rightX + width * 0.175, chartY + 25);
    
    // MPC曲线（平滑）
    ctx.beginPath();
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    for (let i = 0; i < width * 0.35; i++) {
      const x = rightX + i;
      const smooth = Math.sin((i / 10 + time * 2) * 0.3) * 10;
      const y = chartY + chartHeight / 2 + smooth;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // 控制指令
    if (time > 5) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(width * 0.1, height * 0.1, width * 0.8, 80);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.1, height * 0.1, width * 0.8, 80);
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('多变量协调控制：变频器 + 电动阀门', width * 0.5, height * 0.15);
      ctx.fillText('精准分配流量，实现全局优化', width * 0.5, height * 0.175);
    }
  };

  // 场景5：最终效果
  const drawScene5 = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const buildingX = width * 0.15;
    const buildingWidth = width * 0.25;
    const buildingHeight = height * 0.7;
    const buildingY = height * 0.2;
    
    // 绘制建筑
    drawBuilding(ctx, buildingX, buildingY, buildingWidth, buildingHeight, 30);
    
    // 主水管（稳定的水流）
    const pipeX = buildingX + buildingWidth / 2;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(pipeX, buildingY + buildingHeight + 30);
    ctx.lineTo(pipeX, buildingY);
    ctx.stroke();
    
    // 所有楼层都有稳定水流
    for (let i = 1; i <= 30; i++) {
      const floorY = buildingY + buildingHeight - (i / 30) * buildingHeight;
      const pulse = Math.sin(time * 2 + i * 0.1) * 0.5 + 0.5;
      drawWaterTap(ctx, pipeX + buildingWidth / 2 + 10, floorY, '#3b82f6', pulse > 0.5);
    }
    
    // 数据对比图表
    const chartX = width * 0.5;
    const chartY = height * 0.15;
    const chartWidth = width * 0.45;
    const chartHeight = height * 0.25;
    
    // 图表背景
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(chartX, chartY, chartWidth, chartHeight);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(chartX, chartY, chartWidth, chartHeight);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('能耗对比', chartX + chartWidth / 2, chartY + 25);
    
    // 能耗柱状图
    const barWidth = chartWidth * 0.25;
    const bar1X = chartX + chartWidth * 0.2;
    const bar2X = chartX + chartWidth * 0.55;
    
    // 传统方案
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(bar1X, chartY + 40, barWidth, chartHeight - 60);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('传统方案', bar1X + barWidth / 2, chartY + chartHeight - 20);
    ctx.fillText('100%', bar1X + barWidth / 2, chartY + 35);
    
    // DeepControl方案（45%）
    ctx.fillStyle = '#22c55e';
    const bar2Height = (chartHeight - 60) * 0.55;
    ctx.fillRect(bar2X, chartY + 40 + (chartHeight - 60 - bar2Height), barWidth, bar2Height);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('DeepControl', bar2X + barWidth / 2, chartY + chartHeight - 20);
    ctx.fillText('55% ↓45%', bar2X + barWidth / 2, chartY + 35);
    
    // 运维成本
    const costChartY = chartY + chartHeight + 20;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(chartX, costChartY, chartWidth, chartHeight);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(chartX, costChartY, chartWidth, chartHeight);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('运维成本', chartX + chartWidth / 2, costChartY + 25);
    
    // 成本对比
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(bar1X, costChartY + 40, barWidth, chartHeight - 60);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('传统方案', bar1X + barWidth / 2, costChartY + chartHeight - 20);
    ctx.fillText('100%', bar1X + barWidth / 2, costChartY + 35);
    
    ctx.fillStyle = '#22c55e';
    const costBarHeight = (chartHeight - 60) * 0.7;
    ctx.fillRect(bar2X, costChartY + 40 + (chartHeight - 60 - costBarHeight), barWidth, costBarHeight);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('DeepControl', bar2X + barWidth / 2, costChartY + chartHeight - 20);
    ctx.fillText('70% ↓30%', bar2X + barWidth / 2, costChartY + 35);
    
    // DeepControl Logo
    if (time > 8) {
      const logoX = width * 0.7;
      const logoY = height * 0.7;
      
      // Logo发光
      const logoGlow = ctx.createRadialGradient(logoX, logoY, 0, logoX, logoY, 100);
      logoGlow.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
      logoGlow.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = logoGlow;
      ctx.beginPath();
      ctx.arc(logoX, logoY, 100, 0, Math.PI * 2);
      ctx.fill();
      
      // Logo文字
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DeepControl AIPC', logoX, logoY - 20);
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.fillText('7x24小时稳定运行', logoX, logoY + 20);
      ctx.fillText('99.5% 系统可用性', logoX, logoY + 45);
    }
  };

  // 辅助绘制函数
  const drawBuilding = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, floors: number) => {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // 楼层线
    const floorHeight = height / floors;
    for (let i = 1; i < floors; i++) {
      ctx.beginPath();
      ctx.moveTo(x, y + i * floorHeight);
      ctx.lineTo(x + width, y + i * floorHeight);
      ctx.stroke();
    }
  };

  const drawPump = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x - 25, y - 15, 50, 30);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 25, y - 15, 50, 30);
    
    // 旋转效果
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(animationTime * 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-3, -3, 6, 6);
    ctx.fillRect(-3, -3, 6, 6);
    ctx.fillRect(-3, -3, 6, 6);
    ctx.fillRect(-3, -3, 6, 6);
    ctx.restore();
  };

  const drawWaterTap = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isActive: boolean) => {
    // 水龙头
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x, y - 3, 8, 6);
    
    if (isActive) {
      // 水流
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 8, y);
      ctx.lineTo(x + 20, y);
      ctx.stroke();
      
      // 水滴
      ctx.fillStyle = color;
      const dropY = y + Math.sin(animationTime * 5) * 3;
      ctx.beginPath();
      ctx.arc(x + 22, dropY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawPressureGauge = (ctx: CanvasRenderingContext2D, x: number, y: number, value: number) => {
    // 仪表盘背景
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(x, y, 40, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 指针
    const angle = Math.PI + value * Math.PI;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * 30, y + Math.sin(angle) * 30);
    ctx.stroke();
    
    // 中心点
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawEnergyWindow = (ctx: CanvasRenderingContext2D, x: number, y: number, value: number) => {
    const width = 150;
    const height = 60;
    
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('水泵能耗', x + width / 2, y + 20);
    
    // 能耗曲线
    ctx.beginPath();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    for (let i = 0; i < width - 20; i++) {
      const px = x + 10 + i;
      const py = y + 50 - Math.sin((i / 10 + animationTime * 2) * 0.5) * 15 - value * 10;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
  };

  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 5, 15, 0, Math.PI * 2);
    ctx.arc(x + 45, y, 18, 0, Math.PI * 2);
    ctx.arc(x + 25, y + 10, 12, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawSensor = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, label: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, x + 15, y + 4);
  };

  const drawEdgeComputer = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 50, y - 30, 100, 60);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 50, y - 30, 100, 60);
    
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('边缘计算', x, y + 5);
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
