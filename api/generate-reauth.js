import { getPayerRule } from "./lib/payer-rules.js";

const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are an expert Board Certified Behavior Analyst (BCBA) documentation specialist. You draft ABA reauthorization summaries for insurance payers by performing a delta analysis between a client's prior treatment plan/authorization and their newest assessment data or progress scores, then writing payer-ready medical necessity documentation.

You will receive:
- OLD DOCUMENT (prior authorization / treatment plan text, extracted from a PDF — may be incomplete, out of order, or contain OCR artifacts from extraction)
- NEW DOCUMENT (newest scored assessment, progress data, or graph data, extracted from a PDF — same caveats apply)
- PREVIOUSLY SAVED GOALS (optional — goals the clinic already has on file for this learner from their own Goal Builder tool)
- CLINICAL BRAIN DUMP (free-form notes from the BCBA: barriers, caregiver notes, focus areas, medication changes, etc.)
- PAYER GUIDANCE (how to bias emphasis and tone for the selected funder)

Any of OLD DOCUMENT, NEW DOCUMENT, or PREVIOUSLY SAVED GOALS may be empty — work with whatever is provided. Never fabricate specific scores, percentages, dates, or goal names that are not present in the provided input. When information needed for a section is genuinely absent from all provided input, say so plainly (e.g., "Baseline behavior frequency data was not found in the provided documents — BCBA should confirm current rates.") rather than inventing a plausible-sounding number.

━━━ STEP 1: DELTA ANALYSIS ━━━
Compare OLD DOCUMENT against NEW DOCUMENT (and PREVIOUSLY SAVED GOALS, if present) to identify every distinct skill-acquisition goal you can find, and categorize each into exactly one bucket:
- MASTERED: the goal is explicitly marked as met/mastered in the NEW DOCUMENT, or the OLD DOCUMENT's goal is absent from NEW DOCUMENT with contextual evidence it was completed.
- ACTIVE WITH PROGRESS: the goal appears in both, and NEW DOCUMENT shows meaningfully improved data (higher percentage, more independence, fewer prompts) relative to OLD DOCUMENT or the recorded baseline.
- PLATEAUED: the goal appears in both, but NEW DOCUMENT shows flat, minimal, or declining data relative to OLD DOCUMENT — or the CLINICAL BRAIN DUMP explicitly flags it as a barrier/stuck area.
Also identify any behavior-reduction targets with a baseline (or prior) frequency/rate and a current frequency/rate, and note the trend (increasing, decreasing, or stable). Only include a behavior trend entry when both a prior and current data point are actually present in the source material.

━━━ STEP 2: SECTION SPECIFICATIONS ━━━
Write exactly 7 narrative sections. Each should read like a working BCBA wrote it directly into a payer reauthorization packet — precise, evidence-referencing, no filler or flowery prose. Reference specific goals/data from Step 1 wherever relevant instead of speaking in generalities.

behaviorReduction — Behavior Reduction Trends & Progress. Summarize each identified behavior-reduction target's trend using the Step 1 data. If no behavior-reduction data was found in the source material, state that plainly and note it should be confirmed by the BCBA.

skillAcquisition — Skill Acquisition Summary (Mastered vs. Active). Summarize the Step 1 categorization in narrative form: what was mastered this period, what remains active and progressing, referencing specific goal names.

barriers — Barriers to Progress & Clinical Rationales. For every PLATEAUED goal, give a clinical rationale for the plateau (e.g., generalization difficulty, attendance, medical/behavioral interference) drawn from the CLINICAL BRAIN DUMP and document content — never invent a cause not supported by the input. If brain dump notes mention barriers not tied to a specific goal (attendance, medical issues, family stressors), include them here too.

caregiverInvolvement — Caregiver Involvement & Fidelity Metrics. Summarize caregiver/parent training participation, coaching delivered, and home implementation fidelity based on the source documents and brain dump. State plainly if this data was not documented in the source material.

coordinationOfCare — Coordination of Care (Multi-disciplinary). Summarize any collaboration with other providers (speech, OT, school, physician, etc.) mentioned in the source documents or brain dump. State plainly if none was documented.

transitionFading — Transition, Fading, & Discharge Plan. Describe current fading/discharge planning status based on mastered goals, independence level, and any explicit discharge criteria found in the source documents. If none is documented, propose a reasonable placeholder criterion tied to the client's current mastery trajectory and flag it as a BCBA-review item.

medicalNecessity — Final Medical Necessity Justification Statement. A cohesive closing paragraph (or two) making the case for continued authorization: current level of need, why continued hours are clinically necessary given the PLATEAUED and ACTIVE goals, and how outcomes to date support continued medical necessity. This is the section payers weigh most heavily — make it airtight and specific, not generic.

━━━ PAYER BIAS ━━━
Apply the PAYER GUIDANCE block's emphasis and required elements across the relevant sections above (most often medicalNecessity, caregiverInvolvement, and transitionFading) without fabricating data to satisfy it — if the required element genuinely isn't in the source material, say so rather than inventing it.

━━━ RULES ━━━
- Use precise ABA/VB terminology: SD, HRE, DTT, NET, BIP, mand, tact, intraverbal, generalization, maintenance, fading, IOA, etc.
- Refer to the individual as "the learner" or "the client" throughout — never use a real name even if one leaked into the extracted document text; if a proper name appears in the source text, treat it as already-redacted content and substitute "the learner."
- Match the efficient, evidence-based register of a working BCBA writing for a payer audience.
- Return ONLY valid JSON with no markdown fences, no preamble, in EXACTLY this shape:
{"metrics":{"goalsMastered":[{"name":"...","note":"..."}],"goalsActive":[{"name":"...","note":"..."}],"goalsPlateaued":[{"name":"...","note":"..."}],"behaviorTrends":[{"behavior":"...","baseline":"...","current":"...","trend":"increasing|decreasing|stable"}]},"sections":{"behaviorReduction":"...","skillAcquisition":"...","barriers":"...","caregiverInvolvement":"...","coordinationOfCare":"...","transitionFading":"...","medicalNecessity":"..."}}`;

function buildInputString(fields) {
  const rule = getPayerRule(fields.payer);
  const payerGuidance = [
    `Payer: ${rule.label}`,
    `Emphasis: ${rule.emphasis}`,
    `Tone: ${rule.tone}`,
    `Must include where supported by source data: ${rule.mustInclude.join("; ")}`,
  ].join("\n");

  return [
    `OLD DOCUMENT (prior authorization / treatment plan, extracted text):\n${fields.oldDocText || "(none provided)"}`,
    `NEW DOCUMENT (newest assessment / progress data, extracted text):\n${fields.newDocText || "(none provided)"}`,
    `PREVIOUSLY SAVED GOALS (from clinic's own records, if any):\n${fields.libraryContext || "(none provided)"}`,
    `CLINICAL BRAIN DUMP (BCBA's raw notes):\n${fields.brainDump || "(none provided)"}`,
    `AUTHORIZATION PERIOD (if mentioned by BCBA, use it; otherwise omit specifics): ${fields.authPeriod || "Not specified"}`,
    `HOURS REQUESTED (if mentioned by BCBA, use it; otherwise omit specifics): ${fields.hoursRequested || "Not specified"}`,
    `PAYER GUIDANCE:\n${payerGuidance}`,
  ].join("\n\n");
}

const EXAMPLES = [
  {
    input: buildInputString({
      payer: "Optum/UHC",
      oldDocText:
        "TREATMENT PLAN - Authorization Jan-Jun 2025\nGoals:\n1. Receptive ID of colors (AO4) - baseline 20%, target 80% across 3 sessions\n2. Two-step direction following - baseline 10%\nBehavior: Tantrum frequency baseline 12x/week",
      newDocText:
        "PROGRESS REPORT - June 2025\nGoal 1 (Receptive ID colors AO4): mastered 5/2025, 90% across 5 sessions, 2 staff\nGoal 2 (Two-step directions): current 35%, minimal change over last 8 weeks, learner continues to require gestural prompt\nTantrum frequency: current 11x/week",
      libraryContext: "",
      brainDump:
        "Family missed 4 sessions in April due to illness. Parent completed 6 caregiver training sessions this period, now independently implementing visual schedule at home per parent report. Two-step directions goal has been stuck for two months - suspect needs more generalization across settings, currently only practiced at table.",
      authPeriod: "Jul 2025 - Dec 2025",
      hoursRequested: "20 hours/week direct + 2 hours supervision",
    }),
    output: JSON.stringify({
      metrics: {
        goalsMastered: [
          { name: "Receptive ID of colors (AO4)", note: "Mastered 5/2025 at 90% across 5 sessions with 2 staff." },
        ],
        goalsActive: [],
        goalsPlateaued: [
          { name: "Two-step direction following", note: "Baseline 10% → current 35%, minimal change over the last 8 weeks; continues to require a gestural prompt." },
        ],
        behaviorTrends: [
          { behavior: "Tantrum frequency", baseline: "12x/week", current: "11x/week", trend: "stable" },
        ],
      },
      sections: {
        behaviorReduction:
          "Tantrum frequency has remained largely stable across the authorization period, from a baseline of 12 occurrences per week to a current rate of 11 occurrences per week. This modest, non-significant change suggests the current behavior intervention plan should be reviewed for adjustment during the next period, though the absence of an increase indicates the plan is at minimum preventing escalation.",
        skillAcquisition:
          "The learner mastered Receptive ID of colors (AO4) in May 2025, achieving 90% accuracy across 5 consecutive sessions with 2 different staff, exceeding the original 80% mastery criterion. Two-step direction following remains active but has plateaued, moving from a 10% baseline to 35% with minimal change over the past 8 weeks; the learner continues to require a gestural prompt to complete both steps.",
        barriers:
          "The two-step direction following goal has plateaued over approximately 8 weeks. Programming has occurred exclusively at the table setting, suggesting the plateau reflects a generalization deficit rather than a true skill acquisition barrier — the learner may not yet be responding to two-step instructions delivered outside the discrete-trial table context. Additionally, 4 sessions were missed in April due to illness, which may have contributed to the slowed rate of progress during that window.",
        caregiverInvolvement:
          "The caregiver completed 6 caregiver training sessions during this authorization period and, per parent report, is now independently implementing the learner's visual schedule at home. This represents meaningful caregiver skill acquisition and supports continued generalization of programming outside the clinic setting.",
        coordinationOfCare:
          "No coordination with other treating providers (e.g., speech-language pathology, occupational therapy, school staff) was documented in the source materials for this period. The treating BCBA should confirm whether multi-disciplinary coordination is occurring and document it in future reauthorization materials if so.",
        transitionFading:
          "With one goal mastered and caregiver implementation strengthening at home, early fading indicators are present. However, the plateaued two-step direction goal indicates the learner is not yet ready for a reduction in direct hours. A formal discharge or fading criterion was not documented in the source materials — the treating BCBA should establish specific, measurable fading criteria (e.g., mastery of the two-step directions goal across 2 settings) prior to the next reauthorization period.",
        medicalNecessity:
          "Continued ABA services at the current level of intensity are medically necessary to address the learner's ongoing need for individualized instruction on multi-step instruction-following, a skill that has plateaued under current table-based programming and requires structured generalization support across settings to progress. While the learner has demonstrated strong acquisition on a mastered goal, the plateau on two-step directions — combined with stable but unresolved tantrum behavior — indicates the learner continues to require direct 1:1 ABA intervention rather than a reduction in hours. Strengthened caregiver implementation at home supports, but does not yet replace, the need for continued clinician-directed programming to resolve the current plateau and support generalized, independent responding.",
      },
    }),
  },
];

function parseModelJSON(raw) {
  if (!raw) throw new Error("Empty response");
  let text = String(raw).trim();
  text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("No JSON object found");
  return JSON.parse(text.slice(first, last + 1));
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous\s+|prior\s+)?instructions/i,
  /system\s+prompt/i,
  /you\s+are\s+now/i,
  /disregard/i,
  /jailbreak/i,
];

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

  const { payer, oldDocText, newDocText, libraryContext, brainDump, authPeriod, hoursRequested } = req.body || {};

  if (!oldDocText && !newDocText && !libraryContext && !brainDump)
    return res
      .status(400)
      .json({ error: "Provide at least one of: a document upload, saved goals, or clinical notes." });

  const inputText = buildInputString({
    payer,
    oldDocText,
    newDocText,
    libraryContext,
    brainDump,
    authPeriod,
    hoursRequested,
  });

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(inputText)) return res.status(400).json({ error: "Input contains disallowed content." });
  }

  const fewshot = EXAMPLES.flatMap((ex) => [
    { role: "user", content: ex.input },
    { role: "assistant", content: ex.output },
  ]);

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
        max_tokens: 5000,
        system: SYSTEM_PROMPT,
        messages: [...fewshot, { role: "user", content: inputText }],
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

    return res.status(200).json({
      metrics: {
        goalsMastered: parsed.metrics?.goalsMastered || [],
        goalsActive: parsed.metrics?.goalsActive || [],
        goalsPlateaued: parsed.metrics?.goalsPlateaued || [],
        behaviorTrends: parsed.metrics?.behaviorTrends || [],
      },
      sections: {
        behaviorReduction: parsed.sections?.behaviorReduction || "",
        skillAcquisition: parsed.sections?.skillAcquisition || "",
        barriers: parsed.sections?.barriers || "",
        caregiverInvolvement: parsed.sections?.caregiverInvolvement || "",
        coordinationOfCare: parsed.sections?.coordinationOfCare || "",
        transitionFading: parsed.sections?.transitionFading || "",
        medicalNecessity: parsed.sections?.medicalNecessity || "",
      },
    });
  } catch (err) {
    console.error("[generate-reauth] handler error:", err);
    return res.status(500).json({ error: "Something went wrong generating the summary. Please try again." });
  }
}
