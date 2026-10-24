'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

const STORAGE_KEY = 'cookie_consent_accepted';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        setIsVisible(true);
      }
    } catch {
      // Si localStorage está bloqueado o restringido en modo incógnito, no romper la UI
    }
  }, []);

  const handleAccept = () => {
    setIsClosing(true);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {}

    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <aside
      role="region"
      aria-label="Aviso de cookies"
      className={`fixed bottom-0 inset-x-0 z-[9999999] bg-slate-950/95 backdrop-blur-md border-t border-slate-800 text-slate-200 px-4 py-3.5 sm:py-4 shadow-2xl transition-all duration-300 ease-out ${
        isClosing ? 'opacity-0 translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="hidden sm:flex w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/30 items-center justify-center shrink-0 text-amber-400">
            <Cookie className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-snug sm:leading-relaxed">
            Usamos cookies para personalizar anuncios y mejorar tu experiencia. Al continuar navegando, aceptas nuestra{' '}
            <Link
              href="/privacidad"
              className="text-amber-400 hover:text-amber-300 underline underline-offset-2 font-medium transition-colors"
            >
              política de privacidad
            </Link>
            .
          </p>
        </div>

        <button
          type="button"
          onClick={handleAccept}
          className="w-full sm:w-auto px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-105 active:scale-95 shrink-0 select-none cursor-pointer"
        >
          Aceptar
        </button>
      </div>
    </aside>
  );
}
