import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cancelación — Gunnen",
  description: "Política de cancelación de reservas de Gunnen.",
};

export default function PoliticaCancelacionPage() {
  return (
    <div className="pt-20">
      <section className="section-container">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-display font-serif font-light mb-8">
            Política de Cancelación
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700 leading-relaxed">
            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              Reservas y Señal
            </h2>
            <p>
              Al realizar una reserva en Gunnen, se requiere el pago de una señal
              equivalente al 30% del importe total estimado. Esta señal garantiza
              su mesa y nos permite planificar el servicio con la máxima calidad.
            </p>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              Política de Cancelación
            </h2>
            <p>
              Entendemos que pueden surgir imprevistos. Nuestra política de
              cancelación es la siguiente:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Cancelación con 72 horas o más de antelación:</strong> Reembolso
                del 100% de la señal.
              </li>
              <li>
                <strong>Cancelación entre 48 y 72 horas de antelación:</strong> Reembolso
                del 100% de la señal.
              </li>
              <li>
                <strong>Cancelación con menos de 48 horas de antelación:</strong> No se
                realizará reembolso de la señal.
              </li>
            </ul>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              Cómo Cancelar
            </h2>
            <p>
              Para cancelar su reserva, por favor contacte con nosotros a través de:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email: reservas@gunnen.es</li>
              <li>Teléfono: +34 XXX XXX XXX</li>
            </ul>
            <p>
              También puede gestionar su reserva a través del enlace incluido en el
              email de confirmación.
            </p>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              Reembolsos
            </h2>
            <p>
              Los reembolsos se procesarán automáticamente al método de pago original
              en un plazo de 5 a 10 días laborables.
            </p>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              No Presentación
            </h2>
            <p>
              En caso de no presentación sin cancelación previa, la señal no será
              reembolsable y podríamos aplicar cargos adicionales.
            </p>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              Modificaciones
            </h2>
            <p>
              Si desea modificar su reserva (fecha, hora o número de comensales),
              contacte con nosotros lo antes posible. Haremos todo lo posible por
              acomodar su solicitud según disponibilidad.
            </p>

            <h2 className="text-2xl font-serif font-light mt-8 mb-4">
              Contacto
            </h2>
            <p>
              Para cualquier consulta sobre nuestra política de cancelación, no dude
              en contactarnos en info@gunnen.es
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
