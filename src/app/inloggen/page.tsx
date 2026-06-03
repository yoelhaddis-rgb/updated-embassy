"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";

export default function InloggenPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo + Title */}
        <div className="text-center mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/embassy-logo.svg" alt="Eritrese Ambassade" width={72} height={72} className="mx-auto mb-5 rounded-full" />
          <h1 className="font-display text-3xl font-medium text-charcoal mb-1">Inloggen</h1>
          <p className="text-warm-gray text-sm">Eritrese Ambassade Den Haag — Portaal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-charcoal/5 ring-1 ring-stone/40 p-8">
          {error && (
            <div className="flex items-start gap-3 bg-eritrea-red/8 text-eritrea-red rounded-xl p-4 mb-6 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">E-mailadres</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray/50" />
                <input name="email" type="email" required className="form-input pl-10" placeholder="uw@email.nl" autoComplete="email" />
              </div>
            </div>

            <div>
              <label className="form-label">Wachtwoord</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-gray/50" />
                <input name="password" type="password" required className="form-input pl-10" placeholder="••••••••" autoComplete="current-password" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-red w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-50">
              <LogIn size={18} />
              {loading ? "Bezig met inloggen..." : "Inloggen"}
            </button>

            <div className="text-center mt-4">
              <Link href="/wachtwoord-vergeten" className="text-sm text-eritrea-blue hover:underline">
                Wachtwoord vergeten?
              </Link>
            </div>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-stone/50">
            <p className="text-xs text-warm-gray/60 font-semibold uppercase tracking-wider mb-3">Demo accounts</p>
            <div className="space-y-2 text-xs text-warm-gray">
              <div className="bg-parchment/50 rounded-lg p-2.5 font-mono">
                <span className="text-eritrea-blue font-semibold">Burger:</span> abraham@demo.nl / burger123
              </div>
              <div className="bg-parchment/50 rounded-lg p-2.5 font-mono">
                <span className="text-eritrea-green font-semibold">Medewerker:</span> medewerker@eritreanembassy.nl / medewerker123
              </div>
              <div className="bg-parchment/50 rounded-lg p-2.5 font-mono">
                <span className="text-eritrea-red font-semibold">Admin:</span> admin@eritreanembassy.nl / admin123
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-warm-gray mt-6">
          Nog geen account?{" "}
          <Link href="/registreren" className="text-eritrea-blue font-medium hover:underline">
            Registreer hier
          </Link>
        </p>
      </div>
    </div>
  );
}
