'use client';

import React, { useEffect, useState } from 'react';

interface AdUnitProps {
  adKey: string;
  width: number;
  height: number;
  className?: string;
}

/**
 * Componente modular para inyectar anuncios de Adsterra de forma 100% aislada
 * mediante iframe sandbox, evitando colisiones de window.atOptions y errores de hidratación en React/Next.js.
 */
export default function AdUnit({
  adKey,
  width,
  height,
  className = '',
}: AdUnitProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        style={{ width: `${width}px`, height: `${height}px` }}
        className={`max-w-full ${className}`}
      />
    );
  }

  // Plantilla HTML aislada para cada anuncio de Adsterra
  const iframeHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      background: transparent;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '${adKey}',
      'format' : 'iframe',
      'height' : ${height},
      'width' : ${width},
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://bellnewyork.org/22/${adKey}"></script>
</body>
</html>`;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden shrink-0 ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <iframe
        title={`adsterra-${adKey}`}
        srcDoc={iframeHtml}
        width={width}
        height={height}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          border: 'none',
          overflow: 'hidden',
          display: 'block',
        }}
        scrolling="no"
        frameBorder="0"
      />
    </div>
  );
}
