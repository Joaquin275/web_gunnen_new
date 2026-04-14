import type { Metadata } from "next";
import Link from "next/link";
import { pressDb } from "@/lib/db-json";

export const metadata: Metadata = {
  title: "Prensa — Gunnen",
  description: "Últimas noticias y apariciones en prensa de Gunnen.",
};

export default function PrensaPage() {
  const posts = pressDb.findPublished();

  return (
    <div className="pt-20">
      <section className="section-container">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-display font-serif font-light mb-4">Prensa</h1>
          <p className="text-xl text-gray-600">Noticias y reconocimientos</p>
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
