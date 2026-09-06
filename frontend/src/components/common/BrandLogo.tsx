// WardAlert Sentinel - Brand Logo Component
import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  align = 'left',
  className = ''
}) => {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 42 : 34;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Red Shield with ECG Heartbeat line */}
      <div className="relative flex-shrink-0">
        <svg
          width={iconSize}
          height={iconSize * 1.15}
          viewBox="0 0 32 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          {/* Shield Outline & Gradient Fill */}
          <path
            d="M16 1L3 5.5V17.5C3 26.5 8.5 34.5 16 37C23.5 34.5 29 26.5 29 17.5V5.5L16 1Z"
            fill="url(#shieldGrad)"
            stroke="#70121F"
            strokeWidth="1.2"
          />
          {/* White ECG Heartbeat line through center */}
          <path
            d="M6 19H11L13 14L16 25L19 12L21 21L23 19H26"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="shieldGrad" x1="16" y1="1" x2="16" y2="37" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9B1C1C" />
              <stop offset="1" stopColor="#7F1D1D" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className={`flex flex-col leading-tight ${align === 'right' ? 'text-right' : 'text-left'}`}>
        <div className="flex items-baseline gap-1">
          <span className="font-extrabold tracking-tight text-[#1E293B] text-[1.05rem]">WardAlert</span>
          <span className="font-bold tracking-tight text-[#8B1E2F] text-[1.05rem]">Sentinel</span>
        </div>
        {showSubtitle && (
          <span className="text-[0.68rem] font-medium text-slate-500 tracking-tight">
            Smart Alert-Fatigue Analyzer
          </span>
        )}
      </div>
    </div>
  );
};
