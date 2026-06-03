"use client";

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { registerTaxPaymentAction } from "@/app/actions/tax";

export function TaxPaymentForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const currentYear = new Date().getFullYear();
  const yearOptions = [
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2,
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("userId", userId);

    const result = await registerTaxPaymentAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 1200);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-medium text-eritrea-blue hover:text-eritrea-blue/80 transition-colors"
      >
        <Plus size={16} /> Betaling registreren
      </button>
    );
  }

  return (
    <div className="mt-4 bg-parchment/50 rounded-xl p-5 border border-stone/40">
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-charcoal text-sm">Betaling registreren</p>
        <button onClick={() => { setOpen(false); setError(""); }} className="text-warm-gray hover:text-charcoal">
          <X size={15} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Year checkboxes */}
        <div>
          <label className="form-label">Belastingjaar (meerdere mogelijk)</label>
          <div className="grid grid-cols-4 gap-2 mt-1">
            {yearOptions.map((year) => (
              <label
                key={year}
                className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 ring-1 ring-stone/40 cursor-pointer hover:ring-eritrea-blue/50 text-sm font-medium text-charcoal"
              >
                <input
                  type="checkbox"
                  name="years"
                  value={year}
                  className="accent-eritrea-blue"
                />
                {year}
              </label>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="form-label">Totaal bedrag (€)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray text-sm">€</span>
            <input
              name="totalAmount"
              type="number"
              min="0"
              step="0.01"
              required
              className="form-input !pl-7"
              placeholder="0.00"
            />
          </div>
          <p className="text-xs text-warm-gray mt-1">Bij meerdere jaren wordt het bedrag gelijkmatig verdeeld</p>
        </div>

        {/* Date */}
        <div>
          <label className="form-label">Datum ontvangen</label>
          <input
            name="paidAt"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            className="form-input"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="form-label">Notities (optioneel)</label>
          <input
            name="notes"
            className="form-input"
            placeholder="bijv. kwitantienummer, opmerking"
          />
        </div>

        {error && (
          <p className="text-xs text-eritrea-red bg-eritrea-red/5 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || success}
          className="w-full btn-red flex items-center justify-center gap-2"
        >
          {success ? (
            "✓ Opgeslagen"
          ) : loading ? (
            <><Loader2 size={15} className="animate-spin" /> Opslaan...</>
          ) : (
            "Betaling registreren"
          )}
        </button>
      </form>
    </div>
  );
}
