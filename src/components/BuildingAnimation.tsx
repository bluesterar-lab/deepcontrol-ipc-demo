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

    // 场景1：传统方案痛点（简化版）
    const drawScene1 = (width: number, height: number, time: number, alpha: number = 1) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('传统PID控制的三大痛点', centerX, 60);

      // 核心问题卡片
      const problems = [
        { 
          title: '压力振荡大', 
          desc: '阶跃响应超调>30%，振荡周期长',
          value: '±15%',
          color: '#ef4444'
        },
        { 
          title: '响应延迟', 
          desc: '信号传输+处理耗时，无法实时调节',
          value: '1.5s',
          color: '#f97316'
        },
        { 
          title: '能效偏低', 
          desc: '无法适应负载变化，能耗浪费',
          value: '65%',
          color: '#eab308'
        }
      ];

      problems.forEach((prob, i) => {
        const px = centerX - 140 + i * 140;
        const py = centerY;
        
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px - 60, py - 70, 120, 140);
        ctx.strokeStyle = prob.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(px - 60, py - 70, 120, 140);

        ctx.fillStyle = prob.color;
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(prob.title, px, py - 45);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px system-ui, sans-serif';
        ctx.fillText(prob.value, px, py);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText(prob.desc, px, py + 40);
      });

      // 压力振荡示意图
      const oscillationBoxY = centerY + 90;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 120, oscillationBoxY);
      ctx.lineTo(centerX + 120, oscillationBoxY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX - 120, oscillationBoxY);
      for (let x = 0; x < 240; x += 3) {
        const targetY = oscillationBoxY - 30;
        const oscillation = Math.sin(time * 3 + x * 0.05) * 25 * Math.exp(-x * 0.01);
        ctx.lineTo(centerX - 120 + x, oscillationBoxY + oscillation);
      }
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 目标线
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(centerX - 120, oscillationBoxY - 30);
      ctx.lineTo(centerX + 120, oscillationBoxY - 30);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText('压力响应振荡曲线', centerX, oscillationBoxY + 60);

      ctx.globalAlpha = 1;
    };

    // 场景2：DeepControl系统架构（流程图式）
    const drawScene2 = (width: number, height: number, time: number, alpha: number = 1) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DeepControl AIPC 系统架构流程', centerX, 40);

      // 系统流程节点
      const nodes = [
        { name: '感知层', desc: '压力/流量传感器', icon: '📡', x: centerX, y: centerY - 110, color: '#22c55e' },
        { name: '通信层', desc: '4G/以太网传输', icon: '📶', x: centerX, y: centerY - 55, color: '#10b981' },
        { name: '数据层', desc: '云端数据存储', icon: '☁️', x: centerX, y: centerY, color: '#06b6d4' },
        { name: '算法层', desc: 'MPC优化算法', icon: '🧮', x: centerX, y: centerY + 55, color: '#0ea5e9' },
        { name: '应用层', desc: '智能控制决策', icon: '🎯', x: centerX, y: centerY + 110, color: '#3b82f6' }
      ];

      // 绘制连接线和数据流动画
      nodes.forEach((node, i) => {
        if (i < nodes.length - 1) {
          // 连接线
          ctx.beginPath();
          ctx.moveTo(node.x, node.y + 25);
          ctx.lineTo(nodes[i + 1].x, nodes[i + 1].y - 25);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.stroke();

          // 数据流动画点
          const flowPos = (time * 2 + i * 0.2) % 1;
          const flowY = node.y + 25 + flowPos * (nodes[i + 1].y - node.y - 50);
          
          ctx.beginPath();
          ctx.arc(node.x, flowY, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#60a5fa';
          ctx.fill();
          
          // 流动箭头
          ctx.beginPath();
          ctx.moveTo(node.x - 4, flowY - 3);
          ctx.lineTo(node.x, flowY + 4);
          ctx.lineTo(node.x + 4, flowY - 3);
          ctx.fillStyle = '#60a5fa';
          ctx.fill();
        }
      });

      // 绘制节点
      nodes.forEach((node, i) => {
        const pulse = 1 + Math.sin(time * 2 + i * 0.5) * 0.05;
        
        ctx.save();
        ctx.translate(node.x, node.y);
        ctx.scale(pulse, pulse);

        // 节点背景
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-80, -25, 160, 50);
        
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(-80, -25, 160, 50);

        // 节点图标
        ctx.font = '18px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(node.icon, -70, 5);

        // 节点名称
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(node.name, -40, 0);

        // 节点描述
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText(node.desc, -40, 15);

        ctx.restore();
      });

      // 左侧：输入输出
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      
      // 输入侧
      ctx.strokeRect(centerX - 220, centerY - 90, 40, 180);
      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('传感器', centerX - 200, centerY - 100);
      ctx.fillText('数据', centerX - 200, centerY + 105);

      const sensorData = (time * 3) % 5;
      for (let i = 0; i < 5; i++) {
        const sy = centerY - 80 + i * 40;
        const isActive = Math.floor(sensorData) === i;
        
        ctx.beginPath();
        ctx.arc(centerX - 200, sy, 6, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? '#22c55e' : '#475569';
        ctx.fill();
        
        if (isActive) {
          ctx.beginPath();
          ctx.moveTo(centerX - 200, sy);
          ctx.lineTo(nodes[0].x - 80, nodes[0].y);
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // 右侧：执行侧
      ctx.strokeRect(centerX + 180, centerY - 30, 40, 60);
      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText('执行', centerX + 200, centerY - 40);
      ctx.fillText('单元', centerX + 200, centerY + 45);

      const actuateData = (time * 3) % 5;
      if (actuateData > 2.5) {
        ctx.beginPath();
        ctx.moveTo(nodes[4].x + 80, nodes[4].y);
        ctx.lineTo(centerX + 180, centerY);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      ctx.arc(centerX + 200, centerY, 8, 0, Math.PI * 2);
      ctx.fillStyle = actuateData > 2.5 ? '#3b82f6' : '#475569';
      ctx.fill();

      // 底部特性说明
      const features = [
        { text: '<1s响应', color: '#22c55e' },
        { text: '实时监测', color: '#3b82f6' },
        { text: '精准控制', color: '#8b5cf6' }
      ];

      features.forEach((feat, i) => {
        const fx = centerX - 100 + i * 100;
        const fy = height - 50;
        
        ctx.beginPath();
        ctx.arc(fx, fy, 4, 0, Math.PI * 2);
        ctx.fillStyle = feat.color;
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(feat.text, fx + 15, fy + 4);
      });

      ctx.globalAlpha = 1;
    };

    // 场景3：全感知检测与硬件部署（重点优化）
    const drawScene3 = (width: number, height: number, time: number, alpha: number = 1) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 流程阶段变量（全局使用）
      const cycleTime = time % 8; // 0-8秒循环
      const currentStage = Math.floor(cycleTime / 2) + 1; // 1-4阶段
      const stageProgress = (cycleTime % 2) / 2; // 0-1，当前阶段的进度

      // 标题
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('全感知检测与硬件部署方案', centerX - 80, 35);

      // ========== 右侧：阶段信息面板 ==========
      const panelX = centerX + 100;
      const panelY = centerY - 120;
      const panelWidth = 180;
      const panelHeight = 240;

      // 面板背景
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

      // 面板标题
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('执行流程', panelX + panelWidth / 2, panelY + 25);

      // 阶段步骤
      const stages = [
        { num: 1, title: '压力数据采集', desc: '实时采集水压数据', color: '#3b82f6' },
        { num: 2, title: '数据上传云端', desc: '4G网络传输', color: '#06b6d4' },
        { num: 3, title: '智能决策分析', desc: 'MPC算法计算', color: '#8b5cf6' },
        { num: 4, title: '执行调节指令', desc: '变频泵响应', color: '#22c55e' }
      ];

      stages.forEach((stage, i) => {
        const stageNum = i + 1;
        const isActive = stageNum === currentStage;
        const isCompleted = stageNum < currentStage;
        const shouldShow = stageNum <= currentStage; // 累加显示

        if (!shouldShow) return;

        const sy = panelY + 50 + i * 50;

        // 步骤圆圈
        ctx.beginPath();
        ctx.arc(panelX + 25, sy + 15, 12, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? stage.color : isCompleted ? '#475569' : '#1e293b';
        ctx.fill();
        ctx.strokeStyle = stage.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 当前步骤脉冲效果
        if (isActive) {
          const pulseSize = 12 + Math.sin(time * 8) * 3;
          ctx.beginPath();
          ctx.arc(panelX + 25, sy + 15, pulseSize, 0, Math.PI * 2);
          ctx.strokeStyle = stage.color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // 步骤序号
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(stage.num), panelX + 25, sy + 19);

        // 步骤标题
        ctx.fillStyle = isActive ? stage.color : '#ffffff';
        ctx.font = isActive ? 'bold 13px system-ui, sans-serif' : '13px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(stage.title, panelX + 50, sy + 12);

        // 步骤描述
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText(stage.desc, panelX + 50, sy + 30);

        // 连接线
        if (i < stages.length - 1 && shouldShow) {
          ctx.beginPath();
          ctx.moveTo(panelX + 25, sy + 27);
          ctx.lineTo(panelX + 25, panelY + 50 + (i + 1) * 50 - 13);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // ========== 左侧：主图像区域 ==========
      const imageCenterX = centerX - 140;
      const imageCenterY = centerY;

      // ========== 建筑剖面图（阶段1+显示）==========
      if (currentStage >= 1) {
        const buildingX = imageCenterX - 100;
        const buildingY = imageCenterY;
        const floorHeight = 40;
        const floorCount = 5;
        const buildingAlpha = currentStage === 1 ? 1 : 0.7;

        ctx.globalAlpha = alpha * buildingAlpha;
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 3;

        // 绘制建筑轮廓
        ctx.strokeRect(buildingX - 50, buildingY - floorHeight * floorCount / 2, 100, floorHeight * floorCount);

        // 绘制楼层
        for (let i = 0; i < floorCount; i++) {
          const floorY = buildingY - floorHeight * floorCount / 2 + i * floorHeight;

          // 楼板
          ctx.beginPath();
          ctx.moveTo(buildingX - 50, floorY);
          ctx.lineTo(buildingX + 50, floorY);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
          ctx.stroke();

          // 楼层标签
          ctx.fillStyle = '#94a3b8';
          ctx.font = '12px system-ui, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(`${floorCount - i}楼`, buildingX - 55, floorY + floorHeight / 2 + 4);

          // 管道
          if (i < floorCount - 1) {
            ctx.beginPath();
            ctx.moveTo(buildingX + 30, floorY + 5);
            ctx.lineTo(buildingX + 30, floorY + floorHeight);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.stroke();
          }
        }

        // ========== 顶楼（最不利点）压力表和4G模块 ==========
        const topFloorY = buildingY - floorHeight * floorCount / 2;

        // 压力表
        ctx.fillStyle = '#1e293b';
      ctx.fillRect(buildingX + 10, topFloorY + 10, 30, 25);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.strokeRect(buildingX + 10, topFloorY + 10, 30, 25);
      
      ctx.fillStyle = '#22c55e';
      ctx.font = '10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('P', buildingX + 25, topFloorY + 26);
      
      // 压力读数动画
      const pressureValue = (0.4 + Math.sin(time * 2) * 0.02).toFixed(3);
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillText(pressureValue + ' MPa', buildingX + 25, topFloorY - 5);
      
      // 4G远传模块
      const blink = Math.sin(time * 4) > 0;
      ctx.beginPath();
      ctx.arc(buildingX + 25, topFloorY - 18, 8, 0, Math.PI * 2);
      ctx.fillStyle = blink ? '#3b82f6' : '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px system-ui, sans-serif';
      ctx.fillText('4G', buildingX + 25, topFloorY - 15);
      
        // 标注：最不利点
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('最不利点', buildingX + 25, topFloorY + 55);
        ctx.font = '10px system-ui, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('压力表+4G', buildingX + 25, topFloorY + 68);
        ctx.globalAlpha = alpha;
      }

      // ========== 中间：云端服务器（阶段2+显示）==========
      if (currentStage >= 2) {
        const cloudX = imageCenterX + 60;
        const cloudY = imageCenterY - 60;
        const cloudAlpha = currentStage === 2 ? 1 : 0.7;

        ctx.globalAlpha = alpha * cloudAlpha;

        // 云端图标
        ctx.beginPath();
        ctx.arc(cloudX - 20, cloudY, 20, 0, Math.PI * 2);
        ctx.arc(cloudX + 20, cloudY, 20, 0, Math.PI * 2);
        ctx.arc(cloudX, cloudY - 15, 25, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('☁️', cloudX, cloudY + 5);

        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.fillText('云端平台', cloudX, cloudY + 40);

        // 数据流动画到云端
        if (currentStage >= 2) {
          const buildingX = imageCenterX - 100;
          const buildingY = imageCenterY;
          const floorHeight = 40;
          const floorCount = 5;
          const topFloorY = buildingY - floorHeight * floorCount / 2;

          const dataToCloud = (time * 3) % 1;
          const toCloudX = buildingX + 25 + (cloudX - buildingX - 25) * dataToCloud;
          const toCloudY = topFloorY - 18 + (cloudY - topFloorY + 18) * dataToCloud;

          ctx.beginPath();
          ctx.arc(toCloudX, toCloudY, 6, 0, Math.PI * 2);
          ctx.fillStyle = currentStage === 2 ? '#06b6d4' : '#8b5cf6';
          ctx.fill();
        }

        // 标注：传输链路1
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('4G上传', imageCenterX - 20, imageCenterY - 85);

        ctx.globalAlpha = alpha;
      }

      // ========== 右侧：泵房边缘控制器（阶段3+显示）==========
      if (currentStage >= 3) {
        const pumpX = imageCenterX + 160;
        const pumpY = imageCenterY + 20;
        const pumpAlpha = currentStage === 3 ? 1 : 0.7;

        ctx.globalAlpha = alpha * pumpAlpha;

        // 边缘控制器盒子
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(pumpX - 40, pumpY - 30, 80, 60);
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 3;
        ctx.strokeRect(pumpX - 40, pumpY - 30, 80, 60);

        ctx.fillStyle = '#8b5cf6';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('边缘', pumpX, pumpY - 10);
        ctx.fillText('控制器', pumpX, pumpY + 8);

        // 智能盒子图标
        const boxPulse = 1 + Math.sin(time * 3) * 0.1;
        ctx.save();
        ctx.translate(pumpX, pumpY + 25);
        ctx.scale(boxPulse, boxPulse);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(-15, -10, 30, 20);
        ctx.restore();

        // 数据流动画到边缘控制器
        if (currentStage >= 3) {
          const cloudX = imageCenterX + 60;
          const cloudY = imageCenterY - 60;

          const dataToPump = (time * 3 + 0.5) % 1;
          const toPumpX = cloudX + (pumpX - cloudX) * dataToPump;
          const toPumpY = cloudY + (pumpY - cloudY) * dataToPump;

          ctx.beginPath();
          ctx.arc(toPumpX, toPumpY, 6, 0, Math.PI * 2);
          ctx.fillStyle = currentStage === 3 ? '#8b5cf6' : '#22c55e';
          ctx.fill();
        }

        // 标注：传输链路2
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('4G下载', imageCenterX + 110, imageCenterY - 20);

        ctx.globalAlpha = alpha;
      }

      // ========== 变频泵（阶段4显示）==========
      if (currentStage >= 4) {
        const pumpX = imageCenterX + 160;
        const pumpY = imageCenterY + 20;
        const pumpMotorY = pumpY + 80;

        // 重新定义建筑变量（因为它们在建筑的if块内部）
        const buildingX = imageCenterX - 100;
        const buildingY = imageCenterY;
        const floorHeight = 40;
        const floorCount = 5;
        const topFloorY = buildingY - floorHeight * floorCount / 2;

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(pumpX - 30, pumpMotorY - 20, 60, 40);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.strokeRect(pumpX - 30, pumpMotorY - 20, 60, 40);

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('变频泵', pumpX, pumpMotorY + 5);

        // 控制线
        const controlSignal = (time * 4) % 1;
        const signalY = pumpY + 30 + controlSignal * 30;

        ctx.beginPath();
        ctx.moveTo(pumpX, pumpY + 30);
        ctx.lineTo(pumpX, pumpMotorY - 20);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(pumpX, signalY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
        ctx.fill();

        // ========== 闭环流程：水泵→楼内水压→传感器 ==========
        // 从变频泵到建筑的主管道
        const pipeStartX = pumpX - 30;
        const pipeStartY = pumpMotorY;
        const pipeEndX = buildingX + 30;
        const pipeEndY = buildingY + floorHeight * floorCount / 2 - 10;

        // 主管道（供水）
        ctx.beginPath();
        ctx.moveTo(pipeStartX, pipeStartY);
        ctx.lineTo(pipeStartX, pipeStartY + 30);
        ctx.lineTo(buildingX + 30, buildingY + floorHeight * floorCount / 2 - 10);
        ctx.lineTo(buildingX + 30, topFloorY);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 6;
        ctx.stroke();

        // 水流动画（泵到楼内）
        const waterFlow = (time * 5) % 1;
        const flowX = pipeStartX + (pipeEndX - pipeStartX) * waterFlow * 0.3;
        const flowY = pipeStartY + (buildingY + floorHeight * floorCount / 2 - 10 - pipeStartY) * waterFlow;

        ctx.beginPath();
        ctx.arc(flowX, flowY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#60a5fa';
        ctx.fill();

        // 楼内各楼层水压状态
        const floorPressures = [
          { floor: 5, pressure: 0.45, status: 'normal' },
          { floor: 4, pressure: 0.43, status: 'normal' },
          { floor: 3, pressure: 0.42, status: 'normal' },
          { floor: 2, pressure: 0.41, status: 'normal' },
          { floor: 1, pressure: 0.40, status: 'normal' }
        ];

        floorPressures.forEach((fp, i) => {
          const fy = buildingY - floorHeight * floorCount / 2 + i * floorHeight + floorHeight / 2;
          const pressureChange = Math.sin(time * 2 + i * 0.5) * 0.02;
          const currentPressure = fp.pressure + pressureChange;

          // 水压指示条
          const barWidth = currentPressure * 80;
          const barColor = currentPressure > 0.46 ? '#ef4444' : currentPressure < 0.38 ? '#f97316' : '#22c55e';

          ctx.fillStyle = barColor;
          ctx.fillRect(buildingX + 35, fy - 8, barWidth, 16);

          // 压力数值
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px system-ui, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(currentPressure.toFixed(3) + ' MPa', buildingX + 35 + barWidth + 5, fy + 4);
        });

        // 标注：供水管道
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('供水管道', (pumpX + buildingX) / 2 - 30, buildingY + floorHeight * floorCount / 2 + 20);

        // ========== 闭环反馈线（从楼内到泵房）==========
        // 虚线表示反馈信号
        ctx.beginPath();
        ctx.moveTo(buildingX + 25, topFloorY - 18);
        ctx.lineTo(buildingX + 25, pumpMotorY);
        ctx.lineTo(pumpX, pumpMotorY);
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // 反馈信号动画（仅在阶段4显示）
        const showFeedback = currentStage === 4;
        if (showFeedback) {
          const feedbackFlow = (time * 3 + 0.3) % 1;
          const feedbackX = buildingX + 25 + (pumpX - buildingX - 25) * feedbackFlow;
          const feedbackY = topFloorY - 18 + (pumpMotorY - topFloorY + 18) * feedbackFlow * 0.5;

          if (feedbackFlow > 0.5) {
            const secondPhase = (feedbackFlow - 0.5) * 2;
            const finalX = buildingX + 25;
            const finalY = pumpMotorY + secondPhase * (buildingX + 25 - pumpX);
          }

          ctx.beginPath();
          ctx.arc(buildingX + 25, topFloorY - 18 + (pumpMotorY - topFloorY + 18) * feedbackFlow * 0.5, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#22c55e';
          ctx.fill();
        }

        // 标注：闭环反馈
        ctx.fillStyle = '#8b5cf6';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('闭环反馈', (buildingX + pumpX) / 2, pumpMotorY - 10);

        ctx.globalAlpha = alpha;
      }

      ctx.globalAlpha = alpha;

      // ========== 底部关键指标 ==========
      const metrics = [
        { label: '采样周期', value: '50ms' },
        { label: '传输延迟', value: '<100ms' },
        { label: '控制精度', value: '±0.01MPa' }
      ];

      metrics.forEach((metric, i) => {
        const mx = imageCenterX - 120 + i * 120;
        const my = height - 35;

        ctx.fillStyle = '#475569';
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(metric.label + ': ', mx, my);
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.fillText(metric.value, mx + 40, my);
      });

      ctx.globalAlpha = 1;
    };

    // 场景4：MPC vs 非MPC数据对比
    const drawScene4 = (width: number, height: number, time: number, alpha: number = 1) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.fillStyle = '#8b5cf6';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MPC智能算法 vs 传统PID控制对比', centerX, 50);

      // ========== 上半部分：压力响应曲线对比图 ==========
      const chartX = centerX - 200;
      const chartY = centerY - 60;
      const chartWidth = 400;
      const chartHeight = 140;

      // 图表背景和边框
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(chartX, chartY, chartWidth, chartHeight);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(chartX, chartY, chartWidth, chartHeight);

      // 网格线
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      for (let i = 1; i < 5; i++) {
        const gridY = chartY + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(chartX, gridY);
        ctx.lineTo(chartX + chartWidth, gridY);
        ctx.stroke();
      }

      // 目标压力线（虚线）
      const targetY = chartY + chartHeight * 0.3;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(chartX, targetY);
      ctx.lineTo(chartX + chartWidth, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#22c55e';
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('目标压力', chartX + 5, targetY - 5);

      // 传统PID响应曲线（红色，振荡大）
      ctx.beginPath();
      ctx.moveTo(chartX, chartY + chartHeight - 10);
      for (let x = 0; x < chartWidth; x += 2) {
        const pidResponse = Math.sin(x * 0.03 + time * 0.5) * 40 * Math.exp(-x * 0.008) 
                          + Math.sin(x * 0.06) * 20 * Math.exp(-x * 0.005);
        const pidY = chartY + chartHeight - 10 - pidResponse;
        ctx.lineTo(chartX + x, pidY);
      }
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();

      // MPC响应曲线（绿色，平滑快速）
      ctx.beginPath();
      ctx.moveTo(chartX, chartY + chartHeight - 10);
      for (let x = 0; x < chartWidth; x += 2) {
        const mpcResponse = Math.min(chartHeight * 0.8, x * 0.6) 
                          + Math.sin(x * 0.08 + time * 0.5) * 3 * Math.exp(-x * 0.02);
        const mpcY = chartY + chartHeight - 10 - mpcResponse;
        ctx.lineTo(chartX + x, mpcY);
      }
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 图例
      const legendX = chartX + chartWidth - 120;
      const legendY = chartY + 20;

      // PID图例
      ctx.beginPath();
      ctx.moveTo(legendX, legendY);
      ctx.lineTo(legendX + 30, legendY);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('传统PID', legendX + 35, legendY + 4);

      // MPC图例
      ctx.beginPath();
      ctx.moveTo(legendX, legendY + 20);
      ctx.lineTo(legendX + 30, legendY + 20);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillText('MPC算法', legendX + 35, legendY + 24);

      // 动态对比点
      const compareX = chartX + ((time * 50) % chartWidth);
      const pidCompareY = chartY + chartHeight - 10 - Math.sin(compareX * 0.03) * 40 * Math.exp(-compareX * 0.008);
      const mpcCompareY = chartY + chartHeight - 10 - Math.min(chartHeight * 0.8, compareX * 0.6);

      // PID点
      ctx.beginPath();
      ctx.arc(compareX, pidCompareY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // MPC点
      ctx.beginPath();
      ctx.arc(compareX, mpcCompareY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.fill();

      // ========== 下半部分：关键指标对比表格 ==========
      const tableY = chartY + chartHeight + 30;
      const tableWidth = 400;
      const rowHeight = 35;

      // 表头
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(chartX, tableY, tableWidth, rowHeight);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('性能指标', chartX + 70, tableY + 22);
      ctx.fillText('传统PID', chartX + 180, tableY + 22);
      ctx.fillText('MPC算法', chartX + 280, tableY + 22);
      ctx.fillText('提升', chartX + 360, tableY + 22);

      // 表格边框
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(chartX, tableY, tableWidth, rowHeight * 5);

      // 表格数据行
      const metrics = [
        { name: '超调量', pid: '32%', mpc: '2%', improve: '94%' },
        { name: '调节时间', pid: '8.5s', mpc: '3.2s', improve: '62%' },
        { name: '稳定误差', pid: '±5%', mpc: '±0.5%', improve: '90%' },
        { name: '振荡次数', pid: '5次', mpc: '0次', improve: '100%' }
      ];

      metrics.forEach((metric, i) => {
        const rowY = tableY + rowHeight * (i + 1);
        
        // 分隔线
        ctx.beginPath();
        ctx.moveTo(chartX, rowY);
        ctx.lineTo(chartX + tableWidth, rowY);
        ctx.strokeStyle = '#334155';
        ctx.stroke();

        // 指标名称
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(metric.name, chartX + 70, rowY + 22);

        // PID值
        ctx.fillStyle = '#ef4444';
        ctx.fillText(metric.pid, chartX + 180, rowY + 22);

        // MPC值
        ctx.fillStyle = '#22c55e';
        ctx.fillText(metric.mpc, chartX + 280, rowY + 22);

        // 提升百分比
        ctx.fillStyle = '#8b5cf6';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.fillText('↑' + metric.improve, chartX + 360, rowY + 22);
      });

      // ========== 侧边性能提升图 ==========
      const perfX = chartX + tableWidth + 30;
      const perfY = chartY;
      const perfHeight = chartHeight + 30;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(perfX, perfY, 80, perfHeight);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(perfX, perfY, 80, perfHeight);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('综合', perfX + 40, perfY + 20);
      ctx.fillText('性能', perfX + 40, perfY + 35);

      // 性能提升柱状图
      const perfs = [
        { label: '速度', value: 70 },
        { label: '精度', value: 85 },
        { label: '稳定', value: 90 },
        { label: '能效', value: 60 }
      ];

      perfs.forEach((perf, i) => {
        const barY = perfY + 60 + i * 50;
        const barHeight = perf.value * 0.35;
        
        // 背景条
        ctx.fillStyle = '#334155';
        ctx.fillRect(perfX + 10, barY, 15, 40);
        
        // 数值条
        const animValue = (time * 30 + i * 20) % 100;
        const showValue = Math.min(perf.value, animValue);
        const valueHeight = showValue * 0.35;
        
        ctx.fillStyle = i % 2 === 0 ? '#8b5cf6' : '#06b6d4';
        ctx.fillRect(perfX + 10, barY + 40 - valueHeight, 15, valueHeight);
        
        // 标签
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px system-ui, sans-serif';
        ctx.fillText(perf.label, perfX + 40, barY + 25);
        
        // 百分比
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.fillText(perf.value + '%', perfX + 40, barY + 40);
      });

      ctx.globalAlpha = 1;
    };

    // 场景5：最终效果与价值（多维度展示）
    const drawScene5 = (width: number, height: number, time: number, alpha: number = 1) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DeepControl AIPC 最终效果与价值', centerX, 35);

      // ========== 顶部：核心优势卡片 ==========
      const advantages = [
        { icon: '⚡', label: '能效提升', value: '23%', color: '#f59e0b' },
        { icon: '🎯', label: '压力稳定', value: '±2%', color: '#22c55e' },
        { icon: '⏱️', label: '响应速度', value: '<1s', color: '#3b82f6' },
        { icon: '📊', label: '预测准确', value: '95%', color: '#8b5cf6' }
      ];

      advantages.forEach((adv, i) => {
        const ax = centerX - 180 + i * 120;
        const ay = centerY - 110;
        
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(ax - 50, ay - 30, 100, 60);
        ctx.strokeStyle = adv.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(ax - 50, ay - 30, 100, 60);
        
        ctx.font = '20px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(adv.icon, ax, ay - 8);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText(adv.label, ax, ay + 10);
        
        ctx.fillStyle = adv.color;
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.fillText(adv.value, ax, ay + 28);
      });

      // ========== 左侧：优化前后对比表格 ==========
      const tableX = centerX - 260;
      const tableY = centerY - 30;
      const tableWidth = 240;
      const rowHeight = 30;

      // 表头
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(tableX, tableY, tableWidth, rowHeight);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(tableX, tableY, tableWidth, rowHeight * 6);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('指标', tableX + 40, tableY + 20);
      ctx.fillText('优化前', tableX + 110, tableY + 20);
      ctx.fillText('优化后', tableX + 180, tableY + 20);
      ctx.fillText('改善', tableX + 220, tableY + 20);

      // 表格数据
      const comparisonData = [
        { metric: '能效比', before: '65%', after: '88%', improve: '+23%' },
        { metric: '超调量', before: '32%', after: '2%', improve: '-94%' },
        { metric: '调节时间', before: '8.5s', after: '3.2s', improve: '-62%' },
        { metric: '稳定误差', before: '±5%', after: '±0.5%', improve: '-90%' },
        { metric: '能耗', before: '100kWh', after: '77kWh', improve: '-23%' }
      ];

      comparisonData.forEach((row, i) => {
        const rowY = tableY + rowHeight * (i + 1);
        
        // 分隔线
        ctx.beginPath();
        ctx.moveTo(tableX, rowY);
        ctx.lineTo(tableX + tableWidth, rowY);
        ctx.strokeStyle = '#334155';
        ctx.stroke();

        // 数据
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText(row.metric, tableX + 40, rowY + 20);
        
        ctx.fillStyle = '#ef4444';
        ctx.fillText(row.before, tableX + 110, rowY + 20);
        
        ctx.fillStyle = '#22c55e';
        ctx.fillText(row.after, tableX + 180, rowY + 20);
        
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText(row.improve, tableX + 220, rowY + 20);
      });

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('优化前后对比', tableX + tableWidth / 2, tableY - 10);

      // ========== 右侧：柱状图展示 ==========
      const chartX = centerX + 20;
      const chartY = centerY - 30;
      const chartWidth = 240;
      const chartHeight = 180;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(chartX, chartY, chartWidth, chartHeight);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(chartX, chartY, chartWidth, chartHeight);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('性能提升分布', chartX + chartWidth / 2, chartY + 20);

      // 柱状图数据
      const barData = [
        { label: '能效', value: 23, color: '#f59e0b' },
        { label: '稳定', value: 30, color: '#22c55e' },
        { label: '响应', value: 40, color: '#3b82f6' },
        { label: '精度', value: 35, color: '#8b5cf6' },
        { label: '寿命', value: 20, color: '#06b6d4' }
      ];

      const barWidth = 30;
      const barGap = 15;
      const startX = chartX + 25;

      barData.forEach((bar, i) => {
        const bx = startX + i * (barWidth + barGap);
        const barHeight = bar.value * 3.5;
        const animValue = (time * 50 + i * 30) % 100;
        const showHeight = Math.min(barHeight, (animValue / 100) * barHeight);
        
        // 柱子背景
        ctx.fillStyle = '#334155';
        ctx.fillRect(bx, chartY + chartHeight - 30, barWidth, barHeight);
        
        // 数值柱
        ctx.fillStyle = bar.color;
        ctx.fillRect(bx, chartY + chartHeight - 30 - showHeight, barWidth, showHeight);
        
        // 标签
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(bar.label, bx + barWidth / 2, chartY + chartHeight - 10);
        
        // 百分比
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.fillText(bar.value + '%', bx + barWidth / 2, chartY + chartHeight - 30 - showHeight - 5);
      });

      ctx.globalAlpha = 1;
    };

    // 场景6：不同时段用水需求与自动调节流程
    const drawScene6 = (width: number, height: number, time: number, alpha: number = 1) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('不同时段用水需求与自动调节', centerX, 35);

      // ========== 左侧：不同时段用水需求曲线 ==========
      const chartX = centerX - 220;
      const chartY = centerY - 80;
      const chartWidth = 200;
      const chartHeight = 180;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(chartX, chartY, chartWidth, chartHeight);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(chartX, chartY, chartWidth, chartHeight);

      // 标题
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('24小时用水需求曲线', chartX + chartWidth / 2, chartY + 20);

      // 网格线
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      for (let i = 1; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(chartX, chartY + (chartHeight / 5) * i);
        ctx.lineTo(chartX + chartWidth, chartY + (chartHeight / 5) * i);
        ctx.stroke();
      }

      // 时间标签
      const timeLabels = ['0时', '6时', '12时', '18时', '24时'];
      timeLabels.forEach((label, i) => {
        const lx = chartX + (chartWidth / 4) * i;
        const ly = chartY + chartHeight + 15;
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, lx, ly);
      });

      // 用水需求曲线
      ctx.beginPath();
      ctx.moveTo(chartX, chartY + chartHeight - 20);
      
      const demandPoints = [
        { x: 0, y: 0.3 },
        { x: 0.15, y: 0.6 },
        { x: 0.25, y: 0.9 },
        { x: 0.35, y: 0.7 },
        { x: 0.5, y: 0.4 },
        { x: 0.6, y: 0.5 },
        { x: 0.75, y: 0.8 },
        { x: 0.85, y: 0.95 },
        { x: 0.95, y: 0.5 },
        { x: 1.0, y: 0.3 }
      ];

      demandPoints.forEach((point, i) => {
        const px = chartX + point.x * chartWidth;
        const py = chartY + chartHeight - 20 - point.y * (chartHeight - 40);
        ctx.lineTo(px, py);
      });

      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 当前时间指示点
      const currentTime = (time * 0.2) % 1;
      const currentX = chartX + currentTime * chartWidth;
      
      // 计算当前Y值
      let currentY = chartY + chartHeight - 20;
      for (let i = 0; i < demandPoints.length - 1; i++) {
        if (currentTime >= demandPoints[i].x && currentTime <= demandPoints[i + 1].x) {
          const t = (currentTime - demandPoints[i].x) / (demandPoints[i + 1].x - demandPoints[i].x);
          const y = demandPoints[i].y + t * (demandPoints[i + 1].y - demandPoints[i].y);
          currentY = chartY + chartHeight - 20 - y * (chartHeight - 40);
          break;
        }
      }

      ctx.beginPath();
      ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ec4899';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 当前时间标注
      const currentHour = Math.floor(currentTime * 24);
      const currentMin = Math.floor((currentTime * 24 - currentHour) * 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`当前: ${currentHour}:${currentMin.toString().padStart(2, '0')}`, chartX + chartWidth / 2, chartY + chartHeight + 35);

      // ========== 中间：时段分类说明 ==========
      const timePeriods = [
        { period: '低谷期', time: '0-6时', demand: '低', color: '#64748b', pressure: '0.38 MPa' },
        { period: '早高峰', time: '6-9时', demand: '高', color: '#ef4444', pressure: '0.42 MPa' },
        { period: '平稳期', time: '9-16时', demand: '中', color: '#22c55e', pressure: '0.40 MPa' },
        { period: '晚高峰', time: '16-21时', demand: '极高', color: '#f97316', pressure: '0.45 MPa' },
        { period: '休息期', time: '21-24时', demand: '低', color: '#64748b', pressure: '0.38 MPa' }
      ];

      const periodX = centerX + 20;
      const periodY = chartY;

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('时段分类', periodX + 50, chartY + 20);

      timePeriods.forEach((period, i) => {
        const py = periodY + 40 + i * 30;
        
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(periodX, py, 140, 25);
        
        ctx.fillStyle = period.color;
        ctx.fillRect(periodX, py, 5, 25);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(period.period + ' ' + period.time, periodX + 10, py + 17);
        
        ctx.fillStyle = period.color;
        ctx.textAlign = 'right';
        ctx.fillText(period.demand, periodX + 135, py + 17);
      });

      // ========== 右侧：自动调节流程图 ==========
      const flowX = periodX + 160;
      const flowY = chartY;

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('自动调节流程', flowX + 60, chartY + 20);

      const flowNodes = [
        { name: '监测用水需求', y: flowY + 45, color: '#3b82f6' },
        { name: 'MPC算法预测', y: flowY + 80, color: '#8b5cf6' },
        { name: '计算最优压力', y: flowY + 115, color: '#06b6d4' },
        { name: '调节变频泵', y: flowY + 150, color: '#22c55e' },
        { name: '实时反馈优化', y: flowY + 185, color: '#f59e0b' }
      ];

      flowNodes.forEach((node, i) => {
        const nx = flowX + 60;
        
        // 节点背景
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(nx - 50, node.y - 12, 100, 24);
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(nx - 50, node.y - 12, 100, 24);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, nx, node.y + 4);
        
        // 连接箭头
        if (i < flowNodes.length - 1) {
          ctx.beginPath();
          ctx.moveTo(nx, node.y + 12);
          ctx.lineTo(nx, flowNodes[i + 1].y - 12);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1;
          ctx.stroke();
          
          // 箭头
          ctx.beginPath();
          ctx.moveTo(nx - 3, flowNodes[i + 1].y - 15);
          ctx.lineTo(nx, flowNodes[i + 1].y - 12);
          ctx.lineTo(nx + 3, flowNodes[i + 1].y - 15);
          ctx.fillStyle = '#475569';
          ctx.fill();
        }
      });

      // ========== 底部：实时调节效果展示 ==========
      const effectY = chartY + chartHeight + 50;
      
      // 不同时段的压力设定值和实际值对比
      const periods = ['低谷期', '早高峰', '平稳期', '晚高峰', '休息期'];
      const setPressures = [0.38, 0.42, 0.40, 0.45, 0.38];
      const actualPressures = [0.38, 0.42, 0.40, 0.45, 0.38];

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('压力设定 vs 实际压力', chartX, effectY);

      periods.forEach((period, i) => {
        const px = chartX + i * 80;
        const py = effectY + 25;
        
        // 时段标签
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(period, px + 25, py + 15);
        
        // 设定压力条
        const setBarWidth = setPressures[i] * 150;
        ctx.fillStyle = '#475569';
        ctx.fillRect(px, py + 25, setBarWidth, 10);
        
        // 实际压力条（带动画）
        const actualBarWidth = actualPressures[i] * 150 + Math.sin(time * 3 + i) * 5;
        ctx.fillStyle = i === Math.floor(currentTime * 5) ? '#ec4899' : '#22c55e';
        ctx.fillRect(px, py + 25, actualBarWidth, 10);
        
        // 数值标注
        ctx.fillStyle = '#ffffff';
        ctx.font = '9px system-ui, sans-serif';
        ctx.fillText(setPressures[i].toFixed(2), px, py + 45);
      });

      // 当前时段标注
      const currentPeriodIndex = Math.floor(currentTime * 5);
      const currentPeriodColor = ['#64748b', '#ef4444', '#22c55e', '#f97316', '#64748b'][currentPeriodIndex];
      ctx.fillStyle = currentPeriodColor;
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('当前时段: ' + periods[currentPeriodIndex], centerX, effectY + 60);

      ctx.globalAlpha = 1;
    };

    // 根据场景绘制函数
    const drawScene = (sceneNum: number, width: number, height: number, time: number, alpha: number) => {
      switch (sceneNum) {
        case 1: drawScene1(width, height, time, alpha); break;
        case 2: drawScene2(width, height, time, alpha); break;
        case 3: drawScene3(width, height, time, alpha); break;
        case 4: drawScene6(width, height, time, alpha); break;
        case 5: drawScene4(width, height, time, alpha); break;
        case 6: drawScene5(width, height, time, alpha); break;
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
