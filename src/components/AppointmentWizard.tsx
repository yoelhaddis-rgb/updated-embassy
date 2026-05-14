"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, CreditCard, Users, Shield, Plane,
  Check, ChevronRight, ChevronLeft, Upload, X,
  User, Plus, Trash2, AlertCircle, Stamp, Loader2,
  FolderOpen,
} from "lucide-react";
import { createAppointmentAction, getAvailableSlots } from "@/app/actions/appointments";

// ── Types ──────────────────────────────────────────────────────────────
type ServiceType = string;

interface Person {
  voornaam: string; achternaam: string; geboortedatum: string;
  telefoonnummer: string; email: string; opmerkingen: string;
}

interface AppointmentData {
  service: ServiceType | null;
  persons: Person[];
  date: string;
  time: string;
  files: File[];
}

export interface ExistingDocument {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface PrefillData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

interface Props {
  prefillData?: PrefillData;
  existingDocuments?: ExistingDocument[];
}

// ── Service catalogue ──────────────────────────────────────────────────
const serviceOptions = [
  { id: "id-nieuw", icon: FileText, title: "ID Nieuwe aanvragers", titleEn: "ID New Applicants", titleTi: "መንነት ሓድሽ", time: "10 min", color: "text-eritrea-blue", bg: "bg-eritrea-blue/8",
    requiredDocs: ["Geboorteakte", "2 pasfoto's", "Bewijs van Eritrese nationaliteit"] },
  { id: "id-vervanging", icon: FileText, title: "ID Vervanging", titleEn: "ID Replacement", titleTi: "መተካእታ መንነት", time: "10 min", color: "text-eritrea-blue", bg: "bg-eritrea-blue/8",
    requiredDocs: ["Huidig ID (of kopie)", "1 pasfoto", "Geldig identiteitsbewijs"] },
  { id: "id-minderjarig", icon: Users, title: "Minderjarige ID-kaarten", titleEn: "Underage ID Cards", titleTi: "ንቆልዑ ናይ ኤርትራውያን ወለዲ", time: "10 min", color: "text-eritrea-blue", bg: "bg-eritrea-blue/8",
    requiredDocs: ["Geboorteakte kind", "ID van beide ouders", "2 pasfoto's van het kind"] },
  { id: "wroeging", icon: FileText, title: "Wroeging / Remorse", titleEn: "Remorse", titleTi: "ጣዕሳ", time: "10 min", color: "text-eritrea-green", bg: "bg-eritrea-green/8",
    requiredDocs: ["Geldig identiteitsbewijs", "Ingevuld formulier"] },
  { id: "paspoort-nieuw", icon: Plane, title: "Eritrees nieuw paspoort", titleEn: "Eritrean New Passport", titleTi: "ሓድሽፓስፖርትኤርትራት", time: "10 min", color: "text-eritrea-green", bg: "bg-eritrea-green/8",
    requiredDocs: ["Eritrese ID-kaart", "4 pasfoto's", "Geboorteakte", "Bewijs van nationaliteit"] },
  { id: "paspoort-vervanging", icon: Plane, title: "Eritrese paspoortvervanging", titleEn: "Eritrean Passport Replacement", titleTi: "ናይ ኤርትራ ፓስፖርት ምትካእ", time: "10 min", color: "text-eritrea-green", bg: "bg-eritrea-green/8",
    requiredDocs: ["Huidig paspoort (of kopie)", "2 pasfoto's", "Eritrese ID-kaart"] },
  { id: "visum", icon: Stamp, title: "Visum / Visa", titleEn: "Visa", titleTi: "ቪዛ", time: "10 min", color: "text-eritrea-red", bg: "bg-eritrea-red/8",
    requiredDocs: ["Geldig paspoort (min. 6 maanden)", "Pasfoto", "Visumaanvraagformulier", "Bewijs van accommodatie", "Retourticket"] },
  { id: "volmacht", icon: Shield, title: "Volmacht / Power of Attorney", titleEn: "Power of Attorney", titleTi: "ውክልና", time: "10 min", color: "text-eritrea-gold-dark", bg: "bg-eritrea-gold/10",
    requiredDocs: ["Geldig identiteitsbewijs", "Concept volmachttekst", "Gegevens gemachtigde persoon"] },
  { id: "huwelijk", icon: Users, title: "Huwelijksakte / Marriage Certificate", titleEn: "Marriage Certificate", titleTi: "ምስክር ወረቐት መርዓ", time: "10 min", color: "text-eritrea-blue", bg: "bg-eritrea-blue/8",
    requiredDocs: ["Huwelijksakte (met apostille)", "Beëdigde vertaling", "ID van beide partners"] },
  { id: "persoonlijk-doc", icon: FileText, title: "Persoonlijk officieel document", titleEn: "Personal Official Document", titleTi: "ናይብሕቲመንግስታዊሰነድ", time: "10 min", color: "text-warm-gray", bg: "bg-parchment",
    requiredDocs: ["Geldig identiteitsbewijs", "Relevant document ter ondertekening"] },
  { id: "belasting", icon: CreditCard, title: "2% Belasting / 2% Tax", titleEn: "2% Tax", titleTi: "2% ቀረጽ", time: "10 min", color: "text-eritrea-gold-dark", bg: "bg-eritrea-gold/10",
    requiredDocs: ["Geldig identiteitsbewijs", "Loonstroken / jaaropgave", "Vorige belastingverklaring"] },
];

const timeSlots = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30"];
const steps = ["Dienst", "Personen", "Datum & Tijd", "Documenten", "Bevestiging"];

// ── Component ──────────────────────────────────────────────────────────
export default function AppointmentWizard({ prefillData, existingDocuments = [] }: Props) {
  const router = useRouter();

  const initialPerson = (): Person => ({
    voornaam: prefillData?.firstName ?? "",
    achternaam: prefillData?.lastName ?? "",
    geboortedatum: prefillData?.dateOfBirth ?? "",
    telefoonnummer: prefillData?.phone ?? "",
    email: prefillData?.email ?? "",
    opmerkingen: "",
  });

  const [step, setStep] = useState(0);
  const [data, setData] = useState<AppointmentData>({
    service: null, persons: [initialPerson()], date: "", time: "", files: [],
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedExistingDocs, setSelectedExistingDocs] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedService = serviceOptions.find((s) => s.id === data.service);

  // Fetch booked slots whenever date changes
  useEffect(() => {
    if (!data.date) return;
    setLoadingSlots(true);
    setData(prev => ({ ...prev, time: "" }));
    getAvailableSlots(data.date).then(booked => {
      setBookedSlots(booked);
      setLoadingSlots(false);
    });
  }, [data.date]);

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return !!data.service;
      case 1: return data.persons.every((p) => p.voornaam && p.achternaam && p.email && p.telefoonnummer);
      case 2: return !!data.date && !!data.time;
      default: return true;
    }
  };

  const updatePerson = (i: number, field: keyof Person, value: string) => {
    const updated = [...data.persons];
    updated[i] = { ...updated[i], [field]: value };
    setData({ ...data, persons: updated });
  };

  const toggleExistingDoc = (id: string) => {
    setSelectedExistingDocs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const availableDates = (() => {
    const dates: string[] = [];
    const d = new Date();
    d.setDate(d.getDate() + 1);
    while (dates.length < 30) {
      if (d.getDay() >= 1 && d.getDay() <= 4) dates.push(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() + 1);
    }
    return dates;
  })();

  const handleSubmit = async () => {
    if (!data.service || !data.date || !data.time) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const notes = data.persons.length > 1
      ? `Extra personen: ${data.persons.slice(1).map(p => `${p.voornaam} ${p.achternaam} (${p.email})`).join("; ")}${data.persons[0].opmerkingen ? ` | ${data.persons[0].opmerkingen}` : ""}`
      : (data.persons[0].opmerkingen || "");

    const formData = new FormData();
    formData.append("serviceId", data.service);
    formData.append("serviceTitle", selectedService!.title);
    formData.append("date", data.date);
    formData.append("timeSlot", data.time);
    formData.append("notes", notes);

    const result = await createAppointmentAction(formData);

    if (result.error) {
      setSubmitError(result.error);
      setIsSubmitting(false);
    } else {
      setSubmitted(true);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 rounded-full bg-eritrea-green/8 text-eritrea-green flex items-center justify-center mx-auto mb-6">
          <Check size={40} strokeWidth={1.5} />
        </div>
        <h2 className="font-display text-3xl font-medium text-charcoal mb-4">Afspraak Bevestigd!</h2>
        <p className="text-warm-gray text-lg mb-8">
          Uw afspraak is opgeslagen. U vindt de details terug in{" "}
          <strong className="text-charcoal">Mijn Account</strong>.
        </p>
        <div className="bg-parchment/60 rounded-2xl p-8 text-left space-y-4 mb-8">
          {[
            ["Dienst", selectedService?.title ?? ""],
            ["Datum", data.date ? new Date(data.date + "T12:00:00").toLocaleDateString("nl-NL", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : ""],
            ["Tijd", `${data.time} uur`],
            ["Personen", String(data.persons.length)],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between">
              <span className="text-warm-gray">{label}</span>
              <span className="font-medium text-charcoal">{val}</span>
            </div>
          ))}
        </div>
        <div className="bg-eritrea-gold/8 rounded-xl p-4 text-sm text-charcoal/80 flex items-start gap-3 mb-8">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-eritrea-gold-dark" />
          <p><strong>Belangrijk:</strong> Breng alle originele documenten mee naar uw afspraak.</p>
        </div>
        <button
          onClick={() => router.push("/mijn-account")}
          className="btn-primary"
        >
          Naar mijn account
        </button>
      </div>
    );
  }

  // ── Wizard ────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-10 pb-8 border-b border-stone/30">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center">
            <button
              onClick={() => i < step && setStep(i)}
              className={`step-indicator ${i === step ? "step-active" : i < step ? "step-completed cursor-pointer" : "step-inactive"}`}
            >
              {i < step ? <Check size={16} /> : i + 1}
            </button>
            <span className={`hidden sm:block ml-2 text-xs ${i === step ? "text-eritrea-blue font-medium" : i < step ? "text-eritrea-green" : "text-warm-gray/40"}`}>
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className={`w-6 md:w-12 h-0.5 mx-1.5 md:mx-3 rounded-full ${i < step ? "bg-eritrea-green" : "bg-stone/50"}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 0: Service ── */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-xl font-medium text-charcoal mb-2">Waarvoor wilt u een afspraak maken?</h3>
            <p className="text-warm-gray text-sm">Selecteer het type dienst. Elke afspraak duurt 10 minuten.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {serviceOptions.map((service) => (
              <button
                key={service.id}
                onClick={() => setData({ ...data, service: service.id })}
                className={`flex items-start gap-3 p-4 rounded-xl text-left transition-all duration-200 ${
                  data.service === service.id
                    ? "bg-eritrea-blue/5 ring-2 ring-eritrea-blue/30"
                    : "bg-parchment/40 hover:bg-parchment/70"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg ${service.bg} ${service.color} flex items-center justify-center shrink-0 mt-0.5`}>
                  <service.icon size={18} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-medium text-charcoal text-sm leading-snug">{service.title}</h4>
                  <p className="text-warm-gray/60 text-xs mt-0.5">{service.titleTi} · {service.time}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 1: Persons ── */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-xl font-medium text-charcoal mb-2">
              Gegevens van {data.persons.length === 1 ? "de aanvrager" : "de aanvragers"}
            </h3>
            <p className="text-warm-gray text-sm">Persoonsgegevens zijn vooringevuld vanuit uw account.</p>
          </div>
          {data.persons.map((person, idx) => (
            <div key={idx} className="bg-parchment/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-medium text-charcoal flex items-center gap-2 text-sm">
                  <User size={16} strokeWidth={1.8} />
                  {idx === 0 ? "Uw gegevens (uit account)" : `Persoon ${idx + 1}`}
                </h4>
                {data.persons.length > 1 && idx > 0 && (
                  <button onClick={() => setData({ ...data, persons: data.persons.filter((_, i) => i !== idx) })}
                    className="text-warm-gray hover:text-eritrea-red p-1 rounded-lg hover:bg-eritrea-red/5 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Voornaam <span className="text-eritrea-red">*</span></label>
                  <input type="text" className="form-input" placeholder="Bijv. Abraham" value={person.voornaam} onChange={(e) => updatePerson(idx, "voornaam", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Achternaam <span className="text-eritrea-red">*</span></label>
                  <input type="text" className="form-input" placeholder="Bijv. Tesfamariam" value={person.achternaam} onChange={(e) => updatePerson(idx, "achternaam", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Geboortedatum</label>
                  <input type="date" className="form-input" value={person.geboortedatum} onChange={(e) => updatePerson(idx, "geboortedatum", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Telefoonnummer <span className="text-eritrea-red">*</span></label>
                  <input type="tel" className="form-input" placeholder="+31 6 12345678" value={person.telefoonnummer} onChange={(e) => updatePerson(idx, "telefoonnummer", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">E-mailadres <span className="text-eritrea-red">*</span></label>
                  <input type="email" className="form-input" placeholder="uw@email.nl" value={person.email} onChange={(e) => updatePerson(idx, "email", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Opmerkingen (optioneel)</label>
                  <textarea className="form-input resize-none" rows={2} placeholder="Extra informatie..." value={person.opmerkingen} onChange={(e) => updatePerson(idx, "opmerkingen", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => setData({ ...data, persons: [...data.persons, { voornaam: "", achternaam: "", geboortedatum: "", telefoonnummer: "", email: "", opmerkingen: "" }] })}
            className="w-full p-4 rounded-xl border-2 border-dashed border-stone text-warm-gray hover:border-eritrea-blue hover:text-eritrea-blue transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium">
            <Plus size={18} /> Persoon toevoegen
          </button>
        </div>
      )}

      {/* ── Step 2: Date & Time ── */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-xl font-medium text-charcoal mb-2">Kies een datum en tijd</h3>
            <p className="text-warm-gray text-sm">Ma – Do, 09:00 – 15:00. Elke afspraak duurt 10 minuten.</p>
          </div>
          <div>
            <label className="form-label">Datum</label>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2 max-h-56 overflow-y-auto">
              {availableDates.map((dateStr) => {
                const d = new Date(dateStr + "T12:00:00");
                return (
                  <button key={dateStr} onClick={() => setData({ ...data, date: dateStr })}
                    className={`p-2.5 rounded-lg text-center transition-all duration-200 ${
                      data.date === dateStr ? "bg-eritrea-blue text-white" : "bg-parchment/40 hover:bg-parchment text-charcoal"
                    }`}>
                    <div className={`text-[10px] uppercase font-medium ${data.date === dateStr ? "text-white/60" : "text-warm-gray/50"}`}>
                      {d.toLocaleDateString("nl-NL", { weekday: "short" })}
                    </div>
                    <div className="text-base font-display font-medium">{d.getDate()}</div>
                    <div className={`text-[10px] ${data.date === dateStr ? "text-white/60" : "text-warm-gray/50"}`}>
                      {d.toLocaleDateString("nl-NL", { month: "short" })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {data.date && (
            <div>
              <label className="form-label flex items-center gap-2">
                Tijdstip
                {loadingSlots && <Loader2 size={12} className="animate-spin text-warm-gray" />}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {timeSlots.map((time) => {
                  const isBooked = bookedSlots.includes(time);
                  return (
                    <button
                      key={time}
                      disabled={isBooked}
                      onClick={() => !isBooked && setData({ ...data, time })}
                      className={`p-2.5 rounded-lg text-center text-sm font-medium transition-all duration-200 ${
                        isBooked
                          ? "bg-stone/30 text-warm-gray/30 cursor-not-allowed line-through"
                          : data.time === time
                          ? "bg-eritrea-blue text-white"
                          : "bg-parchment/40 hover:bg-parchment text-charcoal"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
              {bookedSlots.length > 0 && (
                <p className="text-xs text-warm-gray/60 mt-2">{bookedSlots.length} tijdslot{bookedSlots.length !== 1 ? "s" : ""} al bezet op deze datum.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Documents ── */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-xl font-medium text-charcoal mb-2">Documenten uploaden</h3>
            <p className="text-warm-gray text-sm">Optioneel maar aanbevolen — bespaart tijd bij de ambassade.</p>
          </div>

          {selectedService && (
            <div className="bg-eritrea-blue/5 rounded-xl p-5">
              <h4 className="font-medium text-eritrea-blue mb-3 flex items-center gap-2 text-sm">
                <AlertCircle size={16} /> Benodigde documenten voor {selectedService.title}
              </h4>
              <ul className="space-y-2">
                {selectedService.requiredDocs.map((doc) => (
                  <li key={doc} className="text-sm text-charcoal/70 flex items-start gap-2">
                    <Check size={14} className="shrink-0 mt-0.5 text-eritrea-green" /> {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Previously uploaded documents */}
          {existingDocuments.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-charcoal flex items-center gap-2 mb-3">
                <FolderOpen size={16} className="text-eritrea-gold-dark" /> Eerder geüploade documenten
              </h4>
              <div className="space-y-2">
                {existingDocuments.map((doc) => {
                  const selected = selectedExistingDocs.has(doc.id);
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => toggleExistingDoc(doc.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${
                        selected ? "border-eritrea-green bg-eritrea-green/5" : "border-stone/40 bg-parchment/20 hover:border-stone"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selected ? "bg-eritrea-green/10 text-eritrea-green" : "bg-eritrea-blue/8 text-eritrea-blue"}`}>
                        {selected ? <Check size={15} /> : <FileText size={15} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal truncate">{doc.originalName}</p>
                        <p className="text-xs text-warm-gray/60">{(doc.size / 1024).toFixed(0)} KB · {new Date(doc.createdAt).toLocaleDateString("nl-NL")}</p>
                      </div>
                      <span className={`text-xs font-semibold shrink-0 ${selected ? "text-eritrea-green" : "text-warm-gray/40"}`}>
                        {selected ? "Meesturen" : "Toevoegen"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* New file upload */}
          <div>
            {existingDocuments.length > 0 && (
              <h4 className="text-sm font-semibold text-charcoal mb-3">Nieuwe documenten uploaden</h4>
            )}
            <div onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone rounded-2xl p-8 text-center cursor-pointer hover:border-eritrea-blue hover:bg-eritrea-blue/3 transition-all duration-200 group">
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden"
                onChange={(e) => { if (e.target.files) setData({ ...data, files: [...data.files, ...Array.from(e.target.files)] }); }} />
              <div className="w-12 h-12 rounded-xl bg-parchment group-hover:bg-eritrea-blue/8 text-warm-gray group-hover:text-eritrea-blue flex items-center justify-center mx-auto mb-3 transition-colors duration-200">
                <Upload size={22} />
              </div>
              <p className="font-medium text-charcoal text-sm mb-1">Klik om bestanden te uploaden</p>
              <p className="text-xs text-warm-gray/50">PDF, JPG, PNG, DOC — max. 10MB per bestand</p>
            </div>
          </div>

          {data.files.length > 0 && (
            <div className="space-y-2">
              {data.files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-parchment/30 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-eritrea-blue/8 text-eritrea-blue flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-charcoal">{file.name}</p>
                      <p className="text-xs text-warm-gray/50">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={() => setData({ ...data, files: data.files.filter((_, i) => i !== idx) })}
                    className="text-warm-gray hover:text-eritrea-red p-1 rounded-lg hover:bg-eritrea-red/5 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step 4: Confirmation ── */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-xl font-medium text-charcoal mb-2">Controleer uw gegevens</h3>
            <p className="text-warm-gray text-sm">Controleer alles en bevestig uw afspraak.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-parchment/30 rounded-2xl p-6">
              <h4 className="text-[11px] uppercase tracking-[0.15em] text-warm-gray/50 mb-3 font-semibold">Dienst</h4>
              <p className="font-medium text-charcoal">{selectedService?.title}</p>
              <p className="text-xs text-warm-gray mt-1">{selectedService?.titleTi}</p>
            </div>
            <div className="bg-parchment/30 rounded-2xl p-6">
              <h4 className="text-[11px] uppercase tracking-[0.15em] text-warm-gray/50 mb-3 font-semibold">Datum & Tijd</h4>
              <p className="font-medium text-charcoal">
                {data.date && new Date(data.date + "T12:00:00").toLocaleDateString("nl-NL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} om {data.time} uur
              </p>
            </div>
            <div className="bg-parchment/30 rounded-2xl p-6">
              <h4 className="text-[11px] uppercase tracking-[0.15em] text-warm-gray/50 mb-3 font-semibold">Personen ({data.persons.length})</h4>
              <div className="space-y-2">
                {data.persons.map((person, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white rounded-xl p-3">
                    <div className="w-8 h-8 rounded-full bg-eritrea-blue/8 text-eritrea-blue flex items-center justify-center text-xs font-medium">{idx + 1}</div>
                    <div>
                      <p className="font-medium text-charcoal text-sm">{person.voornaam} {person.achternaam}</p>
                      <p className="text-xs text-warm-gray">{person.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {(selectedExistingDocs.size > 0 || data.files.length > 0) && (
              <div className="bg-parchment/30 rounded-2xl p-6">
                <h4 className="text-[11px] uppercase tracking-[0.15em] text-warm-gray/50 mb-3 font-semibold">
                  Documenten ({selectedExistingDocs.size + data.files.length})
                </h4>
                <p className="text-sm text-charcoal/70">
                  {selectedExistingDocs.size > 0 && `${selectedExistingDocs.size} eerder geüpload`}
                  {selectedExistingDocs.size > 0 && data.files.length > 0 && " · "}
                  {data.files.length > 0 && `${data.files.length} nieuw`}
                </p>
              </div>
            )}
          </div>

          {submitError && (
            <div className="bg-eritrea-red/8 border border-eritrea-red/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 text-eritrea-red mt-0.5" />
              <p className="text-sm text-eritrea-red">{submitError}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-stone/30">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="btn-secondary flex items-center gap-2 text-sm" disabled={isSubmitting}>
            <ChevronLeft size={16} /> Vorige
          </button>
        ) : <div />}
        {step < steps.length - 1 ? (
          <button onClick={() => canProceed() && setStep(step + 1)} disabled={!canProceed()}
            className={`btn-primary flex items-center gap-2 text-sm ${!canProceed() ? "opacity-40 cursor-not-allowed" : ""}`}>
            Volgende <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-green flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <><Loader2 size={16} className="animate-spin" /> Bezig...</>
            ) : (
              <><Check size={16} /> Afspraak Bevestigen</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
