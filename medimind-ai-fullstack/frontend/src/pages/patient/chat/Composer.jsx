import { forwardRef } from "react";
import { Loader2, Mic, Paperclip, Send, Square, X, FileText, Volume2 } from "lucide-react";
import { formatBytes } from "./utils";
import { KOKORO_VOICES } from "./kokoroSpeech";

const Composer = forwardRef(function Composer(
  {
    input,
    setInput,
    busy,
    streaming,
    listening,
    pendingFile,
    pendingImageMode,
    setPendingImageMode,
    notice,
    selectedVoice,
    setSelectedVoice,
    dragOver,
    onSubmit,
    onPickFile,
    onClearPending,
    onToggleListening,
    onStop,
    onAutoResize,
    fileRef,
    shortcutHint,
  },
  textareaRef
) {
  return (
    <div className="mm-composer-shell">
      {dragOver && <div className="mm-drop-hint">Drop lab report or prescription to analyze</div>}

      {pendingFile && (
        <div className="mm-pending">
          <FileText size={16} color="#0f766e" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {pendingFile.name}
            </strong>
            <span>{formatBytes(pendingFile.size)} · ready to analyze</span>
          </div>
          <button type="button" className="mm-icon-btn" onClick={onClearPending} aria-label="Remove">
            <X size={14} />
          </button>
          {/\.(png|jpe?g|webp)$/i.test(pendingFile.name) && (
            <label className="mm-voice-select">
              <span className="sr-only">Image type</span>
              <select value={pendingImageMode} onChange={(event) => setPendingImageMode(event.target.value)} aria-label="Uploaded image type">
                <option value="report">Report photo</option>
                <option value="xray">X-ray scan</option>
                <option value="mri">MRI scan</option>
              </select>
            </label>
          )}
        </div>
      )}

      {notice && <div className="mm-notice">{notice}</div>}

      <div className="mm-voice-preference">
        <Volume2 size={14} aria-hidden="true" />
        <label htmlFor="chat-speech-voice">Natural voice</label>
        <select
          id="chat-speech-voice"
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          aria-label="Natural speech voice"
        >
          {KOKORO_VOICES.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.label}
            </option>
          ))}
        </select>
        <span>Generated on this device</span>
      </div>

      <form className="mm-composer" onSubmit={onSubmit}>
        <input
          ref={fileRef}
          id="chat-document-file"
          type="file"
          className="sr-only"
          accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*"
          onChange={(e) => onPickFile(e.target.files?.[0])}
        />
        <label
          htmlFor="chat-document-file"
          className={`mm-icon-btn ${busy ? "pointer-events-none opacity-50" : ""}`}
          title="Attach document"
          aria-label="Attach document"
          aria-disabled={busy}
        >
          <Paperclip size={17} />
        </label>
        <button
          type="button"
          className={`mm-icon-btn ${listening ? "mm-icon-btn--danger" : ""}`}
          disabled={busy}
          onClick={onToggleListening}
          title={listening ? "Stop listening" : "Voice input"}
          aria-label={listening ? "Stop listening" : "Voice input"}
        >
          <Mic size={17} />
        </button>
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          placeholder={
            pendingFile
              ? "Add an optional note about this document…"
              : "Ask about symptoms, medicines, or paste a question…"
          }
          onChange={(e) => {
            setInput(e.target.value);
            onAutoResize?.();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e);
            }
          }}
        />
        {streaming ? (
          <button type="button" className="mm-send mm-send--stop" onClick={onStop} aria-label="Stop generating">
            <Square size={14} fill="currentColor" />
          </button>
        ) : (
          <button
            type="submit"
            className="mm-send"
            disabled={busy || (!input.trim() && !pendingFile)}
            aria-label="Send message"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        )}
      </form>
      <p className="mm-composer-foot">
        Enter to send · Shift+Enter newline · {shortcutHint}+V paste · Not for emergencies
      </p>
    </div>
  );
});

export default Composer;
