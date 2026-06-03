import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Megaphone, Settings } from "lucide-react";
import { getBannerSettings } from "@/app/actions/settings";
import { BannerForm } from "./BannerForm";

export const dynamic = "force-dynamic";

export default async function AdminInstellingenPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/admin");

  const banner = await getBannerSettings();

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy px-8 py-6">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <Settings size={20} className="text-eritrea-gold" />
            <div>
              <h1 className="font-display text-2xl font-medium text-white">Site-instellingen</h1>
              <p className="text-white/40 text-sm">Banner, meldingen en zichtbaarheid</p>
            </div>
          </div>
        </div>
      </div>
      <div className="eritrea-line" />

      <div className="max-w-3xl mx-auto px-8 py-8 space-y-8">

        {/* Banner section */}
        <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-eritrea-gold/15 text-eritrea-gold-dark flex items-center justify-center shrink-0">
              <Megaphone size={18} />
            </div>
            <div>
              <h2 className="font-display font-medium text-charcoal text-lg">Noodbanner</h2>
              <p className="text-sm text-warm-gray">
                Zichtbaar bovenaan elke pagina — gebruik voor sluitingen, storingen of dringende berichten
              </p>
            </div>
          </div>

          <BannerForm
            initialActive={banner.active}
            initialText={banner.text}
            initialType={banner.type}
          />
        </div>

        {/* Future settings placeholder */}
        <div className="bg-white/50 rounded-2xl ring-1 ring-stone/20 p-6 opacity-50">
          <h2 className="font-display font-medium text-charcoal text-lg mb-1">
            Meer instellingen
          </h2>
          <p className="text-sm text-warm-gray">
            Toekomstige opties: openingstijden beheren, maximaal aantal afspraken per dag instellen, e-mailsjablonen aanpassen.
          </p>
        </div>
      </div>
    </div>
  );
}
