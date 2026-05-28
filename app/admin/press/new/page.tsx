"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewPressPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    externalUrl: "",
    published: false,
    publishedAt: new Date().toISOString().split("T")[0],
  });

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((f) => ({ ...f, title, slug: generateSlug(title) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/press", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, publishedAt: new Date(form.publishedAt).toISOString() }),
      });
      if (res.ok) {
        router.push("/admin/press");
        return;
      }
      const data = await res.json().catch(() => ({}));
      alert(data.error || `Error al guardar (${res.status})`);
    } catch (err) {
      alert("Error de conexión al guardar");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/press" className="text-xs tracking-wider uppercase text-gray-400 hover:text-primary">
          ← Volver
        </Link>
      </div>

      <h1 className="text-3xl font-serif font-light">Nueva publicación</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Título *</label>
          <input
            type="text"
            value={form.title}
            onChange={handleTitle}
            required
            className="input-premium w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary"
            placeholder="Título del artículo"
          />
        </div>

        <div>
          <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Slug (URL)</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className="input-premium w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Extracto *</label>
          <textarea
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            required
            rows={2}
            className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary resize-none text-sm"
            placeholder="Breve descripción para listados"
          />
        </div>

        <div>
          <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Imagen de portada</label>
          <input
            type="url"
            value={form.coverImage}
            onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
            className="input-premium w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm"
            placeholder="https://..."
          />
          <p className="text-xs text-gray-400 mt-1">
            Pega la URL de la imagen de la noticia. Si la dejas vacía, la noticia se mostrará sin portada.
          </p>
        </div>

        <div>
          <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Enlace externo (artículo original)</label>
          <input
            type="url"
            value={form.externalUrl}
            onChange={(e) => setForm((f) => ({ ...f, externalUrl: e.target.value }))}
            className="input-premium w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm"
            placeholder="https://www.lavanguardia.com/..."
          />
          <p className="text-xs text-gray-400 mt-1">
            Si rellenas este campo, al hacer clic en la noticia se abrirá este enlace externo en vez de una página interna.
          </p>
        </div>

        <div>
          <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Contenido *</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            required
            rows={12}
            className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary resize-y text-sm font-mono"
            placeholder="Escribe el contenido del artículo..."
          />
        </div>

        <div className="flex items-center gap-6">
          <div>
            <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Fecha de publicación</label>
            <input
              type="date"
              value={form.publishedAt}
              onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
              className="border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm"
            />
          </div>
          <div className="flex items-center gap-2 mt-5">
            <input
              type="checkbox"
              id="published"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              className="w-4 h-4"
            />
            <label htmlFor="published" className="text-sm text-gray-700">Publicar inmediatamente</label>
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar publicación"}
          </button>
          <Link href="/admin/press" className="btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
