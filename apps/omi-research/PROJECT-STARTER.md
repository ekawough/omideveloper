# Project Starter Guide

The concrete scaffold you'll reuse across every app in [`PROJECT-BACKLOG.md`](PROJECT-BACKLOG.md). Once you set this up once, new vertical apps take a weekend.

---

## 1. One-time setup (30 minutes, do this once)

```bash
# 1. Create Next.js app
npx create-next-app@latest omi-killer --typescript --tailwind --app --no-eslint
cd omi-killer

# 2. Install core deps
npm install @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk
npm install -D @types/node

# 3. Install shadcn
npx shadcn@latest init
npx shadcn@latest add button card input textarea dialog toast

# 4. Sign up for services (free tiers cover MVP usage)
#    - Supabase (free)        → https://supabase.com
#    - Anthropic API ($5 credit) → https://console.anthropic.com
#    - Deepgram ($200 credit) → https://deepgram.com     (for transcription)
#    - Vercel (free)          → https://vercel.com       (for deploy)
#    - Stripe (free until you charge) → https://stripe.com
```

## 2. Environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...    # server-only, never expose
ANTHROPIC_API_KEY=sk-ant-...
DEEPGRAM_API_KEY=...
STRIPE_SECRET_KEY=sk_test_...
```

## 3. The universal transcription route

`app/api/transcribe/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const audio = formData.get("audio") as Blob;

  const dgRes = await fetch(
    "https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&diarize=true",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": audio.type || "audio/webm",
      },
      body: audio,
    }
  );
  const data = await dgRes.json();
  const transcript =
    data.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.transcript ||
    data.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
    "";

  return NextResponse.json({ transcript });
}
```

## 4. The universal extraction route

`app/api/extract/route.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { transcript, systemPrompt, schema } = await req.json();

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",  // cheap + fast; upgrade to sonnet 4.6 for quality
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Transcript:\n\n${transcript}\n\nReturn a JSON object matching this schema:\n${JSON.stringify(schema, null, 2)}`,
      },
    ],
  });

  const text = msg.content
    .filter((b): b is { type: "text"; text: string } => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  // Parse JSON from response (Claude often wraps it in ```json blocks)
  const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/);
  const extracted = match ? JSON.parse(match[1]) : { raw: text };

  return NextResponse.json({ extracted });
}
```

## 5. The universal record-and-upload component

`components/AudioRecorder.tsx`:

```typescript
"use client";
import { useState, useRef } from "react";

export function AudioRecorder({ onTranscript }: { onTranscript: (t: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const mediaRec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRec.current = new MediaRecorder(stream);
    chunks.current = [];
    mediaRec.current.ondataavailable = (e) => chunks.current.push(e.data);
    mediaRec.current.onstop = async () => {
      setProcessing(true);
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      const fd = new FormData();
      fd.append("audio", blob);
      const r = await fetch("/api/transcribe", { method: "POST", body: fd });
      const { transcript } = await r.json();
      onTranscript(transcript);
      setProcessing(false);
    };
    mediaRec.current.start();
    setRecording(true);
  }

  function stop() {
    mediaRec.current?.stop();
    mediaRec.current?.stream.getTracks().forEach((t) => t.stop());
    setRecording(false);
  }

  return (
    <button
      onClick={recording ? stop : start}
      disabled={processing}
      className="px-6 py-3 rounded-full bg-red-500 text-white font-semibold"
    >
      {processing ? "Processing..." : recording ? "Stop" : "Record"}
    </button>
  );
}
```

## 6. The vertical-specific part (this is what changes per app)

For each app, you only write **three things**:

### A. The system prompt (the most important line of code in your company)

```typescript
// lib/prompts/soap-note.ts
export const SOAP_NOTE_SYSTEM = `You are a clinical documentation assistant.
Given a patient interview transcript, output a SOAP note.

Rules:
- Subjective: patient's stated symptoms, history, chief complaint (direct quotes where useful)
- Objective: measurable findings mentioned in the interview (vitals, exam findings)
- Assessment: differential diagnosis based ONLY on stated findings. Never fabricate.
- Plan: treatment plan, follow-up, referrals, patient education

Use standard clinical abbreviations. If a section has no content from the transcript, write "Not documented" — do NOT invent findings.`;

export const SOAP_NOTE_SCHEMA = {
  subjective: "string",
  objective: "string",
  assessment: "string",
  plan: "string",
  confidence: "0-1 scale of how complete the documentation is",
};
```

### B. The output UI (pick from templates below)

- **Form-like output** (SOAP note, tax checklist, creative brief) → rendered sections with copy-to-clipboard button
- **Scorecard** (sales call MEDDIC, interview rubric) → radar chart + grade per dimension
- **Timeline** (1:1 journal, incident postmortem) → vertical timeline with timestamps
- **Checklist** (compliance, month-end close) → checkbox list with due dates
- **Export action** (podcast notes, Anki cards) → download .csv / .md / .pdf

### C. The one-integration that matters

Don't build a full integration suite. Build exactly **one** that matches your target user:

- SOAP notes → Epic / Athena "smart phrase" format (copy-paste)
- Deposition → PDF export with Bates numbering
- Real estate → Compass / Follow Up Boss webhook
- Sales → HubSpot / Salesforce note sync
- Student lectures → Anki .apkg export
- Podcast → YouTube chapter paste format

## 7. Payments in 10 minutes

```bash
npm install stripe
```

```typescript
// app/api/checkout/route.ts
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: "price_XXX", quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/`,
  });
  return Response.json({ url: session.url });
}
```

Set up a product in Stripe dashboard. Create a price. Paste the price ID above. Done.

## 8. Deploy

```bash
npm i -g vercel
vercel
# Follow prompts. Add env vars in Vercel dashboard.
```

You're live.

## 9. Launch checklist

- [ ] Landing page with ONE sentence describing the app ("SOAP notes from patient consultations in 60 seconds")
- [ ] Loom video (90 seconds) showing the full flow
- [ ] Single pricing tier to start ($49/mo)
- [ ] Stripe Checkout wired up
- [ ] Product Hunt post scheduled for Tuesday (best day)
- [ ] Cold DM list of 20 target users (specific names, not "hey doctors")
- [ ] Reply-ready to "can you add X?" with "yes if you buy first" or "no, not in scope"

## 10. Reality check

**Most apps fail not because the code is bad but because nobody wants it.** Before you write *any* code:

1. Find 10 target users (doctors, real-estate agents, whatever)
2. Ask them to describe their current workflow
3. Ask if they'd pay $X/month to do it faster
4. **If fewer than 3 out of 10 say yes enthusiastically, pick a different idea.**

Your 321-idea backlog exists because Omi has already done the market research for you. They wouldn't have written 321 programmatic SEO pages if there wasn't keyword demand. But demand for a keyword is not the same as demand for a paid product. Validate with humans before building.

---

## File map

- [`PROJECT-BACKLOG.md`](PROJECT-BACKLOG.md) — top 20 app ideas ranked
- [`QUICK-WINS.md`](QUICK-WINS.md) — weekend-shippable MVPs
- [`omi-crawl/OMI-VISION.md`](omi-crawl/OMI-VISION.md) — what Omi is building (so you don't accidentally rebuild it)
- [`omi-crawl/use-cases-by-vertical.md`](omi-crawl/use-cases-by-vertical.md) — full 321-idea list, categorized
- [`omi-crawl/INDEX.md`](omi-crawl/INDEX.md) — every omi.me URL we captured (for reference)
- [`omi-crawl/html/`](omi-crawl/html/) — raw HTML of every page (before Omi can change/remove them)
- [`omi-crawl/pages/`, `products/`, `collections/`, `blog-sections/`, `blog-posts/`](omi-crawl/) — cleaned markdown of every URL
