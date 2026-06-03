"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-eritrea-red text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-eritrea-red/90 transition-colors"
    >
      🖨️ Afdrukken
    </button>
  );
}
