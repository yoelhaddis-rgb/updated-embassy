import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Globe, AtSign } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative">
      {/* Flag bar */}
      <div className="flag-bar-thick">
        <div /><div /><div />
      </div>

      <div className="bg-navy relative noise">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3.5 mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/embassy-logo.svg"
                  alt="Wapen van Eritrea"
                  width={44}
                  height={44}
                  className="shrink-0 brightness-0 invert opacity-80"
                />
                <div>
                  <div className="font-display font-bold text-white text-base">Eritrese Ambassade</div>
                  <div className="text-[10px] text-white/40 font-medium tracking-widest uppercase">Den Haag</div>
                </div>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                De officiële vertegenwoordiging van de Staat Eritrea in het Koninkrijk der Nederlanden.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h3 className="font-display font-semibold text-white mb-5 text-sm">
                Snelle Links
              </h3>
              <ul className="space-y-3.5 text-sm">
                {[
                  { href: "/informatie", label: "Consulaire Diensten" },
                  { href: "/afspraken", label: "Afspraak Maken" },
                  { href: "/faq", label: "Veelgestelde Vragen" },
                  { href: "/nieuws", label: "Nieuws" },
                  { href: "/ontdek-eritrea", label: "Ontdek Eritrea" },
                  { href: "/contact", label: "Contact" },
                  { href: "/privacy", label: "Privacyverklaring" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/50 hover:text-eritrea-gold transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-display font-semibold text-white mb-5 text-sm">
                Contact
              </h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-eritrea-gold" />
                  <span className="text-white/50">Javastraat 58<br />2585 AR Den Haag<br />Nederland</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={15} className="shrink-0 text-eritrea-gold" />
                  <span className="text-white/50">+31 70 427 6812</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={15} className="shrink-0 text-eritrea-gold" />
                  <span className="text-white/50">info@eritreanembassy.nl</span>
                </li>
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h3 className="font-display font-semibold text-white mb-5 text-sm">
                Openingstijden
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span className="text-white/50">Ma – Do</span>
                  <span className="text-white font-medium">09:00 – 15:00</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-white/50">Telefoon</span>
                  <span className="text-white font-medium">15:00 – 16:45</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-white/50">Vr – Zo</span>
                  <span className="text-eritrea-red-light font-medium">Gesloten</span>
                </li>
              </ul>
              <div className="flex gap-3 mt-7">
                <a
                  href="https://facebook.com/AmbassadeEritrea"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center text-white/50 hover:bg-eritrea-blue hover:text-white transition-all duration-200"
                >
                  <Globe size={17} />
                </a>
                <a
                  href="https://twitter.com/AmsassadeEri"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center text-white/50 hover:bg-eritrea-blue hover:text-white transition-all duration-200"
                >
                  <AtSign size={17} />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
            <p>© {new Date().getFullYear()} Ambassade van de Staat Eritrea, Den Haag</p>
            <p className="font-mono">IBAN: NL84 ABNA 0888 7500 05</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
