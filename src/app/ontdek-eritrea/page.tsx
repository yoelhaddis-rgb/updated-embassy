import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import {
  Globe,
  Mountain,
  Sun,
  Users,
  Heart,
  TreePine,
  Fish,
  Landmark,
  Coffee,
  Map,
} from "lucide-react";
import { images } from "@/lib/images";

export const metadata = {
  title: "Ontdek Eritrea | Eritrese Ambassade Den Haag",
  description:
    "Ontdek Eritrea: een land van traditionele gastvrijheid, drie seizoenen in twee uur, en een rijke culturele geschiedenis.",
};

const facts = [
  { icon: Map, label: "Oppervlakte", value: "125.000 km²" },
  { icon: Users, label: "Bevolking", value: "6+ miljoen" },
  { icon: Landmark, label: "Hoofdstad", value: "Asmara" },
  { icon: Globe, label: "Onafhankelijkheid", value: "24 mei 1993" },
];

const regions = [
  {
    icon: Mountain,
    title: "Hooglanden",
    temp: "16–25°C",
    description:
      "De groene hooglanden rondom Asmara op 2.300 meter hoogte. Aangenaam klimaat het hele jaar door met vruchtbare landbouwgronden en de iconische Art Deco architectuur.",
    color: "text-eritrea-green",
    bg: "bg-eritrea-green/10",
    image: images.highlands,
  },
  {
    icon: Sun,
    title: "Rode Zee Kust",
    temp: "28–40°C",
    description:
      "Meer dan 1.000 km kustlijn met ongerepte koraalriffen, de Dahlak-archipel met 350+ eilanden, en historische havensteden als Massawa.",
    color: "text-eritrea-blue",
    bg: "bg-eritrea-blue/10",
    image: images.coast,
  },
  {
    icon: TreePine,
    title: "Westelijke Laaglanden",
    temp: "25–38°C",
    description:
      "Uitgestrekte savannes en riviergebieden met een rijke biodiversiteit. Thuisbasis van nomadische gemeenschappen en oases in de Sahel-zone.",
    color: "text-eritrea-gold",
    bg: "bg-amber-50",
    image: images.nature,
  },
];

const wildlife = [
  "Struisvogels",
  "Luipaarden",
  "Olifanten",
  "Antilopen",
  "Gazellen",
  "Apen",
  "Hyena's",
  "Wilde ezels",
];

const flora = [
  "Acacia's",
  "Baobabs",
  "Dennen",
  "Eucalyptus",
  "Olijfbomen",
  "Doumpalmen",
  "Sisal",
];

const cultures = [
  {
    icon: Coffee,
    title: "Koffieceremonie",
    description:
      "De traditionele koffieceremonie is een heilig ritueel van gastvrijheid. Groene bonen worden geroosterd, gemalen en driemaal geserveerd — 'Awel', 'Kalaay' en 'Bereka'.",
  },
  {
    icon: Heart,
    title: "Gastvrijheid",
    description:
      "Bezoekers worden begroet met een beleefde handdruk of wangkus. Thee en koffie worden altijd aangeboden. Uitgenodigd worden voor een koffieceremonie is een bijzondere eer.",
  },
  {
    icon: Users,
    title: "Negen Etnische Groepen",
    description:
      "Eritrea kent negen erkende etnische groepen: Tigrinya, Tigre, Saho, Afar, Bilen, Kunama, Nara, Hedareb en Rashaida — elk met eigen taal en tradities.",
  },
  {
    icon: Landmark,
    title: "Asmara: UNESCO Werelderfgoed",
    description:
      "De hoofdstad staat sinds 2017 op de UNESCO-lijst als 'Modernist City of Africa'. De Art Deco, Futuristische en Rationalistische architectuur is uniek in de wereld.",
  },
];

export default function OntdekEritreaPage() {
  return (
    <>
      <PageHeader titleKey="page.discover.title" subtitleKey="page.discover.subtitle1" />
      <div className="eritrea-line" />

      {/* Quick facts */}
      <section className="max-w-5xl mx-auto px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {facts.map((fact) => (
            <div key={fact.label} className="text-center">
              <fact.icon
                size={28}
                className="text-eritrea-blue mx-auto mb-2"
              />
              <div className="text-2xl font-extrabold text-navy">
                {fact.value}
              </div>
              <div className="text-xs text-gray-500 mt-1">{fact.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Geography intro */}
      <section className="max-w-5xl mx-auto px-8 mb-20">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-extrabold text-navy mb-4">
            Hoorn van Afrika
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Eritrea ligt aan de westkust van de Rode Zee, tussen 12° en 18°
            noorderbreedte. Het land grenst aan Soedan, Djibouti en Ethiopië en
            heeft meer dan 1.000 km kustlijn.
          </p>
        </div>
      </section>

      {/* Three regions */}
      <section className="max-w-5xl mx-auto px-8 mb-24">
        <h2 className="text-2xl font-bold text-navy mb-8 text-center">
          Drie Klimaatzones
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {regions.map((region) => (
            <div
              key={region.title}
              className="rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <Image
                  src={region.image}
                  alt={region.title}
                  fill
                  className="object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent`} />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center`}
                  >
                    <region.icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg leading-tight">
                      {region.title}
                    </h3>
                    <p className="text-sm font-semibold text-white/80">
                      {region.temp}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-500 text-sm leading-relaxed">
                  {region.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Wildlife & Flora */}
      <section className="bg-slate-warm py-20">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-eritrea-red/10 text-eritrea-red flex items-center justify-center">
                  <Fish size={22} />
                </div>
                <h2 className="text-2xl font-bold text-navy">Wilde Dieren</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {wildlife.map((animal) => (
                  <span
                    key={animal}
                    className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-700 font-medium"
                  >
                    {animal}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-eritrea-green/10 text-eritrea-green flex items-center justify-center">
                  <TreePine size={22} />
                </div>
                <h2 className="text-2xl font-bold text-navy">Flora</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {flora.map((plant) => (
                  <span
                    key={plant}
                    className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-700 font-medium"
                  >
                    {plant}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="max-w-5xl mx-auto px-8 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-navy mb-4">
            Cultuur & Tradities
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Eritrea's rijke cultuur is gevormd door duizenden jaren geschiedenis
            en de samenkomst van Afrikaanse en Midden-Oosterse invloeden.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cultures.map((culture) => (
            <div
              key={culture.title}
              className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50"
            >
              <div className="w-12 h-12 rounded-xl bg-eritrea-gold/10 text-eritrea-gold flex items-center justify-center shrink-0">
                <culture.icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-navy mb-2">{culture.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {culture.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Religion */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={images.community}
            alt="Eritrese gemeenschap"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-eritrea-green/90 to-eritrea-blue/90" />
        </div>
        <div className="relative max-w-4xl mx-auto px-8 text-center text-white">
          <h2 className="text-3xl font-extrabold mb-6">
            Religieuze Harmonie
          </h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto">
            Eritrea kent een unieke religieuze harmonie. Het land is ongeveer
            gelijk verdeeld tussen christenen (Eritrees-orthodox, katholiek en
            protestant) en moslims, die al eeuwenlang vreedzaam samenleven.
            Religieuze feestdagen van beide tradities worden gevierd als
            nationale feestdagen.
          </p>
        </div>
      </section>
    </>
  );
}
