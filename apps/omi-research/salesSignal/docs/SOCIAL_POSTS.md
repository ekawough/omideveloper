# Build in Public posts

Two minimum required by lablab.ai. Post these on LinkedIn/X. Tag @AIatAMD
@lablabai @omiHQ as appropriate for each platform.

---

## Post 1 — Problem discovery / announcement (post now)

**Platform:** LinkedIn + X

**Text:**

Building something nobody asked for but 2.3M door-to-door reps need.

I've spent the last two weeks researching field sales tech and found a gap
the size of a house:

- Siro raised $75M doing text-only NLP on sales calls
- Rilla charges $4-5K/user/year and locks you into one CRM
- Neither actually HEARS how the homeowner's voice changes when the rep
  mentions price

SalesSignal is a multi-agent pipeline on AMD MI300X that:
1. Captures audio from an Omi wearable
2. Runs acoustic emotion detection (not just text sentiment)
3. Scores leads 1-10 and writes them to your CRM automatically

The big insight: "sounds good" delivered in an angry tone is a dead lead.
Text-only systems think it's positive. We catch it.

Building this for the AMD x lablab.ai hackathon. Updates incoming.

@AIatAMD @lablabai @omiHQ

#BuildInPublic #AI #SalesAI #AMD #MI300X #D2DSales

---

## Post 2 — Tech deep-dive / progress (post after pipeline works end-to-end)

**Platform:** LinkedIn + X

**Text:**

Day [X] on SalesSignal. The full pipeline works end-to-end:

Omi wearable
  -> Deepgram Nova-2 (live diarized transcript)
  -> SenseVoice (acoustic emotion per speaker, 70ms/segment)
  -> text + voice fusion (catches suppressed objections)
  -> 3 CrewAI agents on Llama 3.1 8B (AMD MI300X via vLLM)
  -> contact lands in GoHighLevel AND HubSpot

Under 5 seconds. $0.24 per conversation.

Hardest gotcha: vLLM segfaults on MI300X if you don't set
VLLM_ROCM_USE_AITER_FP4BMM=0. The MXFP4 batch matmul kernel isn't
implemented on CDNA3 yet. Cost me a full day until I found the flag.

Second hardest: Deepgram's sentiment analysis is NOT available on
their streaming endpoint. You have to run a separate batch call to
/v1/read after the conversation ends. Every tutorial online gets this
wrong.

Five models in one pipeline. Zero ChatGPT. All on AMD silicon.

Demo video dropping [date].

@AIatAMD @lablabai

#BuildInPublic #AMD #MI300X #ROCm #vLLM #CrewAI #SalesAI

---

## Post 3 — Optional, for the demo day (post on May 18-19)

**Platform:** LinkedIn + X

**Text:**

Demo day tomorrow at McEnery Convention Center, San Jose.

SalesSignal: talk into an Omi wearable. 5 seconds later, a scored lead
shows up in your CRM with a sentiment timeline showing exactly where the
conversation warmed up or cooled off.

The part I'm most proud of: built-in consent compliance. The app detects
your state via GPS, knows if it's one-party or two-party recording law,
and blocks the session until the homeowner acknowledges. Illinois gets a
full BIPA electronic consent form.

No competitor ships this. They all make it your problem.

See you tomorrow.

@AIatAMD @lablabai

#AMDChallenge #BuildInPublic #SalesAI
