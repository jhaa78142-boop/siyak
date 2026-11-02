import { Loader2 } from "lucide-react";
import DoctorChatAvatar from "./DoctorChatAvatar";
import { THINK_STEPS_CHAT, THINK_STEPS_UPLOAD } from "./constants";

export default function ThinkingCard({ uploading, stepIndex, phaseLabel }) {
  const steps = uploading ? THINK_STEPS_UPLOAD : THINK_STEPS_CHAT;
  return (
    <div className="mm-thinking" aria-live="polite">
      <div className="mm-avatar mm-avatar--ai">
        <DoctorChatAvatar className="mm-message-doctor-avatar" />
      </div>
      <div className="mm-thinking__card">
        <div className="mm-thinking__title">
          <Loader2 size={12} className="animate-spin" />
          {phaseLabel || (uploading ? "Reading your document" : "MediMind is thinking")}
        </div>
        <div className="mm-thinking__steps">
          {steps.map((label, i) => {
            const state = i < stepIndex ? "is-done" : i === stepIndex ? "is-active" : "";
            return (
              <div key={label} className={`mm-thinking__step ${state}`}>
                <span className="mm-dot" />
                {label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
