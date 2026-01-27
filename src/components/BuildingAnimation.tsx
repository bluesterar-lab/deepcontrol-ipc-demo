'use client';

import { useRef, useEffect } from 'react';

interface BuildingAnimationProps {
  scene: number;
}

// 颜色配置
const colors = {
  background: '#0a1628',
  neonBlue: '#00f0ff',
  neonBlueDim: 'rgba(0, 240, 255, 0.3)',
  brightWhite: '#ffffff',
  warning: '#ff4444',
  success: '#00ff88',
  cyan: '#00d4ff',
  purple: '#a855f7',
  orange: '#ff9900'
} as const;

// 等轴测投影转换
const isoTransform = (x: number, y: number, z: number) => {
  const isoX = (x - y) * Math.cos(Math.PI / 6);
  const isoY = (x + y) * Math.sin(Math.PI / 6) - z;
  return { x: isoX, y: isoY };
};

export default function BuildingAnimation({ scene }: BuildingAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const animationTimeRef = useRef<number>(0);
  const sceneRef = useRef<number>(scene);
  
  // 全局缩放因子 - 适中大小
  const scale = 2.0;
  
  // 检测场景变化
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
      
      animationTimeRef.current += deltaTime * 0.001;
      
      drawScene(ctx, canvasWidth, canvasHeight, animationTimeRef.current, scale);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

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
    
    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(side.x, side.y);
    ctx.lineTo(isoTransform(x + width, y, z - height).x, isoTransform(x + width, y, z - height).y);
    ctx.lineTo(frontTop.x, frontTop.y);
    ctx.closePath();
    ctx.fillStyle = color + '40';
    ctx.fill();
    ctx.stroke();
    
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
    const floorHeight = 12 * scale;
    const buildingWidth = 90 * scale;
    const buildingDepth = 90 * scale;
    const buildingHeight = floors * floorHeight;
    
    const startX = centerX - 300 * scale;
    const startY = centerY + 150 * scale;
    
    for (let floor = 0; floor < floors; floor++) {
      const y = startY;
      const z = floor * floorHeight;
      
      const alpha = isTransparent ? 0.15 : 0.3;
      const color = isTransparent ? colors.neonBlue + '30' : `rgba(30, 41, 59, ${alpha})`;
      
      drawIsoCube(ctx, startX, y, z, buildingWidth, buildingDepth, floorHeight, color);
      
      if (!isTransparent && floor % 5 === 0) {
        const top = isoTransform(startX, y, z);
        const side = isoTransform(startX + buildingWidth, y, z);
        const front = isoTransform(startX, y + buildingDepth, z);
        
        ctx.strokeStyle = colors.neonBlueDim;
        ctx.lineWidth = 1.5;
        
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
      
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 12 * scale);
      glow.addColorStop(0, color + 'ff');
      glow.addColorStop(0.5, color + '60');
      glow.addColorStop(1, color + '00');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 12 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = colors.brightWhite;
      ctx.beginPath();
      ctx.arc(x, y, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // 绘制脉冲圆环
  const drawPulseRing = (ctx: CanvasRenderingContext2D, x: number, y: number, 
                        time: number, color: string = colors.neonBlue) => {
    const pulsePhase = (time * 2) % 1;
    const radius = pulsePhase * 35 * scale;
    const alpha = 1 - pulsePhase;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 6 * scale, 0, Math.PI * 2);
    ctx.fill();
  };

  // 绘制技术指标浮窗
  const drawTechIndicator = (ctx: CanvasRenderingContext2D, x: number, y: number, 
                            label: string, value: string, time: number) => {
    const width = 220 * scale;
    const height = 60 * scale;
    
    ctx.fillStyle = 'rgba(10, 22, 40, 0.9)';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    ctx.fillStyle = colors.neonBlue;
    ctx.font = `bold ${14 * scale}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(label, x + 15 * scale, y + 22 * scale);
    
    const blink = Math.sin(time * 8) > 0;
    ctx.fillStyle = blink ? colors.brightWhite : colors.neonBlueDim;
    ctx.font = `bold ${16 * scale}px monospace`;
    ctx.fillText(value, x + 15 * scale, y + 45 * scale);
  };

  // 绘制主场景
  const drawScene = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number, scale: number) => {
    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 背景
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerY);
    gradient.addColorStop(0, '#0a1628');
    gradient.addColorStop(1, '#050a14');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 网格背景
    ctx.strokeStyle = colors.neonBlueDim;
    ctx.lineWidth = 0.5;
    const gridSize = 40 * scale;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    switch (sceneRef.current) {
      case 1:
        drawScene1(ctx, centerX, centerY, time, scale);
        break;
      case 2:
        drawScene2(ctx, centerX, centerY, time, scale);
        break;
      case 3:
        drawScene3(ctx, centerX, centerY, time, scale);
        break;
      case 4:
        drawScene4(ctx, centerX, centerY, time, scale);
        break;
      case 5:
        drawScene5(ctx, centerX, centerY, time, scale);
        break;
    }
  };

  // 第一幕
  const drawScene1 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number, scale: number) => {
    const building = drawIsoBuilding(ctx, cx - 150 * scale, cy, time, false);
    
    const pumpX = cx - 150 * scale + building.buildingWidth / 2;
    const pumpY = cy + 350 * scale;
    
    const pumpSize = 60 * scale + Math.sin(time * 5) * 10 * scale;
    const pumpGradient = ctx.createRadialGradient(pumpX, pumpY, 0, pumpX, pumpY, pumpSize);
    pumpGradient.addColorStop(0, '#ff6666');
    pumpGradient.addColorStop(0.5, colors.warning);
    pumpGradient.addColorStop(1, '#660000');
    
    ctx.fillStyle = pumpGradient;
    ctx.beginPath();
    ctx.arc(pumpX, pumpY, pumpSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.save();
    ctx.translate(pumpX, pumpY);
    ctx.rotate(time * 10);
    ctx.strokeStyle = colors.brightWhite;
    ctx.lineWidth = 4 * scale;
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(pumpSize * 0.7, 0);
      ctx.stroke();
    }
    ctx.restore();
    
    const pipeX = pumpX;
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 12 * scale;
    ctx.beginPath();
    ctx.moveTo(pipeX, pumpY - pumpSize);
    ctx.lineTo(pipeX, cy - 200 * scale);
    ctx.stroke();
    
    const lowFloors = [1, 2, 3, 4, 5];
    lowFloors.forEach((floor, index) => {
      const floorY = cy + 350 * scale - floor * 30 * scale;
      const iconX = pipeX + 75 * scale;
      
      ctx.fillStyle = colors.background;
      ctx.fillRect(iconX - 30 * scale, floorY - 30 * scale, 60 * scale, 60 * scale);
      ctx.strokeStyle = colors.neonBlue;
      ctx.lineWidth = 3 * scale;
      ctx.strokeRect(iconX - 30 * scale, floorY - 30 * scale, 60 * scale, 60 * scale);
      
      ctx.fillStyle = colors.neonBlue;
      ctx.font = `bold ${20 * scale}px sans-serif`;
      ctx.textAlign = 'center';
      const iconText = index % 2 === 0 ? '🚿' : '👕';
      ctx.fillText(iconText, iconX, floorY + 8 * scale);
      
      if (time > 2) {
        ctx.strokeStyle = colors.neonBlue;
        ctx.lineWidth = 18 * scale;
        ctx.beginPath();
        ctx.moveTo(pipeX, floorY);
        ctx.lineTo(iconX - 30 * scale, floorY);
        ctx.stroke();
        
        drawChaosFlow(ctx, pipeX, floorY, iconX - 30 * scale, floorY, time + index, scale);
      }
    });
    
    const highFloors = [20, 25, 30];
    highFloors.forEach((floor) => {
      const floorY = cy + 350 * scale - floor * 30 * scale;
      const iconX = pipeX + 75 * scale;
      
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(pipeX, floorY);
      ctx.lineTo(iconX - 30 * scale, floorY);
      ctx.stroke();
      
      if (time > 3) {
        const dripY = floorY + (time * 25 * scale) % 30 * scale;
        ctx.fillStyle = colors.neonBlueDim;
        ctx.beginPath();
        ctx.arc(iconX, dripY, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    const chartX = cx + 150 * scale;
    const chartY = cy - 80 * scale;
    const chartWidth = 220 * scale;
    const chartHeight = 150 * scale;
    
    ctx.fillStyle = 'rgba(10, 22, 40, 0.9)';
    ctx.fillRect(chartX, chartY, chartWidth, chartHeight);
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 3 * scale;
    ctx.strokeRect(chartX, chartY, chartWidth, chartHeight);
    
    ctx.beginPath();
    ctx.strokeStyle = colors.warning;
    ctx.lineWidth = 4 * scale;
    for (let x = 0; x < chartWidth; x++) {
      const oscillation = Math.sin((x / 10 + time * 4) * 0.8) * 50 * scale + Math.sin((x / 5 + time * 6) * 1.5) * 20 * scale;
      const y = chartY + chartHeight / 2 + oscillation;
      if (x === 0) {
        ctx.moveTo(chartX + x, y);
      } else {
        ctx.lineTo(chartX + x, y);
      }
    }
    ctx.stroke();
    
    ctx.fillStyle = colors.warning;
    ctx.font = `bold ${18 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('水力失衡 / 压力振荡', chartX + chartWidth / 2, chartY + chartHeight + 35 * scale);
    
    if (time > 5) {
      drawTechIndicator(ctx, cx - 300 * scale, cy - 300 * scale, '响应延迟', '2-3s', time);
      drawTechIndicator(ctx, cx + 75 * scale, cy + 150 * scale, '能耗', '145%', time);
    }
  };

  // 第二幕
  const drawScene2 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number, scale: number) => {
    const pumpRoomX = cx - 220 * scale;
    const pumpRoomY = cy - 150 * scale;
    const pumpRoomWidth = 450 * scale;
    const pumpRoomHeight = 300 * scale;
    
    ctx.fillStyle = 'rgba(10, 22, 40, 0.95)';
    ctx.fillRect(pumpRoomX, pumpRoomY, pumpRoomWidth, pumpRoomHeight);
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 3 * scale;
    ctx.strokeRect(pumpRoomX, pumpRoomY, pumpRoomWidth, pumpRoomHeight);
    
    const deviceX = pumpRoomX + pumpRoomWidth / 2;
    const deviceY = pumpRoomY + pumpRoomHeight / 2;
    const deviceWidth = 120 * scale;
    const deviceHeight = 90 * scale;
    
    const breathePhase = (Math.sin(time * 2) + 1) / 2;
    const breatheGlow = ctx.createRadialGradient(deviceX, deviceY, 0, deviceX, deviceY, 90 * scale + breathePhase * 30 * scale);
    breatheGlow.addColorStop(0, `rgba(0, 240, 255, ${0.3 + breathePhase * 0.2})`);
    breatheGlow.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = breatheGlow;
    ctx.beginPath();
    ctx.arc(deviceX, deviceY, 120 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    const deviceGradient = ctx.createLinearGradient(deviceX - deviceWidth / 2, deviceY - deviceHeight / 2,
                                                    deviceX + deviceWidth / 2, deviceY + deviceHeight / 2);
    deviceGradient.addColorStop(0, '#e2e8f0');
    deviceGradient.addColorStop(0.5, '#94a3b8');
    deviceGradient.addColorStop(1, '#64748b');
    ctx.fillStyle = deviceGradient;
    ctx.fillRect(deviceX - deviceWidth / 2, deviceY - deviceHeight / 2, deviceWidth, deviceHeight);
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 3 * scale;
    ctx.strokeRect(deviceX - deviceWidth / 2, deviceY - deviceHeight / 2, deviceWidth, deviceHeight);
    
    const ledPositions = [
      {x: deviceX - 35 * scale, y: deviceY - 20 * scale},
      {x: deviceX, y: deviceY - 30 * scale},
      {x: deviceX + 35 * scale, y: deviceY - 20 * scale}
    ];
    ledPositions.forEach((pos, i) => {
      const ledPhase = ((time * 2 + i * 0.3) % 1);
      ctx.fillStyle = `rgba(0, 240, 255, ${0.5 + Math.sin(ledPhase * Math.PI * 2) * 0.5})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 6 * scale, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${20 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('DeepControl', deviceX, deviceY + 8 * scale);
    ctx.font = `${16 * scale}px sans-serif`;
    ctx.fillText('AIPC', deviceX, deviceY + 33 * scale);
    
    const layers = [
      {name: '物理系统层', icon: '⚙️'},
      {name: '感知与执行层', icon: '📡'},
      {name: '网络传输层', icon: '🌐'},
      {name: '边缘计算层', icon: '🧠'},
      {name: '云端服务层', icon: '☁️'}
    ];
    
    const layerStartY = pumpRoomY + pumpRoomHeight + 30 * scale;
    const layerHeight = 50 * scale;
    const layerSpacing = 60 * scale;
    
    layers.forEach((layer, index) => {
      const layerY = layerStartY + index * layerSpacing;
      const scanProgress = Math.min(1, Math.max(0, (time - index * 0.5) / 0.8));
      
      if (scanProgress > 0) {
        ctx.fillStyle = `rgba(0, 240, 255, ${0.1 + scanProgress * 0.2})`;
        ctx.fillRect(pumpRoomX, layerY, pumpRoomWidth, layerHeight);
        ctx.strokeStyle = `rgba(0, 240, 255, ${scanProgress})`;
        ctx.lineWidth = 3 * scale;
        ctx.strokeRect(pumpRoomX, layerY, pumpRoomWidth, layerHeight);
        
        ctx.strokeStyle = colors.neonBlueDim;
        ctx.lineWidth = 1.5 * scale;
        for (let i = 0; i < 3; i++) {
          const lineY = layerY + 8 * scale + i * 18 * scale;
          ctx.beginPath();
          ctx.moveTo(pumpRoomX + 15 * scale, lineY);
          ctx.lineTo(pumpRoomX + 45 * scale + (scanProgress * pumpRoomWidth * 0.7), lineY);
          ctx.stroke();
        }
        
        ctx.fillStyle = colors.neonBlue;
        ctx.font = `bold ${16 * scale}px sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(`${layer.icon} ${layer.name}`, pumpRoomX + 20 * scale, layerY + 30 * scale);
        
        if (scanProgress < 1) {
          const scanX = pumpRoomX + scanProgress * pumpRoomWidth;
          ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
          ctx.fillRect(scanX, layerY, 3 * scale, layerHeight);
        }
      }
    });
    
    if (time > 8) {
      const sensorX = pumpRoomX + pumpRoomWidth - 75 * scale;
      const sensorY = pumpRoomY + 150 * scale;
      
      drawPulseRing(ctx, sensorX, sensorY, time, colors.success);
      
      if (time > 10) {
        ctx.fillStyle = colors.success;
        ctx.font = `bold ${22 * scale}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('<10ms', sensorX, sensorY - 35 * scale);
        
        const scanWidth = ((time * 50 * scale) % 120 * scale);
        ctx.strokeStyle = colors.success;
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(sensorX - 60 * scale, sensorY - 20 * scale);
        ctx.lineTo(sensorX - 60 * scale + scanWidth, sensorY - 20 * scale);
        ctx.stroke();
      }
    }
    
    if (time > 12) {
      ctx.strokeStyle = colors.neonBlue;
      ctx.lineWidth = 3 * scale;
      ctx.setLineDash([8 * scale, 8 * scale]);
      ctx.beginPath();
      ctx.moveTo(deviceX, deviceY - 45 * scale);
      ctx.lineTo(deviceX, pumpRoomY - 45 * scale);
      ctx.lineTo(deviceX + 120 * scale, pumpRoomY - 45 * scale);
      ctx.stroke();
      ctx.setLineDash([]);
      
      drawCloud(ctx, deviceX + 180 * scale, pumpRoomY - 45 * scale, colors.neonBlue, scale);
    }
  };

  // 第三幕
  const drawScene3 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number, scale: number) => {
    const building = drawIsoBuilding(ctx, cx - 75 * scale, cy, time, true);
    
    const startX = cx - 375 * scale;
    const startY = cy + 150 * scale;
    const buildingWidth = 90 * scale;
    const buildingDepth = 90 * scale;
    const floors = 30;
    const floorHeight = 12 * scale;
    
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 1.5 * scale;
    
    for (let corner of [[0, 0], [buildingWidth, 0], [0, buildingDepth], [buildingWidth, buildingDepth]]) {
      const bottom = isoTransform(startX + corner[0], startY + corner[1], 0);
      const top = isoTransform(startX + corner[0], startY + corner[1], floors * floorHeight);
      ctx.beginPath();
      ctx.moveTo(bottom.x, bottom.y);
      ctx.lineTo(top.x, top.y);
      ctx.stroke();
    }
    
    const pipeX = cx - 75 * scale;
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 6 * scale;
    ctx.setLineDash([3 * scale, 3 * scale]);
    ctx.beginPath();
    ctx.moveTo(pipeX, cy + 450 * scale);
    ctx.lineTo(pipeX, cy - 270 * scale);
    ctx.stroke();
    ctx.setLineDash([]);
    
    const sensorPositions = [
      {x: pipeX, y: cy + 300 * scale},
      {x: pipeX, y: cy + 150 * scale},
      {x: pipeX, y: cy},
      {x: pipeX, y: cy - 150 * scale}
    ];
    
    sensorPositions.forEach((pos, index) => {
      const pulsePhase = ((time * 2 + index * 0.5) % 1);
      
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 20 * scale + pulsePhase * 20 * scale, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 240, 255, ${1 - pulsePhase})`;
      ctx.lineWidth = 3 * scale;
      ctx.stroke();
      
      ctx.fillStyle = colors.neonBlue;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      if (time > 2) {
        const pulseX = pos.x + ((time * 150 * scale + index * 45 * scale) % 150 * scale);
        const pulseY = pos.y;
        
        ctx.fillStyle = colors.neonBlue;
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = colors.neonBlueDim;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(pos.x + 8 * scale, pos.y);
        ctx.lineTo(pulseX, pulseY);
        ctx.stroke();
      }
    });
    
    const aipcX = cx + 150 * scale;
    const aipcY = cy;
    
    const aipcGlow = ctx.createRadialGradient(aipcX, aipcY, 0, aipcX, aipcY, 75 * scale);
    aipcGlow.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
    aipcGlow.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = aipcGlow;
    ctx.beginPath();
    ctx.arc(aipcX, aipcY, 75 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(aipcX - 45 * scale, aipcY - 35 * scale, 90 * scale, 70 * scale);
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 3 * scale;
    ctx.strokeRect(aipcX - 45 * scale, aipcY - 35 * scale, 90 * scale, 70 * scale);
    
    ctx.fillStyle = colors.neonBlue;
    ctx.font = `bold ${18 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('AIPC', aipcX, aipcY + 8 * scale);
    
    if (time > 5) {
      const dashboardX = cx + 270 * scale;
      const dashboardY = cy - 120 * scale;
      const dashboardWidth = 210 * scale;
      const dashboardHeight = 240 * scale;
      
      ctx.fillStyle = 'rgba(10, 22, 40, 0.9)';
      ctx.fillRect(dashboardX, dashboardY, dashboardWidth, dashboardHeight);
      ctx.strokeStyle = colors.neonBlue;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(dashboardX, dashboardY, dashboardWidth, dashboardHeight);
      
      const dataItems = [
        {label: 'Pressure', unit: 'MPa', base: 0.8, vary: 0.1},
        {label: 'Vibration', unit: 'Hz', base: 120, vary: 20},
        {label: 'Power', unit: 'kW', base: 4.2, vary: 0.5},
        {label: 'Flow', unit: 'L/min', base: 150, vary: 30}
      ];
      
      dataItems.forEach((item, index) => {
        const itemY = dashboardY + 35 * scale + index * 50 * scale;
        const value = item.base + Math.sin(time * 2 + index) * item.vary;
        
        ctx.fillStyle = colors.neonBlue;
        ctx.font = `${14 * scale}px monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(item.label, dashboardX + 15 * scale, itemY);
        
        ctx.fillStyle = colors.brightWhite;
        ctx.font = `bold ${18 * scale}px monospace`;
        ctx.textAlign = 'right';
        ctx.fillText(`${value.toFixed(2)} ${item.unit}`, dashboardX + dashboardWidth - 15 * scale, itemY);
        
        const barWidth = (value / (item.base + item.vary)) * (dashboardWidth - 30 * scale);
        ctx.fillStyle = colors.neonBlueDim;
        ctx.fillRect(dashboardX + 15 * scale, itemY + 8 * scale, barWidth, 5 * scale);
      });
    }
    
    drawTechIndicator(ctx, cx - 375 * scale, cy - 300 * scale, '采样频率', '100Hz', time);
  };

  // 第四幕
  const drawScene4 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number, scale: number) => {
    const brainX = cx;
    const brainY = cy;
    
    const brainGlow = ctx.createRadialGradient(brainX, brainY, 0, brainX, brainY, 120 * scale);
    brainGlow.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
    brainGlow.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = brainGlow;
    ctx.beginPath();
    ctx.arc(brainX, brainY, 120 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#0a1628';
    ctx.beginPath();
    ctx.arc(brainX, brainY, 75 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 4 * scale;
    ctx.stroke();
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const innerR = 45 * scale;
      const outerR = 65 * scale;
      ctx.beginPath();
      ctx.moveTo(brainX + Math.cos(angle) * innerR, brainY + Math.sin(angle) * innerR);
      ctx.lineTo(brainX + Math.cos(angle + 0.3) * outerR, brainY + Math.sin(angle + 0.3) * outerR);
      ctx.strokeStyle = colors.neonBlue;
      ctx.lineWidth = 3 * scale;
      ctx.stroke();
    }
    
    ctx.fillStyle = colors.neonBlue;
    ctx.font = `bold ${28 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('MPC', brainX, brainY + 10 * scale);
    
    const leftChartX = cx - 330 * scale;
    const rightChartX = cx + 105 * scale;
    const chartWidth = 180 * scale;
    const chartHeight = 150 * scale;
    const chartY = cy + 150 * scale;
    
    drawChartBox(ctx, leftChartX, chartY, chartWidth, chartHeight, 'PID (振荡)', colors.warning, time, false, scale);
    drawChartBox(ctx, rightChartX, chartY, chartWidth, chartHeight, 'MPC (平滑)', colors.success, time, true, scale);
    
    if (time > 8) {
      const valveY = cy - 180 * scale;
      const valvePositions = [cx - 150 * scale, cx, cx + 150 * scale];
      const valveAngles = [15, 42, 80];
      
      ctx.fillStyle = colors.neonBlue;
      ctx.font = `bold ${20 * scale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('多变量协同控制', cx, valveY - 75 * scale);
      
      valvePositions.forEach((vx, index) => {
        const angle = valveAngles[index];
        
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(vx, valveY, 35 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colors.neonBlue;
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        ctx.fillStyle = colors.neonBlue;
        ctx.font = `bold ${20 * scale}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`${angle}%`, vx, valveY + 8 * scale);
        
        ctx.fillStyle = colors.neonBlueDim;
        ctx.fillRect(vx - 30 * scale, valveY + 50 * scale, 60 * scale, 8 * scale);
        ctx.fillStyle = colors.neonBlue;
        ctx.fillRect(vx - 30 * scale, valveY + 50 * scale, 60 * scale * (angle / 100), 8 * scale);
      });
    }
    
    if (time > 10) {
      ctx.fillStyle = colors.neonBlue;
      ctx.font = `${16 * scale}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('基于多变量约束的 Model Predictive Control', cx, cy - 270 * scale);
    }
  };

  // 第五幕
  const drawScene5 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number, scale: number) => {
    const building = drawIsoBuilding(ctx, cx - 75 * scale, cy, time, false);
    
    const pipeX = cx - 75 * scale;
    
    const pipePath: {x: number, y: number}[] = [];
    for (let y = cy + 450 * scale; y >= cy - 270 * scale; y -= 15 * scale) {
      pipePath.push({x: pipeX, y: y});
    }
    
    drawParticleFlow(ctx, pipePath, time, colors.neonBlue);
    
    for (let floor = 1; floor <= 30; floor++) {
      if (floor % 3 !== 0) continue;
      
      const floorY = cy + 450 * scale - floor * 15 * scale;
      const outletX = pipeX + 45 * scale;
      
      ctx.fillStyle = colors.neonBlue;
      ctx.beginPath();
      ctx.arc(outletX, floorY, 5 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      const flowProgress = ((time * 3 + floor * 0.1) % 1);
      const flowX = outletX + flowProgress * 60 * scale;
      ctx.fillStyle = colors.neonBlue;
      ctx.beginPath();
      ctx.arc(flowX, floorY, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const energyX = cx + 180 * scale;
    const energyY = cy - 120 * scale;
    const energyWidth = 150 * scale;
    const energyHeight = 180 * scale;
    
    ctx.fillStyle = 'rgba(10, 22, 40, 0.9)';
    ctx.fillRect(energyX, energyY, energyWidth, energyHeight);
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 3 * scale;
    ctx.strokeRect(energyX, energyY, energyWidth, energyHeight);
    
    ctx.fillStyle = colors.brightWhite;
    ctx.font = `bold ${20 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('能耗对比', energyX + energyWidth / 2, energyY + 30 * scale);
    
    ctx.fillStyle = colors.warning;
    ctx.fillRect(energyX + 30 * scale, energyY + 50 * scale, energyWidth - 60 * scale, 45 * scale);
    ctx.fillStyle = '#fff';
    ctx.font = `${16 * scale}px monospace`;
    ctx.fillText('100%', energyX + energyWidth / 2, energyY + 80 * scale);
    
    const energyProgress = Math.min(1, Math.max(0, (time - 3) / 3));
    const currentEnergy = 100 - energyProgress * 45;
    
    ctx.fillStyle = colors.success;
    const barHeight = 45 * scale * (currentEnergy / 100);
    const barY = energyY + 130 * scale - (45 * scale - barHeight);
    ctx.fillRect(energyX + 30 * scale, barY, energyWidth - 60 * scale, barHeight);
    ctx.fillStyle = '#fff';
    ctx.fillText(`${Math.round(currentEnergy)}%`, energyX + energyWidth / 2, energyY + 160 * scale);
    
    const curveX = cx - 270 * scale;
    const curveY = cy + 150 * scale;
    const curveWidth = 180 * scale;
    const curveHeight = 120 * scale;
    
    ctx.fillStyle = 'rgba(10, 22, 40, 0.9)';
    ctx.fillRect(curveX, curveY, curveWidth, curveHeight);
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 3 * scale;
    ctx.strokeRect(curveX, curveY, curveWidth, curveHeight);
    
    ctx.fillStyle = colors.brightWhite;
    ctx.font = `bold ${20 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('压力平稳度', curveX + curveWidth / 2, curveY + 30 * scale);
    
    ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.fillRect(curveX + 15 * scale, curveY + 65 * scale, curveWidth - 30 * scale, 22 * scale);
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 3 * scale;
    ctx.strokeRect(curveX + 15 * scale, curveY + 65 * scale, curveWidth - 30 * scale, 22 * scale);
    
    if (time > 10) {
      const sloganY = cy - 225 * scale;
      const sloganScale = Math.min(1, (time - 10) / 0.5);
      
      ctx.save();
      ctx.translate(cx, sloganY);
      ctx.scale(sloganScale, sloganScale);
      
      ctx.fillStyle = 'rgba(10, 22, 40, 0.95)';
      ctx.fillRect(-300 * scale, -45 * scale, 600 * scale, 90 * scale);
      ctx.strokeStyle = colors.neonBlue;
      ctx.lineWidth = 4 * scale;
      ctx.strokeRect(-300 * scale, -45 * scale, 600 * scale, 90 * scale);
      
      ctx.fillStyle = colors.neonBlue;
      ctx.font = `bold ${34 * scale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('DeepControl AIPC', 0, -8 * scale);
      ctx.fillStyle = colors.brightWhite;
      ctx.font = `${22 * scale}px sans-serif`;
      ctx.fillText('—— "让每一滴水都更聪明"', 0, 28 * scale);
      
      ctx.restore();
    }
    
    drawTechIndicator(ctx, cx - 300 * scale, cy + 300 * scale, '系统响应', '<1s', time);
    drawTechIndicator(ctx, cx + 75 * scale, cy + 300 * scale, '节能收益', '45%', time);
  };

  const drawChartBox = (ctx: CanvasRenderingContext2D, x: number, y: number, 
                       width: number, height: number, title: string, 
                       color: string, time: number, isSmooth: boolean, scale: number) => {
    ctx.fillStyle = 'rgba(10, 22, 40, 0.9)';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3 * scale;
    ctx.strokeRect(x, y, width, height);
    
    ctx.fillStyle = color;
    ctx.font = `bold ${16 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(title, x + width / 2, y + 30 * scale);
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3 * scale;
    for (let px = 0; px < width; px++) {
      let py;
      if (isSmooth) {
        const smooth = Math.sin((px / 20 + time * 1.5) * 0.3) * 22 * scale;
        py = y + height / 2 + smooth;
        
        if (px > width * 0.7) {
          ctx.setLineDash([4 * scale, 4 * scale]);
          ctx.strokeStyle = color + '80';
        } else {
          ctx.setLineDash([]);
          ctx.strokeStyle = color;
        }
      } else {
        const oscillation = Math.sin((px / 8 + time * 4) * 0.8) * 35 * scale + Math.sin((px / 4 + time * 6) * 1.2) * 15 * scale;
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

  const drawChaosFlow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, 
                        x2: number, y2: number, time: number, scale: number) => {
    const segments = 10;
    ctx.beginPath();
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 3 * scale;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t + Math.sin(time * 10 + i * 0.5) * 8 * scale;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  };

  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, scale: number) => {
    ctx.fillStyle = color + '40';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3 * scale;
    
    ctx.beginPath();
    ctx.arc(x, y, 30 * scale, 0, Math.PI * 2);
    ctx.arc(x + 35 * scale, y - 8 * scale, 22 * scale, 0, Math.PI * 2);
    ctx.arc(x + 65 * scale, y, 27 * scale, 0, Math.PI * 2);
    ctx.arc(x + 35 * scale, y + 15 * scale, 18 * scale, 0, Math.PI * 2);
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
