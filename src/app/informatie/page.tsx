import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import {
  Plane,
  FileText,
  Stamp,
  CreditCard,
  Users,
  Shield,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle,
  Banknote,
} from "lucide-react";

export const metadata = {
  title: "Consulaire Diensten | Eritrese Ambassade Den Haag",
  description:
    "Overzicht van alle consulaire diensten van de Eritrese Ambassade: visa, paspoorten, legalisatie, belasting en meer.",
};

const services = [
  {
    id: "visa",
    icon: Plane,
    title: "Visumaanvraag",
    color: "text-eritrea-blue",
    bg: "bg-eritrea-blue/10",
    borderColor: "border-eritrea-blue/20",
    description:
      "Voor reizen naar Eritrea heeft u een visum nodig. De ambassade verwerkt verschillende soorten visa.",
    types: [
      "Toeristenvisum (30/60/90 dagen)",
      "Zakenvisum",
      "Transitvisum",
      "Familiebezoek visum",
      "Studievisum",
    ],
    docs: [
      "Geldig paspoort (min. 6 maanden geldig)",
      "Recente pasfoto (kleur, witte achtergrond)",
      "Ingevuld visumaanvraagformulier",
      "Bewijs van accommodatie in Eritrea",
      "Retourticket of reisschema",
      "Bewijs van financiële middelen",
    ],
    fee: "Vanaf €50",
    processing: "5–10 werkdagen",
  },
  {
    id: "paspoort",
    icon: FileText,
    title: "Paspoort & Identiteitskaart",
    color: "text-eritrea-green",
    bg: "bg-eritrea-green/10",
    borderColor: "border-eritrea-green/20",
    description:
      "Aanvraag, verlenging of vervanging van Eritrese reisdocumenten en identiteitsbewijzen.",
    types: [
      "Nieuw paspoort (eerste aanvraag)",
      "Paspoort verlenging",
      "Paspoort vervanging (verloren/gestolen)",
      "Eritrese identiteitskaart",
      "Reisdocument voor kinderen",
    ],
    docs: [
      "Huidig paspoort of kopie (indien beschikbaar)",
      "Eritrese geboorteakte",
      "4 recente pasfoto's",
      "Bewijs van Eritrese nationaliteit",
      "Aanvraagformulier (ingevuld)",
    ],
    fee: "Vanaf €80",
    processing: "2–4 weken",
  },
  {
    id: "legalisatie",
    icon: Stamp,
    title: "Legalisatie van Documenten",
    color: "text-eritrea-red",
    bg: "bg-eritrea-red/10",
    borderColor: "border-eritrea-red/20",
    description:
      "Officiële legalisatie van documenten voor juridisch gebruik in Eritrea.",
    types: [
      "Diploma's en certificaten",
      "Gerechtelijke documenten",
      "Medische documenten",
      "Zakelijke documenten",
      "Vertaalde documenten",
    ],
    docs: [
      "Origineel document",
      "Gewaarmerkte kopie",
      "Geldig identiteitsbewijs",
      "Nederlandse apostille (indien vereist)",
      "Beëdigde vertaling (indien niet in Engels/Tigrinya)",
    ],
    fee: "Vanaf €25 per document",
    processing: "3–5 werkdagen",
  },
  {
    id: "belasting",
    icon: CreditCard,
    title: "Belastingzaken",
    color: "text-eritrea-gold",
    bg: "bg-amber-50",
    borderColor: "border-amber-200",
    description:
      "Betaling van de 2% rehabilitatiebelasting en aanverwante financiële zaken.",
    types: [
      "2% rehabilitatiebelasting (jaarlijks)",
      "Belastingaangifte indienen",
      "Belastingverklaring opvragen",
      "Betalingsregeling aanvragen",
    ],
    docs: [
      "Geldig identiteitsbewijs",
      "Loonstroken of jaaropgave",
      "Vorige belastingverklaring",
      "Bankafschriften (indien gevraagd)",
    ],
    fee: "2% van netto inkomen",
    processing: "Direct bij afspraak",
  },
  {
    id: "burgerlijke-stand",
    icon: Users,
    title: "Burgerlijke Stand",
    color: "text-purple-600",
    bg: "bg-purple-50",
    borderColor: "border-purple-200",
    description:
      "Registratie van geboorte, huwelijk en overlijden, en uittreksels aanvragen.",
    types: [
      "Geboorteaangifte",
      "Huwelijksregistratie",
      "Overlijdensaangifte",
      "Naamswijziging",
      "Uittreksel burgerlijke stand",
      "Erkenning buitenlands huwelijk",
    ],
    docs: [
      "Geldig identiteitsbewijs",
      "Relevante Nederlandse aktes (met apostille)",
      "Beëdigde vertaling in Tigrinya of Engels",
      "Getuigenverklaringen (indien vereist)",
      "Pasfoto's (voor ID-gerelateerde aanvragen)",
    ],
    fee: "Vanaf €30",
    processing: "1–3 weken",
  },
  {
    id: "volmacht",
    icon: Shield,
    title: "Volmacht & Notariële Diensten",
    color: "text-teal-600",
    bg: "bg-teal-50",
    borderColor: "border-teal-200",
    description:
      "Volmachten, verklaringen onder ede en notariële bekrachtigingen.",
    types: [
      "Algemene volmacht",
      "Specifieke volmacht (onroerend goed)",
      "Verklaring onder ede",
      "Notariële bekrachtiging",
      "Machtiging voor derden",
    ],
    docs: [
      "Geldig identiteitsbewijs",
      "Concept volmachttekst",
      "Gegevens gemachtigde persoon",
      "Eigendomsbewijzen (bij vastgoed)",
    ],
    fee: "Vanaf €40",
    processing: "1–5 werkdagen",
  },
];

export default function InformatiePage() {
  return (
    <>
      <PageHeader titleKey="page.services.title" subtitleKey="page.services.subtitle" />
      <div className="eritrea-line" />

      {/* General info */}
      <section className="max-w-5xl mx-auto px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Clock size={20} className="text-eritrea-blue shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-navy text-sm">Verwerkingstijd</p>
              <p className="text-gray-500 text-xs mt-1">
                Varieert per dienst, zie details hieronder
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Banknote size={20} className="text-eritrea-green shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-navy text-sm">Betaling</p>
              <p className="text-gray-500 text-xs mt-1">
                Contant of overmaking naar NL84ABNA0888750005
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-eritrea-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-navy text-sm">Afspraak vereist</p>
              <p className="text-gray-500 text-xs mt-1">
                Zonder afspraak wordt u niet geholpen
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services detailed */}
      <section className="max-w-5xl mx-auto px-8 pb-24 space-y-8">
        {services.map((service) => (
          <div
            key={service.id}
            id={service.id}
            className={`rounded-2xl border ${service.borderColor} bg-white p-8 md:p-10`}
          >
            <div className="flex items-start gap-4 mb-6">
              <div
                className={`w-12 h-12 rounded-xl ${service.bg} ${service.color} flex items-center justify-center shrink-0`}
              >
                <service.icon size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy">{service.title}</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {service.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Types */}
              <div>
                <h3 className="text-sm font-semibold text-navy mb-3 uppercase tracking-wider">
                  Soorten aanvragen
                </h3>
                <ul className="space-y-2">
                  {service.types.map((type) => (
                    <li
                      key={type}
                      className="text-sm text-gray-600 flex items-center gap-2"
                    >
                      <CheckCircle
                        size={16}
                        className={`${service.color} shrink-0`}
                      />
                      {type}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Docs */}
              <div>
                <h3 className="text-sm font-semibold text-navy mb-3 uppercase tracking-wider">
                  Benodigde documenten
                </h3>
                <ul className="space-y-2">
                  {service.docs.map((doc) => (
                    <li
                      key={doc}
                      className="text-sm text-gray-600 flex items-start gap-2"
                    >
                      <FileText
                        size={16}
                        className="text-gray-400 shrink-0 mt-0.5"
                      />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer with fee and CTA */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                    Kosten
                  </span>
                  <p className="font-bold text-navy">{service.fee}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                    Verwerkingstijd
                  </span>
                  <p className="font-bold text-navy">{service.processing}</p>
                </div>
              </div>
              <Link
                href="/afspraken"
                className="btn-primary text-sm flex items-center gap-2"
              >
                Afspraak maken
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
