"use client";

import { useState } from "react";
import { updateStaffRoleAction } from "@/app/actions/staff";
import { Loader2 } from "lucide-react";

export function RoleSelector({
  staffId,
  currentRole,
  isCurrentUser,
}: {
  staffId: string;
  currentRole: string;
  isCurrentUser: boolean;
}) {
  const [role, setRole] = useState<"STAFF" | "ADMIN">(currentRole as "STAFF" | "ADMIN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isCurrentUser) {
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
        role === "ADMIN"
          ? "bg-eritrea-red/10 text-eritrea-red"
          : "bg-eritrea-blue/10 text-eritrea-blue"
      }`}>
        {role === "ADMIN" ? "Beheerder (u)" : "Medewerker (u)"}
      </div>
    );
  }

  async function handleChange(newRole: "STAFF" | "ADMIN") {
    if (newRole === role) return;
    setLoading(true);
    setError(null);
    const result = await updateStaffRoleAction(staffId, newRole);
    if (result?.error) {
      setError(result.error);
    } else {
      setRole(newRole);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-warm-gray">
        <Loader2 size={11} className="animate-spin" /> Opslaan...
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        value={role}
        onChange={(e) => handleChange(e.target.value as "STAFF" | "ADMIN")}
        className={`appearance-none text-xs font-semibold px-2.5 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-eritrea-blue/30 ${
          role === "ADMIN"
            ? "bg-eritrea-red/10 text-eritrea-red"
            : "bg-eritrea-blue/10 text-eritrea-blue"
        }`}
      >
        <option value="STAFF">Medewerker</option>
        <option value="ADMIN">Beheerder</option>
      </select>
      {error && <p className="text-xs text-eritrea-red">{error}</p>}
    </div>
  );
}
