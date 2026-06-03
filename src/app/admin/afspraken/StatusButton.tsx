"use client";

import { useState } from "react";
import { CheckCircle, XCircle, UserX, Loader2, CreditCard } from "lucide-react";
import { updateAppointmentStatusAction, updatePaymentStatusAction } from "@/app/actions/appointments";

type Status = "CONFIRMED" | "CANCELLED" | "ATTENDED" | "NO_SHOW";
type PaymentStatus = "NONE" | "PENDING" | "PAID" | "WAIVED";

const statusConfig: Record<Status, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  CONFIRMED:  { label: "Bevestigd",  color: "text-eritrea-green",    bg: "bg-eritrea-green/10",   icon: CheckCircle },
  ATTENDED:   { label: "Aanwezig",   color: "text-eritrea-blue",     bg: "bg-eritrea-blue/10",    icon: CheckCircle },
  CANCELLED:  { label: "Geannuleerd",color: "text-eritrea-red",      bg: "bg-eritrea-red/10",     icon: XCircle },
  NO_SHOW:    { label: "Niet gekomen",color: "text-warm-gray",       bg: "bg-parchment",          icon: UserX },
};

const paymentConfig: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  NONE:    { label: "–",          color: "text-warm-gray",       bg: "bg-parchment" },
  PENDING: { label: "Te betalen", color: "text-eritrea-gold-dark", bg: "bg-eritrea-gold/15" },
  PAID:    { label: "Betaald",    color: "text-eritrea-green",    bg: "bg-eritrea-green/10" },
  WAIVED:  { label: "Vrijgesteld",color: "text-eritrea-blue",     bg: "bg-eritrea-blue/10" },
};

export function PaymentStatusDropdown({
  appointmentId,
  currentStatus,
}: {
  appointmentId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState<PaymentStatus>((currentStatus as PaymentStatus) ?? "NONE");
  const [loading, setLoading] = useState(false);

  const handleChange = async (newStatus: PaymentStatus) => {
    if (newStatus === status) return;
    setLoading(true);
    const result = await updatePaymentStatusAction(appointmentId, newStatus);
    if (!result?.error) setStatus(newStatus);
    setLoading(false);
  };

  const cfg = paymentConfig[status];

  return (
    <div className="relative inline-flex items-center gap-1">
      <CreditCard size={11} className={cfg.color} />
      {loading ? (
        <span className="text-xs text-warm-gray"><Loader2 size={11} className="inline animate-spin" /></span>
      ) : (
        <select
          value={status}
          onChange={(e) => handleChange(e.target.value as PaymentStatus)}
          className={`appearance-none text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none ${cfg.bg} ${cfg.color}`}
        >
          {Object.entries(paymentConfig).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as Status] ?? statusConfig.CONFIRMED;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${cfg.bg} ${cfg.color}`}>
      <Icon size={12} /> {cfg.label}
    </span>
  );
}

export function AppointmentStatusDropdown({
  appointmentId,
  currentStatus,
}: {
  appointmentId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState<Status>((currentStatus as Status) ?? "CONFIRMED");
  const [loading, setLoading] = useState(false);

  const handleChange = async (newStatus: Status) => {
    if (newStatus === status) return;
    setLoading(true);
    const result = await updateAppointmentStatusAction(appointmentId, newStatus);
    if (!result?.error) setStatus(newStatus);
    setLoading(false);
  };

  const cfg = statusConfig[status];
  const Icon = cfg.icon;

  return (
    <div className="relative inline-block">
      {loading ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-parchment text-warm-gray">
          <Loader2 size={12} className="animate-spin" /> Opslaan...
        </span>
      ) : (
        <select
          value={status}
          onChange={(e) => handleChange(e.target.value as Status)}
          className={`appearance-none text-xs font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-eritrea-blue/30 ${cfg.bg} ${cfg.color}`}
        >
          {Object.entries(statusConfig).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      )}
    </div>
  );
}
