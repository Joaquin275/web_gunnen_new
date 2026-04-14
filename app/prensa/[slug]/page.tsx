import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pressDb } from "@/lib/db-json";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = pressDb.findBySlug(params.slug);
  if (!post) return { title: "Artículo no encontrado" };
  return { title: `${post.title} — Gunnen`, description: post.excerpt };
}

export default function PressDetailPage({ params }: { params: { slug: string } }) {
  const post = pressDb.findBySlug(params.slug);
  if (!post || !post.published) notFound();

  return (
    <div className="pt-20">
      <section className="section-container">
        <div className="max-w-3xl mx-auto">
          <Link href="/prensa" className="text-xs tracking-wider uppercase text-gray-400 hover:text-primary block mb-8">
            ← Volver a prensa
          </Link>
          <p className="text-xs tracking-wider uppercase text-gray-400 mb-4">
            {new Date(post.publishedAt).toLocaleDateString("es-ES", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
          <h1 className="text-display font-serif font-light mb-6">{post.title}</h1>
          <p className="text-xl text-gray-600 italic mb-12 pb-8 border-b border-gray-200">{post.excerpt}</p>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
            {post.content.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
