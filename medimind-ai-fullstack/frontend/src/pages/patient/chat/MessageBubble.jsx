import { memo, useCallback, useState } from "react";
import {
  BookOpen,
  CalendarCheck,
  Check,
  ChevronDown,
  ClipboardCheck,
  Copy,
  FileText,
  FlaskConical,
  Gauge,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  User,
  Volume2,
} from "lucide-react";
import { URGENCY } from "./constants";
import { formatBytes, formatTime } from "./utils";
import MarkdownProse from "./MarkdownProse";
import DoctorChatAvatar from "./DoctorChatAvatar";

const CONFIDENCE_TONE = {
  High: "mm-explain__val--good",
  Medium: "mm-explain__val--warn",
  Low: "mm-explain__val--bad",
};

function formatExtractedValue(v) {
  return [v?.name, v?.value, v?.unit].filter(Boolean).join(" ");
}

/* Explainable AI — shows WHY the answer was given, not just the answer. */
function ExplainPanel({ explanation }) {
  const [open, setOpen] = useState(true);
  if (!explanation) return null;

  const confidence = explanation.confidence || {};
  const tone = CONFIDENCE_TONE[confidence.level] || CONFIDENCE_TONE.Medium;
  const values = Array.isArray(explanation.extractedValues) ? explanation.extractedValues : [];
  const scopeTag =
    explanation.scope === "out-of-scope"
      ? "Out of scope"
      : explanation.scope === "emergency"
        ? "Safety"
        : null;

  return (
    <div className={`mm-explain${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="mm-explain__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <Sparkles size={12} />
        <span>Why this answer?</span>
        {scopeTag && <span className="mm-explain__tag">{scopeTag}</span>}
        <ChevronDown size={13} className="mm-explain__chev" />
      </button>

      {open && (
        <dl className="mm-explain__body">
          <div className="mm-explain__row">
            <dt>
              <Sparkles size={11} /> AI Result
            </dt>
            <dd>{explanation.result}</dd>
          </div>

          <div className="mm-explain__row">
            <dt>
              <FlaskConical size={11} /> Extracted value
            </dt>
            <dd>
              {values.length ? (
                <ul className="mm-explain__list">
                  {values.map((v, i) => (
                    <li key={`${v?.name}-${i}`}>
                      {formatExtractedValue(v)}
                      {v?.status && v.status !== "unknown" ? <em> · {v.status}</em> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="mm-explain__muted">Not extracted from a personal record</span>
              )}
            </dd>
          </div>

          <div className="mm-explain__row">
            <dt>
              <BookOpen size={11} /> Source
            </dt>
            <dd>{explanation.source}</dd>
          </div>

          <div className="mm-explain__row">
            <dt>
              <Gauge size={11} /> Confidence
            </dt>
            <dd>
              <span className={`mm-explain__val ${tone}`}>
                {confidence.level || "Medium"}
                {confidence.score != null ? ` · ${confidence.score}%` : ""}
              </span>
              {confidence.reason ? (
                <span className="mm-explain__muted"> — {confidence.reason}</span>
              ) : null}
            </dd>
          </div>

          <div className="mm-explain__row">
            <dt>
              <ClipboardCheck size={11} /> Suggested action
            </dt>
            <dd>{explanation.suggestedAction}</dd>
          </div>

          <div className="mm-explain__row">
            <dt>
              <ShieldAlert size={11} /> Safety note
            </dt>
            <dd>{explanation.safetyNote}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  streaming,
  onSpeak,
  speechState,
  speechMessageId,
  onBook,
  onCopy,
  onRegenerate,
  onFeedback,
  isLastAi,
}) {
  const isUser = message.role === "user";
  const urg = URGENCY[message.urgency || "routine"] || URGENCY.routine;
  const UrgIcon = urg.icon;
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.text || "");
      setCopied(true);
      onCopy?.(message);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }, [message, onCopy]);

  const handleFeedback = useCallback(
    (value) => {
      setFeedback(value);
      onFeedback?.(message, value);
    },
    [message, onFeedback]
  );

  return (
    <article
      className={`mm-msg ${isUser ? "mm-msg--user" : "mm-msg--ai"}${streaming ? " mm-msg--streaming" : ""}`}
      data-role={message.role}
    >
      <div className={`mm-avatar ${isUser ? "mm-avatar--user" : "mm-avatar--ai"}`} aria-hidden>
        {isUser ? <User size={14} /> : <DoctorChatAvatar className="mm-message-doctor-avatar" />}
      </div>

      <div className="mm-bubble-col">
        <div className="mm-bubble">
          {message.attachment && (
            <div className="mm-attach">
              <div className="mm-attach__icon">
                <FileText size={15} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="mm-attach__name">{message.attachment.name}</div>
                <div className="mm-attach__sub">
                  {message.attachment.type}
                  {message.attachment.size ? ` · ${formatBytes(message.attachment.size)}` : ""}
                </div>
              </div>
            </div>
          )}

          <MarkdownProse text={message.text} streaming={!!streaming && !isUser} />

          {message.reportCard && (
            <div className="mm-stats">
              <div className="mm-stat">
                <b>{message.reportCard.findingsCount}</b>
                <span>Findings</span>
              </div>
              <div className="mm-stat">
                <b>{message.reportCard.medicationsCount}</b>
                <span>Meds</span>
              </div>
              <div className="mm-stat">
                <b>{message.reportCard.flagsCount}</b>
                <span>Flags</span>
              </div>
            </div>
          )}

          {!isUser && !streaming && (
            <div className="mm-bubble__meta">
              <span className={`mm-urgency ${urg.cls}`}>
                <UrgIcon size={11} /> {urg.label}
              </span>
              {message.at && <span className="mm-time">{formatTime(message.at)}</span>}
            </div>
          )}
        </div>

        {isUser && message.at && <span className="mm-time">{formatTime(message.at)}</span>}

        {!isUser && !streaming && (
          <div className="mm-msg-actions">
            <button type="button" className="mm-chip-btn" onClick={handleCopy} title="Copy">
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              className="mm-chip-btn"
              onClick={() => onSpeak?.(message.text, message.id)}
              title={speechMessageId === message.id && speechState !== "idle" ? "Stop speaking" : "Listen with natural voice"}
              aria-label={speechMessageId === message.id && speechState !== "idle" ? "Stop speaking" : "Listen with natural voice"}
            >
              {speechMessageId === message.id && speechState === "loading"
                ? <Loader2 size={12} className="animate-spin" />
                : <Volume2 size={12} />}
              {speechMessageId === message.id && speechState === "loading"
                ? "Preparing voice…"
                : speechMessageId === message.id && speechState === "speaking"
                  ? "Stop voice"
                  : "Listen"}
            </button>
            {isLastAi && (
              <button
                type="button"
                className="mm-chip-btn"
                onClick={() => onRegenerate?.(message)}
                title="Regenerate"
              >
                <RefreshCw size={12} /> Regenerate
              </button>
            )}
            <button
              type="button"
              className={`mm-chip-btn ${feedback === "up" ? "is-on" : ""}`}
              onClick={() => handleFeedback("up")}
              title="Helpful"
              aria-pressed={feedback === "up"}
            >
              <ThumbsUp size={12} />
            </button>
            <button
              type="button"
              className={`mm-chip-btn ${feedback === "down" ? "is-on" : ""}`}
              onClick={() => handleFeedback("down")}
              title="Not helpful"
              aria-pressed={feedback === "down"}
            >
              <ThumbsDown size={12} />
            </button>
          </div>
        )}

        {!isUser && !streaming && message.explanation && (
          <ExplainPanel explanation={message.explanation} />
        )}

        {!isUser && !streaming && urg.book && (
          <button type="button" className="mm-cta" onClick={() => onBook?.(message.urgency)}>
            <CalendarCheck size={13} /> Book appointment
          </button>
        )}
      </div>
    </article>
  );
}

function propsEqual(prev, next) {
  return (
    prev.streaming === next.streaming &&
    prev.isLastAi === next.isLastAi &&
    prev.message === next.message &&
    prev.onSpeak === next.onSpeak &&
    prev.speechState === next.speechState &&
    prev.speechMessageId === next.speechMessageId &&
    prev.onBook === next.onBook &&
    prev.onRegenerate === next.onRegenerate
  );
}

export default memo(MessageBubble, propsEqual);
