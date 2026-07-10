import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Scale, Flag, BookOpen } from "lucide-react";
import { useOffenseDetail } from "../hooks/useOffenses";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ReportModal } from "../components/ReportModal";
import { formatKES } from "../utils/format";
import { cn } from "../utils/cn";
import { useState } from "react";

export function OffenseDetail() {
  const { offenseId } = useParams<{ offenseId: string }>();
  const { offense, loading, error } = useOffenseDetail(offenseId || "");
  const [reportOpen, setReportOpen] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-red-500">{error}</p>
        <Link to="/" className="mt-2 inline-block text-sm text-primary-500 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }
  if (!offense) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-gray-500">Offense not found.</p>
        <Link to="/" className="mt-2 inline-block text-sm text-primary-500 hover:underline">
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
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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
            {offense.severity.toUpperCase()}
          </span>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{offense.name}</h1>
          <p className="mt-1 text-gray-500">{offense.description}</p>
        </div>

        {/* Fine Range */}
        <div className="mb-6 grid gap-4 rounded-lg bg-primary-50 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-primary-600">Minimum Fine</p>
            <p className="text-2xl font-bold text-primary-500">{formatKES(offense.min_fine)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-primary-600">Maximum Fine</p>
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
            <BookOpen className="h-4 w-4" /> Legal Citation
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
        </div>

        {/* Course of Action */}
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Scale className="h-4 w-4" /> Course of Action
          </h2>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            {offense.course_of_action}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 border-t pt-4">
          <button
            onClick={() => window.print()}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Print Summary
          </button>
          <button
            onClick={() => setReportOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Flag className="h-4 w-4" /> Report Incident
          </button>
        </div>
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        offenseId={offense.id}
      />
    </div>
  );
}
