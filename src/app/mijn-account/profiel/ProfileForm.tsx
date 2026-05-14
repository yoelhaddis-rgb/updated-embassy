"use client";

import { useState } from "react";
import { updateProfileAction } from "@/app/actions/profile";
import { Check, Loader2 } from "lucide-react";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  eritreanIdNumber: string | null;
  nationality: string | null;
  address: string | null;
}

export default function ProfileForm({ user }: { user: UserData }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await updateProfileAction(formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-8 space-y-5">
        <h2 className="font-display font-medium text-charcoal text-lg border-b border-stone/30 pb-4">Persoonsgegevens</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Voornaam <span className="text-eritrea-red">*</span></label>
            <input name="firstName" type="text" className="form-input" defaultValue={user.firstName} required />
          </div>
          <div>
            <label className="form-label">Achternaam <span className="text-eritrea-red">*</span></label>
            <input name="lastName" type="text" className="form-input" defaultValue={user.lastName} required />
          </div>
          <div>
            <label className="form-label">E-mailadres</label>
            <input type="email" className="form-input bg-parchment/40 cursor-not-allowed" value={user.email} disabled />
            <p className="text-xs text-warm-gray/50 mt-1">E-mailadres kan niet worden gewijzigd.</p>
          </div>
          <div>
            <label className="form-label">Telefoonnummer</label>
            <input name="phone" type="tel" className="form-input" defaultValue={user.phone ?? ""} placeholder="+31 6 12345678" />
          </div>
          <div>
            <label className="form-label">Geboortedatum</label>
            <input name="dateOfBirth" type="date" className="form-input" defaultValue={user.dateOfBirth ?? ""} />
          </div>
          <div>
            <label className="form-label">Eritrees ID-nummer</label>
            <input name="eritreanIdNumber" type="text" className="form-input" defaultValue={user.eritreanIdNumber ?? ""} placeholder="Bijv. ERI-12345" />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Adres</label>
            <input name="address" type="text" className="form-input" defaultValue={user.address ?? ""} placeholder="Straat, huisnummer, postcode, stad" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-eritrea-red/8 border border-eritrea-red/20 rounded-xl p-4 text-sm text-eritrea-red">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-warm-gray/50">Wijzigingen worden direct opgeslagen.</p>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Opslaan...</>
          ) : saved ? (
            <><Check size={16} /> Opgeslagen!</>
          ) : (
            "Wijzigingen opslaan"
          )}
        </button>
      </div>
    </form>
  );
}
