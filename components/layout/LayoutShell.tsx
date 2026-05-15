"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

const WHATSAPP_NUMBER = "34613739550";
const WHATSAPP_MESSAGE = "Hola, me gustaría hacer una reserva en Gunnen.";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Header />}
      <main className="min-h-screen">
        {children}
      </main>
      {!isAdmin && <Footer />}

      {/* Botón flotante WhatsApp */}
      {!isAdmin && (
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group"
        >
          {/* Etiqueta de texto — visible en hover */}
          <span
            className="hidden sm:flex items-center px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg
                       opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0
                       transition-all duration-300 whitespace-nowrap"
            style={{ backgroundColor: "#25D366" }}
          >
            ¿Necesitas ayuda?
          </span>

          {/* Círculo con icono + pulso */}
          <span className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-xl
                           transition-transform duration-200 group-hover:scale-110 active:scale-95"
                style={{ backgroundColor: "#25D366" }}>
            {/* Anillo de pulso */}
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ backgroundColor: "#25D366" }}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              width="28"
              height="28"
              fill="white"
            >
              <path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.67 4.85 1.93 6.94L2 30l7.3-1.91A13.94 13.94 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5a11.44 11.44 0 0 1-5.83-1.6l-.42-.25-4.33 1.13 1.16-4.22-.27-.44A11.5 11.5 0 1 1 16 27.5zm6.29-8.62c-.34-.17-2.02-.99-2.33-1.1-.31-.11-.54-.17-.77.17-.23.34-.88 1.1-1.08 1.33-.2.23-.4.26-.74.09-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.77-1.85-1.05-2.54-.28-.67-.56-.58-.77-.59l-.65-.01c-.23 0-.6.09-.91.43-.31.34-1.19 1.16-1.19 2.83s1.22 3.28 1.39 3.51c.17.23 2.4 3.66 5.82 5.13.81.35 1.45.56 1.94.72.82.26 1.56.22 2.15.13.66-.1 2.02-.82 2.31-1.62.28-.79.28-1.47.2-1.62-.09-.14-.31-.23-.65-.4z" />
            </svg>
          </span>
        </a>
      )}
    </>
  );
}
