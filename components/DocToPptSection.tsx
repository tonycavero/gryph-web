'use client';

import React, { useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Settings2,
  RefreshCw,
  Sliders,
  Layers,
  Palette,
  Globe,
  FileCheck,
  X,
  Key
} from 'lucide-react';
import { PresentationPlan, SlideItem } from '@/lib/aiSlideGenerator';

interface DocToPptSectionProps {
  onShowToast: (msg: string) => void;
}

export default function DocToPptSection({ onShowToast }: DocToPptSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [slideCount, setSlideCount] = useState<number>(6);
  const [theme, setTheme] = useState<'navy' | 'emerald' | 'amber' | 'slate' | 'violet'>('navy');
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [customKey, setCustomKey] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Estados de proceso
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Resultado
  const [planResult, setPlanResult] = useState<PresentationPlan | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'docx', 'doc', 'txt', 'md'].includes(ext)) {
      onShowToast('Formato no soportado. Por favor sube un archivo PDF, DOCX, DOC o TXT.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      onShowToast('El archivo supera el límite de 25 MB.');
      return;
    }
    setSelectedFile(file);
    setPlanResult(null);
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      onShowToast('Por favor selecciona un archivo PDF o Word para continuar.');
      return;
    }

    setIsProcessing(true);
    setProgressPercent(10);
    setProcessStep('1/4 Extrayendo texto y secciones del documento...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('slideCount', slideCount.toString());
      formData.append('theme', theme);
      formData.append('language', language);
      if (customKey.trim()) {
        formData.append('apiKey', customKey.trim());
      }

      // Simulación de pasos de barra de progreso mientras se procesa
      const stepTimer1 = setTimeout(() => {
        setProgressPercent(40);
        setProcessStep('2/4 Analizando contenido con IA y sintetizando diapositivas...');
      }, 1500);

      const stepTimer2 = setTimeout(() => {
        setProgressPercent(75);
        setProcessStep('3/4 Generando e integrando imágenes temáticas de alta resolución...');
      }, 4000);

      const response = await fetch('/api/doc-to-ppt', {
        method: 'POST',
        body: formData,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      setProgressPercent(95);
      setProcessStep('4/4 Ensamblando presentación ejecutiva...');

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al procesar el archivo');
      }

      setProgressPercent(100);
      setPlanResult(result.data.plan);
      setActiveSlideIndex(0);
      onShowToast('✓ ¡Presentación estructurada exitosamente!');
    } catch (err: any) {
      onShowToast(`Error: ${err.message || 'No se pudo convertir el documento'}`);
    } finally {
      setIsProcessing(false);
      setProgressPercent(0);
      setProcessStep('');
    }
  };

  const handleDownloadPptx = async () => {
    if (!planResult) return;
    setIsDownloading(true);

    try {
      const response = await fetch('/api/doc-to-ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planResult }),
      });

      if (!response.ok) {
        throw new Error('Error al generar el archivo .pptx');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeTitle = (planResult.title || 'Presentacion')
        .replace(/[^\w\s-]/gi, '')
        .trim()
        .slice(0, 40) || 'Presentacion';
      a.download = `Gryph - ${safeTitle}.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      onShowToast('✓ ¡Descarga iniciada! Tu presentación PPTX está lista.');
    } catch (err: any) {
      onShowToast(`Error al descargar: ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPlanResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentSlide: SlideItem | undefined = planResult?.slides[activeSlideIndex];

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-2 animate-fadeIn">
      {/* Tarjeta Contenedora Principal */}
      <div className="bg-white/90 backdrop-blur-2xl border border-white/80 rounded-3xl p-4 sm:p-7 shadow-[0_20px_60px_rgba(60,82,96,0.18)]">
        
        {/* Cabecera de la sección */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-5 border-b border-slate-200/70 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 text-white flex items-center justify-center font-bold shadow-lg shadow-orange-500/25 shrink-0">
              <Layers className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Convertidor de Documentos a PowerPoint
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  IA Activa
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Convierte PDF o Word en diapositivas ejecutivas estructuradas con imágenes temáticas.
              </p>
            </div>
          </div>

          {planResult && (
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Nuevo Documento</span>
            </button>
          )}
        </div>

        {/* ============================================================== */}
        {/* VISTA 1: SUBIDA Y CONFIGURACIÓN (Si aún no hay plan generado)  */}
        {/* ============================================================== */}
        {!planResult && (
          <div className="pt-5 space-y-5">
            {/* Zona de Arrastrar y Soltar (Dropzone) */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md"
              onChange={handleFileChange}
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? 'border-amber-500 bg-amber-50/70 scale-[1.01]'
                    : 'border-slate-300 hover:border-amber-400 bg-slate-50/60 hover:bg-white/80'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm mx-auto flex items-center justify-center text-amber-500 mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8 stroke-[2]" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-800 mb-1">
                  Arrastra tu documento aquí o <span className="text-amber-600 underline">explora tus archivos</span>
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Soporta documentos PDF, Microsoft Word (.docx, .doc) y texto (.txt) de hasta 25 MB.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-slate-600">
                  <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 border border-red-200">PDF</span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 border border-blue-200">DOCX</span>
                  <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-700 border border-sky-200">DOC</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 border border-slate-300">TXT</span>
                </div>
              </div>
            ) : (
              /* Archivo Seleccionado */
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25">
                    <FileCheck className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500 font-semibold">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Listo para sintetizar
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-white transition-colors shrink-0"
                  title="Cambiar archivo"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Opciones de Configuración */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Selector de Diapositivas */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>Cantidad de Diapositivas</span>
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { count: 5, label: '5' },
                    { count: 8, label: '8' },
                    { count: 12, label: '12' },
                  ].map((item) => (
                    <button
                      key={item.count}
                      type="button"
                      onClick={() => setSlideCount(item.count)}
                      className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                        slideCount === item.count
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Tema Visual */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                  <Palette className="w-3.5 h-3.5 text-amber-600" />
                  <span>Estilo Visual</span>
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="w-full py-1.5 px-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                >
                  <option value="navy">👔 Ejecutivo (Azul Clásico)</option>
                  <option value="emerald">🌲 Esmeralda (Corporativo)</option>
                  <option value="amber">⚡ Ámbar (Moderno / Tech)</option>
                  <option value="violet">🟣 Violeta (Creativo)</option>
                  <option value="slate">🏢 Minimalista (Gris Urbano)</option>
                </select>
              </div>

              {/* Selector de Idioma */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                  <Globe className="w-3.5 h-3.5 text-amber-600" />
                  <span>Idioma de Diapositivas</span>
                </label>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setLanguage('es')}
                    className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                      language === 'es'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    Español
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`py-1.5 text-xs font-bold rounded-xl transition-all ${
                      language === 'en'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
            </div>

            {/* Ajuste Opcional de API Key de Gemini */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Opciones avanzadas (Clave Gemini personal)</span>
              </button>

              {showAdvanced && (
                <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="password"
                      placeholder="Pega tu Gemini API Key (opcional, dejamos IA lista por defecto)"
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      className="w-full text-xs py-1.5 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 pl-6">
                    Si no colocas ninguna clave, se utiliza el motor heurístico e IA integrada automáticamente.
                  </p>
                </div>
              )}
            </div>

            {/* Estado de Carga y Progreso */}
            {isProcessing && (
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5 animate-fadeIn shadow-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                    {processStep}
                  </span>
                  <span className="font-mono font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400 transition-all duration-300"
                  />
                </div>
              </div>
            )}

            {/* Botón Principal de Conversión */}
            <button
              type="button"
              onClick={handleConvert}
              disabled={!selectedFile || isProcessing}
              className={`w-full py-4 rounded-2xl font-black text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2.5 shadow-md select-none ${
                !selectedFile || isProcessing
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-slate-900 via-slate-800 to-black hover:scale-[1.01] active:scale-[0.99] text-white shadow-slate-900/20'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isProcessing ? 'Procesando Documento...' : 'Convertir a PowerPoint con Imágenes'}</span>
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* VISTA 2: PREVISUALIZADOR INTERACTIVO Y DESCARGA (.PPTX)        */}
        {/* ============================================================== */}
        {planResult && currentSlide && (
          <div className="pt-5 space-y-5 animate-fadeIn">
            
            {/* Cabecera del Deck Generado */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  {planResult.theme.toUpperCase()} THEME • {planResult.slides.length} DIAPOSITIVAS
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  {planResult.title}
                </h3>
                {planResult.subtitle && (
                  <p className="text-xs text-slate-300 mt-0.5">{planResult.subtitle}</p>
                )}
              </div>

              {/* Botón de Descarga Inmediata */}
              <button
                type="button"
                onClick={handleDownloadPptx}
                disabled={isDownloading}
                className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all shrink-0 self-stretch sm:self-auto justify-center"
              >
                {isDownloading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generando PPTX...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 stroke-[3]" />
                    <span>Descargar PowerPoint (.pptx)</span>
                  </>
                )}
              </button>
            </div>

            {/* Visor de Diapositiva 16:9 */}
            <div className="relative bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm">
              
              {/* Barra superior de diapositiva */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-slate-900 text-white shadow-xs">
                  {currentSlide.badge || `Slide ${currentSlide.slideNumber}`}
                </span>
                <span className="text-xs font-bold text-slate-400 font-mono">
                  {activeSlideIndex + 1} / {planResult.slides.length}
                </span>
              </div>

              {/* Título de la Diapositiva */}
              <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-5">
                {currentSlide.title}
              </h4>

              {/* Contenido en 2 columnas: Viñetas + Imagen */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                
                {/* Columna Izquierda: Puntos clave */}
                <div className="md:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 mb-3 block">
                    Puntos Clave y Hallazgos
                  </span>
                  <ul className="space-y-3">
                    {currentSlide.bulletPoints.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                        <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-xs" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Columna Derecha: Imagen Temática */}
                <div className="md:col-span-5 bg-white rounded-2xl p-2 border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col items-center justify-center min-h-[200px] relative group">
                  {currentSlide.imageUrl ? (
                    <img
                      src={currentSlide.imageUrl}
                      alt={currentSlide.title}
                      className="w-full h-full object-cover rounded-xl shadow-xs max-h-[260px]"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <span className="text-xs font-bold text-slate-400">Ilustración temática incluida en PPTX</span>
                    </div>
                  )}
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[9px] font-bold">
                    Imagen IA HD
                  </span>
                </div>
              </div>

              {/* Controles de Navegación Anterior / Siguiente */}
              <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-200/70">
                <button
                  type="button"
                  onClick={() => setActiveSlideIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={activeSlideIndex === 0}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    activeSlideIndex === 0
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-700 bg-white hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                {/* Miniaturas interactivas */}
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-xs py-1">
                  {planResult.slides.map((_, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => setActiveSlideIndex(sIdx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all shrink-0 ${
                        activeSlideIndex === sIdx
                          ? 'bg-slate-900 text-white scale-110 shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sIdx + 1}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSlideIndex((prev) => Math.min(prev + 1, planResult.slides.length - 1))}
                  disabled={activeSlideIndex === planResult.slides.length - 1}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    activeSlideIndex === planResult.slides.length - 1
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-700 bg-white hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Botón Flotante Inferior de Descarga */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadPptx}
                disabled={isDownloading}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all"
              >
                <Download className="w-5 h-5 stroke-[3]" />
                <span>Descargar Archivo PowerPoint (.pptx)</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
