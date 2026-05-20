import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad — Gunnen",
  description: "Política de privacidad y protección de datos de Gunnen.",
};

export default function PoliticaPrivacidadPage() {
  return (
    <div className="pt-20">
      <section className="section-container">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-display font-serif font-light mb-8">
            Política de Privacidad
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700 leading-relaxed">
            <p className="text-sm text-gray-500">
              Última actualización: {new Date().toLocaleDateString("es-ES")}
            </p>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              1. Información que Recopilamos
            </h2>
            <p>
              Cuando realiza una reserva o compra un bono regalo, recopilamos:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombre y apellidos</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Información de alergias e intolerancias</li>
              <li>Información de pago (procesada por Stripe)</li>
            </ul>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              2. Cómo Utilizamos su Información
            </h2>
            <p>
              Utilizamos su información personal para:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Procesar y gestionar sus reservas</li>
              <li>Enviarle confirmaciones y recordatorios</li>
              <li>Procesar pagos y reembolsos</li>
              <li>Atender sus necesidades dietéticas</li>
              <li>Mejorar nuestros servicios</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              3. Compartir Información
            </h2>
            <p>
              No vendemos ni compartimos su información personal con terceros, excepto:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Con Stripe para procesar pagos</li>
              <li>Con nuestro proveedor de email (Resend)</li>
              <li>Cuando sea requerido por ley</li>
            </ul>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              4. Seguridad de los Datos
            </h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger
              su información personal contra acceso no autorizado, pérdida o alteración.
            </p>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              5. Sus Derechos
            </h2>
            <p>
              Según el RGPD, usted tiene derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acceder a sus datos personales</li>
              <li>Rectificar datos inexactos</li>
              <li>Solicitar la eliminación de sus datos</li>
              <li>Oponerse al procesamiento de sus datos</li>
              <li>Solicitar la portabilidad de sus datos</li>
            </ul>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              6. Cookies
            </h2>
            <p>
              Utilizamos cookies esenciales para el funcionamiento del sitio web y
              cookies de análisis para mejorar su experiencia. Puede gestionar sus
              preferencias de cookies en la configuración de su navegador.
            </p>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              7. Retención de Datos
            </h2>
            <p>
              Conservamos su información personal durante el tiempo necesario para
              cumplir con los fines descritos en esta política, a menos que la ley
              requiera o permita un período de retención más largo.
            </p>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              8. Contacto
            </h2>
            <p>
              Para ejercer sus derechos o realizar consultas sobre privacidad, contacte
              con nosotros en:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email: <a href="mailto:reservas@gunnen.es" className="text-primary underline">reservas@gunnen.es</a></li>
              <li>Teléfono: <a href="tel:+34613739550" className="text-primary underline">+34 613 73 95 50</a></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
