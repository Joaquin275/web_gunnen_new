export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { serializePressPost } from "@/lib/serializers";

export default async function AdminPressPage() {
  const rows = await prisma.pressPost.findMany({ orderBy: { publishedAt: "desc" } });
  const posts = rows.map(serializePressPost);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-light">Prensa</h1>
          <p className="text-gray-500 mt-1">{posts.length} publicaciones</p>
        </div>
        <Link href="/admin/press/new" className="btn-primary">
          + Nueva publicación
        </Link>
      </div>

      <div className="bg-white border border-gray-200 divide-y divide-gray-100">
        {posts.length === 0 ? (
          <p className="px-6 py-12 text-center text-gray-400">
            No hay publicaciones. <Link href="/admin/press/new" className="text-primary underline">Crear la primera</Link>
          </p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="px-6 py-5 flex items-center justify-between hover:bg-gray-50">
              <div className="flex-1 min-w-0 mr-4">
                <p className="font-medium truncate">{post.title}</p>
                <p className="text-sm text-gray-500 truncate mt-1">{post.excerpt}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(post.publishedAt).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-xs px-2 py-1 tracking-wider uppercase ${
                  post.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {post.published ? "Publicado" : "Borrador"}
                </span>
                <Link href={`/admin/press/${post.id}/edit`} className="text-xs tracking-wider uppercase text-gray-500 hover:text-primary">
                  Editar →
                </Link>
                <Link href={`/prensa/${post.slug}`} target="_blank" className="text-xs tracking-wider uppercase text-gray-400 hover:text-primary">
                  Ver →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
