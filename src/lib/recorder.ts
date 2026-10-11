/**
 * Microphone recorder that prefers a complete 16 kHz mono WAV file, which every
 * transcription model can decode. WebViews without the Web Audio graph use a
 * MediaRecorder container instead; its MIME type is sent along to transcription.
 */

const TARGET_RATE = 16000;

export type Recorder = {
  stop: () => Promise<Blob>;
  cancel: () => void;
};

const MICROPHONE_ERRORS: Record<string, string> = {
  NotAllowedError: "Microphone permission was denied. Allow microphone access and try again.",
  PermissionDeniedError: "Microphone permission was denied. Allow microphone access and try again.",
  NotFoundError: "No microphone was found on this device.",
  DevicesNotFoundError: "No microphone was found on this device.",
  NotReadableError: "The microphone is busy or unavailable. Close other recording apps and try again.",
  TrackStartError: "The microphone is busy or unavailable. Close other recording apps and try again.",
  SecurityError: "Microphone access is blocked on this page. Use HTTPS and try again.",
};

export function microphoneErrorMessage(error: unknown): string {
  const name = typeof error === "object" && error && "name" in error ? String(error.name) : "";
  const message = typeof error === "object" && error && "message" in error ? String(error.message) : "";
  if (message === "microphone_unsupported") return "This browser or WebView cannot record audio.";
  if (message === "microphone_secure_context") return "Microphone access requires HTTPS (or localhost).";
  if (name === "AbortError") return "Microphone startup was interrupted. Please try again.";
  return MICROPHONE_ERRORS[name] ?? "Microphone access is unavailable. Check your browser or app permissions.";
}

function downsample(chunks: Float32Array[], from: number, to: number): Float32Array {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Float32Array(total);
  let o = 0;
  for (const c of chunks) {
    merged.set(c, o);
    o += c.length;
  }
  if (to >= from) return merged;
  const ratio = from / to;
  const out = new Float32Array(Math.floor(merged.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(merged.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += merged[j];
    out[i] = end > start ? sum / (end - start) : 0;
  }
  return out;
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const str = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  str(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  str(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

function preferredRecordingMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  for (const mime of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"]) {
    if (MediaRecorder.isTypeSupported?.(mime)) return mime;
  }
  return "";
}

/**
 * MediaRecorder is a compatibility fallback for WebViews that expose a
 * microphone but do not expose AudioContext/ScriptProcessor. The server keeps
 * the container MIME type so the transcription provider can decode it.
 */
function createMediaRecorderFallback(stream: MediaStream): Recorder {
  if (typeof MediaRecorder === "undefined") {
    stream.getTracks().forEach((track) => track.stop());
    throw new Error("microphone_unsupported");
  }

  const mime = preferredRecordingMime();
  const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
  const chunks: BlobPart[] = [];
  let stopped = false;
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };
  recorder.start(250);

  const cleanup = () => {
    stream.getTracks().forEach((track) => track.stop());
  };

  return {
    stop: () =>
      new Promise<Blob>((resolve, reject) => {
        if (stopped) {
          reject(new Error("recording_already_stopped"));
          return;
        }
        stopped = true;
        recorder.onstop = () => {
          cleanup();
          resolve(new Blob(chunks, { type: recorder.mimeType || mime || "audio/webm" }));
        };
        recorder.onerror = () => {
          cleanup();
          reject(new Error("recording_failed"));
        };
        recorder.stop();
      }),
    cancel: () => {
      if (stopped) return;
      stopped = true;
      try {
        recorder.stop();
      } catch {
        /* already stopped */
      }
      cleanup();
    },
  };
}

export async function startRecording(): Promise<Recorder> {
  if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("microphone_unsupported");
  }
  if (!window.isSecureContext && !["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    throw new Error("microphone_secure_context");
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  });
  const webkitWindow = window as Window & { webkitAudioContext?: typeof AudioContext };
  const Ctx = window.AudioContext || webkitWindow.webkitAudioContext;
  if (!Ctx || typeof Ctx.prototype.createScriptProcessor !== "function") {
    return createMediaRecorderFallback(stream);
  }

  const ctx = new Ctx();
  if (ctx.state === "suspended") await ctx.resume();
  const source = ctx.createMediaStreamSource(stream);
  const node = ctx.createScriptProcessor(4096, 1, 1);
  const silentSink = ctx.createGain();
  silentSink.gain.value = 0;
  const chunks: Float32Array[] = [];
  node.onaudioprocess = (e) => chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  source.connect(node);
  // ScriptProcessor nodes only receive callbacks while connected to an output,
  // but keep the gain at zero so recording never feeds the microphone back to
  // the phone speaker.
  node.connect(silentSink);
  silentSink.connect(ctx.destination);

  const teardown = () => {
    try {
      node.onaudioprocess = null;
      node.disconnect();
      silentSink.disconnect();
      source.disconnect();
    } catch {
      /* noop */
    }
    stream.getTracks().forEach((t) => t.stop());
    void ctx.close().catch(() => {});
  };

  return {
    async stop() {
      // Give the final input buffer a chance to reach onaudioprocess before
      // disconnecting the graph. This matters when the stop tap follows a
      // short utterance on iOS/WebView.
      await new Promise((resolve) => setTimeout(resolve, 80));
      const rate = ctx.sampleRate;
      teardown();
      return encodeWav(downsample(chunks, rate, TARGET_RATE), TARGET_RATE);
    },
    cancel: teardown,
  };
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < buf.length; i += CHUNK) {
    binary += String.fromCharCode(...buf.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}
