/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BLACK STAR ORBIT — Electric Lightning & Energy Animation System
 * Futuristic energy arcs, electric glass borders, and reactive lighting.
 */

import React, { useRef, useEffect, useState, type ReactNode } from 'react';

interface ElectricLightningCanvasProps {
  className?: string;
  intensity?: 'subtle' | 'moderate' | 'dramatic';
  color?: string;
  glowColor?: string;
  interactive?: boolean;
}

/**
 * Procedural Electric Lightning & Energy Discharge Canvas
 * Generates realistic branching lightning filaments and particle sparks
 */
export const ElectricLightningCanvas: React.FC<ElectricLightningCanvasProps> = ({
  className = '',
  intensity = 'subtle',
  color = '#38BDF8',
  glowColor = '#8B5CF6',
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth || 800);
    let height = (canvas.height = canvas.offsetHeight || 600);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle Sparks
    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
    }
    const sparks: Spark[] = [];

    // Branching Arc Generator
    function drawLightningArc(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      displacement: number,
      branchProbability: number
    ) {
      if (displacement < 4) {
        ctx!.beginPath();
        ctx!.moveTo(x1, y1);
        ctx!.lineTo(x2, y2);
        ctx!.stroke();
        return;
      }

      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displacement;
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displacement;

      drawLightningArc(x1, y1, midX, midY, displacement / 2, branchProbability);
      drawLightningArc(midX, midY, x2, y2, displacement / 2, branchProbability);

      // Branching offshoot
      if (Math.random() < branchProbability) {
        const branchAngle = (Math.random() - 0.5) * Math.PI * 0.7;
        const length = (displacement * 1.5) * (Math.random() * 0.5 + 0.5);
        const endX = midX + Math.cos(branchAngle) * length;
        const endY = midY + Math.sin(branchAngle) * length;

        ctx!.save();
        ctx!.lineWidth = Math.max(0.6, ctx!.lineWidth * 0.6);
        ctx!.strokeStyle = 'rgba(114, 229, 247, 0.45)';
        drawLightningArc(midX, midY, endX, endY, displacement / 2.5, branchProbability * 0.5);
        ctx!.restore();
      }
    }

    let frameCount = 0;
    const intervalTicks = intensity === 'dramatic' ? 45 : intensity === 'moderate' ? 90 : 160;

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // Periodically trigger a subtle lightning discharge
      if (frameCount % intervalTicks === 0 || (mouseRef.current.active && frameCount % 35 === 0)) {
        const startX = mouseRef.current.active
          ? mouseRef.current.x + (Math.random() - 0.5) * 80
          : width * 0.5 + (Math.random() - 0.5) * (width * 0.4);
        const startY = mouseRef.current.active
          ? mouseRef.current.y
          : height * 0.2 + (Math.random() - 0.5) * 60;

        const targetX = startX + (Math.random() - 0.5) * 220;
        const targetY = startY + Math.random() * 160 + 40;

        // Draw outer glow pass
        ctx.save();
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = 18;
        ctx.globalAlpha = 0.55;
        drawLightningArc(startX, startY, targetX, targetY, 40, 0.35);
        ctx.restore();

        // Draw bright core pass
        ctx.save();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 8;
        ctx.globalAlpha = 0.9;
        drawLightningArc(startX, startY, targetX, targetY, 40, 0.25);
        ctx.restore();

        // Spawn sparks at the strike point
        for (let i = 0; i < 6; i++) {
          sparks.push({
            x: targetX,
            y: targetY,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3 - 0.5,
            life: 0,
            maxLife: Math.random() * 20 + 15,
            size: Math.random() * 2 + 1,
          });
        }
      }

      // Update and render sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life++;

        const alpha = 1 - s.life / s.maxLife;
        if (alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(114, 229, 247, ${alpha})`;
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };

    if (interactive) {
      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mouseleave', onMouseLeave);
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        canvas.removeEventListener('mousemove', onMouseMove);
        canvas.removeEventListener('mouseleave', onMouseLeave);
      }
    };
  }, [intensity, color, glowColor, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none w-full h-full overflow-hidden ${className}`}
    />
  );
};

interface ElectricCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  active?: boolean;
  glow?: 'cyan' | 'purple' | 'gold' | 'emerald';
}

/**
 * Electric Glass Card with animated border energy beam and soft glow
 */
export const ElectricCard: React.FC<ElectricCardProps> = ({
  children,
  className = '',
  onClick,
  interactive = true,
  active = false,
  glow = 'cyan',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const glowBorderClass = {
    cyan: isHovered || active ? 'border-[#38BDF8]/70 shadow-[0_0_25px_-5px_rgba(56,189,248,0.35)]' : 'border-[#1E293B]',
    purple: isHovered || active ? 'border-[#8B5CF6]/70 shadow-[0_0_25px_-5px_rgba(139,92,246,0.35)]' : 'border-[#1E293B]',
    gold: isHovered || active ? 'border-[#F5C451]/70 shadow-[0_0_25px_-5px_rgba(245,196,81,0.35)]' : 'border-[#1E293B]',
    emerald: isHovered || active ? 'border-[#10B981]/70 shadow-[0_0_25px_-5px_rgba(16,185,129,0.35)]' : 'border-[#1E293B]',
  }[glow];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      className={`relative rounded-2xl bg-[#0B1630]/75 backdrop-blur-xl border transition-all duration-300 ${glowBorderClass} ${
        interactive ? 'cursor-pointer hover:-translate-y-1' : ''
      } ${className}`}
    >
      {/* Running electric energy beam along top-edge on hover */}
      {(isHovered || active) && (
        <div className="absolute -top-px left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#72E5F7] to-transparent animate-pulse pointer-events-none" />
      )}

      {children}
    </div>
  );
};

interface EnergyButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const EnergyButton: React.FC<EnergyButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  disabled = false,
  type = 'button',
}) => {
  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-[#050811] font-bold shadow-lg shadow-[#38BDF8]/25 hover:shadow-[#38BDF8]/40 border border-[#72E5F7]/40',
    secondary:
      'bg-[#0B1630]/90 text-[#F8FAFC] border border-[#38BDF8]/30 hover:border-[#38BDF8] hover:bg-[#112248] shadow-md',
    ghost:
      'bg-transparent text-[#A7B4CC] hover:text-[#F8FAFC] hover:bg-[#0B1630]/60 border border-transparent hover:border-[#1E293B]',
  }[variant];

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`relative energy-btn inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variantStyles} ${className}`}
    >
      {children}
    </button>
  );
};
