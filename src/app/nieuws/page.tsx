import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight, Bell } from "lucide-react";
import { images } from "@/lib/images";
import PageHeader from "@/components/PageHeader";

const newsItems = [
  {
    id: 1,
    date: "2026-03-28",
    title: "Onafhankelijkheidsdag 2026 — Programma & Uitnodiging",
    summary:
      "De Eritrese gemeenschap in Nederland viert op 24 mei 2026 de 33e Onafhankelijkheidsdag. Het programma omvat een cultureel festival, toespraken en een gemeenschapsdiner.",
    category: "Evenement",
    categoryColor: "bg-eritrea-green/10 text-eritrea-green",
    image: images.community,
  },
  {
    id: 2,
    date: "2026-03-15",
    title: "Nieuwe openingstijden per 1 april 2026",
    summary:
      "Vanaf 1 april 2026 hanteren wij aangepaste openingstijden. De ambassade is voortaan geopend van maandag t/m donderdag, 09:00 – 15:00 uur. Telefonisch zijn wij bereikbaar tot 16:45 uur.",
    category: "Aankondiging",
    categoryColor: "bg-eritrea-blue/10 text-eritrea-blue",
    image: images.asmaraStreet,
  },
  {
    id: 3,
    date: "2026-02-20",
    title: "Operatie Fenkil Herdenking — 12 februari",
    summary:
      "Op 12 februari herdachten wij Operatie Fenkil, de bevrijding van Massawa in 1990. De ceremonie vond plaats in aanwezigheid van de ambassadeur en gemeenschapsleden.",
    category: "Herdenking",
    categoryColor: "bg-eritrea-red/10 text-eritrea-red",
    image: images.heritage,
  },
  {
    id: 4,
    date: "2026-01-10",
    title: "Consulaire diensten: Digitaal aanvragen nu mogelijk",
    summary:
      "U kunt voortaan documenten digitaal uploaden bij het maken van een afspraak. Dit bespaart tijd en zorgt voor een snellere verwerking van uw aanvraag.",
    category: "Diensten",
    categoryColor: "bg-eritrea-gold/15 text-eritrea-gold-dark",
    image: images.redSea,
  },
];

export const metadata = {
  title: "Nieuws & Aankondigingen | Eritrese Ambassade Den Haag",
  description: "Laatste nieuws, evenementen en aankondigingen van de Eritrese Ambassade in Den Haag.",
};

export default function NieuwsPage() {
  return (
    <>
      <PageHeader titleKey="page.news.title" subtitleKey="page.news.subtitle" />
      <div className="eritrea-line" />

      {/* Newsletter signup */}
      <section className="max-w-5xl mx-auto px-8 -mt-8 relative z-10 mb-16">
        <div className="glass rounded-2xl p-7 flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-eritrea-blue/10 text-eritrea-blue flex items-center justify-center shrink-0">
              <Bell size={20} />
            </div>
            <div>
              <p className="font-semibold text-navy text-sm">Ontvang updates</p>
              <p className="text-warm-gray text-xs">Meld u aan voor de nieuwsbrief van de ambassade.</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <input
              type="email"
              placeholder="uw@email.nl"
              className="form-input !py-2.5 flex-1 md:w-64"
            />
            <button className="btn-primary !py-2.5 text-sm whitespace-nowrap">
              Aanmelden
            </button>
          </div>
        </div>
      </section>

      {/* News grid */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <div className="space-y-6">
          {newsItems.map((item) => (
            <article
              key={item.id}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row"
            >
              <div className="relative w-full md:w-72 h-48 md:h-auto shrink-0">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-7 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.categoryColor}`}>
                    {item.category}
                  </span>
                  <span className="text-xs text-warm-gray flex items-center gap-1.5">
                    <Calendar size={12} />
                    {new Date(item.date).toLocaleDateString("nl-NL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h2 className="font-display font-bold text-navy text-lg mb-3 group-hover:text-eritrea-blue transition-colors">
                  {item.title}
                </h2>
                <p className="text-warm-gray text-sm leading-relaxed flex-1">
                  {item.summary}
                </p>
                <div className="mt-4">
                  <span className="text-eritrea-blue text-sm font-semibold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                    Lees meer <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
