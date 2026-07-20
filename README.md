# Throughline — Setup Guide

A simple tool that turns a BCBA's messy session notes into clean, structured
HiRasmus documentation — supervision notes, family engagement notes, and skill
acquisition programs. Type (or talk), hit one button, copy the result into
HiRasmus. Nothing is stored on a server — it forgets everything after each note.

---

## The simple picture

Think of it like a tiny restaurant:

- **The website** is the dining room — where your BCBAs place their order (their notes).
- **The kitchen** is the AI that cooks the order into a finished note.
- **Your API key** is like the restaurant's credit card. You can't tape it to the
  front door, or someone would steal it and run up your bill.
- So there's a **waiter** (a hidden helper) that keeps the card locked in the back,
  pays the kitchen, and brings the finished note to the table. Customers never see the card.

You set this up **once**. After that, your BCBAs just open a web link.

---

## What's in this folder

```
throughline/
├── index.html              <- Supervision notes page
├── family.html             <- Family engagement notes page
├── goals.html              <- Goal / program builder page
├── reauthorization.html    <- Reauthorization Assistant (payer summary drafting)
├── library.html            <- Locally saved notes & programs
├── vercel.json             <- Vercel config (security headers)
├── robots.txt              <- Keeps the site out of search engines
├── README.md               <- this guide
└── api/
    ├── generate.js         <- supervision-note "waiter" (holds your key)
    ├── generate-family.js  <- family-note "waiter"
    ├── generate-goals.js   <- program-builder "waiter"
    ├── generate-reauth-analyze.js  <- reauthorization Stage 1: reads & structures the documents (Sonnet)
    ├── generate-reauth-draft.js    <- reauthorization Stage 2: drafts the updated document (Opus)
    └── lib/
        └── payer-rules.js  <- per-payer drafting bias (Optum, Tricare, etc.)
```

**Reauthorization Assistant pipeline:** this feature runs two AI calls instead of one. Stage 1
(Sonnet) reads the uploaded documents, classifies whether the old one is a real previous
reauthorization to edit or just an intake assessment, extracts its section structure, and does
the mastered/in-progress/on-hold/discontinued/new goal comparison. Stage 2 (Opus — deliberately
the stronger, pricier model here since it's the accuracy-critical writing step) takes that
structured analysis and edits each section in place with minimal changes, which the page then
diffs against the original text client-side to highlight exactly what changed.

Keep this folder structure as-is. The `api/` folder is special — Vercel
automatically turns each file in it into a serverless function at `/api/<name>`.

---

## Before you start, you need two things

1. A free **Vercel** account (https://vercel.com).
2. An **Anthropic API key** (this is the "credit card" — instructions below).

---

## Step 1 — Get your API key (about 5 minutes)

1. Go to **https://console.anthropic.com**
2. Sign up or log in.
3. Add a little billing credit (Settings → Billing). Each note costs roughly a
   penny or two, so even $5 covers a lot of testing.
4. Go to **API Keys** → **Create Key**. Copy the key it gives you and paste it
   somewhere safe for a minute. It looks like `sk-ant-...`

> Treat this key like a password. Never paste it into the website code, an email,
> or a public place.

---

## Step 2 — Put the site on Vercel (about 5 minutes)

**Recommended — connect through GitHub:**

1. Push this `throughline` folder to a GitHub repository.
2. Go to **https://vercel.com**, log in, and click **Add New… → Project**.
3. Import your repository. Vercel auto-detects it as a static site with API
   functions — leave the build settings at their defaults and click **Deploy**.
4. Vercel gives you a web link like `https://throughline-aba.vercel.app`.

(You can also use the Vercel CLI: `npm i -g vercel`, then run `vercel` from this
folder. GitHub import is the simplest for a pilot.)

---

## Step 3 — Give the waiter your secret key (about 2 minutes)

This is the most important step. The site won't work until you do it.

1. In Vercel, open your new project.
2. Go to **Settings → Environment Variables**.
3. Add a variable:
   - **Key:**  `ANTHROPIC_API_KEY`
   - **Value:** paste your `sk-ant-...` key from Step 1
4. Save.
5. Go to **Deployments** and **Redeploy** the latest deployment so it picks up the
   new key. Wait about a minute.

---

## Step 4 — Test it

1. Open your Vercel link.
2. In the scratchpad, type a few rough session notes — for example:
   *"onset of supervision learner tantrumed at kitchen transition, used AAC to mand
   for food. reviewed receptive ID target, added positional prompt due to data
   variability. coached RBT on calm-down strategies during the tantrum."*
3. Click **Generate note**.
4. You should get three clean columns. Click **Copy** on each and paste into HiRasmus.

If it works — you're done. Share the link with your BCBAs.

---

## How your BCBAs use it day to day

1. Open the link (works on a laptop or phone — no login).
2. Pick the page they need: Supervision, Family Engagement, or Goal Builder.
3. Jot notes into the scratchpad as things happen — or click **Dictate** and talk.
4. Click **Generate**. Review the draft; use **Edit** on any card to fine-tune it.
5. Click **Copy** on each section and paste into the matching HiRasmus box.
6. Optionally **Save to folder** to keep a copy in the local Library (stored only
   in that browser). Close the tab and the scratchpad forgets everything.

---

## Important — for the pilot

- Keep using **"the learner"** with no real names, exactly like your current notes.
  The tool also automatically scrubs obvious identifiers (names, dates, phone
  numbers, emails, IDs) from your input before sending it — but do not rely on that
  alone. Do not put real identifiable client info through it yet.
- Saved notes in the Library live in the browser's local storage only — there is no
  server database. Clearing the browser clears the Library.
- Before any real-world clinical use with identifiable info, you'll need a signed
  BAA (Business Associate Agreement) with Anthropic and proper infrastructure.
  That's a later step, not a pilot step.
- The **Reauthorization Assistant** accepts PDF uploads (treatment plans, assessment
  reports) that can contain real client identifiers baked into the file itself —
  unlike the scratchpad, these can't be hand-typed as "the learner." It reads and
  redacts likely identifiers **in the browser** before sending anything to the AI,
  and shows you the redacted text to review/edit first — but that scrubbing is
  automated and not perfect. Use fictional/de-identified test PDFs only until you
  have a signed BAA.

---

## Making it smarter over time

The tool does **not** learn on its own — and that's on purpose (it forgets everything
for privacy). It gets better when you give it more great example notes.

To add examples: open the relevant function in `api/` (e.g. `api/generate.js`), find
the `EXAMPLES` list near the top, and add another `{ input: ..., output: ... }` pair
following the same pattern. Then redeploy. More good examples = more consistent,
on-style notes.

You can also switch the AI model — find the line `const MODEL = "claude-sonnet-4-6";`
at the top of each `api/` function and swap in another current Claude model id.

---

## If something goes wrong

- **"Server is missing its API key"** → You skipped Step 3, or didn't redeploy
  after adding the key. Add `ANTHROPIC_API_KEY` and redeploy.
- **"The AI service returned an error"** → Your key may be wrong, or you're out of
  billing credit. Check both at console.anthropic.com.
- **The Dictate button is greyed out** → That browser doesn't support voice. Chrome
  works best. Typing always works.
- **Nothing happens on Generate** → In Vercel, open your project → **Logs** and look
  for errors from the `/api/generate` function. The functions log a clear
  `[generate] handler error:` line when something fails server-side.
