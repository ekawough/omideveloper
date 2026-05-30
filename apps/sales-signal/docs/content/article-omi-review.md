# Omi AI Review 2026: I Built 4 Apps on It — Here's What I Actually Think

I spent two years doing door-to-door solar sales in the Inland Empire. After every conversation I'd walk back to the car and try to reconstruct what the homeowner said about their Edison bill, what objections came up, whether they seemed like a real prospect or were just being polite. Half the time I was guessing. The other half I was typing notes into my phone while sweating through a shirt in 95-degree heat, which is not a great look when you're trying to close someone.

I tried every CRM workaround. Voice memos that sat unlistened to. Typed notes at the end of the day that captured maybe 40% of what actually happened. I looked at AI meeting note tools, but they all assume you're sitting at a desk on a Zoom call. Nobody had built anything for reps who are moving between doors.

I found Omi through the developer community. The pitch is simple: it's a wearable microphone that streams audio to your phone, and you build whatever you want on top of the audio. I bought one, built SalesSignal on it, then built three more apps before I stopped counting. This review is what I actually think after a year of serious development on the platform — not as an influencer, as a developer.

---

## What It Actually Is

Omi is a small wearable device — clip it to your collar, hang it around your neck, stick it to a lanyard. It pairs to your phone over Bluetooth and runs continuously. The device itself is just a microphone with a battery. That's intentional.

The value isn't the hardware. It's the webhook system underneath. When the device records audio, your app receives it — raw PCM16 audio bytes, transcript chunks from Omi's built-in transcription, and structured "memory" objects when Omi's AI decides a conversation segment is worth saving. You can hook into any of those four events and pipe the data wherever you want.

The App Store is where things get interesting. Anyone can publish an app. The apps run as webhook endpoints — your server receives Omi's events and does whatever your app does. It's an open platform, which means the quality varies a lot, but it also means there's no gatekeeper deciding what's allowed.

The hardware is simple. That's not a knock. Simple hardware with a clean data stream is more useful to a developer than a device packed with features that half-work.

---

## Setup and First Impressions

Pairing is straightforward. Download the app, put the device in pairing mode, Bluetooth handshake, done. Takes about three minutes. The setup process doesn't have any surprises.

Battery life is honest. Omi doesn't oversell it. You'll charge it daily if you're using it through a full workday — plan for that. I charge mine every night the same way I charge my phone. It's not a problem once you build the habit, but if you forget and start your day with a dead device, you'll notice.

Bluetooth range is what you'd expect from a device at this price point. Works fine within normal movement range. If you walk too far from your phone — across a large building, through concrete walls — it drops. I haven't found this to be a real problem in the field. The phone stays in my pocket.

The audio quality is what actually matters for my use case, and I was skeptical. I'm running Deepgram Nova-3 on the audio stream. Nova-3 is a good transcription model but it's not magic — garbage in, garbage out. The PCM16 stream at 16kHz that Omi outputs is clean enough that Nova-3 transcribes accurately even in moderately noisy environments. I've tested it in windy parking lots, homes with TVs on, and neighborhood streets with traffic. It holds up better than I expected.

The developer docs are decent. They cover the webhook event types, the memory object schema, and the basic authentication setup. Where they fall short is edge cases: what happens when the Bluetooth drops mid-conversation and reconnects, how transcript chunks stitch together when there's a pause, what the audio stream looks like during transition periods. I hit all of these during SalesSignal development and had to figure them out empirically. Not a dealbreaker, but set your expectations for some research time.

---

## What I Built on It

**omi-life-logger** was the first thing I built, mostly to understand the platform. It captures conversations and logs them to a structured database — who I talked to, rough timestamp, topic tags. Basic ambient journaling. Nothing impressive technically, but it made me understand the memory creation pipeline and how Omi's built-in AI summarizes conversation segments. The summaries are useful. They're not perfect, but they're a good starting point for search or tagging.

**omi-audio-backup** does exactly what it says. It captures the raw audio stream and saves it to cloud storage in organized chunks. I built this because I wanted a fallback — if any of my other apps drop data, I have the audio. It's also useful for training data collection if you're building custom models. The app itself is straightforward. The interesting part was handling the byte stream correctly — PCM16 from Omi comes in chunks and you need to buffer them properly before writing to storage or you get corrupted audio files at segment boundaries.

**omi-connect-tesla** was a side project. I wanted to see if I could voice-control my car through ambient conversation — say something about needing to check the charge level and have the app call the Tesla API. It works, within limits. The challenge is intent detection: you need to distinguish between me talking to a homeowner and me talking to myself about the car. I ended up using a keyword trigger rather than true intent detection, which is less elegant but reliable. I haven't published this one publicly — it's too Tesla-API-credential-dependent to be useful as a general app.

**SalesSignal** is the serious one. Here's how it works technically.

Omi streams PCM16 audio to my Node.js webhook server. I pipe that audio to Deepgram Nova-3 in streaming mode — not batch, streaming. The distinction matters. Streaming transcription at $0.0077/minute gives me near-real-time text. On the same audio, I run SenseVoice-Small for emotion detection. SenseVoice is open source from the Alibaba speech team — it's fast, runs locally, and does a reasonable job detecting emotional valence from voice without needing to analyze the words.

The transcript and emotion signals feed into a CrewAI agent pipeline. I'm running Llama 3.1-8B-Instruct on AMD MI300X hardware via vLLM. The agents do three things: extract structured sales data (objections, interest signals, any commitments mentioned), score the lead 1-10, and generate a sentiment timeline showing how the prospect's emotional state moved through the conversation.

The outputs go to GHL and HubSpot simultaneously — contact created, lead score attached, transcript linked. By the time I'm walking to the next door, the CRM entry is already there.

The part nobody talks about when they describe this kind of tool is consent law. I spent half a day auditing recording laws by state before I deployed this. Most guides online say there are 15 two-party consent states. That's wrong. It's 13. Nevada is one-party for in-person conversations — the two-party requirement only applies to phone calls. Vermont has no state statute on recording consent at all. These details matter when you're deploying this for a sales team working across multiple states. I built a GPS-based consent form into the admin panel that serves the legally correct script depending on which state the rep is standing in.

---

## What's Actually Good

**The webhook system is well-designed.** Four event types — audio bytes, transcript chunks, memory created, memory deleted — gives you enough granularity to build sophisticated apps without being overwhelming. The audio bytes event is what SalesSignal uses; the memory events are useful for apps that want to react to Omi's built-in AI layer.

**App Store distribution is real.** I published SalesSignal to the Omi marketplace and started getting installs from people I've never talked to. Passive distribution through the marketplace is not something you get with a standalone SaaS. The user base is growing and they're actively looking for new apps.

**The platform is genuinely open.** Omi doesn't tell you what kind of app to build. They don't restrict what APIs you can call or what data you can process. That matters for compliance-heavy use cases like mine — I needed to build consent flow into the app, and there was no platform policy preventing me from doing that.

**The community is active.** Discord has actual developers in it, not just people asking when the next firmware update is. When I was debugging the PCM16 buffering issue, I got a useful answer within a few hours.

**$179 for hardware that streams continuous clean 16kHz audio is reasonable.** I've seen Bluetooth microphone hardware cost more for worse specs. If you're building ambient AI apps, the cost of the device is not the problem — the compute and API costs will dwarf it.

---

## What's Annoying

**Daily charging.** It's fine once it's a habit. It's annoying when it isn't.

**Occasional crashes in beta builds.** The app has crashed on me mid-conversation a handful of times. This is beta software and they're iterating fast, but if you're relying on it for a demo, have a backup plan.

**PCM16 stream latency.** There's a 1-2 second delay between when audio is spoken and when the webhook fires with the bytes. For SalesSignal this doesn't matter — I'm not doing real-time display of the transcript to the rep. But if you're building something that needs to react instantly to what's said (a prompter, a real-time coaching overlay), the latency is a design constraint you need to work around.

**Marketplace analytics are thin.** I know how many installs SalesSignal has. I don't know much about where those users came from, what they do in the app, or what percentage are active. Better analytics would help me prioritize which features to build next.

**No native CRM integration.** This is the gap SalesSignal fills. Omi's built-in memory system is great for personal use, but there's nothing that automatically pushes data to sales tools. That's not a criticism of Omi specifically — it's an opportunity for developers on the platform.

The device itself is not annoying. It does what it's supposed to do.

---

## Who Should Buy It

**Developers who want to build ambient AI apps.** This is the best development platform for voice-adjacent applications I've found. The webhook model is clean, the distribution is built-in, and the user base is real.

**Sales reps who want automatic CRM updates.** SalesSignal handles this. Get the device, install the app from the Omi marketplace, connect your GHL or HubSpot account.

**Real estate agents who take property showing notes.** This is the next app I'm building. Walk through a home, narrate observations and client reactions, have them automatically logged with timestamps and structured tags.

**People who want AI meeting notes without paying for Zoom AI.** The built-in Omi memory system handles this reasonably well for in-person meetings. You'll get summaries and transcripts without needing to subscribe to another service.

**Not for:** people who just want a dictation tool. Your phone already does that. You're not buying this to transcribe your grocery list. You're buying it because you want to build on the audio stream or use apps that do something meaningful with captured conversations.

---

## The Verdict + Where to Buy

I've built four apps on this platform. I'm building more. That should tell you what I actually think.

Omi is not for everyone. If you don't have a use case where ambient audio capture is genuinely useful, the device will sit in a drawer. But if you're a developer who wants to build ambient AI tooling, or a sales rep who wants the specific workflow that SalesSignal provides, it's worth the price.

Hardware: $179. Use discount code **ETHANJOHNKAWOUG** for 10% off — brings it to $161.

[Get Omi here](https://www.omi.me?ref=ethan) — that's my affiliate link, which helps me keep building on the platform.

If you want to try SalesSignal specifically, find it in the Omi App Store or reach out through [Kawough Marketing](https://kawoughmarketing.com) if you want it deployed across a team.

---

## Frequently Asked Questions

**Q: Is Omi only useful for developers?**

Not exclusively, but the most value comes from the App Store ecosystem built by developers. If you're comfortable installing apps and connecting API integrations, you don't need to write code. If you want to build custom apps, you'll need development experience. The built-in features — memory capture, AI summaries — work for non-developers out of the box.

**Q: How accurate is the transcription?**

This depends on what you're using. Omi's built-in transcription is adequate for general notes. If you're building on top of the audio stream and running Deepgram Nova-3 like I do in SalesSignal, accuracy is high — better than most consumer transcription tools I've tested in field conditions.

**Q: Does Omi work in noisy environments?**

Better than I expected. The 16kHz PCM16 stream has enough signal quality for Deepgram to transcribe accurately in moderately noisy settings — wind, background TV, ambient street noise. It degrades in very loud environments like crowded restaurants or job sites with heavy equipment running. For door-to-door sales in residential neighborhoods, it handles fine.

**Q: What happens to the audio data?**

What happens to it depends on the app. For SalesSignal, audio goes to Deepgram for transcription (they have an enterprise data handling policy — no training on your data by default) and the transcript is stored in Supabase in your own project. Omi itself stores memory summaries on their servers. Review the privacy policy for any app before installing — the platform is open, which means app developers make their own data handling decisions.
