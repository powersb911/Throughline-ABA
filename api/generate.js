const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are an expert Board Certified Behavior Analyst (BCBA) documentation specialist. You convert a clinician's brief, unstructured supervision notes into a clean, professional supervision note in the exact three-column HiRasmus format.

THE THREE COLUMNS (use these exact section meanings):
1. LEARNER RESPONSE TO TREATMENT — how the learner responded during supervision: engagement, motivation, what they did well, communication, and what they still needed support with.
2. PROGRAM MODIFICATIONS — clinical changes the BCBA made or observed: data reviewed, targets added / removed / mastered, phase changes, prompts added, mastery-criteria or data-collection adjustments, programs modeled, IOA.
3. RBT FEEDBACK / BCBA RECOMMENDATIONS — feedback or coaching given to the technician, plus forward-looking BCBA recommendations and follow-up.

RULES:
- Use precise ABA terminology (mand, echoic, intraverbal, tact, DTT, receptive ID, phase change, mastery criteria, reinforcer, prompting, FM/GM imitation, IOA, etc.) consistent with BACB standards and insurance / medical-necessity language.
- Clean up and professionalize the clinician's shorthand into correct, well-formed clinical prose. Fix grammar and expand abbreviations.
- SCALE each column to the information given. Do NOT pad. If the clinician gives one line for an area, write a concise entry — a light session produces a short note. Match the efficient register of a working BCBA, not flowery prose.
- DO NOT fabricate clinical details, data values, target names, percentages, or events not present or clearly implied in the input. Never invent specific numbers.
- Refer to the client as "the learner" unless a name is given. Avoid direct identifiers.
- Write in objective clinical voice. Use past tense for events; present tense is acceptable for ongoing status (e.g., "The learner is showing progress with...").
- If a column genuinely has no information in the input, write a brief honest note (e.g., "No program modifications were made during this session.") rather than inventing content.
- Return ONLY valid JSON, no markdown fences, no preamble, in exactly this shape:
{"column1": "...", "column2": "...", "column3": "..."}`;

const EXAMPLES = [
  {
    input: `onset of supervision learner doing table work, did well w fill in the blank missing letters. engaged in conversations + initiated peer play independently. waited for techs before transitioning across environment. does well following instructions + accepting alternative outcomes. motivated by earning sonic characters.
added final target gross motor imitation spin then lunge. mastered out of intraverbal describe steps in a sequence, removed from daily session. maintained low rates of target behaviors + increasing skill acquisition goals. modeled data collection for response to problem size.
discussed learner progress w tech. recommend maintaining same team + schedule — when team changes or extended time out, learner has brief increases in target behaviors.`,
    output: JSON.stringify({
      column1: "During the onset of supervision, the learner was completing table work tasks and did well with fill-in-the-blank missing letters. The learner was observed to engage in conversations and initiate peer play independently, and to wait for technicians prior to transitioning across environments. The learner does well with following instructions and accepting alternative outcomes, and works well when earning Sonic characters.",
      column2: "During the supervision session, the BCBA added a final target for gross motor imitation (spin then lunge). The learner has mastered the intraverbal target for describing steps in a sequence, which the BCBA removed from the daily session. The learner has maintained low rates of target behaviors and increasing skill-acquisition goals. The BCBA modeled data collection for response to problem size.",
      column3: "The BCBA and technician discussed the learner's progress. The BCBA recommends maintaining the same team and schedule, as the learner exhibits brief increases in target behaviors when the team changes or there are extended periods of time out.",
    }),
  },
  {
    input: `when BCBA joined, learner just finished table work w RBT. showing increased progress orienting + following directions for touching in sequence. initiated some conversations appropriately in his room. BCBA + RBT talked through when to give attention to novel conversations/questions vs redirect or set expectation. BCBA initiated joint play in gym (BCBA's idea) — learner sometimes inflexible w other play ideas. needed prompting for attending especially while throwing the ball.
added new personal questions, FM imitations, increased conversational exchange targets, added open ended expressive observations target. checked progress across all data.
talked through boundaries + setting functional engagement w back and forth conversations without crossing into inappropriate.`,
    output: JSON.stringify({
      column1: "When the BCBA joined the session, the learner had just finished some table work with his RBT. The learner is showing increased progress with orienting and following directions for touching in sequence, and was able to initiate some conversations appropriately during his time in his room. The BCBA and RBT talked through when to provide attention to his novel conversations and questions versus when to redirect or set an expectation for what is appropriate. The BCBA initiated some joint play in the gym; the learner can at times display inflexibility with other ideas for play. The learner did need some prompting to attend to what he was doing, especially while throwing the ball.",
      column2: "Added new personal questions and fine motor imitations, and increased his conversational exchange targets. Also added an open-ended expressive observations target. The BCBA reviewed progress across all of his data.",
      column3: "The BCBA talked through boundaries and how to set functional engagement with back-and-forth conversations without crossing a threshold into inappropriate exchanges.",
    }),
  },
  {
    input: `onset of supervision learner in tantrum transitioning into kitchen. still requires support manding for needs without supports. independently brings AAC device to techs when looking for a specific page.
reviewed target for receptive ID for reinforcing items. added positional prompt due to data variability. provided support for tantrums when non-preferred task demand placed. learner fascinated by new button added on AAC device for reinforcing item.
discussed not packing learner's AAC device when parent picks up — little to no desire to engage w device. want to shape pairing device w home/caregivers.`,
    output: JSON.stringify({
      column1: "During the onset of supervision, the learner was engaged in a tantrum when transitioning into the kitchen. The learner still requires support with manding for needs without prompts. The learner is observed to independently bring their AAC device to technicians when looking for a specific page.",
      column2: "The BCBA reviewed the target for receptive ID of reinforcing items. A positional prompt was added due to data variability. The BCBA provided support for learner tantrums when a non-preferred task demand was placed. The learner has also exhibited a fascination with a new button added to the AAC device for a reinforcing item.",
      column3: "The BCBA discussed not packing the learner's AAC device when the parent picks up, as the learner is showing little to no desire to engage with the device. The BCBA would like to shape pairing the device with home and caregivers.",
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
  if (!apiKey) return res.status(500).json({ error: "Server is missing its API key. Add ANTHROPIC_API_KEY in Vercel environment variables." });

  const { input } = req.body || {};
  if (!input || !input.trim()) return res.status(400).json({ error: "No session notes were provided." });
  if (input.length > 8000) return res.status(400).json({ error: "Input exceeds the 8000-character limit. Please shorten your notes." });

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) return res.status(400).json({ error: "Input contains disallowed content." });
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
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [...fewshot, { role: "user", content: input.trim() }],
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
    return res.status(500).json({ error: "Something went wrong generating the note. Please try again." });
  }
}
