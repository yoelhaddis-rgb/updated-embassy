"use client";

import { useState } from "react";
import { Bell, CheckCircle, AlertCircle } from "lucide-react";
import { subscribeNewsletterAction } from "@/app/actions/contact";

export function NewsletterForm() {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await subscribeNewsletterAction(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setPending(false);
  }

  return (
    <div className="glass rounded-2xl p-7 flex flex-col md:flex-row items-start md:items-center gap-5">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-xl bg-eritrea-blue/10 text-eritrea-blue flex items-center justify-center shrink-0">
          <Bell size={20} />
        </div>
        <div>
          <p className="font-semibold text-navy text-sm">Ontvang updates</p>
          <p className="text-warm-gray text-xs">Meld u aan voor de nieuwsbrief van de ambassade.</p>
        </div>
      </div>

      {success ? (
        <div className="flex items-center gap-2 text-eritrea-green text-sm font-semibold">
          <CheckCircle size={18} />
          U bent aangemeld!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full md:w-auto">
          {error && (
            <div className="flex items-center gap-2 text-eritrea-red text-xs">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <input
              name="email"
              type="email"
              placeholder="uw@email.nl"
              required
              className="form-input !py-2.5 flex-1 md:w-64"
            />
            <button
              type="submit"
              disabled={pending}
              className="btn-primary !py-2.5 text-sm whitespace-nowrap disabled:opacity-50"
            >
              {pending ? "Aanmelden..." : "Aanmelden"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
