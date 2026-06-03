"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { saveNewsItemAction } from "./actions";

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  category: string;
  imageUrl: string | null;
  published: boolean;
  publishedAt: Date;
};

const CATEGORIES = ["Aankondiging", "Evenement", "Herdenking", "Diensten", "Nieuws"];

export function NewsItemForm({ item }: { item: NewsItem | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const result = await saveNewsItemAction(form);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/admin/nieuws");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {item && <input type="hidden" name="id" value={item.id} />}

      <div>
        <label className="form-label">Titel *</label>
        <input
          name="title"
          required
          defaultValue={item?.title ?? ""}
          className="form-input"
          placeholder="Ondertitel of kop"
        />
      </div>

      <div>
        <label className="form-label">Samenvatting *</label>
        <textarea
          name="summary"
          required
          defaultValue={item?.summary ?? ""}
          rows={3}
          className="form-input resize-none"
          placeholder="Korte samenvatting voor de nieuwsoverzichtspagina"
        />
      </div>

      <div>
        <label className="form-label">Inhoud (optioneel)</label>
        <textarea
          name="content"
          defaultValue={item?.content ?? ""}
          rows={5}
          className="form-input resize-none"
          placeholder="Volledige tekst (HTML of platte tekst)"
        />
      </div>

      <div>
        <label className="form-label">Categorie</label>
        <select name="category" defaultValue={item?.category ?? "Aankondiging"} className="form-input">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label">Afbeelding URL (optioneel)</label>
        <input
          name="imageUrl"
          type="url"
          defaultValue={item?.imageUrl ?? ""}
          className="form-input"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="form-label">Publicatiedatum</label>
        <input
          name="publishedAt"
          type="date"
          defaultValue={
            item?.publishedAt
              ? new Date(item.publishedAt).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0]
          }
          className="form-input"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="published"
          id="published"
          defaultChecked={item?.published ?? true}
          className="w-4 h-4 rounded accent-eritrea-blue"
        />
        <label htmlFor="published" className="text-sm text-charcoal cursor-pointer">
          Gepubliceerd (zichtbaar op website)
        </label>
      </div>

      {error && (
        <p className="text-xs text-eritrea-red bg-eritrea-red/5 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="btn-red flex-1 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={15} className="animate-spin" /> Opslaan...</> : "Opslaan"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/nieuws")}
          className="btn-primary flex-1 bg-parchment text-charcoal hover:bg-stone/30"
        >
          Annuleren
        </button>
      </div>
    </form>
  );
}
