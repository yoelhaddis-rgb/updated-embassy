"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-eritrea-red text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-eritrea-red/90 transition-colors"
    >
      <Printer size={15} /> Afdrukken / Opslaan
    </button>
  );
}
