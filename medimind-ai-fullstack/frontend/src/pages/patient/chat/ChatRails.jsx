import { BookOpen, CalendarCheck, Sparkles, UploadCloud } from "lucide-react";
import { PROMPTS, URGENCY } from "./constants";

export function LeftRail({ busy, onPrompt }) {
  return (
    <aside className="mm-panel mm-chat__rail mm-chat__rail--left">
      <div className="mm-chat__rail-head">
        <h3>Quick start</h3>
        <p>Premium prompts curated for care navigation</p>
      </div>
      <div className="mm-chat__rail-body">
        {PROMPTS.map((p) => (
          <button
            key={p.label}
            type="button"
            className="mm-action"
            disabled={busy}
            onClick={() => onPrompt(p.prompt)}
          >
            <div className="mm-action__kicker">
              <Sparkles size={10} /> {p.kicker}
            </div>
            <div className="mm-action__label">{p.label}</div>
            <div className="mm-action__hint">{p.hint}</div>
          </button>
        ))}

        <label
          htmlFor="chat-document-file"
          aria-disabled={busy}
          className={`mm-action mm-action--upload ${busy ? "pointer-events-none opacity-50" : ""}`}
        >
          <div className="mm-action__kicker">
            <UploadCloud size={10} /> Documents
          </div>
          <div className="mm-action__label">Upload lab / prescription</div>
          <div className="mm-action__hint">PDF or photo · auto-extract details</div>
        </label>
      </div>
    </aside>
  );
}

export function RightRail({ insight, onBook }) {
  const urgencyInsight = URGENCY[insight.urgency] || URGENCY.routine;
  const UrgencyInsightIcon = urgencyInsight.icon;

  return (
    <aside className="mm-panel mm-chat__rail mm-chat__rail--right">
      <div className="mm-chat__rail-head">
        <h3>Session insight</h3>
        <p>Live signals from this conversation</p>
      </div>
      <div className="mm-chat__rail-body">
        <div className="mm-insight-card">
          <h4>Care posture</h4>
          <p style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            <span className={`mm-urgency ${urgencyInsight.cls}`}>
              <UrgencyInsightIcon size={11} /> {urgencyInsight.label}
            </span>
          </p>
        </div>

        {insight.lastDoc && (
          <div className="mm-insight-card">
            <h4>Latest document</h4>
            <p style={{ margin: "0 0 0.55rem", fontWeight: 650 }}>{insight.lastDoc.fileName}</p>
            <div className="mm-stats">
              <div className="mm-stat">
                <b>{insight.lastDoc.findingsCount}</b>
                <span>Find</span>
              </div>
              <div className="mm-stat">
                <b>{insight.lastDoc.medicationsCount}</b>
                <span>Meds</span>
              </div>
              <div className="mm-stat">
                <b>{insight.lastDoc.flagsCount}</b>
                <span>Flags</span>
              </div>
            </div>
          </div>
        )}

        <div className="mm-insight-card">
          <h4>Sources</h4>
          {Array.isArray(insight.sources) && insight.sources.length > 0 ? (
            insight.sources.slice(0, 4).map((s, i) => (
              <div key={i} className="mm-source">
                <BookOpen size={11} style={{ display: "inline", marginRight: 6, verticalAlign: -1 }} />
                {typeof s === "string" ? s : (
                  <span>
                    {s?.sourceUrl ? (
                      <a href={s.sourceUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
                        {s?.title || s?.source || `Reference ${i + 1}`}
                      </a>
                    ) : s?.title || s?.source || `Reference ${i + 1}`}
                    {(s?.publisher || s?.pageNumber) && (
                      <span style={{ display: "block", marginLeft: 17, fontSize: "0.68rem", opacity: 0.75 }}>
                        {[s.publisher, s.pageNumber ? `p. ${s.pageNumber}` : null].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </span>
                )}
              </div>
            ))
          ) : (
            <p style={{ margin: 0 }}>
              Answers draw from your uploaded records when available, plus careful general medical knowledge.
            </p>
          )}
        </div>

        {insight.explanation && (
          <div className="mm-insight-card">
            <h4>Why this answer</h4>
            <p style={{ margin: "0 0 0.4rem", fontWeight: 650 }}>{insight.explanation.result}</p>
            {Array.isArray(insight.explanation.extractedValues) &&
              insight.explanation.extractedValues.length > 0 && (
                <ul>
                  {insight.explanation.extractedValues.slice(0, 3).map((v, i) => (
                    <li key={`${v?.name}-${i}`}>
                      {[v?.name, v?.value, v?.unit].filter(Boolean).join(" ")}
                    </li>
                  ))}
                </ul>
              )}
            <p style={{ margin: "0.4rem 0 0" }}>
              <strong>Source:</strong> {insight.explanation.source}
            </p>
            <p style={{ margin: "0.25rem 0 0" }}>
              <strong>Confidence:</strong> {insight.explanation.confidence?.level}
              {insight.explanation.confidence?.score != null
                ? ` (${insight.explanation.confidence.score}%)`
                : ""}
            </p>
            <p style={{ margin: "0.25rem 0 0" }}>
              <strong>Action:</strong> {insight.explanation.suggestedAction}
            </p>
          </div>
        )}

        <div className="mm-insight-card">
          <h4>Safety</h4>
          <p style={{ margin: 0 }}>{insight.disclaimer}</p>
        </div>

        {urgencyInsight.book && (
          <button
            type="button"
            className="mm-cta"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => onBook(insight.urgency)}
          >
            <CalendarCheck size={14} /> Book from this session
          </button>
        )}
      </div>
    </aside>
  );
}
