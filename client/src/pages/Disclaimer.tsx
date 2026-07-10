import { AlertTriangle } from "lucide-react";

export function Disclaimer() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="h-6 w-6 text-caution-500" />
        <h1 className="text-2xl font-bold text-gray-900">Legal Disclaimer</h1>
      </div>

      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
        <p>
          <strong>Sheria Check</strong> is an informational tool that provides references to
          publicly available legal texts, including the Traffic Act (Cap 403) and its amendments
          as published by the National Council for Law Reporting (Kenya Law).
        </p>

        <p>
          <strong>It does not constitute legal advice.</strong> The information provided is for
          general informational purposes only and may not reflect the most current legal
          developments. Laws and regulations can change, and the application of law depends on
          the specific circumstances of each case.
        </p>

        <p>
          You should <strong>not act or refrain from acting</strong> based on any information
          provided by Sheria Check without seeking legal counsel from a qualified legal
          professional licensed to practice in the relevant jurisdiction.
        </p>

        <p>
          While we strive to keep the data accurate and up-to-date, we make no representations
          or warranties of any kind, express or implied, about the completeness, accuracy,
          reliability, suitability, or availability of the information provided.
        </p>

        <div className="rounded-lg border border-caution-200 bg-caution-50 p-4 text-caution-700">
          <p className="font-semibold">Remember:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Never pay a fine on the spot — the officer should issue a charge sheet</li>
            <li>
              If you believe your rights have been violated, contact the Independent Policing
              Oversight Authority (IPOA)
            </li>
            <li>This tool does not replace the advice of a qualified lawyer</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
