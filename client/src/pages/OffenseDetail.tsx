import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Shield, Flag, BookOpen, Share2, Check } from "lucide-react";
import { useOffenseDetail } from "../hooks/useOffenses";
import { useShare } from "../hooks/useShare";
import { DetailSkeleton } from "../components/LoadingSkeleton";
import { ReportModal } from "../components/ReportModal";
import { EmptyState } from "../components/EmptyState";
import { formatKES } from "../utils/format";
import { cn } from "../utils/cn";
import { useState, useCallback } from "react";

export function OffenseDetail() {
  const { offenseId } = useParams<{ offenseId: string }>();
  const { offense, loading, error } = useOffenseDetail(offenseId || "");
  const { share } = useShare();
  const [reportOpen, setReportOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    if (!offense) return;
    const result = await share({
      title: `Sheria Check: ${offense.name}`,
      text: `${offense.name} — Fine: ${formatKES(offense.min_fine)} – ${formatKES(offense.max_fine)}. Citation: ${offense.citation}. Course of action: ${offense.course_of_action}`,
      url: window.location.href,
    });
    if (result === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [offense, share]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <DetailSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 text-center" role="alert">
          {error}
        </div>
        <Link to="/" className="mt-4 block text-center text-sm text-primary-500 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  if (!offense) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <EmptyState variant="no-offenses" />
        <Link to="/" className="mt-4 block text-center text-sm text-primary-500 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to home
      </Link>

      <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
              offense.severity === "minor"
                ? "border-green-200 bg-green-50 text-green-700"
                : offense.severity === "serious"
                ? "border-caution-200 bg-caution-50 text-caution-600"
                : "border-red-200 bg-red-50 text-red-700"
            )}
          >
            {offense.severity === "felony" ? "CRIMINAL OFFENSE" : offense.severity.toUpperCase()}
          </span>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{offense.name}</h1>
          <p className="mt-1 text-gray-500">{offense.description}</p>
        </div>

        {/* Fine Range */}
        <div className="mb-6 grid gap-4 rounded-lg bg-primary-50 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-primary-600">Minimum Penalty</p>
            <p className="text-2xl font-bold text-primary-500">{formatKES(offense.min_fine)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-primary-600">Maximum Penalty</p>
            <p className="text-2xl font-bold text-primary-500">{formatKES(offense.max_fine)}</p>
          </div>
          {offense.max_imprisonment && (
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-primary-600">Maximum Imprisonment</p>
              <p className="text-lg font-semibold text-gray-700">{offense.max_imprisonment}</p>
            </div>
          )}
        </div>

        {/* Legal Citation */}
        <div className="mb-6 space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <BookOpen className="h-4 w-4" aria-hidden="true" /> Legal Citation
          </h2>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-sm">
            <p>
              <span className="text-gray-500">Act:</span> {offense.act}
            </p>
            <p>
              <span className="text-gray-500">Section:</span> {offense.section}
            </p>
            <p>
              <span className="text-gray-500">Citation:</span> {offense.citation}
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Show this to the officer. The legal fine for this offense is between {formatKES(offense.min_fine)} and {formatKES(offense.max_fine)}.
          </p>
        </div>

        {/* Course of Action */}
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Shield className="h-4 w-4" aria-hidden="true" /> If you are stopped
          </h2>
          <div className={cn(
            "rounded-lg border p-4 text-sm leading-relaxed",
            offense.severity === "minor"
              ? "border-primary-200 bg-primary-50 text-primary-800"
              : offense.severity === "serious"
              ? "border-caution-200 bg-caution-50 text-caution-800"
              : "border-red-200 bg-red-50 text-red-800 font-medium"
          )}>
            {offense.course_of_action}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 border-t pt-4">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Print Summary
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            aria-label={copied ? "Copied to clipboard" : "Share this offense"}
          >
            {copied ? (
              <><Check className="h-4 w-4 text-green-500" aria-hidden="true" /> Copied</>
            ) : (
              <><Share2 className="h-4 w-4" aria-hidden="true" /> Share</>
            )}
          </button>
          <button
            onClick={() => setReportOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Flag className="h-4 w-4" aria-hidden="true" /> Report Incident
          </button>
        </div>
      </article>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        offenseId={offense.id}
      />
    </div>
  );
}
