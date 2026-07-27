export interface MockUser {
  id: string;
  email: string;
  username: string;
  name: string;
  phone?: string;
  role: string;
  roleName?: string;
  permissions: string[];
  vendorId?: string | null;
  lawFirmId?: string | null;
}

export interface MockLead {
  id: string;
  leadId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  state: string;
  status: string;
  priority: string;
  leadScore: number;
  aiSummary: string;
  duplicateDetected: boolean;
  campaignId: string;
  campaignName: string;
  tortName: string;
  vendorId?: string;
  vendorName?: string;
  intakeAgentId?: string;
  intakeAgentName?: string;
  lawFirmId?: string;
  lawFirmName?: string;
  sourceName: string;
  caseDetails?: string;
  createdAt: string;
}

export interface MockCase {
  id: string;
  caseNumber: string;
  leadId: string;
  clientName: string;
  attorneyName: string;
  lawFirmId: string;
  lawFirmName: string;
  stageName: string;
  settlementAmount: number;
  medicalRecordsStatus: string;
  courtDetails: string;
  createdAt: string;
}

export interface MockCampaign {
  id: string;
  name: string;
  description?: string;
  tortName: string;
  budget: number;
  roi: number;
  revenue: number;
  leadCount: number;
  conversionRate: number;
  status: string;
  vendorId?: string;
  vendorName: string;
}

export interface MockVendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  address?: string;
  createdAt?: string;
  stats: {
    totalLeads: number;
    qualifiedLeads: number;
    rejectedLeads: number;
    revenue: number;
    pendingPayments: number;
  };
}

export interface MockLawFirm {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  stats: {
    assignedLeads: number;
    casesCount: number;
    activeCasesCount: number;
    revenue: number;
    payments: number;
  };
}

export interface MockTask {
  id: string;
  title: string;
  description: string;
  assignedToName: string;
  assignedToId: string;
  leadId?: string;
  leadName?: string;
  dueDate: string;
  priority: string;
  status: string;
}

export interface MockInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: string;
  type: 'Vendor' | 'LawFirm';
  clientName: string;
  clientId: string;
}

export interface MockLog {
  id: string;
  leadId?: string;
  userName: string;
  action: string;
  details: string;
  createdAt: string;
}

// ----------------------------------------------------
// DEFAULT SEED DATA
// ----------------------------------------------------

export const DEFAULT_USERS: MockUser[] = [
  {
    id: 'usr-1',
    email: 'admin@masscore.com',
    username: 'superadmin',
    name: 'Sarah Jenkins (Admin)',
    role: 'Admin',
    roleName: 'Admin',
    permissions: ['manage:settings', 'manage:users', 'manage:vendors', 'manage:lawfirms', 'manage:campaigns', 'create:leads', 'read:leads', 'update:leads', 'delete:leads', 'assign:leads', 'create:cases', 'read:cases', 'update:cases', 'delete:cases', 'read:reports']
  },
  {
    id: 'usr-3',
    email: 'user@premierleads.com',
    username: 'vendoruser',
    name: 'Alex Rivera (Vendor)',
    role: 'Vendor',
    roleName: 'Vendor',
    vendorId: 'ven-1',
    permissions: ['create:leads', 'read:leads']
  }
];

export const DEFAULT_VENDORS: MockVendor[] = [
  {
    id: 'ven-1',
    name: 'Premier Leads LLC',
    email: 'info@premierleads.com',
    phone: '800-555-0199',
    status: 'ACTIVE',
    address: '1200 Brickell Ave, Suite 800, Miami, FL 33131',
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    stats: { totalLeads: 185, qualifiedLeads: 120, rejectedLeads: 45, revenue: 15000, pendingPayments: 7200 }
  },
  {
    id: 'ven-2',
    name: 'Apex Intake Gen',
    email: 'contact@apexintake.com',
    phone: '800-555-0211',
    status: 'ACTIVE',
    address: '500 5th Ave, 24th Floor, New York, NY 10110',
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    stats: { totalLeads: 95, qualifiedLeads: 55, rejectedLeads: 25, revenue: 8500, pendingPayments: 2400 }
  }
];

export const DEFAULT_LAW_FIRMS: MockLawFirm[] = [
  {
    id: 'firm-1',
    name: 'Morgan & Morgan Partners',
    email: 'intake@morganlaw.com',
    phone: '800-444-9999',
    status: 'ACTIVE',
    stats: { assignedLeads: 74, casesCount: 48, activeCasesCount: 42, revenue: 480000, payments: 310000 }
  },
  {
    id: 'firm-2',
    name: 'Sokolove & Associates',
    email: 'cases@sokolovelaw.com',
    phone: '800-333-1111',
    status: 'ACTIVE',
    stats: { assignedLeads: 32, casesCount: 20, activeCasesCount: 18, revenue: 210000, payments: 145000 }
  }
];

export const DEFAULT_CAMPAIGNS: MockCampaign[] = [
  {
    id: 'camp-1',
    name: 'Camp Lejeune Water Contamination Ads',
    description: 'Targeted search and social campaigns for toxic water exposure victims at Marine Corps Base Camp Lejeune.',
    tortName: 'Camp Lejeune Water Contamination',
    budget: 25000,
    roi: 3.8,
    revenue: 120000,
    leadCount: 150,
    conversionRate: 64,
    status: 'ACTIVE',
    vendorId: 'ven-1',
    vendorName: 'Premier Leads LLC'
  },
  {
    id: 'camp-2',
    name: 'Roundup Non-Hodgkin Lymphoma PPC',
    description: 'High-intent search advertising focusing on agricultural workers exposed to glyphosate weed killer.',
    tortName: 'Roundup Weed Killer',
    budget: 18000,
    roi: 2.9,
    revenue: 72000,
    leadCount: 95,
    conversionRate: 54,
    status: 'ACTIVE',
    vendorId: 'ven-1',
    vendorName: 'Premier Leads LLC'
  },
  {
    id: 'camp-3',
    name: 'PFAS Chemical Water Social Push',
    description: 'Facebook and Instagram video campaign targeting communities with documented municipal PFAS water contamination.',
    tortName: 'PFAS Toxic Chemicals',
    budget: 30000,
    roi: 3.2,
    revenue: 115000,
    leadCount: 135,
    conversionRate: 58,
    status: 'ACTIVE',
    vendorId: 'ven-1',
    vendorName: 'Premier Leads LLC'
  },
  {
    id: 'camp-4',
    name: 'NEC Infant Formula Medical Search',
    description: 'Paid search campaign directed at parents of premature infants given bovine milk-based formula.',
    tortName: 'NEC Baby Formula',
    budget: 22000,
    roi: 3.5,
    revenue: 88000,
    leadCount: 78,
    conversionRate: 62,
    status: 'ACTIVE',
    vendorId: 'ven-1',
    vendorName: 'Premier Leads LLC'
  },
  {
    id: 'camp-5',
    name: 'Chemical Hair Straightener Cancer Ads',
    description: 'Digital display & social media outreach targeting long-term users of chemical relaxers diagnosed with uterine cancer.',
    tortName: 'Hair Straightener Cancer',
    budget: 20000,
    roi: 3.1,
    revenue: 82000,
    leadCount: 110,
    conversionRate: 61,
    status: 'ACTIVE',
    vendorId: 'ven-1',
    vendorName: 'Premier Leads LLC'
  },
  {
    id: 'camp-6',
    name: 'Ozempic & Wegovy Gastroparesis Intake',
    description: 'Inbound lead generation for GLP-1 receptor agonist users suffering severe stomach paralysis.',
    tortName: 'Ozempic Stomach Paralysis',
    budget: 35000,
    roi: 4.1,
    revenue: 165000,
    leadCount: 180,
    conversionRate: 69,
    status: 'ACTIVE',
    vendorId: 'ven-1',
    vendorName: 'Premier Leads LLC'
  },
  {
    id: 'camp-7',
    name: 'Paraquat Parkinson\'s Disease PPC',
    description: 'Search campaign targeting licensed commercial herbicide applicators diagnosed with Parkinson\'s disease.',
    tortName: 'Paraquat Herbicide',
    budget: 16000,
    roi: 2.8,
    revenue: 55000,
    leadCount: 64,
    conversionRate: 50,
    status: 'ACTIVE',
    vendorId: 'ven-1',
    vendorName: 'Premier Leads LLC'
  },
  {
    id: 'camp-8',
    name: 'Tylenol Prenatal Autism Outreach',
    description: 'Social awareness campaign focusing on mothers who took acetaminophen during pregnancy resulting in ASD/ADHD.',
    tortName: 'Tylenol Autism Claim',
    budget: 14000,
    roi: 2.4,
    revenue: 42000,
    leadCount: 70,
    conversionRate: 46,
    status: 'ACTIVE',
    vendorId: 'ven-1',
    vendorName: 'Premier Leads LLC'
  },
  {
    id: 'camp-9',
    name: 'AFFF Firefighter Foam Exposure',
    description: 'Targeted media campaign for civilian & military firefighters exposed to aqueous film-forming foam.',
    tortName: 'AFFF Firefighting Foam',
    budget: 12000,
    roi: 2.2,
    revenue: 35000,
    leadCount: 45,
    conversionRate: 40,
    status: 'PAUSED',
    vendorId: 'ven-1',
    vendorName: 'Premier Leads LLC'
  },
  {
    id: 'camp-10',
    name: 'Bard Hernia Mesh Revision Claims',
    description: 'Retargeting and native ad campaign for patients requiring surgical hernia mesh removal or revision.',
    tortName: 'Hernia Mesh Complications',
    budget: 10000,
    roi: 1.9,
    revenue: 24000,
    leadCount: 30,
    conversionRate: 35,
    status: 'PAUSED',
    vendorId: 'ven-1',
    vendorName: 'Premier Leads LLC'
  }
];

export const DEFAULT_LEADS: MockLead[] = [
  {
    id: 'ld-1',
    leadId: 'MC-10001',
    firstName: 'David',
    lastName: 'Miller',
    email: 'david.miller@example.com',
    phone: '305-555-1212',
    state: 'FL',
    status: 'SIGNED_RETAINER',
    priority: 'HIGH',
    leadScore: 95,
    aiSummary: 'AI LEAD SUMMARY:\nExposed at Camp Lejeune from 1982-1985. Diagnosed with renal carcinoma (kidney cancer) in 2021. Exposure window matches primary litigation criteria. High probability of claim validation.',
    duplicateDetected: false,
    campaignId: 'camp-1',
    campaignName: 'Camp Lejeune Water Ads',
    tortName: 'Camp Lejeune',
    vendorId: 'ven-1',
    vendorName: 'Premier Leads LLC',
    intakeAgentId: 'usr-2',
    intakeAgentName: 'Jane Intake Agent',
    lawFirmId: 'firm-1',
    lawFirmName: 'Morgan & Morgan Partners',
    sourceName: 'Facebook Ads',
    caseDetails: 'Stationed at Camp Lejeune in MCB from June 1982 to December 1985. Exposed to contaminated drinking water. Diagnosed with kidney cancer in 2021.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ld-2',
    leadId: 'MC-10002',
    firstName: 'Sarah',
    lastName: 'Connor',
    email: 'sarah.connor@example.com',
    phone: '213-555-9876',
    state: 'CA',
    status: 'QUALIFIED',
    priority: 'HIGH',
    leadScore: 88,
    aiSummary: 'AI LEAD SUMMARY:\nExposed to Roundup herbicide on farming lands. Diagnosed with Non-Hodgkin Lymphoma. Qualified based on exposure duration and medical confirmation.',
    duplicateDetected: false,
    campaignId: 'camp-2',
    campaignName: 'Roundup Cancer PPC',
    tortName: 'Roundup',
    vendorId: 'ven-2',
    vendorName: 'Apex Intake Gen',
    intakeAgentId: 'usr-2',
    intakeAgentName: 'Jane Intake Agent',
    sourceName: 'Google Search',
    caseDetails: 'Used Roundup on family ranch for 15 years. Diagnosed with NHL in 2024.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ld-3',
    leadId: 'MC-10003',
    firstName: 'James',
    lastName: 'Smith',
    email: 'james.smith@example.com',
    phone: '770-555-3232',
    state: 'GA',
    status: 'NEW',
    priority: 'MEDIUM',
    leadScore: 50,
    aiSummary: 'AI LEAD SUMMARY:\nLead exhibits water contamination symptoms but lacks active oncologist report/diagnosis documentation. Follow-up intake is recommended.',
    duplicateDetected: false,
    campaignId: 'camp-1',
    campaignName: 'Camp Lejeune Water Ads',
    tortName: 'Camp Lejeune',
    vendorId: 'ven-1',
    vendorName: 'Premier Leads LLC',
    sourceName: 'TV Commercial',
    caseDetails: 'Lived near contaminated base. No official medical diagnosis certificate yet.',
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_CASES: MockCase[] = [
  {
    id: 'cs-1',
    caseNumber: 'CASE-2026-1001',
    leadId: 'ld-1',
    clientName: 'David Miller',
    attorneyName: 'John Morgan Jr.',
    lawFirmId: 'firm-1',
    lawFirmName: 'Morgan & Morgan Partners',
    stageName: 'Discovery Phase',
    settlementAmount: 180000,
    medicalRecordsStatus: 'RECEIVED',
    courtDetails: 'Eastern District of North Carolina, Case #4:26-cv-08321',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const DEFAULT_TASKS: MockTask[] = [
  {
    id: 'tsk-1',
    title: 'Submit medical history forms',
    description: 'Retrieve military record forms and upload.',
    assignedToName: 'Jane Intake Agent',
    assignedToId: 'usr-2',
    leadId: 'ld-1',
    leadName: 'David Miller',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'HIGH',
    status: 'IN_PROGRESS'
  },
  {
    id: 'tsk-2',
    title: 'Call back Sarah Connor',
    description: 'Request signed Retainer contract.',
    assignedToName: 'Jane Intake Agent',
    assignedToId: 'usr-2',
    leadId: 'ld-2',
    leadName: 'Sarah Connor',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'HIGH',
    status: 'PENDING'
  }
];

export const DEFAULT_INVOICES: MockInvoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-1001',
    amount: 4500,
    status: 'PAID',
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: 'Vendor',
    clientName: 'Premier Leads LLC',
    clientId: 'ven-1'
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-1002',
    amount: 7200,
    status: 'UNPAID',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: 'Vendor',
    clientName: 'Premier Leads LLC',
    clientId: 'ven-1'
  }
];

export const DEFAULT_LOGS: MockLog[] = [
  {
    id: 'log-1',
    userName: 'Jane Intake Agent',
    action: 'LEAD_CREATED',
    details: 'David Miller lead recorded via Facebook Ads',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-2',
    userName: 'Jane Intake Agent',
    action: 'LEAD_ASSIGNED',
    details: 'Lead David Miller assigned to Morgan & Morgan Partners',
    createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper to initialize browser memory
export const initializeLocalStorage = () => {
  if (typeof window === 'undefined') return;

  const checkAndSet = (key: string, defaultVal: any) => {
    const existing = localStorage.getItem(key);
    if (!existing || (Array.isArray(defaultVal) && JSON.parse(existing).length < defaultVal.length)) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
    }
  };

  checkAndSet('mc_leads', DEFAULT_LEADS);
  checkAndSet('mc_cases', DEFAULT_CASES);
  checkAndSet('mc_vendors', DEFAULT_VENDORS);
  checkAndSet('mc_lawfirms', DEFAULT_LAW_FIRMS);
  checkAndSet('mc_campaigns', DEFAULT_CAMPAIGNS);
  checkAndSet('mc_tasks', DEFAULT_TASKS);
  checkAndSet('mc_invoices', DEFAULT_INVOICES);
  checkAndSet('mc_logs', DEFAULT_LOGS);
};

export const getFromStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  const item = localStorage.getItem(key);
  if (!item) return fallback;
  try {
    return JSON.parse(item);
  } catch (e) {
    console.error(`Failed to parse localStorage key "${key}":`, e);
    return fallback;
  }
};

export const saveToStorage = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};
