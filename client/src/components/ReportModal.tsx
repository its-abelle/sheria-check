import { useState, useRef, useEffect } from "react";
import { X, Send, CheckCircle } from "lucide-react";
import { submitReport } from "../services/api";
import type { ReportPayload } from "../types";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  offenseId?: string;
}

export function ReportModal({ open, onClose, offenseId }: ReportModalProps) {
  const [form, setForm] = useState<ReportPayload>({
    offense_id: offenseId,
    officer_name: "",
    officer_badge: "",
    location: "",
    amount_demanded: undefined,
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      firstInputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();

      // Basic focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await submitReport(form);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    setSubmitted(false);
    setError(null);
    setForm({
      offense_id: offenseId,
      officer_name: "",
      officer_badge: "",
      location: "",
      amount_demanded: undefined,
      description: "",
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
    >
      <div ref={dialogRef} className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 id="report-title" className="font-semibold text-gray-900">
            {submitted ? "Report Submitted" : "Report an Incident"}
          </h2>
          <button
            onClick={handleClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" aria-hidden="true" />
            <p className="text-sm text-gray-600">
              Thank you. Your report has been submitted anonymously. This data helps expose
              corruption hotspots and holds officers accountable.
            </p>
            <button
              onClick={handleClose}
              className="rounded-lg bg-primary-500 px-4 py-2 text-sm text-white hover:bg-primary-600 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 px-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="officer-name" className="block text-xs font-medium text-gray-500">
                  Officer Name <span className="text-gray-300">(optional)</span>
                </label>
                <input
                  ref={firstInputRef}
                  id="officer-name"
                  type="text"
                  value={form.officer_name}
                  onChange={(e) => setForm({ ...form, officer_name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="officer-badge" className="block text-xs font-medium text-gray-500">
                  Badge Number <span className="text-gray-300">(optional)</span>
                </label>
                <input
                  id="officer-badge"
                  type="text"
                  value={form.officer_badge}
                  onChange={(e) => setForm({ ...form, officer_badge: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-xs font-medium text-gray-500">
                Location <span className="text-gray-300">(optional)</span>
              </label>
              <input
                id="location"
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Thika Road, Kenol"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="amount-demanded" className="block text-xs font-medium text-gray-500">
                  Amount Demanded (KES)
                </label>
                <input
                  id="amount-demanded"
                  type="number"
                  min={0}
                  value={form.amount_demanded || ""}
                  onChange={(e) =>
                    setForm({ ...form, amount_demanded: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <p className="block text-xs font-medium text-gray-500">Legal Amount</p>
                <p className="mt-1.5 text-sm text-gray-400">Check the offense page</p>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-medium text-gray-500">
                What happened? <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Describe what happened. Include any relevant details."
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {sending ? "Submitting..." : (
                <><Send className="h-4 w-4" aria-hidden="true" /> Submit Report</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
