/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NASA WORM LOGO & WORDMARK
 * The iconic 1975 Richard Danne & Bruce Blackburn NASA "Worm" insignia.
 * Vector-accurate monoline geometry with rounded terminals and crossbar-less 'A's.
 */

import React from 'react';

interface NasaWormLogoProps {
  className?: string;
  color?: string; // e.g. '#FFFFFF', '#FC3D21' (NASA Red), '#38BDF8' (Electric Cyan)
  height?: number | string;
  glow?: boolean;
}

export const NasaWormLogo: React.FC<NasaWormLogoProps> = ({
  className = '',
  color = '#FFFFFF',
  height = 24,
  glow = true,
}) => {
  return (
    <svg
      viewBox="0 0 110 28"
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${glow ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.45)]' : ''} ${className}`}
      aria-label="NASA Logo"
      role="img"
    >
      <title>NASA</title>
      {/* 
        Official NASA Worm Geometry:
        - Tube width: 4.8px, Stroke: 4.8px
        - Monoline rounded caps (stroke-linecap: round, stroke-linejoin: round)
      */}
      <g stroke={color} strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round">
        {/* 'N': Up, down-right, up */}
        <path d="M 4 25.6 L 4 6.4 L 20 25.6 L 20 6.4" />

        {/* First 'A': Up-right to peak, down-right (no crossbar) */}
        <path d="M 28 25.6 L 37.5 6.4 L 47 25.6" />

        {/* 'S': Top curve, diagonal descent, bottom curve */}
        <path d="M 72 8.5 C 70 6.4 64.5 5.5 60 6.5 C 55 7.5 53.5 11.5 54.5 14.5 C 55.5 17.5 60 18.5 66 20 C 72 21.5 73.5 24 72 26 C 70.5 28 64 28.5 58 26.5 C 55 25.5 53.5 24 53 22" />

        {/* Second 'A': Up-right to peak, down-right (no crossbar) */}
        <path d="M 80 25.6 L 89.5 6.4 L 99 25.6" />
      </g>
    </svg>
  );
};
