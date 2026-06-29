const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are an expert Board Certified Behavior Analyst (BCBA) documentation specialist. You convert a clinician's brief, unstructured notes from a family engagement / caregiver training meeting into a clean, professional note in the exact three-field HiRasmus format.

THE THREE FIELDS (use these exact section meanings):
1. PURPOSE OF MEETING — why the BCBA and caregiver(s) met, and the concerns the caregiver brought into the meeting. Often states the meeting cadence (e.g., weekly or biweekly check-in) and the caregiver's incoming concerns.
2. MEETING SUMMARY — what was actually discussed during the meeting and the outcomes: progress updates shared by the caregiver and BCBA, strategies discussed, behaviors reviewed, plans talked through.
3. BCBA FOLLOW-UP — the next steps and when the next meeting will be. Usually short — frequently one to two sentences.

VOICE AND STYLE:
- Write in objective, third-person clinical prose. This is a caregiver-facing meeting note, NOT a technical supervision note — use plain, professional language and only light ABA terminology where it naturally fits (e.g., target behaviors, AAC device, generalization). Do NOT load it with jargon.
- Convert first-person shorthand ("we talked about", "mom said", "today we met") into consistent third-person ("The BCBA and the learner's mother discussed...").
- Clean up grammar, fix typos, and expand shorthand into well-formed sentences.
- Refer to the caregiver(s) using the relationship label(s) provided to you. The first caregiver listed is the primary; lead with them. If more than one caregiver is present, weave them in naturally (e.g., "the parents", "the learner's mother and father"). If a caregiver is listed as "Other (specify in note)", use the relationship the clinician names in the notes.
- Refer to the client as "the learner" unless the input clearly uses a name; avoid direct identifiers.
- Use past tense for events; present tense is acceptable for ongoing status.

RULES:
- SCALE each field to the information given. Do NOT pad. A short meeting produces a short note. Match the efficient register of a working BCBA.
- DO NOT fabricate details, concerns, strategies, dates, or events not present or clearly implied in the input. Never invent specifics.
- For the next meeting timing, use exactly what the clinician indicates (e.g., "in one week", "in two weeks", "next Friday"). Do NOT invent a specific calendar date if none is given. If no follow-up timing is given, write a brief honest next-steps sentence without inventing a date.
- If a field genuinely has no information in the input, write a brief honest note rather than inventing content.
- Return ONLY valid JSON, no markdown fences, no preamble, in exactly this shape:
{"column1": "...", "column2": "...", "column3": "..."}`;

const EXAMPLES = [
  {
    caregivers: ["Mom"],
    input: `biweekly meeting w mom. concerns - pulling at ears again, maybe another ear infection by the tubes. otherwise not many concerns, proud of progress. talked about learner getting more into AAC device, favoriting pages now + seeking out tech to get to a specific page. also brushing teeth more without target behaviors. recommend not putting device away in backpack at pickup, pair mom w device again since not interested at home + still throws it. meet in 2 weeks`,
    output: JSON.stringify({
      column1: "The BCBA and the learner's mother met as part of their biweekly meeting to discuss the learner's progress. The mother shared recent concerns about the learner pulling at her ears again, with the possibility of another ear infection around her ear tubes. Aside from this, the mother reported limited concerns and expressed that she is proud of the progress the learner is making.",
      column2: "The BCBA and the mother discussed the learner's increasing interest in using her AAC device. The learner has recently begun to favorite pages and will seek out technician support to access a specific page. The mother also discussed the learner's recent increase in her ability to brush her teeth in the absence of target behaviors.",
      column3: "The BCBA recommended that, rather than putting the device away in the backpack at pickup, the mother be paired with the device again, as the learner is not currently displaying interest in the device at home and will still throw it away from their area. The BCBA and the mother will meet again in two weeks.",
    }),
  },
  {
    caregivers: ["Dad"],
    input: `weekly check in. talked about their move, new routines, progress at home. new potty routine - taking him every hour, letting him pick which bathroom. dad said getting used to shower routine (were worried bc new house has no tub). seeing more independence at home - dressing himself, brushing teeth etc. trying a new odorless/flavorless multivitamin bc worried about diet/nutrients. talked about the profanity, replacing words w funny statements, mom + dad working on their own language too. told dad about calm down music + routine, making coping skills/self regulation fun. talked about working on road signs, road safety, stranger danger. meet next friday for home + clinical updates`,
    output: JSON.stringify({
      column1: "The purpose of the meeting was a weekly check-in with the learner's father to discuss the family's recent move, their new routines, and the progress they are seeing at home.",
      column2: "The BCBA and the father discussed the learner's new toileting routine, which involves taking the learner every hour and allowing him to choose which bathroom to use. The father shared that the learner is getting used to the new shower routine, which had been a concern because the new home does not have a tub. The father reported seeing a more independent side of the learner at home, including dressing himself and brushing his teeth. The father informed the BCBA that the family is going to try a new odorless and flavorless multivitamin, as they have concerns that the learner is not getting all of the vitamins and nutrients he needs through his diet. The BCBA and the father discussed the learner's use of profanity and the strategy of replacing those words and phrases with alternative statements, as well as the parents' efforts to adjust their own language at home. The BCBA shared information about the calm-down music and routine used in the center and the goal of making coping skills and self-regulation an enjoyable experience. The BCBA and the father also discussed working with the learner on identifying road signs, road safety, and stranger danger.",
      column3: "The BCBA and the father will meet next Friday to discuss any home and clinical updates.",
    }),
  },
  {
    caregivers: ["Caregiver"],
    input: `met to talk about progress at home + in center. caregiver concerned about learner attending school. discussed interventions to help learner become school ready. talked about learner's hesitation w group activities. caregiver talked about recent behaviors at home + trauma w different people visiting. discussed strategies to support before school. talked about how hesitation to join groups could impact learner in a school setting. meet in a week`,
    output: JSON.stringify({
      column1: "The purpose of the meeting was to discuss the learner's progress at home and in the center. The caregiver reported concerns about the learner attending school. The BCBA discussed interventions to implement to help the learner become school ready, as well as the learner's hesitation to engage in group activities.",
      column2: "The caregiver discussed the learner's progress at home and recent behaviors, including the learner's trauma associated with different people visiting. The BCBA discussed the learner's progress in the center. The caregiver and the BCBA discussed concerns about the learner attending school, and the BCBA discussed different strategies to help support the learner before attending school. The BCBA also discussed the learner's hesitation to join group activities and the impact this can have on the learner in a school setting.",
      column3: "The caregiver and the BCBA will meet in one week to discuss the learner's progress.",
    }),
  },
];

function caregiverInstruction(caregivers) {
  const list = Array.isArray(caregivers) ? caregivers.map((c) => String(c).trim()).filter(Boolean) : [];
  if (list.length === 0) return "Caregiver(s) present: not specified. Refer to the caregiver generically as \"the caregiver\".";
  if (list.length === 1) return `Caregiver(s) present: ${list[0]} (primary). Refer to this caregiver using this relationship throughout the note.`;
  const primary = list[0];
  const rest = list.slice(1).join(", ");
  return `Caregiver(s) present: ${primary} (primary), ${rest}. Lead with the primary caregiver and weave the others in naturally where the notes indicate they participated.`;
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
  if (!apiKey) return res.status(500).json({ error: "Server is missing its API key. Add ANTHROPIC_API_KEY in Vercel environment variables." });

  const { input, caregivers } = req.body || {};
  if (!input || !input.trim()) return res.status(400).json({ error: "No meeting notes were provided." });
  if (input.length > 8000) return res.status(400).json({ error: "Input exceeds the 8000-character limit. Please shorten your notes." });

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) return res.status(400).json({ error: "Input contains disallowed content." });
  }

  const fewshot = EXAMPLES.flatMap((ex) => [
    { role: "user", content: `${caregiverInstruction(ex.caregivers)}\n\nNOTES:\n${ex.input}` },
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
        max_tokens: 1800,
        system: SYSTEM_PROMPT,
        messages: [...fewshot, { role: "user", content: `${caregiverInstruction(Array.isArray(caregivers) ? caregivers : [])}\n\nNOTES:\n${input.trim()}` }],
      }),
    });

    if (!aiRes.ok) {
      const detail = await aiRes.text();
      console.error("Anthropic API error:", detail.slice(0, 500));
      return res.status(502).json({ error: "The AI service returned an error. Check your API key and billing." });
    }

    const data = await aiRes.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
    const parsed = parseModelJSON(text);
    return res.status(200).json({ column1: parsed.column1 || "", column2: parsed.column2 || "", column3: parsed.column3 || "" });
  } catch (err) {
    console.error("[generate-family] handler error:", err);
    return res.status(500).json({ error: "Something went wrong generating the note. Please try again." });
  }
}
