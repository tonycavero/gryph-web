'use client';

import React from 'react';
import AdUnit from './AdUnit';

interface AdBannerProps {
  type?: 'leaderboard' | 'skyscraper-left' | 'skyscraper-right' | 'inline' | 'rectangle';
  className?: string;
  slotId?: string;
}

// Códigos y llaves oficiales de Adsterra
const ADSTERRA_KEYS = {
  LEADERBOARD_728x90: '806c29549bcb2a6261ace73b3c126e07',
  SKYSCRAPER_160x600: 'dd74915bb9c26603f9416405a116962c',
  RECTANGLE_300x250: 'b59bae1fbb1b87a4ce9852e47bcf7203',
};

export default function AdBanner({
  type = 'leaderboard',
  className = '',
  slotId = 'AD_SLOT',
}: AdBannerProps) {
  // 1. Skyscraper Vertical Lateral Izquierdo (160x600)
  // Oculto en móviles y pantallas menores a 1180px para no tapar el cuadro principal de descarga
  if (type === 'skyscraper-left') {
    return (
      <aside
        aria-label="Espacio Publicitario Lateral Izquierdo"
        className={`hidden min-[1180px]:flex items-center justify-center w-[160px] h-[600px] fixed left-2 xl:left-4 2xl:left-8 top-28 z-20 ${className}`}
      >
        <div className="w-[160px] h-[600px] flex items-center justify-center">
          <AdUnit
            adKey={ADSTERRA_KEYS.SKYSCRAPER_160x600}
            width={160}
            height={600}
          />
        </div>
      </aside>
    );
  }

  // 2. Skyscraper Vertical Lateral Derecho (160x600)
  // Oculto en móviles y pantallas menores a 1180px para no tapar el cuadro principal de descarga
  if (type === 'skyscraper-right') {
    return (
      <aside
        aria-label="Espacio Publicitario Lateral Derecho"
        className={`hidden min-[1180px]:flex items-center justify-center w-[160px] h-[600px] fixed right-2 xl:right-4 2xl:right-8 top-28 z-20 ${className}`}
      >
        <div className="w-[160px] h-[600px] flex items-center justify-center">
          <AdUnit
            adKey={ADSTERRA_KEYS.SKYSCRAPER_160x600}
            width={160}
            height={600}
          />
        </div>
      </aside>
    );
  }

  // 3. Banner Horizontal Leaderboard (728x90) - Top o Bottom
  // Se baja con margen generoso respecto al header (mt-5 sm:mt-7) y se auto-escala matemáticamente desde el centro
  // con centrado absoluto para que NUNCA se recorte a la mitad horizontal ni verticalmente en teléfonos móviles.
  if (type === 'leaderboard') {
    return (
      <aside
        aria-label="Espacio Publicitario Horizontal 728x90"
        className={`w-full flex flex-col items-center justify-center mt-5 sm:mt-7 mb-3 sm:mb-5 px-2 overflow-hidden ${className}`}
      >
        <div className="relative mx-auto flex items-center justify-center overflow-hidden w-[310px] min-[360px]:w-[348px] min-[400px]:w-[386px] sm:w-[530px] md:w-[728px] h-[42px] min-[360px]:h-[46px] min-[400px]:h-[52px] sm:h-[68px] md:h-[90px]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[728px] h-[90px] flex items-center justify-center origin-center scale-[0.42] min-[360px]:scale-[0.478] min-[400px]:scale-[0.53] sm:scale-[0.72] md:scale-100 transition-transform">
            <AdUnit
              adKey={ADSTERRA_KEYS.LEADERBOARD_728x90}
              width={728}
              height={90}
            />
          </div>
        </div>
      </aside>
    );
  }

  // 4. Banner Central Móvil / Scroll (300x250)
  // Inmediatamente visible al hacer scroll debajo del botón "Descargar" / área de resultados
  return (
    <aside
      aria-label="Espacio Publicitario Central 300x250"
      className={`w-full max-w-[320px] sm:max-w-[340px] mx-auto my-6 sm:my-8 flex flex-col items-center justify-center overflow-hidden ${className}`}
    >
      <div className="w-[300px] h-[250px] flex items-center justify-center">
        <AdUnit
          adKey={ADSTERRA_KEYS.RECTANGLE_300x250}
          width={300}
          height={250}
        />
      </div>
    </aside>
  );
}
