"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addFamilyMemberAction, deleteFamilyMemberAction } from "@/app/actions/profile";
import { User, Plus, Trash2, Loader2, Check, X } from "lucide-react";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  relationship: string;
  createdAt: string;
}

const relationships = ["Partner", "Kind", "Vader", "Moeder", "Broer", "Zus", "Oom", "Tante", "Grootvader", "Grootmoeder", "Anders"];

export default function FamilieClient({ members: initialMembers }: { members: Member[] }) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", dateOfBirth: "", relationship: "" });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    const result = await addFamilyMemberAction(formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setShowForm(false);
      setForm({ firstName: "", lastName: "", dateOfBirth: "", relationship: "" });
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteFamilyMemberAction(id);
    setMembers(prev => prev.filter(m => m.id !== id));
    setDeletingId(null);
  }

  return (
    <div className="space-y-4">
      {members.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-10 text-center">
          <User size={32} className="mx-auto text-warm-gray/30 mb-3" />
          <p className="text-warm-gray text-sm">Nog geen familieleden toegevoegd.</p>
        </div>
      )}

      {members.map(member => (
        <div key={member.id} className="bg-white rounded-2xl ring-1 ring-stone/40 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-eritrea-green/10 text-eritrea-green flex items-center justify-center font-bold shrink-0">
            {member.firstName[0]}{member.lastName[0]}
          </div>
          <div className="flex-1">
            <p className="font-medium text-charcoal">{member.firstName} {member.lastName}</p>
            <p className="text-sm text-warm-gray mt-0.5">
              {member.relationship}
              {member.dateOfBirth && ` · geb. ${member.dateOfBirth}`}
            </p>
          </div>
          <button
            onClick={() => handleDelete(member.id)}
            disabled={deletingId === member.id}
            className="text-warm-gray hover:text-eritrea-red p-2 rounded-lg hover:bg-eritrea-red/5 transition-colors disabled:opacity-40"
          >
            {deletingId === member.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        </div>
      ))}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl ring-1 ring-eritrea-blue/20 p-6 space-y-4">
          <h3 className="font-display font-medium text-charcoal">Familielid toevoegen</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Voornaam <span className="text-eritrea-red">*</span></label>
              <input type="text" className="form-input" value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">Achternaam <span className="text-eritrea-red">*</span></label>
              <input type="text" className="form-input" value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">Geboortedatum</label>
              <input type="date" className="form-input" value={form.dateOfBirth}
                onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Relatie <span className="text-eritrea-red">*</span></label>
              <select className="form-input" value={form.relationship}
                onChange={e => setForm({ ...form, relationship: e.target.value })} required>
                <option value="">Selecteer...</option>
                {relationships.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-eritrea-red">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              Opslaan
            </button>
            <button type="button" onClick={() => { setShowForm(false); setError(null); }} className="btn-secondary flex items-center gap-2">
              <X size={15} /> Annuleren
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full p-4 rounded-xl border-2 border-dashed border-stone text-warm-gray hover:border-eritrea-blue hover:text-eritrea-blue transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus size={18} /> Familielid toevoegen
        </button>
      )}
    </div>
  );
}
