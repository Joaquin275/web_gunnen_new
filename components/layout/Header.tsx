"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Inicio", href: "/" },
  { name: "Quiénes somos", href: "/quienes-somos" },
  { name: "Menús", href: "/menus" },
  { name: "Prensa", href: "/prensa" },
  { name: "Regala", href: "/regala" },
  { name: "Reservas", href: "/reservas" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detectar scroll para cambiar fondo del header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Bloquear scroll del body cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Cerrar menú al navegar
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // En páginas que no son el home el header siempre es blanco
  const isHome = pathname === "/";
  const isWhite = scrolled || !isHome;

  return (
    <>
      {/* ─── BARRA SUPERIOR ─── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isWhite ? "bg-white shadow-sm" : "bg-transparent"
        }`}
      >
        <nav className="flex items-center justify-between px-5 md:px-10 py-3">

          {/* Logos */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
            <img
              src="/images/logo/gunnen-logo.svg"
              alt="Gunnen"
              className="h-10 sm:h-14 md:h-16 w-auto"
            />
            <div className={`border-l pl-2 sm:pl-3 transition-colors duration-300 ${isWhite ? "border-gray-200" : "border-white/40"}`}>
              <img
                src="/images/logo/premio-sol-repsol.jpg"
                alt="Premio Sol Repsol"
                className="h-14 sm:h-20 md:h-24 w-auto"
              />
            </div>
          </Link>

          {/* Derecha: botón Reservar + hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/reservas"
              className={`hidden sm:inline-block px-5 py-2 text-xs tracking-widest uppercase font-medium transition-colors duration-300 ${
                isWhite
                  ? "bg-primary text-white hover:bg-primary/80"
                  : "bg-white text-primary hover:bg-gray-100 shadow-md"
              }`}
            >
              Reservar
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              className="flex flex-col justify-center items-center gap-[5px] w-10 h-10 focus:outline-none"
            >
              <span className={`block w-7 h-[1.5px] transition-colors duration-300 ${isWhite ? "bg-primary" : "bg-white drop-shadow"}`} />
              <span className={`block w-7 h-[1.5px] transition-colors duration-300 ${isWhite ? "bg-primary" : "bg-white drop-shadow"}`} />
              <span className={`block w-5 h-[1.5px] transition-colors duration-300 self-start ${isWhite ? "bg-primary" : "bg-white drop-shadow"}`} />
            </button>
          </div>
        </nav>
      </header>

      {/* ─── MENÚ OVERLAY ─── */}
      <div
        className={`fixed inset-0 z-[100] flex transition-all duration-500 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(18,18,16,0.97)" }}
      >
        {/* Columna izquierda: navegación */}
        <div className="flex flex-col justify-between w-full md:w-1/2 px-10 md:px-20 py-10">
          {/* Logo dentro del overlay */}
          <div className="flex items-center gap-3">
            <img
              src="/images/logo/gunnen-logo.svg"
              alt="Gunnen"
              className="h-12 w-auto brightness-0 invert"
            />
            <div className="border-l border-white/30 pl-3">
              <img
                src="/images/logo/premio-sol-repsol.jpg"
                alt="Premio Sol Repsol"
                className="h-10 w-auto"
              />
            </div>
          </div>

          {/* Links principales */}
          <nav className="flex flex-col gap-2 mt-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-4xl md:text-5xl font-serif font-light tracking-wide uppercase transition-colors duration-200 ${
                  pathname === item.href
                    ? "text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Info de contacto + RRSS */}
          <div className="mt-auto pt-10 space-y-4">
            <div className="text-sm text-white/50 leading-relaxed">
              <p className="text-white/80 font-medium">Juan Díaz Porlier, 15 — A Coruña</p>
              <p>Mar–Mié: 13:00–15:00</p>
              <p>Jue–Sáb: 13:00–15:00 · 20:00–23:00</p>
            </div>
            <div className="flex gap-5 text-sm tracking-widest uppercase text-white/40">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="hover:text-white transition-colors">Instagram</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="hover:text-white transition-colors">Facebook</a>
            </div>
          </div>
        </div>

        {/* Columna derecha: imagen decorativa (solo desktop) */}
        <div className="hidden md:block w-1/2 relative overflow-hidden">
          <img
            src="/images/hero/Carr1.jpg"
            alt="Gunnen"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        </div>

        {/* Botón cerrar */}
        <button
          onClick={() => setMenuOpen(false)}
          aria-label="Cerrar menú"
          className="absolute top-6 right-8 text-white/60 hover:text-white transition-colors focus:outline-none"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <line x1="4" y1="4" x2="28" y2="28" stroke="currentColor" strokeWidth="1.5" />
            <line x1="28" y1="4" x2="4" y2="28" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
    </>
  );
}
