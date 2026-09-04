'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, Sparkles, Plus, Save, Trash2, Edit3, CheckCircle2,
  RefreshCw, Layers, ShieldCheck, Tag, Eye, X, Filter, FileText, Check
} from 'lucide-react';
import { TYPE_OPTIONS } from '@/components/vendor-portal/leads/NewCaseLeadFollowUpForm';
import {
  DEFAULT_TORT_QUESTIONS,
  TortQuestion,
  TortQuestionsMap,
  getQuestionsForTort
} from '@/store/tortQuestionsStore';

export default function AdminAddQuestionsPage() {
  const [selectedTort, setSelectedTort] = useState<string>('Depo-Provera');
  const [tortQuestionsMap, setTortQuestionsMap] = useState<TortQuestionsMap>(DEFAULT_TORT_QUESTIONS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add/Edit Question Modal State
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isSavingApi, setIsSavingApi] = useState(false);
  const [questionFormData, setQuestionFormData] = useState<{
    label: string;
    name: string;
    type: 'text' | 'select' | 'date' | 'textarea' | 'checkbox';
    required: boolean;
    optionsText: string;
    categoryBadge: string;
  }>({
    label: '',
    name: '',
    type: 'text',
    required: false,
    optionsText: 'Yes, No',
    categoryBadge: 'General'
  });

  // Fetch custom questions map from central API on load
  useEffect(() => {
    async function loadCentralQuestions() {
      try {
        const res = await fetch('/api/settings/questions');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.questionsMap) {
            setTortQuestionsMap(data.questionsMap);
            if (typeof window !== 'undefined') {
              localStorage.setItem('custom_tort_questions_map', JSON.stringify(data.questionsMap));
            }
            return;
          }
        }
      } catch (err) {
        console.warn('API sync unavailable, using local cache:', err);
      }

      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('custom_tort_questions_map');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === 'object') {
              setTortQuestionsMap((prev) => ({
                ...prev,
                ...parsed
              }));
            }
          } catch (_) {}
        }
      }
    }

    loadCentralQuestions();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeQuestions = useMemo(() => {
    return tortQuestionsMap[selectedTort] || getQuestionsForTort(selectedTort);
  }, [tortQuestionsMap, selectedTort]);

  const handleSaveQuestionsMap = async (updatedMap: TortQuestionsMap) => {
    setTortQuestionsMap(updatedMap);
    if (typeof window !== 'undefined') {
      localStorage.setItem('custom_tort_questions_map', JSON.stringify(updatedMap));
    }

    setIsSavingApi(true);
    try {
      const res = await fetch('/api/settings/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionsMap: updatedMap }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showToast('Questions saved and synced centrally across all users!');
        }
      }
    } catch (err) {
      console.error('Failed to sync questions to central API:', err);
    } finally {
      setIsSavingApi(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingQuestionId(null);
    setQuestionFormData({
      label: '',
      name: `q_${Date.now().toString().slice(-6)}`,
      type: 'text',
      required: false,
      optionsText: 'Yes, No',
      categoryBadge: 'Qualifier'
    });
    setShowQuestionModal(true);
  };

  const handleOpenEditModal = (q: TortQuestion) => {
    setEditingQuestionId(q.id);
    setQuestionFormData({
      label: q.label,
      name: q.name,
      type: q.type,
      required: q.required,
      optionsText: q.options ? q.options.join(', ') : 'Yes, No',
      categoryBadge: q.categoryBadge || 'Qualifier'
    });
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (confirm('Are you sure you want to delete this question from this Tort?')) {
      const currentList = tortQuestionsMap[selectedTort] || getQuestionsForTort(selectedTort);
      const filtered = currentList.filter((q) => q.id !== qId);
      const updatedMap = {
        ...tortQuestionsMap,
        [selectedTort]: filtered
      };
      handleSaveQuestionsMap(updatedMap);
      showToast(`Question deleted from ${selectedTort}!`);
    }
  };

  const handleResetTortQuestions = () => {
    if (confirm(`Reset all questions for "${selectedTort}" back to default preset?`)) {
      const defaultList = DEFAULT_TORT_QUESTIONS[selectedTort] || DEFAULT_TORT_QUESTIONS['Mass Tort - General'];
      const updatedMap = {
        ...tortQuestionsMap,
        [selectedTort]: defaultList
      };
      handleSaveQuestionsMap(updatedMap);
      showToast(`Reset questions for ${selectedTort} to default preset.`);
    }
  };

  const handleSaveQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionFormData.label.trim()) return;

    const optionsArray = questionFormData.type === 'select'
      ? questionFormData.optionsText.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const currentList = tortQuestionsMap[selectedTort] || getQuestionsForTort(selectedTort);

    if (editingQuestionId) {
      // Edit existing
      const updatedList = currentList.map((q) => {
        if (q.id === editingQuestionId) {
          return {
            ...q,
            label: questionFormData.label,
            type: questionFormData.type,
            required: questionFormData.required,
            options: optionsArray,
            categoryBadge: questionFormData.categoryBadge
          };
        }
        return q;
      });
      const updatedMap = { ...tortQuestionsMap, [selectedTort]: updatedList };
      handleSaveQuestionsMap(updatedMap);
      showToast(`Question updated for ${selectedTort}!`);
    } else {
      // Add new
      const newQuestion: TortQuestion = {
        id: `custom-${Date.now()}`,
        name: questionFormData.name.replace(/[^a-zA-Z0-9_]/g, '') || `q_${Date.now()}`,
        label: questionFormData.label,
        type: questionFormData.type,
        required: questionFormData.required,
        options: optionsArray,
        categoryBadge: questionFormData.categoryBadge
      };
      const updatedList = [...currentList, newQuestion];
      const updatedMap = { ...tortQuestionsMap, [selectedTort]: updatedList };
      handleSaveQuestionsMap(updatedMap);
      showToast(`New question added to ${selectedTort}!`);
    }

    setShowQuestionModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl border border-slate-800"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20">
              <HelpCircle className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Tort-Specific Question Manager
                </h1>
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                  Form Dynamic Questions Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Configure custom dynamic questions per Tort type. When a user selects a Tort under Lead Info, these questions render dynamically in Section 5 (Other Case Information).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetTortQuestions}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Tort Defaults
            </button>

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-amber-700 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Question for {selectedTort}
            </button>
          </div>
        </div>
      </div>

      {/* SELECT TORT TYPE TOOLBAR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Select Target Tort Category:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Active Tort:</span>
            <span className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
              {selectedTort} ({activeQuestions.length} Questions)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <select
            value={selectedTort}
            onChange={(e) => setSelectedTort(e.target.value)}
            className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 outline-none transition-all cursor-pointer col-span-1 sm:col-span-2"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* QUESTIONS MANAGEMENT TABLE */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Questions Configured for "{selectedTort}" ({activeQuestions.length})
            </h3>
          </div>
          <span className="text-2xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
            Other Case Information Section
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-2xs">
                <th className="p-3.5 font-bold w-12 text-center">#</th>
                <th className="p-3.5 font-bold">Question Label / Title</th>
                <th className="p-3.5 font-bold">Field Key</th>
                <th className="p-3.5 font-bold">Input Type</th>
                <th className="p-3.5 font-bold">Category Badge</th>
                <th className="p-3.5 font-bold">Requirement</th>
                <th className="p-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeQuestions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-slate-400">
                    No custom questions configured for this Tort yet. Click "Add Question" to create one.
                  </td>
                </tr>
              ) : (
                activeQuestions.map((q, idx) => (
                  <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {q.label}
                    </td>
                    <td className="p-3.5 font-mono text-2xs text-amber-700 font-bold">
                      {q.name}
                    </td>
                    <td className="p-3.5">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-2xs font-mono font-bold text-slate-700 uppercase">
                        {q.type}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="rounded-md bg-amber-50 px-2 py-0.5 text-2xs font-bold text-amber-700 border border-amber-200">
                        {q.categoryBadge || 'General'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-2xs font-bold ${
                          q.required
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {q.required ? 'REQUIRED *' : 'OPTIONAL'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(q)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600 transition-colors"
                          title="Edit Question"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* LIVE SECTION 5 PREVIEW CARD */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Live Preview: Section 5 ("Other Case Information") for {selectedTort}
            </h3>
          </div>
          <span className="text-2xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
            Dynamic Rendering
          </span>
        </div>

        <div className="bg-amber-50/30 p-5 rounded-2xl border border-amber-200/80 space-y-4">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-600" />
            Section 5: Other Case Information ({selectedTort})
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {activeQuestions.map((q) => (
              <div key={q.id} className={q.type === 'textarea' ? 'sm:col-span-2 md:col-span-3' : ''}>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  {q.label} {q.required && <span className="text-rose-500">*</span>}
                </label>
                {q.type === 'select' ? (
                  <select className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 shadow-xs focus:border-amber-500 outline-none">
                    {(q.options || ['Yes', 'No']).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : q.type === 'textarea' ? (
                  <textarea
                    rows={2}
                    placeholder={q.placeholder || 'Enter details...'}
                    className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:border-amber-500 outline-none"
                  />
                ) : (
                  <input
                    type={q.type === 'date' ? 'date' : 'text'}
                    placeholder={q.placeholder || 'Enter response...'}
                    className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:border-amber-500 outline-none"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ADD / EDIT QUESTION MODAL */}
      <AnimatePresence>
        {showQuestionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-amber-600" />
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingQuestionId ? 'Edit Question' : 'Add New Question'} for {selectedTort}
                  </h3>
                </div>
                <button
                  onClick={() => setShowQuestionModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuestionSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Question Label / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Duration of Exposure in Years:"
                    value={questionFormData.label}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, label: e.target.value })}
                    className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-amber-500 outline-none shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Field Name / Key</label>
                    <input
                      type="text"
                      disabled={!!editingQuestionId}
                      placeholder="e.g. pfasExposure"
                      value={questionFormData.name}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:border-amber-500 outline-none shadow-xs disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Input Type</label>
                    <select
                      value={questionFormData.type}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, type: e.target.value as any })}
                      className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-amber-500 outline-none shadow-xs cursor-pointer"
                    >
                      <option value="text">Text Input</option>
                      <option value="select">Dropdown Select</option>
                      <option value="date">Date Picker</option>
                      <option value="textarea">Textarea Box</option>
                    </select>
                  </div>
                </div>

                {questionFormData.type === 'select' && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Dropdown Options (Comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Yes, No, Unknown"
                      value={questionFormData.optionsText}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, optionsText: e.target.value })}
                      className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-amber-500 outline-none shadow-xs"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Category Badge Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Timeline / Exposure"
                      value={questionFormData.categoryBadge}
                      onChange={(e) => setQuestionFormData({ ...questionFormData, categoryBadge: e.target.value })}
                      className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-amber-500 outline-none shadow-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={questionFormData.required}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, required: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <span>Mark as Required *</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowQuestionModal(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-amber-700 transition-all cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingQuestionId ? 'Save Question Changes' : 'Add Question to Tort'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
