"use client";

import { useState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";
import { Mail, Lock, User, Phone, Calendar, AlertCircle, UserPlus } from "lucide-react";

export default function RegistrerenPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/embassy-logo.svg" alt="Eritrese Ambassade" width={72} height={72} className="mx-auto mb-5 rounded-full" />
          <h1 className="font-display text-3xl font-medium text-charcoal mb-1">Account aanmaken</h1>
          <p className="text-warm-gray text-sm">Eritrese Ambassade Den Haag — Burgerportaal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-charcoal/5 ring-1 ring-stone/40 p-8">
          {error && (
            <div className="flex items-start gap-3 bg-eritrea-red/8 text-eritrea-red rounded-xl p-4 mb-6 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Voornaam <span className="text-eritrea-red">*</span></label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray/50" />
                  <input name="firstName" required className="form-input pl-9 text-sm" placeholder="Abraham" />
                </div>
              </div>
              <div>
                <label className="form-label">Achternaam <span className="text-eritrea-red">*</span></label>
                <input name="lastName" required className="form-input text-sm" placeholder="Tesfamariam" />
              </div>
            </div>

            <div>
              <label className="form-label">E-mailadres <span className="text-eritrea-red">*</span></label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray/50" />
                <input name="email" type="email" required className="form-input pl-9 text-sm" placeholder="uw@email.nl" autoComplete="email" />
              </div>
            </div>

            <div>
              <label className="form-label">Telefoonnummer</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray/50" />
                <input name="phone" type="tel" className="form-input pl-9 text-sm" placeholder="+31 6 12345678" />
              </div>
            </div>

            <div>
              <label className="form-label">Geboortedatum</label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray/50" />
                <input name="dateOfBirth" type="date" className="form-input pl-9 text-sm" />
              </div>
            </div>

            <div>
              <label className="form-label">Wachtwoord <span className="text-eritrea-red">*</span></label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray/50" />
                <input name="password" type="password" required minLength={6} className="form-input pl-9 text-sm" placeholder="Minimaal 6 tekens" autoComplete="new-password" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-green w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-50">
              <UserPlus size={18} />
              {loading ? "Account aanmaken..." : "Account aanmaken"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-warm-gray mt-6">
          Al een account?{" "}
          <Link href="/inloggen" className="text-eritrea-blue font-medium hover:underline">
            Inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
