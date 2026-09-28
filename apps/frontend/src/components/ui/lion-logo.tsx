'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LionLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  text?: string;
}

export function LionLogo({ className = '', size = 36, showText = false, text = 'Codentra' }: LionLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <motion.div
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.2 }}
        className="relative flex items-center justify-center bg-white rounded-md overflow-hidden shrink-0"
        style={{ width: size, height: size, padding: size * 0.04 }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background */}
          <rect width="100" height="100" fill="#FFFFFF" />

          {/* Solid Black Flower / Scalloped Mane */}
          <path
            d="M 50 8
               C 56 8, 59 13, 64 12
               C 70 11, 74 17, 78 19
               C 83 22, 87 21, 89 27
               C 92 33, 89 38, 91 44
               C 92 50, 92 55, 89 60
               C 87 66, 83 67, 78 71
               C 74 74, 70 80, 64 79
               C 59 78, 56 83, 50 83
               C 44 83, 41 78, 36 79
               C 30 80, 26 74, 22 71
               C 17 67, 13 66, 11 60
               C 8 55, 8 50, 9 44
               C 11 38, 8 33, 11 27
               C 13 21, 17 22, 22 19
               C 26 17, 30 11, 36 12
               C 41 13, 44 8, 50 8 Z"
            fill="#000000"
          />

          {/* White Head Contour with Ears */}
          <path
            d="M 37 32
               C 32 24, 43 22, 44 29
               C 46 29, 54 29, 56 29
               C 57 22, 68 24, 63 32
               C 70 36, 70 56, 64 64
               C 58 72, 42 72, 36 64
               C 30 56, 30 36, 37 32 Z"
            fill="#FFFFFF"
          />

          {/* Eyes */}
          <circle cx="43" cy="48" r="4" fill="#000000" />
          <circle cx="57" cy="48" r="4" fill="#000000" />

          {/* Nose */}
          <path
            d="M 45 55
               C 45 53, 55 53, 55 55
               C 55 59, 50 62, 50 62
               C 50 62, 45 59, 45 55 Z"
            fill="#000000"
          />

          {/* Smile W-Curve */}
          <path
            d="M 43 62
               C 46 66, 49 65, 50 62
               C 51 65, 54 66, 57 62"
            stroke="#000000"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </motion.div>

      {showText && (
        <span className="font-display font-bold tracking-tight text-foreground" style={{ fontSize: size * 0.55 }}>
          {text}
        </span>
      )}
    </div>
  );
}
