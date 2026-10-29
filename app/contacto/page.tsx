import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Clock, ShieldCheck, Send } from 'lucide-react';

export const metadata = {
  title: 'Contacto y Soporte — Gryph/',
  description: 'Canal oficial de atención, soporte técnico y consultas legales para Gryph/ Video Downloader.',
};

export default function ContactoPage() {
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white/85 backdrop-blur-2xl border border-white/80 rounded-4xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(60,82,96,0.15)] text-slate-800">
        
        {/* Back navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white/70 hover:bg-white px-3.5 py-1.5 rounded-full border border-slate-200 transition-all mb-6 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <img src="/logo.png" alt="Gryph" className="w-4 h-4 rounded-sm object-cover" />
          <span>Volver a Gryph/</span>
        </Link>

        {/* Header */}
        <div className="border-b border-slate-200/80 pb-6 mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full mb-3">
            <MessageSquare className="w-4 h-4 text-amber-700" />
            <span>Centro de Atención y Soporte Oficial</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contacto & Soporte
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Estamos disponibles para resolver cualquier duda técnica, reporte de enlaces o consulta legal.
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-4">
          
          {/* Main Direct Email Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/30 shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Correo Electrónico Oficial
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 break-all">
                  tonycavero40@gmail.com
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atención directa para usuarios, anunciantes y soporte técnico.
                </p>
              </div>
            </div>

            <a
              href="mailto:tonycavero40@gmail.com?subject=Consulta%20Gryph/%20Video%20Downloader"
              className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-all hover:scale-105 flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center"
            >
              <span>Escribir Correo</span>
              <Send className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Details Grid */}
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-xs mb-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Tiempo de Respuesta</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Respondemos todas las consultas en un plazo promedio menor a <strong>24 horas hábiles</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-xs mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Solicitudes Legales / DMCA</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Para solicitar el bloqueo de un enlace protegido, incluye la URL original en el cuerpo del mensaje.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
