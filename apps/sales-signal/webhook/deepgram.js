// Deepgram v5 streaming + batch sentiment wrapper.
//
// Two-stage pipeline:
//   1. streaming (nova-2, diarize=true) for live transcript + speaker labels.
//      Sentiment is NOT available on streaming — this is Gotcha #3.
//   2. batch /v1/read on the full transcript at end-of-session for sentiment.

import { DeepgramClient, LiveTranscriptionEvents } from '@deepgram/sdk';

const KEEPALIVE_MS = 3_000;

export class DeepgramSession {
  /**
   * @param {{apiKey:string, sampleRate:number, onTranscript?:Function, onError?:Function}} opts
   */
  constructor(opts) {
    this.apiKey = opts.apiKey;
    this.sampleRate = opts.sampleRate;
    this.onTranscript = opts.onTranscript || (() => {});
    this.onError      = opts.onError      || (() => {});
    this.live = null;
    this.ready = false;
    this.closed = false;
    this.keepAliveTimer = null;

    /** @type {Array<{speaker:number, text:string, start:number, end:number, confidence:number}>} */
    this.segments = [];
    this.fullTranscript = '';
    this.client = this.apiKey ? new DeepgramClient(this.apiKey) : null;
  }

  async start() {
    if (!this.client) {
      console.warn('[dg] no api key — running in stub mode');
      this.ready = true;
      return;
    }

    this.live = this.client.listen.live({
      model: 'nova-2',
      language: 'en-US',
      encoding: 'linear16',
      sample_rate: this.sampleRate,
      channels: 1,
      diarize: true,
      smart_format: true,
      punctuate: true,
      interim_results: true,
      endpointing: 300,
    });

    this.live.on(LiveTranscriptionEvents.Open, () => {
      this.ready = true;
      this.keepAliveTimer = setInterval(() => {
        try { this.live?.keepAlive(); } catch {}
      }, KEEPALIVE_MS);
    });

    this.live.on(LiveTranscriptionEvents.Transcript, (evt) => {
      if (!evt.is_final) return;
      const alt = evt.channel?.alternatives?.[0];
      if (!alt?.transcript) return;
      const words = alt.words || [];
      const speaker = words[0]?.speaker ?? 0;
      const segment = {
        speaker,
        text: alt.transcript,
        start: evt.start ?? words[0]?.start ?? 0,
        end:   (evt.start ?? 0) + (evt.duration ?? 0),
        confidence: alt.confidence ?? 0,
      };
      this.segments.push(segment);
      this.fullTranscript += (this.fullTranscript ? ' ' : '') + alt.transcript;
      this.onTranscript(segment);
    });

    this.live.on(LiveTranscriptionEvents.Error,  (err)  => this.onError(err));
    this.live.on(LiveTranscriptionEvents.Close,  ()     => { this.ready = false; });
  }

  send(buf) {
    if (this.closed || !this.live) return;
    try { this.live.send(buf); }
    catch (e) { this.onError(e); }
  }

  /**
   * Flush the live stream and run batch sentiment on the transcript.
   * @returns {Promise<{transcript:string, segments:Array, sentiment:any|null}>}
   */
  async finish() {
    this.closed = true;
    if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);

    if (this.live) {
      try { this.live.requestClose(); } catch {}
      // Wait briefly for any in-flight finals.
      await new Promise((r) => setTimeout(r, 800));
    }

    // Batch sentiment — Deepgram /v1/read only runs on text.
    let sentiment = null;
    if (this.client && this.fullTranscript.trim()) {
      try {
        const { result, error } = await this.client.read.analyzeText(
          { text: this.fullTranscript },
          { sentiment: true, language: 'en' },
        );
        if (error) console.error('[dg] analyzeText error:', error.message);
        else sentiment = result?.results?.sentiments || null;
      } catch (e) {
        console.error('[dg] analyzeText threw:', e.message);
      }
    }

    return {
      transcript: this.fullTranscript,
      segments: this.segments,
      sentiment,
    };
  }
}
