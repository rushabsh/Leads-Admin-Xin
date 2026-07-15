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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="font-bold text-sm">OCR Document Preview</h4>
          <button onClick={() => setPreviewDoc(null)} className="rounded-lg p-1 hover:bg-slate-50">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2">
          <span className="text-[10px] text-slate-400 block font-semibold uppercase">Document details</span>
          <p className="text-xs text-slate-800 dark:text-slate-350">
            <span className="font-semibold block">{previewDoc.name}</span>
            <span className="text-2xs text-slate-400 block">Category: {previewDoc.folder}</span>
          </p>
        </div>
        <div className="space-y-2">
          <span className="text-[10px] text-slate-400 block font-semibold uppercase">OCR Transcribed Text</span>
          <pre className="rounded-xl bg-slate-950 p-4 font-mono text-[10px] text-slate-200 overflow-x-auto whitespace-pre-wrap max-h-48 border border-slate-850">
            {previewDoc.ocrText || '[OCR data scan loading...]'}
          </pre>
        </div>
      </div>
    </div>
  );
}
