import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, AlertTriangle, Scale, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Términos de Servicio (2026) — Gryph/',
  description: 'Términos y condiciones de uso de Gryph/ bajo la legislación peruana y normativas de intermediación digital de Google.',
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white/85 backdrop-blur-2xl border border-white/80 rounded-4xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(60,82,96,0.15)] text-slate-800">
        
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
        <div className="border-b border-slate-200/80 pb-6 mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full mb-3">
            <Scale className="w-4 h-4 text-amber-700" />
            <span>Marco Competente 2026 • Ley Peruana & Estándares Globales</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Términos de Servicio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Vigente para el año 2026 • Plataforma Gryph/ Media Technologies
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          
          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              1. Aceptación de las Condiciones
            </h2>
            <p>
              Al acceder y utilizar <strong>Gryph/</strong>, el usuario acepta de manera expresa e irrestricta estos Términos de Servicio. Si no estás de acuerdo con cualquiera de estas disposiciones, debes abstenerte de utilizar la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              2. Naturaleza del Servicio y No Almacenamiento
            </h2>
            <p>
              Gryph/ opera estrictamente como una <strong>herramienta tecnológica de conversión y procesamiento en la nube</strong>.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-600">
              <li><strong>No alojamos archivos:</strong> Gryph/ no almacena, no indexa, no reproduce públicamente ni mantiene bases de datos con archivos multimedia protegidos por derechos de autor en sus servidores.</li>
              <li><strong>Procesamiento en tránsito:</strong> La conversión de video a formato MP4 o audio MP3 se realiza como un conducto de datos técnico en memoria volátil temporal. Todo archivo residual se purga de forma automatizada al completarse la descarga.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-600" />
              3. Propiedad Intelectual y Responsabilidad del Usuario
            </h2>
            <p>
              En cumplimiento del <strong>Decreto Legislativo N° 822 (Ley sobre el Derecho de Autor del Perú)</strong> y los tratados de la OMPI:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-600">
              <li>El usuario es el único responsable legal del uso que dé a los materiales que decida procesar mediante esta herramienta.</li>
              <li>El usuario se compromete a descargar únicamente contenidos de dominio público, obras bajo licencias abiertas (Creative Commons) o materiales sobre los cuales cuente con expresa autorización del titular o aplique la excepción de copia privada para uso estrictamente personal sin fines de lucro.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              4. Procedimiento de Notificación y Retirada (Takedown / DMCA)
            </h2>
            <p>
              Respetamos los derechos de autor de terceros. Si eres titular de derechos o un representante autorizado y deseas solicitar el bloqueo técnico permanente de un enlace o dominio específico en nuestro motor, puedes enviar una notificación a nuestro canal oficial de soporte. Procesamos las solicitudes de exclusión en un plazo menor a 24 horas.
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              5. Ley Aplicable y Jurisdicción
            </h2>
            <p>
              Estos términos se rigen e interpretan de conformidad con las <strong>leyes de la República del Perú</strong>. Cualquier controversia derivada del uso del sitio web será sometida a la competencia de los jueces y tribunales del distrito judicial de Lima, Perú.
            </p>
          </section>

          <section className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 mt-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-700" />
              6. Canal Oficial de Contacto y Soporte
            </h3>
            <p className="mt-1 text-slate-600 text-xs">
              Para notificaciones legales, soporte sobre descargas o consultas generales sobre el servicio:
            </p>
            <p className="mt-2 text-sm font-bold text-amber-800">
              📧 <a href="mailto:tonycavero40@gmail.com" className="underline">tonycavero40@gmail.com</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
