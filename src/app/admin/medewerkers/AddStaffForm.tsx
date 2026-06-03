"use client";

import { useState } from "react";
import { createStaffAction } from "@/app/actions/staff";
import { AlertCircle, CheckCircle, UserPlus, X } from "lucide-react";

export function AddStaffForm() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await createStaffAction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
      }, 1500);
    }
    setPending(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-eritrea-blue text-white rounded-xl text-sm font-semibold hover:bg-eritrea-blue/90 transition-colors"
      >
        <UserPlus size={16} />
        + Medewerker toevoegen
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl ring-1 ring-eritrea-blue/30 p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-semibold text-charcoal text-base flex items-center gap-2">
          <UserPlus size={18} className="text-eritrea-blue" />
          Nieuwe medewerker toevoegen
        </h2>
        <button
          onClick={() => { setOpen(false); setError(null); setSuccess(false); }}
          className="text-warm-gray hover:text-charcoal transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-eritrea-red/8 text-eritrea-red rounded-xl p-3 mb-4 text-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 bg-eritrea-green/8 text-eritrea-green rounded-xl p-3 mb-4 text-sm">
          <CheckCircle size={16} />
          <p>Medewerker succesvol toegevoegd!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Voornaam <span className="text-eritrea-red">*</span></label>
            <input name="firstName" required className="form-input text-sm" placeholder="Voornaam" />
          </div>
          <div>
            <label className="form-label">Achternaam <span className="text-eritrea-red">*</span></label>
            <input name="lastName" required className="form-input text-sm" placeholder="Achternaam" />
          </div>
        </div>
        <div>
          <label className="form-label">E-mailadres <span className="text-eritrea-red">*</span></label>
          <input name="email" type="email" required className="form-input text-sm" placeholder="medewerker@eritreanembassy.nl" />
        </div>
        <div>
          <label className="form-label">Wachtwoord <span className="text-eritrea-red">*</span></label>
          <input name="password" type="password" required minLength={6} className="form-input text-sm" placeholder="Minimaal 6 tekens" />
        </div>
        <div>
          <label className="form-label">Rol <span className="text-eritrea-red">*</span></label>
          <select name="role" className="form-input text-sm">
            <option value="STAFF">Medewerker</option>
            <option value="ADMIN">Beheerder</option>
          </select>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserPlus size={16} />
            {pending ? "Toevoegen..." : "Medewerker toevoegen"}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setError(null); }}
            className="px-4 py-2 bg-parchment text-charcoal rounded-xl text-sm font-medium hover:bg-stone/30 transition-colors"
          >
            Annuleren
          </button>
        </div>
      </form>
    </div>
  );
}
