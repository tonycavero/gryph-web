'use client';

import React, { useState } from 'react';
import { Check, Crown, Film, Sparkles, X, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export default function PremiumModal({ isOpen, onClose, reason }: PremiumModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [subscribedMessage, setSubscribedMessage] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = () => {
    setSubscribedMessage(true);
    setTimeout(() => {
      setSubscribedMessage(false);
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-4xl shadow-figma-lg overflow-hidden border border-neutral-200/90">
        {/* Top Header */}
        <div className="p-8 pb-4 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-full p-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-neutral-100 border border-neutral-200/80 px-3 py-1 rounded-full text-xs font-semibold text-neutral-800 mb-3">
            <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>AnyLoad Studio Pro</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Descargas en 4K y Películas Sin Límites
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
            {reason || 'Acceso completo a descargas de videos largos de 1 hora, 2 horas, películas completas y máxima fidelidad 4K.'}
          </p>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 pt-2">
          {/* Feature Grid */}
          <div className="grid sm:grid-cols-2 gap-3 my-5">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
              <div className="p-2 rounded-xl bg-neutral-900 text-white shrink-0">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-xs">Películas y Series</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">Videos largos de 1 hora, 2 horas o más sin cortes.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
              <div className="p-2 rounded-xl bg-neutral-900 text-white shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-xs">Ultra HD 4K y 8K</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">Fidelidad 2160p a 60 FPS sin pérdida de compresión.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
              <div className="p-2 rounded-xl bg-neutral-900 text-white shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-xs">Velocidad Turbo 10x</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">Canales CDN dedicados sin colas de procesamiento.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
              <div className="p-2 rounded-xl bg-neutral-900 text-white shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-xs">Cero Anuncios</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">Experiencia 100% limpia sin esperas ni publicidad.</p>
              </div>
            </div>
          </div>

          {/* Pricing Switcher */}
          <div className="flex justify-center my-4">
            <div className="bg-neutral-100 p-1 rounded-full flex items-center text-xs font-semibold border border-neutral-200/80">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white shadow-figma-sm text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Mensual
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-neutral-900 shadow-figma-sm text-white'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <span>Anual</span>
                <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  -50%
                </span>
              </button>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-3xl bg-neutral-50 border border-neutral-200 text-center mb-6">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
                {billingCycle === 'yearly' ? '$2.49' : '$4.99'}
              </span>
              <span className="text-neutral-500 text-xs font-medium">/ mes</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              {billingCycle === 'yearly' ? 'Facturado $29.88 al año • Cancela cuando quieras' : 'Sin compromiso de permanencia'}
            </p>
          </div>

          {subscribedMessage ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center text-xs font-semibold">
              ✨ ¡Modo de prueba activado! Próximamente se integrará la pasarela de pago oficial.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleCheckout}
                className="flex-1 py-3 px-6 rounded-full bg-neutral-900 hover:bg-black text-white font-semibold text-xs shadow-figma flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <span>Adquirir Plan Pro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="py-3 px-5 rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-medium text-xs transition-colors"
              >
                Continuar Gratis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
