import { CheckCircle2 } from "lucide-react";

export default function ApplicationsSection({ applications = [] }) {
  const defaultApplications = [
    "Oil & Gas",
    "Chemical Processing",
    "Power Generation",
    "Petrochemical",
    "Pharmaceutical",
    "Food & Beverage",
    "Marine",
    "Construction"
  ];

  const items = applications.length > 0 ? applications : defaultApplications;

  return (
    <div className="bg-white border border-teal-pale rounded-lg overflow-hidden mt-5 shadow-rest">
      <div className="bg-deep px-6 py-4">
        <h3 className="font-display uppercase text-sm text-paper tracking-[0.15em]">
          Applications
        </h3>
      </div>
      <div className="p-5 sm:p-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              {/* Teal square bullet — industrial motif, not consumer checkmark */}
              <span className="shrink-0 w-2 h-2 bg-teal clip-corner-sm" aria-hidden="true" />
              <span className="text-[13px] font-medium text-steel-dark">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
