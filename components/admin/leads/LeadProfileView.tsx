'use client';

import React from 'react';
import {
  ChevronLeft, Sparkles, Users, Scale, FileText, MessageSquare, Clock,
  CheckSquare, Upload, Eye, Download, Trash2, Send, CheckCircle,
  Square, Calendar, ShieldCheck
} from 'lucide-react';

interface LeadProfileViewProps {
  selectedLead: any;
  setSelectedLead: (val: any) => void;
  leadDetails: any;
  setLeadDetails: (val: any) => void;
  isLoadingDetails: boolean;
  activeProfileTab: 'personal' | 'case' | 'documents' | 'notes' | 'tasks' | 'audits';
  setActiveProfileTab: (val: 'personal' | 'case' | 'documents' | 'notes' | 'tasks' | 'audits') => void;
  docUploadFolder: string;
  setDocUploadFolder: (val: string) => void;
  newNoteText: string;
  setNewNoteText: (val: string) => void;
  newTaskTitle: string;
  setNewTaskTitle: (val: string) => void;
  newTaskDueDate: string;
  setNewTaskDueDate: (val: string) => void;
  newTaskPriority: string;
  setNewTaskPriority: (val: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onRefreshProfile: () => void;
  onUpdateStatus: (status: string) => void;
  onAddNote: (e: React.FormEvent) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteDocument: (docId: string) => void;
  onPreviewDoc: (doc: any) => void;
  onCreateTask: (e: React.FormEvent) => void;
  onToggleTaskStatus: (taskId: string, currentStatus: string) => void;
  onDownloadSimulate: () => void;
}

export default function LeadProfileView({
  selectedLead,
  setSelectedLead,
  leadDetails,
  setLeadDetails,
  isLoadingDetails,
  activeProfileTab,
  setActiveProfileTab,
  docUploadFolder,
  setDocUploadFolder,
  newNoteText,
  setNewNoteText,
  newTaskTitle,
  setNewTaskTitle,
  newTaskDueDate,
  setNewTaskDueDate,
  newTaskPriority,
  setNewTaskPriority,
  fileInputRef,
  onRefreshProfile,
  onUpdateStatus,
  onAddNote,
  onFileUpload,
  onDeleteDocument,
  onPreviewDoc,
  onCreateTask,
  onToggleTaskStatus,
  onDownloadSimulate
}: LeadProfileViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b pb-4 border-slate-100 dark:border-slate-855">
        <button
          onClick={() => {
            setSelectedLead(null);
            setLeadDetails(null);
            onRefreshProfile(); // Refresh table lists on back
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4.5 w-4.5" /> Back to Leads
        </button>

        {/* Quick Status Control */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-450 uppercase">Update Status:</span>
          <select
            value={leadDetails?.status || selectedLead.status}
            onChange={(e) => onUpdateStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold outline-none dark:border-slate-850 dark:bg-slate-900"
          >
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="REJECTED">Rejected</option>
            <option value="SIGNED_RETAINER">Retained</option>
          </select>
        </div>
      </div>

      {isLoadingDetails || !leadDetails ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : !selectedLead ? (
        null
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Summary Card */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-bold text-lg">
                  {leadDetails.firstName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {leadDetails.firstName} {leadDetails.lastName}
                  </h2>
                  <span className="font-mono text-xs text-blue-600 font-bold">{leadDetails.leadId}</span>
                </div>
              </div>

              {/* AI Summary Badge */}
              <div className="rounded-xl bg-blue-50 p-3.5 border border-blue-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-600 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> AI Lead Score: {leadDetails.leadScore || 70}/99
                  </span>
                  {leadDetails.duplicateDetected && (
                    <span className="rounded bg-rose-50 px-1.5 py-0.5 text-xs font-bold text-rose-600 border border-rose-200">
                      DUPLICATE
                    </span>
                  )}
                </div>
                <p className="text-slate-600 leading-relaxed text-xs">
                  {leadDetails.aiSummary || 'Scanning qualifiers...'}
                </p>
              </div>

              {/* Meta details list */}
              <div className="space-y-2 text-xs border-t pt-3 border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Campaign</span>
                  <span className="font-semibold text-blue-600">{leadDetails.campaign?.name || 'Inbound'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vendor</span>
                  <span className="font-semibold text-slate-900">{leadDetails.vendor?.name || 'Direct API'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Intake Agent</span>
                  <span className="font-semibold text-slate-900">{leadDetails.intakeAgent?.name || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Law Firm</span>
                  <span className="font-semibold text-blue-600">{leadDetails.lawFirm?.name || 'Direct/Pending'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date Logged</span>
                  <span className="font-semibold text-slate-900">{new Date(leadDetails.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Workspaces & Tabs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Tabs Navigation */}
            <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
              {[
                { id: 'personal', label: 'Personal Information', icon: Users },
                { id: 'case', label: 'Case Qualifier details', icon: Scale },
                { id: 'documents', label: 'Medical & Retainer Docs', icon: FileText },
                { id: 'notes', label: 'Internal Notes', icon: MessageSquare },
                { id: 'tasks', label: 'Callback Checklist', icon: CheckSquare },
                { id: 'audits', label: 'Audit Trail Logs', icon: Clock }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveProfileTab(tab.id as any)}
                  className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all duration-200 whitespace-nowrap focus:outline-none ${
                    activeProfileTab === tab.id
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content panels */}
            <div className="min-h-72">
              {/* 1. PERSONAL INFORMATION */}
              {activeProfileTab === 'personal' && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b pb-2 border-slate-100">
                    Personal Information
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">First Name</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">{leadDetails.firstName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Last Name</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">{leadDetails.lastName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Date of Birth</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">{leadDetails.dob || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Gender</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">{leadDetails.gender || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">SSN (Confidential)</span>
                      <span className="font-semibold text-slate-900 block mt-0.5 font-mono">
                        {leadDetails.ssn ? `***-**-${leadDetails.ssn.slice(-4)}` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Contact Email</span>
                      <span className="font-semibold text-blue-600 block mt-0.5">{leadDetails.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Contact Phone</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">{leadDetails.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Jurisdiction State</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">{leadDetails.state}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block">Residential Address</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">{leadDetails.address || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. CASE QUALIFIER DETAILS */}
              {activeProfileTab === 'case' && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b pb-2 border-slate-100">
                    Case Qualifier details
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">Mass Tort Category</span>
                      <span className="font-semibold text-blue-600 block mt-0.5">
                        {leadDetails.campaign?.massTort?.name || leadDetails.tortName || 'General Litigations'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Exposure Window / Date</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">{leadDetails.exposure || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Incident Date</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">{leadDetails.incidentDate || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Medical Diagnosis</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">{leadDetails.diagnosis || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Associated Symptoms</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">{leadDetails.symptoms || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Treating Hospital / Clinic</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">{leadDetails.hospital || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Attorney Assigned</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">{leadDetails.attorney || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Case Ingestion Status</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">{leadDetails.status}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block">Case Details Text</span>
                      <span className="font-semibold text-slate-900 block mt-0.5 whitespace-pre-line leading-relaxed">
                        {leadDetails.caseDetails || 'No details provided.'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. MEDICAL & RETAINER DOCUMENTS */}
              {activeProfileTab === 'documents' && (
                <div className="space-y-4">
                  {/* Upload panel */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-900 block">Inbound Ingestion Documents</span>
                        <span className="text-slate-400 text-xs">
                          OCR scan processes text immediately on save.
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        value={docUploadFolder}
                        onChange={(e) => setDocUploadFolder(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
                      >
                        <option value="Medical Records">Medical Records</option>
                        <option value="Retainer Agreement">Retainer</option>
                        <option value="ID Proof">ID Proof</option>
                        <option value="Medical Bills">Bills</option>
                        <option value="Exposure Photos">Photos</option>
                        <option value="Signed Contracts">Signed Docs</option>
                      </select>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={onFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                      >
                        <Upload className="h-3.5 w-3.5" /> Upload file
                      </button>
                    </div>
                  </div>

                  {/* Documents Table */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                          <th className="p-4 font-semibold uppercase tracking-wider text-xs">Document Name</th>
                          <th className="p-4 font-semibold uppercase tracking-wider text-xs">Folder Category</th>
                          <th className="p-4 font-semibold uppercase tracking-wider text-xs">Upload Date</th>
                          <th className="p-4 font-semibold uppercase tracking-wider text-xs">OCR Analysis</th>
                          <th className="p-4 text-right font-semibold uppercase tracking-wider text-xs">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {!leadDetails.documents || leadDetails.documents.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400">
                              No ingestion documents uploaded for this client yet.
                            </td>
                          </tr>
                        ) : (
                          leadDetails.documents.map((doc: any) => (
                            <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="p-4 font-semibold text-slate-900 flex items-center gap-1.5">
                                <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                                <span>{doc.name}</span>
                              </td>
                              <td className="p-4">
                                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                  {doc.folder}
                                </span>
                              </td>
                              <td className="p-4 text-slate-400">
                                {new Date(doc.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold">
                                  <ShieldCheck className="h-3 w-3 text-emerald-600" /> VERIFIED
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-1">
                                  <button
                                    onClick={() => onPreviewDoc(doc)}
                                    title="OCR Preview"
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                                  >
                                    <Eye className="h-4.5 w-4.5" />
                                  </button>
                                  <button
                                    onClick={onDownloadSimulate}
                                    title="Download"
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                                  >
                                    <Download className="h-4.5 w-4.5" />
                                  </button>
                                  <button
                                    onClick={() => onDeleteDocument(doc.id)}
                                    title="Delete"
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
                                  >
                                    <Trash2 className="h-4.5 w-4.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. INTERNAL NOTES */}
              {activeProfileTab === 'notes' && (
                <div className="space-y-4">
                  {/* Notes Inbound Form */}
                  <form
                    onSubmit={onAddNote}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
                  >
                    <textarea
                      rows={2}
                      required
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Log callback notes, intake records, exposure validations..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-xs"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                      >
                        <Send className="h-3.5 w-3.5" /> Add Note
                      </button>
                    </div>
                  </form>

                  {/* Notes History */}
                  <div className="space-y-3">
                    {!leadDetails.activityLogs ||
                    leadDetails.activityLogs.filter((log: any) => log.action === 'NOTE_ADDED').length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
                        No notes added for this lead yet.
                      </div>
                    ) : (
                      leadDetails.activityLogs
                        .filter((log: any) => log.action === 'NOTE_ADDED')
                        .map((note: any) => (
                          <div
                            key={note.id}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
                          >
                            <div className="flex justify-between items-center text-xs text-slate-400 font-semibold mb-2">
                              <span>Added by {note.user?.name || 'Intake Agent'}</span>
                              <span>{new Date(note.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                              {note.details}
                            </p>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* 5. CALLBACK CHECKLIST (TASKS) */}
              {activeProfileTab === 'tasks' && (
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Tasks List */}
                  <div className="md:col-span-2 space-y-3">
                    {!leadDetails.tasks || leadDetails.tasks.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
                        All checklist follow-ups completed!
                      </div>
                    ) : (
                      leadDetails.tasks.map((task: any) => (
                        <div
                          key={task.id}
                          className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => onToggleTaskStatus(task.id, task.status)}
                              className="text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                            >
                              {task.status === 'COMPLETED' ? (
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                              ) : (
                                <Square className="h-5 w-5 text-slate-300" />
                              )}
                            </button>
                            <div>
                              <p
                                className={`text-xs font-semibold text-slate-900 ${
                                  task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''
                                }`}
                              >
                                {task.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                <span className="flex items-center gap-0.5">
                                  <Calendar className="h-3 w-3" /> Due{' '}
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                                <span
                                  className={`inline-flex rounded px-1.5 py-0.5 text-xs font-bold ${
                                    task.priority === 'HIGH'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Task Side Panel */}
                  <form
                    onSubmit={onCreateTask}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 h-fit"
                  >
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      New Checklist Item
                    </h4>
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500">
                        Task Title
                      </label>
                      <input
                        type="text"
                        required
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="e.g. Call client for retainer signed"
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500">
                        Due Date
                      </label>
                      <input
                        type="date"
                        required
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500">
                        Priority
                      </label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
                      >
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Add Checklist Item
                    </button>
                  </form>
                </div>
              )}

              {/* 6. AUDIT TRAIL LOGS */}
              {activeProfileTab === 'audits' && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 border-slate-100">
                    Lead Audit Trail Log
                  </h3>
                  <div className="relative border-l border-slate-200 pl-4 ml-2 text-xs leading-relaxed space-y-4">
                    {leadDetails.activityLogs?.map((log: any) => (
                      <div key={log.id} className="relative">
                        <span className="absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white text-[8px]">
                          ●
                        </span>
                        <span className="font-semibold text-slate-900">
                          {log.action}
                        </span>
                        <span className="text-slate-400 text-xs ml-2">
                          by {log.user?.name || 'System'}
                        </span>
                        <p className="text-slate-600 text-xs mt-0.5">{log.details}</p>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
