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

  // 1. Skyscraper Vertical Lateral Izquierdo (160x600) - Solo visible en pantallas ultra anchas (2XL)
  if (type === 'skyscraper-left') {
    return (
      <aside 
        aria-label="Espacio Publicitario Lateral Izquierdo"
        className={`hidden 2xl:flex items-center justify-center w-[160px] h-[600px] fixed left-4 top-24 z-20 ${className}`}
      >
        <div className="w-[160px] h-[600px] flex flex-col items-center justify-center text-center">
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600/60 hover:text-slate-800 transition-colors">
            <LayoutGrid className="w-5 h-5 mb-1.5 opacity-40" />
            <span className="text-[11px] font-bold">160 x 600</span>
            <span className="text-[9px] uppercase tracking-wider opacity-75 mt-0.5">Anuncio Lateral</span>
            <span className="text-[8px] font-mono opacity-50 mt-1">{slotId}</span>
          </div>
        </div>
        {/* PEGA AQUÍ TU SCRIPT DE ANUNCIO LATERAL IZQUIERDO */}
      </aside>
    );
  }

  // 2. Skyscraper Vertical Lateral Derecho (160x600) - Solo visible en pantallas ultra anchas (2XL)
  if (type === 'skyscraper-right') {
    return (
      <aside 
        aria-label="Espacio Publicitario Lateral Derecho"
        className={`hidden 2xl:flex items-center justify-center w-[160px] h-[600px] fixed right-4 top-24 z-20 ${className}`}
      >
        <div className="w-[160px] h-[600px] flex flex-col items-center justify-center text-center">
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600/60 hover:text-slate-800 transition-colors">
            <LayoutGrid className="w-5 h-5 mb-1.5 opacity-40" />
            <span className="text-[11px] font-bold">160 x 600</span>
            <span className="text-[9px] uppercase tracking-wider opacity-75 mt-0.5">Anuncio Lateral</span>
            <span className="text-[8px] font-mono opacity-50 mt-1">{slotId}</span>
          </div>
        </div>
        {/* PEGA AQUÍ TU SCRIPT DE ANUNCIO LATERAL DERECHO */}
      </aside>
    );
  }

  // 3. Banner Horizontal Leaderboard (728x90) - Con auto-escalado responsive para teléfonos móviles
  if (type === 'leaderboard') {
    if (slotId?.toUpperCase().includes('SUPERIOR')) {
      return (
        <aside 
          aria-label="Espacio Publicitario Superior"
          className={`w-full flex items-center justify-center my-1.5 px-2 overflow-hidden ${className}`}
        >
          {/* En móviles escala el banner 728x90 para que entre al 100% sin recortarse ni provocar desborde */}
          <div className="w-full flex justify-center items-center overflow-hidden">
            <div 
              ref={bannerRef}
              className="origin-top flex items-center justify-center scale-[0.46] xs:scale-[0.52] sm:scale-[0.72] md:scale-100 h-[46px] xs:h-[52px] sm:h-[68px] md:h-[90px] w-[728px] shrink-0"
            />
          </div>
        </aside>
      );
    }

    return (
      <div 
        aria-label="Espacio Publicitario Horizontal"
        className={`w-full max-w-[728px] mx-auto my-3 px-3 flex items-center justify-center min-h-[60px] sm:min-h-[90px] ${className}`}
      >
        <div className="w-full py-2.5 flex items-center justify-center gap-2 text-slate-600/60 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-black/10 px-2 py-0.5 rounded">Anuncio</span>
          <span className="font-semibold text-[11px]">Banner 728 x 90</span>
          <span className="text-[10px] font-mono opacity-50">({slotId})</span>
        </div>
        {/* PEGA AQUÍ TU SCRIPT DE BANNER HORIZONTAL (728x90) */}
      </div>
    );
  }

  // 4. Banner intermedio / móvil (Inline 300x250 o 320x50)
  return (
    <div 
      aria-label="Espacio Publicitario de Contenido"
      className={`w-full max-w-md mx-auto my-3 px-3 flex items-center justify-center ${className}`}
    >
      <div className="w-full py-2 flex items-center justify-center gap-2 text-slate-600/60 text-xs">
        <span className="text-[9px] font-bold uppercase tracking-wider bg-black/10 px-2 py-0.5 rounded">Anuncio</span>
        <span className="text-[11px] font-medium">Espacio Móvil (300x250 o 320x50)</span>
        <span className="text-[10px] font-mono opacity-50">• {slotId}</span>
      </div>
      {/* PEGA AQUÍ TU SCRIPT DE ANUNCIO DE CONTENIDO */}
    </div>
  );
}
