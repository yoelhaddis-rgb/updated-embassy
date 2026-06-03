"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { resetPasswordAction } from "@/app/actions/auth";

function WachtwoordResettenContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-8">
        <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-10 max-w-md w-full text-center">
          <XCircle size={40} className="mx-auto text-eritrea-red mb-4" />
          <h1 className="font-display text-xl font-medium text-charcoal mb-2">Ongeldige link</h1>
          <p className="text-warm-gray text-sm mb-6">
            Deze reset-link is ongeldig. Vraag een nieuwe aan via de inlogpagina.
          </p>
          <Link href="/wachtwoord-vergeten" className="btn-red inline-flex">
            Nieuwe link aanvragen
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-8">
        <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-10 max-w-md w-full text-center">
          <CheckCircle size={40} className="mx-auto text-eritrea-green mb-4" />
          <h1 className="font-display text-xl font-medium text-charcoal mb-2">Wachtwoord gewijzigd</h1>
          <p className="text-warm-gray text-sm mb-6">
            Uw wachtwoord is succesvol bijgewerkt. U kunt nu inloggen.
          </p>
          <Link href="/inloggen" className="btn-red inline-flex">
            Inloggen
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("token", token);
    const result = await resetPasswordAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setDone(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-8">
      <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-10 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-eritrea-blue/10 text-eritrea-blue flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-medium text-charcoal">Nieuw wachtwoord</h1>
          <p className="text-warm-gray text-sm mt-1">Kies een nieuw wachtwoord voor uw account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Nieuw wachtwoord</label>
            <div className="relative">
              <input
                name="password"
                type={showPw ? "text" : "password"}
                required
                minLength={6}
                className="form-input pr-10"
                placeholder="Minimaal 6 tekens"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray hover:text-charcoal"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="form-label">Herhaal wachtwoord</label>
            <input
              name="passwordConfirm"
              type={showPw ? "text" : "password"}
              required
              minLength={6}
              className="form-input"
              placeholder="Herhaal uw wachtwoord"
            />
          </div>

          {error && (
            <div className="bg-eritrea-red/5 border border-eritrea-red/20 rounded-xl px-4 py-3">
              <p className="text-eritrea-red text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-red w-full flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Opslaan...</> : "Wachtwoord opslaan"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function WachtwoordResettenPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-eritrea-blue" />
      </div>
    }>
      <WachtwoordResettenContent />
    </Suspense>
  );
}
