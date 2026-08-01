'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, FilePlus, Download, Check, AlertCircle } from 'lucide-react';

interface CsvImportModalProps {
  showImportModal: boolean;
  setShowImportModal: (val: boolean) => void;
  csvStep: 'upload' | 'preview' | 'validate' | 'import';
  setCsvStep: (val: 'upload' | 'preview' | 'validate' | 'import') => void;
  parsedCsvData: any[];
  validationErrors: string[];
  importSummary: { success: number; failed: number; reports: string[] } | null;
  onCSVFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidateCsv: () => void;
  onCSVImportConfirm: () => void;
  onDownloadTemplate: () => void;
}

export default function CsvImportModal({
  showImportModal,
  setShowImportModal,
  csvStep,
  setCsvStep,
  parsedCsvData,
  validationErrors,
  importSummary,
  onCSVFileChange,
  onValidateCsv,
  onCSVImportConfirm,
  onDownloadTemplate
}: CsvImportModalProps) {
  if (!showImportModal) return null;

  const handleClose = () => {
    setShowImportModal(false);
    setCsvStep('upload');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">CSV Leads Ingestion Pipeline</h3>
            <p className="text-xs text-slate-400">
              Upload, preview, validate, and batch import leads directly.
            </p>
          </div>
          <button onClick={handleClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Stepper Wizard Indicator */}
        <div className="flex border-b border-slate-100 bg-slate-50 p-4 text-xs font-bold uppercase tracking-wider text-slate-400 justify-between items-center px-6">
          <span className={csvStep === 'upload' ? 'text-blue-600 font-extrabold' : ''}>1. Upload File</span>
          <span className="text-slate-300">→</span>
          <span className={csvStep === 'preview' ? 'text-blue-600 font-extrabold' : ''}>2. Preview Rows</span>
          <span className="text-slate-300">→</span>
          <span className={csvStep === 'validate' ? 'text-blue-600 font-extrabold' : ''}>3. Run Validation</span>
          <span className="text-slate-300">→</span>
          <span className={csvStep === 'import' ? 'text-blue-600 font-extrabold' : ''}>4. Save Ingestion</span>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[55vh] overflow-y-auto">
          {csvStep === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 hover:bg-slate-50 cursor-pointer transition-colors duration-200 flex flex-col items-center gap-3 relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={onCSVFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FilePlus className="h-10 w-10 text-blue-600" />
                <p className="text-xs font-bold text-slate-900">Ingest CSV File here</p>
                <p className="text-xs text-slate-500 text-center">
                  Click to select local file (columns: firstName, lastName, phone, email, state, campaign, vendor, dob, gender, address, ssn, caseDetails)
                </p>
              </div>
              <div className="flex justify-between items-center text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-600 font-medium">Need a sample file to get started?</span>
                <button
                  onClick={onDownloadTemplate}
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:underline font-bold focus:outline-none cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Download CSV Template
                </button>
              </div>
            </div>
          )}

          {csvStep === 'preview' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900">Mapped Data Preview</h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <th className="p-2.5 font-semibold">Name</th>
                      <th className="p-2.5 font-semibold">Phone</th>
                      <th className="p-2.5 font-semibold">Email</th>
                      <th className="p-2.5 font-semibold">State</th>
                      <th className="p-2.5 font-semibold">Campaign</th>
                      <th className="p-2.5 font-semibold">Vendor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedCsvData.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/60">
                        <td className="p-2.5 font-medium text-slate-900">
                          {row.firstName} {row.lastName}
                        </td>
                        <td className="p-2.5 text-slate-600">{row.phone}</td>
                        <td className="p-2.5 text-slate-600">{row.email}</td>
                        <td className="p-2.5 font-bold text-slate-900">{row.state || 'CA'}</td>
                        <td className="p-2.5 text-blue-600 font-medium">{row.campaign || 'Default'}</td>
                        <td className="p-2.5 text-slate-600">{row.vendor || 'Default'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedCsvData.length > 5 && (
                <p className="text-xs text-slate-400">
                  ...and {parsedCsvData.length - 5} more records parsed.
                </p>
              )}
              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={() => setCsvStep('upload')}
                  className="rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-50 font-semibold text-slate-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={onValidateCsv}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 font-semibold transition-colors shadow-xs"
                >
                  Proceed to Validation
                </button>
              </div>
            </div>
          )}

          {csvStep === 'validate' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {validationErrors.length === 0 ? (
                  <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700 w-full border border-emerald-200">
                    <Check className="h-4.5 w-4.5 text-emerald-600" /> Validation passed! Ready to ingest {parsedCsvData.length} records.
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700 w-full border border-rose-200">
                    <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" /> Validation completed with {validationErrors.length} notices.
                  </div>
                )}
              </div>

              {validationErrors.length > 0 && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 max-h-40 overflow-y-auto space-y-1 font-mono text-xs text-rose-700">
                  {validationErrors.map((err, index) => (
                    <div key={index}>• {err}</div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={() => setCsvStep('preview')}
                  className="rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-50 font-semibold text-slate-700 transition-colors"
                >
                  Back
                </button>
                {validationErrors.length === 0 ? (
                  <button
                    onClick={onCSVImportConfirm}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 font-semibold transition-colors shadow-xs"
                  >
                    Import All Leads
                  </button>
                ) : (
                  <button
                    onClick={onCSVImportConfirm}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 font-semibold transition-colors shadow-xs"
                  >
                    Force Import Valid Only
                  </button>
                )}
              </div>
            </div>
          )}

          {csvStep === 'import' && (
            <div className="space-y-4">
              {!importSummary ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                  <p className="text-xs font-bold text-slate-600">Processing ingestion pipeline...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <div className="flex-1 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        <span className="text-lg font-bold">{importSummary.success}</span>
                        <span>Leads successfully imported</span>
                      </div>
                      <div className="flex-1 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 border border-rose-200">
                        <span className="text-lg font-bold">{importSummary.failed}</span>
                        <span>Rows skipped / duplicate</span>
                      </div>
                    </div>
                  </div>

                  {importSummary.reports.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase text-slate-400">Ingestion log report</h5>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 max-h-48 overflow-y-auto space-y-1.5 font-mono text-xs text-slate-700">
                        {importSummary.reports.map((report, idx) => (
                          <div
                            key={idx}
                            className="flex gap-1.5 border-b border-slate-200/50 pb-1 last:border-0"
                          >
                            <span className="text-rose-600">•</span>
                            <span>{report}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      onClick={handleClose}
                      className="rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700 font-semibold transition-colors cursor-pointer shadow-sm"
                    >
                      Finish Ingestion
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
