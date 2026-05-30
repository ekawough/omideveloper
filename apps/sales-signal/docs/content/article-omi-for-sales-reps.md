# Omi for Sales Reps: How I Built SalesSignal to Auto-Fill My CRM

After every door-to-door solar pitch I'd walk back to my car and run the same mental replay: what did they say about their Edison bill, how did they react when I mentioned financing, were they genuinely interested or just too polite to shut the door. The answers to those questions determine whether a follow-up call is worth making. And I was reconstructing them from memory, usually wrong.

CRM entry happened at end of day if it happened at all. By then, the detail was gone. I remembered the objections on the deals I was excited about and forgot everything on the ones I'd mentally written off — even though some of those written-off conversations had real buying signals that I'd missed because I was tired and moving fast.

I built SalesSignal to fix this. I wear an Omi device, have the conversation, walk away, and by the time I'm at the next door the CRM entry is already there — with a lead score, a sentiment timeline, and a full transcript. No manual entry. No end-of-day reconstruction.

This article is about how it works, how to use it, and what it actually captures that manual entry misses.

---

## The Problem With Sales CRM

Sales reps don't fill in CRMs because CRM entry is a second job. You finish a conversation, you want to move to the next door — not stop and type for three minutes. The reps who do fill it in are capturing the headlines. What they're not capturing is the texture: the moment the prospect softened when you mentioned their neighbor's bill savings, the specific objection they raised twice, the thing they said they needed to check with their spouse about.

That texture is what separates a coachable rep from an uncoachable one, and it's what makes a follow-up call feel personalized instead of generic. When a rep calls back and says "you mentioned you were worried about the HOA — I looked into it and your HOA guidelines allow panels on the rear roof," that's a close. When they call back and say "hey just checking in," that's spam.

The data problem runs up the org chart. Managers can't coach from bad data. If your CRM shows 40 contacts with "left voicemail" and nothing else, you can't tell your reps what's working. You need to see the conversation, or at minimum a structured summary of it.

Most D2D teams don't have that. SalesSignal gives it to them.

---

## How SalesSignal Works

The workflow from the rep's side is: wear the device, have the conversation, walk away.

Here's what's happening in the background.

The Omi device clips to your collar and streams audio continuously over Bluetooth to your phone. When a conversation starts, the audio is being captured. When it ends and you walk away, SalesSignal processes what it recorded.

The audio stream goes to my Node.js webhook server. From there I pipe it to Deepgram Nova-3 in streaming mode — this is real-time transcription, not batch processing after the fact. Deepgram charges $0.0077 per minute of audio, which is low enough that it doesn't matter at scale. The same audio stream runs through SenseVoice-Small for emotion detection — it's an open-source model from Alibaba's speech team that detects emotional valence from the voice signal itself, independent of what's being said.

The transcript and the emotion signal feed into a CrewAI agent pipeline running on Llama 3.1-8B-Instruct. The agents do three things: extract structured sales data (lead score 1-10, key objections, any commitments or next steps mentioned), build a sentiment timeline showing how the prospect's emotional state changed through the conversation, and generate a CRM-ready summary.

The output goes to GHL and HubSpot simultaneously. Contact created. Score attached. Transcript linked. Sentiment timeline embedded.

The rep doesn't touch any of it.

---

## What Gets Captured

Here's the specific data that ends up in the CRM entry.

**Lead score (1-10).** Based on interest signals, objection severity, and language patterns in the conversation. A 7+ means the rep should prioritize the follow-up. A 3 or below means there's a specific reason the conversation went cold — which is visible in the transcript.

**Sentiment timeline.** This is the one that changes how managers coach. The timeline shows whether the prospect was warming up through the conversation or pulling away. A prospect who started skeptical and ended engaged is a different follow-up than one who started polite and ended checked-out — but both might get marked "interested" if a rep is filling the CRM from memory and optimism.

**Full transcript.** Everything said, with speaker labels. Searchable. The rep can control-F for "spouse" or "HOA" and find the exact moment the objection came up.

**Key objections extracted.** Not buried in the transcript — surfaced as structured fields. If the same objection appears across 80% of your conversations, that's a training opportunity. You'll see it in the data.

**Commitments and next steps.** If the prospect said "call me Thursday" or "send me the proposal," that's flagged. These don't always make it into manual CRM entries because the rep is thinking about the next door, not transcribing verbal commitments.

These are the details that slip through every manual entry process. They're not slipping through anymore.

---

## The Consent Question

This is the first thing sales managers ask when I show them SalesSignal, and it's the right question.

Recording conversations requires consent in some states. Specifically, 13 states have two-party (or "all-party") consent requirements — meaning everyone in the conversation needs to know they're being recorded. Most articles I've seen on this topic say 15 states, but that number is wrong. Nevada's two-party requirement applies to electronic interception, not in-person conversations — for in-person recording, Nevada is one-party. Vermont has no state statute on recording consent at all. So: 13 states, not 15.

In one-party states (the majority), the rep's own consent is sufficient. The rep is a party to the conversation, so they can record it.

In two-party states, reps need to inform the prospect that the conversation is being recorded and get acknowledgment before starting.

Illinois has an additional layer: BIPA — the Biometric Information Privacy Act. Voice recordings can constitute biometric data under Illinois law, which triggers a separate disclosure and consent requirement beyond the recording statute.

SalesSignal handles this in the admin panel. The rep's location is read via GPS when they open the app. Based on that location, the app serves the correct consent script:

- One-party state: no action required from the prospect
- Two-party state: the app surfaces a consent script the rep reads aloud, with a tap-to-confirm that logs the consent with a timestamp
- Illinois: BIPA-specific disclosure is added to the two-party script

The consent flow is not optional and not skippable. That was a deliberate design decision. I spent half a day auditing state recording laws before I deployed this, and I'm not interested in reps skipping the consent step because it feels awkward. The app enforces it.

If your team operates in a specific state and you want to verify the legal configuration, the state-by-state consent logic is documented in the SalesSignal admin panel.

---

## How to Set It Up

**For individual reps:**

1. Get an Omi device — $179, or $161 with discount code **ETHANJOHNKAWOUG** (10% off) at [omi.me](https://www.omi.me?ref=ethan).
2. Install the Omi app on your phone and pair the device.
3. Find SalesSignal in the Omi App Store and install it.
4. Connect your GHL or HubSpot account in the SalesSignal settings. Both integrations are supported.
5. Set up your consent flow in the admin panel — the app will detect your state and configure the right script automatically.

From there, wear the device, have conversations, and check your CRM. The first time you see a contact auto-created with a lead score and transcript while you're still on the same block, the workflow will make sense in a way that a demo doesn't fully convey.

**For sales teams and agencies:**

Deploying SalesSignal across a team involves a few additional steps — shared admin configuration, team-level CRM routing, and rep onboarding. I handle this through Kawough Marketing. If you want SalesSignal running across your D2D team, [reach out here](https://kawoughmarketing.com) and I'll scope the deployment.

The stack runs on Railway and Supabase. There's no per-seat software fee for the base product — your costs are the Omi hardware per rep, Deepgram usage (~$0.0077/minute of conversation audio), and the compute for the agent pipeline. At typical D2D volume, the API costs run low. I can give you a real number once I know your rep count and average daily conversation volume.

---

## Results

I'm not going to fabricate statistics. SalesSignal is in active use and I have data, but I'm not going to publish "X% more closes" numbers here because the variable of using a tool is impossible to isolate from every other factor affecting close rates.

What I can tell you is what the architecture promises, and you can test whether it holds in your context.

The sentiment timeline catches deals that manual entry misses. Specifically, it catches prospects who started cool and were warming up — conversations where a less experienced rep might mentally file it as "not interested" but the sentiment data shows the last third of the conversation trending positive. Those are follow-up calls worth making. Before SalesSignal, those calls weren't getting made because the rep didn't have the data to know they were worth making.

The structured objection fields let managers run patterns across conversations. If 70% of your conversations in a specific zip code include the HOA objection, you have a training problem you can now see clearly in the data instead of inferring from rep complaints.

The lead score prioritizes the callback queue. Reps who come back from a day in the field with 30 conversations don't have time to follow up equally on all 30. The score tells them where to start.

These are the claims. Test them against your numbers.

---

## Who This Is For

**Door-to-door solar, pest control, home services, roofing, real estate.** Basically any field where the selling happens in a conversation at someone's door or property, not in front of a computer. The common thread is: rep is moving fast, can't stop to type, and the conversation details matter for follow-up.

**Sales managers who want coachable data.** If you can't tell your reps what's working because your CRM data is too thin, SalesSignal changes that. You'll have transcripts and sentiment timelines from real conversations to review in one-on-ones.

**Not for inside sales reps already at a desk.** If you're on the phone all day at a computer with a CRM open, you have better options than a wearable device. SalesSignal is built for the rep who's moving through the physical world having conversations away from any keyboard.

---

## Get Started

**Step 1:** Get your Omi device.
[Order here](https://www.omi.me?ref=ethan) — use code **ETHANJOHNKAWOUG** for 10% off ($179 → ~$161).

**Step 2:** Install SalesSignal from the Omi App Store.
Search for SalesSignal, connect your CRM, configure the consent flow.

**Step 3:** If you want it deployed across a team, contact Kawough Marketing.
[kawoughmarketing.com](https://kawoughmarketing.com) — I'll scope the deployment and give you real cost numbers.

The device is the starting point. The app is where the workflow lives.
