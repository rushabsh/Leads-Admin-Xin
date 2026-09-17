'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, Sparkles, Plus, Save, Trash2, Edit3, CheckCircle2,
  RefreshCw, Layers, ShieldCheck, Tag, Eye, X, Filter, FileText, Check,
  Building2, Megaphone, Info, Hash, AlignLeft, Calendar, ListFilter,
  CheckSquare, Phone, Mail, Radio, Search
} from 'lucide-react';
import { useCRMStore } from '@/store/crmStore';
import { TYPE_OPTIONS } from '@/components/vendor-portal/leads/NewCaseLeadFollowUpForm';
import {
  DEFAULT_TORT_QUESTIONS,
  TortQuestion,
  TortQuestionsMap,
  getQuestionsForTort
} from '@/store/tortQuestionsStore';
import api from '@/lib/api';

const INPUT_TYPE_OPTIONS = [
  { value: 'text', label: 'Text Input', icon: AlignLeft, desc: 'Short single-line text for short answers (e.g. Doctor name, City, Facility)' },
  { value: 'select', label: 'Dropdown Select', icon: ListFilter, desc: 'Single choice from a custom list of options (e.g. Yes/No, Duration)' },
  { value: 'textarea', label: 'Multi-line Textarea', icon: FileText, desc: 'Long paragraph box for detailed narratives & explanations' },
  { value: 'date', label: 'Date Picker', icon: Calendar, desc: 'Calendar date selection (e.g. Diagnosis date, Incident date)' },
  { value: 'number', label: 'Number / Count', icon: Hash, desc: 'Numeric values only (e.g. Age, Years exposed, Count)' },
  { value: 'phone', label: 'Phone Number', icon: Phone, desc: 'Formatted phone contact number' },
  { value: 'email', label: 'Email Address', icon: Mail, desc: 'Validated email address input' },
  { value: 'checkbox', label: 'Yes/No Checkbox', icon: CheckSquare, desc: 'Single toggle confirmation box (e.g. "Mark if true")' },
  { value: 'radio', label: 'Radio Choice Pills', icon: Radio, desc: 'Clickable radio pill buttons for immediate visual selection' },
] as const;

const COMMON_OPTION_PRESETS = [
  { label: 'Yes / No', values: ['Yes', 'No'] },
  { label: 'Yes / No / Unknown', values: ['Yes', 'No', 'Unknown'] },
  { label: '4 Options Template', values: ['Option 1', 'Option 2', 'Option 3', 'Option 4'] },
  { label: 'Exposure Years (4 Options)', values: ['1-2 Years', '3-5 Years', '5-10 Years', '10+ Years'] },
  { label: 'Severity Scale (3 Options)', values: ['Mild', 'Moderate', 'Severe'] },
  { label: 'Claimant Type', values: ['Myself', 'Loved One / Family Member'] },
  { label: 'Priority Scale', values: ['High', 'Medium', 'Low'] },
];

const COMMON_BADGE_PRESETS = [
  'Qualifier',
  'Exposure Source',
  'Exposure Window',
  'Diagnosis',
  'Timeline',
  'Medical Verification',
  'Incident Details',
  'Reporting',
  'Legal Status',
  'General',
];

function generateKeyFromLabel(text: string): string {
  const words = text
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return '';
  return words
    .map((w, idx) => (idx === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join('')
    .slice(0, 32);
}

export default function AdminAddQuestionsPage() {
  const { vendors, campaigns, fetchData, fetchCampaigns } = useCRMStore();

  // Vendor & Campaign Selection State
  const [selectedVendorId, setSelectedVendorId] = useState<string>('all');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');

  const [selectedTort, setSelectedTort] = useState<string>('Depo-Provera');
  const [tortQuestionsMap, setTortQuestionsMap] = useState<TortQuestionsMap>(DEFAULT_TORT_QUESTIONS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [systemMassTorts, setSystemMassTorts] = useState<string[]>([]);
  const [schemaTortOptions, setSchemaTortOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Load all system mass torts on mount
  useEffect(() => {
    async function loadMassTorts() {
      try {
        const res = await api.get('/settings/mass-torts');
        const list = res.data?.massTorts || res.data?.data || [];
        const names = list.map((m: any) => m.name).filter(Boolean);
        setSystemMassTorts(names);
      } catch (err) {
        console.warn('Could not fetch mass-torts:', err);
      }
    }
    loadMassTorts();
  }, []);

  // Load form-schema tort options whenever selectedVendorId or selectedCampaignId changes
  useEffect(() => {
    if (selectedVendorId === 'all') {
      setSchemaTortOptions([]);
      return;
    }
    async function loadSchemaTorts() {
      try {
        const q = new URLSearchParams();
        if (selectedVendorId && selectedVendorId !== 'all') q.set('vendorId', selectedVendorId);
        if (selectedCampaignId && selectedCampaignId !== 'all') q.set('campaignId', selectedCampaignId);

        const res = await fetch(`/api/settings/form-schema?${q.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const fields = data.schema?.fields || [];
          const typeField = fields.find((f: any) => f.name === 'type' || f.id === '3');
          if (typeField && Array.isArray(typeField.options)) {
            setSchemaTortOptions(typeField.options);
          }
        }
      } catch (err) {
        console.warn('Could not load schema torts for context:', err);
      }
    }
    loadSchemaTorts();
  }, [selectedVendorId, selectedCampaignId]);

  // Find active vendor object
  const selectedVendor = useMemo(() => {
    if (selectedVendorId === 'all') return null;
    return vendors.find((v) => v.id === selectedVendorId) || null;
  }, [vendors, selectedVendorId]);

  // Filter campaigns assigned to selected vendor
  const assignedCampaigns = useMemo(() => {
    if (!selectedVendorId || selectedVendorId === 'all') return campaigns;
    const vendorObj = vendors.find((v) => v.id === selectedVendorId);
    return campaigns.filter(
      (c: any) =>
        c.vendorId === selectedVendorId ||
        c.vendor?.id === selectedVendorId ||
        (c.vendorName && vendorObj?.name && c.vendorName.toLowerCase() === vendorObj.name.toLowerCase()) ||
        (c.vendor?.name && vendorObj?.name && c.vendor.name.toLowerCase() === vendorObj.name.toLowerCase()) ||
        (c.vendors && Array.isArray(c.vendors) && c.vendors.includes(selectedVendorId))
    );
  }, [campaigns, selectedVendorId, vendors]);

  const handleVendorChange = (newVendorId: string) => {
    setSelectedVendorId(newVendorId);
    if (newVendorId === 'all') {
      setSelectedCampaignId('all');
      return;
    }
    const vendorObj = vendors.find((v) => v.id === newVendorId);
    const vCamps = campaigns.filter(
      (c: any) =>
        c.vendorId === newVendorId ||
        c.vendor?.id === newVendorId ||
        (c.vendorName && vendorObj?.name && c.vendorName.toLowerCase() === vendorObj.name.toLowerCase()) ||
        (c.vendor?.name && vendorObj?.name && c.vendor.name.toLowerCase() === vendorObj.name.toLowerCase()) ||
        (c.vendors && Array.isArray(c.vendors) && c.vendors.includes(newVendorId))
    );
    if (vCamps.length > 0) {
      const firstCamp = vCamps[0];
      setSelectedCampaignId(firstCamp.id);
      const campTort = firstCamp.massTort?.name || firstCamp.tortName;
      if (campTort) {
        setSelectedTort(campTort);
        showToast(`Selected "${vendorObj?.name || 'Vendor'}" → Campaign "${firstCamp.name}" → Tort "${campTort}"`);
      }
    } else {
      setSelectedCampaignId('all');
    }
  };

  const handleCampaignChange = (newCampaignId: string) => {
    setSelectedCampaignId(newCampaignId);
    if (newCampaignId !== 'all') {
      const camp = campaigns.find((c: any) => c.id === newCampaignId);
      const campTort = camp?.massTort?.name || camp?.tortName;
      if (campTort) {
        setSelectedTort(campTort);
        showToast(`Switched Tort to "${campTort}" (linked to campaign "${camp?.name}")`);
      }
    }
  };

  // Add/Edit Question Modal State
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isCustomKey, setIsCustomKey] = useState(false);
  const [questionFormData, setQuestionFormData] = useState<{
    label: string;
    name: string;
    type: 'text' | 'select' | 'date' | 'textarea' | 'checkbox' | 'number' | 'phone' | 'email' | 'radio';
    required: boolean;
    optionsList: string[];
    categoryBadge: string;
    placeholder: string;
    helpText: string;
    defaultValue: string;
  }>({
    label: '',
    name: '',
    type: 'text',
    required: false,
    optionsList: ['Yes', 'No', '', ''],
    categoryBadge: 'Qualifier',
    placeholder: '',
    helpText: '',
    defaultValue: '',
  });

  // Add New Tort Modal State
  const [showAddTortModal, setShowAddTortModal] = useState(false);
  const [isSavingNewTort, setIsSavingNewTort] = useState(false);
  const [newTortFormData, setNewTortFormData] = useState<{
    name: string;
    vendorId: string;
    campaignId: string;
    newCampaignName: string;
    createNewCampaign: boolean;
    description: string;
  }>({
    name: '',
    vendorId: 'all',
    campaignId: 'all',
    newCampaignName: '',
    createNewCampaign: false,
    description: '',
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
          } catch (_) { }
        }
      }
    }

    loadCentralQuestions();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Combine default TYPE_OPTIONS with system mass-torts, campaigns torts, schema torts, and tortQuestionsMap
  // When a specific vendor is selected, restrict dropdown options to the torts of that vendor's campaign(s)
  const allTortOptions = useMemo(() => {
    if (selectedVendorId && selectedVendorId !== 'all') {
      const targetCamps = (selectedCampaignId && selectedCampaignId !== 'all')
        ? assignedCampaigns.filter((c: any) => c.id === selectedCampaignId)
        : assignedCampaigns;

      const campTorts = targetCamps
        .map((c: any) => c.massTort?.name || c.tortName)
        .filter(Boolean);

      const combined = Array.from(
        new Set([
          ...campTorts,
          ...schemaTortOptions,
          ...(selectedTort ? [selectedTort] : [])
        ].filter(Boolean))
      );

      if (combined.length > 0) {
        return combined;
      }
    }

    // Global Mode (All Vendors)
    const campaignTorts = campaigns
      .map((c: any) => c.massTort?.name || c.tortName)
      .filter(Boolean);
    const list = Array.from(
      new Set([
        ...TYPE_OPTIONS,
        ...systemMassTorts,
        ...campaignTorts,
        ...Object.keys(tortQuestionsMap)
      ])
    );
    return list;
  }, [selectedVendorId, selectedCampaignId, assignedCampaigns, schemaTortOptions, selectedTort, campaigns, systemMassTorts, tortQuestionsMap]);

  // Auto-sync selectedTort if current selectedTort is not in the active allTortOptions
  useEffect(() => {
    if (selectedVendorId && selectedVendorId !== 'all' && allTortOptions.length > 0) {
      if (!allTortOptions.includes(selectedTort)) {
        setSelectedTort(allTortOptions[0]);
      }
    }
  }, [selectedVendorId, selectedCampaignId, allTortOptions, selectedTort]);

  const activeQuestions: TortQuestion[] = useMemo(() => {
    const fromMap = tortQuestionsMap[selectedTort];
    if (fromMap !== undefined) return fromMap;
    return getQuestionsForTort(selectedTort);
  }, [tortQuestionsMap, selectedTort]);

  // Filtered questions based on search query
  const filteredActiveQuestions = useMemo(() => {
    if (!searchQuery.trim()) return activeQuestions;
    const q = searchQuery.toLowerCase().trim();
    return activeQuestions.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        (item.categoryBadge && item.categoryBadge.toLowerCase().includes(q)) ||
        item.type.toLowerCase().includes(q)
    );
  }, [activeQuestions, searchQuery]);

  // Filter campaigns available for new tort modal based on selected vendor
  const assignedCampaignsForNewTort = useMemo(() => {
    if (!newTortFormData.vendorId || newTortFormData.vendorId === 'all') return campaigns;
    const vendorObj = vendors.find((v) => v.id === newTortFormData.vendorId);
    return campaigns.filter(
      (c: any) =>
        c.vendorId === newTortFormData.vendorId ||
        c.vendor?.id === newTortFormData.vendorId ||
        (c.vendorName && vendorObj?.name && c.vendorName.toLowerCase() === vendorObj.name.toLowerCase()) ||
        (c.vendor?.name && vendorObj?.name && c.vendor.name.toLowerCase() === vendorObj.name.toLowerCase()) ||
        (c.vendors && Array.isArray(c.vendors) && c.vendors.includes(newTortFormData.vendorId))
    );
  }, [campaigns, newTortFormData.vendorId, vendors]);

  const handleSaveQuestionsMap = async (updatedMap: TortQuestionsMap) => {
    setTortQuestionsMap(updatedMap);
    if (typeof window !== 'undefined') {
      localStorage.setItem('custom_tort_questions_map', JSON.stringify(updatedMap));
    }

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
    }
  };

  const handleOpenAddTortModal = () => {
    setNewTortFormData({
      name: '',
      vendorId: selectedVendorId,
      campaignId: selectedCampaignId,
      newCampaignName: '',
      createNewCampaign: false,
      description: '',
    });
    setShowAddTortModal(true);
  };

  const handleSaveNewTort = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newTortFormData.name.trim();
    if (!trimmedName) return;

    setIsSavingNewTort(true);
    try {
      // 1. By default, keep tort questions empty ([]) for newly added tort
      const updatedMap: TortQuestionsMap = {
        ...tortQuestionsMap,
        [trimmedName]: tortQuestionsMap[trimmedName] !== undefined ? tortQuestionsMap[trimmedName] : []
      };

      await handleSaveQuestionsMap(updatedMap);

      // 2. Register MassTort in backend
      let massTortId: string | undefined;
      try {
        const mtRes = await api.post('/settings/mass-torts', {
          name: trimmedName,
          description: newTortFormData.description || `Tort litigation category ${trimmedName}`,
        });
        if (mtRes.data?.massTort?.id) {
          massTortId = mtRes.data.massTort.id;
        }
      } catch (mtErr) {
        console.warn('Backend mass-tort registration note:', mtErr);
        try {
          const listRes = await api.get('/settings/mass-torts');
          const found = (listRes.data?.massTorts || listRes.data?.data || []).find(
            (m: any) => m.name.toLowerCase() === trimmedName.toLowerCase()
          );
          if (found) massTortId = found.id;
        } catch (_) { }
      }

      // 3. If creating a dedicated campaign or linking existing campaign
      let resolvedCampaignId = newTortFormData.campaignId;
      if (newTortFormData.createNewCampaign && newTortFormData.vendorId !== 'all') {
        try {
          const campName = newTortFormData.newCampaignName.trim() || `${trimmedName} Campaign`;
          const cRes = await api.post('/campaigns', {
            name: campName,
            vendorId: newTortFormData.vendorId,
            massTortId: massTortId,
            status: 'ACTIVE',
            description: `Intake campaign for ${trimmedName}`,
          });
          if (cRes.data?.campaign?.id) {
            resolvedCampaignId = cRes.data.campaign.id;
          }
        } catch (cErr) {
          console.warn('Campaign creation note:', cErr);
        }
      } else if (newTortFormData.campaignId !== 'all' && massTortId) {
        // Associate existing campaign with this mass tort
        try {
          await api.put(`/campaigns/${newTortFormData.campaignId}`, {
            massTortId: massTortId,
          });
        } catch (uErr) {
          console.warn('Campaign massTort update note:', uErr);
        }
      } else if (newTortFormData.vendorId !== 'all' && newTortFormData.campaignId === 'all' && massTortId) {
        // Update all campaigns of this vendor
        for (const camp of assignedCampaignsForNewTort) {
          try {
            await api.put(`/campaigns/${camp.id}`, { massTortId });
          } catch (_) { }
        }
      }

      // 4. Proactively update Zustand campaigns store state right away
      if (massTortId) {
        useCRMStore.setState((state) => ({
          campaigns: state.campaigns.map((c: any) => {
            if (
              (resolvedCampaignId && resolvedCampaignId !== 'all' && c.id === resolvedCampaignId) ||
              (newTortFormData.campaignId === 'all' && newTortFormData.vendorId !== 'all' && (c.vendorId === newTortFormData.vendorId || c.vendor?.id === newTortFormData.vendorId))
            ) {
              return {
                ...c,
                massTortId,
                massTort: { id: massTortId, name: trimmedName },
                tortName: trimmedName,
              };
            }
            return c;
          }),
        }));
      }

      setSystemMassTorts((prev) => Array.from(new Set([...prev, trimmedName])));

      // Force refetch campaigns in store with true (bypassing 5-minute cache)
      if (fetchCampaigns) {
        await fetchCampaigns(true);
      }
      if (fetchData) {
        await fetchData(true);
      }

      // 5. Automatically inject the tort category into that vendor & campaign's form schema
      try {
        await api.put('/settings/form-schema', {
          action: 'add-tort',
          tortName: trimmedName,
          vendorId: newTortFormData.vendorId !== 'all' ? newTortFormData.vendorId : null,
          campaignId: resolvedCampaignId !== 'all' ? resolvedCampaignId : null,
        });

        if (newTortFormData.vendorId !== 'all' && newTortFormData.campaignId === 'all') {
          for (const camp of assignedCampaignsForNewTort) {
            try {
              await api.put('/settings/form-schema', {
                action: 'add-tort',
                tortName: trimmedName,
                vendorId: newTortFormData.vendorId,
                campaignId: camp.id,
              });
            } catch (_) { }
          }
        }
      } catch (schemaErr) {
        console.warn('Form schema update note:', schemaErr);
      }

      // Realtime event dispatch so open forms update automatically
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('lead_form_schema_updated'));
      }

      // 5. Update selected tort and context
      setSelectedTort(trimmedName);
      if (newTortFormData.vendorId !== 'all') {
        setSelectedVendorId(newTortFormData.vendorId);
      }
      if (resolvedCampaignId !== 'all') {
        setSelectedCampaignId(resolvedCampaignId);
      }

      setShowAddTortModal(false);

      const vendorObj = vendors.find((v) => v.id === newTortFormData.vendorId);
      const campObj = campaigns.find((c: any) => c.id === resolvedCampaignId);
      const vendorLabel = newTortFormData.vendorId !== 'all' ? (vendorObj?.name || 'Selected Vendor') : 'All Vendors';
      const campLabel = resolvedCampaignId !== 'all' ? (campObj?.name || newTortFormData.newCampaignName || 'Selected Campaign') : 'All Campaigns';

      showToast(`Tort "${trimmedName}" created and automatically added to ${vendorLabel}'s ${campLabel} form!`);
    } catch (err) {
      console.error('Failed to add tort:', err);
      showToast('Failed to add tort. Please try again.');
    } finally {
      setIsSavingNewTort(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingQuestionId(null);
    setIsCustomKey(false);
    setQuestionFormData({
      label: '',
      name: '',
      type: 'text',
      required: false,
      optionsList: ['Yes', 'No', '', ''],
      categoryBadge: 'Qualifier',
      placeholder: '',
      helpText: '',
      defaultValue: '',
    });
    setShowQuestionModal(true);
  };

  const handleOpenEditModal = (q: TortQuestion) => {
    setEditingQuestionId(q.id);
    setIsCustomKey(true);
    setQuestionFormData({
      label: q.label,
      name: q.name,
      type: q.type,
      required: q.required,
      optionsList: q.options && q.options.length > 0 ? q.options : ['Yes', 'No', '', ''],
      categoryBadge: q.categoryBadge || 'Qualifier',
      placeholder: q.placeholder || '',
      helpText: q.helpText || '',
      defaultValue: q.defaultValue || '',
    });
    setShowQuestionModal(true);
  };

  const handleLabelChange = (newLabel: string) => {
    setQuestionFormData((prev) => {
      const autoKey = generateKeyFromLabel(newLabel);
      return {
        ...prev,
        label: newLabel,
        name: (!isCustomKey && !editingQuestionId) ? (autoKey || prev.name) : prev.name,
      };
    });
  };

  const handleDeleteQuestion = (qId: string) => {
    if (confirm('Are you sure you want to delete this question from this Tort?')) {
      const currentList = tortQuestionsMap[selectedTort] !== undefined ? tortQuestionsMap[selectedTort] : getQuestionsForTort(selectedTort);
      const filtered = currentList.filter((q) => q.id !== qId);
      const updatedMap = {
        ...tortQuestionsMap,
        [selectedTort]: filtered
      };
      handleSaveQuestionsMap(updatedMap);
      showToast(`Question deleted from ${selectedTort}!`);
    }
  };

  const handleSaveQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionFormData.label.trim()) return;

    let finalName = questionFormData.name.replace(/[^a-zA-Z0-9_]/g, '').trim();
    if (!finalName) {
      finalName = generateKeyFromLabel(questionFormData.label) || `q_${Date.now().toString().slice(-6)}`;
    }

    let optionsArray: string[] | undefined = undefined;
    if (questionFormData.type === 'select' || questionFormData.type === 'radio') {
      const filtered = questionFormData.optionsList.map((s) => s.trim()).filter(Boolean);
      optionsArray = filtered.length > 0 ? filtered : ['Yes', 'No'];
    }

    const currentList = tortQuestionsMap[selectedTort] !== undefined ? tortQuestionsMap[selectedTort] : getQuestionsForTort(selectedTort);

    if (editingQuestionId) {
      // Edit existing
      const updatedList = currentList.map((q) => {
        if (q.id === editingQuestionId) {
          return {
            ...q,
            label: questionFormData.label.trim(),
            name: finalName,
            type: questionFormData.type,
            required: questionFormData.required,
            options: optionsArray,
            categoryBadge: questionFormData.categoryBadge.trim() || undefined,
            placeholder: questionFormData.placeholder.trim() || undefined,
            helpText: questionFormData.helpText.trim() || undefined,
            defaultValue: questionFormData.defaultValue.trim() || undefined,
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
        name: finalName,
        label: questionFormData.label.trim(),
        type: questionFormData.type,
        required: questionFormData.required,
        options: optionsArray,
        categoryBadge: questionFormData.categoryBadge.trim() || 'General',
        placeholder: questionFormData.placeholder.trim() || undefined,
        helpText: questionFormData.helpText.trim() || undefined,
        defaultValue: questionFormData.defaultValue.trim() || undefined,
      };
      const updatedList = [...currentList, newQuestion];
      const updatedMap = { ...tortQuestionsMap, [selectedTort]: updatedList };
      handleSaveQuestionsMap(updatedMap);
      showToast(`New question added to ${selectedTort}!`);
    }

    // Ensure tort is active in form schema for this vendor/campaign
    try {
      fetch('/api/settings/form-schema', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-tort',
          tortName: selectedTort,
          vendorId: selectedVendorId !== 'all' ? selectedVendorId : null,
          campaignId: selectedCampaignId !== 'all' ? selectedCampaignId : null,
        }),
      })
        .then(() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('lead_form_schema_updated'));
          }
        })
        .catch(() => { });
    } catch (_) { }

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
                  Section 5: Dynamic Questions Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Configure questions for all Tort types. When an intake agent or claimant selects a Tort, these questions render dynamically in Section 5              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenAddTortModal}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add New Tort
            </button>
          </div>
        </div>
      </div>

      {/* METRICS SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Active Tort</span>
            <Tag className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-base font-bold text-slate-900 mt-1 truncate">{selectedTort}</p>
          <span className="text-[11px] text-amber-600 font-semibold mt-0.5 block">
            {activeQuestions.length} Configured Questions
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Target Section</span>
            <Layers className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-base font-bold text-slate-900 mt-1">Section 5</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Other Case Information</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Tort Categories</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-base font-bold text-slate-900 mt-1">{allTortOptions.length} Torts</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">Active in System</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Central Sync</span>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-base font-bold text-slate-900 mt-1">Active & Synced</p>
          <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">Central API & Store</span>
        </div>
      </div>

      {/* SELECT TORT TYPE & TARGET CONTEXT TOOLBAR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Select Target Tort Category:
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Active Tort:</span>
              <span className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                {selectedTort} ({activeQuestions.length} Questions)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Tort Category Dropdown
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedTort}
                onChange={(e) => setSelectedTort(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 outline-none transition-all cursor-pointer"
              >
                {allTortOptions.map((t) => (
                  <option key={t} value={t}>
                    {t} ({(tortQuestionsMap[t] !== undefined ? tortQuestionsMap[t] : getQuestionsForTort(t)).length} Questions)
                  </option>
                ))}
              </select>

              <button
                type="button" 
                onClick={handleOpenAddTortModal}
                className="shrink-0 px-3 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                title="Add a new Tort Category"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-600" />
                <span>New Tort</span>
              </button>
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Vendor Context
            </label>
            <select
              value={selectedVendorId}
              onChange={(e) => handleVendorChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-amber-500 focus:bg-white outline-none cursor-pointer"
            >
              <option value="all">Global (All Vendors)</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Campaign Context
            </label>
            <select
              value={selectedCampaignId}
              onChange={(e) => handleCampaignChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-amber-500 focus:bg-white outline-none cursor-pointer"
            >
              <option value="all">
                {selectedVendorId === 'all'
                  ? 'All Campaigns (Global)'
                  : assignedCampaigns.length === 0
                    ? 'No campaigns assigned to this vendor'
                    : 'All Vendor Campaigns'}
              </option>
              {assignedCampaigns.map((c: any) => {
                const cTort = c.massTort?.name || c.tortName;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} {cTort ? `[Tort: ${cTort}]` : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* ACTIVE WORKFLOW CONTEXT LINKAGE BANNER */}
        {(selectedVendorId !== 'all' || selectedCampaignId !== 'all') && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-emerald-50/60 border border-amber-200/90 rounded-xl text-xs shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-700">Active Setup:</span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 font-semibold text-slate-800 border border-slate-200 shadow-2xs">
                <Building2 className="h-3.5 w-3.5 text-blue-600" />
                {selectedVendor ? selectedVendor.name : 'All Vendors'}
              </span>
              <span className="text-slate-400 font-bold">→</span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 font-semibold text-slate-800 border border-slate-200 shadow-2xs">
                <Megaphone className="h-3.5 w-3.5 text-indigo-600" />
                {campaigns.find((c: any) => c.id === selectedCampaignId)?.name || (selectedCampaignId === 'all' ? 'All Campaigns' : 'Selected Campaign')}
              </span>
              <span className="text-slate-400 font-bold">→</span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-3 py-1 font-bold shadow-xs">
                <Tag className="h-3.5 w-3.5" />
                Target Tort Category: {selectedTort}
              </span>
            </div>
          </div>
        )}

        {/* SEARCH FILTER */}
        <div className="relative pt-1">
          <div className="absolute inset-y-0 left-0 pl-3 pt-1 flex items-center pointer-events-none text-slate-400">
            <Search className="h-3.5 w-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search question label, database key, input type, or badge for ${selectedTort}...`}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 pt-1 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* SECTION 5: TORT-SPECIFIC QUESTIONS MANAGEMENT TABLE */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-white text-xs font-bold">5</span>
            <h3 className="font-bold text-slate-900 text-sm">
              Section 5: Questions Configured for "{selectedTort}" ({activeQuestions.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              Other Case Information Section
            </span>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Question
            </button>
          </div>
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
              {filteredActiveQuestions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-slate-400">
                    {searchQuery
                      ? `No questions matching "${searchQuery}" found for ${selectedTort}.`
                      : `No custom questions configured for ${selectedTort} yet. Section 5 is currently blank. Click "Add Question" to create one.`}
                  </td>
                </tr>
              ) : (
                filteredActiveQuestions.map((q, idx) => (
                  <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      <div>{q.label}</div>
                      {q.placeholder && (
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                          Hint: "{q.placeholder}"
                        </div>
                      )}
                      {q.helpText && (
                        <div className="text-[11px] text-amber-600/80 font-normal italic mt-0.5">
                          ℹ️ {q.helpText}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-2xs text-amber-700 font-bold">
                      {q.name}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`rounded px-2 py-0.5 text-2xs font-mono font-bold uppercase ${q.type === 'select'
                          ? 'bg-amber-100 text-amber-800'
                          : q.type === 'textarea'
                            ? 'bg-blue-100 text-blue-800'
                            : q.type === 'date'
                              ? 'bg-purple-100 text-purple-800'
                              : q.type === 'checkbox'
                                ? 'bg-emerald-100 text-emerald-800'
                                : q.type === 'number'
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : q.type === 'radio'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-700'
                          }`}
                      >
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
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-2xs font-bold ${q.required
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
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600 transition-colors cursor-pointer"
                          title="Edit Question"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors cursor-pointer"
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
              Live Interactive Preview: Section 5 ("Other Case Information") for {selectedTort}
            </h3>
          </div>
          <span className="text-2xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
            Dynamic Intake Form Rendering
          </span>
        </div>

        <div className="bg-amber-50/30 p-5 rounded-2xl border border-amber-200/80 space-y-4">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-600" />
            Section 5: Other Case Information ({selectedTort} • {activeQuestions.length} Questions)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {activeQuestions.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-amber-800/80 border border-dashed border-amber-300 rounded-xl bg-white/60">
                <p className="font-bold">No questions currently configured for {selectedTort}.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Section 5 (Other Case Information) is currently blank for this tort. Click "Add Question for {selectedTort}" above to create questions.
                </p>
              </div>
            ) : (
              activeQuestions.map((q) => (
                <div key={q.id} className={q.type === 'textarea' ? 'sm:col-span-2 md:col-span-3' : ''}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      {q.label} {q.required && <span className="text-rose-500">*</span>}
                    </label>
                    {q.categoryBadge && (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {q.categoryBadge}
                      </span>
                    )}
                  </div>
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
                  ) : q.type === 'checkbox' ? (
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-2 rounded-xl border border-slate-200 bg-white cursor-pointer shadow-xs">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-amber-600" />
                      <span>Confirm / {q.label}</span>
                    </label>
                  ) : q.type === 'radio' ? (
                    <div className="flex flex-wrap gap-2">
                      {(q.options || ['Yes', 'No']).map((opt) => (
                        <span key={opt} className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-xs">
                          {opt}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={q.type === 'date' ? 'date' : q.type === 'number' ? 'number' : q.type === 'phone' ? 'tel' : q.type === 'email' ? 'email' : 'text'}
                      placeholder={q.placeholder || 'Enter response...'}
                      className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:border-amber-500 outline-none"
                    />
                  )}
                  {q.helpText && (
                    <p className="text-[11px] text-slate-400 mt-1 italic">
                      ℹ️ {q.helpText}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ADD / EDIT QUESTION MODAL */}
      <AnimatePresence>
        {showQuestionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20 shrink-0">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">
                        {editingQuestionId ? 'Edit Question' : 'Add New Question'} for {selectedTort}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        Section 5
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure question details, input type, options, and validations for {selectedTort}.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Scrollable Form */}
              <form onSubmit={handleSaveQuestionSubmit} className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
                {/* SECTION 1: QUESTION IDENTITY */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold uppercase tracking-wider text-2xs border-b border-slate-200/80 pb-2">
                    <AlignLeft className="h-3.5 w-3.5 text-amber-600" />
                    <span>1. Question Title & Database Key</span>
                  </div>

                  {/* Question Label */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-800 font-bold">
                        Question Label / Title <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-2xs text-slate-400">Displayed on the intake form</span>
                    </div>
                    <input
                      type="text"
                      required
                      value={questionFormData.label}
                      onChange={(e) => handleLabelChange(e.target.value)}
                      placeholder="e.g. How long were you exposed to contaminated water?"
                      className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-900 shadow-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 outline-none font-medium"
                    />
                  </div>

                  {/* Field Database Key */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-800 font-bold">
                        Database Key / Field Name <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomKey(!isCustomKey)}
                        className="text-2xs font-semibold text-amber-600 hover:underline cursor-pointer"
                      >
                        {isCustomKey ? 'Auto-generate from Label' : 'Custom field key'}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        readOnly={!isCustomKey && !editingQuestionId}
                        value={questionFormData.name}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, name: e.target.value })}
                        placeholder="e.g. exposureYears"
                        className={`w-full rounded-xl border px-3.5 py-2 text-xs font-mono shadow-xs outline-none ${!isCustomKey && !editingQuestionId
                          ? 'bg-slate-100 border-slate-200 text-slate-500'
                          : 'bg-white border-slate-250 text-slate-900 focus:border-amber-500'
                          }`}
                      />
                    </div>
                  </div>

                  {/* Mandatory / Required Toggle */}
                  <div className="pt-2 border-t border-slate-200/80">
                    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={questionFormData.required}
                        onChange={(e) => setQuestionFormData({ ...questionFormData, required: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-900">
                        Mark as Mandatory Question <span className="text-rose-500">*</span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* SECTION 2: INPUT TYPE SELECTION */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <div className="flex items-center gap-2 text-slate-800 font-bold uppercase tracking-wider text-2xs">
                      <ListFilter className="h-3.5 w-3.5 text-amber-600" />
                      <span>2. Choose Form Input Type</span>
                    </div>
                    <span className="text-2xs font-mono font-bold text-amber-700 uppercase bg-amber-100 px-2 py-0.5 rounded">
                      Selected: {questionFormData.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {INPUT_TYPE_OPTIONS.map((opt) => {
                      const IconComp = opt.icon;
                      const isSelected = questionFormData.type === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setQuestionFormData({ ...questionFormData, type: opt.value as any })}
                          className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${isSelected
                            ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm ring-2 ring-amber-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                            }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <IconComp className={`h-4 w-4 ${isSelected ? 'text-amber-600' : 'text-slate-500'}`} />
                            <span className="font-bold text-xs">{opt.label}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 leading-tight">
                            {opt.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 3: DROPDOWN & RADIO QUESTION & OPTIONS BUILDER */}
                {(questionFormData.type === 'select' || questionFormData.type === 'radio') && (
                  <div className="rounded-xl border-2 border-amber-300 bg-amber-50/60 p-4 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5">
                      <div className="flex items-center gap-2 text-amber-900 font-bold uppercase tracking-wider text-2xs">
                        <Tag className="h-3.5 w-3.5 text-amber-600" />
                        <span>3. {questionFormData.type === 'select' ? 'Dropdown' : 'Radio'} Options Setup</span>
                      </div>
                      <span className="text-2xs font-mono font-bold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300/60">
                        {questionFormData.type === 'select' ? 'Dropdown Mode' : 'Radio Pills Mode'}
                      </span>
                    </div>

                    {/* Add Options for this question */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-slate-900 font-bold text-xs">
                            Answer Options (Choices under this Question) <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-2xs text-slate-500">
                            Configure the selectable choices available under this question
                          </span>
                        </div>
                        <span className="text-2xs text-amber-800 font-bold bg-white px-2.5 py-0.5 rounded-full border border-amber-200 shadow-2xs">
                          {questionFormData.optionsList.filter((o) => o.trim()).length} Options Added
                        </span>
                      </div>

                      {/* Quick Option Templates */}
                      <div>
                        <span className="text-2xs font-bold text-amber-900 uppercase tracking-wider block mb-1.5">
                          Quick Option Presets:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {COMMON_OPTION_PRESETS.map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setQuestionFormData({ ...questionFormData, optionsList: [...preset.values] })}
                              className="rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-2xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                            >
                              + {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Option inputs list under Question */}
                      <div className="space-y-2 pt-1">
                        {questionFormData.optionsList.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-md bg-white border border-amber-300 flex items-center justify-center font-bold text-amber-800 text-[10px] shrink-0 shadow-2xs">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const updated = [...questionFormData.optionsList];
                                updated[idx] = e.target.value;
                                setQuestionFormData({ ...questionFormData, optionsList: updated });
                              }}
                              placeholder={`Option ${idx + 1} (e.g. choice text)`}
                              className="flex-1 rounded-xl border border-slate-250 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-xs focus:border-amber-500 outline-none"
                            />
                            {questionFormData.optionsList.length > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = questionFormData.optionsList.filter((_, i) => i !== idx);
                                  setQuestionFormData({ ...questionFormData, optionsList: updated });
                                }}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Remove option"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            setQuestionFormData({
                              ...questionFormData,
                              optionsList: [...questionFormData.optionsList, ''],
                            })
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-amber-400 bg-white px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100/70 transition-all mt-1 cursor-pointer shadow-2xs"
                        >
                          <Plus className="h-3.5 w-3.5 text-amber-600" />
                          Add Another Option
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowQuestionModal(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/20 transition-all cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingQuestionId ? 'Save Question Changes' : `Add Question to ${selectedTort}`}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD NEW TORT MODAL */}
      <AnimatePresence>
        {showAddTortModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Add New Tort Category</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Register a tort and assign it to selected vendor & campaign. By default, questions are kept blank.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddTortModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveNewTort} className="p-5 space-y-4 text-xs">
                {/* Tort Name */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Tort Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTortFormData.name}
                    onChange={(e) => setNewTortFormData({ ...newTortFormData, name: e.target.value })}
                    placeholder="e.g. PFAS, Zantac, Paraquat, Talcum Powder..."
                    className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Vendor Selection */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Assign to Vendor <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newTortFormData.vendorId}
                    onChange={(e) => setNewTortFormData({ ...newTortFormData, vendorId: e.target.value, campaignId: 'all' })}
                    className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="all">Global (All Vendors)</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                {/* Campaign Selection / Creation */}
                <div className="space-y-2">
                  <label className="block text-slate-800 font-bold">
                    Assign to Campaign(s) <span className="text-rose-500">*</span>
                  </label>

                  <select
                    value={newTortFormData.campaignId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewTortFormData({
                        ...newTortFormData,
                        campaignId: val,
                        createNewCampaign: val === '__create_new__',
                      });
                    }}
                    className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="all">
                      {newTortFormData.vendorId === 'all'
                        ? 'All Campaigns (Global Across Vendors)'
                        : 'All Campaigns of Selected Vendor'}
                    </option>
                    {assignedCampaignsForNewTort.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    <option value="__create_new__">+ Create New Dedicated Campaign for this Tort</option>
                  </select>

                  {newTortFormData.createNewCampaign && (
                    <div className="pt-2">
                      <label className="block text-slate-700 font-semibold mb-1">
                        New Dedicated Campaign Name:
                      </label>
                      <input
                        type="text"
                        required
                        value={newTortFormData.newCampaignName}
                        onChange={(e) => setNewTortFormData({ ...newTortFormData, newCampaignName: e.target.value })}
                        placeholder={`e.g. ${newTortFormData.name || 'New Tort'} Lead Generation Campaign`}
                        className="w-full rounded-xl border border-emerald-300 bg-emerald-50/20 px-3.5 py-2 text-xs text-slate-900 font-medium focus:border-emerald-600 outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Description (Optional) */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Tort Description / Notes <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={newTortFormData.description}
                    onChange={(e) => setNewTortFormData({ ...newTortFormData, description: e.target.value })}
                    placeholder="Brief description of litigation, injury criteria, or campaign scope..."
                    className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Notice: By default questions are empty */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-amber-900">
                    <span className="font-bold">By Default, Section 5 Questions are Blank:</span>
                    <p className="mt-0.5 text-amber-800">
                      This tort will be initialized with 0 questions in Section 5 (Other Case Information). You can add customized questions anytime using the "Add Question" button.
                    </p>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddTortModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingNewTort}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{isSavingNewTort ? 'Saving...' : 'Create & Add Tort'}</span>
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
