import PageHeader from "@/components/PageHeader";

export default function PrivacyPage() {
  return (
    <>
      <PageHeader titleKey="page.privacy.title" subtitleKey="page.privacy.subtitle" />
      <div className="eritrea-line" />

      <section className="max-w-3xl mx-auto px-8 py-16">
        <div className="prose prose-gray max-w-none space-y-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10 space-y-8">
            <div>
              <h2 className="font-display text-xl font-bold text-navy mb-3">1. Verantwoordelijke</h2>
              <p className="text-warm-gray text-sm leading-relaxed">
                De Eritrese Ambassade in Den Haag (Javastraat 58, 2585 AR Den Haag) is verantwoordelijk voor de verwerking van persoonsgegevens zoals beschreven in deze privacyverklaring.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-navy mb-3">2. Welke gegevens verzamelen wij?</h2>
              <p className="text-warm-gray text-sm leading-relaxed mb-3">Wij verwerken de volgende persoonsgegevens:</p>
              <ul className="text-warm-gray text-sm leading-relaxed space-y-1.5 list-disc list-inside">
                <li>Voor- en achternaam</li>
                <li>Geboortedatum en -plaats</li>
                <li>Adresgegevens</li>
                <li>Telefoonnummer en e-mailadres</li>
                <li>Nationaliteit en paspoortgegevens</li>
                <li>Geüploade documenten (bij afspraak)</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-navy mb-3">3. Doeleinden</h2>
              <p className="text-warm-gray text-sm leading-relaxed">
                Wij verwerken uw gegevens uitsluitend voor consulaire dienstverlening: het verwerken van visumaanvragen, paspoortaanvragen, legalisatie van documenten, belastingzaken, burgerlijke stand registraties en het inplannen van afspraken.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-navy mb-3">4. Bewaartermijn</h2>
              <p className="text-warm-gray text-sm leading-relaxed">
                Persoonsgegevens worden niet langer bewaard dan noodzakelijk voor het doel waarvoor zij zijn verzameld. Consulaire dossiers worden bewaard conform de Eritrese archiefwetgeving.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-navy mb-3">5. Delen met derden</h2>
              <p className="text-warm-gray text-sm leading-relaxed">
                Uw gegevens worden niet verkocht of gedeeld met commerciële derden. Gegevens kunnen worden gedeeld met Eritrese overheidsinstanties uitsluitend in het kader van consulaire dienstverlening.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-navy mb-3">6. Cookies</h2>
              <p className="text-warm-gray text-sm leading-relaxed">
                Deze website gebruikt functionele cookies voor het onthouden van uw taalvoorkeur en sessie-informatie. Er worden geen tracking- of advertentiecookies geplaatst zonder uw toestemming.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-navy mb-3">7. Uw rechten</h2>
              <p className="text-warm-gray text-sm leading-relaxed mb-3">U heeft het recht om:</p>
              <ul className="text-warm-gray text-sm leading-relaxed space-y-1.5 list-disc list-inside">
                <li>Inzage te vragen in uw persoonsgegevens</li>
                <li>Rectificatie of verwijdering te verzoeken</li>
                <li>Bezwaar te maken tegen verwerking</li>
                <li>Gegevensoverdraagbaarheid te verzoeken</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-navy mb-3">8. Contact</h2>
              <p className="text-warm-gray text-sm leading-relaxed">
                Voor vragen over deze privacyverklaring of het uitoefenen van uw rechten kunt u contact opnemen via:<br />
                <strong>E-mail:</strong> info@eritreanembassy.nl<br />
                <strong>Telefoon:</strong> +31 70 427 6812<br />
                <strong>Adres:</strong> Javastraat 58, 2585 AR Den Haag
              </p>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Laatst bijgewerkt: 1 april 2026
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
