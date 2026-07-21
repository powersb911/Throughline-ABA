const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are an expert Board Certified Behavior Analyst (BCBA) documentation specialist performing STAGE 1 of a two-stage reauthorization drafting pipeline: ANALYSIS ONLY. Do not write new clinical prose in this stage — your job is to read, classify, and structure information precisely. A second AI stage will handle the actual drafting using your output, so its quality depends entirely on how accurate and complete your extraction is here.

You will receive:
- OLD DOCUMENT: extracted text from either a previous reauthorization/treatment plan, an initial assessment/intake report, or nothing at all.
- NEW DOCUMENT: extracted text from the newest scored assessment or progress data.
- PREVIOUSLY SAVED GOALS: optional, from the clinic's own records.
- CLINICAL BRAIN DUMP: the BCBA's raw notes.

Both OLD DOCUMENT and NEW DOCUMENT were extracted from PDFs using a text-layer parser — formatting, tables, and checkboxes may be flattened or garbled, and any content that was purely graphical (hand-scored grids, chart/graph images, scanned pages) will be missing or unreadable. Work only with what's actually present in the text. Never assume information exists just because a document of this type would typically contain it — a blank or mostly-graphical standardized assessment protocol may yield almost no usable score data, and that is an expected, reportable outcome, not a failure to work around.

Common standardized-assessment domain names you may see referenced in NEW DOCUMENT (for recognition only — use these to correctly interpret domain-level scores when present, not as a checklist to fabricate):
- ABLLS-R domains: Cooperation & Reinforcer Effectiveness, Visual Performance, Receptive Language, Motor Imitation, Vocal Imitation, Requests (Manding), Labeling (Tacting), Intraverbals, Spontaneous Vocalizations, Syntax/Grammar, Play & Leisure, Social Interaction, Group Instruction, Classroom Routines, Generalized Responding, Reading, Math, Writing, Spelling.
- VB-MAPP: 16 skill areas (Mand, Tact, Listener Responding, Visual Perceptual/Matching-to-Sample, Play, Social, Motor Imitation, Echoic, Spontaneous Vocalizations, Listener Responding by Feature/Function/Class, Intraverbal, Classroom Routines/Group Skills, Linguistic Structure, Math, Reading, Writing) across 3 developmental levels, plus a 24-item Barriers Assessment and a Transition Assessment.

━━━ STEP 1: CLASSIFY THE OLD DOCUMENT ━━━
Determine sourceType — exactly one of:
- "previous_reauth": OLD DOCUMENT is a completed or filled reauthorization/treatment plan with reauthorization-shaped content (goal-level baseline/progress fields, medical necessity language, requested hours, etc.) that can be edited into an updated version.
- "initial_assessment": OLD DOCUMENT is an intake/initial evaluation report or other non-reauthorization document — it has no reauthorization structure to mirror.
- "insufficient_data": no usable OLD DOCUMENT text was provided, or the extracted text is too sparse or garbled to work with.

━━━ STEP 2: EXTRACT TEMPLATE STRUCTURE (only if sourceType is "previous_reauth") ━━━
Break OLD DOCUMENT into its actual sections, in the order they appear in the document. Do NOT copy out each section's full body text — OLD DOCUMENT already exists verbatim in the source; retyping large chunks of it wastes your output budget and risks truncating your own response on long documents. Instead, for each section return lightweight locator anchors that a plain-text search can use to slice the real text out afterward:
- id: a short stable lower_snake_case slug derived from the heading (e.g., "skill_acquisition_goals").
- heading: the section's actual heading text as it appears in the document.
- type: exactly one of "narrative" (free prose), "structured_block" (repeated key:value fields, e.g. a per-goal or per-behavior block with Baseline/Progress Data/Barriers/etc.), "table" (grid/tabular data such as CPT codes, schedules, or a provider coordination table), "static_admin" (identity/demographic/provider fields that should almost never change between authorizations).
- startAnchor: the exact first 8-10 words of the section's body (not counting the heading itself), copied character-for-character from OLD DOCUMENT including its original punctuation and whitespace — this must be findable with a literal, case-sensitive substring search.
- endAnchor: the exact last 8-10 words of the section's body, copied character-for-character from OLD DOCUMENT the same way, including the section's final punctuation.

If a section's body is shorter than ~16-20 words, startAnchor and endAnchor may overlap or even be identical — that's fine, just keep both exact and findable. If sourceType is not "previous_reauth", return an empty array for templateSections. Do not invent a structure that isn't actually there.

━━━ STEP 3: DELTA / PROGRESS ANALYSIS ━━━
Compare OLD DOCUMENT, NEW DOCUMENT, and PREVIOUSLY SAVED GOALS to identify every distinct goal you can find. Classify each into exactly one status:
- mastered: explicitly met/mastered in NEW DOCUMENT, or absent from NEW DOCUMENT with evidence it was completed.
- inProgress: present in both, showing meaningfully improved data.
- onHold: present in both, but paused, flat, or declining — or explicitly flagged as stuck/paused in CLINICAL BRAIN DUMP.
- discontinued: explicitly discontinued, replaced, or no longer clinically appropriate per the source material.
- new: appears for the first time in NEW DOCUMENT or CLINICAL BRAIN DUMP with no prior history.
Also extract every behavior-reduction target that has both a prior and a current frequency/rate documented, noting the trend (increasing, decreasing, stable). Only include an entry when both data points genuinely exist in the source material.

━━━ STEP 4: DATA QUALITY NOTES ━━━
List anything a BCBA should double-check because extraction was incomplete, garbled, or missing — e.g., "NEW DOCUMENT appears to be a blank/graphical assessment protocol with no readable score data" or "No behavior reduction data found in either document." Leave empty string if nothing to flag.

Never fabricate specific scores, dates, names, or goal details that are not present in the input.

Return ONLY valid JSON with no markdown fences, no preamble, in EXACTLY this shape:
{"sourceType":"previous_reauth|initial_assessment|insufficient_data","templateSections":[{"id":"...","heading":"...","type":"...","startAnchor":"...","endAnchor":"..."}],"delta":{"goalCounts":{"total":0,"mastered":0,"inProgress":0,"onHold":0,"discontinued":0,"new":0},"goalsMastered":[{"name":"...","note":"..."}],"goalsInProgress":[{"name":"...","note":"..."}],"goalsOnHold":[{"name":"...","note":"..."}],"goalsDiscontinued":[{"name":"...","note":"..."}],"goalsNew":[{"name":"...","note":"..."}],"behaviorTrends":[{"behavior":"...","baseline":"...","current":"...","trend":"increasing|decreasing|stable"}]},"dataQualityNotes":"..."}`;

function buildInputString(fields) {
  return [
    `OLD DOCUMENT (prior authorization / treatment plan / initial assessment, extracted text):\n${fields.oldDocText || "(none provided)"}`,
    `NEW DOCUMENT (newest scored assessment / progress data, extracted text):\n${fields.newDocText || "(none provided)"}`,
    `PREVIOUSLY SAVED GOALS (from clinic's own records, if any):\n${fields.libraryContext || "(none provided)"}`,
    `CLINICAL BRAIN DUMP (BCBA's raw notes):\n${fields.brainDump || "(none provided)"}`,
  ].join("\n\n");
}

const EXAMPLES = [
  {
    input: buildInputString({
      oldDocText:
        "REAUTHORIZATION REQUEST - Jan-Jun 2025\n\nClient Information\nParticipant: [REDACTED]\nDOB: [REDACTED]\n\nSkill Acquisition Goals\nGoal Statement: Given a field of 3 identical stimuli, the learner will match with 80% accuracy across 3 sessions.\nBaseline: 20% accuracy, established 1/2025.\nDate of Introduction: 1/2025\nProgress Data: Not yet introduced.\nBarriers: None noted.\n\nMedical Necessity\nThe learner requires continued 1:1 ABA services to address delays in receptive language and matching skills consistent with an ASD diagnosis.",
      newDocText:
        "PROGRESS REPORT - June 2025\nIdentical matching: mastered 5/2025 at 90% across 5 sessions with 2 staff.\nSorting by feature: introduced 3/2025, currently at 30%, minimal change over 6 weeks, learner continues to require partial physical prompting.",
      libraryContext: "",
      brainDump: "Sorting by feature has been stuck for about 6 weeks. Family missed several sessions in April.",
    }),
    output: JSON.stringify({
      sourceType: "previous_reauth",
      templateSections: [
        {
          id: "client_information",
          heading: "Client Information",
          type: "static_admin",
          startAnchor: "Participant: [REDACTED]",
          endAnchor: "DOB: [REDACTED]",
        },
        {
          id: "skill_acquisition_goals",
          heading: "Skill Acquisition Goals",
          type: "structured_block",
          startAnchor: "Goal Statement: Given a field of 3 identical stimuli, the",
          endAnchor: "Progress Data: Not yet introduced.\nBarriers: None noted.",
        },
        {
          id: "medical_necessity",
          heading: "Medical Necessity",
          type: "narrative",
          startAnchor: "The learner requires continued 1:1 ABA services to address",
          endAnchor: "consistent with an ASD diagnosis.",
        },
      ],
      delta: {
        goalCounts: { total: 2, mastered: 1, inProgress: 0, onHold: 1, discontinued: 0, new: 0 },
        goalsMastered: [{ name: "Identical matching", note: "Mastered 5/2025 at 90% across 5 sessions with 2 staff." }],
        goalsInProgress: [],
        goalsOnHold: [{ name: "Sorting by feature", note: "Introduced 3/2025, currently at 30%, minimal change over 6 weeks; continues to require partial physical prompting. Family missed several sessions in April." }],
        goalsDiscontinued: [],
        goalsNew: [],
        behaviorTrends: [],
      },
      dataQualityNotes: "",
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

// Slices a section's real text out of the source document using the model's
// start/end anchors, rather than trusting the model to reproduce the text
// itself. Returns null if either anchor can't be located verbatim.
function sliceSection(oldDocText, startAnchor, endAnchor) {
  if (!oldDocText || !startAnchor || !endAnchor) return null;
  const startIdx = oldDocText.indexOf(startAnchor);
  if (startIdx === -1) return null;
  // Search for endAnchor from startIdx (not startIdx + startAnchor.length) so
  // short sections where the anchors overlap or are identical still resolve.
  const endMatchIdx = oldDocText.indexOf(endAnchor, startIdx);
  if (endMatchIdx === -1) return null;
  const endIdx = endMatchIdx + endAnchor.length;
  return oldDocText.slice(startIdx, endIdx);
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

  const { oldDocText, newDocText, libraryContext, brainDump } = req.body || {};

  if (!oldDocText && !newDocText && !libraryContext && !brainDump)
    return res
      .status(400)
      .json({ error: "Provide at least one of: a document upload, saved goals, or clinical notes." });

  const inputText = buildInputString({ oldDocText, newDocText, libraryContext, brainDump });

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
        max_tokens: 12000,
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

    if (data.stop_reason === "max_tokens") {
      console.error("[generate-reauth-analyze] response truncated: stop_reason=max_tokens");
      return res
        .status(502)
        .json({ error: "The document was too large for the AI to fully analyze in one pass. Try a shorter document or contact support." });
    }

    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    const parsed = parseModelJSON(text);

    // The model returns lightweight start/end anchors per section rather than
    // reproducing the full section text (which previously scaled with document
    // size and could blow the token budget on long documents). Slice the real
    // text out of oldDocText ourselves so the response shape to the client is
    // unchanged.
    const dataQualityIssues = [];
    const templateSections = (parsed.templateSections || []).map((s) => {
      const sliced = sliceSection(oldDocText, s.startAnchor, s.endAnchor);
      if (sliced === null) {
        dataQualityIssues.push(
          `Could not locate the exact source text for section "${s.heading || s.id}" — flagged for manual review.`
        );
      }
      return {
        id: s.id,
        heading: s.heading,
        type: s.type,
        originalText: sliced === null ? "" : sliced,
      };
    });
    const dataQualityNotes = [parsed.dataQualityNotes || "", ...dataQualityIssues]
      .filter(Boolean)
      .join(" ");

    return res.status(200).json({
      sourceType: parsed.sourceType || "insufficient_data",
      templateSections,
      delta: {
        goalCounts: parsed.delta?.goalCounts || { total: 0, mastered: 0, inProgress: 0, onHold: 0, discontinued: 0, new: 0 },
        goalsMastered: parsed.delta?.goalsMastered || [],
        goalsInProgress: parsed.delta?.goalsInProgress || [],
        goalsOnHold: parsed.delta?.goalsOnHold || [],
        goalsDiscontinued: parsed.delta?.goalsDiscontinued || [],
        goalsNew: parsed.delta?.goalsNew || [],
        behaviorTrends: parsed.delta?.behaviorTrends || [],
      },
      dataQualityNotes,
    });
  } catch (err) {
    console.error("[generate-reauth-analyze] handler error:", err);
    return res.status(500).json({ error: "Something went wrong analyzing the documents. Please try again." });
  }
}
