/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BLACK STAR ORBIT — Official Emblem & Brand Logo
 * Renders the uploaded iconic Black Star emblem (/assets/aistudio/image_5dde6a23.png)
 * with futuristic mission-grade framing and atmospheric glow.
 */

import React from 'react';

interface BlackStarLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
  className?: string;
}

export const BlackStarLogo: React.FC<BlackStarLogoProps> = ({
  size = 'md',
  showGlow = true,
  className = '',
}) => {
  const sizeMap = {
    xs: { box: 'w-6 h-6 rounded-md', img: 'w-4 h-4' },
    sm: { box: 'w-8 h-8 rounded-lg', img: 'w-5 h-5' },
    md: { box: 'w-10 h-10 rounded-xl', img: 'w-6 h-6' },
    lg: { box: 'w-12 h-12 rounded-2xl', img: 'w-8 h-8' },
    xl: { box: 'w-16 h-16 rounded-3xl', img: 'w-11 h-11' },
  };

  const { box, img } = sizeMap[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${box} ${
        showGlow ? 'shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/40' : 'ring-1 ring-white/20'
      } bg-gradient-to-br from-cyan-400 via-sky-300 to-amber-300 p-0.5 transition-transform duration-300 hover:scale-105 ${className}`}
      title="BLACK STAR ORBIT Official Mission Insignia"
    >
      {/* High-contrast inner crest for the Black Star */}
      <div className="w-full h-full rounded-[inherit] bg-gradient-to-br from-white via-slate-100 to-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
        <img
          src="/assets/aistudio/image_5dde6a23.png"
          alt="Black Star Orbit Logo"
          className={`${img} object-contain select-none filter contrast-125 drop-shadow-sm`}
          draggable={false}
        />
      </div>
    </div>
  );
};
