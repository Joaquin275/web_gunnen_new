import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { pressDb } from "@/lib/db-json";

export const metadata: Metadata = {
  title: "Prensa — Gunnen",
  description: "Últimas noticias y apariciones en prensa de Gunnen.",
};

export default function PrensaPage() {
  const posts = pressDb.findPublished();

  return (
    <div>
      {/* Hero con imagen */}
      <section className="relative h-[75vh] min-h-[520px] overflow-hidden">
        <Image
          src="/images/heroes/prensa.jpg"
          alt="Prensa Gunnen"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">Noticias y reconocimientos</p>
          <h1
            className="text-white uppercase tracking-[0.15em] font-light"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Prensa
          </h1>
        </div>
      </section>

      <section className="section-container bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-10">
          {posts.length === 0 ? (
            <p className="text-gray-400 text-center py-12">No hay publicaciones aún</p>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="border-b border-gray-200 pb-10">
                <Link href={`/prensa/${post.slug}`} className="group block">
                  <p className="text-xs tracking-wider uppercase text-gray-400 mb-2">
                    {new Date(post.publishedAt).toLocaleDateString("es-ES", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                  <h2 className="text-xl sm:text-3xl font-serif font-light mb-3 group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4">{post.excerpt}</p>
                  <span className="text-sm tracking-wider uppercase text-gray-500 group-hover:text-primary transition-colors">
                    Leer más →
                  </span>
                </Link>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
