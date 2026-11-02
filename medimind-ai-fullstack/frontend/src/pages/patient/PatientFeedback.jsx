import { useState } from "react";
import { CheckCircle2, Send, Star } from "lucide-react";
import { PageHeader } from "../../components/premium/StatAndHeader";
import { PremiumButton } from "../../components/premium/Controls";
import { SectionCard } from "../../components/premium/Console";
import { api } from "../../lib/api";

export default function PatientFeedback() {
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = async (event) => {
    event.preventDefault();
    if (!rating) {
      setError("Choose a star rating before submitting.");
      return;
    }

    setSaving(true);
    setError("");
    setSubmitted(false);
    try {
      await api.post("/feedback", { rating, note, context: "patient-feedback" });
      setRating(0);
      setNote("");
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Your voice matters"
        title="Share feedback"
        description="Tell us about your experience. Your feedback is sent to the MediMind team."
      />

      <SectionCard
        icon={Star}
        title="How are we doing?"
        subtitle="Your rating and comments help us improve your care experience."
      >
        <form onSubmit={submitFeedback} className="space-y-5">
          <fieldset>
            <legend className="text-sm font-semibold text-[var(--mm-ink)]">Your rating</legend>
            <div className="mt-2 flex items-center gap-1" role="group" aria-label="Select a rating from 1 to 5 stars">
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setRating(value);
                      setError("");
                      setSubmitted(false);
                    }}
                    aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                    aria-pressed={rating === value}
                    className="rounded-md p-1 text-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mm-accent)]"
                  >
                    <Star size={28} fill={value <= rating ? "currentColor" : "none"} />
                  </button>
                );
              })}
              <span className="ml-2 text-sm text-[var(--mm-muted)]">
                {rating ? `${rating} out of 5` : "Select a rating"}
              </span>
            </div>
          </fieldset>

          <div>
            <label htmlFor="patient-feedback-note" className="text-sm font-semibold text-[var(--mm-ink)]">
              Comments <span className="font-normal text-[var(--mm-muted)]">(optional)</span>
            </label>
            <textarea
              id="patient-feedback-note"
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                setSubmitted(false);
              }}
              maxLength={2000}
              rows={5}
              placeholder="What went well, or what could we improve?"
              className="mt-2 w-full resize-y rounded-xl border border-[var(--mm-border)] bg-[var(--mm-surface)] px-4 py-3 text-sm text-[var(--mm-ink)] placeholder:text-[var(--mm-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--mm-accent)]"
            />
            <p className="mt-1 text-right text-xs text-[var(--mm-muted)]">{note.length}/2000</p>
          </div>

          {error && <p className="text-sm text-rose-600" role="alert">{error}</p>}
          {submitted && (
            <p className="flex items-center gap-2 text-sm text-emerald-700" role="status">
              <CheckCircle2 size={16} /> Thanks — your feedback was submitted.
            </p>
          )}

          <PremiumButton
            type="submit"
            role="patient"
            icon={Send}
            loading={saving}
            disabled={saving}
          >
            Submit feedback
          </PremiumButton>
        </form>
      </SectionCard>
    </div>
  );
}
