'use client';

import React, { useEffect, useRef } from 'react';
import { LayoutGrid } from 'lucide-react';

interface AdBannerProps {
  type?: 'leaderboard' | 'skyscraper-left' | 'skyscraper-right' | 'inline' | 'rectangle';
  className?: string;
  slotId?: string;
}

export default function AdBanner({ type = 'leaderboard', className = '', slotId = 'AD_SLOT' }: AdBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isSuperior = type === 'leaderboard' && slotId?.toUpperCase().includes('SUPERIOR');
    if (isSuperior && bannerRef.current) {
      bannerRef.current.innerHTML = '';

      const confScript = document.createElement('script');
      confScript.type = 'text/javascript';
      confScript.innerHTML = `
        atOptions = {
          'key' : '806c29549bcb2a6261ace73b3c126e07',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;

      const adScript = document.createElement('script');
      adScript.type = 'text/javascript';
      adScript.src = 'https://bellnewyork.org/22/806c29549bcb2a6261ace73b3c126e07';

      bannerRef.current.appendChild(confScript);
      bannerRef.current.appendChild(adScript);
    }
  }, [type, slotId]);
  // 1. Skyscraper Vertical Lateral Izquierdo (160x600)
  // Oculto en pantallas medianas o pequeñas (hidden 2xl:flex), asegurando que el centro no se comprima
  if (type === 'skyscraper-left') {
    return (
      <aside 
        aria-label="Espacio Publicitario Lateral Izquierdo"
        className={`hidden 2xl:flex flex-col items-center justify-center w-[160px] h-[600px] bg-white/40 backdrop-blur-xl border-2 border-dashed border-white/60 rounded-3xl p-3 text-center fixed left-4 top-24 z-20 shadow-sm transition-all ${className}`}
      >
        <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-700 bg-white/80 px-2.5 py-0.5 rounded-full mb-3 shadow-xs">
          Anuncio Lateral
        </span>
        <div className="flex-1 w-full flex flex-col items-center justify-center bg-white/30 rounded-2xl border border-white/40 p-3">
          <LayoutGrid className="w-6 h-6 text-slate-600 mb-2 opacity-60" />
          <span className="text-xs font-black text-slate-800">160 x 600</span>
          <span className="text-[10px] text-slate-600 font-medium mt-1">Skyscraper Izquierdo</span>
          <p className="text-[9px] text-slate-500 mt-3 leading-tight">
            Listo para AdSense, Adsterra o Monetag
          </p>
        </div>
        <span className="text-[8px] text-slate-500 uppercase mt-2 font-semibold tracking-wider">
          {slotId}
        </span>
        {/* PEGA AQUÍ TU SCRIPT DE ANUNCIO LATERAL IZQUIERDO */}
      </aside>
    );
  }

  // 2. Skyscraper Vertical Lateral Derecho (160x600)
  if (type === 'skyscraper-right') {
    return (
      <aside 
        aria-label="Espacio Publicitario Lateral Derecho"
        className={`hidden 2xl:flex flex-col items-center justify-center w-[160px] h-[600px] bg-white/40 backdrop-blur-xl border-2 border-dashed border-white/60 rounded-3xl p-3 text-center fixed right-4 top-24 z-20 shadow-sm transition-all ${className}`}
      >
        <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-700 bg-white/80 px-2.5 py-0.5 rounded-full mb-3 shadow-xs">
          Anuncio Lateral
        </span>
        <div className="flex-1 w-full flex flex-col items-center justify-center bg-white/30 rounded-2xl border border-white/40 p-3">
          <LayoutGrid className="w-6 h-6 text-slate-600 mb-2 opacity-60" />
          <span className="text-xs font-black text-slate-800">160 x 600</span>
          <span className="text-[10px] text-slate-600 font-medium mt-1">Skyscraper Derecho</span>
          <p className="text-[9px] text-slate-500 mt-3 leading-tight">
            Listo para AdSense, Adsterra o Monetag
          </p>
        </div>
        <span className="text-[8px] text-slate-500 uppercase mt-2 font-semibold tracking-wider">
          {slotId}
        </span>
        {/* PEGA AQUÍ TU SCRIPT DE ANUNCIO LATERAL DERECHO */}
      </aside>
    );
  }

  // 3. Banner Horizontal Leaderboard (728x90) con margen y padding compactos
  if (type === 'leaderboard') {
    // Si es el banner superior, se renderiza el script publicitario de Adsterra
    if (slotId?.toUpperCase().includes('SUPERIOR')) {
      return (
        <aside 
          aria-label="Espacio Publicitario Superior (728x90)"
          className={`w-full max-w-4xl mx-auto my-2 p-2 sm:p-2.5 bg-white/45 backdrop-blur-xl border border-white/60 rounded-2xl sm:rounded-3xl text-center relative overflow-hidden shadow-xs transition-all hover:border-white/80 flex items-center justify-center min-h-[95px] ${className}`}
        >
          {/* Contenedor del anuncio de Adsterra 728x90 */}
          <div 
            ref={bannerRef}
            className="w-full flex items-center justify-center overflow-x-auto min-h-[90px]"
          />
        </aside>
      );
    }

    return (
      <div 
        aria-label="Espacio Publicitario Horizontal"
        className={`w-full max-w-4xl mx-auto my-2 p-2.5 sm:p-3 bg-white/45 backdrop-blur-xl border-2 border-dashed border-white/60 rounded-2xl sm:rounded-3xl text-center relative overflow-hidden shadow-xs transition-all hover:border-white/80 ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2 py-0.5">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-slate-900/80 text-white flex items-center justify-center font-black text-[11px] shrink-0 shadow-sm">
              AD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-900">ESPACIO PUBLICITARIO</span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-white/80 text-slate-700 px-2 py-0.5 rounded-full border border-white/60">
                  728 x 90
                </span>
              </div>
              <p className="text-[10px] text-slate-600 mt-0.5 hidden sm:block">
                Espacio reservado para tu banner superior o inferior de Google AdSense / Adsterra.
              </p>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-white/70 border border-white/80 text-[9px] font-bold text-slate-700 tracking-wider uppercase whitespace-nowrap shadow-xs">
            {slotId}
          </div>
        </div>
        {/* PEGA AQUÍ TU SCRIPT DE BANNER HORIZONTAL (728x90) */}
      </div>
    );
  }

  // 4. Banner entre contenido (Inline 300x250 o 728x90)
  return (
    <div 
      aria-label="Espacio Publicitario de Contenido"
      className={`w-full p-3 bg-white/40 backdrop-blur-xl border-2 border-dashed border-white/50 rounded-2xl text-center text-xs text-slate-700 my-2.5 flex flex-wrap items-center justify-center gap-2 shadow-xs ${className}`}
    >
      <span className="bg-slate-900 text-white px-2 py-0.5 rounded-full text-[9px] font-black">ANUNCIO</span>
      <span className="font-semibold text-[11px]">Espacio para banner intermedio (300x250 o 728x90)</span>
      <span className="text-[10px] text-slate-500 font-mono">• {slotId}</span>
      {/* PEGA AQUÍ TU SCRIPT DE ANUNCIO DE CONTENIDO */}
    </div>
  );
}
