"use client";

import { useState } from "react";
import { ChevronDown, Search, Plane, FileText, Stamp, CreditCard, Users, Shield } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const faqCategories = [
  {
    id: "general",
    label: "Algemeen",
    labelEn: "General",
    labelTi: "ሓፈሻዊ",
    icon: Search,
    color: "text-navy",
    bg: "bg-gray-100",
    questions: [
      {
        q: "Heb ik een afspraak nodig om de ambassade te bezoeken?",
        a: "Ja, u kunt alleen op afspraak terecht. Zonder afspraak wordt u niet geholpen. U kunt online een afspraak maken via onze afsprakenpagina.",
      },
      {
        q: "Wat zijn de openingstijden van de ambassade?",
        a: "De ambassade is geopend van maandag tot en met donderdag, van 09:00 tot 15:00 uur (alleen op afspraak). Telefonisch zijn wij bereikbaar van maandag tot en met vrijdag, van 15:00 tot 16:45 uur.",
      },
      {
        q: "Hoe kom ik bij de ambassade met het openbaar vervoer?",
        a: "De ambassade bevindt zich op Javastraat 58, 2585 AR Den Haag. U kunt reizen met tram 9 (halte Javaplein) of bus 24 (halte Javastraat). Vanaf Den Haag Centraal is het circa 15 minuten met het OV.",
      },
      {
        q: "Kan ik betalen met pinpas of creditcard?",
        a: "Betaling kan contant of per bankoverschrijving naar IBAN: NL84 ABNA 0888 7500 05 t.n.v. Ambassade van de Staat Eritrea. Pinbetalingen zijn momenteel niet beschikbaar.",
      },
    ],
  },
  {
    id: "visa",
    label: "Visumaanvraag",
    labelEn: "Visa",
    labelTi: "ቪዛ",
    icon: Plane,
    color: "text-eritrea-blue",
    bg: "bg-eritrea-blue/8",
    questions: [
      {
        q: "Welke soorten visa kan ik aanvragen?",
        a: "U kunt een toeristenvisum (30/60/90 dagen), zakenvisum, transitvisum, familiebezoekvisum of studievisum aanvragen.",
      },
      {
        q: "Hoe lang duurt de visumverwerking?",
        a: "De gemiddelde verwerkingstijd is 5 tot 10 werkdagen. In drukke periodes kan dit langer duren. Wij adviseren minimaal 3 weken voor uw geplande reis aan te vragen.",
      },
      {
        q: "Welke documenten heb ik nodig voor een visumaanvraag?",
        a: "U heeft nodig: een geldig paspoort (min. 6 maanden geldig), een recente pasfoto, een ingevuld aanvraagformulier, bewijs van accommodatie, een retourticket of reisschema, en bewijs van financiële middelen.",
      },
      {
        q: "Wat kost een visum?",
        a: "De kosten variëren per visumtype, maar starten vanaf €50. De exacte kosten worden bij het maken van uw afspraak gecommuniceerd.",
      },
    ],
  },
  {
    id: "passport",
    label: "Paspoort & ID",
    labelEn: "Passport",
    labelTi: "ፓስፖርት",
    icon: FileText,
    color: "text-eritrea-green",
    bg: "bg-eritrea-green/8",
    questions: [
      {
        q: "Hoe vraag ik een nieuw Eritrees paspoort aan?",
        a: "Maak een afspraak via onze website, vul het aanvraagformulier in, en neem mee: uw huidige paspoort of kopie, geboorteakte, 4 recente pasfoto's, en bewijs van Eritrese nationaliteit.",
      },
      {
        q: "Hoe lang duurt het voordat mijn paspoort klaar is?",
        a: "De verwerkingstijd voor een paspoort is gemiddeld 2 tot 4 weken. U wordt per e-mail of telefoon geïnformeerd wanneer uw paspoort opgehaald kan worden.",
      },
      {
        q: "Mijn paspoort is verloren/gestolen. Wat nu?",
        a: "Doe eerst aangifte bij de Nederlandse politie. Maak vervolgens een afspraak bij de ambassade voor een vervangend paspoort. Neem het proces-verbaal van de politie mee.",
      },
    ],
  },
  {
    id: "tax",
    label: "Belastingbetaling",
    labelEn: "Tax",
    labelTi: "ግብሪ",
    icon: CreditCard,
    color: "text-eritrea-gold-dark",
    bg: "bg-eritrea-gold/8",
    questions: [
      {
        q: "Wat is de 2% rehabilitatiebelasting?",
        a: "Alle Eritreeërs in de diaspora zijn verplicht 2% van hun netto-inkomen bij te dragen als rehabilitatiebelasting. Dit geldt voor elk belastingjaar dat u in het buitenland woont.",
      },
      {
        q: "Welke documenten heb ik nodig voor mijn belastingaangifte?",
        a: "U heeft nodig: een geldig identiteitsbewijs, loonstroken of jaaropgave, en indien beschikbaar uw vorige belastingverklaring.",
      },
      {
        q: "Kan ik de belasting online betalen?",
        a: "U kunt betalen per bankoverschrijving naar IBAN: NL84 ABNA 0888 7500 05. Vermeld uw naam en 'rehabilitatiebelasting' + het betreffende jaar.",
      },
    ],
  },
  {
    id: "legalization",
    label: "Legalisatie",
    labelEn: "Legalization",
    labelTi: "ምስክር ወረቐት",
    icon: Stamp,
    color: "text-eritrea-red",
    bg: "bg-eritrea-red/8",
    questions: [
      {
        q: "Welke documenten kunnen gelegaliseerd worden?",
        a: "Diploma's, certificaten, gerechtelijke documenten, medische documenten, zakelijke documenten en vertaalde documenten kunnen worden gelegaliseerd.",
      },
      {
        q: "Heb ik een apostille nodig?",
        a: "In sommige gevallen is een Nederlandse apostille vereist voordat de ambassade het document kan legaliseren. Neem contact op voor specifieke eisen bij uw document.",
      },
    ],
  },
  {
    id: "civil",
    label: "Burgerlijke Stand",
    labelEn: "Civil Registry",
    labelTi: "ሲቪል ምዝገባ",
    icon: Users,
    color: "text-eritrea-blue",
    bg: "bg-eritrea-blue/8",
    questions: [
      {
        q: "Hoe registreer ik een geboorte bij de ambassade?",
        a: "Maak een afspraak en neem mee: de Nederlandse geboorteakte met apostille, een beëdigde vertaling in het Tigrinya of Engels, en geldige identiteitsbewijzen van beide ouders.",
      },
      {
        q: "Kan ik mijn buitenlandse huwelijk laten erkennen?",
        a: "Ja, buitenlandse huwelijken kunnen worden geregistreerd. U heeft nodig: de buitenlandse huwelijksakte met apostille, beëdigde vertaling, en identiteitsbewijzen van beide partners.",
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
      >
        <span className="font-semibold text-navy text-[15px] leading-relaxed group-hover:text-eritrea-blue transition-colors">
          {question}
        </span>
        <ChevronDown
          size={20}
          className={`shrink-0 mt-0.5 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180 text-eritrea-blue" : ""
          }`}
        />
      </button>
      {open && (
        <div className="pb-5 -mt-1">
          <p className="text-warm-gray text-sm leading-relaxed pl-0">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("general");
  const activeData = faqCategories.find((c) => c.id === activeCategory)!;

  return (
    <>
      <PageHeader titleKey="page.faq.title" subtitleKey="page.faq.subtitle" />
      <div className="eritrea-line" />

      <section className="max-w-5xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
          {/* Category sidebar */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {faqCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? `${cat.bg} ${cat.color} shadow-sm`
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <cat.icon size={18} />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Questions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
              <div className={`w-10 h-10 rounded-xl ${activeData.bg} ${activeData.color} flex items-center justify-center`}>
                <activeData.icon size={20} />
              </div>
              <h2 className="font-display font-bold text-navy text-xl">{activeData.label}</h2>
            </div>
            <div>
              {activeData.questions.map((q) => (
                <FAQItem key={q.q} question={q.q} answer={q.a} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
