'use client';

import React, { useState, useEffect } from 'react';

interface TRexRunnerLoadingProps {
  progressPercent?: number;
}

export default function TRexRunnerLoading({ progressPercent = 0 }: TRexRunnerLoadingProps) {
  const [legFrame, setLegFrame] = useState<0 | 1>(0);
  const [isJumping, setIsJumping] = useState(false);

  // Ciclo de animación de patas corriendo (alterna cada 110ms)
  useEffect(() => {
    const legInterval = setInterval(() => {
      setLegFrame((prev) => (prev === 0 ? 1 : 0));
    }, 110);
    return () => clearInterval(legInterval);
  }, []);

  // Ciclo de salto periódico (salta cada 2.8 segundos)
  useEffect(() => {
    const jumpInterval = setInterval(() => {
      setIsJumping(true);
      setTimeout(() => {
        setIsJumping(false);
      }, 650);
    }, 2800);
    return () => clearInterval(jumpInterval);
  }, []);

  // Mensaje de estado dinámico según el porcentaje
  const statusMessage =
    progressPercent < 35
      ? 'Conectando con la plataforma...'
      : progressPercent < 75
      ? 'Extrayendo secuencias de video en HD y audio MP3...'
      : 'Generando enlaces de descarga de máxima fidelidad...';

  return (
    <div className="w-full max-w-2xl mx-auto my-5 p-4 sm:p-5 bg-white/80 sm:bg-white/70 backdrop-blur-2xl border border-white/80 rounded-3xl sm:rounded-4xl shadow-[0_16px_45px_rgba(60,82,96,0.18)] select-none animate-fadeIn">
      {/* Cabecera del Estado de Carga con Porcentaje y LED */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs sm:text-sm font-black text-slate-800 tracking-wide uppercase">
            Cazando video en curso
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-900 text-amber-300 shadow-sm border border-slate-700/40">
          <span>{Math.min(Math.max(progressPercent, 5), 99)}%</span>
        </div>
      </div>

      {/* Escenario de Animación: Horizonte Urbano (Skyline) en bucle continuo con T-Rex */}
      <div className="relative w-full h-28 sm:h-32 bg-slate-100/70 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 shadow-inner flex items-end">
        {/* Skyline Animado Infinito (Imagen 2 en bucle continuo) */}
        <div className="absolute inset-0 flex w-[200%] animate-skyline-scroll pointer-events-none select-none">
          <img
            src="/city-skyline-seamless.png"
            alt="Skyline Ciudad"
            className="w-1/2 h-full object-cover shrink-0 select-none opacity-85"
            draggable={false}
          />
          <img
            src="/city-skyline-seamless.png"
            alt="Skyline Ciudad"
            className="w-1/2 h-full object-cover shrink-0 select-none opacity-85"
            draggable={false}
          />
        </div>

        {/* Línea de suelo base de refuerzo */}
        <div className="absolute bottom-[20px] left-0 right-0 h-[2px] bg-slate-900/80 pointer-events-none" />

        {/* Dinosaurio T-Rex Pixel Art (Estilo Chrome Runner) */}
        <div
          className={`absolute left-10 sm:left-16 bottom-[20px] transition-transform select-none ${
            isJumping
              ? 'animate-dino-jump-arc drop-shadow-[0_12px_8px_rgba(0,0,0,0.15)]'
              : 'translate-y-0'
          }`}
        >
          {/* T-Rex SVG Pixel Art */}
          <svg
            width="46"
            height="50"
            viewBox="0 0 46 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-slate-900 select-none"
            style={{ shapeRendering: 'crispEdges' }}
          >
            {/* Cabeza del T-Rex */}
            <rect x="23" y="0" width="15" height="3" fill="currentColor" />
            <rect x="23" y="3" width="21" height="3" fill="currentColor" />
            <rect x="23" y="6" width="22" height="3" fill="currentColor" />
            <rect x="23" y="9" width="22" height="3" fill="currentColor" />
            <rect x="23" y="12" width="20" height="3" fill="currentColor" />
            <rect x="23" y="15" width="13" height="3" fill="currentColor" />
            
            {/* Ojo pixel blanco */}
            <rect x="26" y="4" width="3" height="3" fill="#FFFFFF" />

            {/* Hocico y mandíbula */}
            <rect x="36" y="12" width="9" height="3" fill="currentColor" />
            <rect x="30" y="15" width="15" height="3" fill="currentColor" />

            {/* Cuello y Cuerpo */}
            <rect x="20" y="18" width="11" height="3" fill="currentColor" />
            <rect x="17" y="21" width="14" height="3" fill="currentColor" />
            <rect x="14" y="24" width="17" height="3" fill="currentColor" />
            <rect x="12" y="27" width="18" height="3" fill="currentColor" />
            <rect x="10" y="30" width="19" height="3" fill="currentColor" />
            <rect x="12" y="33" width="16" height="3" fill="currentColor" />

            {/* Brazos diminutos de T-Rex */}
            <rect x="31" y="24" width="5" height="3" fill="currentColor" />
            <rect x="33" y="27" width="3" height="4" fill="currentColor" />

            {/* Cola que se eleva hacia la izquierda */}
            <rect x="0" y="21" width="5" height="3" fill="currentColor" />
            <rect x="3" y="24" width="5" height="3" fill="currentColor" />
            <rect x="5" y="27" width="5" height="3" fill="currentColor" />
            <rect x="7" y="30" width="5" height="3" fill="currentColor" />

            {/* Patas animadas (alternando frame 0 y frame 1, o suspendidas en salto) */}
            {isJumping ? (
              // En salto: patas flexionadas
              <>
                <rect x="15" y="36" width="5" height="7" fill="currentColor" />
                <rect x="17" y="41" width="6" height="3" fill="currentColor" />
                <rect x="23" y="36" width="5" height="6" fill="currentColor" />
                <rect x="25" y="40" width="6" height="3" fill="currentColor" />
              </>
            ) : legFrame === 0 ? (
              // Frame 0: Pata izquierda atrás, pata derecha abajo
              <>
                {/* Pata izquierda hacia atrás */}
                <rect x="13" y="36" width="5" height="6" fill="currentColor" />
                <rect x="11" y="42" width="5" height="5" fill="currentColor" />
                <rect x="9" y="47" width="7" height="3" fill="currentColor" />
                {/* Pata derecha estirada hacia abajo */}
                <rect x="23" y="36" width="5" height="8" fill="currentColor" />
                <rect x="23" y="44" width="5" height="3" fill="currentColor" />
                <rect x="23" y="47" width="7" height="3" fill="currentColor" />
              </>
            ) : (
              // Frame 1: Pata izquierda abajo, pata derecha adelante
              <>
                {/* Pata izquierda estirada hacia abajo */}
                <rect x="15" y="36" width="5" height="8" fill="currentColor" />
                <rect x="15" y="44" width="5" height="3" fill="currentColor" />
                <rect x="15" y="47" width="7" height="3" fill="currentColor" />
                {/* Pata derecha doblada hacia adelante */}
                <rect x="24" y="36" width="5" height="6" fill="currentColor" />
                <rect x="26" y="42" width="5" height="5" fill="currentColor" />
                <rect x="26" y="47" width="7" height="3" fill="currentColor" />
              </>
            )}
          </svg>

          {/* Partículas de polvo al correr en tierra (solo cuando no está saltando) */}
          {!isJumping && (
            <div className="absolute -left-3 bottom-0 flex gap-0.5 pointer-events-none opacity-60">
              <span className="w-1.5 h-1.5 rounded-xs bg-slate-500 animate-dust" />
              <span className="w-1 h-1 rounded-xs bg-slate-400 animate-dust" style={{ animationDelay: '0.15s' }} />
            </div>
          )}
        </div>

        {/* Nube pixel flotante decorativa en la parte superior derecha */}
        <div className="absolute top-3 right-8 opacity-45 pointer-events-none flex gap-1 items-end">
          <div className="w-6 h-2 bg-slate-400 rounded-full" />
          <div className="w-8 h-3 bg-slate-400 rounded-full -ml-3 mb-1" />
          <div className="w-5 h-2 bg-slate-400 rounded-full -ml-2" />
        </div>
      </div>

      {/* Subtexto Informativo de Carga */}
      <div className="mt-3 text-center">
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          {statusMessage}
        </p>
      </div>
    </div>
  );
}
