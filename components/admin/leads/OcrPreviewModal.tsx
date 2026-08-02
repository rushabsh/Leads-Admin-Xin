'use client';

import React from 'react';
import { X } from 'lucide-react';

interface OcrPreviewModalProps {
  previewDoc: any;
  setPreviewDoc: (val: any) => void;
}

export default function OcrPreviewModal({ previewDoc, setPreviewDoc }: OcrPreviewModalProps) {
  if (!previewDoc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-bold text-sm text-slate-900">OCR Document Preview</h4>
          <button onClick={() => setPreviewDoc(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Document details</span>
          <p className="text-xs text-slate-800">
            <span className="font-semibold block text-slate-900">{previewDoc.name}</span>
            <span className="text-xs text-slate-500 block mt-0.5">Category: {previewDoc.folder}</span>
          </p>
        </div>
        <div className="space-y-1.5">
          <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">OCR Transcribed Text</span>
          <pre className="rounded-xl bg-slate-50 p-4 font-mono text-xs text-slate-800 overflow-x-auto whitespace-pre-wrap max-h-48 border border-slate-200">
            {previewDoc.ocrText || '[OCR data scan loading...]'}
          </pre>
        </div>
      </div>
    </div>
  );
}
