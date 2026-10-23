import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Mail, Lock, FileText, Globe } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidad (2026) — Gryph/',
  description: 'Política de privacidad de Gryph/ en cumplimiento con la Ley N° 29733 de Perú y directivas de Google AdSense.',
};

export default function PrivacidadPage() {
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
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Marco Legal 2026 • Ley N° 29733 & Google Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Política de Privacidad
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Última actualización: Enero de 2026 • Gryph/ Media Technologies
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          
          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-600" />
              1. Marco Normativo Aplicable
            </h2>
            <p>
              Esta Política de Privacidad regula el tratamiento de datos personales en el sitio web <strong>Gryph/</strong> de conformidad con la <strong>Ley N° 29733 (Ley de Protección de Datos Personales de la República del Perú)</strong>, su Reglamento aprobado por <strong>Decreto Supremo N° 003-2013-JUS</strong>, así como los lineamientos y políticas de privacidad para editores de la <strong>plataforma Google (Google Publisher Policies 2026)</strong> y normativas internacionales de protección de datos (GDPR / CCPA).
            </p>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              2. Datos que Recopilamos y Finalidad
            </h2>
            <p>
              Gryph/ es una herramienta de utilidad técnica. <strong>No requerimos registro de cuentas ni recopilamos datos personales sensibles</strong> (como nombres, documentos de identidad o números de teléfono) para el uso básico del servicio gratuito.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
              <li><strong>Datos técnicos y de navegación:</strong> Se pueden registrar direcciones IP anonimizadas, tipo de navegador, sistema operativo y páginas visitadas con fines exclusivos de seguridad, prevención de ataques DDoS y telemetría de rendimiento.</li>
              <li><strong>Procesamiento en memoria volátil:</strong> Los enlaces de videos (URLs) que ingresas se utilizan únicamente en el instante para procesar la petición y se eliminan de la memoria temporal inmediatamente después de la entrega del archivo.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              3. Cookies y Publicidad de Terceros (Google AdSense)
            </h2>
            <p>
              Gryph/ se financia a través de anuncios publicitarios de terceros (incluidos proveedores como <strong>Google AdSense</strong> y redes publicitarias asociadas):
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
              <li>Los proveedores de terceros, incluido Google, utilizan cookies para publicar anuncios basados en las visitas anteriores del usuario a este sitio web u otros sitios web de Internet.</li>
              <li>El uso de cookies de publicidad permite a Google y a sus socios publicar anuncios basados en las visitas que los usuarios hacen a sus sitios o a otros sitios de Internet.</li>
              <li>Los usuarios pueden inhabilitar la publicidad personalizada consultando la <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline font-semibold">Configuración de Anuncios de Google</a> o a través de <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline font-semibold">aboutads.info</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              4. Ejercicio de Derechos ARCO
            </h2>
            <p>
              De acuerdo con la legislación peruana, los usuarios tienen derecho a ejercer sus derechos de <strong>Acceso, Rectificación, Cancelación y Oposición (ARCO)</strong> respecto de cualquier dato personal que pudiera estar almacenado, comunicándose directamente con nuestro oficial de privacidad.
            </p>
          </section>

          <section className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 mt-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-700" />
              5. Contacto y Consultas de Privacidad
            </h3>
            <p className="mt-1 text-slate-600 text-xs">
              Para cualquier consulta sobre el tratamiento de tus datos o ejercer tus derechos de privacidad, contáctanos a nuestro correo oficial:
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
