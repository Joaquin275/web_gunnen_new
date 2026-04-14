"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditPressPage() {
  const router = useRouter();
  const params = useParams();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", published: false, publishedAt: "",
  });

  useEffect(() => {
    fetch(`/api/admin/press/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setForm({
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt,
            content: data.content,
            published: data.published,
            publishedAt: data.publishedAt?.split("T")[0] ?? "",
          });
        }
      });
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/admin/press/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, publishedAt: new Date(form.publishedAt).toISOString() }),
    });
    if (res.ok) router.push("/admin/press");
    else { alert("Error al guardar"); setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar esta publicación? Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/press/${params.id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/press");
    else { alert("Error al eliminar"); setDeleting(false); }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/press" className="text-xs tracking-wider uppercase text-gray-400 hover:text-primary">← Volver</Link>
      </div>
      <h1 className="text-3xl font-serif font-light">Editar publicación</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Título *</label>
          <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required
            className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Slug</label>
          <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary font-mono text-sm" />
        </div>
        <div>
          <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Extracto *</label>
          <textarea value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} required rows={2}
            className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary resize-none text-sm" />
        </div>
        <div>
          <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Contenido *</label>
          <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} required rows={12}
            className="w-full border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary resize-y text-sm font-mono" />
        </div>
        <div className="flex items-center gap-6">
          <div>
            <label className="block text-xs tracking-wider uppercase text-gray-500 mb-1">Fecha</label>
            <input type="date" value={form.publishedAt} onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
              className="border border-gray-200 px-3 py-2 focus:outline-none focus:border-primary text-sm" />
          </div>
          <div className="flex items-center gap-2 mt-5">
            <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} className="w-4 h-4" />
            <label htmlFor="published" className="text-sm text-gray-700">Publicado</label>
          </div>
        </div>
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? "Guardando..." : "Guardar cambios"}</button>
          <button type="button" onClick={handleDelete} disabled={deleting} className="btn-primary bg-red-600 border-red-600 hover:bg-red-700 disabled:opacity-50">{deleting ? "Eliminando..." : "Eliminar"}</button>
          <Link href="/admin/press" className="btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
