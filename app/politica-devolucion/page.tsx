export const metadata = {
  title: "Política de Devolución — Gunnen",
  description: "Política de venta, cancelación y devolución del restaurante Gunnen (La Familia Gastro S.L.).",
};

export default function PoliticaDevolucionPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-10">
          <p className="text-xs tracking-widest uppercase text-gray-400 mb-3">Legal</p>
          <h1 className="text-4xl font-serif font-light mb-4">Política de Venta y Devolución</h1>
          <p className="text-gray-500">
            Condiciones de venta, cancelación y derecho de desistimiento aplicables a las
            reservas y bonos regalo gestionados a través de esta web.
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-8 space-y-8 text-sm text-gray-700 leading-relaxed">

          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">1. Titular y ámbito de aplicación</h2>
            <p>
              Esta política es aplicable a todos los servicios contratados a través de{" "}
              <strong>web-gunnen-new.vercel.app</strong> y <strong>gunnen.es</strong>, gestionados por{" "}
              <strong>LA FAMILIA GASTRO, S.L.</strong> (CIF B10989226), titular de la marca Gunnen,
              con domicilio en Rúa Juan de la Cierva, 7 — 15008 A Coruña.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">2. Reservas de mesa</h2>
            <div className="space-y-3">
              <p>
                <strong>Señal / garantía (30%):</strong> Al confirmar una reserva, se realiza una
                preautorización bancaria del 30% del importe estimado como garantía. Esta cantidad
                queda bloqueada en la tarjeta del cliente pero <strong>no se cobra</strong> hasta que
                el restaurante lo confirme.
              </p>
              <p>
                <strong>Cancelación con más de 24 horas de antelación:</strong> La reserva puede
                cancelarse sin cargo. La preautorización es liberada y el importe retenido queda
                disponible en la tarjeta del cliente en un plazo de 1 a 5 días hábiles según la entidad bancaria.
              </p>
              <p>
                <strong>Cancelación con menos de 24 horas o no presentación:</strong> El restaurante
                se reserva el derecho a confirmar el cobro de la garantía (30% del importe estimado)
                como compensación por la plaza reservada no utilizada.
              </p>
              <p>
                <strong>Para cancelar una reserva</strong> contacte con nosotros en{" "}
                <a href="mailto:reservas@gunnen.es" className="text-primary underline">reservas@gunnen.es</a>{" "}
                o por teléfono al <a href="tel:+34613739550" className="text-primary underline">+34 613 73 95 50</a>.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">3. Bonos regalo</h2>
            <div className="space-y-3">
              <p>
                <strong>Pago:</strong> Los bonos regalo se abonan íntegramente en el momento de la
                compra mediante TPV Virtual (Redsys / Banco Sabadell).
              </p>
              <p>
                <strong>Validez:</strong> Los bonos tienen una validez de <strong>12 meses</strong> desde
                la fecha de emisión, indicada en el propio bono.
              </p>
              <p>
                <strong>Derecho de desistimiento:</strong> Conforme al artículo 103 del Real Decreto
                Legislativo 1/2007, los bonos regalo son servicios de ocio/restauración con fecha
                específica de prestación, por lo que <strong>no aplica el derecho de desistimiento</strong> de
                14 días una vez emitido el bono.
              </p>
              <p>
                <strong>Devolución por imposibilidad del servicio:</strong> En el caso excepcional de
                que el restaurante no pueda prestar el servicio en la fecha acordada por causas
                imputables al establecimiento, se procederá al reembolso íntegro del importe abonado
                en un plazo máximo de 14 días hábiles.
              </p>
              <p>
                <strong>Bono no utilizado:</strong> Una vez caducado el período de validez sin haber
                sido canjeado, el bono pierde su validez sin derecho a reembolso.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">4. Procedimiento de reclamación</h2>
            <p>
              Para cualquier reclamación relacionada con reservas o bonos regalo, puede contactar con
              nosotros en:
            </p>
            <ul className="mt-3 space-y-1 pl-4">
              <li>— Email: <a href="mailto:reservas@gunnen.es" className="text-primary underline">reservas@gunnen.es</a></li>
              <li>— Teléfono: <a href="tel:+34613739550" className="text-primary underline">+34 613 73 95 50</a></li>
              <li>— Dirección: Juan Díaz Porlier, 15 — A Coruña</li>
            </ul>
            <p className="mt-3">
              Nos comprometemos a responder en un plazo máximo de <strong>72 horas laborables</strong>.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">5. Legislación aplicable</h2>
            <p>
              Esta política se rige por la legislación española vigente, en particular el Real Decreto
              Legislativo 1/2007 de Consumidores y Usuarios, y la Ley 34/2002 de Servicios de la
              Sociedad de la Información.
            </p>
          </div>

          <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">
            Última actualización: mayo 2026 · LA FAMILIA GASTRO, S.L.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <a href="/datos-fiscales" className="text-primary underline hover:no-underline">Datos Fiscales</a>
          <a href="/politica-privacidad" className="text-primary underline hover:no-underline">Política de Privacidad</a>
          <a href="/politica-cancelacion" className="text-primary underline hover:no-underline">Política de Cancelación</a>
          <a href="/terminos" className="text-primary underline hover:no-underline">Términos y Condiciones</a>
        </div>
      </div>
    </div>
  );
}
