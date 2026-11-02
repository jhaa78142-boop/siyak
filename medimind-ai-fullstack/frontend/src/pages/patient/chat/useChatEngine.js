import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";
import { postSse } from "../../../lib/sse";
import { DEFAULT_DISCLAIMER, THINK_STEPS_CHAT, THINK_STEPS_UPLOAD, WELCOME_ID } from "./constants";
import { inferUrgency, sanitizePartial, uid } from "./utils";
import { generateKokoroAudio, isKokoroReady, loadKokoro } from "./kokoroSpeech";

function welcomeMessage(text) {
  return {
    id: WELCOME_ID,
    role: "ai",
    text:
      text ||
      "Welcome. I'm your MediMind clinical assistant — ask about symptoms, medicines, or drop a lab report / prescription and I'll extract the details in plain language.",
    urgency: "routine",
    at: new Date(),
  };
}

export function useChatEngine() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState(() => [welcomeMessage()]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamingId, setStreamingId] = useState(null);
  const [phase, setPhase] = useState("");
  const [thinkStep, setThinkStep] = useState(0);
  const [listening, setListening] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingImageMode, setPendingImageMode] = useState("report");
  const [dragOver, setDragOver] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("af_heart");
  const [speechState, setSpeechState] = useState("idle");
  const [speechMessageId, setSpeechMessageId] = useState(null);
  const [insight, setInsight] = useState({
    urgency: "routine",
    disclaimer: DEFAULT_DISCLAIMER,
    sources: [],
    lastDoc: null,
    explanation: null,
  });

  const fileRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const speechRequestRef = useRef(0);
  const abortRef = useRef(null);
  const streamTextRef = useRef("");
  const streamRafRef = useRef(0);
  const streamIdRef = useRef(null);
  const onTokenPinRef = useRef(null);

  const busy = typing || uploading;
  const showEmpty = messages.length <= 1 && !busy;

  const statusLabel = uploading
    ? "Extracting document intelligence…"
    : streaming
    ? "Streaming clinical reply…"
    : typing
    ? phase === "retrieving"
      ? "Gathering your health context…"
      : "Reasoning with your health context…"
    : listening
    ? "Listening…"
    : "Ready · grounded replies";

  const stopSpeech = useCallback((updateState = true) => {
    speechRequestRef.current += 1;
    audioRef.current?.pause();
    audioRef.current = null;
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    if (updateState) {
      setSpeechState("idle");
      setSpeechMessageId(null);
      setNotice("");
    }
  }, []);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    abortRef.current?.abort();
    speechRequestRef.current += 1;
    audioRef.current?.pause();
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    if (streamRafRef.current) cancelAnimationFrame(streamRafRef.current);
  }, []);

  useEffect(() => {
    if (!busy && !streaming) {
      setThinkStep(0);
      return undefined;
    }
    const max = (uploading ? THINK_STEPS_UPLOAD : THINK_STEPS_CHAT).length - 1;
    setThinkStep(0);
    const id = setInterval(() => {
      setThinkStep((s) => Math.min(max, s + 1));
    }, uploading ? 900 : 650);
    return () => clearInterval(id);
  }, [busy, uploading, streaming]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/ai/chat");
        const history = res?.data?.messages;
        if (Array.isArray(history) && history.length > 0) {
          const mapped = history.map((m) => ({
            id: uid(),
            role: m.role === "user" ? "user" : "ai",
            text: m.text,
            urgency: m.role === "ai" ? inferUrgency(m.text) : undefined,
            explanation: m.role === "ai" ? m.explanation || null : undefined,
            at: m.createdAt ? new Date(m.createdAt) : new Date(),
          }));
          setMessages(mapped);
          const lastAi = [...mapped].reverse().find((m) => m.role === "ai");
          if (lastAi) {
            setInsight((prev) => ({
              ...prev,
              urgency: lastAi.urgency || "routine",
              explanation: lastAi.explanation || null,
            }));
          }
        }
      } catch {
        /* keep welcome */
      }
    })();
  }, []);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(160, el.scrollHeight)}px`;
  }, []);

  const flushStreamText = useCallback(() => {
    streamRafRef.current = 0;
    const id = streamIdRef.current;
    const text = sanitizePartial(streamTextRef.current);
    if (!id) return;
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text } : m)));
    onTokenPinRef.current?.();
  }, []);

  const queueToken = useCallback(
    (delta) => {
      streamTextRef.current += delta;
      if (!streamRafRef.current) {
        streamRafRef.current = requestAnimationFrame(flushStreamText);
      }
    },
    [flushStreamText]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (streamRafRef.current) {
      cancelAnimationFrame(streamRafRef.current);
      flushStreamText();
    }
    setStreaming(false);
    setTyping(false);
    setStreamingId(null);
    streamIdRef.current = null;
  }, [flushStreamText]);

  const speak = useCallback(async (text, messageId) => {
    if (speechMessageId === messageId && speechState !== "idle") {
      stopSpeech();
      return;
    }

    stopSpeech(false);
    const requestId = speechRequestRef.current;
    setSpeechMessageId(messageId);
    setSpeechState("loading");
    setNotice(isKokoroReady()
      ? "Creating speech on this device…"
      : "Preparing the natural voice model. First use downloads it; later uses are cached.");

    try {
      const model = await loadKokoro((progress) => {
        if (speechRequestRef.current !== requestId || progress.status !== "progress") return;
        if (Number.isFinite(progress.progress)) {
          setNotice(`Preparing the natural voice model on this device (${Math.round(progress.progress)}%).`);
        }
      });
      if (speechRequestRef.current !== requestId) return;

      setNotice("Creating speech on this device…");
      const audioBlob = await generateKokoroAudio(model, text, selectedVoice);
      if (speechRequestRef.current !== requestId) return;

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audioUrlRef.current = audioUrl;
      const finish = () => {
        if (audioRef.current !== audio) return;
        audioRef.current = null;
        audioUrlRef.current = null;
        URL.revokeObjectURL(audioUrl);
        setSpeechState("idle");
        setSpeechMessageId(null);
        setNotice("");
      };
      audio.onended = finish;
      audio.onerror = finish;
      setSpeechState("speaking");
      setNotice("");
      await audio.play();
    } catch {
      if (speechRequestRef.current !== requestId) return;
      audioRef.current?.pause();
      audioRef.current = null;
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
      setSpeechState("idle");
      setSpeechMessageId(null);
      setNotice("On-device voice could not start. Check your connection for the first model download, then try again.");
    }
  }, [selectedVoice, speechMessageId, speechState, stopSpeech]);

  const bookAppointment = useCallback(
    (urgencyLevel) => {
      try {
        sessionStorage.setItem(
          "medimind:booking:ctx",
          JSON.stringify({
            reason:
              urgencyLevel === "urgent"
                ? "Urgent symptom — needs prompt consultation"
                : "AI-assisted follow-up recommended",
            specialty: "",
          })
        );
      } catch {
        /* ignore */
      }
      navigate("/patient/appointments");
    },
    [navigate]
  );

  const runStream = useCallback(
    async (text, { regenerate = false, skipUserBubble = false } = {}) => {
      const trimmed = String(text || "").trim();
      if (!trimmed) return;

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      if (!skipUserBubble && !regenerate) {
        setMessages((prev) => [
          ...prev,
          { id: uid(), role: "user", text: trimmed, at: new Date() },
        ]);
      }

      if (regenerate) {
        setMessages((prev) => {
          const next = [...prev];
          while (next.length && next[next.length - 1].role === "ai") next.pop();
          return next;
        });
      }

      const aiId = uid();
      streamIdRef.current = aiId;
      streamTextRef.current = "";
      setStreamingId(null);
      setStreaming(false);
      setTyping(true);
      setPhase("retrieving");
      setNotice("");
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";

      let gotToken = false;
      let finalSources = [];
      let finalDisclaimer = DEFAULT_DISCLAIMER;
      let finalExplanation = null;
      let bubbleMounted = false;

      const ensureBubble = () => {
        if (bubbleMounted) return;
        bubbleMounted = true;
        setStreamingId(aiId);
        setMessages((prev) => [
          ...prev,
          { id: aiId, role: "ai", text: "", urgency: "routine", explanation: finalExplanation, at: new Date() },
        ]);
      };

      try {
        await postSse(
          "/ai/chat/stream",
          { message: trimmed, regenerate: !!regenerate },
          {
            signal: ac.signal,
            onEvent: (event, data) => {
              if (event === "status") {
                setPhase(data?.phase || "retrieving");
              } else if (event === "meta") {
                setPhase(data?.phase || "generating");
                finalSources = data?.sources || [];
                finalDisclaimer = data?.disclaimer || DEFAULT_DISCLAIMER;
                finalExplanation = data?.explanation || null;
                setInsight((prev) => ({
                  ...prev,
                  sources: finalSources,
                  disclaimer: finalDisclaimer,
                  explanation: finalExplanation,
                }));
              } else if (event === "token") {
                if (!gotToken) {
                  gotToken = true;
                  ensureBubble();
                  setTyping(false);
                  setStreaming(true);
                  setPhase("generating");
                }
                queueToken(data?.t || "");
              } else if (event === "done") {
                ensureBubble();
                const reply = sanitizePartial(data?.reply || streamTextRef.current);
                const urgency = inferUrgency(reply);
                if (streamRafRef.current) {
                  cancelAnimationFrame(streamRafRef.current);
                  streamRafRef.current = 0;
                }
                streamTextRef.current = reply;
                finalExplanation = data?.explanation || finalExplanation;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiId
                      ? {
                          ...m,
                          text: reply,
                          urgency,
                          disclaimer: data?.disclaimer || finalDisclaimer,
                          explanation: finalExplanation,
                        }
                      : m
                  )
                );
                setInsight((prev) => ({
                  ...prev,
                  urgency,
                  sources: data?.sources || finalSources,
                  disclaimer: data?.disclaimer || finalDisclaimer,
                  explanation: finalExplanation,
                }));
              } else if (event === "error") {
                throw new Error(data?.message || "Stream failed");
              }
            },
          }
        );

        if (!streamTextRef.current.trim() && !ac.signal.aborted) {
          ensureBubble();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId
                ? {
                    ...m,
                    text: "I couldn't generate a response right now. Please try again in a moment.",
                    urgency: "routine",
                  }
                : m
            )
          );
        }
      } catch (error) {
        if (error?.name === "AbortError") {
          if (streamTextRef.current.trim()) {
            ensureBubble();
            const urgency = inferUrgency(streamTextRef.current);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiId
                  ? { ...m, text: sanitizePartial(streamTextRef.current), urgency }
                  : m
              )
            );
          }
        } else {
          ensureBubble();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId
                ? {
                    ...m,
                    text: error.message || "The assistant is temporarily unavailable.",
                    urgency: "routine",
                  }
                : m
            )
          );
        }
      } finally {
        if (streamRafRef.current) {
          cancelAnimationFrame(streamRafRef.current);
          flushStreamText();
        }
        setStreaming(false);
        setTyping(false);
        setStreamingId(null);
        streamIdRef.current = null;
        setPhase("");
        if (abortRef.current === ac) abortRef.current = null;
      }
    },
    [flushStreamText, queueToken]
  );

  const send = useCallback(
    async (rawText, opts = {}) => {
      if (busy || streaming) return;
      await runStream(rawText, opts);
    },
    [busy, streaming, runStream]
  );

  const regenerate = useCallback(async () => {
    if (busy || streaming) return;
    const lastUser = [...messages].reverse().find((m) => m.role === "user" && !m.attachment);
    if (!lastUser?.text) {
      setNotice("Nothing to regenerate yet.");
      return;
    }
    await runStream(lastUser.text, { regenerate: true, skipUserBubble: true });
  }, [busy, streaming, messages, runStream]);

  const uploadDocument = useCallback(
    async (file, imageMode = "report") => {
      if (!file || busy || streaming) return;

      if (file.size > 15 * 1024 * 1024) {
        setNotice("File is too large. Maximum size is 15MB.");
        return;
      }
      const ext = `.${(file.name.split(".").pop() || "").toLowerCase()}`;
      if (![".pdf", ".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
        setNotice("Please upload a PDF or image (PNG, JPG, WEBP).");
        return;
      }

      const isImage = /\.(png|jpe?g|webp)$/i.test(file.name);
      const reportType = isImage && ["xray", "mri"].includes(imageMode)
        ? "Imaging"
        : /rx|prescri|medicine|medication/.test(file.name.toLowerCase())
          ? "Prescription"
          : "Lab";

      setPendingFile(null);
      setNotice("");
      setUploading(true);

      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "user",
          text: `Uploaded ${file.name}`,
          attachment: { name: file.name, type: reportType, size: file.size },
          at: new Date(),
        },
      ]);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("reportType", reportType);
        if (reportType === "Imaging") formData.append("reportSubType", imageMode);
        const response = await api.upload("/ai/reports", formData);
        const report = response?.data;
        const analysis = report?.analysis || {};
        const imaging = report?.imaging || {};

        const findingsPreview = (analysis.findings || [])
          .slice(0, 5)
          .map(
            (f) =>
              `• **${f.name}**: ${[f.value, f.unit].filter(Boolean).join(" ")} (${f.status || "unknown"})`
          )
          .join("\n");
        const medsPreview = (analysis.medications || [])
          .slice(0, 5)
          .map(
            (m) =>
              `• **${m.name}**${m.dose ? ` — ${m.dose}` : ""}${m.frequency ? `, ${m.frequency}` : ""}`
          )
          .join("\n");

        const structured = reportType === "Imaging"
          ? imaging.status === "done"
            ? `**${imageMode === "mri" ? "MRI" : "X-ray"} model label**\n${imaging.label}\n\nThis is an automated image-classification result, not a medical reading or diagnosis. Please have a radiologist review the scan.`
            : `**Image screening unavailable**\n${imaging.message || "No screening result was returned. Please have a radiologist review the scan."}`
          : analysis.status === "failed"
            ? `I received the document, but could not extract readable text reliably. ${analysis.error || "Try a clearer image or searchable PDF."}`
            : [
          analysis.summary && `**Summary**\n${analysis.summary}`,
          findingsPreview && `**Key findings**\n${findingsPreview}`,
          medsPreview && `**Medications**\n${medsPreview}`,
          analysis.plainLanguage && `**In plain language**\n${analysis.plainLanguage}`,
        ]
          .filter(Boolean)
          .join("\n\n");

        const card = {
          fileName: report?.fileName || file.name,
          documentKind: analysis.documentKind || reportType,
          findingsCount: analysis.findings?.length || 0,
          medicationsCount: analysis.medications?.length || 0,
          flagsCount: analysis.flags?.length || 0,
        };

        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "ai",
            text:
              structured ||
              "I received your document, but couldn't extract readable details. Try a clearer photo or PDF.",
            urgency: inferUrgency(structured || ""),
            at: new Date(),
            reportCard: card,
            disclaimer: analysis.disclaimer,
          },
        ]);
        setInsight((prev) => ({
          ...prev,
          lastDoc: card,
          disclaimer: analysis.disclaimer || prev.disclaimer,
          urgency: inferUrgency(structured || ""),
        }));

        setUploading(false);
        if (reportType === "Imaging" || analysis.status === "failed") return;
        const followUp = `I just uploaded my ${reportType.toLowerCase()} named "${file.name}". Please explain the key findings simply and what I should discuss with my doctor.`;
        await runStream(followUp, { skipUserBubble: true });
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "ai",
            text: error.message || "Upload failed. Please try a clearer PDF or image.",
            urgency: "routine",
            at: new Date(),
          },
        ]);
        setUploading(false);
      } finally {
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [busy, streaming, runStream]
  );

  const onPickFile = useCallback((file) => {
    if (!file) return;
    setPendingFile(file);
    setPendingImageMode("report");
    setNotice("");
  }, []);

  const toggleListening = useCallback(() => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setNotice("Voice input is not supported in this browser.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0]?.transcript || "")
        .join("");
      setInput(transcript);
      requestAnimationFrame(autoResize);
    };
    recognition.onerror = () => {
      setListening(false);
      setNotice("Microphone permission is required for voice input.");
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    setListening(true);
    setNotice("");
    recognition.start();
  }, [listening, autoResize]);

  const onSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      if (streaming) return;
      if (pendingFile) {
        const file = pendingFile;
        const imageMode = pendingImageMode;
        const note = input.trim();
        setPendingFile(null);
        setPendingImageMode("report");
        setInput("");
        await uploadDocument(file, imageMode);
        if (note) await send(note);
        return;
      }
      await send(input);
    },
    [streaming, pendingFile, pendingImageMode, input, uploadDocument, send]
  );

  const resetConversation = useCallback(async () => {
    stop();
    try {
      const res = await api.delete("/ai/chat");
      const welcome = res?.data?.messages?.[0]?.text;
      setMessages([welcomeMessage(welcome)]);
    } catch {
      setMessages([welcomeMessage("Fresh session started. How can I help you today?")]);
    }
    setInsight({
      urgency: "routine",
      disclaimer: DEFAULT_DISCLAIMER,
      sources: [],
      lastDoc: null,
      explanation: null,
    });
    setNotice("");
  }, [stop]);

  const registerPin = useCallback((fn) => {
    onTokenPinRef.current = fn;
  }, []);

  return {
    messages,
    input,
    setInput,
    typing,
    uploading,
    streaming,
    streamingId,
    phase,
    thinkStep,
    listening,
    pendingFile,
    pendingImageMode,
    setPendingImageMode,
    dragOver,
    setDragOver,
    notice,
    voices: [],
    selectedVoice,
    setSelectedVoice,
    speechState,
    speechMessageId,
    insight,
    busy: busy || streaming,
    showEmpty,
    statusLabel,
    fileRef,
    textareaRef,
    autoResize,
    speak,
    bookAppointment,
    send,
    regenerate,
    stop,
    uploadDocument,
    onPickFile,
    toggleListening,
    onSubmit,
    resetConversation,
    setPendingFile,
    setNotice,
    registerPin,
  };
}
