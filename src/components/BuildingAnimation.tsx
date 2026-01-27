'use client';

import { useRef, useEffect, useState } from 'react';

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
  const [isMounted, setIsMounted] = useState(false);
  
  // 全局缩放因子
  const scale = 1.0;
  
  // 确保只在客户端渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // 检测场景变化
  useEffect(() => {
    if (sceneRef.current !== scene) {
      sceneRef.current = scene;
      animationTimeRef.current = 0;
      timeRef.current = 0;
    }
  }, [scene]);
  
  useEffect(() => {
    if (!isMounted) return;
    
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
      
      // 加快动画速度（翻倍）
      animationTimeRef.current += deltaTime * 0.002;
      
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
  }, [isMounted]);
  
  if (!isMounted) {
    return (
      <div className="w-full h-full relative bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  // ==================== 绘制辅助函数 ====================
  
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

  const drawParticleFlow = (ctx: CanvasRenderingContext2D, path: {x: number, y: number}[], 
                           time: number, color: string = colors.neonBlue) => {
    if (path.length < 2) return;
    
    // 增加粒子数量和动画速度
    for (let i = 0; i < 30; i++) {
      const progress = ((time * 5 + i / 30) % 1);
      const segmentIndex = Math.floor(progress * (path.length - 1));
      const segmentProgress = (progress * (path.length - 1)) % 1;
      
      const p1 = path[segmentIndex];
      const p2 = path[segmentIndex + 1];
      
      const x = p1.x + (p2.x - p1.x) * segmentProgress;
      const y = p1.y + (p2.y - p1.y) * segmentProgress;
      
      // 增加粒子大小和发光效果
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 18 * scale);
      glow.addColorStop(0, color + 'ff');
      glow.addColorStop(0.3, color + 'aa');
      glow.addColorStop(1, color + '00');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 18 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      // 添加核心亮白色中心
      ctx.fillStyle = colors.brightWhite + 'ff';
      ctx.beginPath();
      ctx.arc(x, y, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // ==================== 场景绘制函数 ====================
  
  const drawScene1 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number, scale: number) => {
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, 2000, 2000);
    
    const { startX, startY, buildingWidth, buildingDepth, buildingHeight } = drawIsoBuilding(ctx, cx, cy, time, false);
    
    // 楼顶水箱
    const tankX = startX + buildingWidth / 2 - 40 * scale;
    const tankY = startY + buildingDepth / 2 - 40 * scale;
    const tankZ = buildingHeight + 50 * scale;
    const tankWidth = 80 * scale;
    const tankDepth = 80 * scale;
    const tankHeight = 100 * scale;
    
    drawIsoCube(ctx, tankX, tankY, tankZ, tankWidth, tankHeight, tankDepth, 'rgba(30, 41, 59, 0.6)');
    
    // 水箱连接到管道系统
    ctx.strokeStyle = colors.neonBlueDim;
    ctx.lineWidth = 3 * scale;
    ctx.setLineDash([10, 10]);
    
    const tankBottom = isoTransform(tankX + tankWidth / 2, tankY + tankDepth / 2, tankZ);
    const pipePath = [
      tankBottom,
      isoTransform(tankX + tankWidth / 2, tankY + tankDepth / 2, tankZ - tankHeight),
      isoTransform(tankX + tankWidth / 2, tankY + tankDepth / 2, tankZ - tankHeight - 100 * scale),
    ];
    
    ctx.beginPath();
    ctx.moveTo(pipePath[0].x, pipePath[0].y);
    pipePath.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();
    
    // 标签文字
    ctx.fillStyle = colors.neonBlue;
    ctx.font = `bold ${24 * scale}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('楼顶水箱', tankBottom.x, tankBottom.y + 20 * scale);
    
    // 粒子流动画 - 供水系统
    const waterFlow = [
      isoTransform(startX + buildingWidth / 2, startY + buildingDepth / 2, tankZ - tankHeight),
      isoTransform(startX + buildingWidth / 2 - 100 * scale, startY + buildingDepth / 2 - 100 * scale, tankZ - tankHeight - 150 * scale),
    ];
    drawParticleFlow(ctx, waterFlow, time, colors.cyan);
    
    // 标题和说明
    ctx.fillStyle = colors.brightWhite;
    ctx.font = `bold ${36 * scale}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('传统二次供水方案痛点', cx, cy - 350 * scale);
    
    ctx.fillStyle = colors.warning;
    ctx.font = `${20 * scale}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('❌ 无法感知末端压力', cx, cy - 310 * scale);
    ctx.fillText('❌ 只能维持泵房压力恒定', cx, cy - 285 * scale);
    ctx.fillText('❌ 高峰期末端水压不足', cx, cy - 260 * scale);
    
    // 压力指示器
    const pressureIndicator = isoTransform(startX + buildingWidth, startY + buildingDepth / 2, tankZ - tankHeight - 150 * scale);
    ctx.fillStyle = colors.warning;
    ctx.beginPath();
    ctx.arc(pressureIndicator.x, pressureIndicator.y, 15 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.background;
    ctx.font = `bold ${16 * scale}px system-ui`;
    ctx.fillText('0.2', pressureIndicator.x, pressureIndicator.y + 5 * scale);
    ctx.fillStyle = colors.warning;
    ctx.font = `${16 * scale}px system-ui`;
    ctx.fillText('末端压力低', pressureIndicator.x, pressureIndicator.y + 30 * scale);
    
    ctx.setLineDash([]);
  };

  const drawScene2 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number, scale: number) => {
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, 2000, 2000);
    
    const { startX, startY, buildingWidth, buildingDepth, buildingHeight } = drawIsoBuilding(ctx, cx, cy, time, false);
    
    // 楼顶水箱
    const tankX = startX + buildingWidth / 2 - 40 * scale;
    const tankY = startY + buildingDepth / 2 - 40 * scale;
    const tankZ = buildingHeight + 50 * scale;
    const tankWidth = 80 * scale;
    const tankDepth = 80 * scale;
    const tankHeight = 100 * scale;
    
    drawIsoCube(ctx, tankX, tankY, tankZ, tankWidth, tankHeight, tankDepth, 'rgba(30, 41, 59, 0.6)');
    
    // DeepControl Logo/标识
    const logoPos = isoTransform(tankX + tankWidth / 2, tankY + tankDepth / 2, tankZ + tankHeight + 30 * scale);
    ctx.fillStyle = colors.success;
    ctx.font = `bold ${28 * scale}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('⚡ DeepControl', logoPos.x, logoPos.y);
    
    // 脉冲效果 - 加快速度
    const pulseRadius = 30 * scale + Math.sin(time * 6) * 10 * scale;
    const gradient = ctx.createRadialGradient(logoPos.x, logoPos.y, 0, logoPos.x, logoPos.y, pulseRadius);
    gradient.addColorStop(0, colors.success + '60');
    gradient.addColorStop(1, colors.success + '00');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(logoPos.x, logoPos.y, pulseRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 从DeepControl扩散出的智能波 - 加快速度
    const waveRadius = (time % 1.5) * 150 * scale + 20 * scale;
    const waveAlpha = 1 - ((time % 1.5) / 1.5);
    ctx.strokeStyle = colors.success + Math.floor(waveAlpha * 100).toString(16).padStart(2, '0');
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(logoPos.x, logoPos.y, waveRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // 标题
    ctx.fillStyle = colors.brightWhite;
    ctx.font = `bold ${36 * scale}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('DeepControl AIPC 智能介入', cx, cy - 350 * scale);
    
    ctx.fillStyle = colors.success;
    ctx.font = `${20 * scale}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('✨ 全屋全楼全感知', cx, cy - 310 * scale);
    ctx.fillText('✨ 实时数据采集', cx, cy - 285 * scale);
    ctx.fillText('✨ 智能压力调节', cx, cy - 260 * scale);
    
    // 智能节点指示
    const sensors = [
      { x: startX + 10 * scale, y: startY + 10 * scale, z: buildingHeight / 2 },
      { x: startX + buildingWidth - 10 * scale, y: startY + 10 * scale, z: buildingHeight / 3 },
      { x: startX + 10 * scale, y: startY + buildingDepth - 10 * scale, z: buildingHeight * 2 / 3 },
    ];
    
    sensors.forEach((sensor, i) => {
      const pos = isoTransform(sensor.x, sensor.y, sensor.z);
      ctx.fillStyle = colors.success;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      const sensorPulse = 15 * scale + Math.sin(time * 6 + i) * 5 * scale;
      ctx.strokeStyle = colors.success + '80';
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, sensorPulse, 0, Math.PI * 2);
      ctx.stroke();
    });
  };

  const drawScene3 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number, scale: number) => {
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, 2000, 2000);
    
    // 建筑物和楼顶水箱
    const { startX, startY, buildingWidth, buildingDepth, buildingHeight } = drawIsoBuilding(ctx, cx, cy, time, false);
    
    const tankX = startX + buildingWidth / 2 - 40 * scale;
    const tankY = startY + buildingDepth / 2 - 40 * scale;
    const tankZ = buildingHeight + 50 * scale;
    const tankWidth = 80 * scale;
    const tankDepth = 80 * scale;
    const tankHeight = 100 * scale;
    
    drawIsoCube(ctx, tankX, tankY, tankZ, tankWidth, tankHeight, tankDepth, 'rgba(30, 41, 59, 0.6)');
    
    // 楼顶压力传感器（橙色圆形）
    const sensorX = tankX + tankWidth / 2;
    const sensorY = tankY + tankDepth / 2;
    const sensorZ = tankZ + tankHeight + 30 * scale;
    const sensorPos = isoTransform(sensorX, sensorY, sensorZ);
    
    // 传感器发光效果 - 添加脉冲动画
    const sensorGlowRadius = 25 * scale + Math.sin(time * 5) * 10 * scale;
    const sensorGlow = ctx.createRadialGradient(sensorPos.x, sensorPos.y, 0, sensorPos.x, sensorPos.y, sensorGlowRadius);
    sensorGlow.addColorStop(0, colors.orange + 'ff');
    sensorGlow.addColorStop(0.5, colors.orange + '80');
    sensorGlow.addColorStop(1, colors.orange + '00');
    ctx.fillStyle = sensorGlow;
    ctx.beginPath();
    ctx.arc(sensorPos.x, sensorPos.y, sensorGlowRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 传感器主体
    ctx.fillStyle = colors.orange;
    ctx.beginPath();
    ctx.arc(sensorPos.x, sensorPos.y, 12 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.background;
    ctx.font = `bold ${14 * scale}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('P', sensorPos.x, sensorPos.y + 5 * scale);
    
    // 传感器标签
    ctx.fillStyle = colors.orange;
    ctx.font = `${16 * scale}px system-ui`;
    ctx.fillText('楼顶压力传感器', sensorPos.x, sensorPos.y + 35 * scale);
    
    // 4G网络连接到云端（上行数据流）
    const cloudX = cx + 250 * scale;
    const cloudY = cy - 150 * scale;
    
    // 4G信号标签
    const fourGPos = isoTransform(startX + buildingWidth / 2 + 50 * scale, startY + buildingDepth / 2 + 50 * scale, sensorZ + 20 * scale);
    ctx.fillStyle = colors.neonBlue;
    ctx.font = `bold ${18 * scale}px system-ui`;
    ctx.fillText('4G', fourGPos.x, fourGPos.y);
    
    // 上行数据流路径（楼顶→云端）
    const uploadPath = [
      sensorPos,
      { x: sensorPos.x + 100 * scale, y: sensorPos.y - 100 * scale },
      { x: cx, y: cy - 200 * scale },
      { x: cloudX, y: cloudY }
    ];
    drawParticleFlow(ctx, uploadPath, time, colors.neonBlue);
    
    // 绘制箭头指示上行数据流
    ctx.strokeStyle = colors.neonBlue;
    ctx.lineWidth = 2 * scale;
    const arrowStart = { x: sensorPos.x + 50 * scale, y: sensorPos.y - 50 * scale };
    const arrowEnd = { x: arrowStart.x + 20 * scale, y: arrowStart.y - 20 * scale };
    ctx.beginPath();
    ctx.moveTo(arrowStart.x, arrowStart.y);
    ctx.lineTo(arrowEnd.x, arrowEnd.y);
    ctx.stroke();
    
    // 箭头头部
    ctx.beginPath();
    ctx.moveTo(arrowEnd.x, arrowEnd.y);
    ctx.lineTo(arrowEnd.x - 8 * scale, arrowEnd.y - 5 * scale);
    ctx.lineTo(arrowEnd.x - 5 * scale, arrowEnd.y - 8 * scale);
    ctx.closePath();
    ctx.fillStyle = colors.neonBlue;
    ctx.fill();
    
    // 云端处理中心
    ctx.fillStyle = colors.background;
    ctx.beginPath();
    ctx.moveTo(cloudX - 60 * scale, cloudY);
    ctx.quadraticCurveTo(cloudX - 40 * scale, cloudY - 30 * scale, cloudX - 20 * scale, cloudY - 20 * scale);
    ctx.quadraticCurveTo(cloudX, cloudY - 40 * scale, cloudX + 20 * scale, cloudY - 20 * scale);
    ctx.quadraticCurveTo(cloudX + 40 * scale, cloudY - 30 * scale, cloudX + 60 * scale, cloudY);
    ctx.quadraticCurveTo(cloudX + 40 * scale, cloudY + 20 * scale, cloudX + 20 * scale, cloudY + 20 * scale);
    ctx.quadraticCurveTo(cloudX, cloudY, cloudX - 20 * scale, cloudY + 20 * scale);
    ctx.quadraticCurveTo(cloudX - 40 * scale, cloudY + 20 * scale, cloudX - 60 * scale, cloudY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = colors.purple;
    ctx.lineWidth = 3 * scale;
    ctx.stroke();
    
    // 云端标签
    ctx.fillStyle = colors.purple;
    ctx.font = `bold ${16 * scale}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('云端', cloudX, cloudY + 5 * scale);
    ctx.fillStyle = colors.brightWhite;
    ctx.font = `${14 * scale}px system-ui`;
    ctx.fillText('DeepControl', cloudX, cloudY + 25 * scale);
    
    // 云端处理动画（数据接收）
    const cloudPulse = 50 * scale + Math.sin(time * 5) * 10 * scale;
    const cloudGradient = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudPulse);
    cloudGradient.addColorStop(0, colors.purple + '40');
    cloudGradient.addColorStop(1, colors.purple + '00');
    ctx.fillStyle = cloudGradient;
    ctx.beginPath();
    ctx.arc(cloudX, cloudY, cloudPulse, 0, Math.PI * 2);
    ctx.fill();
    
    // 下行数据流（云端→泵房边缘控制器）
    const edgeX = startX - 150 * scale;
    const edgeY = startY + 100 * scale;
    const edgeZ = 50 * scale;
    const edgePos = isoTransform(edgeX, edgeY, edgeZ);
    
    const downloadPath = [
      { x: cloudX - 50 * scale, y: cloudY + 30 * scale },
      { x: cloudX - 150 * scale, y: cloudY + 100 * scale },
      { x: cx - 100 * scale, y: cy + 100 * scale },
      edgePos
    ];
    drawParticleFlow(ctx, downloadPath, time, colors.success);
    
    // 下行箭头
    ctx.strokeStyle = colors.success;
    ctx.lineWidth = 2 * scale;
    const downArrowStart = { x: cloudX - 100 * scale, y: cloudY + 80 * scale };
    const downArrowEnd = { x: downArrowStart.x - 30 * scale, y: downArrowStart.y + 30 * scale };
    ctx.beginPath();
    ctx.moveTo(downArrowStart.x, downArrowStart.y);
    ctx.lineTo(downArrowEnd.x, downArrowEnd.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(downArrowEnd.x, downArrowEnd.y);
    ctx.lineTo(downArrowEnd.x + 5 * scale, downArrowEnd.y - 8 * scale);
    ctx.lineTo(downArrowEnd.x + 8 * scale, downArrowEnd.y - 5 * scale);
    ctx.closePath();
    ctx.fillStyle = colors.success;
    ctx.fill();
    
    // 泵房边缘控制器
    const edgeWidth = 80 * scale;
    const edgeHeight = 60 * scale;
    const edgeDepth = 60 * scale;
    
    drawIsoCube(ctx, edgeX, edgeY, edgeZ, edgeWidth, edgeHeight, edgeDepth, 'rgba(30, 41, 59, 0.8)');
    
    // 边缘控制器发光边框
    ctx.strokeStyle = colors.success;
    ctx.lineWidth = 3 * scale;
    ctx.setLineDash([5, 5]);
    
    const edgeTop = isoTransform(edgeX, edgeY, edgeZ + edgeHeight);
    const edgeFront = isoTransform(edgeX, edgeY + edgeDepth, edgeZ);
    const edgeSide = isoTransform(edgeX + edgeWidth, edgeY, edgeZ);
    
    ctx.beginPath();
    ctx.moveTo(edgeTop.x, edgeTop.y);
    ctx.lineTo(edgeSide.x, edgeSide.y);
    ctx.lineTo(isoTransform(edgeX + edgeWidth, edgeY + edgeDepth, edgeZ).x, isoTransform(edgeX + edgeWidth, edgeY + edgeDepth, edgeZ).y);
    ctx.lineTo(edgeFront.x, edgeFront.y);
    ctx.closePath();
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // 边缘控制器标签
    ctx.fillStyle = colors.success;
    ctx.font = `bold ${14 * scale}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('边缘控制器', edgeTop.x, edgeTop.y - 15 * scale);
    
    // 水泵
    const pumpX = edgeX + edgeWidth / 2;
    const pumpY = edgeY + edgeDepth + 30 * scale;
    const pumpZ = 30 * scale;
    const pumpPos = isoTransform(pumpX, pumpY, pumpZ);
    const pumpRadius = 25 * scale;
    
    ctx.fillStyle = colors.warning;
    ctx.beginPath();
    ctx.arc(pumpPos.x, pumpPos.y, pumpRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 水泵旋转动画（叶片）- 加快速度
    const pumpRotation = time * 12;
    ctx.strokeStyle = colors.brightWhite;
    ctx.lineWidth = 2 * scale;
    for (let i = 0; i < 6; i++) {
      const angle = pumpRotation + (i * Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(pumpPos.x, pumpPos.y);
      ctx.lineTo(
        pumpPos.x + Math.cos(angle) * (pumpRadius - 5 * scale),
        pumpPos.y + Math.sin(angle) * (pumpRadius - 5 * scale)
      );
      ctx.stroke();
    }
    
    // 水泵标签
    ctx.fillStyle = colors.warning;
    ctx.font = `bold ${14 * scale}px system-ui`;
    ctx.fillText('水泵', pumpPos.x, pumpPos.y + 40 * scale);
    
    // 控制信号（边缘控制器→水泵）
    const controlSignalY = pumpPos.y - 40 * scale;
    ctx.strokeStyle = colors.success;
    ctx.lineWidth = 2 * scale;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(edgeTop.x, edgeTop.y);
    ctx.lineTo(edgeTop.x, controlSignalY);
    ctx.lineTo(pumpPos.x, controlSignalY);
    ctx.lineTo(pumpPos.x, pumpPos.y - pumpRadius);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 标题
    ctx.fillStyle = colors.brightWhite;
    ctx.font = `bold ${36 * scale}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('全感知检测 & 智能决策', cx, cy - 350 * scale);
    
    ctx.fillStyle = colors.neonBlue;
    ctx.font = `${18 * scale}px system-ui`;
    ctx.fillText('📡 楼顶压力 → 4G → 云端处理', cx, cy - 310 * scale);
    ctx.fillText('⬇️ 云端指令 → 边缘控制器 → 水泵控制', cx, cy - 285 * scale);
    ctx.fillStyle = colors.success;
    ctx.fillText('✓ 实时监测末端压力', cx, cy - 260 * scale);
    ctx.fillText('✓ 云端智能算法决策', cx, cy - 235 * scale);
    
    // 压力控制对比
    ctx.fillStyle = colors.warning;
    ctx.font = `bold ${18 * scale}px system-ui`;
    ctx.textAlign = 'left';
    ctx.fillText('原来：泵房压力恒定', cx - 200 * scale, cy + 250 * scale);
    ctx.fillStyle = colors.success;
    ctx.fillText('现在：楼顶压力恒定 ✓', cx - 200 * scale, cy + 280 * scale);
    
    // 能效提升
    ctx.fillStyle = colors.success;
    ctx.font = `bold ${24 * scale}px system-ui`;
    ctx.textAlign = 'right';
    ctx.fillText('能效提升 45%', cx + 200 * scale, cy + 280 * scale);
  };

  const drawScene4 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number, scale: number) => {
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, 2000, 2000);
    
    const { startX, startY, buildingWidth, buildingDepth, buildingHeight } = drawIsoBuilding(ctx, cx, cy, time, false);
    
    const tankX = startX + buildingWidth / 2 - 40 * scale;
    const tankY = startY + buildingDepth / 2 - 40 * scale;
    const tankZ = buildingHeight + 50 * scale;
    
    drawIsoCube(ctx, tankX, tankY, tankZ, 80 * scale, 100 * scale, 80 * scale, 'rgba(30, 41, 59, 0.6)');
    
    // 高密度传感器网络
    const sensorDensity = 8;
    for (let i = 0; i < sensorDensity; i++) {
      const x = startX + (i % 4) * (buildingWidth / 4) + buildingWidth / 8;
      const y = startY + Math.floor(i / 4) * (buildingDepth / 2) + buildingDepth / 4;
      const z = (i / sensorDensity) * buildingHeight;
      const pos = isoTransform(x, y, z);
      
      ctx.fillStyle = colors.cyan;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 6 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      const sensorPulse = 12 * scale + Math.sin(time * 5 + i * 0.5) * 4 * scale;
      ctx.strokeStyle = colors.cyan + '80';
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, sensorPulse, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // 数据流连接到云端
    const cloudX = cx + 250 * scale;
    const cloudY = cy - 150 * scale;
    
    const dataStreams = sensorDensity;
    for (let i = 0; i < dataStreams; i++) {
      const x = startX + (i % 4) * (buildingWidth / 4) + buildingWidth / 8;
      const y = startY + Math.floor(i / 4) * (buildingDepth / 2) + buildingDepth / 4;
      const z = (i / sensorDensity) * buildingHeight;
      const pos = isoTransform(x, y, z);
      
      const path = [
        pos,
        { x: pos.x + 80 * scale, y: pos.y - 80 * scale },
        { x: cx, y: cy - 150 * scale },
        { x: cloudX, y: cloudY }
      ];
      drawParticleFlow(ctx, path, time + i * 0.1, colors.cyan);
    }
    
    // 云端
    ctx.fillStyle = colors.background;
    ctx.beginPath();
    ctx.moveTo(cloudX - 60 * scale, cloudY);
    ctx.quadraticCurveTo(cloudX - 40 * scale, cloudY - 30 * scale, cloudX - 20 * scale, cloudY - 20 * scale);
    ctx.quadraticCurveTo(cloudX, cloudY - 40 * scale, cloudX + 20 * scale, cloudY - 20 * scale);
    ctx.quadraticCurveTo(cloudX + 40 * scale, cloudY - 30 * scale, cloudX + 60 * scale, cloudY);
    ctx.quadraticCurveTo(cloudX + 40 * scale, cloudY + 20 * scale, cloudX + 20 * scale, cloudY + 20 * scale);
    ctx.quadraticCurveTo(cloudX, cloudY, cloudX - 20 * scale, cloudY + 20 * scale);
    ctx.quadraticCurveTo(cloudX - 40 * scale, cloudY + 20 * scale, cloudX - 60 * scale, cloudY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = colors.purple;
    ctx.lineWidth = 3 * scale;
    ctx.stroke();
    
    // 云端标签
    ctx.fillStyle = colors.purple;
    ctx.font = `bold ${16 * scale}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('云端', cloudX, cloudY + 5 * scale);
    
    // MPC算法可视化
    const mpcCenterX = cloudX;
    const mpcCenterY = cloudY + 60 * scale;
    const mpcRadius = 40 * scale;
    
    ctx.fillStyle = colors.purple + '20';
    ctx.beginPath();
    ctx.arc(mpcCenterX, mpcCenterY, mpcRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.purple;
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
    
    ctx.fillStyle = colors.purple;
    ctx.font = `bold ${14 * scale}px system-ui`;
    ctx.fillText('MPC', mpcCenterX, mpcCenterY + 5 * scale);
    ctx.fillStyle = colors.brightWhite;
    ctx.font = `${12 * scale}px system-ui`;
    ctx.fillText('算法', mpcCenterX, mpcCenterY + 20 * scale);
    
    // 标题
    ctx.fillStyle = colors.brightWhite;
    ctx.font = `bold ${36 * scale}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('MPC 智能预测控制', cx, cy - 350 * scale);
    
    ctx.fillStyle = colors.cyan;
    ctx.font = `${20 * scale}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('📊 全楼多节点压力实时采集', cx, cy - 310 * scale);
    ctx.fillText('🧠 预测性压力调节算法', cx, cy - 285 * scale);
    ctx.fillText('⚡ 提前响应，避免压力波动', cx, cy - 260 * scale);
    
    // 算法参数显示
    ctx.fillStyle = colors.brightWhite;
    ctx.font = `${16 * scale}px system-ui`;
    ctx.textAlign = 'left';
    ctx.fillText('预测步长: 10步', cx - 150 * scale, cy + 200 * scale);
    ctx.fillText('采样频率: 100Hz', cx - 150 * scale, cy + 225 * scale);
    ctx.fillText('响应时间: <100ms', cx - 150 * scale, cy + 250 * scale);
  };

  const drawScene5 = (ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number, scale: number) => {
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, 2000, 2000);
    
    const { startX, startY, buildingWidth, buildingDepth, buildingHeight } = drawIsoBuilding(ctx, cx, cy, time, false);
    
    const tankX = startX + buildingWidth / 2 - 40 * scale;
    const tankY = startY + buildingDepth / 2 - 40 * scale;
    const tankZ = buildingHeight + 50 * scale;
    
    drawIsoCube(ctx, tankX, tankY, tankZ, 80 * scale, 100 * scale, 80 * scale, 'rgba(30, 41, 59, 0.6)');
    
    // 稳定的水流动画
    const flowPath = [
      isoTransform(tankX + 40 * scale, tankY + 40 * scale, tankZ),
      isoTransform(startX + buildingWidth / 2, startY + buildingDepth / 2, tankZ - 200 * scale),
    ];
    drawParticleFlow(ctx, flowPath, time * 0.8, colors.success);
    
    // 压力指示器
    const pressureIndicator = isoTransform(startX + buildingWidth, startY + buildingDepth / 2, buildingHeight / 2);
    ctx.fillStyle = colors.success;
    ctx.beginPath();
    ctx.arc(pressureIndicator.x, pressureIndicator.y, 20 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.background;
    ctx.font = `bold ${18 * scale}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('0.4', pressureIndicator.x, pressureIndicator.y + 6 * scale);
    
    ctx.fillStyle = colors.success;
    ctx.font = `${16 * scale}px system-ui`;
    ctx.fillText('末端压力稳定', pressureIndicator.x, pressureIndicator.y + 35 * scale);
    
    // 节能效果可视化
    const efficiencyX = cx + 250 * scale;
    const efficiencyY = cy - 50 * scale;
    
    // 节能图标
    ctx.fillStyle = colors.success;
    ctx.font = `bold ${60 * scale}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('⚡', efficiencyX, efficiencyY);
    
    // 节能数字 - 加快动画速度
    const energySaving = 45;
    const currentAngle = (time % 1.5) * Math.PI;
    const displaySaving = Math.floor(energySaving * (time % 1.5));
    
    ctx.fillStyle = colors.success;
    ctx.font = `bold ${48 * scale}px system-ui`;
    ctx.fillText(`${displaySaving}%`, efficiencyX, efficiencyY + 60 * scale);
    
    ctx.fillStyle = colors.brightWhite;
    ctx.font = `${20 * scale}px system-ui`;
    ctx.fillText('能效提升', efficiencyX, efficiencyY + 90 * scale);
    
    // 标题
    ctx.fillStyle = colors.brightWhite;
    ctx.font = `bold ${36 * scale}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('价值实现', cx, cy - 350 * scale);
    
    // 价值列表
    ctx.fillStyle = colors.success;
    ctx.font = `${22 * scale}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('✓ 全楼压力均匀稳定', cx, cy - 300 * scale);
    ctx.fillText('✓ 能耗降低 45%', cx, cy - 270 * scale);
    ctx.fillText('✓ 用户体验显著提升', cx, cy - 240 * scale);
    ctx.fillText('✓ 智能运维，减少人工干预', cx, cy - 210 * scale);
    
    // 对比条
    const barX = cx - 200 * scale;
    const barY = cy + 150 * scale;
    const barWidth = 400 * scale;
    const barHeight = 40 * scale;
    
    // 传统方案
    ctx.fillStyle = colors.warning;
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = colors.background;
    ctx.font = `${18 * scale}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('传统方案 100%', barX + barWidth / 2, barY + 26 * scale);
    
    // DeepControl方案
    const newBarY = barY + 60 * scale;
    ctx.fillStyle = colors.success;
    ctx.fillRect(barX, newBarY, barWidth * 0.55, barHeight);
    ctx.fillStyle = colors.background;
    ctx.fillText('DeepControl 55%', barX + barWidth * 0.275, newBarY + 26 * scale);
    
    // 连接线
    ctx.strokeStyle = colors.neonBlueDim;
    ctx.lineWidth = 2 * scale;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(barX + barWidth, barY + barHeight / 2);
    ctx.lineTo(barX + barWidth * 0.55, newBarY + barHeight / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 节省标注
    ctx.fillStyle = colors.success;
    ctx.font = `bold ${20 * scale}px system-ui`;
    ctx.fillText('节省 45%', barX + barWidth + 80 * scale, barY + 90 * scale);
  };

  // ==================== 主绘制函数 ====================
  
  const drawScene = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number, scale: number) => {
    const cx = width / 2;
    const cy = height / 2;
    
    switch (sceneRef.current) {
      case 1:
        drawScene1(ctx, cx, cy, time, scale);
        break;
      case 2:
        drawScene2(ctx, cx, cy, time, scale);
        break;
      case 3:
        drawScene3(ctx, cx, cy, time, scale);
        break;
      case 4:
        drawScene4(ctx, cx, cy, time, scale);
        break;
      case 5:
        drawScene5(ctx, cx, cy, time, scale);
        break;
      default:
        drawScene1(ctx, cx, cy, time, scale);
    }
  };

  return (
    <div className="w-full h-full relative bg-slate-900" style={{ minHeight: '600px' }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
}
