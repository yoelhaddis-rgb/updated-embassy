import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { NewsItemForm } from "./NewsItemForm";

export default async function AdminNieuwsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/admin");

  const { edit, new: isNew } = await searchParams;

  const newsItems = await db.newsItem.findMany({
    orderBy: { publishedAt: "desc" },
  });

  const editItem = edit ? newsItems.find((n) => n.id === edit) : null;

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy px-8 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-white/50 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-medium text-white">Nieuws & Aankondigingen</h1>
              <p className="text-white/40 text-sm">{newsItems.length} berichten</p>
            </div>
          </div>
          <Link
            href="/admin/nieuws?new=1"
            className="flex items-center gap-2 bg-eritrea-red text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-eritrea-red/90 transition-colors"
          >
            <Plus size={16} /> Nieuw bericht
          </Link>
        </div>
      </div>
      <div className="eritrea-line" />

      <div className="max-w-5xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form panel */}
        {(isNew || editItem) && (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-6">
              <h2 className="font-display font-medium text-charcoal text-lg mb-5">
                {editItem ? "Bericht bewerken" : "Nieuw bericht"}
              </h2>
              <NewsItemForm item={editItem ?? null} />
            </div>
          </div>
        )}

        {/* List */}
        <div className={isNew || editItem ? "lg:col-span-3" : "lg:col-span-5"}>
          {newsItems.length === 0 ? (
            <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-12 text-center text-warm-gray">
              <p>Nog geen berichten. Klik &ldquo;Nieuw bericht&rdquo; om te beginnen.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {newsItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl ring-1 p-5 flex items-start gap-4 ${
                    !item.published ? "opacity-60 ring-stone/30" : "ring-stone/40"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-eritrea-blue/10 text-eritrea-blue">
                        {item.category}
                      </span>
                      {!item.published && (
                        <span className="text-xs text-warm-gray/60 flex items-center gap-1">
                          <EyeOff size={11} /> Verborgen
                        </span>
                      )}
                    </div>
                    <p className="font-display font-semibold text-charcoal text-sm truncate">{item.title}</p>
                    <p className="text-xs text-warm-gray mt-0.5 line-clamp-2">{item.summary}</p>
                    <p className="text-xs text-warm-gray/50 mt-1">
                      {new Date(item.publishedAt).toLocaleDateString("nl-NL", { dateStyle: "medium" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/admin/nieuws?edit=${item.id}`}
                      className="p-2 rounded-lg hover:bg-parchment text-warm-gray hover:text-charcoal transition-colors"
                      title="Bewerken"
                    >
                      <Pencil size={15} />
                    </Link>
                    <DeleteNewsButton id={item.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline delete button (server action trigger)
function DeleteNewsButton({ id }: { id: string }) {
  async function deleteAction() {
    "use server";
    const { db } = await import("@/lib/db");
    const { revalidatePath } = await import("next/cache");
    await db.newsItem.delete({ where: { id } });
    revalidatePath("/admin/nieuws");
    revalidatePath("/nieuws");
  }

  return (
    <form action={deleteAction}>
      <button
        type="submit"
        className="p-2 rounded-lg hover:bg-eritrea-red/10 text-warm-gray hover:text-eritrea-red transition-colors"
        title="Verwijderen"
        onClick={(e) => {
          if (!confirm("Bericht verwijderen?")) e.preventDefault();
        }}
      >
        <Trash2 size={15} />
      </button>
    </form>
  );
}
