import React from "react";
import { ShieldCheck, Info, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { PremiumModal } from "./Overlay";
import { PremiumButton } from "./Controls";

export function ConsentPrompt({ open, onAccept, onCancel, fileName }) {
  return (
    <PremiumModal
      open={open}
      onClose={onCancel}
      title="Data Processing Consent"
      description="MediMind AI Privacy & Safety Protocol"
      size="md"
    >
      <div className="space-y-5 py-2">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-950/60">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-teal-600 dark:text-teal-400" size={20} />
            <div>
              <p className="text-sm font-semibold text-teal-950 dark:text-teal-100">
                Secure Upload: {fileName}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-teal-900 dark:text-teal-100">
                To analyze your medical records, MediMind AI uses encrypted OCR and advanced language models. Your data is handled according to ABDM privacy standards.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <CheckCircle2 size={12} />
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Purpose:</strong> Clinical data extraction and plain-language explanation for your personal health record.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <Info size={12} />
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Patient Control:</strong> You maintain full ownership. You can share this with doctors or revoke access at any time via the Consent Manager.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
              <AlertTriangle size={12} />
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Disclaimer:</strong> AI analysis is for informational purposes only and is not a substitute for professional medical advice.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <PremiumButton
            role="patient"
            fullWidth
            size="lg"
            icon={ShieldCheck}
            onClick={onAccept}
          >
            I Consent & Proceed
          </PremiumButton>
          <PremiumButton
            variant="outline"
            fullWidth
            size="lg"
            onClick={onCancel}
          >
            Cancel
          </PremiumButton>
        </div>
        <p className="text-center text-xs text-slate-600 dark:text-slate-400 uppercase tracking-widest font-semibold">
          Powered by MediMind Secure OCR
        </p>
      </div>
    </PremiumModal>
  );
}
