// Shared service catalogue — used in wizard, confirmation, etc.

export interface ServiceInfo {
  id: string;
  title: string;
  requiredDocs: string[];
  duration: string;
}

export const SERVICE_CATALOGUE: ServiceInfo[] = [
  {
    id: "id-nieuw",
    title: "ID Nieuwe aanvragers",
    duration: "10 min",
    requiredDocs: ["Geboorteakte", "2 pasfoto's", "Bewijs van Eritrese nationaliteit"],
  },
  {
    id: "id-vervanging",
    title: "ID Vervanging",
    duration: "10 min",
    requiredDocs: ["Huidig ID (of kopie)", "1 pasfoto", "Geldig identiteitsbewijs"],
  },
  {
    id: "id-minderjarig",
    title: "Minderjarige ID-kaarten",
    duration: "10 min",
    requiredDocs: ["Geboorteakte kind", "ID van beide ouders", "2 pasfoto's van het kind"],
  },
  {
    id: "wroeging",
    title: "Wroeging / Remorse",
    duration: "10 min",
    requiredDocs: ["Geldig identiteitsbewijs", "Ingevuld formulier"],
  },
  {
    id: "paspoort-nieuw",
    title: "Eritrees nieuw paspoort",
    duration: "10 min",
    requiredDocs: ["Eritrese ID-kaart", "4 pasfoto's", "Geboorteakte", "Bewijs van nationaliteit"],
  },
  {
    id: "paspoort-aanvraag",
    title: "Paspoort Aanvraag",
    duration: "10 min",
    requiredDocs: ["Eritrese ID-kaart", "4 pasfoto's", "Geboorteakte", "Bewijs van nationaliteit"],
  },
  {
    id: "paspoort-vervanging",
    title: "Eritrese paspoortvervanging",
    duration: "10 min",
    requiredDocs: ["Huidig paspoort (of kopie)", "2 pasfoto's", "Eritrese ID-kaart"],
  },
  {
    id: "visum",
    title: "Visum / Visa",
    duration: "10 min",
    requiredDocs: [
      "Geldig paspoort (min. 6 maanden)",
      "Pasfoto",
      "Visumaanvraagformulier",
      "Bewijs van accommodatie",
      "Retourticket",
    ],
  },
  {
    id: "volmacht",
    title: "Volmacht / Power of Attorney",
    duration: "10 min",
    requiredDocs: [
      "Geldig identiteitsbewijs",
      "Concept volmachttekst",
      "Gegevens gemachtigde persoon",
    ],
  },
  {
    id: "huwelijk",
    title: "Huwelijksakte / Marriage Certificate",
    duration: "10 min",
    requiredDocs: [
      "Huwelijksakte (met apostille)",
      "Beëdigde vertaling",
      "ID van beide partners",
    ],
  },
  {
    id: "persoonlijk-doc",
    title: "Persoonlijk officieel document",
    duration: "10 min",
    requiredDocs: ["Geldig identiteitsbewijs", "Relevant document ter ondertekening"],
  },
  {
    id: "belasting",
    title: "2% Belasting / 2% Tax",
    duration: "10 min",
    requiredDocs: ["Geldig identiteitsbewijs", "Loonstroken / jaaropgave", "Vorige belastingverklaring"],
  },
];

export function getServiceInfo(serviceId: string): ServiceInfo | undefined {
  return SERVICE_CATALOGUE.find((s) => s.id === serviceId);
}
