"use client";

import { useState } from "react";
import { sendContactMessageAction } from "@/app/actions/contact";
import { CheckCircle, AlertCircle, Send } from "lucide-react";

export function ContactForm() {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await sendContactMessageAction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setPending(false);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-eritrea-green/10 text-eritrea-green flex items-center justify-center">
          <CheckCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-navy">Bericht verstuurd!</h3>
        <p className="text-warm-gray text-sm max-w-xs">
          Bedankt voor uw bericht. Wij zullen zo spoedig mogelijk contact met u opnemen.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-3 bg-eritrea-red/8 text-eritrea-red rounded-xl p-4 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div>
        <label className="form-label">
          Naam <span className="text-eritrea-red">*</span>
        </label>
        <input
          name="name"
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
          name="email"
          type="email"
          className="form-input"
          placeholder="uw@email.nl"
          required
        />
      </div>
      <div>
        <label className="form-label">Onderwerp</label>
        <select name="subject" className="form-input">
          <option value="Algemeen">Selecteer een onderwerp</option>
          <option value="Afspraak">Afspraak</option>
          <option value="2% Belasting">2% Belasting</option>
          <option value="Paspoort">Paspoort</option>
          <option value="Visum">Visum</option>
          <option value="Overig">Overig</option>
        </select>
      </div>
      <div>
        <label className="form-label">
          Bericht <span className="text-eritrea-red">*</span>
        </label>
        <textarea
          name="message"
          className="form-input resize-none"
          rows={5}
          placeholder="Uw bericht..."
          required
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Send size={16} />
        {pending ? "Versturen..." : "Bericht Versturen"}
      </button>
    </form>
  );
}
