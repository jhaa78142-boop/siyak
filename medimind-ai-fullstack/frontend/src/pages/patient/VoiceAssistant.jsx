import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Volume2, Waves, Loader2, Square, Sparkles, VolumeX } from "lucide-react";
import { api } from "../../lib/api";
import {
  PageStack, Reveal, HeroBand, SectionCard,
  PageHeader, PremiumButton, Chip, Toggle, EmptyState, ErrorState,
  useIsLowEnd,
} from "../../components/premium";

const SUGGESTIONS = [
  "I have a mild headache and feel tired.",
  "What should I eat to lower my cholesterol?",
  "Explain my blood pressure reading simply.",
  "Tips to sleep better tonight.",
];

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [notice, setNotice] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [muted, setMuted] = useState(false);
  const [micBlocked, setMicBlocked] = useState(false);
  const [recognitionSupported] = useState(
    () => typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const lowEnd = useIsLowEnd();

  useEffect(() => {
    if (!window.speechSynthesis) return undefined;
    const updateVoices = () => setVoices(window.speechSynthesis.getVoices());
    updateVoices();
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
    return () => {
      window.speechSynthesis.cancel();
      audioRef.current?.pause();
      window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
    };
  }, []);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const stopSpeaking = () => {
    try {
      window.speechSynthesis?.cancel();
    } catch {}
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {}
      audioRef.current = null;
    }
  };

  const speak = async (text) => {
    if (muted) return;
    window.speechSynthesis.cancel();
    audioRef.current?.pause();
    try {
      const audioBlob = await api.audioPost("/ai/speech", { text });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      await audio.play();
      return;
    } catch {
      setNotice("ElevenLabs voice is unavailable, so the browser voice is being used.");
    }

    if (!window.speechSynthesis) {
      setNotice("Text-to-speech is not supported in this browser.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(item => item.voiceURI === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const askAssistant = async (text) => {
    if (!text.trim()) return;
    setProcessing(true);
    setNotice("");
    try {
      const result = await api.post("/ai/chat", { message: text.trim() });
      const messages = result?.data?.messages || [];
      const answer = messages.filter(message => message.role === "ai").at(-1)?.text || "I could not generate a response.";
      setResponse(answer);
      speak(answer);
    } catch (error) {
      setNotice(error.message || "The AI assistant is temporarily unavailable.");
    } finally {
      setProcessing(false);
    }
  };

  const toggleListening = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setNotice("Voice input is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    let capturedText = "";
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => {
      setNotice("");
      setTranscript("");
      setMicBlocked(false);
      setListening(true);
    };
    recognition.onresult = (event) => {
      capturedText = Array.from(event.results).map(result => result[0]?.transcript || "").join(" ");
      setTranscript(capturedText);
    };
    recognition.onerror = (event) => {
      setListening(false);
      if (event?.error === "not-allowed" || event?.error === "service-not-allowed") {
        setMicBlocked(true);
      }
      setNotice("Microphone input failed. Allow microphone access and try again.");
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      if (capturedText) askAssistant(capturedText);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const statusLabel = processing ? "Thinking…" : listening ? "Listening…" : "Tap to speak";
  const statusHint = listening
    ? "Describe your symptoms or ask a health question."
    : "MediMind AI will transcribe your voice and respond with speech.";

  return (
    <PageStack>
      <Reveal index={0}>
        <PageHeader
          eyebrow="Speech-to-Text · Text-to-Speech"
          title="Voice Assistant"
          description="Talk to MediMind AI hands-free — great for quick check-ins on the go."
          actions={
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-[var(--mm-muted)]">Voice</span>
              <Toggle checked={!muted} onChange={(v) => setMuted(!v)} label="Voice playback" />
            </div>
          }
        />
      </Reveal>

      <Reveal index={1}>
        <HeroBand
          kicker={<><Sparkles size={13} /> Hands-free</>}
          title={
            <>
              Just say it.
              <span> MediMind listens.</span>
            </>
          }
          copy="Speak naturally about how you feel and hear a calm, considered reply — no typing needed."
          cta={
            recognitionSupported ? (
              <PremiumButton role="patient" icon={Mic} onClick={toggleListening} disabled={processing}>
                {listening ? "Stop listening" : "Start listening"}
              </PremiumButton>
            ) : null
          }
        />
      </Reveal>

      <Reveal index={2}>
        <SectionCard>
          {!recognitionSupported ? (
            <EmptyState
              icon={Mic}
              title="Voice input isn't supported in this browser"
              detail="Try Chrome or Edge to talk to MediMind. The browser voice is still available for spoken replies."
            />
          ) : micBlocked ? (
            <ErrorState
              title="Microphone access blocked"
              detail={notice || "Allow microphone access in your browser, then try again."}
              onRetry={toggleListening}
            />
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6 flex items-center justify-center">
                {listening && !lowEnd && [0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="absolute h-32 w-32 rounded-full border-2 border-[var(--mm-accent)]"
                    initial={{ scale: 1, opacity: 0.55 }}
                    animate={{ scale: 1.9, opacity: 0 }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.5 }}
                  />
                ))}
                <button
                  onClick={toggleListening}
                  disabled={processing}
                  aria-label={listening ? "Stop listening" : "Start listening"}
                  aria-pressed={listening}
                  className={`relative h-32 w-32 rounded-full flex items-center justify-center text-white shadow-xl transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--mm-accent-soft)]
                    ${listening ? "bg-gradient-to-br from-rose-500 to-orange-500" : "bg-gradient-to-br from-teal-500 to-cyan-600"} disabled:opacity-60`}
                >
                  <span
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{ background: "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.38), transparent 62%)" }}
                  />
                  {processing ? <Loader2 size={40} className="animate-spin" /> : <Mic size={40} />}
                </button>
              </div>

              <p className="font-display font-semibold text-lg text-[var(--mm-ink)]">{statusLabel}</p>
              <p className="text-sm text-[var(--mm-muted)] mt-1.5 max-w-sm">{statusHint}</p>

              <div className="flex items-end justify-center gap-1 mt-6 h-12" aria-hidden>
                {Array.from({ length: 24 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="w-1 rounded-full bg-[var(--mm-accent)]"
                    animate={listening && !lowEnd ? { height: [6, 26, 10, 30, 6] } : { height: 6 }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.04 }}
                  />
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <PremiumButton variant="outline" size="sm" icon={muted ? VolumeX : Volume2} onClick={() => setMuted(m => !m)}>
                  {muted ? "Unmute" : "Mute"}
                </PremiumButton>
                <PremiumButton variant="outline" size="sm" icon={Square} onClick={stopSpeaking}>
                  Stop
                </PremiumButton>
                {voices.length > 1 && (
                  <label className="flex items-center gap-2 text-xs text-[var(--mm-muted)]">
                    <span className="sr-only">Speech voice</span>
                    <select
                      value={selectedVoice}
                      onChange={(event) => setSelectedVoice(event.target.value)}
                      aria-label="Speech voice"
                      className="rounded-xl border border-[var(--mm-border)] bg-[var(--mm-surface)] px-2.5 py-2 text-xs text-[var(--mm-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--mm-accent)]"
                    >
                      <option value="">Default voice</option>
                      {voices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}
                    </select>
                  </label>
                )}
              </div>

              {notice && (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800 flex items-center gap-2">
                  <Waves size={13} className="shrink-0" /> {notice}
                </div>
              )}
            </div>
          )}
        </SectionCard>
      </Reveal>

      <Reveal index={3}>
        <SectionCard icon={Sparkles} title="Try saying" subtitle="Tap a prompt to ask instantly.">
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={processing || listening}
                onClick={() => askAssistant(prompt)}
                className="rounded-full border border-[var(--mm-border)] bg-[var(--mm-surface)] px-3.5 py-2 text-xs font-medium text-[var(--mm-ink)] transition-colors hover:border-[var(--mm-accent)] hover:text-[var(--mm-accent-deep)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mm-accent)]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </SectionCard>
      </Reveal>

      <Reveal index={4}>
        <SectionCard icon={Waves} title="Conversation" subtitle="What you said, and what MediMind replied.">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[var(--mm-border)] bg-[rgba(15,23,42,0.03)] dark:bg-white/[0.03] p-4 text-left">
              <p className="text-xs font-semibold text-[var(--mm-muted)] flex items-center gap-1.5 mb-2">
                <Waves size={13} /> You said
              </p>
              <p className="text-sm text-[var(--mm-ink)] leading-relaxed">
                {transcript || "Your spoken question will appear here."}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--mm-border)] bg-[var(--mm-accent-soft)] p-4 text-left">
              <p className="text-xs font-semibold text-[var(--mm-accent-deep)] flex items-center gap-1.5 mb-2">
                <Volume2 size={13} /> MediMind says
              </p>
              <p className="text-sm text-[var(--mm-ink)] leading-relaxed">
                {response || "The AI response will appear here."}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {processing && <Chip tone="accent" pulse>Thinking</Chip>}
            {listening && <Chip tone="bad" pulse>Listening</Chip>}
            {muted && <Chip tone="neutral">Voice muted</Chip>}
          </div>
        </SectionCard>
      </Reveal>
    </PageStack>
  );
}
