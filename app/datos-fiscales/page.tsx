export const metadata = {
  title: "Datos Fiscales — Gunnen",
  description: "Información fiscal y legal de La Familia Gastro S.L., titular de la marca Gunnen.",
};

export default function DatosFiscalesPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-10">
          <p className="text-xs tracking-widest uppercase text-gray-400 mb-3">Legal</p>
          <h1 className="text-4xl font-serif font-light mb-4">Datos Fiscales</h1>
          <p className="text-gray-500">
            Información de la sociedad titular de la marca y actividad comercial Gunnen,
            conforme a la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la
            Información y de Comercio Electrónico (LSSI-CE).
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-8 space-y-6">

          {/* Datos de la empresa */}
          <div>
            <h2 className="text-xs tracking-widest uppercase text-gray-400 mb-4 pb-2 border-b border-gray-100">
              Identificación del titular
            </h2>
            <dl className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <dt className="text-gray-500 font-medium">Nombre comercial</dt>
                <dd className="sm:col-span-2 text-gray-800 font-semibold">Gunnen</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <dt className="text-gray-500 font-medium">Razón social</dt>
                <dd className="sm:col-span-2 text-gray-800 font-semibold">LA FAMILIA GASTRO, S.L.</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <dt className="text-gray-500 font-medium">CIF</dt>
                <dd className="sm:col-span-2 text-gray-800">B10989226</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <dt className="text-gray-500 font-medium">Domicilio social</dt>
                <dd className="sm:col-span-2 text-gray-800">
                  Rúa Juan de la Cierva, 7<br />
                  15008 A Coruña, España
                </dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <dt className="text-gray-500 font-medium">Teléfono</dt>
                <dd className="sm:col-span-2">
                  <a href="tel:+34613739550" className="text-gray-800 hover:text-primary">
                    +34 613 73 95 50
                  </a>
                </dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <dt className="text-gray-500 font-medium">Email de contacto</dt>
                <dd className="sm:col-span-2">
                  <a href="mailto:reservas@gunnen.es" className="text-gray-800 hover:text-primary">
                    reservas@gunnen.es
                  </a>
                </dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <dt className="text-gray-500 font-medium">Registro Mercantil</dt>
                <dd className="sm:col-span-2 text-gray-800">
                  Registro Mercantil de A Coruña
                </dd>
              </div>
            </dl>
          </div>

          {/* Actividad */}
          <div>
            <h2 className="text-xs tracking-widest uppercase text-gray-400 mb-4 pb-2 border-b border-gray-100">
              Actividad
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>Gunnen</strong> es la línea comercial de restauración de <strong>La Familia Gastro, S.L.</strong>,
              sociedad dedicada a la actividad de restauración y servicios gastronómicos, con establecimiento
              físico en Juan Díaz Porlier, 15 — A Coruña.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mt-3">
              La presente web gestiona el servicio de reservas de mesa y la venta de bonos regalo
              para el restaurante Gunnen.
            </p>
          </div>

          {/* TPV Virtual */}
          <div>
            <h2 className="text-xs tracking-widest uppercase text-gray-400 mb-4 pb-2 border-b border-gray-100">
              Pagos y TPV Virtual
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Los pagos en esta web se procesan a través del <strong>TPV Virtual de Banco Sabadell (Redsys)</strong>,
              sistema certificado con autenticación 3D Secure. La entidad bancaria contratante es
              Banco Sabadell, S.A. Los datos de pago son tratados íntegramente por Redsys y nunca
              son almacenados en nuestros servidores.
            </p>
          </div>

          {/* Normativa */}
          <div>
            <h2 className="text-xs tracking-widest uppercase text-gray-400 mb-4 pb-2 border-b border-gray-100">
              Normativa aplicable
            </h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>— Ley 34/2002, de 11 de julio, LSSI-CE</li>
              <li>— Ley Orgánica 3/2018, de Protección de Datos Personales (LOPDGDD)</li>
              <li>— Reglamento General de Protección de Datos (RGPD — UE 2016/679)</li>
              <li>— Real Decreto Legislativo 1/2007, de 16 de noviembre, de Consumidores y Usuarios</li>
            </ul>
          </div>

        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <a href="/politica-privacidad" className="text-primary underline hover:no-underline">Política de Privacidad</a>
          <a href="/politica-cancelacion" className="text-primary underline hover:no-underline">Política de Cancelación</a>
          <a href="/terminos" className="text-primary underline hover:no-underline">Términos y Condiciones</a>
          <a href="/politica-devolucion" className="text-primary underline hover:no-underline">Política de Devolución</a>
        </div>
      </div>
    </div>
  );
}
