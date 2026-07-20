import { getPayerRule } from "./lib/payer-rules.js";

const MODEL = "claude-opus-4-8";

const FALLBACK_TEMPLATE = [
  { id: "client_information", heading: "Client Information" },
  { id: "biopsychosocial_information", heading: "Biopsychosocial Information" },
  { id: "narrative", heading: "Narrative (Language/Communication, Social Skills, Adaptive/Self-Care, Challenging Behaviors, Standardized Assessment Results)" },
  { id: "goal_objective_summary", heading: "Goal/Objective Summary" },
  { id: "skill_acquisition_goals", heading: "Skill Acquisition Goals" },
  { id: "behavior_intervention_plan", heading: "Behavior Intervention Plan" },
  { id: "behavior_reduction_goals", heading: "Behavior Reduction Goals" },
  { id: "caregiver_training", heading: "Caregiver / Parent Training" },
  { id: "generalization_plan", heading: "Generalization Plan" },
  { id: "transition_fading_plan", heading: "Transition and Fading Plan" },
  { id: "discharge_criteria", heading: "Discharge Criteria" },
  { id: "recommendations", heading: "Recommendations for ABA Services (Medical Necessity & Barriers to Treatment)" },
  { id: "provider_information", heading: "Provider Information" },
];

const SYSTEM_PROMPT = `You are an expert Board Certified Behavior Analyst (BCBA) documentation specialist performing STAGE 2 of a two-stage reauthorization drafting pipeline: DRAFTING. A first AI stage already read the source documents and produced clean, structured analysis — trust that analysis completely and do not attempt to re-derive it. Your job is to produce the actual updated document content.

You will receive:
- SOURCE TYPE: whether there is a real previous-reauthorization template to edit ("previous_reauth"), or whether to use the standard fallback template ("initial_assessment" / "insufficient_data").
- TEMPLATE SECTIONS (only when editing an existing document): the actual sections extracted from the client's previous reauthorization, each with a type and its original text.
- DELTA ANALYSIS: goal categorization (mastered / inProgress / onHold / discontinued / new) and behavior trend data, already computed — use it, don't recompute it.
- CLINICAL BRAIN DUMP: the BCBA's raw notes.
- PAYER GUIDANCE: how to bias emphasis and tone for the selected funder.

━━━ IF TEMPLATE SECTIONS WERE PROVIDED (editing an existing document) ━━━
For each section, produce updatedText using MINIMAL, EDIT-IN-PLACE changes:
- Preserve the section's original wording, structure, and formatting as closely as possible. This must read as an edited version of the same document, not a rewrite.
- type "static_admin": copy originalText through completely unchanged unless the source material explicitly provides a corrected value for one specific field (e.g., a new reassessment date). Client identity fields, provider fields, and historical dates are never regenerated.
- type "structured_block" (per-goal / per-behavior fields): NEVER alter an established Baseline value or a Date of Introduction/original start date — copy those exactly from originalText. DO update: Progress Data, Present Level of Performance, Projected Mastery, Barriers, and goal status — using the DELTA ANALYSIS entry that matches this goal. If a field references a graph/chart/visual data that isn't reproducible as text, write exactly: "[Graph not available — BCBA to insert updated graph/chart before submission]" instead of describing or inventing what it might show.
- type "narrative" and "table": update only the specific facts that DELTA ANALYSIS or CLINICAL BRAIN DUMP actually give you new information about (e.g., "include details about progress from the previous authorization" prompts, medical necessity justification, response-to-treatment summaries, goal counts). Leave everything else exactly as it was.
- If DELTA ANALYSIS and CLINICAL BRAIN DUMP genuinely have nothing new relevant to a section, return its originalText completely unchanged — do not touch it just to have something to change.
- Never fabricate a specific score, date, name, or clinical detail not present in TEMPLATE SECTIONS, DELTA ANALYSIS, or CLINICAL BRAIN DUMP. If something a section asks for is missing from all three, state plainly that it wasn't documented and should be confirmed by the BCBA — do not invent a plausible-sounding placeholder value.

━━━ IF NO TEMPLATE SECTIONS (initial assessment / insufficient data — use the standard fallback template) ━━━
There is no prior document to edit, so generate fresh content for the standard fallback template sections listed below, populated using DELTA ANALYSIS and CLINICAL BRAIN DUMP. Never fabricate specific data not present in the input — state plainly when something wasn't documented (e.g., "Not provided — BCBA to complete.").

Standard fallback template sections, in order:
${FALLBACK_TEMPLATE.map((s, i) => `${i + 1}. ${s.heading}`).join("\n")}

━━━ RULES ━━━
- Apply PAYER GUIDANCE's emphasis and required elements wherever relevant (most often medical necessity, caregiver involvement, and transition/discharge sections) without fabricating data to satisfy it.
- Use precise ABA/VB terminology: SD, HRE, DTT, NET, BIP, mand, tact, intraverbal, generalization, maintenance, fading, IOA, etc.
- Refer to the individual as "the learner" or "the client" throughout — never use a real name even if one appears in the source text (treat any proper name as already-redacted content and substitute "the learner").
- Match the efficient, evidence-based register of a working BCBA writing for a payer audience. No filler.
- Return ONLY valid JSON with no markdown fences, no preamble, in EXACTLY this shape:
{"sections":[{"id":"...","heading":"...","updatedText":"..."}]}`;

function buildInputString(fields) {
  const rule = getPayerRule(fields.payer);
  const payerGuidance = [
    `Payer: ${rule.label}`,
    `Emphasis: ${rule.emphasis}`,
    `Tone: ${rule.tone}`,
    `Must include where supported by source data: ${rule.mustInclude.join("; ")}`,
  ].join("\n");

  const sectionsBlock = fields.templateSections && fields.templateSections.length
    ? fields.templateSections
        .map((s) => `[${s.id}] (${s.type}) "${s.heading}"\n${s.originalText}`)
        .join("\n\n---\n\n")
    : "(none — use the standard fallback template)";

  const delta = fields.delta || {};
  const deltaBlock = [
    `Goal counts: ${JSON.stringify(delta.goalCounts || {})}`,
    `Mastered: ${JSON.stringify(delta.goalsMastered || [])}`,
    `In progress: ${JSON.stringify(delta.goalsInProgress || [])}`,
    `On hold: ${JSON.stringify(delta.goalsOnHold || [])}`,
    `Discontinued: ${JSON.stringify(delta.goalsDiscontinued || [])}`,
    `New: ${JSON.stringify(delta.goalsNew || [])}`,
    `Behavior trends: ${JSON.stringify(delta.behaviorTrends || [])}`,
  ].join("\n");

  return [
    `SOURCE TYPE: ${fields.sourceType}`,
    `TEMPLATE SECTIONS:\n${sectionsBlock}`,
    `DELTA ANALYSIS:\n${deltaBlock}`,
    `CLINICAL BRAIN DUMP:\n${fields.brainDump || "(none provided)"}`,
    `PAYER GUIDANCE:\n${payerGuidance}`,
  ].join("\n\n");
}

function parseModelJSON(raw) {
  if (!raw) throw new Error("Empty response");
  let text = String(raw).trim();
  text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("No JSON object found");
  return JSON.parse(text.slice(first, last + 1));
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey)
    return res
      .status(500)
      .json({ error: "Server is missing its API key. Add ANTHROPIC_API_KEY in Vercel environment variables." });

  const { payer, sourceType, templateSections, delta, brainDump } = req.body || {};

  if (!sourceType)
    return res.status(400).json({ error: "Missing analysis result — run Stage 1 first." });

  const inputText = buildInputString({ payer, sourceType, templateSections, delta, brainDump });

  try {
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: inputText }],
      }),
    });

    if (!aiRes.ok) {
      const detail = await aiRes.text();
      console.error("Anthropic API error:", detail.slice(0, 500));
      return res
        .status(502)
        .json({ error: "The AI service returned an error. Check your API key and billing." });
    }

    const data = await aiRes.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    const parsed = parseModelJSON(text);

    return res.status(200).json({ sections: parsed.sections || [] });
  } catch (err) {
    console.error("[generate-reauth-draft] handler error:", err);
    return res.status(500).json({ error: "Something went wrong drafting the document. Please try again." });
  }
}
