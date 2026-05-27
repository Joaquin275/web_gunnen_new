import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block hover:opacity-70 transition-opacity mb-4">
              <img
                src="/images/logo/gunnen-logo.svg"
                alt="Gunnen"
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed">
              Cocina de autor comprometida con el producto fresco y local. Alegría compartida.
            </p>
          </div>

          {/* Restaurante */}
          <div>
            <h3 className="text-xs tracking-widest uppercase mb-5 text-white/60">Restaurante</h3>
            <ul className="space-y-3">
              {[
                { name: "Inicio", href: "/" },
                { name: "Quiénes somos", href: "/quienes-somos" },
                { name: "Menús", href: "/menus" },
                { name: "Prensa", href: "/prensa" },
                { name: "Regala", href: "/regala" },
              ].map((l) => (
                <li key={l.name}>
                  <Link href={l.href} className="text-sm text-gray-300 hover:text-white transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Horarios y ubicación */}
          <div>
            <h3 className="text-xs tracking-widest uppercase mb-5 text-white/60">Visítanos</h3>
            <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
              <div>
                <p className="text-white font-medium mb-1">Juan Díaz Porlier, 15</p>
                <p>A Coruña, Galicia</p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Horarios</p>
                <p>Mar–Mié: 13:00–15:00</p>
                <p>Jue–Sáb: 13:00–15:00</p>
                <p className="pl-11">20:00–23:00</p>
                <p className="text-white/40 mt-1">Dom–Lun: Cerrado</p>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-xs tracking-widest uppercase mb-5 text-white/60">Contacto</h3>
            <ul className="space-y-3 text-sm mb-6">
              <li>
                <a href="mailto:reservas@gunnen.es" className="text-gray-300 hover:text-white transition-colors">
                  reservas@gunnen.es
                </a>
              </li>
            </ul>
            <Link
              href="/reservas"
              className="inline-block px-6 py-3 text-xs tracking-widest uppercase border border-white/30 text-white hover:bg-white hover:text-primary transition-colors"
            >
              Reservar mesa
            </Link>
          </div>
        </div>

        {/* Legal links row */}
        <div className="pt-8 border-t border-white/10 mb-6">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/datos-fiscales" className="text-xs text-gray-400 hover:text-white transition-colors">
              Datos Fiscales
            </Link>
            <Link href="/terminos" className="text-xs text-gray-400 hover:text-white transition-colors">
              Términos y Condiciones
            </Link>
            <Link href="/politica-devolucion" className="text-xs text-gray-400 hover:text-white transition-colors">
              Política de Devolución
            </Link>
            <Link href="/politica-cancelacion" className="text-xs text-gray-400 hover:text-white transition-colors">
              Política de Cancelación
            </Link>
            <Link href="/politica-privacidad" className="text-xs text-gray-400 hover:text-white transition-colors">
              Política de Privacidad
            </Link>
          </div>
        </div>

        {/* Franja institucional — Xunta de Galicia */}
        <div className="pt-8 border-t border-white/10 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            {/* Logos */}
            <div className="flex items-center gap-4 flex-shrink-0 bg-white rounded px-4 py-3">
              <img
                src="/images/institucional/logo-ue.png"
                alt="Unión Europea"
                className="h-10 w-auto object-contain"
              />
              <img
                src="/images/institucional/logo-sepe.jpg"
                alt="SEPE"
                className="h-10 w-auto object-contain"
              />
              <img
                src="/images/institucional/logo-xunta.jpg"
                alt="Xunta de Galicia"
                className="h-10 w-auto object-contain"
              />
            </div>
            {/* Texto */}
            <p className="text-xs text-gray-400 leading-relaxed max-w-xl text-center sm:text-left">
              <strong className="text-gray-300">LA FAMILIA GASTRO SL. (GUNNEN)</strong> ha sido beneficiaria del Programa de Incentivos a la Contratación por Cuenta Ajena (TR542C), impulsado por la Xunta de Galicia para fomentar el empleo de calidad en el tejido empresarial gallego.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {currentYear} LA FAMILIA GASTRO, S.L. · Gunnen. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a href="https://www.instagram.com/gunnen_restaurante?igsh=MTh2enB4ajhkdGQzcg==" target="_blank" rel="noopener noreferrer"
              className="text-xs tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
              Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
              className="text-xs tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
