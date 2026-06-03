"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/app/actions/auth";
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Send } from "lucide-react";

export default function WachtwoordVergetenPage() {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await requestPasswordResetAction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setPending(false);
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo + Title */}
        <div className="text-center mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/embassy-logo.svg" alt="Eritrese Ambassade" width={72} height={72} className="mx-auto mb-5 rounded-full" />
          <h1 className="font-display text-3xl font-medium text-charcoal mb-1">Wachtwoord vergeten</h1>
          <p className="text-warm-gray text-sm">Eritrese Ambassade Den Haag — Portaal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-charcoal/5 ring-1 ring-stone/40 p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-eritrea-green/10 text-eritrea-green flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} />
              </div>
              <h2 className="font-display font-semibold text-charcoal text-lg mb-2">Controleer uw e-mail</h2>
              <p className="text-warm-gray text-sm leading-relaxed">
                Als dit e-mailadres bij ons bekend is, heeft u een e-mail ontvangen met een link om uw wachtwoord opnieuw in te stellen.
                De link is 1 uur geldig.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-start gap-3 bg-eritrea-red/8 text-eritrea-red rounded-xl p-4 mb-6 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <p className="text-warm-gray text-sm mb-6 leading-relaxed">
                Voer uw e-mailadres in. Als dit bij ons bekend is, ontvangt u een e-mail met een link om uw wachtwoord opnieuw in te stellen.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="form-label">E-mailadres</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray/50" />
                    <input
                      name="email"
                      type="email"
                      required
                      className="form-input pl-10"
                      placeholder="uw@email.nl"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className="btn-red w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={16} />
                  {pending ? "Versturen..." : "Reset-link versturen"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-warm-gray mt-6">
          <Link href="/inloggen" className="text-eritrea-blue font-medium hover:underline flex items-center justify-center gap-1.5">
            <ArrowLeft size={14} />
            Terug naar inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
