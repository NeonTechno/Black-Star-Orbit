/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BLACK STAR ORBIT — Spacecraft Flight Readiness & NORAD Tracking HUD
 * Inspired by NASA Artemis-7 Launch Readiness (image_92cdc03e) and 
 * Satellite Ground Track & NORAD Catalog telemetry (image_5161b84c).
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, 
  Gauge, 
  Satellite, 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  Radio, 
  Cpu, 
  Zap, 
  Layers, 
  Crosshair, 
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { ElectricCard } from '../common/ElectricLightningSystem';

interface SpacecraftFlightHudProps {
  onOpenWorkbench?: () => void;
}

export const SpacecraftFlightHud: React.FC<SpacecraftFlightHudProps> = ({ onOpenWorkbench }) => {
  // Target Launch Date: October 2026 (Space Apps / Artemis milestone)
  const [countdown, setCountdown] = useState({
    days: 135,
    hours: 21,
    minutes: 38,
    seconds: 42
  });

  // Active Blueprint view state
  const [selectedSubsystem, setSelectedSubsystem] = useState<'cryo' | 'optics' | 'telemetry' | 'propulsion'>('cryo');

  // Ground track canvas ref
  const orbitCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Telemetry chart canvas ref
  const telemetryCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Countdown timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Render Satellite Ground Track Map (image_5161b84c inspired)
  useEffect(() => {
    const canvas = orbitCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      const width = (canvas.width = canvas.offsetWidth || 500);
      const height = (canvas.height = canvas.offsetHeight || 260);

      ctx.clearRect(0, 0, width, height);

      // Deep space background
      ctx.fillStyle = '#030816';
      ctx.fillRect(0, 0, width, height);

      // World grid lines (Latitude / Longitude)
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 1;

      // Meridians
      for (let x = 0; x < width; x += width / 12) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      // Parallels
      for (let y = 0; y < height; y += height / 6) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Equator highlight
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Continents stylized outlines (simplified geometric markers)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      // Americas rough block
      ctx.fillRect(width * 0.18, height * 0.25, width * 0.15, height * 0.5);
      // Eurasia rough block
      ctx.fillRect(width * 0.45, height * 0.18, width * 0.35, height * 0.45);
      // Africa rough block
      ctx.fillRect(width * 0.46, height * 0.45, width * 0.15, height * 0.4);

      // Draw Orbit Ground Track (Sinusoidal trajectory)
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.setLineDash([5, 4]);

      const orbitAmplitude = height * 0.38;
      const centerY = height / 2;

      for (let x = 0; x <= width; x += 4) {
        const angle = (x / width) * Math.PI * 2 * 1.5 - t * 0.2;
        const y = centerY + Math.sin(angle) * orbitAmplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Current Satellite Position (t-driven)
      const currentSatX = (width * 0.62 + Math.sin(t * 0.3) * (width * 0.25)) % width;
      const currentSatAngle = (currentSatX / width) * Math.PI * 2 * 1.5 - t * 0.2;
      const currentSatY = centerY + Math.sin(currentSatAngle) * orbitAmplitude;

      // Footprint Sensor Cone
      ctx.beginPath();
      ctx.arc(currentSatX, currentSatY, 32, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Satellite Crosshair & Marker
      ctx.beginPath();
      ctx.arc(currentSatX, currentSatY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#38BDF8';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pulsing beacon ring
      const pulseRadius = 6 + (Math.sin(t * 4) + 1) * 6;
      ctx.beginPath();
      ctx.arc(currentSatX, currentSatY, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.8 - pulseRadius / 18})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('SPHEREx-01 [NORAD 48274]', currentSatX + 12, currentSatY - 6);
      ctx.fillStyle = '#72E5F7';
      ctx.font = '8px monospace';
      ctx.fillText(`702km | 7.52 km/s | INC 97.8°`, currentSatX + 12, currentSatY + 5);

      // Ground Stations: Goldstone DSN, Madrid, Canberra
      const stations = [
        { name: 'DSN Goldstone', x: width * 0.22, y: height * 0.36 },
        { name: 'DSN Madrid', x: width * 0.48, y: height * 0.33 },
        { name: 'DSN Canberra', x: width * 0.82, y: height * 0.75 },
      ];

      stations.forEach(st => {
        ctx.beginPath();
        ctx.arc(st.x, st.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#10B981';
        ctx.fill();
        ctx.fillStyle = '#94A3B8';
        ctx.font = '8px monospace';
        ctx.fillText(st.name, st.x + 6, st.y + 3);
      });

      t += 0.015;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // 2. Render Live Subsystem Telemetry Chart (image_92cdc03e inspired)
  useEffect(() => {
    const canvas = telemetryCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;
    const dataPointsCount = 60;
    const historyA: number[] = new Array(dataPointsCount).fill(67);
    const historyB: number[] = new Array(dataPointsCount).fill(92);

    const renderChart = () => {
      const width = (canvas.width = canvas.offsetWidth || 400);
      const height = (canvas.height = canvas.offsetHeight || 130);

      ctx.clearRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += height / 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Add new telemetry point
      if (tick % 6 === 0) {
        historyA.shift();
        historyA.push(67 + Math.sin(tick * 0.08) * 3 + (Math.random() - 0.5) * 2);
        historyB.shift();
        historyB.push(92 + Math.cos(tick * 0.05) * 2 + (Math.random() - 0.5) * 1.5);
      }

      // Draw Series A (Readiness & Power: Cyan)
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#38BDF8';
      for (let i = 0; i < historyA.length; i++) {
        const x = (i / (dataPointsCount - 1)) * width;
        const y = height - (historyA[i] / 100) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw Series B (Thermal Nominal Curve: Ultraviolet)
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#8B5CF6';
      for (let i = 0; i < historyB.length; i++) {
        const x = (i / (dataPointsCount - 1)) * width;
        const y = height - (historyB[i] / 100) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      tick++;
      animId = requestAnimationFrame(renderChart);
    };

    renderChart();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. TOP DUAL COMMAND BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT: Launch Countdown Clock & 67% Readiness Gauge (Artemis-7 / SPHEREx) */}
        <ElectricCard glow="cyan" className="lg:col-span-6 p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Rocket className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                  NASA FLIGHT READINESS STATUS
                </span>
                <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2">
                  <span>SPHEREx & Artemis-7 Vector</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    T-MINUS COUNTDOWN
                  </span>
                </h3>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>VANDENBERG SLC-4E</span>
            </div>
          </div>

          {/* Countdown Clock Display (135d : 21h : 38m : 42s) */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-3 rounded-xl bg-[#050B1A] border border-[#1E293B]">
              <div className="text-2xl sm:text-3xl font-mono font-black text-cyan-300 tabular-nums">
                {String(countdown.days).padStart(3, '0')}
              </div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                DAYS
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#050B1A] border border-[#1E293B]">
              <div className="text-2xl sm:text-3xl font-mono font-black text-cyan-300 tabular-nums">
                {String(countdown.hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                HOURS
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#050B1A] border border-[#1E293B]">
              <div className="text-2xl sm:text-3xl font-mono font-black text-cyan-300 tabular-nums">
                {String(countdown.minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                MINUTES
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#050B1A] border border-[#1E293B]">
              <div className="text-2xl sm:text-3xl font-mono font-black text-cyan-300 tabular-nums animate-pulse">
                {String(countdown.seconds).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                SECONDS
              </div>
            </div>
          </div>

          {/* Circular 67% Readiness Ring & Telemetry Chart */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
            {/* SVG Circular Gauge */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-[#050B1A] border border-[#1E293B]">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#1E293B"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#38BDF8"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 * (1 - 0.67)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 shadow-lg shadow-cyan-500/50"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-mono font-black text-white tabular-nums">
                    67%
                  </span>
                  <span className="text-[9px] font-mono text-cyan-400 uppercase font-semibold">
                    READINESS
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-2 text-center">
                Stage 2 Environmental Testing
              </span>
            </div>

            {/* Live Telemetry Sparkline & Subsystem Status */}
            <div className="sm:col-span-8 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Avionics & Thermal Bus</span>
                </span>
                <span className="text-cyan-400 font-bold">102 Channels Synced</span>
              </div>

              {/* Chart canvas */}
              <div className="h-20 w-full rounded-lg bg-[#050B1A] border border-[#1E293B] overflow-hidden p-1 relative">
                <canvas ref={telemetryCanvasRef} className="w-full h-full" />
                <div className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-500">
                  Cyan: Bus Power | Violet: Thermal SNR
                </div>
              </div>

              {/* Status pills */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <div className="p-1.5 rounded bg-[#050B1A] border border-emerald-500/30 flex items-center justify-between">
                  <span className="text-slate-400">Cryo Focal Plane:</span>
                  <span className="text-emerald-400 font-bold">0.78 K</span>
                </div>
                <div className="p-1.5 rounded bg-[#050B1A] border border-cyan-500/30 flex items-center justify-between">
                  <span className="text-slate-400">Delta-V Budget:</span>
                  <span className="text-cyan-400 font-bold">420 m/s</span>
                </div>
              </div>
            </div>
          </div>
        </ElectricCard>

        {/* RIGHT: Satellite Orbital Ground Track & "CODE NOARD" (image_5161b84c inspired) */}
        <ElectricCard glow="purple" className="lg:col-span-6 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Satellite className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">
                  ORBITAL SURVEILLANCE & NOARD TRACK
                </span>
                <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2">
                  <span>CODE NOARD: #48274</span>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/30">
                    SSO POLAR LEO
                  </span>
                </h3>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <Crosshair className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              <span>ACTIVE RADAR TRACK</span>
            </div>
          </div>

          {/* Interactive World Map & Ground Track Canvas */}
          <div className="relative rounded-xl overflow-hidden border border-[#1E293B] bg-[#030816] h-44">
            <canvas ref={orbitCanvasRef} className="w-full h-full" />
            <div className="absolute top-2 left-2 bg-[#050B1A]/85 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-slate-300 border border-[#1E293B]">
              Orbit Inclination: 97.8° • Sun-Synchronous
            </div>
            <div className="absolute bottom-2 right-2 bg-[#050B1A]/85 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 border border-emerald-500/30">
              DSN Lock: Goldstone Pass in 42m
            </div>
          </div>

          {/* "IA INSIGHTS" & Orbital Parameters Box (image_5161b84c) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* NOARD Telemetry Specs */}
            <div className="p-3 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1 font-mono text-xs">
              <div className="text-[10px] text-purple-400 font-bold uppercase flex items-center gap-1">
                <Radio className="w-3 h-3" />
                <span>Ephemeris Vectors</span>
              </div>
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span>Altitude:</span>
                <span className="text-white font-bold">702.4 km</span>
              </div>
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span>Orbital Velocity:</span>
                <span className="text-cyan-400 font-bold">7.52 km/s</span>
              </div>
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span>Orbital Period:</span>
                <span className="text-white font-bold">98.4 min</span>
              </div>
            </div>

            {/* IA Insights (AI Mission Telemetry Intel) */}
            <div className="p-3 rounded-xl bg-[#050B1A] border border-purple-500/30 space-y-1 text-xs">
              <div className="text-[10px] font-mono text-purple-400 font-bold uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>IA INSIGHTS (Mission Copilot)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Zero anomalous atmospheric drag. Passive V-groove radiators maintaining 80K baseline. 
                Next 3.05 µm infrared water ice calibration nominal.
              </p>
            </div>
          </div>
        </ElectricCard>

      </div>
    </div>
  );
};
