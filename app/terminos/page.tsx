import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones — Gunnen",
  description: "Términos y condiciones de uso del servicio de Gunnen.",
};

export default function TerminosPage() {
  return (
    <div className="pt-20">
      <section className="section-container">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-display font-serif font-light mb-8">
            Términos y Condiciones
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700 leading-relaxed">
            <p className="text-sm text-gray-500">
              Última actualización: {new Date().toLocaleDateString("es-ES")}
            </p>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              1. Aceptación de los Términos
            </h2>
            <p>
              Al acceder y utilizar este sitio web y los servicios de Gunnen, usted
              acepta estar sujeto a estos términos y condiciones y a nuestra política
              de privacidad.
            </p>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              2. Reservas
            </h2>
            <p>
              Las reservas realizadas a través de nuestro sistema requieren el pago
              de una señal del 30% del importe total estimado. Esta señal garantiza
              su reserva y está sujeta a nuestra política de cancelación.
            </p>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              3. Pagos
            </h2>
            <p>
              Los pagos se procesan de forma segura a través de Stripe. Aceptamos
              tarjetas de crédito/débito y SEPA Debit. El pago de la señal no incluye
              el importe total de la experiencia, que se abonará en el restaurante.
            </p>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              4. Cancelaciones y Reembolsos
            </h2>
            <p>
              Consulte nuestra{" "}
              <a href="/politica-cancelacion" className="text-primary hover:underline">
                Política de Cancelación
              </a>{" "}
              para información detallada sobre cancelaciones y reembolsos.
            </p>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              5. Alergias e Intolerancias
            </h2>
            <p>
              Es responsabilidad del cliente informar sobre cualquier alergia,
              intolerancia o restricción alimentaria al realizar la reserva. Haremos
              todo lo posible por adaptar nuestros menús, pero no podemos garantizar
              un entorno 100% libre de alérgenos.
            </p>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              6. Código de Conducta
            </h2>
            <p>
              Esperamos que todos nuestros clientes se comporten de manera respetuosa
              hacia el personal y otros comensales. Nos reservamos el derecho de
              rechazar el servicio a cualquier persona que no cumpla con nuestros
              estándares de conducta.
            </p>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              7. Bonos Regalo
            </h2>
            <p>
              Los bonos regalo son válidos durante 6 meses desde su fecha de emisión.
              No son reembolsables y no pueden canjearse por dinero en efectivo.
            </p>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              8. Propiedad Intelectual
            </h2>
            <p>
              Todo el contenido de este sitio web, incluyendo textos, imágenes,
              logotipos y diseño, es propiedad de Gunnen y está protegido por las
              leyes de propiedad intelectual.
            </p>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              9. Modificaciones
            </h2>
            <p>
              Nos reservamos el derecho de modificar estos términos y condiciones en
              cualquier momento. Los cambios entrarán en vigor inmediatamente después
              de su publicación en el sitio web.
            </p>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              10. Contacto
            </h2>
            <p>
              Para cualquier consulta sobre estos términos y condiciones, puede
              contactarnos en:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email: reservas@gunnen.es</li>
              <li>Teléfono: +34 XXX XXX XXX</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
