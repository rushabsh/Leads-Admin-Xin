import { create } from 'zustand';
import api from '../lib/api';
import {
  getFromStorage,
  saveToStorage,
  MockLead,
  MockCase,
  MockCampaign,
  MockVendor,
  MockLawFirm,
  MockTask,
  MockInvoice,
  MockLog,
  initializeLocalStorage,
  DEFAULT_USERS
} from '../utils/mockData';

interface CRMState {
  leads: MockLead[];
  cases: MockCase[];
  campaigns: MockCampaign[];
  vendors: MockVendor[];
  lawFirms: MockLawFirm[];
  tasks: MockTask[];
  invoices: MockInvoice[];
  logs: MockLog[];
  isLoading: boolean;

  isLoadingLeads: boolean;
  isLoadingCases: boolean;
  isLoadingCampaigns: boolean;
  isLoadingVendors: boolean;
  isLoadingLawFirms: boolean;
  isLoadingTasks: boolean;
  isLoadingInvoices: boolean;
  isLoadingLogs: boolean;
  isLoadingDashboard: boolean;

  lastFetched: {
    leads?: number;
    cases?: number;
    campaigns?: number;
    lawFirms?: number;
    vendors?: number;
    tasks?: number;
    invoices?: number;
    logs?: number;
    dashboard?: number;
  };

  dashboardStats: {
    totalLeads: number;
    todaysLeads: number;
    qualifiedLeads: number;
    disqualifiedLeads: number;
    signedRetainers: number;
    campaigns: number;
    vendors: number;
    lawFirms: number;
    revenue: number;
    pendingPayments: number;
  } | null;

  fetchData: (force?: boolean) => Promise<void>;
  fetchDashboard: (force?: boolean) => Promise<void>;
  fetchLeads: (force?: boolean) => Promise<void>;
  fetchCases: (force?: boolean) => Promise<void>;
  fetchCampaigns: (force?: boolean) => Promise<void>;
  fetchLawFirms: (force?: boolean) => Promise<void>;
  fetchVendors: (force?: boolean) => Promise<void>;
  fetchTasks: (force?: boolean) => Promise<void>;
  fetchInvoices: (force?: boolean) => Promise<void>;
  fetchLogs: (force?: boolean) => Promise<void>;

  // Lead Operations
  addLead: (lead: Omit<MockLead, 'id' | 'leadId' | 'createdAt' | 'leadScore' | 'aiSummary' | 'duplicateDetected'>) => Promise<void>;
  updateLeadStatus: (leadId: string, status: string) => Promise<void>;
  updateLead: (leadId: string, updates: Partial<MockLead>) => Promise<void>;
  deleteLead: (leadId: string) => Promise<void>;
  assignLead: (leadId: string, lawFirmId?: string, intakeAgentId?: string) => Promise<void>;

  // Case Operations
  addCase: (caseData: Omit<MockCase, 'id' | 'caseNumber' | 'createdAt'>) => Promise<void>;
  updateCaseStage: (caseId: string, stageName: string, medicalRecordsStatus?: string, settlementAmount?: number) => Promise<void>;

  // Intake Call operations
  logIntakeCall: (leadId: string, notes: string, disposition: string) => Promise<void>;
  scheduleCallback: (leadId: string, callbackTime: string, reason: string) => Promise<void>;

  // Task Operations
  addTask: (task: Omit<MockTask, 'id' | 'status'>) => Promise<void>;
  updateTaskStatus: (taskId: string, status: string) => Promise<void>;

  // Campaign & Custom Tort operations
  addCustomMassTort: (name: string, description: string) => Promise<any>;
}

const activePromises: { [key: string]: Promise<any> | null } = {};

export const useCRMStore = create<CRMState>((set, get) => ({
  leads: [],
  cases: [],
  campaigns: [],
  vendors: [],
  lawFirms: [],
  tasks: [],
  invoices: [],
  logs: [],
  isLoading: false,

  isLoadingLeads: false,
  isLoadingCases: false,
  isLoadingCampaigns: false,
  isLoadingVendors: false,
  isLoadingLawFirms: false,
  isLoadingTasks: false,
  isLoadingInvoices: false,
  isLoadingLogs: false,
  isLoadingDashboard: false,

  lastFetched: {},
  dashboardStats: null,

  fetchDashboard: async (force) => {
    if (!force && get().lastFetched.dashboard && (Date.now() - (get().lastFetched.dashboard || 0) < 300000)) {
      return;
    }
    if (activePromises.dashboard) {
      return activePromises.dashboard;
    }
    set({ isLoadingDashboard: true });
    const promise = (async () => {
      try {
        const res = await api.get('/dashboard/stats');
        set({
          dashboardStats: res.data.data,
          lastFetched: { ...get().lastFetched, dashboard: Date.now() },
          isLoadingDashboard: false
        });
      } catch (e) {
        console.warn('API error fetching dashboard stats. Computing locally from fallback...', e);
        const leads = get().leads.length ? get().leads : getFromStorage<MockLead[]>('mc_leads', []);
        const cases = get().cases.length ? get().cases : getFromStorage<MockCase[]>('mc_cases', []);
        const campaigns = get().campaigns.length ? get().campaigns : getFromStorage<MockCampaign[]>('mc_campaigns', []);
        const vendors = get().vendors.length ? get().vendors : getFromStorage<MockVendor[]>('mc_vendors', []);
        const lawFirms = get().lawFirms.length ? get().lawFirms : getFromStorage<MockLawFirm[]>('mc_lawfirms', []);

        const totalLeads = leads.length;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysLeads = leads.filter(l => new Date(l.createdAt) >= today).length;
        const qualifiedLeads = leads.filter(l => l.status === 'QUALIFIED').length;
        const disqualifiedLeads = leads.filter(l => l.status === 'REJECTED').length;
        const signedRetainers = leads.filter(l => l.status === 'SIGNED_RETAINER').length;
        const revenue = cases.reduce((sum, c) => sum + (c.settlementAmount || 0), 0);
        const pendingPayments = totalLeads * 150;

        set({
          dashboardStats: {
            totalLeads,
            todaysLeads,
            qualifiedLeads,
            disqualifiedLeads,
            signedRetainers,
            campaigns: campaigns.length,
            vendors: vendors.length,
            lawFirms: lawFirms.length,
            revenue,
            pendingPayments
          },
          isLoadingDashboard: false
        });
      } finally {
        activePromises.dashboard = null;
      }
    })();
    activePromises.dashboard = promise;
    return promise;
  },

  fetchLeads: async (force) => {
    if (!force && get().lastFetched.leads && (Date.now() - (get().lastFetched.leads || 0) < 300000)) {
      return;
    }
    if (activePromises.leads) {
      return activePromises.leads;
    }
    set({ isLoadingLeads: true });
    const promise = (async () => {
      try {
        const res = await api.get('/leads?limit=100');
        set({
          leads: res.data.data,
          lastFetched: { ...get().lastFetched, leads: Date.now() },
          isLoadingLeads: false
        });
      } catch (e) {
        set({
          leads: getFromStorage<MockLead[]>('mc_leads', []),
          isLoadingLeads: false
        });
      } finally {
        activePromises.leads = null;
      }
    })();
    activePromises.leads = promise;
    return promise;
  },

  fetchCases: async (force) => {
    if (!force && get().lastFetched.cases && (Date.now() - (get().lastFetched.cases || 0) < 300000)) {
      return;
    }
    if (activePromises.cases) {
      return activePromises.cases;
    }
    set({ isLoadingCases: true });
    const promise = (async () => {
      try {
        const res = await api.get('/cases?limit=100');
        set({
          cases: res.data.data,
          lastFetched: { ...get().lastFetched, cases: Date.now() },
          isLoadingCases: false
        });
      } catch (e) {
        set({
          cases: getFromStorage<MockCase[]>('mc_cases', []),
          isLoadingCases: false
        });
      } finally {
        activePromises.cases = null;
      }
    })();
    activePromises.cases = promise;
    return promise;
  },

  fetchCampaigns: async (force) => {
    if (!force && get().lastFetched.campaigns && (Date.now() - (get().lastFetched.campaigns || 0) < 300000)) {
      return;
    }
    if (activePromises.campaigns) {
      return activePromises.campaigns;
    }
    set({ isLoadingCampaigns: true });
    const promise = (async () => {
      try {
        const res = await api.get('/campaigns');
        set({
          campaigns: res.data.data,
          lastFetched: { ...get().lastFetched, campaigns: Date.now() },
          isLoadingCampaigns: false
        });
      } catch (e) {
        set({
          campaigns: getFromStorage<MockCampaign[]>('mc_campaigns', []),
          isLoadingCampaigns: false
        });
      } finally {
        activePromises.campaigns = null;
      }
    })();
    activePromises.campaigns = promise;
    return promise;
  },

  fetchLawFirms: async (force) => {
    if (!force && get().lastFetched.lawFirms && (Date.now() - (get().lastFetched.lawFirms || 0) < 300000)) {
      return;
    }
    if (activePromises.lawFirms) {
      return activePromises.lawFirms;
    }
    set({ isLoadingLawFirms: true });
    const promise = (async () => {
      try {
        const res = await api.get('/law-firms');
        set({
          lawFirms: res.data.data,
          lastFetched: { ...get().lastFetched, lawFirms: Date.now() },
          isLoadingLawFirms: false
        });
      } catch (e) {
        set({
          lawFirms: getFromStorage<MockLawFirm[]>('mc_lawfirms', []),
          isLoadingLawFirms: false
        });
      } finally {
        activePromises.lawFirms = null;
      }
    })();
    activePromises.lawFirms = promise;
    return promise;
  },

  fetchVendors: async (force) => {
    if (!force && get().lastFetched.vendors && (Date.now() - (get().lastFetched.vendors || 0) < 300000)) {
      return;
    }
    if (activePromises.vendors) {
      return activePromises.vendors;
    }
    set({ isLoadingVendors: true });
    const promise = (async () => {
      try {
        const res = await api.get('/vendors');
        set({
          vendors: res.data.data,
          lastFetched: { ...get().lastFetched, vendors: Date.now() },
          isLoadingVendors: false
        });
      } catch (e) {
        set({
          vendors: getFromStorage<MockVendor[]>('mc_vendors', []),
          isLoadingVendors: false
        });
      } finally {
        activePromises.vendors = null;
      }
    })();
    activePromises.vendors = promise;
    return promise;
  },

  fetchTasks: async (force) => {
    if (!force && get().lastFetched.tasks && (Date.now() - (get().lastFetched.tasks || 0) < 300000)) {
      return;
    }
    if (activePromises.tasks) {
      return activePromises.tasks;
    }
    set({ isLoadingTasks: true });
    const promise = (async () => {
      try {
        const res = await api.get('/tasks');
        set({
          tasks: res.data.data,
          lastFetched: { ...get().lastFetched, tasks: Date.now() },
          isLoadingTasks: false
        });
      } catch (e) {
        set({
          tasks: getFromStorage<MockTask[]>('mc_tasks', []),
          isLoadingTasks: false
        });
      } finally {
        activePromises.tasks = null;
      }
    })();
    activePromises.tasks = promise;
    return promise;
  },

  fetchInvoices: async (force) => {
    if (!force && get().lastFetched.invoices && (Date.now() - (get().lastFetched.invoices || 0) < 300000)) {
      return;
    }
    set({ isLoadingInvoices: true });
    set({
      invoices: getFromStorage<MockInvoice[]>('mc_invoices', []),
      lastFetched: { ...get().lastFetched, invoices: Date.now() },
      isLoadingInvoices: false
    });
  },

  fetchLogs: async (force) => {
    if (!force && get().lastFetched.logs && (Date.now() - (get().lastFetched.logs || 0) < 300000)) {
      return;
    }
    if (activePromises.logs) {
      return activePromises.logs;
    }
    set({ isLoadingLogs: true });
    const promise = (async () => {
      try {
        const res = await api.get('/settings/audit-logs');
        set({
          logs: res.data.data,
          lastFetched: { ...get().lastFetched, logs: Date.now() },
          isLoadingLogs: false
        });
      } catch (e) {
        set({
          logs: getFromStorage<MockLog[]>('mc_logs', []),
          isLoadingLogs: false
        });
      } finally {
        activePromises.logs = null;
      }
    })();
    activePromises.logs = promise;
    return promise;
  },

  fetchData: async (force) => {
    set({ isLoading: true });
    initializeLocalStorage();
    await Promise.all([
      get().fetchLeads(force),
      get().fetchCases(force),
      get().fetchCampaigns(force),
      get().fetchLawFirms(force),
      get().fetchVendors(force),
      get().fetchTasks(force),
      get().fetchInvoices(force),
      get().fetchLogs(force),
      get().fetchDashboard(force),
    ]);
    set({ isLoading: false });
  },

  addLead: async (leadData) => {
    const currentLeads = get().leads;
    const count = currentLeads.length;
    const optimisticLead: MockLead = {
      ...leadData,
      id: `ld-${Date.now()}`,
      leadId: `MC-${10000 + count + 1}`,
      leadScore: leadData.state === 'FL' || leadData.state === 'CA' ? 92 : 72,
      aiSummary: `AI LEAD SUMMARY:\nLead generated for ${leadData.firstName} ${leadData.lastName} targeting ${leadData.tortName}. Status is NEW. Exposure details: ${leadData.caseDetails || 'No records provided.'}`,
      duplicateDetected: currentLeads.some(l => l.email.toLowerCase() === leadData.email.toLowerCase()),
      createdAt: new Date().toISOString()
    };

    const optimisticList = [optimisticLead, ...currentLeads];
    set({ leads: optimisticList });
    saveToStorage('mc_leads', optimisticList);

    try {
      const res = await api.post('/leads', leadData);
      const actualLead = res.data.lead;
      const updated = get().leads.map(l => l.id === optimisticLead.id ? actualLead : l);
      set({ leads: updated });
      saveToStorage('mc_leads', updated);
    } catch (e) {
      console.warn('API error during lead creation, staying with local/optimistic lead.', e);
      const currentLogs = get().logs;
      const newLog: MockLog = {
        id: `log-${Date.now()}`,
        leadId: optimisticLead.id,
        userName: 'Local Session',
        action: 'LEAD_CREATED',
        details: `Lead ${optimisticLead.leadId} created manually (Demo mode)`,
        createdAt: new Date().toISOString()
      };
      set({ logs: [newLog, ...currentLogs] });
      saveToStorage('mc_logs', [newLog, ...currentLogs]);
    }
  },

  updateLeadStatus: async (leadId, status) => {
    const originalLeads = get().leads;
    const updated = originalLeads.map(l => l.id === leadId ? { ...l, status } : l);
    set({ leads: updated });
    saveToStorage('mc_leads', updated);

    if (status === 'SIGNED_RETAINER') {
      const lead = originalLeads.find(l => l.id === leadId);
      if (lead) {
        get().addCase({
          leadId,
          clientName: `${lead.firstName} ${lead.lastName}`,
          attorneyName: 'John Morgan Jr.',
          lawFirmId: lead.lawFirmId || 'firm-1',
          lawFirmName: lead.lawFirmName || 'Morgan & Morgan Partners',
          stageName: 'Retainer Signed',
          settlementAmount: 120000,
          medicalRecordsStatus: 'PENDING',
          courtDetails: 'District Court Pending'
        });
      }
    }

    try {
      const res = await api.put(`/leads/${leadId}`, { status });
      const actualLead = res.data.lead;
      const synced = get().leads.map(l => l.id === leadId ? { ...l, ...actualLead } : l);
      set({ leads: synced });
      saveToStorage('mc_leads', synced);
    } catch (e) {
      console.warn('API error updating lead status, keeping local state.', e);
    }
  },

  updateLead: async (leadId, updates) => {
    const originalLeads = get().leads;
    const updated = originalLeads.map(l => l.id === leadId ? { ...l, ...updates } : l);
    set({ leads: updated });
    saveToStorage('mc_leads', updated);

    try {
      const res = await api.put(`/leads/${leadId}`, updates);
      const actualLead = res.data.lead;
      const synced = get().leads.map(l => l.id === leadId ? { ...l, ...actualLead } : l);
      set({ leads: synced });
      saveToStorage('mc_leads', synced);
    } catch (e) {
      console.warn('API error updating lead, keeping local state.', e);
    }
  },

  deleteLead: async (leadId) => {
    const originalLeads = get().leads;
    const updated = originalLeads.filter(l => l.id !== leadId && l.leadId !== leadId);
    set({ leads: updated });
    saveToStorage('mc_leads', updated);

    try {
      await api.delete(`/leads/${leadId}`);
    } catch (e) {
      console.warn('API error deleting lead, keeping local removal.', e);
    }
  },

  assignLead: async (leadId, lawFirmId, intakeAgentId) => {
    const originalLeads = get().leads;
    const firm = get().lawFirms.find(f => f.id === lawFirmId);
    const agent = DEFAULT_USERS.find(u => u.id === intakeAgentId);

    const updated = originalLeads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          lawFirmId,
          lawFirmName: firm?.name,
          intakeAgentId,
          intakeAgentName: agent?.name,
          status: lawFirmId ? 'QUALIFIED' : l.status
        };
      }
      return l;
    });

    set({ leads: updated });
    saveToStorage('mc_leads', updated);

    try {
      await api.post(`/leads/${leadId}/assign`, { lawFirmId, intakeAgentId });
    } catch (e) {
      console.warn('API error assigning lead, keeping local assignment.', e);
    }
  },

  addCase: async (caseData) => {
    const current = get().cases;
    const count = current.length;
    const optimisticCase: MockCase = {
      ...caseData,
      id: `cs-${Date.now()}`,
      caseNumber: `CASE-2026-${1000 + count + 1}`,
      createdAt: new Date().toISOString()
    };

    const updated = [optimisticCase, ...current];
    set({ cases: updated });
    saveToStorage('mc_cases', updated);

    try {
      const res = await api.post('/cases', caseData);
      const actualCase = res.data.case;
      const synced = get().cases.map(c => c.id === optimisticCase.id ? actualCase : c);
      set({ cases: synced });
      saveToStorage('mc_cases', synced);
    } catch (e) {
      console.warn('API error creating case, keeping local case.', e);
    }
  },

  updateCaseStage: async (caseId, stageName, medicalRecordsStatus, settlementAmount) => {
    const originalCases = get().cases;
    const updated = originalCases.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          stageName,
          medicalRecordsStatus: medicalRecordsStatus || c.medicalRecordsStatus,
          settlementAmount: settlementAmount !== undefined ? settlementAmount : c.settlementAmount
        };
      }
      return c;
    });

    set({ cases: updated });
    saveToStorage('mc_cases', updated);

    try {
      const res = await api.put(`/cases/${caseId}`, { stageId: stageName, medicalRecordsStatus, settlementAmount });
      const actualCase = res.data.case;
      const synced = get().cases.map(c => c.id === caseId ? { ...c, ...actualCase } : c);
      set({ cases: synced });
      saveToStorage('mc_cases', synced);
    } catch (e) {
      console.warn('API error updating case, keeping local state.', e);
    }
  },

  logIntakeCall: async (leadId, notes, disposition) => {
    const lead = get().leads.find(l => l.id === leadId);
    if (lead) {
      let nextStatus = lead.status;
      if (disposition === 'QUALIFIED') nextStatus = 'QUALIFIED';
      else if (disposition === 'REJECTED') nextStatus = 'REJECTED';
      else nextStatus = 'CONTACTED';

      const updatedLeads = get().leads.map(l =>
        l.id === leadId
          ? {
            ...l,
            status: nextStatus,
            caseDetails: `${l.caseDetails || ''}\n[Call log]: ${notes}`.trim()
          }
          : l
      );

      set({ leads: updatedLeads });
      saveToStorage('mc_leads', updatedLeads);

      const currentLogs = get().logs;
      const newLog: MockLog = {
        id: `log-${Date.now()}`,
        leadId,
        userName: 'Local Session',
        action: 'CALL_LOGGED',
        details: `Call logged with disposition: ${disposition}. Notes: ${notes}`,
        createdAt: new Date().toISOString()
      };
      set({ logs: [newLog, ...currentLogs] });
      saveToStorage('mc_logs', [newLog, ...currentLogs]);
    }

    try {
      await api.post(`/intake/${leadId}/call`, { notes, disposition });
    } catch (e) {
      console.warn('API error logging intake call, keeping local changes.', e);
    }
  },

  scheduleCallback: async (leadId, callbackTime, reason) => {
    const lead = get().leads.find(l => l.id === leadId);
    if (lead) {
      const newTask: MockTask = {
        id: `tsk-${Date.now()}`,
        title: `Callback: ${lead.firstName} ${lead.lastName}`,
        description: reason || 'Scheduled callback',
        assignedToName: 'Jane Intake Agent',
        assignedToId: 'usr-2',
        leadId,
        leadName: `${lead.firstName} ${lead.lastName}`,
        dueDate: callbackTime.split('T')[0],
        priority: 'HIGH',
        status: 'PENDING'
      };

      const updatedTasks = [newTask, ...get().tasks];
      set({ tasks: updatedTasks });
      saveToStorage('mc_tasks', updatedTasks);

      const currentLogs = get().logs;
      const newLog: MockLog = {
        id: `log-${Date.now()}`,
        leadId,
        userName: 'Local Session',
        action: 'CALLBACK_SCHEDULED',
        details: `Callback scheduled for ${callbackTime}. Reason: ${reason}`,
        createdAt: new Date().toISOString()
      };
      set({ logs: [newLog, ...currentLogs] });
      saveToStorage('mc_logs', [newLog, ...currentLogs]);
    }

    try {
      await api.post(`/intake/${leadId}/callback`, { callbackTime, reason });
    } catch (e) {
      console.warn('API error scheduling callback, keeping local changes.', e);
    }
  },

  addTask: async (taskData) => {
    const current = get().tasks;
    const optimisticTask: MockTask = {
      ...taskData,
      id: `tsk-${Date.now()}`,
      status: 'PENDING'
    };
    const updated = [optimisticTask, ...current];
    set({ tasks: updated });
    saveToStorage('mc_tasks', updated);

    try {
      const res = await api.post('/tasks', taskData);
      const actualTask = res.data.task;
      const synced = get().tasks.map(t => t.id === optimisticTask.id ? actualTask : t);
      set({ tasks: synced });
      saveToStorage('mc_tasks', synced);
    } catch (e) {
      console.warn('API error adding task, keeping local task.', e);
    }
  },

  updateTaskStatus: async (taskId, status) => {
    const originalTasks = get().tasks;
    const updated = originalTasks.map(t => t.id === taskId ? { ...t, status } : t);
    set({ tasks: updated });
    saveToStorage('mc_tasks', updated);

    try {
      const res = await api.put(`/tasks/${taskId}`, { status });
      const actualTask = res.data.task;
      const synced = get().tasks.map(t => t.id === taskId ? { ...t, ...actualTask } : t);
      set({ tasks: synced });
      saveToStorage('mc_tasks', synced);
    } catch (e) {
      console.warn('API error updating task, keeping local task.', e);
    }
  },

  addCustomMassTort: async (name, description) => {
    const response = await api.post('/settings/mass-torts', { name, description });
    return response.data;
  }
}));
