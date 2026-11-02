import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Paperclip, RotateCcw, Sparkles, Zap } from "lucide-react";
import { PROMPTS } from "./chat/constants";
import { LeftRail, RightRail } from "./chat/ChatRails";
import Composer from "./chat/Composer";
import MessageBubble from "./chat/MessageBubble";
import ThinkingCard from "./chat/ThinkingCard";
import DoctorChatAvatar from "./chat/DoctorChatAvatar";
import { useChatEngine } from "./chat/useChatEngine";
import { useStickToBottom } from "./chat/useStickToBottom";
import { ConsentPrompt } from "../../components/premium";
import "./ai-chat.css";

export default function AIChat() {
  const chat = useChatEngine();
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const { scrollerRef, endRef, showJump, jumpToLatest, schedulePin } = useStickToBottom([
    chat.messages,
    chat.typing,
    chat.uploading,
    chat.streaming,
    chat.thinkStep,
  ]);

  useEffect(() => {
    chat.registerPin(schedulePin);
  }, [chat.registerPin, schedulePin]);

  const shortcutHint = useMemo(
    () => (typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl"),
    []
  );

  const requestDocument = (file) => {
    if (!file) return;
    setFileToUpload(file);
    setIsConsentOpen(true);
  };

  const handleConsentAccept = () => {
    setIsConsentOpen(false);
    if (fileToUpload) chat.onPickFile(fileToUpload);
    setFileToUpload(null);
  };

  const handleConsentCancel = () => {
    setIsConsentOpen(false);
    setFileToUpload(null);
  };

  const lastAiId = useMemo(() => {
    for (let i = chat.messages.length - 1; i >= 0; i -= 1) {
      if (chat.messages[i].role === "ai") return chat.messages[i].id;
    }
    return null;
  }, [chat.messages]);

  const phaseLabel =
    chat.uploading
      ? "Reading your document"
      : chat.phase === "retrieving"
      ? "Gathering health context"
      : chat.streaming
      ? null
      : "MediMind is thinking";

  return (
    <div className="mm-chat" data-busy={chat.busy ? "true" : "false"} data-streaming={chat.streaming ? "true" : "false"}>
      <div className="mm-chat__aurora" aria-hidden />

      <ConsentPrompt
        open={isConsentOpen}
        onAccept={handleConsentAccept}
        onCancel={handleConsentCancel}
        fileName={fileToUpload?.name}
      />

      <header className="mm-chat__hero">
        <div>
          <p className="mm-chat__eyebrow">Clinical intelligence</p>
          <h1 className="mm-chat__title">
            MediMind <span>AI Chat</span>
          </h1>
          <p className="mm-chat__lede">
            A private consultation canvas — ask freely, attach labs or prescriptions, and get careful,
            plain-language guidance grounded in your record.
          </p>
        </div>
        <div className="mm-chat__status-row">
          <span className="mm-pill mm-pill--live">
            <i /> {chat.streaming ? "Streaming" : "Live assistant"}
          </span>
          <span className="mm-pill mm-pill--soft">
            <Sparkles size={11} /> RAG grounded
          </span>
          <span className="mm-pill mm-pill--soft">
            <Zap size={11} /> Real-time tokens
          </span>
        </div>
      </header>

      <div className="mm-chat__stage">
        <LeftRail
          busy={chat.busy}
          onPrompt={(p) => chat.send(p)}
        />

        <section
          className="mm-panel mm-chat__canvas-wrap"
          onDragOver={(e) => {
            e.preventDefault();
            chat.setDragOver(true);
          }}
          onDragLeave={() => chat.setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            chat.setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) requestDocument(file);
          }}
        >
          <div className="mm-chat__canvas">
            <div className="mm-chat__canvas-mesh" aria-hidden />

            <div className="mm-chat__toolbar">
              <div className="mm-chat__identity">
                <DoctorChatAvatar className="mm-chat__identity-avatar" />
                <div className="mm-chat__identity-copy">
                  <strong>MediMind Assistant</strong>
                  <span>{chat.statusLabel}</span>
                </div>
              </div>
              <div className="mm-chat__toolbar-actions">
                <label
                  htmlFor="chat-document-file"
                  className={`mm-icon-btn ${chat.busy ? "pointer-events-none opacity-50" : ""}`}
                  title="Upload document"
                  aria-label="Upload document"
                  aria-disabled={chat.busy}
                >
                  <Paperclip size={16} />
                </label>
                <button
                  type="button"
                  className="mm-icon-btn"
                  title="New conversation"
                  disabled={chat.busy}
                  onClick={chat.resetConversation}
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>

            <div className="mm-chat__stream-wrap">
              <div className="mm-chat__stream" ref={scrollerRef} role="log" aria-live="polite">
                <AnimatePresence initial={false}>
                  {chat.showEmpty && (
                    <motion.div
                      key="empty"
                      className="mm-empty"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="mm-empty__orb">
                        <DoctorChatAvatar className="mm-empty__doctor-avatar" />
                      </div>
                      <h2>Care, before you explain everything</h2>
                      <p>
                        Describe how you feel, or drop a report. MediMind reads documents, flags notable values,
                        and answers with clinical caution — never a replacement for your doctor.
                      </p>
                      <div className="mm-empty__grid">
                        {PROMPTS.slice(0, 4).map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            className="mm-action"
                            disabled={chat.busy}
                            onClick={() => chat.send(p.prompt)}
                          >
                            <div className="mm-action__kicker">{p.kicker}</div>
                            <div className="mm-action__label">{p.label}</div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {chat.messages.map((m) => (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    streaming={chat.streamingId === m.id}
                    isLastAi={m.id === lastAiId && !chat.busy}
                    onSpeak={chat.speak}
                    speechState={chat.speechState}
                    speechMessageId={chat.speechMessageId}
                    onBook={chat.bookAppointment}
                    onRegenerate={chat.regenerate}
                  />
                ))}

                <AnimatePresence>
                  {(chat.typing || chat.uploading) && !chat.streaming && (
                    <motion.div
                      key="thinking"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ThinkingCard
                        uploading={chat.uploading}
                        stepIndex={chat.thinkStep}
                        phaseLabel={phaseLabel}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={endRef} />
              </div>

              {showJump && (
                <button type="button" className="mm-jump" onClick={jumpToLatest}>
                  <ChevronDown size={14} /> Jump to latest
                </button>
              )}
            </div>

            <Composer
              ref={chat.textareaRef}
              input={chat.input}
              setInput={chat.setInput}
              busy={chat.busy && !chat.streaming}
              streaming={chat.streaming}
              listening={chat.listening}
              pendingFile={chat.pendingFile}
              pendingImageMode={chat.pendingImageMode}
              setPendingImageMode={chat.setPendingImageMode}
              notice={chat.notice}
              selectedVoice={chat.selectedVoice}
              setSelectedVoice={chat.setSelectedVoice}
              dragOver={chat.dragOver}
              onSubmit={chat.onSubmit}
              onPickFile={requestDocument}
              onClearPending={() => {
                chat.setPendingFile(null);
                chat.setPendingImageMode("report");
              }}
              onToggleListening={chat.toggleListening}
              onStop={chat.stop}
              onAutoResize={chat.autoResize}
              fileRef={chat.fileRef}
              shortcutHint={shortcutHint}
            />
          </div>
        </section>

        <RightRail insight={chat.insight} onBook={chat.bookAppointment} />
      </div>
    </div>
  );
}
