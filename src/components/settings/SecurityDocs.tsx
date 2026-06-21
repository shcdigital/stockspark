import React from 'react';
import { Shield, Key, CheckCircle2, AlertTriangle, Terminal, EyeOff, ShieldCheck } from 'lucide-react';

// Logo del negocio - placeholder URL (debe reemplazarse con el logo real)
const BUSINESS_LOGO = 'https://placehold.co/48x48/f0fdfa/14b8a6?text=LOGO';

export const SecurityDocs: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-3 text-primary-700 font-bold text-xl">
          <ShieldCheck className="h-8 w-8" />
          <span>Arquitectura de Seguridad Reforzada de Punta a Punta</span>
        </div>
        <p className="text-neutral-600 text-sm leading-relaxed">
          Este documento actúa como guía interactiva y checklist de despliegue obligatorio para garantizar la protección absoluta de los datos del inventario en un entorno 100% estático (GitHub Pages) sin backend propio.
        </p>
      </div>

      {/* Table of layers */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="p-6 bg-primary-50/30 border-b border-neutral-200">
          <h2 className="text-lg font-bold text-neutral-900 flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary-600" />
            <span>Resumen Ejecutivo de Capas de Seguridad</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary-50/30 border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                <th className="py-3 px-6">Mecanismo / Capa</th>
                <th className="py-3 px-6">Amenaza Principal que Previene</th>
                <th className="py-3 px-6">Funcionamiento en el Sistema</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm text-neutral-700">
              <tr className="hover:bg-primary-50/30 transition-colors">
                <td className="py-4 px-6 font-bold text-neutral-900 flex items-center space-x-2">
                  <EyeOff className="h-4 w-4 text-purple-500" />
                  <span>StaticCrypt</span>
                </td>
                <td className="py-4 px-6 text-neutral-600">Scraping masivo e inspección del código fuente.</td>
                <td className="py-4 px-6 text-xs text-neutral-500">
                  Encripta el archivo HTML resultante estático con una contraseña. Oculta el código fuente en reposo pero no reemplaza la autenticación en Firestore.
                </td>
              </tr>
              <tr className="hover:bg-primary-50/30 transition-colors">
                <td className="py-4 px-6 font-bold text-neutral-900 flex items-center space-x-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Firebase App Check</span>
                </td>
                <td className="py-4 px-6 text-neutral-600">Robo de API Keys para crear clientes falsos o cURL bots.</td>
                <td className="py-4 px-6 text-xs text-neutral-500">
                  Firma peticiones con tokens criptográficos generados por reCAPTCHA v3. Firestore rechaza peticiones de orígenes externos no autorizados.
                </td>
              </tr>
              <tr className="hover:bg-primary-50/30 transition-colors">
                <td className="py-4 px-6 font-bold text-neutral-900 flex items-center space-x-2">
                  <Key className="h-4 w-4 text-amber-500" />
                  <span>Restricción API Key</span>
                </td>
                <td className="py-4 px-6 text-neutral-600">Explotación de cuota Spark desde dominios de terceros.</td>
                <td className="py-4 px-6 text-xs text-neutral-500">
                  En Google Cloud Console se vincula la clave exclusivamente al HTTP Referrer de tu GitHub Pages (`tuusuario.github.io/*`).
                </td>
              </tr>
              <tr className="hover:bg-primary-50/30 transition-colors">
                <td className="py-4 px-6 font-bold text-neutral-900 flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-500" />
                  <span>Allowlist de Emails</span>
                </td>
                <td className="py-4 px-6 text-neutral-600">Registro público arbitrario en Firebase Auth.</td>
                <td className="py-4 px-6 text-xs text-neutral-500">
                  Las Firestore Rules comprueban que el email exista en `config/system`. Un email ajeno a los 10 empleados no puede leer ni escribir datos.
                </td>
              </tr>
              <tr className="hover:bg-primary-50/30 transition-colors">
                <td className="py-4 px-6 font-bold text-neutral-900 flex items-center space-x-2">
                  <Key className="h-4 w-4 text-primary-500" />
                  <span>2FA TOTP (MFA)</span>
                </td>
                <td className="py-4 px-6 text-neutral-600">Robo o adivinación de contraseñas de empleados.</td>
                <td className="py-4 px-6 text-xs text-neutral-500">
                  Exige un segundo factor rotativo en Google Authenticator/Authy. Las Firestore Rules exigen pasar por MFA en peticiones sensibles.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Anti-pattern warning */}
      <div className="bg-secondary-50 border border-secondary-200 p-6 rounded-2xl space-y-4 text-secondary-700">
        <div className="flex items-center space-x-3 text-secondary-600 font-bold text-lg">
          <AlertTriangle className="h-6 w-6 shrink-0" />
          <span>Antipatrón Crítico: NUNCA Almacenar una Clave Privada (Service Account) en el Cliente</span>
        </div>
        <p className="text-sm leading-relaxed">
          Existe el error común de querer empaquetar o leer un archivo JSON de cuenta de servicio de Firebase en el código del frontend para otorgar permisos. <strong>Cualquier clave que llegue al JavaScript del navegador deja de ser un secreto al instante.</strong>
        </p>
        <p className="text-sm leading-relaxed">
          Dado que una clave de Service Account tiene acceso completo como administrador a todo el proyecto (ignorando por completo las Reglas de Seguridad de Firestore), un atacante podría extraerla en segundos y borrar o robar la base de datos entera. 
        </p>
        <p className="text-sm font-semibold text-emerald-700 bg-white p-4 rounded-xl border border-emerald-200">
          ✓ La arquitectura correcta y segura implementada aquí es la combinación de Firebase App Check + Restricción de Dominio + Firestore Rules con Allowlist + 2FA.
        </p>
      </div>

      {/* StaticCrypt build guide */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 mb-2">
          <img src={BUSINESS_LOGO} alt="Logo" className="h-8 w-8 rounded-lg border border-primary-200" />
          <h3 className="text-lg font-bold text-neutral-900 flex items-center space-x-2">
            <Terminal className="h-5 w-5 text-primary-600" />
            <span>Manual de Construcción y Encriptación (StaticCrypt)</span>
          </h3>
        </div>
        <p className="text-sm text-neutral-600">
          La aplicación utiliza <code className="bg-primary-50 px-2 py-0.5 rounded text-primary-700">vite-plugin-singlefile</code> para generar un único archivo <code className="bg-primary-50 px-2 py-0.5 rounded text-primary-700">dist/index.html</code> que incluye todo el JS y CSS inyectado.
        </p>
        <div className="bg-primary-50/50 p-4 rounded-xl border border-primary-200 font-mono text-xs text-neutral-900 space-y-2">
          <p className="text-neutral-500"># 1. Ejecutar el build de producción con Vite:</p>
          <p className="text-emerald-600">npm run build</p>
          <p className="text-neutral-500 pt-2"># 2. Encriptar el resultado con StaticCrypt (reemplace con su contraseña corporativa):</p>
          <p className="text-primary-600">
            npx staticrypt dist/index.html -p "StockSparkSecure2026" -o dist/index.html -t "Acceso Protegido — StockSpark Pro" --instructions "Ingrese la contraseña corporativa para desencriptar el portal."
          </p>
          <p className="text-neutral-500 pt-2"># 3. Desplegar el archivo dist/index.html resultante en su GitHub Pages.</p>
        </div>
      </div>

    </div>
  );
};