'use client';

import React from 'react';

interface DinoMascotProps {
  state: 'idle' | 'hunting' | 'ready';
  className?: string;
}

export default function DinoMascot({ state, className = '' }: DinoMascotProps) {
  const isHunting = state === 'hunting';
  const isReady = state === 'ready';

  return (
    <div className={`relative inline-block select-none ${className}`}>
      <style jsx>{`
        /* Boca mordiendo / masticando */
        @keyframes chompJaw {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(22deg);
          }
        }

        /* Patas corriendo alternadas */
        @keyframes legRunA {
          0% {
            transform: rotate(-32deg);
          }
          100% {
            transform: rotate(32deg);
          }
        }

        @keyframes legRunB {
          0% {
            transform: rotate(32deg);
          }
          100% {
            transform: rotate(-32deg);
          }
        }

        /* Cola moviéndose */
        @keyframes tailWag {
          0%, 100% {
            transform: rotate(-4deg);
          }
          50% {
            transform: rotate(8deg);
          }
        }

        /* Salto victorioso al llegar al 100% */
        @keyframes victoryHop {
          0%, 100% {
            transform: translateY(0) scale(1.1);
          }
          50% {
            transform: translateY(-14px) scale(1.15) rotate(5deg);
          }
        }

        .dino-jaw {
          transform-origin: 34px 20px;
          animation: ${isHunting ? 'chompJaw 0.22s infinite ease-in-out' : 'none'};
        }

        .dino-leg-left {
          transform-origin: 22px 32px;
          animation: ${isHunting ? 'legRunA 0.18s infinite alternate ease-in-out' : 'none'};
        }

        .dino-leg-right {
          transform-origin: 29px 32px;
          animation: ${isHunting ? 'legRunB 0.18s infinite alternate ease-in-out' : 'none'};
        }

        .dino-tail {
          transform-origin: 10px 28px;
          animation: tailWag 0.6s infinite ease-in-out;
        }

        .dino-container-anim {
          animation: ${isReady ? 'victoryHop 0.5s infinite alternate ease-in-out' : 'none'};
        }
      `}</style>

      {/* SVG Dinosaurio orientado hacia la DERECHA persiguiendo la presa */}
      <div className="dino-container-anim">
        <svg
          width="54"
          height="54"
          viewBox="0 0 54 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_4px_12px_rgba(16,185,129,0.45)]"
        >
          {/* Cola */}
          <path
            className="dino-tail"
            d="M 6 32 Q 2 28 4 23 Q 8 26 14 27 Z"
            fill="#059669"
          />

          {/* Pierna izquierda (detrás) */}
          <g className="dino-leg-left">
            <path
              d="M 20 31 L 18 43 L 14 43 L 14 46 L 24 46 L 23 33 Z"
              fill="#047857"
            />
          </g>

          {/* Cuerpo principal */}
          <path
            d="M 12 28 Q 11 20 18 16 Q 25 13 32 12 L 34 16 Q 26 17 25 24 Q 24 33 18 35 Q 13 34 12 28 Z"
            fill="#10B981"
          />

          {/* Panza verde claro */}
          <path
            d="M 17 26 Q 23 25 23 31 Q 20 35 17 33 Z"
            fill="#34D399"
          />

          {/* Cabeza Superior (incluye ojo y cresta dorsal) */}
          <path
            d="M 28 13 L 34 8 L 47 8 L 49 13 L 49 18 L 36 18 L 32 13 Z"
            fill="#10B981"
          />

          {/* Espinas en la espalda */}
          <polygon points="17,17 19,13 21,17" fill="#047857" />
          <polygon points="23,15 25,11 27,15" fill="#047857" />
          <polygon points="29,13 31,9 33,13" fill="#047857" />

          {/* Ojo brillante cian */}
          <circle cx="41" cy="11.5" r="2.2" fill="#FFFFFF" />
          <circle cx="42" cy="11.5" r="1.2" fill="#0B0F19" />
          <circle cx="42.5" cy="11" r="0.5" fill="#00F0FF" />

          {/* Mandíbula inferior (Boca que abre y cierra al correr) */}
          <g className="dino-jaw">
            <path
              d="M 36 19 L 48 19 L 46 23 L 36 21 Z"
              fill="#059669"
            />
            {/* Dientes blancos afilados */}
            <polygon points="38,19 39,21 40,19" fill="#FFFFFF" />
            <polygon points="42,19 43,21 44,19" fill="#FFFFFF" />
            <polygon points="45,19 46,21 47,19" fill="#FFFFFF" />
          </g>

          {/* Brazo pequeño T-Rex */}
          <path
            d="M 31 22 Q 35 23 36 25 Q 34 26 31 24 Z"
            fill="#059669"
          />

          {/* Pierna derecha (frente) */}
          <g className="dino-leg-right">
            <path
              d="M 27 30 L 29 42 L 25 42 L 25 46 L 35 46 L 33 32 Z"
              fill="#10B981"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
