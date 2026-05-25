"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/admin" },
  { name: "Analytics", href: "/admin/analytics" },
  { name: "Mesas", href: "/admin/tables" },
  { name: "Disponibilidad", href: "/admin/availability" },
  { name: "Reservas", href: "/admin/reservations" },
  { name: "Cupones", href: "/admin/coupons" },
  { name: "Bonos Regalo", href: "/admin/giftcards" },
  { name: "Prensa", href: "/admin/press" },
  { name: "Configuración", href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [status, router, pathname]);

  // Cerrar sidebar al navegar
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  // Bloquear scroll del body cuando el sidebar está abierto en móvil
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  if (pathname === "/admin/login") {
    return children;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">

          {/* Izquierda: hamburguesa + logo */}
          <div className="flex items-center gap-3">
            {/* Hamburguesa (solo móvil/tablet) */}
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
              className="lg:hidden flex flex-col justify-center items-center gap-[5px] w-9 h-9 shrink-0"
            >
              <span className="block w-5 h-[1.5px] bg-gray-700" />
              <span className="block w-5 h-[1.5px] bg-gray-700" />
              <span className="block w-3 h-[1.5px] bg-gray-700 self-start" />
            </button>

            <Link href="/" className="shrink-0">
              <img
                src="/images/logo/gunnen-logo.svg"
                alt="Gunnen"
                className="h-6 w-auto"
              />
            </Link>
            <span className="hidden sm:block text-xs tracking-wider uppercase text-gray-400">
              Panel Admin
            </span>
          </div>

          {/* Derecha: email + salir */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="hidden md:block text-sm text-gray-500 truncate max-w-[180px]">
              {session.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="text-xs tracking-wider uppercase text-gray-500 hover:text-primary transition-colors whitespace-nowrap"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="flex relative">

        {/* ── OVERLAY MÓVIL ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── SIDEBAR ── */}
        <aside
          className={`
            fixed top-0 left-0 h-full z-50 w-64 bg-white border-r border-gray-200
            transform transition-transform duration-300 ease-in-out
            lg:static lg:translate-x-0 lg:shrink-0 lg:h-auto lg:min-h-[calc(100vh-57px)]
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Cabecera del sidebar en móvil */}
          <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <img src="/images/logo/gunnen-logo.svg" alt="Gunnen" className="h-6 w-auto" />
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" />
                <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          <nav className="p-4 pt-5">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`block px-4 py-2.5 text-xs tracking-wider uppercase transition-colors rounded-sm ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* ── CONTENIDO PRINCIPAL ── */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
