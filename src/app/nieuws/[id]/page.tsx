import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowLeft, Tag } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const categoryColors: Record<string, string> = {
  Aankondiging: "bg-eritrea-blue/10 text-eritrea-blue",
  Evenement:    "bg-eritrea-green/10 text-eritrea-green",
  Herdenking:   "bg-eritrea-red/10 text-eritrea-red",
  Diensten:     "bg-eritrea-gold/15 text-eritrea-gold-dark",
  Nieuws:       "bg-eritrea-blue/10 text-eritrea-blue",
};

export const dynamic = "force-dynamic";

export default async function NieuwsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const item = await db.newsItem.findUnique({ where: { id } });

  if (!item || !item.published) {
    notFound();
  }

  const colorClass = categoryColors[item.category] ?? "bg-parchment text-charcoal";

  return (
    <>
      <PageHeader titleKey="page.news.title" subtitleKey="page.news.subtitle" />
      <div className="eritrea-line" />

      <section className="max-w-3xl mx-auto px-8 py-12">
        {/* Back link */}
        <Link
          href="/nieuws"
          className="inline-flex items-center gap-2 text-eritrea-blue text-sm font-medium hover:underline mb-8"
        >
          <ArrowLeft size={16} />
          Terug naar nieuws
        </Link>

        <article className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {/* Image */}
          {item.imageUrl && (
            <div className="relative w-full h-72">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="p-8 md:p-10">
            {/* Category + date */}
            <div className="flex items-center gap-3 mb-5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                <Tag size={11} />
                {item.category}
              </span>
              <span className="text-xs text-warm-gray flex items-center gap-1.5">
                <Calendar size={12} />
                {new Date(item.publishedAt).toLocaleDateString("nl-NL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display font-bold text-navy text-2xl md:text-3xl mb-5 leading-tight">
              {item.title}
            </h1>

            {/* Summary */}
            <p className="text-charcoal text-base leading-relaxed mb-6 font-medium">
              {item.summary}
            </p>

            {/* Full content */}
            {item.content && (
              <div
                className="prose prose-sm max-w-none text-charcoal/80 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            )}
          </div>
        </article>

        {/* Back link bottom */}
        <div className="mt-8">
          <Link
            href="/nieuws"
            className="inline-flex items-center gap-2 text-eritrea-blue text-sm font-medium hover:underline"
          >
            <ArrowLeft size={16} />
            Terug naar nieuws
          </Link>
        </div>
      </section>
    </>
  );
}
