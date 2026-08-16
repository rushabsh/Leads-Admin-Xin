'use client';

import { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Calendar, ShieldCheck, AlertTriangle,
  FileText, CheckCircle2, Clock, Sparkles, Building2, Tag, Copy, Check,
  ExternalLink, Activity, Scale, Briefcase, Zap, Layers, RefreshCw, ChevronRight, XCircle,
  MessageSquare, Send, MessageSquarePlus, UserCheck, MessageCircle, Search, ThumbsUp,
  Paperclip, Bold, Italic, List, ListOrdered, Code, ChevronDown, ChevronUp, Globe,
  Stethoscope, Award, FileCode, CheckSquare, HeartPulse, Ribbon, HelpCircle, Eye
} from 'lucide-react';
import api from '../../../../../lib/api';
import { useCRMStore } from '../../../../../store/crmStore';
import { useAuthStore } from '../../../../../store/authStore';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ActivityFeedItem {
  id: string;
  leadId: string;
  userId?: string;
  authorName: string;
  roleBadge: string;
  statusLine: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  hasQuickViewDetails?: boolean;
  quickViewSummary?: {
    caseNumber?: string;
    diagnosis?: string;
    exposureYears?: string;
    status?: string;
  };
}

export default function VendorLeadDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const { leads: storeLeads, fetchData } = useCRMStore();

  const [lead, setLead] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Activity Feed & Sidebar Tabs
  const [activeRightTab, setActiveRightTab] = useState<'Post' | 'Details' | 'Related'>('Post');
  const [feedSearchTerm, setFeedSearchTerm] = useState('');
  const [feedItems, setFeedItems] = useState<ActivityFeedItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search input for Republics & System fields
  const [republicSearch, setRepublicSearch] = useState('');
  const [coqoutSearch, setCoqoutSearch] = useState('');
  const [selectedSystemQueue, setSelectedSystemQueue] = useState('Intake Queue - Tier 1');

  // Rich Text Editor formatting state toggles
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isList, setIsList] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);

  // Expanded quick-view cards on feed
  const [expandedFeedCards, setExpandedFeedCards] = useState<Record<string, boolean>>({});

  const vendorId = user?.vendorId || 'ven-1';
  const employeeName = user?.name || user?.username || user?.email || 'Employee Specialist';

  // Fetch Lead Data & Feed History
  useEffect(() => {
    let isMounted = true;

    async function loadLeadData() {
      setIsLoading(true);
      try {
        const res = await api.get(`/leads/${id}`);
        if (res.data?.success && res.data?.lead) {
          if (isMounted) {
            setLead(res.data.lead);
          }
        } else {
          throw new Error('Lead not found');
        }
      } catch (err) {
        console.warn('API error fetching lead detail, falling back to CRM store...', err);
        await fetchData();
        const found = storeLeads.find((l: any) => l.id === id || l.leadId === id);
        if (found && isMounted) {
          setLead(found);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    async function loadCommentsFeed() {
      try {
        const res = await api.get(`/leads/${id}/comments`);
        if (res.data?.success && Array.isArray(res.data.comments)) {
          if (isMounted) {
            const formatted: ActivityFeedItem[] = res.data.comments.map((c: any, index: number) => ({
              id: c.id || `feed-${index}`,
              leadId: id,
              userId: c.userId,
              authorName: c.authorName || c.user?.name || 'Employee Specialist',
              roleBadge: c.user?.role || 'EMPLOYEE',
              statusLine: 'Employee replied to customer',
              content: c.content,
              createdAt: c.createdAt,
              likes: c.likes || 1,
              isLiked: false,
              hasQuickViewDetails: index % 2 === 0,
              quickViewSummary: {
                caseNumber: c.leadId || `CAS-2026-${1000 + index}`,
                diagnosis: 'Camp Lejeune Toxic Exposure / Kidney Cancer',
                exposureYears: '1982 - 1987 (5 Years)',
                status: 'Verified Intake',
              }
            }));

            // Sort newest first
            const sorted = formatted.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setFeedItems(sorted);
            localStorage.setItem(`lead_feed_${id}`, JSON.stringify(sorted));
          }
          return;
        }
      } catch (e) {
        console.warn('API comments error, reading localStorage feed...', e);
      }

      // Local storage fallback
      const saved = localStorage.getItem(`lead_feed_${id}`);
      if (saved && isMounted) {
        try {
          const parsed = JSON.parse(saved);
          setFeedItems(parsed);
          return;
        } catch (_) { }
      }

      // Default mock feed if none exists
      if (isMounted) {
        const defaultFeed: ActivityFeedItem[] = [
          {
            id: 'feed-init-1',
            leadId: id,
            authorName: 'Sarah Jenkins, JD',
            roleBadge: 'INTAKE ATTORNEY',
            statusLine: 'Employee replied to customer',
            content: 'Spoke with the claimant today. Verified date of first exposure at Camp Lejeune (March 1982). Diagnosing doctor records requested from St. Jude Medical Center.',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            likes: 3,
            isLiked: false,
            hasQuickViewDetails: true,
            quickViewSummary: {
              caseNumber: 'CAS-2026-90412',
              diagnosis: 'Renal Carcinoma / Water Contamination',
              exposureYears: '1982 - 1987',
              status: 'Closed / Retained',
            }
          },
          {
            id: 'feed-init-2',
            leadId: id,
            authorName: 'David Miller',
            roleBadge: 'CASE MANAGER',
            statusLine: 'System Intake Event',
            content: 'Lead transferred to Legal Review queue. POA documentation uploaded and verified with victim profile details.',
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            likes: 1,
            isLiked: false,
            hasQuickViewDetails: false,
          }
        ];
        setFeedItems(defaultFeed);
      }
    }

    loadLeadData();
    loadCommentsFeed();

    return () => {
      isMounted = false;
    };
  }, [id, fetchData, storeLeads]);

  // Copy Helper
  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Add Comment/Post to Feed Handler
  const handlePostFeedComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsPostingComment(true);
    let finalContent = newComment.trim();

    if (isBold) finalContent = `**${finalContent}**`;
    if (isItalic) finalContent = `_${finalContent}_`;
    if (attachedFiles.length > 0) {
      finalContent += `\n\n📎 Attached files: ${attachedFiles.join(', ')}`;
    }

    const newFeedEntry: ActivityFeedItem = {
      id: `feed-${Date.now()}`,
      leadId: id,
      authorName: employeeName,
      roleBadge: user?.roleName || 'EMPLOYEE',
      statusLine: 'Employee replied to customer',
      content: finalContent,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      hasQuickViewDetails: true,
      quickViewSummary: {
        caseNumber: lead?.leadId ? `CAS-${lead.leadId}` : 'CAS-2026-90412',
        diagnosis: lead?.tortName || 'Camp Lejeune Litigation',
        exposureYears: '1982 - 1987',
        status: lead?.status || 'Closed',
      }
    };

    try {
      await api.post(`/leads/${id}/comments`, {
        content: finalContent,
        authorName: employeeName,
      });

      setFeedItems(prev => {
        const updated = [newFeedEntry, ...prev];
        localStorage.setItem(`lead_feed_${id}`, JSON.stringify(updated));
        return updated;
      });

      setNewComment('');
      setAttachedFiles([]);
      setIsBold(false);
      setIsItalic(false);
      setToastMessage('Comment posted to activity feed!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.warn('API feed post error, saving to local state...', err);
      setFeedItems(prev => {
        const updated = [newFeedEntry, ...prev];
        localStorage.setItem(`lead_feed_${id}`, JSON.stringify(updated));
        return updated;
      });
      setNewComment('');
      setAttachedFiles([]);
      setToastMessage('Comment saved to feed!');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsPostingComment(false);
    }
  };

  // Toggle Like on feed item
  const handleToggleLike = (feedId: string) => {
    setFeedItems(prev =>
      prev.map(item => {
        if (item.id === feedId) {
          const isLiked = !item.isLiked;
          return {
            ...item,
            isLiked,
            likes: isLiked ? item.likes + 1 : Math.max(0, item.likes - 1)
          };
        }
        return item;
      })
    );
  };

  // Toggle quick view card on feed
  const toggleQuickView = (feedId: string) => {
    setExpandedFeedCards(prev => ({
      ...prev,
      [feedId]: !prev[feedId]
    }));
  };

  // Attachment mock trigger
  const handleAddAttachmentMock = () => {
    const mockFileName = `Document_Scan_${Math.floor(100 + Math.random() * 900)}.pdf`;
    setAttachedFiles(prev => [...prev, mockFileName]);
  };

  // Filtered Feed Items
  const filteredFeedItems = useMemo(() => {
    if (!feedSearchTerm.trim()) return feedItems;
    return feedItems.filter(
      item =>
        item.content.toLowerCase().includes(feedSearchTerm.toLowerCase()) ||
        item.authorName.toLowerCase().includes(feedSearchTerm.toLowerCase()) ||
        item.roleBadge.toLowerCase().includes(feedSearchTerm.toLowerCase())
    );
  }, [feedItems, feedSearchTerm]);

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading Vendor Details Wireframe...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <User className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Vendor Record Not Found</h2>
          <p className="mt-1 text-xs text-slate-500">The requested lead or vendor details could not be located.</p>
        </div>
        <Link
          href="/vendor-portal/leads"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vendor Leads
        </Link>
      </div>
    );
  }

  // Calculated Mock Dates
  const openedDate = new Date(lead.createdAt || '2026-07-27T09:15:00Z');
  const nextDate = new Date(openedDate.getTime() + 86400000 * 2);
  const acceptedDate = new Date(openedDate.getTime() + 3600000 * 2);
  const closedDate = new Date(openedDate.getTime() + 3600000 * 6);

  // Safely parse JSON case details if present
  let parsedDetails: any = null;
  if (lead?.caseDetails && typeof lead.caseDetails === 'string' && lead.caseDetails.trim().startsWith('{')) {
    try {
      parsedDetails = JSON.parse(lead.caseDetails);
    } catch (_) { }
  }

  const parsedLeadInfo = parsedDetails?.leadInfo || {};
  const parsedContactInfo = parsedDetails?.contactInfo || {};
  const parsedPOAInfo = parsedDetails?.poa || {};
  const parsedDiagnosisInfo = parsedDetails?.diagnosisInfo || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {(copiedField || toastMessage) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl border border-slate-800"
          >
            <Check className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage || `Copied ${copiedField} to clipboard!`}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Breadcrumb Nav */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Vendor Portal</span>
          <ChevronRight className="h-3 w-3" />
          <span>Vendor Details</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-slate-700">{lead.leadId}</span>
        </div>
      </div>

      {/* 1. PAGE HEADER & KEY IDENTIFIERS BAR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-bold text-2xl border border-blue-100 shadow-xs">
              {lead.firstName?.[0] || 'V'}{lead.lastName?.[0] || 'D'}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {lead.firstName} {lead.lastName}
                </h1>
                <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-mono font-bold text-slate-700 border border-slate-200">
                  Case/Lead ID: {lead.leadId}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 text-xs font-bold">
                  <span className="h-2 w-2 rounded-full bg-rose-600"></span>
                  Status: Closed
                </span>
                <span className="rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 text-xs font-semibold">
                  Mass Tort Intake
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <strong>Email:</strong> {lead.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <strong>Phone:</strong> {lead.phone}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5 text-slate-400" />
                  <strong>Service/Category:</strong> {lead.tortName || lead.campaignName || 'Camp Lejeune Litigation'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2 md:pt-0">
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
              >
                <Phone className="h-4 w-4 text-emerald-600" />
                Call Phone
              </a>
            )}
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
              >
                <Mail className="h-4 w-4 text-blue-600" />
                Send Email
              </a>
            )}
            <button
              onClick={() => handleCopy(`Lead ID: ${lead.leadId}\nName: ${lead.firstName} ${lead.lastName}\nEmail: ${lead.email}\nPhone: ${lead.phone}`, 'Header Summary')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copy Identifiers
            </button>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN WIREFRAME MAIN LAYOUT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN (2 SPANS) - SECTIONS 2 to 6 */}
        <div className="lg:col-span-2 space-y-6">

          {/* 2. LEAD INFORMATION SECTION */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">2. Lead Information</h3>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Core Profile Specs
              </span>
            </div>

            <div className="p-6 space-y-6">
              {/* Lead Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Type</label>
                  <p className="mt-1 text-xs font-semibold text-slate-900">Direct Vendor Ingestion</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">First Name</label>
                  <p className="mt-1 text-xs font-semibold text-slate-900">{lead.firstName || '—'}</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Last Name</label>
                  <p className="mt-1 text-xs font-semibold text-slate-900">{lead.lastName || '—'}</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Token / Token Names</label>
                  <p className="mt-1 text-xs font-mono font-bold text-indigo-600">TOK-LEAD-9921-X</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Closed / Countries Completed</label>
                  <p className="mt-1 text-xs font-semibold text-slate-900">United States (50 States)</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Search for Republics</label>
                  <div className="mt-1 relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search republics..."
                      value={republicSearch}
                      onChange={(e) => setRepublicSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Checkbox & Ribbons indicator */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Checkbox & Ribbons Indicators
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-xs border border-emerald-200">
                    <CheckSquare className="h-4 w-4 text-emerald-600" />
                    <span>Verified Lead Consent</span>
                  </label>

                  <label className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-xs border border-amber-200">
                    <Ribbon className="h-4 w-4 text-amber-600" />
                    <span>Priority Ribbon Verified</span>
                  </label>

                  <label className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs border border-indigo-200">
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                    <span>TCPA & HIPAA Compliant</span>
                  </label>
                </div>
              </div>

              {/* Timestamps Grid */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Timestamps Lifecycle</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Date/Time Opened</span>
                    <span className="text-xs font-bold text-slate-900 mt-1 block">
                      {openedDate.toLocaleDateString()} {openedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Date Next</span>
                    <span className="text-xs font-bold text-slate-900 mt-1 block">
                      {nextDate.toLocaleDateString()} 10:00 AM
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Date/Time Accepted</span>
                    <span className="text-xs font-bold text-slate-900 mt-1 block">
                      {acceptedDate.toLocaleDateString()} {acceptedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Date/Time Closed/Lission</span>
                    <span className="text-xs font-bold text-rose-600 mt-1 block">
                      {closedDate.toLocaleDateString()} {closedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* System/Sales Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 pt-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Reason / Reason Code</label>
                  <p className="mt-1 text-xs font-bold text-emerald-600">QUALIFIED_INTAKE_01</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Coqout Senina Hafia</label>
                  <input
                    type="text"
                    placeholder="Search Coqout..."
                    value={coqoutSearch}
                    onChange={(e) => setCoqoutSearch(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Report For Sales</label>
                  <p className="mt-1 text-xs font-semibold text-slate-900">Verified Sales Report #882</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Product Reference / URL</label>
                  <a
                    href="https://crm.legalportal.com/ref/p-9012"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>p-9012 Link</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 3. CASE INFORMATION SECTION */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">3. Case Information</h3>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Case Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Case Number</label>
                  <p className="mt-1 text-xs font-mono font-bold text-blue-600">CAS-2026-90412</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                    {lead.caseDetails || 'Claimant stationed at Camp Lejeune military base between 1982 and 1987. Diagnosed with Non-Hodgkin Lymphoma secondary to toxic water contamination.'}
                  </p>
                </div>
              </div>

              {/* Exposure Tracking */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-indigo-600" />
                  Exposure Tracking Calendar
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-slate-500 block">Date of Incident</span>
                    <span className="text-xs font-semibold text-slate-900 mt-0.5 block">2018-05-14</span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 block">Date First Exposure</span>
                    <span className="text-xs font-bold text-indigo-600 mt-0.5 block">1982-03-01</span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 block">Date Last Exposure</span>
                    <span className="text-xs font-bold text-indigo-600 mt-0.5 block">1987-11-30</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. DIAGNOSIS INFORMATION SECTION */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">4. Diagnosis & Medical Details</h3>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Diagnosis Details & Staff */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Diagnosis</label>
                  <p className="mt-1 text-xs font-bold text-emerald-600">Non-Hodgkin Lymphoma / Renal Carcinoma</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Diagnosis Year</label>
                  <p className="mt-1 text-xs font-semibold text-slate-900">2021</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Diagnosing Doctor Name</label>
                  <p className="mt-1 text-xs font-semibold text-slate-900">Dr. Robert Vance, MD</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Treating Doctor Name</label>
                  <p className="mt-1 text-xs font-semibold text-slate-900">Dr. Elena Rostova, MD</p>
                </div>
              </div>

              {/* Medical Facilities */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Medical Facilities & Addresses</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Diagnosing Facility */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
                    <h5 className="text-xs font-bold text-slate-900">Diagnosing Facility</h5>
                    <p className="text-xs font-semibold text-emerald-600">St. Jude Medical Center</p>
                    <p className="text-xs text-slate-500">
                      <strong>Address:</strong> 123 Health Ave, Suite 400, Baltimore, MD 21201
                    </p>
                    <p className="text-xs text-slate-500">
                      <strong>Phone:</strong> (410) 555-0199
                    </p>
                  </div>

                  {/* Treating Facility */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
                    <h5 className="text-xs font-bold text-slate-900">Treating / Existing Facility</h5>
                    <p className="text-xs font-semibold text-blue-600">Johns Hopkins Hospital</p>
                    <p className="text-xs text-slate-500">
                      <strong>Address:</strong> 600 N Wolfe St, Baltimore, MD 21287
                    </p>
                    <p className="text-xs text-slate-500">
                      <strong>Phone:</strong> (410) 555-0244
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. POWER OF ATTORNEY (POA) & VICTIM DETAILS SECTION */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-amber-600" />
                <h3 className="font-bold text-slate-900">5. Power of Attorney (POA) & Victim Profile</h3>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* POA Block with Checkbox */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-amber-900">POA Reason / Reascory</h5>
                    <p className="text-xs text-amber-800">Power of Attorney legally executed by primary representative</p>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase text-amber-800 bg-amber-200/60 border border-amber-300 px-2.5 py-0.5 rounded-full">
                  ACTIVE POA
                </span>
              </div>

              {/* Victim Profile Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Victim Profile</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 block">Victim Name</label>
                    <span className="text-xs font-bold text-slate-900 mt-0.5 block">Johnathan Sr.</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 block">Victim Full Name</label>
                    <span className="text-xs font-bold text-slate-900 mt-0.5 block">Johnathan Marcus Doe Sr.</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 block">Victim Last Name</label>
                    <span className="text-xs font-bold text-slate-900 mt-0.5 block">Doe</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 block">Victim DOB</label>
                    <span className="text-xs font-semibold text-slate-800 mt-0.5 block">1955-08-12</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 block">Victim DOD</label>
                    <span className="text-xs font-semibold text-slate-800 mt-0.5 block">Deceased (2024-01-15)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. SYSTEM INFORMATION SECTION */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">6. System Information & Tags</h3>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Input (System Queue)</label>
                <select
                  value={selectedSystemQueue}
                  onChange={(e) => setSelectedSystemQueue(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 shadow-xs"
                >
                  <option value="Intake Queue - Tier 1">Intake Queue - Tier 1</option>
                  <option value="Legal Review Queue">Legal Review Queue</option>
                  <option value="Retainer Processing">Retainer Processing</option>
                  <option value="Closed / Archived">Closed / Archived</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Case Of Inc Tag</label>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 text-xs font-bold">
                    <Tag className="h-3 w-3" />
                    Water Contamination Exposure
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Campaign Name Tag</label>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-bold">
                    <Building2 className="h-3 w-3" />
                    {lead.campaignName || 'Camp Lejeune Justice'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1 SPAN) - 7. ACTIVITY & FEED PANEL (SIDEBAR) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden sticky top-6">

            {/* Header Tabs: Post, Details, Related */}
            <div className="border-b border-slate-100 bg-slate-50/50 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200 w-full">
                  <button
                    onClick={() => setActiveRightTab('Post')}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${activeRightTab === 'Post'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    Post (Feed)
                  </button>
                  <button
                    onClick={() => setActiveRightTab('Details')}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${activeRightTab === 'Details'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveRightTab('Related')}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${activeRightTab === 'Related'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    Related
                  </button>
                </div>
              </div>
            </div>

            {/* TAB CONTENT: POST (FEED) */}
            {activeRightTab === 'Post' && (
              <div className="p-5 space-y-5">
                {/* Search Feed Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search activity & comments feed..."
                    value={feedSearchTerm}
                    onChange={(e) => setFeedSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-blue-600 shadow-xs"
                  />
                </div>

                {/* Comment Rich-Text Editor */}
                <form onSubmit={handlePostFeedComment} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
                    <span className="font-semibold text-slate-800">
                      Posting as: {employeeName}
                    </span>
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Rich Editor</span>
                  </div>

                  {/* Rich Text Toolbar */}
                  <div className="flex items-center gap-1 text-slate-500">
                    <button
                      type="button"
                      onClick={() => setIsBold(!isBold)}
                      className={`p-1.5 rounded-md hover:bg-slate-200 transition-colors ${isBold ? 'bg-blue-50 text-blue-600 font-bold' : ''}`}
                      title="Bold"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsItalic(!isItalic)}
                      className={`p-1.5 rounded-md hover:bg-slate-200 transition-colors ${isItalic ? 'bg-blue-50 text-blue-600 italic' : ''}`}
                      title="Italic"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsList(!isList)}
                      className="p-1.5 rounded-md hover:bg-slate-200 transition-colors"
                      title="Bullet List"
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleAddAttachmentMock}
                      className="p-1.5 rounded-md hover:bg-slate-200 transition-colors"
                      title="Attach File"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment or reply to customer..."
                    className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 resize-none"
                  />

                  {/* Attached Files Badges */}
                  {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {attachedFiles.map((file, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          <Paperclip className="h-2.5 w-2.5 text-slate-400" />
                          {file}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons: Like / Comment / Send */}
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setToastMessage('Liked post draft!')}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        Like
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Comment
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isPostingComment || !newComment.trim()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Send Post
                    </button>
                  </div>
                </form>

                {/* Timeline Feed */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span>Timeline Activity Feed</span>
                    <span>{filteredFeedItems.length} items</span>
                  </h4>

                  {filteredFeedItems.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No feed items match your search.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredFeedItems.map((item) => {
                        const author = item.authorName || 'Employee Specialist';
                        const initials = author
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase();

                        const dateObj = new Date(item.createdAt);
                        const timeString = !isNaN(dateObj.getTime())
                          ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Just now';

                        const isCardExpanded = expandedFeedCards[item.id] || false;

                        return (
                          <div
                            key={item.id}
                            className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2.5 transition-all"
                          >
                            {/* User Avatar & Role Badge */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-xs border border-blue-200 shrink-0">
                                  {initials}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h5 className="text-xs font-bold text-slate-900 leading-none">
                                      {author}
                                    </h5>
                                    <span className="rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 text-[10px] font-extrabold uppercase">
                                      {item.roleBadge || 'EMPLOYEE'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                                    {item.statusLine || 'Employee replied to customer'}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs text-slate-400 font-medium">
                                {timeString}
                              </span>
                            </div>

                            {/* Message Body */}
                            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap pl-10">
                              {item.content}
                            </p>

                            {/* Like & Quick-View Summary Card */}
                            <div className="pl-10 flex items-center justify-between pt-1 border-t border-slate-200">
                              <button
                                onClick={() => handleToggleLike(item.id)}
                                className={`inline-flex items-center gap-1 text-xs font-semibold ${item.isLiked ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-700'
                                  }`}
                              >
                                <ThumbsUp className="h-3 w-3" />
                                {item.likes} {item.likes === 1 ? 'Like' : 'Likes'}
                              </button>

                              {item.hasQuickViewDetails && (
                                <button
                                  onClick={() => toggleQuickView(item.id)}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>{isCardExpanded ? 'Hide details' : 'View more details'}</span>
                                  {isCardExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </button>
                              )}
                            </div>

                            {/* Quick-View Summary Card (Expanded) */}
                            {isCardExpanded && item.quickViewSummary && (
                              <div className="ml-10 rounded-xl bg-white p-3 border border-slate-200 text-xs space-y-1.5 shadow-xs">
                                <h6 className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                                  Quick Case Summary Card
                                </h6>
                                <div className="grid grid-cols-2 gap-2 text-slate-600">
                                  <div>
                                    <span className="text-slate-400 block">Case Number:</span>
                                    <span className="font-semibold">{item.quickViewSummary.caseNumber}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block">Diagnosis:</span>
                                    <span className="font-semibold">{item.quickViewSummary.diagnosis}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block">Exposure Period:</span>
                                    <span className="font-semibold">{item.quickViewSummary.exposureYears}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block">Current Status:</span>
                                    <span className="font-bold text-emerald-600">{item.quickViewSummary.status}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: DETAILS */}
            {activeRightTab === 'Details' && (
              <div className="p-5 space-y-4 text-xs">
                <h4 className="font-bold text-slate-900">Quick Details Specs</h4>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400">Lead Record GUID:</span>
                    <span className="font-mono text-xs font-semibold text-slate-800">{lead.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400">Ingestion Method:</span>
                    <span className="font-semibold text-slate-800">REST API / Vendor Portal</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400">TCPA Verification:</span>
                    <span className="font-bold text-emerald-600">Passed / Timestamped</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400">Vendor ID:</span>
                    <span className="font-semibold text-slate-800">{lead.vendorId || vendorId}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: RELATED */}
            {activeRightTab === 'Related' && (
              <div className="p-5 space-y-4 text-xs">
                <h4 className="font-bold text-slate-900">Related Files & Documents</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-semibold text-slate-800 truncate">Medical_Records_StJude.pdf</span>
                    <a href="#" onClick={(e) => { e.preventDefault(); setToastMessage('Downloading document...'); }} className="text-blue-600 font-bold hover:underline">Download</a>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-semibold text-slate-800 truncate">Executed_POA_Agreement.pdf</span>
                    <a href="#" onClick={(e) => { e.preventDefault(); setToastMessage('Downloading document...'); }} className="text-blue-600 font-bold hover:underline">Download</a>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
