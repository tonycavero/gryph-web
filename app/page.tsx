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
  Video,
  FileText
} from 'lucide-react';
import AdBanner from '@/components/AdBanner';
import PremiumModal from '@/components/PremiumModal';
import DocToPptSection from '@/components/DocToPptSection';
import { VideoInfo, FormatOption, detectPlatform, buildPlatformFormats } from '@/lib/types';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://gryph-web.onrender.com').replace(/\/+$/, '');

export default function GryphHomePage() {
  const [activeTab, setActiveTab] = useState<'video' | 'docToPpt'>('video');
  const [url, setUrl] = useState('');
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'hunting' | 'ready'>('idle');
  const [progressPercent, setProgressPercent] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Video download state
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const [premiumReason, setPremiumReason] = useState('');
  const [imgError, setImgError] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const detectedCurrentPlatform = detectPlatform(url.trim());
  const ytVideoId = videoInfo?.url
    ? (videoInfo.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/) || [])[1]
    : null;

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    // Keep-alive silencioso para despertar a Render al abrir la página
    fetch(`${API_BASE_URL}/api/health`).catch(() => {});
  }, []);

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
    setElapsedSeconds(0);
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
    setProgressPercent(0);
    setElapsedSeconds(0);
    setLoadingInfo(true);
    setImgError(false);
    setIsPlayingPreview(false);

    // Detección inmediata de miniatura para YouTube
    let initialThumb = '';
    const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    const ytId = ytMatch ? ytMatch[1] : null;
    if (detectedPlatform === 'YouTube' && ytId) {
      initialThumb = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
    }

    // Preparar opciones de formato de forma inmediata para cualquier plataforma
    const immediateInfo: VideoInfo = {
      id: 'media_' + Date.now(),
      title: `${detectedPlatform} Video & Audio`,
      url: cleanUrl,
      thumbnail: initialThumb,
      duration: 0,
      durationFormatted: '0:00',
      uploader: detectedPlatform,
      platform: detectedPlatform,
      formats: buildPlatformFormats(detectedPlatform),
      isLongVideo: false,
    };
    setVideoInfo(immediateInfo);

    // Bandera para sincronizar la animación de la mascota con la llegada de datos reales
    let isDataReady = false;
    let huntFinished = false;

    // 1. Fast path: oEmbed oficial de YouTube (retorna en ~200ms con título y canal real)
    if (ytId) {
      fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`)
        .then((res) => res.json())
        .then((oe) => {
          if (oe && oe.title) {
            setVideoInfo((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                title: oe.title,
                uploader: oe.author_name || prev.uploader,
                thumbnail: prev.thumbnail || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
              };
            });
            isDataReady = true;
          }
        })
        .catch(() => {});
    }

    // 2. Fast path: Vercel serverless /api/info (responde en ~300ms con metadatos de Pinterest, TikTok, etc.)
    fetch('/api/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: cleanUrl }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setVideoInfo((prev) => ({
            ...prev,
            ...data.data,
            title: data.data.title && !data.data.title.includes('Video & Audio') ? data.data.title : (prev?.title || data.data.title),
            thumbnail: data.data.thumbnail || prev?.thumbnail || initialThumb,
            previewUrl: data.data.previewUrl || prev?.previewUrl,
            uploader: data.data.uploader && data.data.uploader !== detectedPlatform ? data.data.uploader : (prev?.uploader || data.data.uploader),
          }));
          setImgError(false);
          isDataReady = true;
        }
      })
      .catch(() => {});

    // 3. Petición profunda al backend en Render (formatos y streams)
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
      isDataReady = true; // Forzar finalización por seguridad si toma más de 15s
    }, 15000);

    fetch(`${API_BASE_URL}/api/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: cleanUrl }),
      signal: abortController.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(timeoutId);
        if (data.success && data.data) {
          setVideoInfo((prev) => ({
            ...prev,
            ...data.data,
            title: data.data.title && !data.data.title.includes('Video & Audio') ? data.data.title : (prev?.title || data.data.title),
            thumbnail: data.data.thumbnail || prev?.thumbnail || initialThumb,
            previewUrl: data.data.previewUrl || prev?.previewUrl,
            uploader: data.data.uploader && data.data.uploader !== detectedPlatform ? data.data.uploader : (prev?.uploader || data.data.uploader),
          }));
          setImgError(false);
        }
        isDataReady = true;
      })
      .catch(() => {
        clearTimeout(timeoutId);
        isDataReady = true;
      });

    const startTime = performance.now();
    let lastTime = startTime;
    let currentPercent = 0;

    const animateHunt = (currentTime: number) => {
      if (huntFinished) return;

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      const elapsed = currentTime - startTime;
      setElapsedSeconds(elapsed / 1000);

      // Avance progresivo 100% acoplado al porcentaje de carga
      if (!isDataReady || elapsed < 1200) {
        // Fase de carga: progresión continua y natural hacia el 100%
        if (currentPercent < 35) {
          currentPercent += delta * 45; // 0 a 35% en ~0.8s
        } else if (currentPercent < 65) {
          currentPercent += delta * 25; // 35 a 65% en ~1.2s
        } else if (currentPercent < 85) {
          currentPercent += delta * 12; // 65 a 85% en ~1.6s
        } else if (currentPercent < 94) {
          currentPercent += delta * 2.0; // 85 a 94% mientras termina el backend
        }
      } else {
        // Datos listos: aceleración suave y continua desde el porcentaje actual hasta el 100%
        const remaining = 100 - currentPercent;
        const finishRate = Math.max(remaining / 0.35, 60);
        currentPercent += delta * finishRate;
      }

      if (currentPercent >= 100) {
        currentPercent = 100;
        huntFinished = true;
        setProgressPercent(100);
        setElapsedSeconds(elapsed / 1000);
        setLoadingInfo(false);
        setCurrentPhase('ready');
        return;
      }

      // Porcentaje visible sincronizado
      const displayPercent = Math.min(Math.floor(currentPercent), 99);
      setProgressPercent(displayPercent);

      requestAnimationFrame(animateHunt);
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
      const disposition = res.headers.get('content-disposition');
      let filename = `${videoInfo.platform} ${format.type === 'audio' ? 'Audio' : (videoInfo.platform === 'TikTok' ? 'Video Sin Marca' : 'Video')}.${format.ext}`;
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1]);
        }
      }

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
      q: '¿Cómo funciona la conversión de PDF o Word a PowerPoint con imágenes?',
      a: 'Sube tu archivo PDF o DOCX en la pestaña "Documento a PPT". Nuestra inteligencia artificial sintetiza el texto en diapositivas ejecutivas, genera ilustraciones temáticas en alta resolución para cada tema y genera un archivo nativo .pptx listo para descargar y presentar.',
    },
    {
      q: '¿Los videos de TikTok se descargan sin marca de agua?',
      a: '¡Sí, 100%! AnyLoad extrae el stream limpio de TikTok en máxima definición (HD y Full HD) sin la marca de agua flotante ni el logotipo de TikTok.',
    },
    {
      q: '¿Cómo descargo solo el audio de un video?',
      a: 'Pega tu enlace de Facebook, YouTube, TikTok o Pinterest y presiona Descargar. En la tarjeta de formatos podrás elegir la opción específica de audio (por ejemplo "TikTok Audio" o "YouTube Audio"), la cual se descargará en formato MP3 con la mejor calidad estéreo.',
    },
    {
      q: '¿Cómo funciona el temporizador de carga?',
      a: 'El temporizador en tiempo real analiza y procesa el enlace en cuestión de segundos con una barra de progreso ultra-rápida. Al llegar al 100%, tu video o audio queda listo para descargar sin esperas.',
    },
    {
      q: '¿Por qué la versión básica es gratis?',
      a: 'Nuestra versión gratuita es 100% libre para videos en calidades estándar (720p, 1080p y MP3) gracias a los anuncios publicitarios patrocinados mostrados en la página.',
    },
    {
      q: '¿Qué incluye la versión Premium Pro para películas y videos largos?',
      a: 'La versión Pro desbloquea películas y videos largos (1 hora, 2 horas o más), resolución original 4K Ultra HD a 60 FPS sin compresión y elimina toda la publicidad con velocidad turbo 10x.',
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

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-white/90">
            <button
              onClick={() => setActiveTab('video')}
              className={`hover:text-amber-300 transition-colors ${activeTab === 'video' ? 'text-amber-300 font-bold underline underline-offset-4' : ''}`}
            >
              Descargador
            </button>
            <button
              onClick={() => setActiveTab('docToPpt')}
              className={`hover:text-amber-300 transition-colors flex items-center gap-1.5 ${activeTab === 'docToPpt' ? 'text-amber-300 font-bold underline underline-offset-4' : ''}`}
            >
              <span>Doc a PPT</span>
              <span className="text-[9px] font-black bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-full">IA</span>
            </button>
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
        
        {/* Selector de Pestañas: Descargador Multimedia vs Documento a PowerPoint */}
        <div className="inline-flex items-center p-1.5 rounded-full bg-slate-900/80 backdrop-blur-xl border border-white/20 mb-6 shadow-2xl">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-black transition-all ${
              activeTab === 'video'
                ? 'bg-amber-400 text-slate-900 shadow-md scale-105'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Descargador</span>
          </button>
          <button
            onClick={() => setActiveTab('docToPpt')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-black transition-all ${
              activeTab === 'docToPpt'
                ? 'bg-amber-400 text-slate-900 shadow-md scale-105'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Documento a PPT</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-900 text-amber-300 font-extrabold text-[9px] border border-amber-400/40">
              IA
            </span>
          </button>
        </div>

        {activeTab === 'video' ? (
          <>
            <div className="max-w-3xl mx-auto px-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-semibold mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Descarga ultra rápida en MP4 y MP3</span>
          </div>

          {/* Titular Principal */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.14] drop-shadow-[0_2px_18px_rgba(0,0,0,0.22)]">
            Descarga tus videos y audios favoritos al instante.
          </h1>

          {/* Subtítulo en letras pequeñas */}
          <p className="text-white/90 font-medium text-xs sm:text-sm tracking-wide mt-2 mb-6 max-w-xl mx-auto drop-shadow-md">
            Descarga sin límites desde YouTube, TikTok, Instagram y más. Siempre gratis y en 4K.
          </p>
        </div>

        {/* 3. Temporizador Minimalista y Colorido (Más compacto que el buscador) */}
        <div className="w-full max-w-lg mb-3.5 sm:mb-4 px-1 relative select-none animate-fadeIn">
          <div className="bg-white/85 sm:bg-white/75 backdrop-blur-2xl border border-white/80 rounded-3xl p-3 sm:p-4 shadow-[0_12px_36px_rgba(60,82,96,0.12)] overflow-hidden">
            
            {/* Cabecera del Temporizador */}
            <div className="flex items-center justify-between gap-2 mb-2 px-0.5">
              
              {/* Lado izquierdo: Icono de cronómetro + tiempo + estado */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                  currentPhase === 'hunting'
                    ? 'bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-amber-400 text-white shadow-md shadow-fuchsia-500/30'
                    : currentPhase === 'ready'
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-slate-100 text-slate-500 border border-slate-200/80'
                }`}>
                  {currentPhase === 'ready' ? (
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <Clock className={`w-4 h-4 ${currentPhase === 'hunting' ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                  )}
                </div>

                <div className="flex flex-col text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs sm:text-sm font-black tracking-tight text-slate-900">
                      {elapsedSeconds > 0 ? `${elapsedSeconds.toFixed(1)}s` : '0.0s'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">•</span>
                    <span className={`text-[11px] sm:text-xs font-bold truncate ${
                      currentPhase === 'hunting' ? 'text-violet-700' :
                      currentPhase === 'ready' ? 'text-emerald-700' :
                      'text-slate-600'
                    }`}>
                      {currentPhase === 'hunting'
                        ? 'Procesando enlace...'
                        : currentPhase === 'ready'
                        ? '¡Video listo para descargar!'
                        : 'Temporizador Listo'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium truncate">
                    {currentPhase === 'hunting'
                      ? 'Extrayendo streams en alta velocidad'
                      : currentPhase === 'ready'
                      ? 'Metadatos y formatos ensamblados'
                      : 'Pega un enlace para iniciar'}
                  </span>
                </div>
              </div>

              {/* Lado derecho: Píldora de porcentaje colorida */}
              <div className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-black transition-all shrink-0 shadow-xs ${
                currentPhase === 'ready'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                  : currentPhase === 'hunting'
                  ? 'bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white shadow-md shadow-fuchsia-500/25'
                  : 'bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}>
                {currentPhase === 'ready' ? '100% LISTO' : `${progressPercent}%`}
              </div>
            </div>

            {/* Barra de Progreso Colorida y Minimalista */}
            <div className="relative w-full h-2.5 sm:h-3 bg-slate-100/90 rounded-full overflow-hidden border border-slate-200/70 p-[2px] shadow-inner">
              <div
                style={{ width: `${progressPercent}%` }}
                className={`h-full rounded-full transition-all duration-75 relative ${
                  currentPhase === 'hunting'
                    ? 'bg-gradient-to-r from-violet-500 via-fuchsia-500 via-sky-400 to-emerald-400 shadow-[0_0_12px_rgba(236,72,153,0.7)]'
                    : currentPhase === 'ready'
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                    : 'bg-slate-300'
                }`}
              >
                {/* Brillo dinámico que recorre la barra */}
                {currentPhase === 'hunting' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                )}
              </div>
            </div>

            {/* Micro-etiquetas de pasos coloridos */}
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mt-2 px-1">
              <span className={`flex items-center gap-1 transition-colors ${progressPercent >= 10 ? 'text-violet-600 font-bold' : ''}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${progressPercent >= 10 ? 'bg-violet-500 shadow-xs shadow-violet-500/50' : 'bg-slate-300'}`} />
                Conexión
              </span>
              <span className={`flex items-center gap-1 transition-colors ${progressPercent >= 40 ? 'text-fuchsia-600 font-bold' : ''}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${progressPercent >= 40 ? 'bg-fuchsia-500 shadow-xs shadow-fuchsia-500/50' : 'bg-slate-300'}`} />
                Análisis
              </span>
              <span className={`flex items-center gap-1 transition-colors ${progressPercent >= 75 ? 'text-sky-600 font-bold' : ''}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${progressPercent >= 75 ? 'bg-sky-500 shadow-xs shadow-sky-500/50' : 'bg-slate-300'}`} />
                Extracción
              </span>
              <span className={`flex items-center gap-1 transition-colors ${progressPercent >= 100 ? 'text-emerald-600 font-bold' : ''}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${progressPercent >= 100 ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50' : 'bg-slate-300'}`} />
                Listo
              </span>
            </div>

          </div>
        </div>

        {/* 4. Barra de Entrada y Botón de Acción (Claramente MÁS GRANDE que el temporizador) */}
        <div className="w-full max-w-3xl sm:max-w-4xl bg-white/90 sm:bg-white/80 backdrop-blur-2xl border border-white/80 rounded-3xl sm:rounded-full p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-[0_18px_50px_rgba(60,82,96,0.18)] focus-within:bg-white focus-within:shadow-[0_24px_60px_rgba(60,82,96,0.25)] focus-within:border-white transition-all">
          <div className="flex items-center flex-1 min-w-0 pl-3 sm:pl-4 pr-2">
            <div className="text-slate-400 mr-2.5 sm:mr-3 shrink-0">
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
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
              className="w-full py-2.5 sm:py-3.5 text-xs sm:text-base text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none font-medium truncate"
            />

            {url && detectedCurrentPlatform !== 'Web' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-900 text-white shadow-xs shrink-0 mr-1.5 animate-fadeIn select-none">
                <span className={`w-2 h-2 rounded-full ${
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
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-800 transition-colors shrink-0"
                title="Limpiar"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePaste}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white/90 hover:bg-white rounded-full border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors shrink-0"
              >
                <Clipboard className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Pegar</span>
              </button>
            )}
          </div>

          {/* Botón Principal con texto "¡DESCARGAR AHORA!" en español */}
          <button
            onClick={handleFetch}
            disabled={currentPhase === 'hunting'}
            className={`w-full sm:w-auto px-7 sm:px-9 py-3 sm:py-3.5 rounded-2xl sm:rounded-full font-black text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-md select-none shrink-0 ${
              currentPhase === 'ready'
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/35 animate-pulse'
                : currentPhase === 'hunting'
                ? 'bg-slate-800 text-amber-300 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-black text-white hover:scale-105 active:scale-95'
            }`}
          >
            {currentPhase === 'hunting' ? (
              <span>Descargando ({progressPercent}%)...</span>
            ) : currentPhase === 'ready' ? (
              <>
                <Download className="w-4 h-4 stroke-[3]" />
                <span>¡DESCARGAR AHORA!</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Descargar</span>
              </>
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
                {/* 1. Reproductor interactivo incrustado para YouTube al hacer clic en Play */}
                {isPlayingPreview && ytVideoId ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytVideoId}?autoplay=1`}
                    title={videoInfo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : loadingInfo && !videoInfo?.thumbnail && !videoInfo?.previewUrl ? (
                  /* 2. Estado de carga inicial mientras obtiene la primera información */
                  <div className="w-full h-full bg-slate-800 animate-pulse flex flex-col items-center justify-center text-white/70 p-2">
                    <div className="w-7 h-7 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin mb-1.5" />
                    <span className="text-[10px] font-bold text-amber-300">Cargando captura...</span>
                  </div>
                ) : videoInfo?.thumbnail && !imgError ? (
                  /* 3. Portada real con reproducción interactiva al hacer clic */
                  <div
                    className="relative w-full h-full cursor-pointer"
                    onClick={() => {
                      if (ytVideoId) setIsPlayingPreview(true);
                    }}
                    title={ytVideoId ? 'Clic para reproducir video' : 'Portada del video'}
                  >
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
                        if (ytVideoId && !target.src.includes('hqdefault.jpg')) {
                          target.src = `https://i.ytimg.com/vi/${ytVideoId}/hqdefault.jpg`;
                        } else if (!target.src.includes('/api/proxy-image') && !target.src.includes('/api/thumb')) {
                          target.src = `${API_BASE_URL}/api/proxy-image?url=${encodeURIComponent(videoInfo.thumbnail)}`;
                        } else {
                          setImgError(true);
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity">
                      <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                      </div>
                    </div>
                  </div>
                ) : videoInfo?.previewUrl ? (
                  /* 4. Clip directo animado */
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
                  /* 5. Tarjeta elegante de respaldo */
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
          </>
        ) : (
          <DocToPptSection onShowToast={showToast} />
        )}

        {/* Banner Publicitario Central (300x250) - Inmediatamente debajo del botón Descargar / Resultados */}
        <AdBanner type="rectangle" slotId="SLOT_CENTRAL_300x250" />
      </main>

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
                  <span>Videos y música estándar sin límite</span>
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
                  <span>Películas y videos mayores a 1 hora, 2 horas</span>
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
                  <span><strong>Películas y Series Completas</strong> (1 hora, 2 horas o más)</span>
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
            <span className="text-xs font-normal text-slate-600">• The Video Downloader</span>
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
