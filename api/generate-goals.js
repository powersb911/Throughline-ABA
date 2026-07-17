const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are an expert Board Certified Behavior Analyst (BCBA) documentation specialist. You generate complete, clinically accurate ABA goal write-ups for use in HiRasmus.

Given structured input describing a skill area, generate a complete goal with exactly 9 sections.

━━━ SECTION SPECIFICATIONS ━━━

OBJECTIVE
A complete measurable goal statement. Standard format: "Given [antecedent conditions], the learner will [target behavior] for at least [X]% of opportunities across [N] consecutive sessions." Adapt for NET goals (e.g., "During natural environment activities, the learner will..."). Include response topography when relevant (vocal response, pointing, placing, etc.). Exactly ONE mastery threshold — never blend two criteria into one sentence.

BASELINE
A clinical paragraph describing the learner's current performance level, drawn from the BASELINE input. Clean up and professionalize the clinician's raw notes into a well-formed paragraph — do not invent performance details that weren't provided. If CURRENT PROMPT LEVEL is specified and the BASELINE text does not already describe the learner's current prompt dependency, incorporate it naturally (e.g., "...generally requiring a gestural prompt to complete the response."). Do not restate the prompt level if the baseline text already conveys it — never say the same thing twice. If no baseline was given, write: "Baseline data not yet documented. The treating BCBA should record the learner's current performance level for this skill prior to implementation." Never fabricate specific percentages or session counts that weren't supplied.

DATA COLLECTION METHOD
Two parts, in this order:
1. A short paragraph describing how the specified method is applied to this specific skill and how the score/measure is calculated. Adapt the description to the selected method:
   • Trial-by-Trial (Percent Correct): score each discrete trial as correct or incorrect; percent correct = correct trials ÷ total trials × 100.
   • Frequency / Event Recording: tally each occurrence of the target response across the observation period.
   • Rate (Frequency ÷ Time): tally occurrences and divide by total observation time (e.g., responses per minute).
   • Duration Recording: record the length of time the response/behavior occurs, from onset to offset.
   • Latency Recording: record the time elapsed between the SD and the onset of the response.
   • Task Analysis (% Steps Independent): score each step of the chained task as independent or prompted; percent = independent steps ÷ total steps × 100.
   • Whole Interval Recording: divide the observation period into equal intervals; score an interval only if the behavior occurs for the entire interval.
   • Partial Interval Recording: divide the observation period into equal intervals; score an interval if the behavior occurs at any point during it.
   • Momentary Time Sampling: score whether the behavior is occurring at the exact moment each interval ends.
   • Permanent Product Recording: score the tangible outcome/result left behind by the behavior after it occurs.
2. Exactly two scoring category definitions:
   Independent (+): precise behavioral definition of what constitutes a correct independent response, including response latency (typically within 5 seconds of SD).
   Prompted/Incorrect (-): what counts as prompted or an incorrect response, including no response and target behaviors.

LOCATION
Match to methodology and setting preference:
• Table/DTT: "The program should be run at a table setting. Limit distractions within the environment (i.e., clear table, no extra materials out). Peers/adults engaged in tasks/activities may be included in the environment (i.e., learner does not have to be the only learner present) to provide a naturalistic setting. Learner should be standing or sitting at the table attending to the task with their body and attention oriented towards the table. Learner should be in HRE (happy, relaxed, engaged) before the SD is presented. If learner prefers to work on the floor, prompt functional communication and honor the request."
• NET/Throughout session: "The program should be run throughout the session in each room the learner is in, when applicable."
• Multiple environments (generalization): "The program should be run across learning environments (i.e., learning room, gross motor room, sensory rooms) to promote generalization. Peers/adults engaged in tasks/activities may be included in the environment to allow for a naturalistic setting. Learner should be in HRE before SD is placed."
• Home or Community: Adapt accordingly, noting relevant environmental features.

TEACHING PROCEDURES
Always use this exact numbered core sequence, adapting Steps 1 and 4 to the specific skill:
1. [DTT: "Ensure stimuli is ready. [Specific setup for this skill.]" | NET: "Ensure the learner is in an HRE state."]
2. Establish motivation if motivator is not established already (i.e., choice board, verbally state). Learner's schedule of reinforcement will be indicated in the team communication log.
3. Gain learner's attention (i.e., stating name, making a silly noise) and wait for the body to orient towards speaker to demonstrate attending. Do not present SD until attention is attained.
4. Deliver SD. [Add task-specific detail: how to present array, expected response mode, any special instructions for this skill.]
5. If learner responds correctly, deliver verbal specific praise (i.e., "[specific, skill-appropriate praise example]"). See team communication log for schedule of reinforcement.
6. If learner engages in target behavior, follow BIP protocol and terminate trial.
7. If learner does not respond after five seconds of the delivery of the SD or errors, utilize the prompting procedure below.
8. Record data.

SD
For RECEPTIVE IDENTIFICATION tasks (DTT — domain: "Receptive Identification"): the VERBAL instruction IS the primary SD. The array is the context/antecedent; the spoken instruction controls the response. Present the array first, then deliver the verbal SD. Vary the phrasing across trials to promote generalization and prevent rote responding (e.g., "Touch the ___", "Hand me the ___", "Find the ___", "Give me the one that ___", "Where's the ___?"). For feature/function/class SDs, vary the wording so the learner responds to the concept, not a fixed phrase. Always note that array positions must be rotated across trials to prevent position bias.
For MATCHING/SORTING/IMITATION tasks (DTT): the primary antecedent is NON-VERBAL — the act of placing or handing the stimulus to the learner. Lead with this non-verbal SD. Include only 1–2 brief verbal initiating cues (e.g., "Match", "Sort it") for task onset, then note that mass trials may use the non-verbal SD alone after initial verbal instruction. Do NOT generate a list of varied verbal phrases as the primary SD for these task types.
For VERBAL/LANGUAGE tasks (manding, tacting, intraverbal, etc.) and NET goals: use "(Vary)" prefix and provide 4–8 varied example SDs that promote generalization and prevent rote responding.
For naturally occurring antecedents (manding, functional communication): describe the antecedent condition instead of discrete SDs.

MATERIALS
For DTT goals with physical stimuli: list specific materials and append "data sheet, token board, stoplight visual, help cards" unless otherwise indicated. For NET or vocal goals: write "None or naturally occurring materials, such as [context-appropriate examples]." Write "N/A" only when truly no materials are required.

PROMPTING PROCEDURE
Two parts, in this order, under one section:
1. "Prompting Hierarchy (Least-to-Most):" followed by a bulleted list with parenthetical description and example for each prompt level.
   • Physical/receptive/matching/sorting/imitation tasks: Gestural → Partial physical → Full physical
   • Vocal/verbal tasks: Gestural → Partial verbal → Full verbal
   • Mixed/complex: Gestural → Indirect verbal → Partial verbal → Model → Full verbal (include levels appropriate to skill)
   End this part with: "*No prompting in probe."
2. The error-correction procedure, beginning with "*Do not record data in error correction process." then numbered steps (adapt steps 2-4 based on whether the goal is physical/DTT or verbal/NET):
   1. Give a time delay of five seconds before implementing prompting procedure.
   2. Remove [array/stimuli] without using corrective language (i.e., "No, that's wrong.") [For verbal goals: "If learner responds incorrectly, do not give negative feedback (i.e., 'No, that's wrong.')"]
   3. Re-present [array/stimuli] in a different order. [For verbal goals: "Re-gain attention and re-present SD."]
   4. Gain learner's attention (i.e., calling name, making silly noise). [Omit or merge with Step 3 for verbal goals]
   5. Re-deliver SD with least intrusive prompt (i.e., [name the specific prompt with example]).
   6. If learner responds correctly, provide neutral behavior specific praise (i.e., "[example]."). Go to step [N].
   7. If learner responds incorrectly with prompt, provide a more intrusive prompt (i.e., [prompt escalation example]). Repeat until achieving a correct response.
   8. Run two to three quick maintenance trials (i.e., [examples]). [Include for DTT/physical goals; omit or adapt for verbal NET goals]
   9. Re-present trial with prompt removed.
   10. Terminate trial after attempting to prompt three times with most invasive prompt level and no successful responses. Return to program at a later time in session, if possible.
   End with: "*If learner demonstrates assent withdrawal, stop prompting procedure and wait until they are in HRE (happy, relaxed, engaged) to continue."

RATIONALE
2-4 sentences of clinical justification: why this goal is appropriate now, how it builds on the learner's current skill repertoire (referencing the baseline), and its functional/developmental significance. No filler.

━━━ RULES ━━━
- ADDITIONAL NOTES override structured fields when there is any conflict. If ADDITIONAL NOTES specify a mastery threshold, accuracy percentage, or session/trial count, use ONLY those values in the OBJECTIVE — do NOT blend them with the MASTERY CRITERIA field. The notes represent the clinician's explicit specification and always win.
- Do NOT repeat or combine conflicting criteria in one sentence. A goal statement must have exactly ONE mastery threshold. Choose the one from ADDITIONAL NOTES if provided; otherwise use MASTERY CRITERIA.
- When ADDITIONAL NOTES contain a behavioral definition, operational criterion, or specific targets, integrate them precisely into the relevant section rather than appending them as an addendum to a separately generated statement. Never output the same information twice in one section.
- Use precise ABA/VB terminology throughout: SD, HRE, DTT, NET, BIP, mand, tact, intraverbal, echoic, FM imitation, GM imitation, least-to-most, probe, mass trial, AO3, IOA, etc.
- Refer to the client as "the learner" or "the client" consistently throughout all sections.
- Scale detail to the skill — complex skills get richer SD variation and more detailed procedure notes.
- Do NOT fabricate specific performance data, session counts, or client details not provided in the input.
- Match the efficient, procedural register of a working BCBA. No filler, no padding, no flowery prose.
- Return ONLY valid JSON with no markdown fences, no preamble, in EXACTLY this shape:
{"objective":"...","baseline":"...","dataCollectionMethod":"...","location":"...","teachingProcedures":"...","sd":"...","materials":"...","promptingProcedure":"...","rationale":"..."}`;

function buildInputString(fields) {
  const notes = fields.notes || "None";
  const masteryCriteria = fields.masteryCriteria || "80% across 3 consecutive sessions";
  const masteryLine = notes !== "None"
    ? `MASTERY CRITERIA (default — override with any criteria specified in ADDITIONAL NOTES): ${masteryCriteria}`
    : `MASTERY CRITERIA: ${masteryCriteria}`;

  return [
    `DOMAIN: ${fields.domain}`,
    `TARGET SKILL: ${fields.skillArea}`,
    `METHODOLOGY: ${fields.methodology || "Not specified"}`,
    `BASELINE (current performance): ${fields.baseline || "Not provided"}`,
    `CURRENT PROMPT LEVEL: ${fields.currentPromptLevel || "Not specified"}`,
    `LOCATION PREFERENCE: ${fields.location || "Not specified"}`,
    masteryLine,
    `PROMPT HIERARCHY TYPE: ${fields.promptType || "Not specified"}`,
    `DATA COLLECTION METHOD: ${fields.dataCollectionMethod || "Trial-by-Trial (Percent Correct)"}`,
    `MATERIALS: ${fields.materials || "Not specified"}`,
    `ASSESSMENT REFERENCE: ${fields.assessment || "N/A"}`,
    `ADDITIONAL NOTES (takes priority over fields above when there is any conflict): ${notes}`,
  ].join("\n");
}

const EXAMPLES = [
  {
    input: buildInputString({
      domain: "Matching & Sorting",
      skillArea: "Identical Matching",
      methodology: "DTT",
      baseline: "Learner inconsistently matches identical items, requiring physical prompting on the majority of trials. Independent matching has not yet been demonstrated across a 3-item field.",
      currentPromptLevel: "Full Physical",
      location: "Clinic/Table",
      masteryCriteria: "80% across 3 consecutive sessions",
      promptType: "Physical (Least-to-Most): Gestural → Partial Physical → Full Physical",
      dataCollectionMethod: "Trial-by-Trial (Percent Correct)",
      materials: "Matching stimuli (AO3)",
      assessment: "N/A",
      notes: "If running mass trials, a non-verbal SD (handing the card to the learner) after initiating the task with a verbal SD can be used.",
    }),
    output: JSON.stringify({
      objective:
        "Given a field of 3 identical stimuli (AO3), the learner will independently and accurately match an item by placing the card on top of its identical counterpart for at least 80% of opportunities across 3 consecutive sessions.",
      baseline:
        "The learner currently matches identical items inconsistently and requires physical prompting on the majority of trials. Independent, unprompted matching has not yet been demonstrated across a 3-item field.",
      dataCollectionMethod:
        "Trial-by-trial percent correct data will be recorded for each matching opportunity presented within a session. Percent correct is calculated by dividing the number of independent correct trials by the total trials presented and multiplying by 100.\n\nIndependent (+): Learner independently and accurately matches the item by placing the card on top of the matching card within 5 seconds of the SD, without any prompting.\nPrompted/Incorrect (-): Learner responds incorrectly, does not respond within 5 seconds, or engages in target behaviors.",
      location:
        "The program should be run at a table setting. Limit distractions within the environment (i.e., clear table, no extra materials out). Peers/adults engaged in tasks/activities may be included in the environment (i.e., learner does not have to be the only learner present) to provide a naturalistic setting. Learner should be standing or sitting at the table attending to the task with their body and attention oriented towards the table. Learner should be in HRE (happy, relaxed, engaged) before the SD is presented. If learner prefers to work on the floor, prompt functional communication and honor the request.",
      teachingProcedures:
        '1. Ensure stimuli is ready. Set up the array to the appropriate number and have the matching card ready.\n2. Establish motivation if motivator is not established already (i.e., choice board, verbally state). Learner\'s schedule of reinforcement will be indicated in the team communication log.\n3. Gain learner\'s attention (i.e., stating name, making a silly noise) and wait for the body to orient towards speaker to demonstrate attending. Do not present SD until attention is attained.\n4. Deliver SD.\n5. If learner responds correctly, deliver verbal specific praise (i.e., "Great job matching!"). See team communication log for schedule of reinforcement.\n6. If learner engages in target behavior, follow BIP protocol and terminate trial.\n7. If learner does not respond after five seconds of the delivery of the SD or errors, utilize the prompting procedure below.\n8. Record data.',
      sd: '(Vary) "Match", "Put the same", "Find the pair!"\n\nHand the card to the learner along with the verbal SD. If running mass trials, a non-verbal SD (handing the card to the learner) may be used after the first verbal SD.',
      materials: "Matching stimuli (AO3); data sheet, token board, stoplight visual, help cards.",
      promptingProcedure:
        'Prompting Hierarchy (Least-to-Most):\n\n• Gestural (i.e., point to the correct matching icon)\n• Partial physical (i.e., slightly guide hand to matching icon)\n• Full physical (i.e., gently guide hand to matching icon)\n\n*No prompting in probe.\n\n*Do not record data in error correction process.\n\n1. Give a time delay of five seconds before implementing prompting procedure.\n2. Remove array without using corrective language (i.e., "No, that\'s wrong.")\n3. Re-present array in a different order.\n4. Gain learner\'s attention (i.e., calling name, making silly noise).\n5. Re-deliver SD with least intrusive prompt (i.e., gestural — point to the correct matching icon).\n6. If learner responds correctly, provide neutral behavior specific praise (i.e., "Yes, that\'s matching."). Go to step 7.\n7. If learner responds incorrectly with prompt, provide a more intrusive prompt (i.e., gestural → partial physical). Repeat until achieving a correct response.\n8. Run two to three quick maintenance trials (i.e., clap hands, stomp feet).\n9. Re-present trial with prompt removed.\n10. Terminate trial after attempting to prompt three times with most invasive prompt level and no successful responses. Return to program at a later time in session, if possible.\n\n*If learner demonstrates assent withdrawal, stop prompting procedure and wait until they are in HRE (happy, relaxed, engaged) to continue.',
      rationale:
        "Identical matching is a foundational visual discrimination skill that underlies later academic and language tasks, including non-identical matching, sorting, and letter/number identification. Given the learner's emerging but inconsistent performance on this skill, independent identical matching represents an achievable and clinically meaningful next step toward reducing reliance on physical prompting.",
    }),
  },
  {
    input: buildInputString({
      domain: "Matching & Sorting",
      skillArea: "Sorting by Feature",
      methodology: "DTT",
      baseline: "No baseline data provided for this skill.",
      currentPromptLevel: "",
      location: "Clinic/Table",
      masteryCriteria: "80% across 3 consecutive sessions",
      promptType: "Physical (Least-to-Most): Gestural → Partial Physical → Full Physical",
      dataCollectionMethod: "Trial-by-Trial (Percent Correct)",
      materials: "Sorting mats/containers; non-identical 2D or 3D stimuli",
      assessment: "N/A",
      notes:
        "Start with 2 categories (e.g., Feathers vs. Wheels). Graduate to 3-4 as mastery is achieved. Feature categories: Feathers (bird, duck, parrot, owl, turkey, peacock), Wheels (car, bicycle, truck, stroller), Buttons (dress shirt, coat, TV remote, elevator panel), Pockets (jeans, hoodie, backpack, jacket).",
    }),
    output: JSON.stringify({
      objective:
        "Given an array of sorting mats and non-identical 2D or 3D stimuli, the learner will independently sort each item into the correct feature category for at least 80% of opportunities across 3 consecutive sessions.",
      baseline:
        "Baseline data not yet documented. The treating BCBA should record the learner's current performance level for this skill prior to implementation.",
      dataCollectionMethod:
        "Trial-by-trial percent correct data will be recorded for each sorting opportunity presented within a session. Percent correct is calculated by dividing the number of independent correct trials by the total trials presented and multiplying by 100.\n\nIndependent (+): Learner independently sorts the item to the correct feature category by placing the item/card into the corresponding location within 5 seconds, without any prompting.\nPrompted/Incorrect (-): Learner responds incorrectly, does not respond, or engages in target behaviors.",
      location:
        "The program should be run at a table setting. Limit distractions within the environment (i.e., clear table, no extra materials out). Peers/adults engaged in tasks/activities may be included in the environment (i.e., learner does not have to be the only learner present) to provide a naturalistic setting. Learner should be standing or sitting at the table attending to the task with their body and attention oriented towards the table. Learner should be in HRE (happy, relaxed, engaged) before the SD is presented. If learner prefers to work on the floor, prompt functional communication and honor the request.",
      teachingProcedures:
        '1. Ensure stimuli is ready. Have the array of sorting mats/containers in front of the learner. Begin with 2 categories and graduate to 3-4 as mastery is achieved.\n2. Establish motivation if motivator is not established already (i.e., choice board, verbally state). Learner\'s schedule of reinforcement will be indicated in the team communication log.\n3. Gain learner\'s attention (i.e., stating name, making a silly noise) and wait for the body to orient towards speaker to demonstrate attending. Do not present SD until attention is attained.\n4. Deliver SD (e.g., hand the learner a picture of a duck and say: "Find the one with feathers.").\n5. If learner responds correctly, deliver verbal specific praise (i.e., "Great job sorting!"). See team communication log for schedule of reinforcement.\n6. If learner engages in target behavior, follow BIP protocol and terminate trial.\n7. If learner does not respond after five seconds of the delivery of the SD or errors, utilize the prompting procedure below.\n8. Record data.',
      sd: '(Vary the verbal instruction to promote generalization):\n• "Find the one with [feature]."\n• "Put with the ones that have [feature]."\n• "Sort by what they have."\n• "Where does this one go?"',
      materials:
        "Sorting mats/containers (a visual representing a pocket); non-identical 2D images or 3D items representing target feature categories (e.g., Feathers: bird, duck, parrot, owl, turkey, peacock, craft feather; Wheels: car, bicycle, truck, stroller; Buttons: dress shirt, coat, TV remote, elevator panel; Pockets: jeans, hoodie, backpack, jacket); data sheet, token board, stoplight visual, help cards.",
      promptingProcedure:
        'Prompting Hierarchy (Least-to-Most):\n\n• Gestural (i.e., point to the correct sorting mat/container)\n• Partial physical (i.e., slightly guide hand towards the correct mat/container)\n• Full physical (i.e., gently guide hand to correct mat/container)\n\n*No prompting in probe.\n\n*Do not record data in error correction process.\n\n1. Give a time delay of five seconds before implementing prompting procedure.\n2. Remove incorrect item/icon without using corrective language (i.e., "No, that\'s wrong.")\n3. Re-present array of mats/containers in a different order.\n4. Gain learner\'s attention (i.e., calling name, making silly noise).\n5. Re-deliver SD with least intrusive prompt (i.e., gestural — point to the correct mat/container).\n6. If learner responds correctly, provide neutral behavior specific praise (i.e., "Yes, that belongs there."). Go to step 8.\n7. If learner responds incorrectly with prompt, provide a more intrusive prompt (i.e., gestural → partial physical). Repeat until achieving a correct response.\n8. Finish the sorting activity, ensuring to remove prompt after each piece.\n9. Terminate trial after attempting to prompt three times with most invasive prompt level and no successful responses. Return to program at a later time in session, if possible.\n\n*If learner demonstrates assent withdrawal, stop prompting procedure and wait until they are in HRE (happy, relaxed, engaged) to continue.',
      rationale:
        "Sorting by feature builds directly on identical matching and non-identical matching by requiring the learner to attend to a shared attribute across dissimilar exemplars, a prerequisite for categorization and later academic concepts. Establishing this skill supports generalized responding to novel category members rather than rote item pairing.",
    }),
  },
  {
    input: buildInputString({
      domain: "Receptive Identification",
      skillArea: "Receptive ID by Feature (e.g., \"Touch the one with wheels\", \"Hand me the furry one\")",
      methodology: "DTT",
      baseline: "Learner accurately identifies items by name across a field of 3 but does not yet respond to feature-based instructions; touches items at chance level when asked to identify by feature.",
      currentPromptLevel: "Full Physical",
      location: "Clinic/Table",
      masteryCriteria: "80% across 3 consecutive sessions",
      promptType: "Physical (Least-to-Most): Gestural → Partial Physical → Full Physical",
      dataCollectionMethod: "Trial-by-Trial (Percent Correct)",
      materials: "3D objects or picture cards (AO3)",
      assessment: "ABLLS-R",
      notes: "Target features: has wheels, is furry, can fly. Array of 3 items. Rotate array positions across trials to prevent position bias. Response topography: learner touches or hands the item to the therapist.",
    }),
    output: JSON.stringify({
      objective:
        "Given a field of 3 stimuli (AO3), the learner will independently identify items by their feature (e.g., has wheels, is furry, can fly) by touching or handing the correct item when the feature is named for at least 80% of opportunities across 3 consecutive sessions.",
      baseline:
        "The learner currently identifies items by name accurately across a field of 3 but does not yet respond to feature-based instructions, touching items at approximately chance level when asked to identify by feature and generally requiring a full physical prompt to produce a correct response.",
      dataCollectionMethod:
        "Trial-by-trial percent correct data will be recorded for each feature-identification opportunity presented within a session. Percent correct is calculated by dividing the number of independent correct trials by the total trials presented and multiplying by 100.\n\nIndependent (+): Learner independently touches or hands the correct item (the one matching the stated feature) within 5 seconds of the verbal SD, without any prompting.\nPrompted/Incorrect (-): Learner touches or hands an incorrect item, does not respond within 5 seconds, requires any level of prompting, or engages in target behaviors.",
      location:
        "The program should be run at a table setting. Limit distractions within the environment (i.e., clear table, no extra materials out). Peers/adults engaged in tasks/activities may be included in the environment (i.e., learner does not have to be the only learner present) to provide a naturalistic setting. Learner should be standing or sitting at the table attending to the task with their body and attention oriented towards the table. Learner should be in HRE (happy, relaxed, engaged) before the SD is presented. If learner prefers to work on the floor, prompt functional communication and honor the request.",
      teachingProcedures:
        '1. Ensure stimuli is ready. Place the array of 3 items on the table in front of the learner. Rotate item positions across trials.\n2. Establish motivation if motivator is not established already (i.e., choice board, verbally state). Learner\'s schedule of reinforcement will be indicated in the team communication log.\n3. Gain learner\'s attention (i.e., stating name, making a silly noise) and wait for the body to orient towards speaker to demonstrate attending. Do not present SD until attention is attained.\n4. Deliver the verbal SD (e.g., "Touch the one with wheels."). The verbal instruction is the discriminative stimulus — vary phrasing across trials. Do not provide any gestural cues concurrent with the SD.\n5. If learner responds correctly, deliver verbal specific praise (i.e., "Yes! That one has wheels — great listening!"). See team communication log for schedule of reinforcement.\n6. If learner engages in target behavior, follow BIP protocol and terminate trial.\n7. If learner does not respond after five seconds of the delivery of the SD or errors, utilize the prompting procedure below.\n8. Record data.',
      sd: '(Vary phrasing across trials to ensure responding is controlled by the feature concept, not a fixed phrase.)\n• "Touch the one with wheels."\n• "Hand me the furry one."\n• "Find the one that can fly."\n• "Give me the one that has wheels."\n• "Where\'s the one that\'s furry?"\n• "Touch the one that flies."\n\nPresent the array of 3 items before delivering the verbal SD. Rotate the position of each item in the array across every trial to prevent position bias.',
      materials:
        "3D objects or picture cards representing target and distractor items (AO3); data sheet, token board, stoplight visual, help cards.",
      promptingProcedure:
        'Prompting Hierarchy (Least-to-Most):\n\n• Gestural (i.e., point toward the correct item without touching it)\n• Partial physical (i.e., lightly guide hand toward the correct item)\n• Full physical (i.e., gently guide hand to touch or pick up the correct item)\n\n*No prompting in probe.\n\n*Do not record data in error correction process.\n\n1. Give a time delay of five seconds before implementing prompting procedure.\n2. Remove array without using corrective language (i.e., "No, that\'s wrong.")\n3. Re-present array in a different position order.\n4. Gain learner\'s attention (i.e., calling name, making silly noise).\n5. Re-deliver SD with least intrusive prompt (i.e., gestural — point toward the correct item).\n6. If learner responds correctly, provide neutral behavior specific praise (i.e., "Yes, that one has wheels."). Go to step 8.\n7. If learner responds incorrectly with prompt, provide a more intrusive prompt (i.e., gestural → partial physical). Repeat until achieving a correct response.\n8. Run two to three quick maintenance trials (i.e., previously mastered receptive targets).\n9. Re-present trial with prompt removed.\n10. Terminate trial after attempting to prompt three times with most invasive prompt level and no successful responses. Return to program at a later time in session, if possible.\n\n*If learner demonstrates assent withdrawal, stop prompting procedure and wait until they are in HRE (happy, relaxed, engaged) to continue.',
      rationale:
        "Feature-based receptive identification requires the learner to respond to a described attribute rather than a rote item name, a more abstract and generalizable listener skill than by-name identification alone. Given the learner's strong by-name identification but chance-level feature responding, this goal targets the next logical skill in the receptive identification hierarchy per ABLLS-R sequencing.",
    }),
  },
  {
    input: buildInputString({
      domain: "Communication & Language",
      skillArea: "Intraverbal (Conversational)",
      methodology: "NET",
      baseline: "Learner answers concrete Wh- questions (what, where) but does not yet reliably answer possession/pronoun-referent questions; when asked 'whose is this,' learner typically states the item name instead of a pronoun.",
      currentPromptLevel: "",
      location: "Throughout Session",
      masteryCriteria: "80% across 5 consecutive sessions",
      promptType: "Verbal (Least-to-Most): Gestural → Partial Verbal → Full Verbal",
      dataCollectionMethod: "Frequency / Event Recording",
      materials: "None or naturally occurring",
      assessment: "VB-MAPP",
      notes: "Pronoun referents — learner will answer Wh- questions using the correct pronoun (mine, yours, his, hers, theirs). Example SD: 'Whose ___ is this?'",
    }),
    output: JSON.stringify({
      objective:
        'During natural environment activities, the learner will identify pronoun referents (e.g., mine, yours, his, hers, theirs) by answering Wh- questions such as "Whose ___ is this?" with the correct pronoun for at least 80% of opportunities across 5 consecutive sessions.',
      baseline:
        "The learner currently answers concrete Wh- questions (what, where) but does not yet reliably answer possession/pronoun-referent questions. When asked \"whose is this,\" the learner typically states the item name rather than the correct pronoun.",
      dataCollectionMethod:
        "Frequency/event recording will be used to tally each naturally occurring opportunity to respond to a pronoun-referent question across the session, scored as correct or incorrect. Percent correct is calculated by dividing correct responses by total opportunities and multiplying by 100.\n\nIndependent (+): Learner correctly identifies the pronoun referent by responding with the appropriate pronoun within 5 seconds of the SD, without any level of prompting.\nPrompted/Incorrect (-): Learner responds incorrectly, does not respond within 5 seconds, requires any level of prompting, or engages in target behaviors.",
      location:
        "The program should be run throughout the session in each room the learner is in, when applicable.",
      teachingProcedures:
        '1. Ensure the learner is in an HRE state.\n2. Establish motivation if motivator is not established already (i.e., choice board, verbally state). Learner\'s schedule of reinforcement will be indicated in the team communication log.\n3. Gain learner\'s attention (i.e., stating name, making a silly noise) and wait for the body to orient towards speaker to demonstrate attending. Do not present SD until attention is attained.\n4. Deliver SD during a naturally occurring opportunity (e.g., hold up an item belonging to a peer and ask, "Whose is this?").\n5. If the learner responds correctly, deliver verbal specific praise (i.e., "Great job answering my question!"). See team communication log for schedule of reinforcement.\n6. If the learner engages in target behavior, follow BIP protocol and terminate trial.\n7. If the learner does not respond after five seconds of the delivery of the SD or errors, utilize the prompting procedure below.\n8. Record data.',
      sd: '(Vary)\n• "Who does this belong to?"\n• "Whose is this?"\n• "Whose turn is it?"\n• "What is [person\'s name] doing?"\n• "Whose [item] is that?"',
      materials:
        "None or naturally occurring materials, such as toys, clothing items, or objects belonging to different people in the environment.",
      promptingProcedure:
        'Prompting Hierarchy (Least-to-Most):\n\n• Gestural (i.e., point to the correct person or object)\n• Partial verbal (i.e., provide the first syllable of the correct pronoun — e.g., "m-" for "mine")\n• Full verbal (i.e., state the correct pronoun for the learner)\n\n*No prompting in probe.\n\n*Do not record data in error correction process.\n\n1. Give a time delay of five seconds before implementing prompting procedure.\n2. If learner responds incorrectly, do not give negative feedback (i.e., "No, that\'s wrong.").\n3. Re-gain attention and re-present SD.\n4. Provide the least intrusive prompt (i.e., gestural — point to the correct person or object).\n5. If learner emits correct response, provide neutral behavior specific praise (i.e., "Yes, that belongs to [person]."). Go to step 7.\n6. If learner still does not emit correct response, use a more intrusive prompt (i.e., partial verbal → full verbal). Repeat until achieving a correct response.\n7. Run two to three quick maintenance trials (i.e., clap hands, stomp feet).\n8. Re-present trial with prompt removed.\n9. Terminate trial after attempting to prompt three times with most invasive prompt level and no successful responses. Return to program at a later time in session, if possible.\n\n*If learner demonstrates assent withdrawal, stop prompting procedure and wait until they are in HRE (happy, relaxed, engaged) to continue.',
      rationale:
        "Pronoun-referent intraverbals extend the learner's existing concrete Wh- question repertoire into more abstract, perspective-dependent language, a skill required for conversational reciprocity and classroom instruction-following (e.g., 'get your backpack'). This goal is a natural next step given the learner's established Wh- question responding and VB-MAPP language level.",
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

  const { domain, skillArea, methodology, baseline, currentPromptLevel, location, masteryCriteria, promptType, dataCollectionMethod, materials, assessment, notes } =
    req.body || {};

  if (!domain || !skillArea)
    return res.status(400).json({ error: "Goal domain and target skill are required." });

  const inputText = buildInputString({
    domain,
    skillArea,
    methodology,
    baseline,
    currentPromptLevel,
    location,
    masteryCriteria,
    promptType,
    dataCollectionMethod,
    materials,
    assessment,
    notes,
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
        max_tokens: 3000,
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
      domain: skillArea ? `${domain} — ${skillArea}` : domain,
      objective: parsed.objective || "",
      baseline: parsed.baseline || "",
      dataCollectionMethod: parsed.dataCollectionMethod || "",
      location: parsed.location || "",
      teachingProcedures: parsed.teachingProcedures || "",
      sd: parsed.sd || "",
      materials: parsed.materials || "",
      promptingProcedure: parsed.promptingProcedure || "",
      rationale: parsed.rationale || "",
    });
  } catch (err) {
    console.error("[generate-goals] handler error:", err);
    return res.status(500).json({ error: "Something went wrong generating the program. Please try again." });
  }
}
