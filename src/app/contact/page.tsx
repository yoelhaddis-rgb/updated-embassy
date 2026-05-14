import PageHeader from "@/components/PageHeader";
import { MapPin, Phone, Mail, Clock, Globe, AtSign, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Contact | Eritrese Ambassade Den Haag",
  description:
    "Neem contact op met de Eritrese Ambassade in Den Haag. Bezoekadres, telefoonnummer, e-mail en openingstijden.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader titleKey="page.contact.title" subtitleKey="page.contact.subtitle" />
      <div className="eritrea-line" />

      <section className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-navy mb-6">
                Contactgegevens
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-eritrea-blue/10 text-eritrea-blue flex items-center justify-center shrink-0">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy mb-1">Bezoekadres</h3>
                    <p className="text-gray-600 text-sm">
                      Javastraat 58<br />
                      2585 AR Den Haag<br />
                      Nederland
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-eritrea-green/10 text-eritrea-green flex items-center justify-center shrink-0">
                    <Phone size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy mb-1">Telefoon</h3>
                    <p className="text-gray-600 text-sm">
                      +31 70 427 6812<br />
                      <span className="text-gray-400">
                        Bereikbaar ma–vr, 15:00–16:45
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-eritrea-red/10 text-eritrea-red flex items-center justify-center shrink-0">
                    <Mail size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy mb-1">E-mail</h3>
                    <p className="text-gray-600 text-sm">
                      info@eritreanembassy.nl<br />
                      info@emberitrea.nl
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-eritrea-gold/10 text-eritrea-gold flex items-center justify-center shrink-0">
                    <Clock size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy mb-1">Openingstijden</h3>
                    <div className="text-sm space-y-1.5 mt-2">
                      <div className="flex justify-between gap-8">
                        <span className="text-gray-600">Maandag – Donderdag</span>
                        <span className="font-semibold text-navy">09:00–15:00</span>
                      </div>
                      <div className="flex justify-between gap-8">
                        <span className="text-gray-600">Telefonisch</span>
                        <span className="font-semibold text-navy">15:00–16:45</span>
                      </div>
                      <div className="flex justify-between gap-8">
                        <span className="text-gray-600">Vrijdag – Zondag</span>
                        <span className="font-semibold text-eritrea-red">Gesloten</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      * Alleen op afspraak. Zonder afspraak wordt u niet geholpen.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social */}
            <div>
              <h3 className="font-bold text-navy mb-4">Volg ons</h3>
              <div className="flex gap-3">
                <a
                  href="https://facebook.com/AmbassadeEritrea"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Globe size={18} />
                  Facebook
                  <ExternalLink size={14} />
                </a>
                <a
                  href="https://twitter.com/AmsassadeEri"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <AtSign size={18} />
                  X / Twitter
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Bank */}
            <div className="bg-eritrea-gold/10 border border-eritrea-gold/20 rounded-2xl p-5">
              <h3 className="font-bold text-navy mb-2">Bankgegevens</h3>
              <p className="text-sm text-gray-600">
                IBAN: <span className="font-mono font-semibold text-navy">NL84 ABNA 0888 7500 05</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                T.n.v. Ambassade van de Staat Eritrea
              </p>
            </div>
          </div>

          {/* Map + Contact form */}
          <div className="space-y-8">
            {/* Map */}
            <div className="rounded-2xl overflow-hidden h-72 bg-gray-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2461.123456!2d4.308!3d52.09!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c5b72a7f97c0b7%3A0x0!2sJavastraat%2058%2C%20Den%20Haag!5e0!3m2!1snl!2snl!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Locatie Eritrese Ambassade"
              />
            </div>

            {/* Contact form */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-navy mb-6">
                Stuur een bericht
              </h2>
              <form className="space-y-5">
                <div>
                  <label className="form-label">
                    Naam <span className="text-eritrea-red">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Uw volledige naam"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">
                    E-mailadres <span className="text-eritrea-red">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="uw@email.nl"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Onderwerp</label>
                  <select className="form-input">
                    <option value="">Selecteer een onderwerp</option>
                    <option>Visumaanvraag</option>
                    <option>Paspoort & ID</option>
                    <option>Legalisatie</option>
                    <option>Belastingzaken</option>
                    <option>Burgerlijke stand</option>
                    <option>Volmacht</option>
                    <option>Overige vragen</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">
                    Bericht <span className="text-eritrea-red">*</span>
                  </label>
                  <textarea
                    className="form-input resize-none"
                    rows={5}
                    placeholder="Uw bericht..."
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Bericht Versturen
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
