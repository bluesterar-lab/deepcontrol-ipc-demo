'use client';

import { useRef, useEffect, useState } from 'react';

interface BuildingAnimationProps {
  scene: number;
}

export default function BuildingAnimation({ scene }: BuildingAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  
  const [animationTime, setAnimationTime] = useState(0);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width * 2; // 高清
        canvas.height = rect.height * 2;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(2, 2);
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
      
      setAnimationTime((prev) => prev + deltaTime * 0.001);
      
      drawScene(ctx, canvas.width / 2, canvas.height / 2);
      
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

  // 颜色配置
  const colors = {
    background: '#0a1628',        // 科技深蓝
    neonBlue: '#00f0ff',          // 荧光蓝
    neonBlueDim: 'rgba(0, 240, 255, 0.3)',
    brightWhite: '#ffffff',       // 亮白色
    warning: '#ff4444',           // 红色警告
    success: '#00ff88',           // 绿色成功
    cyan: '#00d4ff',
    purple: '#a855f7',
    orange: '#ff9900'
  };

  // 等轴测投影转换
  const isoTransform = (x: number, y: number, z: number) => {
    const isoX = (x - y) * Math.cos(Math.PI / 6);
    const isoY = (x + y) * Math.sin(Math.PI / 6) - z;
    return { x: isoX, y: isoY };
  };

  // 绘制等轴测立方体
  const drawIsoCube = (ctx: CanvasRenderingContext2D, x: number, y: number, z: number, 
                       width: number, height: number, depth: number, color: string) => {
    const top = isoTransform(x, y, z);
    const front = isoTransform(x, y + depth, z);
    const side = isoTransform(x + width, y, z);
    const frontTop = isoTransform(x, y, z - height);
    
    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(side.x, side.y);
    ctx.lineTo(isoTransform(x + width, y + depth, z).x, isoTransform(x + width, y + depth, z).y);
    ctx.lineTo(front.x, front.y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = colors.neonBlueDim;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 顶面
    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(side.x, side.y);
    ctx.lineTo(isoTransform(x + width, y, z - height).x, isoTransform(x + width, y, z - height).y);
    ctx.lineTo(frontTop.x, frontTop.y);
    ctx.closePath();
    ctx.fillStyle = color + '40';
    ctx.fill();
    ctx.stroke();
    
    // 侧面
    ctx.beginPath();
    ctx.moveTo(side.x, side.y);
    ctx.lineTo(isoTransform(x + width, y, z - height).x, isoTransform(x + width, y, z - height).y);
    ctx.lineTo(isoTransform(x + width, y + depth, z - height).x, isoTransform(x + width, y + depth, z - height).y);
    ctx.lineTo(isoTransform(x + width, y + depth, z).x, isoTransform(x + width, y + depth, z).y);
    ctx.closePath();
    ctx.fillStyle = color + '30';
    ctx.fill();
    ctx.stroke();
  };

  // 绘制等轴测建筑
  const drawIsoBuilding = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, 
                          time: number, isTransparent: boolean = false) => {
    const floors = 30;
    const floorHeight = 8;
    const buildingWidth = 60;
    const buildingDepth = 60;
    const buildingHeight = floors * floorHeight;
    
    const startX = centerX - 200;
    const startY = centerY + 100;
    
    // 绘制每一层
    for (let floor = 0; floor < floors; floor++) {
      const y = startY;
      const z = floor * floorHeight;
      
      const alpha = isTransparent ? 0.15 : 0.3;
      const color = isTransparent ? colors.neonBlue + '30' : `rgba(30, 41, 59, ${alpha})`;
      
      drawIsoCube(ctx, startX, y, z, buildingWidth, buildingDepth, floorHeight, color);
      
      // 楼层线
      if (!isTransparent && floor % 5 === 0) {
        const top = isoTransform(startX, y, z);
        const side = isoTransform(startX + buildingWidth, y, z);
        const front = isoTransform(startX, y + buildingDepth, z);
        
        ctx.strokeStyle = colors.neonBlueDim;
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(side.x, side.y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(front.x, front.y);
        ctx.stroke();
      }
    }
    
    return { startX, startY, buildingWidth, buildingDepth, buildingHeight };
  };

  // 绘制粒子流
  const drawParticleFlow = (ctx: CanvasRenderingContext2D, path: {x: number, y: number}[], 
                           time: number, color: string = colors.neonBlue) => {
    if (path.length < 2) return;
    
    for (let i = 0; i < 20; i++) {
      const progress = ((time * 3 + i / 20) % 1);
      const segmentIndex = Math.floor(progress * (path.length - 1));
      const segmentProgress = (progress * (path.length - 1)) % 1;
      
      const p1 = path[segmentIndex];
      const p2 = path[segmentIndex + 1];
      
      const x = p1.x + (p2.x - p1.x) * segmentProgress;
      const y = p1.y + (p2.y - p1.y) * segmentProgress;
      
      // 粒子光晕
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 8);
      glow.addColorStop(0, color + 'ff');
      glow.addColorStop(0.5, color + '60');
      glow.addColorStop(1, color + '00');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // 粒子核心
      ctx.fillStyle = colors.brightWhite;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // 绘制脉冲圆环
  const drawPulseRing = (ctx: CanvasRenderingContext2D, x: number, y: number, 
                        time: number, color: string = colors.neonBlue) => {
    const pulsePhase = (time * 2) % 1;
    const radius = pulsePhase * 25;
    const alpha = 1 - pulsePhase;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 中心点
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  };

  // 绘制技术指标浮窗
  const drawTechIndicator = (ctx: CanvasRenderingContext2D, x: number, y: number, 
                            label: string, value: string, time: number) => {
    const width = 180;
    const height = 50;
    
    // 浮窗背景
    ctx.fillStyle = 'rgba(10, 22, 40, 0.9)';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    
    // 标题
    ctx.fillStyle = colors.neonBlue;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(label, x + 10, y + 18);
    
    // 数值（闪烁效果）
    const blink = Math.sin(time * 8) > 0;
    ctx.fillStyle = blink ? colors.brightWhite : colors.neonBlueDim;
    ctx.font = 'bold 14px monospace';
    ctx.fillText(value, x + 10, y + 38);
    
    // 数据流动画条
    const barY = y + 42;
    const barWidth = ((time * 10) % width);
    ctx.fillStyle = colors.neonBlueDim;
    ctx.fillRect(x + barY, barY, 5, 2);
  };

  // 绘制主场景
  const drawScene = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    ctx.clearRect(0, 0, centerX * 2, centerY * 2);
    
    // 背景
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerY);
    gradient.addColorStop(0, '#0a1628');
    gradient.addColorStop(1, '#050a14');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, centerX * 2, centerY * 2);

    // 网格背景
    ctx.strokeStyle = colors.neonBlueDim;
    ctx.lineWidth = 0.5;
    const gridSize = 30;
    for (let x = 0; x < centerX * 2; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, centerY * 2);
      ctx.stroke();
    }
    for (let y = 0; y < centerY * 2; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(centerX * 2, y);
      ctx.stroke();
    }

    const time = animationTime;

    switch (scene) {
      case 1:
        drawScene1(ctx, centerX, centerY, time);
        break;
      case 2:
        drawScene2(ctx, centerX, centerY, time);
        break;
      case 3:
        drawScene3(ctx, centerX, centerY, time);
        break;
      case 4:
        drawScene4(ctx, centerX, centerY, time);
        break;
      case 5:
        drawScene5(ctx, centerX, centerY, time);
        break;
    }
  };

  // 第一幕：传统方案痛点（等轴测3D）
  const drawScene1 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) => {
    const building = drawIsoBuilding(ctx, cx - 100, cy, time, false);
    
    // 传统水泵（红色过热效果）
    const pumpX = cx - 100 + building.buildingWidth / 2;
    const pumpY = cy + 250;
    
    // 水泵主体
    const pumpSize = 40 + Math.sin(time * 5) * 5;
    const pumpGradient = ctx.createRadialGradient(pumpX, pumpY, 0, pumpX, pumpY, pumpSize);
    pumpGradient.addColorStop(0, '#ff6666');
    pumpGradient.addColorStop(0.5, colors.warning);
    pumpGradient.addColorStop(1, '#660000');
    
    ctx.fillStyle = pumpGradient;
    ctx.beginPath();
    ctx.arc(pumpX, pumpY, pumpSize, 0, Math.PI * 2);
    ctx.fill();
    
    // 旋转叶片
    ctx.save();
    ctx.translate(pumpX, pumpY);
    ctx.rotate(time * 10);
    ctx.strokeStyle = colors.brightWhite;
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(pumpSize * 0.7, 0);
      ctx.stroke();
    }
    ctx.restore();
    
    // 过热蒸汽效果
    for (let i = 0; i < 5; i++) {
      const steamY = pumpY - pumpSize - Math.random() * 20;
      const steamSize = 5 + Math.random() * 10;
      ctx.fillStyle = `rgba(255, 100, 100, ${0.3 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(pumpX + (Math.random() - 0.5) * 20, steamY, steamSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 主立管（粗细不一，混乱效果）
    const pipeX = pumpX;
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(pipeX, pumpY - pumpSize);
    ctx.lineTo(pipeX, cy - 150);
    ctx.stroke();
    
    // 低楼层用水图标（洗澡、洗衣）
    const lowFloors = [1, 2, 3, 4, 5];
    lowFloors.forEach((floor, index) => {
      const floorY = cy + 250 - floor * 20;
      const iconX = pipeX + 50;
      
      // 图标背景
      ctx.fillStyle = colors.background;
      ctx.fillRect(iconX - 20, floorY - 20, 40, 40);
      ctx.strokeStyle = colors.neonBlue;
      ctx.lineWidth = 2;
      ctx.strokeRect(iconX - 20, floorY - 20, 40, 40);
      
      // 图标文字
      ctx.fillStyle = colors.neonBlue;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      const iconText = index % 2 === 0 ? '🚿' : '👕';
      ctx.fillText(iconText, iconX, floorY + 5);
      
      // 水管加粗
      if (time > 2) {
        ctx.strokeStyle = colors.neonBlue;
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(pipeX, floorY);
        ctx.lineTo(iconX - 20, floorY);
        ctx.stroke();
        
        // 混乱水流
        drawChaosFlow(ctx, pipeX, floorY, iconX - 20, floorY, time + index);
      }
    });
    
    // 高楼层水流（从瀑布到滴水）
    const highFloors = [20, 25, 30];
    highFloors.forEach((floor, index) => {
      const floorY = cy + 250 - floor * 20;
      const iconX = pipeX + 50;
      
      // 水管变细
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pipeX, floorY);
      ctx.lineTo(iconX - 20, floorY);
      ctx.stroke();
      
      // 滴水效果
      if (time > 3) {
        const dripY = floorY + (time * 20) % 20;
        ctx.fillStyle = colors.neonBlueDim;
        ctx.beginPath();
        ctx.arc(iconX, dripY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // 右侧震荡曲线图
    const chartX = cx + 100;
    const chartY = cy - 50;
    const chartWidth = 150;
    const chartHeight = 100;
    
    // 图表背景
    ctx.fillStyle = 'rgba(10, 22, 40, 0.9)';
    ctx.fillRect(chartX, chartY, chartWidth, chartHeight);
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 2;
    ctx.strokeRect(chartX, chartY, chartWidth, chartHeight);
    
    // 震荡曲线（红色，PID超调）
    ctx.beginPath();
    ctx.strokeStyle = colors.warning;
    ctx.lineWidth = 3;
    for (let x = 0; x < chartWidth; x++) {
      const oscillation = Math.sin((x / 10 + time * 4) * 0.8) * 35 + Math.sin((x / 5 + time * 6) * 1.5) * 15;
      const y = chartY + chartHeight / 2 + oscillation;
      if (x === 0) {
        ctx.moveTo(chartX + x, y);
      } else {
        ctx.lineTo(chartX + x, y);
      }
    }
    ctx.stroke();
    
    // 文字标注
    ctx.fillStyle = colors.warning;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('水力失衡 / 压力振荡', chartX + chartWidth / 2, chartY + chartHeight + 25);
    
    // 技术指标
    if (time > 5) {
      drawTechIndicator(ctx, cx - 200, cy - 200, '响应延迟', '2-3s', time);
      drawTechIndicator(ctx, cx + 50, cy + 100, '能耗', '145%', time);
    }
  };

  // 第二幕：DeepControl 介入
  const drawScene2 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) => {
    // 泵房特写区域
    const pumpRoomX = cx - 150;
    const pumpRoomY = cy - 100;
    const pumpRoomWidth = 300;
    const pumpRoomHeight = 200;
    
    // 泵房背景
    ctx.fillStyle = 'rgba(10, 22, 40, 0.95)';
    ctx.fillRect(pumpRoomX, pumpRoomY, pumpRoomWidth, pumpRoomHeight);
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 2;
    ctx.strokeRect(pumpRoomX, pumpRoomY, pumpRoomWidth, pumpRoomHeight);
    
    // DeepControl AIPC 设备（银灰色，呼吸灯）
    const deviceX = pumpRoomX + pumpRoomWidth / 2;
    const deviceY = pumpRoomY + pumpRoomHeight / 2;
    const deviceWidth = 80;
    const deviceHeight = 60;
    
    // 呼吸灯效果
    const breathePhase = (Math.sin(time * 2) + 1) / 2;
    const breatheGlow = ctx.createRadialGradient(deviceX, deviceY, 0, deviceX, deviceY, 60 + breathePhase * 20);
    breatheGlow.addColorStop(0, `rgba(0, 240, 255, ${0.3 + breathePhase * 0.2})`);
    breatheGlow.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = breatheGlow;
    ctx.beginPath();
    ctx.arc(deviceX, deviceY, 80, 0, Math.PI * 2);
    ctx.fill();
    
    // 设备主体
    const deviceGradient = ctx.createLinearGradient(deviceX - deviceWidth / 2, deviceY - deviceHeight / 2,
                                                    deviceX + deviceWidth / 2, deviceY + deviceHeight / 2);
    deviceGradient.addColorStop(0, '#e2e8f0');
    deviceGradient.addColorStop(0.5, '#94a3b8');
    deviceGradient.addColorStop(1, '#64748b');
    ctx.fillStyle = deviceGradient;
    ctx.fillRect(deviceX - deviceWidth / 2, deviceY - deviceHeight / 2, deviceWidth, deviceHeight);
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 2;
    ctx.strokeRect(deviceX - deviceWidth / 2, deviceY - deviceHeight / 2, deviceWidth, deviceHeight);
    
    // 呼吸灯LED
    const ledPositions = [
      {x: deviceX - 25, y: deviceY - 15},
      {x: deviceX, y: deviceY - 20},
      {x: deviceX + 25, y: deviceY - 15}
    ];
    ledPositions.forEach((pos, i) => {
      const ledPhase = ((time * 2 + i * 0.3) % 1);
      ctx.fillStyle = `rgba(0, 240, 255, ${0.5 + Math.sin(ledPhase * Math.PI * 2) * 0.5})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // 设备标签
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DeepControl', deviceX, deviceY + 5);
    ctx.font = '12px sans-serif';
    ctx.fillText('AIPC', deviceX, deviceY + 22);
    
    // 五层架构扫描（从下向上）
    const layers = [
      {name: '物理系统层', icon: '⚙️'},
      {name: '感知与执行层', icon: '📡'},
      {name: '网络传输层', icon: '🌐'},
      {name: '边缘计算层', icon: '🧠'},
      {name: '云端服务层', icon: '☁️'}
    ];
    
    const layerStartY = pumpRoomY + pumpRoomHeight + 20;
    const layerHeight = 35;
    const layerSpacing = 40;
    
    layers.forEach((layer, index) => {
      const layerY = layerStartY + index * layerSpacing;
      const scanProgress = Math.min(1, Math.max(0, (time - index * 0.5) / 0.8));
      
      if (scanProgress > 0) {
        // 透明发光板
        ctx.fillStyle = `rgba(0, 240, 255, ${0.1 + scanProgress * 0.2})`;
        ctx.fillRect(pumpRoomX, layerY, pumpRoomWidth, layerHeight);
        
        // 边框发光
        ctx.strokeStyle = `rgba(0, 240, 255, ${scanProgress})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(pumpRoomX, layerY, pumpRoomWidth, layerHeight);
        
        // 电路轨迹
        ctx.strokeStyle = colors.neonBlueDim;
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const lineY = layerY + 5 + i * 12;
          ctx.beginPath();
          ctx.moveTo(pumpRoomX + 10, lineY);
          ctx.lineTo(pumpRoomX + 30 + (scanProgress * pumpRoomWidth * 0.7), lineY);
          ctx.stroke();
        }
        
        // 图层名称
        ctx.fillStyle = colors.neonBlue;
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${layer.icon} ${layer.name}`, pumpRoomX + 15, layerY + 22);
        
        // 扫描特效
        if (scanProgress < 1) {
          const scanX = pumpRoomX + scanProgress * pumpRoomWidth;
          ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
          ctx.fillRect(scanX, layerY, 2, layerHeight);
        }
      }
    });
    
    // 传感器高亮（主管道）
    if (time > 8) {
      const sensorX = pumpRoomX + pumpRoomWidth - 50;
      const sensorY = pumpRoomY + 100;
      
      // 传感器
      drawPulseRing(ctx, sensorX, sensorY, time, colors.success);
      
      // <10ms 特效
      if (time > 10) {
        ctx.fillStyle = colors.success;
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('<10ms', sensorX, sensorY - 25);
        
        // 扫描线
        const scanWidth = ((time * 50) % 80);
        ctx.strokeStyle = colors.success;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sensorX - 40, sensorY - 15);
        ctx.lineTo(sensorX - 40 + scanWidth, sensorY - 15);
        ctx.stroke();
      }
    }
    
    // 连接线到云端
    if (time > 12) {
      ctx.strokeStyle = colors.neonBlue;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(deviceX, deviceY - 30);
      ctx.lineTo(deviceX, pumpRoomY - 30);
      ctx.lineTo(deviceX + 80, pumpRoomY - 30);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // 云端图标
      drawCloud(ctx, deviceX + 120, pumpRoomY - 30, colors.neonBlue);
    }
  };

  // 第三幕：全感知与需求检测（数字孪生）
  const drawScene3 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) => {
    // 转场：数字孪生线框模型
    const building = drawIsoBuilding(ctx, cx - 50, cy, time, true);
    
    // 绘制线框轮廓
    const startX = cx - 250;
    const startY = cy + 100;
    const buildingWidth = 60;
    const buildingDepth = 60;
    const floors = 30;
    const floorHeight = 8;
    
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 1;
    
    // 垂直线
    for (let corner of [[0, 0], [buildingWidth, 0], [0, buildingDepth], [buildingWidth, buildingDepth]]) {
      const bottom = isoTransform(startX + corner[0], startY + corner[1], 0);
      const top = isoTransform(startX + corner[0], startY + corner[1], floors * floorHeight);
      ctx.beginPath();
      ctx.moveTo(bottom.x, bottom.y);
      ctx.lineTo(top.x, top.y);
      ctx.stroke();
    }
    
    // 水管网络（数字化）
    const pipeX = cx - 50;
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 4;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(pipeX, cy + 300);
    ctx.lineTo(pipeX, cy - 180);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 传感器节点（多个）
    const sensorPositions = [
      {x: pipeX, y: cy + 200},
      {x: pipeX, y: cy + 100},
      {x: pipeX, y: cy},
      {x: pipeX, y: cy - 100}
    ];
    
    sensorPositions.forEach((pos, index) => {
      // 脉冲效果
      const pulsePhase = ((time * 2 + index * 0.5) % 1);
      
      // 外圈
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 15 + pulsePhase * 15, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 240, 255, ${1 - pulsePhase})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 内圈
      ctx.fillStyle = colors.neonBlue;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // 数据脉冲流（向AIPC发送）
      if (time > 2) {
        const pulseX = pos.x + ((time * 100 + index * 30) % 100);
        const pulseY = pos.y;
        
        ctx.fillStyle = colors.neonBlue;
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 轨迹
        ctx.strokeStyle = colors.neonBlueDim;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pos.x + 6, pos.y);
        ctx.lineTo(pulseX, pulseY);
        ctx.stroke();
      }
    });
    
    // AIPC 边缘计算中心
    const aipcX = cx + 100;
    const aipcY = cy;
    
    // 设备发光
    const aipcGlow = ctx.createRadialGradient(aipcX, aipcY, 0, aipcX, aipcY, 50);
    aipcGlow.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
    aipcGlow.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = aipcGlow;
    ctx.beginPath();
    ctx.arc(aipcX, aipcY, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // 设备
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(aipcX - 30, aipcY - 25, 60, 50);
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 2;
    ctx.strokeRect(aipcX - 30, aipcY - 25, 60, 50);
    
    ctx.fillStyle = colors.neonBlue;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AIPC', aipcX, aipcY + 5);
    
    // 实时仪表盘（半透明）
    if (time > 5) {
      const dashboardX = cx + 180;
      const dashboardY = cy - 80;
      const dashboardWidth = 140;
      const dashboardHeight = 160;
      
      ctx.fillStyle = 'rgba(10, 22, 40, 0.9)';
      ctx.fillRect(dashboardX, dashboardY, dashboardWidth, dashboardHeight);
      ctx.strokeStyle = colors.neonBlue;
      ctx.lineWidth = 1;
      ctx.strokeRect(dashboardX, dashboardY, dashboardWidth, dashboardHeight);
      
      // 数据项
      const dataItems = [
        {label: 'Pressure', unit: 'MPa', base: 0.8, vary: 0.1},
        {label: 'Vibration', unit: 'Hz', base: 120, vary: 20},
        {label: 'Power', unit: 'kW', base: 4.2, vary: 0.5},
        {label: 'Flow', unit: 'L/min', base: 150, vary: 30}
      ];
      
      dataItems.forEach((item, index) => {
        const itemY = dashboardY + 25 + index * 35;
        const value = item.base + Math.sin(time * 2 + index) * item.vary;
        
        ctx.fillStyle = colors.neonBlue;
        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(item.label, dashboardX + 10, itemY);
        
        ctx.fillStyle = colors.brightWhite;
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${value.toFixed(2)} ${item.unit}`, dashboardX + dashboardWidth - 10, itemY);
        
        // 数据条
        const barWidth = (value / (item.base + item.vary)) * (dashboardWidth - 20);
        ctx.fillStyle = colors.neonBlueDim;
        ctx.fillRect(dashboardX + 10, itemY + 5, barWidth, 3);
      });
    }
    
    // 技术指标
    drawTechIndicator(ctx, cx - 250, cy - 200, '采样频率', '100Hz', time);
  };

  // 第四幕：MPC智能决策（左右对比）
  const drawScene4 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) => {
    // 中央MPC脑图
    const brainX = cx;
    const brainY = cy;
    
    // 外围光晕
    const brainGlow = ctx.createRadialGradient(brainX, brainY, 0, brainX, brainY, 80);
    brainGlow.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
    brainGlow.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = brainGlow;
    ctx.beginPath();
    ctx.arc(brainX, brainY, 80, 0, Math.PI * 2);
    ctx.fill();
    
    // 脑图主体
    ctx.fillStyle = '#0a1628';
    ctx.beginPath();
    ctx.arc(brainX, brainY, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 神经网络线条
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const innerR = 30;
      const outerR = 45;
      ctx.beginPath();
      ctx.moveTo(brainX + Math.cos(angle) * innerR, brainY + Math.sin(angle) * innerR);
      ctx.lineTo(brainX + Math.cos(angle + 0.3) * outerR, brainY + Math.sin(angle + 0.3) * outerR);
      ctx.strokeStyle = colors.neonBlue;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // MPC文字
    ctx.fillStyle = colors.neonBlue;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MPC', brainX, brainY + 7);
    
    // 左右对比区域
    const leftChartX = cx - 220;
    const rightChartX = cx + 70;
    const chartWidth = 120;
    const chartHeight = 100;
    const chartY = cy + 100;
    
    // 左侧：传统PID
    drawChartBox(ctx, leftChartX, chartY, chartWidth, chartHeight, 'PID (振荡)', colors.warning, time, false);
    
    // 右侧：MPC
    drawChartBox(ctx, rightChartX, chartY, chartWidth, chartHeight, 'MPC (平滑)', colors.success, time, true);
    
    // 阀门协同演示
    if (time > 8) {
      const valveY = cy - 120;
      const valvePositions = [cx - 100, cx, cx + 100];
      const valveAngles = [15, 42, 80];
      
      ctx.fillStyle = colors.neonBlue;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('多变量协同控制', cx, valveY - 50);
      
      valvePositions.forEach((vx, index) => {
        const angle = valveAngles[index];
        
        // 阀门图标
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(vx, valveY, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colors.neonBlue;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 开启角度指示
        ctx.fillStyle = colors.neonBlue;
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`${angle}%`, vx, valveY + 5);
        
        // 开启程度条
        ctx.fillStyle = colors.neonBlueDim;
        ctx.fillRect(vx - 20, valveY + 35, 40, 5);
        ctx.fillStyle = colors.neonBlue;
        ctx.fillRect(vx - 20, valveY + 35, 40 * (angle / 100), 5);
      });
    }
    
    // 算法逻辑标注
    if (time > 10) {
      ctx.fillStyle = colors.neonBlue;
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('基于多变量约束的 Model Predictive Control', cx, cy - 180);
    }
  };

  // 第五幕：价值与结尾
  const drawScene5 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) => {
    // 建筑（所有楼层用水一致）
    const building = drawIsoBuilding(ctx, cx - 50, cy, time, false);
    
    // 主水管（匀称发光粒子流）
    const pipeX = cx - 50;
    
    // 粒子流路径
    const pipePath: {x: number, y: number}[] = [];
    for (let y = cy + 300; y >= cy - 180; y -= 10) {
      pipePath.push({x: pipeX, y: y});
    }
    
    drawParticleFlow(ctx, pipePath, time, colors.neonBlue);
    
    // 所有楼层均匀用水
    for (let floor = 1; floor <= 30; floor++) {
      if (floor % 3 !== 0) continue; // 每3层显示一个
      
      const floorY = cy + 300 - floor * 10;
      const outletX = pipeX + 30;
      
      // 出水点
      ctx.fillStyle = colors.neonBlue;
      ctx.beginPath();
      ctx.arc(outletX, floorY, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // 均匀水流（蓝色粒子）
      const flowProgress = ((time * 3 + floor * 0.1) % 1);
      const flowX = outletX + flowProgress * 40;
      ctx.fillStyle = colors.neonBlue;
      ctx.beginPath();
      ctx.arc(flowX, floorY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 能耗对比（倒计时）
    const energyX = cx + 120;
    const energyY = cy - 80;
    const energyWidth = 100;
    const energyHeight = 120;
    
    ctx.fillStyle = 'rgba(10, 22, 40, 0.9)';
    ctx.fillRect(energyX, energyY, energyWidth, energyHeight);
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 2;
    ctx.strokeRect(energyX, energyY, energyWidth, energyHeight);
    
    ctx.fillStyle = colors.brightWhite;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('能耗对比', energyX + energyWidth / 2, energyY + 20);
    
    // 传统方案（100%）
    ctx.fillStyle = colors.warning;
    ctx.fillRect(energyX + 20, energyY + 35, energyWidth - 40, 30);
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.fillText('100%', energyX + energyWidth / 2, energyY + 55);
    
    // DeepControl（倒计时效果）
    const energyProgress = Math.min(1, Math.max(0, (time - 3) / 3));
    const currentEnergy = 100 - energyProgress * 45;
    
    ctx.fillStyle = colors.success;
    const barHeight = 30 * (currentEnergy / 100);
    const barY = energyY + 85 - (30 - barHeight);
    ctx.fillRect(energyX + 20, barY, energyWidth - 40, barHeight);
    ctx.fillStyle = '#fff';
    ctx.fillText(`${Math.round(currentEnergy)}%`, energyX + energyWidth / 2, energyY + 105);
    
    // 曲线抹平效果
    const curveX = cx - 180;
    const curveY = cy + 100;
    const curveWidth = 120;
    const curveHeight = 80;
    
    ctx.fillStyle = 'rgba(10, 22, 40, 0.9)';
    ctx.fillRect(curveX, curveY, curveWidth, curveHeight);
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 2;
    ctx.strokeRect(curveX, curveY, curveWidth, curveHeight);
    
    ctx.fillStyle = colors.brightWhite;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('压力平稳度', curveX + curveWidth / 2, curveY + 20);
    
    // 平滑带状曲线
    ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.fillRect(curveX + 10, curveY + 45, curveWidth - 20, 15);
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 2;
    ctx.strokeRect(curveX + 10, curveY + 45, curveWidth - 20, 15);
    
    // Slogan弹出
    if (time > 10) {
      const sloganY = cy - 150;
      const sloganScale = Math.min(1, (time - 10) / 0.5);
      
      ctx.save();
      ctx.translate(cx, sloganY);
      ctx.scale(sloganScale, sloganScale);
      
      // 背景板
      ctx.fillStyle = 'rgba(10, 22, 40, 0.95)';
      ctx.fillRect(-200, -30, 400, 60);
      ctx.strokeStyle = colors.neonBlue;
      ctx.lineWidth = 3;
      ctx.strokeRect(-200, -30, 400, 60);
      
      // Slogan文字
      ctx.fillStyle = colors.neonBlue;
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DeepControl AIPC', 0, -5);
      ctx.fillStyle = colors.brightWhite;
      ctx.font = '16px sans-serif';
      ctx.fillText('—— "让每一滴水都更聪明"', 0, 20);
      
      ctx.restore();
    }
    
    // 技术指标
    drawTechIndicator(ctx, cx - 200, cy + 200, '系统响应', '<1s', time);
    drawTechIndicator(ctx, cx + 50, cy + 200, '节能收益', '45%', time);
  };

  // 辅助函数：绘制图表框
  const drawChartBox = (ctx: CanvasRenderingContext2D, x: number, y: number, 
                       width: number, height: number, title: string, 
                       color: string, time: number, isSmooth: boolean) => {
    ctx.fillStyle = 'rgba(10, 22, 40, 0.9)';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    ctx.fillStyle = color;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, x + width / 2, y + 20);
    
    // 曲线
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let px = 0; px < width; px++) {
      let py;
      if (isSmooth) {
        // 平滑曲线
        const smooth = Math.sin((px / 20 + time * 1.5) * 0.3) * 15;
        py = y + height / 2 + smooth;
        
        // 预测路径（虚线）
        if (px > width * 0.7) {
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = color + '80';
        } else {
          ctx.setLineDash([]);
          ctx.strokeStyle = color;
        }
      } else {
        // 振荡曲线
        const oscillation = Math.sin((px / 8 + time * 4) * 0.8) * 25 + Math.sin((px / 4 + time * 6) * 1.2) * 10;
        py = y + height / 2 + oscillation;
        ctx.setLineDash([]);
        ctx.strokeStyle = color;
      }
      
      if (px === 0) {
        ctx.moveTo(x + px, py);
      } else {
        ctx.lineTo(x + px, py);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // 辅助函数：绘制混乱水流
  const drawChaosFlow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, 
                        x2: number, y2: number, time: number) => {
    const segments = 10;
    ctx.beginPath();
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 2;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t + Math.sin(time * 10 + i * 0.5) * 5;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  };

  // 辅助函数：绘制云
  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.fillStyle = color + '40';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 5, 15, 0, Math.PI * 2);
    ctx.arc(x + 45, y, 18, 0, Math.PI * 2);
    ctx.arc(x + 25, y + 10, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
