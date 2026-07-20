// Payer-specific drafting guidance for the Reauthorization Assistant.
//
// Each entry biases how the AI writes the reauthorization narrative for that
// funder. Only Optum/UHC and Tricare reflect confirmed funder conventions
// (parent-training emphasis and standardized-score/discharge-criteria focus,
// respectively) — everything else is a reasonable generic starting point.
// TODO: replace GENERIC-derived entries with real funder requirements once
// gathered; each payer below is intentionally editable in isolation.

const GENERIC = {
  label: "Generic / Internal Use",
  emphasis:
    "Balanced clinical documentation covering skill acquisition progress, behavior reduction trends, caregiver involvement, and medical necessity — no single dimension over-weighted.",
  tone: "clinical-formal",
  mustInclude: [
    "Objective progress data (percentages, frequencies, or session counts) wherever available in the source documents",
    "Clear justification for continued medically necessary hours",
  ],
};

export const PAYER_RULES = {
  "Optum/UHC": {
    label: "Optum / United Healthcare",
    emphasis:
      "Heavily emphasize quantitative parent/caregiver training metrics — number of caregiver training sessions delivered, specific skills coached, caregiver fidelity/implementation data, and caregiver-reported outcomes at home. Optum reauthorization reviewers weigh caregiver involvement data as a primary driver of continued-hours justification.",
    tone: "data-forward",
    mustInclude: [
      "A specific count or estimate of caregiver training sessions/hours delivered this authorization period",
      "Caregiver fidelity or implementation data if present in the source documents",
      "Objective progress data (percentages, frequencies, or session counts)",
    ],
  },
  Tricare: {
    label: "Tricare",
    emphasis:
      "Strictly focus on standardized assessment scores (e.g., VB-MAPP, ABLLS-R, Vineland), session frequency/intensity, and explicit discharge or fading criteria. Tricare requires clear, measurable discharge planning language in every reauthorization — do not omit the Transition/Fading/Discharge section's specificity.",
    tone: "clinical-formal",
    mustInclude: [
      "Reference to standardized assessment scores or tools if mentioned anywhere in the source documents",
      "Explicit session frequency and hours-per-week figures",
      "A concrete, measurable discharge or fading criterion — not a vague 'will continue to monitor' statement",
    ],
  },
  BCBS: { ...GENERIC, label: "Blue Cross Blue Shield (BCBS)" },
  Aetna: { ...GENERIC, label: "Aetna" },
  Cigna: { ...GENERIC, label: "Cigna / Evernorth" },
  Medicaid: {
    ...GENERIC,
    label: "Medicaid",
    emphasis:
      GENERIC.emphasis +
      " Medicaid reviewers commonly expect clear medical necessity language tied to functional impairment — state plainly how continued ABA addresses a functional deficit, not just skill-building in the abstract.",
  },
  Generic: GENERIC,
};

export function getPayerRule(payerKey) {
  return PAYER_RULES[payerKey] || GENERIC;
}
