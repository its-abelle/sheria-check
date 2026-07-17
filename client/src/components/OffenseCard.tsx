import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle, Skull, Info } from "lucide-react";
import type { Offense } from "../types";
import { cn } from "../utils/cn";
import { formatKES } from "../utils/format";

interface OffenseCardProps {
  offense: Offense;
}

const severityConfig = {
  minor: {
    icon: Info,
    class: "border-green-200 bg-green-50 text-green-700",
  },
  serious: {
    icon: AlertTriangle,
    class: "border-caution-200 bg-caution-50 text-caution-600",
  },
  felony: {
    icon: Skull,
    class: "border-red-200 bg-red-50 text-red-700",
  },
};

export function OffenseCard({ offense }: OffenseCardProps) {
  const sev = severityConfig[offense.severity];
  const SevIcon = sev.icon;

  return (
    <Link
      to={`/offense/${offense.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                sev.class
              )}
            >
              <SevIcon className="h-3 w-3" />
              {offense.severity}
            </span>
            <span className="text-xs text-gray-500">{offense.citation}</span>
          </div>
          <h3 className="font-semibold text-gray-900 truncate">{offense.name}</h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{offense.description}</p>
        </div>
        <ArrowRight className="mt-2 h-5 w-5 shrink-0 text-gray-300" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="font-medium text-primary-500">
          {formatKES(offense.min_fine)} – {formatKES(offense.max_fine)}
        </span>
        {offense.max_imprisonment && (
          <span className="text-gray-500">up to {offense.max_imprisonment}</span>
        )}
      </div>
    </Link>
  );
}
