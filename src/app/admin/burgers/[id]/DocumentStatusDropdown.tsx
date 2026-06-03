"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { updateDocumentStatusAction } from "./actions";

type DocStatus = "PENDING" | "READY" | "REJECTED";

const statusConfig: Record<DocStatus, { label: string; color: string; bg: string }> = {
  PENDING:  { label: "In behandeling", color: "text-eritrea-gold-dark", bg: "bg-eritrea-gold/15" },
  READY:    { label: "Klaar voor ophaling", color: "text-eritrea-green", bg: "bg-eritrea-green/10" },
  REJECTED: { label: "Afgewezen", color: "text-eritrea-red", bg: "bg-eritrea-red/10" },
};

export function DocumentStatusDropdown({
  documentId,
  currentStatus,
}: {
  documentId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState<DocStatus>((currentStatus as DocStatus) ?? "PENDING");
  const [loading, setLoading] = useState(false);

  const handleChange = async (newStatus: DocStatus) => {
    if (newStatus === status) return;
    setLoading(true);
    const result = await updateDocumentStatusAction(documentId, newStatus);
    if (!result?.error) setStatus(newStatus);
    setLoading(false);
  };

  const cfg = statusConfig[status];

  return loading ? (
    <span className="inline-flex items-center gap-1 text-xs text-warm-gray">
      <Loader2 size={11} className="animate-spin" /> Opslaan...
    </span>
  ) : (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value as DocStatus)}
      className={`appearance-none text-xs font-semibold px-2.5 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-eritrea-blue/30 ${cfg.bg} ${cfg.color}`}
    >
      {Object.entries(statusConfig).map(([key, val]) => (
        <option key={key} value={key}>{val.label}</option>
      ))}
    </select>
  );
}
