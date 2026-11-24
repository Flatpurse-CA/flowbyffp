export type IntakeField = { id: string; label: string; type: "text" | "long" | "yesno"; required?: boolean };

/** Starter templates per vertical (FL-043). Owners can edit labels after adding. */
export const INTAKE_TEMPLATES: Record<string, { name: string; fields: IntakeField[] }> = {
  massage: { name: "Massage therapy intake", fields: [
    { id: "reason", label: "What brings you in today?", type: "long", required: true },
    { id: "conditions", label: "Medical conditions we should know about", type: "long" },
    { id: "medications", label: "Current medications", type: "long" },
    { id: "pregnant", label: "Are you pregnant?", type: "yesno" },
    { id: "allergies", label: "Allergies (oils, lotions, latex)", type: "text" },
    { id: "physician", label: "Physician name (for insurance)", type: "text" },
  ] },
  hair: { name: "Hair consultation", fields: [
    { id: "goal", label: "What look are you going for?", type: "long", required: true },
    { id: "chemical", label: "Colour or chemical treatments in the last 6 months?", type: "yesno" },
    { id: "sensitivity", label: "Scalp sensitivity or allergies", type: "text" },
  ] },
  esthetics: { name: "Skin and esthetics intake", fields: [
    { id: "concerns", label: "Main skin concerns", type: "long", required: true },
    { id: "retinoids", label: "Using retinoids or Accutane?", type: "yesno" },
    { id: "allergies", label: "Allergies or reactions to products", type: "text" },
    { id: "pregnant", label: "Are you pregnant or breastfeeding?", type: "yesno" },
  ] },
};
