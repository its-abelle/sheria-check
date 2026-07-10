import { useState } from "react";
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

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await submitReport(form);
      setSubmitted(true);
    } catch {
      alert("Failed to submit report. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    setSubmitted(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold text-gray-900">
            {submitted ? "Report Submitted" : "Report an Incident"}
          </h2>
          <button onClick={handleClose} className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="text-sm text-gray-600">
              Thank you. Your report has been submitted anonymously. This data helps expose
              corruption hotspots.
            </p>
            <button
              onClick={handleClose}
              className="rounded-lg bg-primary-500 px-4 py-2 text-sm text-white hover:bg-primary-600"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 px-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500">
                  Officer Name (optional)
                </label>
                <input
                  type="text"
                  value={form.officer_name}
                  onChange={(e) => setForm({ ...form, officer_name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">
                  Badge Number (optional)
                </label>
                <input
                  type="text"
                  value={form.officer_badge}
                  onChange={(e) => setForm({ ...form, officer_badge: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500">
                Location (optional)
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Thika Road, Kenol"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500">
                  Amount Demanded (KES)
                </label>
                <input
                  type="number"
                  value={form.amount_demanded || ""}
                  onChange={(e) =>
                    setForm({ ...form, amount_demanded: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">
                  Legal Amount (KES)
                </label>
                <p className="mt-1.5 text-sm text-gray-400">Check the offense page</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
            >
              {sending ? "Submitting..." : (
                <>
                  <Send className="h-4 w-4" /> Submit Report
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
