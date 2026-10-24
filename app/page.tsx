'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Search, 
  AlertCircle, 
  Clock, 
  Crown, 
  Film, 
  Check, 
  Sparkles, 
  X,
  Zap,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  User,
  Clipboard,
  Trash2,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Music,
  Video
} from 'lucide-react';
import AdBanner from '@/components/AdBanner';
import PremiumModal from '@/components/PremiumModal';
import DinoMascot from '@/components/DinoMascot';
import { VideoInfo, FormatOption, detectPlatform, buildPlatformFormats } from '@/lib/types';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://gryph-web.onrender.com').replace(/\/+$/, '');

export default function GryphHomePage() {
  const [url, setUrl] = useState('');
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'hunting' | 'ready'>('idle');
  const [progressPercent, setProgressPercent] = useState(0);
  const [mascotLeft, setMascotLeft] = useState(10);
  const [preyState, setPreyState] = useState<'idle' | 'eaten'>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Video download state
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const [premiumReason, setPremiumReason] = useState('');
  const [imgError, setImgError] = useState(false);

  const detectedCurrentPlatform = detectPlatform(url.trim());

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    // Keep-alive silencioso para despertar a Render al abrir la página
    fetch(`${API_BASE_URL}/api/health`).catch(() => {});
  }, []);

  const stageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const resetToIdle = () => {
    setCurrentPhase('idle');
    setProgressPercent(0);
    setMascotLeft(10);
    setPreyState('idle');
    setImgError(false);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        resetToIdle();
      }
    } catch {
      showToast('Por favor pega el enlace manualmente en el campo.');
    }
  };


  const handleFetch = async () => {
    if (currentPhase === 'ready') {
      const targetUrl = url.trim();
      const detectedPlatform = detectPlatform(targetUrl);
      if (targetUrl) {
        handleDownloadFormat({
          formatId: '720p',
          quality: `${detectedPlatform} Video (720p HD)`,
          resolution: '720p HD',
          ext: 'mp4',
          type: 'video',
          isPremium: false,
        });
      }
      resetToIdle();
      return;
    }

    const cleanUrl = url.trim();
    if (!cleanUrl) {
      showToast('Por favor pega un enlace válido antes de continuar.');
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    const detectedPlatform = detectPlatform(cleanUrl);
    setCurrentPhase('hunting');
    setPreyState('idle');
    setProgressPercent(0);
    setLoadingInfo(true);
    setImgError(false);

    // Preparar opciones de formato de forma inmediata para cualquier plataforma
    const immediateInfo: VideoInfo = {
      id: 'media_' + Date.now(),
      title: `${detectedPlatform} Video & Audio`,
      url: cleanUrl,
      thumbnail: '',
      duration: 0,
      durationFormatted: '0:00',
      uploader: detectedPlatform,
      platform: detectedPlatform,
      formats: buildPlatformFormats(detectedPlatform),
      isLongVideo: false,
    };
    setVideoInfo(immediateInfo);

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
      setLoadingInfo(false);
    }, 12000);

    fetch(`${API_BASE_URL}/api/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: cleanUrl }),
      signal: abortController.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(timeoutId);
        setLoadingInfo(false);
        if (data.success && data.data) {
          setVideoInfo(data.data);
          setImgError(false);
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
        setLoadingInfo(false);
      });

    const startX = 10;
    const stageWidth = stageRef.current ? stageRef.current.clientWidth : 550;
    const targetX = stageWidth - 75;
    const duration = 3000;
    const startTime = performance.now();

    const animateHunt = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const percent = Math.floor(progress * 100);
      setProgressPercent(percent);

      const newX = startX + (targetX - startX) * progress;
      setMascotLeft(newX);

      if (progress < 1) {
        requestAnimationFrame(animateHunt);
      } else {
        setProgressPercent(100);
        setCurrentPhase('ready');
        setPreyState('eaten');
      }
    };

    requestAnimationFrame(animateHunt);
  };

  const handleDownloadFormat = async (format: FormatOption) => {
    if (format.isPremium) {
      setPremiumReason(format.premiumReason || 'Este formato o duración requiere el Plan Pro.');
      setIsPremiumOpen(true);
      return;
    }

    if (!videoInfo) return;
    setDownloadingId(format.formatId);
    showToast(`Iniciando descarga de ${format.quality}...`);

    const downloadTitle = encodeURIComponent(`${videoInfo.platform} ${format.type === 'audio' ? 'Audio' : 'Video'}`);
    const downloadUrl = `${API_BASE_URL}/api/download?url=${encodeURIComponent(videoInfo.url)}&format=${format.formatId}&title=${downloadTitle}`;

    // Detectar si el usuario está en un dispositivo móvil (iOS, Android, etc.)
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent);

    if (isMobile) {
      showToast(`✓ Descargando archivo directamente en tu teléfono...`);
      // En móviles, la navegación directa activa el gestor nativo de descargas de Safari/Chrome
      // evitando bloqueos de popups o límites de memoria de JavaScript (Blobs)
      window.location.href = downloadUrl;
      setTimeout(() => {
        setDownloadingId(null);
      }, 4000);
      return;
    }

    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) {
        let errMsg = 'No se pudo procesar la descarga de este enlace.';
        try {
          const json = await res.json();
          if (json.error) errMsg = json.error;
        } catch {}
        showToast(`⚠️ ${errMsg}`);
        setDownloadingId(null);
        return;
      }

      const blob = await res.blob();
      const filename = `${videoInfo.platform} ${format.type === 'audio' ? 'Audio' : 'Video'}.${format.ext}`;
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      }, 2000);

      showToast(`✓ ¡Descarga lista! Guardando archivo.`);
    } catch (err: any) {
      // Si el fetch como blob falla en algún navegador, usamos la descarga nativa directa
      window.location.href = downloadUrl;
    } finally {
      setDownloadingId(null);
    }
  };

  const faqs = [
    {
      q: '¿Cómo descargo solo el audio de un video?',
      a: 'Pega tu enlace de Facebook, YouTube, TikTok o Pinterest y presiona Cazar. En la tarjeta de formatos podrás elegir la opción específica de audio (por ejemplo "Facebook Audio" o "YouTube Audio"), la cual se descargará en formato MP3 con la mejor calidad estéreo.',
    },
    {
      q: '¿Cómo funciona el cargador del dinosaurio?',
      a: 'La mascota avanza persiguiendo la presa mientras un indicador en tiempo real muestra el porcentaje de carga del 0% al 100%. Al alcanzar el 100%, el dinosaurio llega a la presa y la descarga queda 100% ensamblada y lista.',
    },
    {
      q: '¿Por qué la versión básica es gratis?',
      a: 'Nuestra versión gratuita es 100% libre para videos de hasta 5 minutos y calidades estándar (720p, 1080p y MP3) gracias a los anuncios publicitarios patrocinados mostrados en la página.',
    },
    {
      q: '¿Qué incluye la versión Premium Pro para películas y videos largos?',
      a: 'La versión Pro desbloquea películas y series completas de más de 5 minutos (1 hora, 2 horas o más), resolución original 4K Ultra HD a 60 FPS sin compresión y elimina toda la publicidad con velocidad turbo 10x.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans relative selection:bg-amber-400 selection:text-slate-900">
      {/* Toast Alert Flotante */}
      <div 
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-6 py-3 rounded-full bg-slate-900/90 border border-amber-300/40 text-amber-100 text-sm font-semibold shadow-2xl backdrop-blur-md transition-all duration-300 ${
          toastMessage ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0 pointer-events-none'
        }`}
      >
        <span className="text-base">⚠️</span>
        <span>{toastMessage}</span>
      </div>

      {/* Premium Upgrade Modal */}
      <PremiumModal
        isOpen={isPremiumOpen}
        onClose={() => setIsPremiumOpen(false)}
        reason={premiumReason}
      />

      {/* 1. Header & Menús de Navegación */}
      <header className="sticky top-0 z-40 bg-[#3C5260]/60 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 py-3 flex items-center justify-between">
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="relative w-11 h-11 sm:w-13 sm:h-13 shrink-0 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
              <img 
                src="/logo.png" 
                alt="Gryph Icon" 
                className="w-full h-full object-contain filter contrast-105" 
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                Gryph<span className="text-amber-300">/</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-black/25 text-amber-200 border border-white/10 px-2 py-0.5 rounded-full hidden sm:inline-block">
                Media Hub
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-white/90">
            <a href="#hunter" className="hover:text-amber-300 transition-colors">Descargador</a>
            <span className="flex items-center gap-1.5 text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Facebook & Pinterest</span>
            </span>
            <button 
              onClick={() => {
                setPremiumReason('Acceso a películas completas y calidad 4K.');
                setIsPremiumOpen(true);
              }}
              className="hover:text-amber-300 transition-colors"
            >
              Precios
            </button>
            <a href="#comparativa" className="hover:text-amber-300 transition-colors">Planes</a>
            <a href="#faq" className="hover:text-amber-300 transition-colors">Preguntas</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setPremiumReason('Acceso a películas completas y calidad 4K.');
                setIsPremiumOpen(true);
              }}
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-md transition-all hover:scale-105 flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 fill-slate-900 text-slate-900" />
              <span>Plan Pro 4K</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>
      </header>

      {/* Espacios Publicitarios Laterales Verticales (Skyscrapers 160x600) */}
      <AdBanner type="skyscraper-left" slotId="SLOT_LATERAL_IZQ_160x600" />
      <AdBanner type="skyscraper-right" slotId="SLOT_LATERAL_DER_160x600" />

      {/* Banner Publicitario Superior Horizontal (728x90) limpio y sin marcos */}
      <AdBanner type="leaderboard" slotId="SLOT_SUPERIOR_728x90" />

      {/* 2. Hero Section: Titular en Español con Contraste Puro */}
      <main id="hunter" className="flex-1 max-w-4xl mx-auto px-3 sm:px-5 pt-2 sm:pt-4 pb-12 flex flex-col items-center justify-center text-center relative z-10 w-full scroll-mt-20">
        
        <div className="max-w-3xl mx-auto px-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-semibold mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Descarga ultra rápida en MP4 y MP3</span>
          </div>

          {/* Titular Principal */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.14] drop-shadow-[0_2px_18px_rgba(0,0,0,0.22)]">
            Caza tus videos y audios favoritos al instante.
          </h1>

          {/* Subtítulo en letras pequeñas */}
          <p className="text-white/90 font-medium text-xs sm:text-sm tracking-wide mt-2 mb-6 max-w-xl mx-auto drop-shadow-md">
            Descarga sin límites desde YouTube, TikTok, Instagram y más. Siempre gratis y en 4K.
          </p>
        </div>

        {/* 3. Escenario Decorativo de la Mascota Dinosaurio (Ajuste Visual Compacto) */}
        <div className="w-full max-w-2xl mb-2 sm:mb-3 px-1 relative">
          
          {/* Indicador de estado y porcentaje con alto contraste */}
          <div className="flex items-center justify-between text-xs font-bold mb-1 px-2">
            <span className="text-white font-bold flex items-center gap-1.5 text-[11px] drop-shadow-md">
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
              <span>
                {currentPhase === 'hunting' 
                  ? 'Cazando video en curso...' 
                  : currentPhase === 'ready' 
                  ? '¡Presa capturada!' 
                  : 'Listo para cazar'}
              </span>
            </span>

            {/* Etiqueta 100% READY / Porcentaje estilizado como refuerzo */}
            <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-black transition-all shadow-sm ${
              currentPhase === 'ready'
                ? 'bg-emerald-500 text-white shadow-emerald-500/40 animate-bounce'
                : currentPhase === 'hunting'
                ? 'bg-white/35 backdrop-blur-md text-white border border-white/40'
                : 'bg-black/30 text-white'
            }`}>
              {currentPhase === 'ready' ? '100% READY!' : `${progressPercent}%`}
            </div>
          </div>

          <div 
            ref={stageRef}
            className="w-full h-14 sm:h-16 relative border-b-2 border-dashed border-white/35 select-none overflow-visible"
          >
            {/* Barra de progreso de carga */}
            <div 
              style={{ width: `${progressPercent}%` }}
              className="absolute -bottom-[2px] left-0 h-[2px] bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 shadow-[0_0_12px_rgba(251,191,36,0.9)] transition-all duration-75"
            />

            {/* Dinosaurio Mascota (Refuerzo visual proporcionado) */}
            <div
              style={{ left: `${mascotLeft}px` }}
              className="absolute bottom-0 select-none transition-transform duration-75"
            >
              <DinoMascot state={currentPhase} />
            </div>

            {/* Presa (🎬 pasa a 🍖 al 100%) */}
            <div 
              className={`absolute right-3 bottom-1.5 text-2xl sm:text-3xl select-none transition-all duration-300 ${
                preyState === 'eaten'
                  ? 'scale-125 animate-bounce'
                  : 'animate-pulse drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
              }`}
            >
              {preyState === 'eaten' ? '🍖' : '🎬'}
            </div>
          </div>
        </div>

        {/* 4. Barra de Entrada y Botón de Acción (Optimización Móvil Responsiva) */}
        <div className="w-full max-w-2xl bg-white/80 sm:bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl sm:rounded-full p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-[0_16px_45px_rgba(60,82,96,0.18)] focus-within:bg-white transition-all">
          <div className="flex items-center flex-1 min-w-0 pl-3 pr-2">
            <div className="text-slate-500 mr-2.5 shrink-0">
              <Search className="w-5 h-5" />
            </div>

            <input
              ref={inputRef}
              type="text"
              placeholder="Pega cualquier enlace (Facebook, YouTube, TikTok, Instagram, Pinterest...)"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (currentPhase === 'ready') resetToIdle();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFetch();
              }}
              className="w-full py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-500 bg-transparent focus:outline-none font-medium truncate"
            />

            {url && detectedCurrentPlatform !== 'Web' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900 text-white shadow-xs shrink-0 mr-1 animate-fadeIn select-none">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  detectedCurrentPlatform === 'Facebook' ? 'bg-blue-400' :
                  detectedCurrentPlatform === 'YouTube' ? 'bg-red-400' :
                  detectedCurrentPlatform === 'TikTok' ? 'bg-emerald-400' :
                  detectedCurrentPlatform === 'Instagram' ? 'bg-pink-400' :
                  detectedCurrentPlatform === 'Pinterest' ? 'bg-rose-400' :
                  'bg-amber-400'
                } animate-pulse`} />
                <span>{detectedCurrentPlatform}</span>
              </span>
            )}

            {url ? (
              <button
                type="button"
                onClick={() => {
                  setUrl('');
                  resetToIdle();
                  setVideoInfo(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-800 transition-colors shrink-0"
                title="Limpiar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePaste}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white/80 hover:bg-white rounded-full border border-slate-200 shadow-xs transition-colors shrink-0"
              >
                <Clipboard className="w-3 h-3 text-slate-500" />
                <span className="hidden sm:inline">Pegar</span>
              </button>
            )}
          </div>

          {/* Botón Principal con texto "¡DESCARGAR AHORA!" en español */}
          <button
            onClick={handleFetch}
            disabled={currentPhase === 'hunting'}
            className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-md select-none shrink-0 ${
              currentPhase === 'ready'
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/35 animate-pulse'
                : currentPhase === 'hunting'
                ? 'bg-slate-800 text-amber-300 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-black text-white hover:scale-105 active:scale-95'
            }`}
          >
            {currentPhase === 'hunting' ? (
              <span>Cazando ({progressPercent}%)...</span>
            ) : currentPhase === 'ready' ? (
              <>
                <Download className="w-4 h-4 stroke-[3]" />
                <span>¡DESCARGAR AHORA!</span>
              </>
            ) : (
              <span>Cazar</span>
            )}
          </button>
        </div>

        {/* Plataformas compatibles con detección automática universal */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 px-2 text-xs text-slate-700">
          <span className="text-slate-500 font-semibold mr-1 flex items-center gap-1 text-[11px] sm:text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            Detector automático universal:
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-slate-200/80 shadow-2xs text-[11px] font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-[#1877F2]"></span> Facebook
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-slate-200/80 shadow-2xs text-[11px] font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-[#FF0000]"></span> YouTube
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-slate-200/80 shadow-2xs text-[11px] font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-[#E1306C]"></span> Instagram
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-slate-200/80 shadow-2xs text-[11px] font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-black"></span> TikTok
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-slate-200/80 shadow-2xs text-[11px] font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-[#E60023]"></span> Pinterest
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 text-[11px] font-black">
            +1,000 sitios
          </span>
        </div>

        {/* 5. Tarjeta de Previsualización y Formatos (Optimización Móvil en 1 Columna) */}
        {videoInfo && (
          <div className="w-full max-w-2xl mt-6 p-4 sm:p-6 bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl sm:rounded-4xl text-left shadow-[0_20px_50px_rgba(60,82,96,0.15)] animate-fadeIn">
            {/* Adaptación flex-col en móviles a flex-row en escritorio */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center">
              <div className="relative w-full sm:w-44 h-44 sm:h-28 bg-slate-900 rounded-2xl overflow-hidden shrink-0 shadow-md group border border-slate-700/30">
                {/* 1. Estado de carga: mientras busca la información y la captura */}
                {loadingInfo && !videoInfo?.thumbnail && !videoInfo?.previewUrl ? (
                  <div className="w-full h-full bg-slate-800 animate-pulse flex flex-col items-center justify-center text-white/70 p-2">
                    <div className="w-7 h-7 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin mb-1.5" />
                    <span className="text-[10px] font-bold text-amber-300">Cargando captura...</span>
                  </div>
                ) : videoInfo?.thumbnail && !imgError ? (
                  /* 2. Captura real de la portada con auto-fallback a proxy */
                  <div className="relative w-full h-full">
                    <img 
                      key={videoInfo.thumbnail}
                      src={
                        videoInfo.thumbnail.includes('fbcdn.net') || videoInfo.thumbnail.includes('cdninstagram.com')
                          ? `${API_BASE_URL}/api/proxy-image?url=${encodeURIComponent(videoInfo.thumbnail)}`
                          : videoInfo.thumbnail
                      } 
                      alt={videoInfo.title} 
                      referrerPolicy="no-referrer"
                      loading="eager"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('/api/proxy-image') && !target.src.includes('/api/thumb')) {
                          target.src = `${API_BASE_URL}/api/proxy-image?url=${encodeURIComponent(videoInfo.thumbnail)}`;
                        } else {
                          setImgError(true);
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                      <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center shadow-lg border border-white/20">
                        <PlayCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                ) : videoInfo?.previewUrl ? (
                  /* 3. Clip / Fotograma animado de video directo */
                  <div className="relative w-full h-full">
                    <video 
                      src={videoInfo.previewUrl} 
                      preload="auto" 
                      playsInline 
                      muted 
                      autoPlay
                      loop
                      className="w-full h-full object-cover pointer-events-none" 
                    />
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white">
                        <PlayCircle className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 4. Tarjeta elegante de respaldo */
                  <div className={`w-full h-full flex flex-col items-center justify-center p-3 text-white text-center relative ${
                    videoInfo?.platform === 'Facebook' ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900' :
                    videoInfo?.platform === 'YouTube' ? 'bg-gradient-to-br from-red-600 to-rose-900' :
                    videoInfo?.platform === 'TikTok' ? 'bg-gradient-to-br from-slate-900 via-purple-950 to-pink-900' :
                    videoInfo?.platform === 'Instagram' ? 'bg-gradient-to-tr from-amber-500 via-rose-600 to-purple-800' :
                    videoInfo?.platform === 'Pinterest' ? 'bg-gradient-to-br from-red-600 to-rose-900' :
                    'bg-gradient-to-br from-slate-800 to-slate-950'
                  }`}>
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-1 shadow-md">
                      <PlayCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[11px] font-bold tracking-wide uppercase opacity-90">{videoInfo?.platform} Video</span>
                    <span className="text-[9px] text-white/70 line-clamp-1 max-w-[90%] mt-0.5">{videoInfo?.title}</span>
                  </div>
                )}
                {videoInfo.duration > 0 && (
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 z-10 backdrop-blur-xs">
                    <Clock className="w-2.5 h-2.5 text-amber-400" />
                    {videoInfo.durationFormatted}
                  </span>
                )}
                <span className={`absolute top-2 left-2 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider z-10 shadow-xs ${
                  videoInfo.platform === 'Facebook' ? 'bg-blue-600' :
                  videoInfo.platform === 'YouTube' ? 'bg-red-600' :
                  videoInfo.platform === 'Instagram' ? 'bg-pink-600' :
                  videoInfo.platform === 'TikTok' ? 'bg-black' :
                  videoInfo.platform === 'Pinterest' ? 'bg-rose-600' :
                  'bg-slate-900'
                }`}>
                  {videoInfo.platform}
                </span>
              </div>

              <div className="flex-1 min-w-0 w-full">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                  {videoInfo.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Autor: <strong className="text-slate-800">{videoInfo.uploader || videoInfo.platform}</strong> • {videoInfo.durationFormatted}
                </p>

                {videoInfo.isLongVideo && (
                  <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-amber-800 text-xs">
                    <Film className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>Video largo ({videoInfo.durationFormatted}): Películas requieren Plan Pro.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Opciones de descarga adaptadas a móviles */}
            <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Formatos Disponibles
              </span>
              {videoInfo.formats.map((fmt, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-white/70 border border-slate-200/80 hover:border-slate-400 transition-all shadow-xs gap-3 sm:gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      fmt.type === 'audio'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {fmt.type === 'audio' ? <Music className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{fmt.quality}</span>
                        {fmt.isPremium ? (
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            Pro 4K
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Gratis
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">{fmt.resolution}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadFormat(fmt)}
                    disabled={downloadingId === fmt.formatId}
                    className={`w-full sm:w-auto px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
                      fmt.isPremium
                        ? 'bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-1.5'
                        : fmt.type === 'audio'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-1.5'
                        : 'bg-slate-900 hover:bg-black text-white flex items-center justify-center gap-1.5'
                    } disabled:opacity-60`}
                  >
                    {downloadingId === fmt.formatId ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Descargando...</span>
                      </span>
                    ) : (
                      <>
                        {fmt.isPremium ? <Crown className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                        <span>{fmt.isPremium ? 'Desbloquear 4K' : fmt.type === 'audio' ? 'Descargar Audio' : 'Descargar Video'}</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Banner Publicitario Intermedio (Especialmente visible y optimizado para móviles) */}
      <AdBanner type="inline" slotId="SLOT_INTERMEDIO_MOVIL" />

      {/* 6. Comparativa de Planes */}
      <section id="comparativa" className="max-w-4xl mx-auto px-4 sm:px-5 py-10 w-full scroll-mt-20">
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 bg-white/60 px-3.5 py-1 rounded-full border border-white/60 shadow-xs">
            Comparativa de Planes
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Elige la mejor forma de descargar tu contenido
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Versión básica gratuita financiada con anuncios o Plan Pro para películas y máxima calidad 4K.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl sm:rounded-4xl p-6 sm:p-8 border border-white/80 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Plan Gratuito
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <h3 className="text-3xl font-black text-slate-900">$0</h3>
                <span className="text-xs text-slate-500">/ para siempre</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Con anuncios patrocinados estándar.</p>

              <div className="mt-6 space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Videos cortos de hasta <strong>5 minutos</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Calidad HD <strong>720p</strong> y <strong>1080p</strong> estándar</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Descarga de audio en MP3</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400">
                  <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                  <span>Películas y videos mayores a 5 min</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400">
                  <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                  <span>Resolución Ultra HD 4K y 8K</span>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8">
              <button
                onClick={() => {
                  if (inputRef.current) inputRef.current.focus();
                }}
                className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-colors"
              >
                Usar Gratis
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl sm:rounded-4xl p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-amber-400 text-slate-950 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              Popular Pro
            </div>

            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Gryph Pro Studio
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <h3 className="text-3xl font-black text-white">$2.49</h3>
                <span className="text-xs text-slate-400">/ mes (Plan Anual)</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Cero anuncios, películas completas y máxima fidelidad.</p>

              <div className="mt-6 space-y-3 text-xs text-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span><strong>Películas y Series Completas</strong> (+5 min, 1h, 2h+)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span><strong>Ultra HD 4K y 8K</strong> a 60 FPS sin compresión</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span><strong>100% Libre de Publicidad</strong> y ventanas emergentes</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Velocidad Turbo 10x en servidores dedicados</span>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8">
              <button
                onClick={() => {
                  setPremiumReason('Desbloquea películas y descargas 4K ilimitadas.');
                  setIsPremiumOpen(true);
                }}
                className="w-full py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <Crown className="w-3.5 h-3.5 fill-slate-950" />
                <span>Obtener Plan Pro Ahora</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Publicitario Inferior Horizontal limpio y sin marcos */}
      <AdBanner type="leaderboard" slotId="SLOT_INFERIOR_728x90" />

      {/* 7. Preguntas Frecuentes (FAQ Accordion) */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-5 py-10 w-full scroll-mt-20">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Preguntas Frecuentes (FAQ)</h3>
          <p className="text-xs text-slate-600 mt-1">Todo lo que necesitas saber sobre el funcionamiento de Gryph/.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-4 sm:p-5 text-left font-semibold text-xs sm:text-sm text-slate-800 flex items-center justify-between hover:bg-white/90"
              >
                <span>{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="w-4 h-4 text-slate-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="w-full border-t border-white/40 py-8 text-center text-xs text-slate-600 mt-10 bg-white/30 backdrop-blur-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-3 mb-2 font-black text-slate-900 text-lg">
            <img 
              src="/logo.png" 
              alt="Gryph Icon" 
              className="w-7 h-7 object-contain drop-shadow-sm filter contrast-105" 
            />
            <span>Gryph<span className="text-amber-600">/</span></span>
            <span className="text-xs font-normal text-slate-600">• The Video Hunter</span>
          </div>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            Plataforma de procesamiento multimedia en la nube. No almacenamos contenido con derechos de autor en nuestros servidores.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-3 sm:gap-5 text-slate-700 text-xs font-semibold">
            <a href="/terminos" className="hover:text-slate-900 transition-colors underline decoration-slate-400">Términos de Servicio</a>
            <span>•</span>
            <a href="/privacidad" className="hover:text-slate-900 transition-colors underline decoration-slate-400">Política de Privacidad</a>
            <span>•</span>
            <a href="/contacto" className="hover:text-slate-900 transition-colors underline decoration-slate-400">Contacto & Soporte</a>
          </div>
          <p className="mt-3 text-[10px] text-slate-500">
            © {new Date().getFullYear()} Gryph/ Inc. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
