import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding database...');

  // 1. Create Permissions
  const permissionsList = [
    { name: 'manage:settings', description: 'Modify CRM settings, SMTP, and custom torts' },
    { name: 'manage:users', description: 'Create and edit users and permissions' },
    { name: 'manage:vendors', description: 'Add and edit lead generator vendors' },
    { name: 'manage:lawfirms', description: 'Add and edit law firms and attorneys' },
    { name: 'manage:campaigns', description: 'Create and modify marketing campaigns' },
    { name: 'create:leads', description: 'Add new leads to the CRM' },
    { name: 'read:leads', description: 'View lead information' },
    { name: 'update:leads', description: 'Modify lead details' },
    { name: 'delete:leads', description: 'Remove leads from system' },
    { name: 'assign:leads', description: 'Assign leads to intake agents and law firms' },
    { name: 'create:cases', description: 'Convert qualified leads to active cases' },
    { name: 'read:cases', description: 'View litigation cases details' },
    { name: 'update:cases', description: 'Modify active litigation cases' },
    { name: 'delete:cases', description: 'Remove cases' },
    { name: 'read:reports', description: 'View analytics, ROI and financial data' }
  ];

  console.log('Seeding Permissions...');
  const permissions: any[] = [];
  for (const perm of permissionsList) {
    const p = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm
    });
    permissions.push(p);
  }

  // Helper map to find permission ids
  const permMap = (names: string[]) => {
    return permissions.filter(p => names.includes(p.name)).map(p => p.id);
  };

  // 2. Create Roles
  const rolesList = [
    {
      name: 'Admin',
      description: 'Full system authorization',
      permNames: permissionsList.map(p => p.name)
    },
    {
      name: 'Vendor',
      description: 'Lead generation agency access',
      permNames: ['create:leads', 'read:leads'] // restricted views
    }
  ];

  console.log('Seeding Roles...');
  const roles: any = {};
  for (const roleDef of rolesList) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: {
        permissionIds: permMap(roleDef.permNames)
      },
      create: {
        name: roleDef.name,
        description: roleDef.description,
        permissionIds: permMap(roleDef.permNames)
      }
    });
    roles[roleDef.name] = role;
  }

  // 3. Built-In Mass Tort Types
  const builtInMassTorts = [
    'Camp Lejeune',
    'Hair Relaxer',
    'Paraquat',
    'Roundup',
    'AFFF',
    'Depo-Provera',
    'NEC',
    'Talcum Powder',
    'Ozempic',
    'Social Media Harm',
    'Exactech',
    'Hernia Mesh',
    'Bard PowerPort',
    'Elmiron',
    'Mesothelioma',
    'Ride Share Assault'
  ];

  console.log('Seeding Mass Torts...');
  const massTorts = [];
  for (const tortName of builtInMassTorts) {
    const tort = await prisma.massTort.upsert({
      where: { name: tortName },
      update: {},
      create: {
        name: tortName,
        description: `Built-in lawsuit litigation regarding ${tortName}.`
      }
    });
    massTorts.push(tort);
  }

  // 4. Seeding Lead Sources
  console.log('Seeding Lead Sources...');
  const sourcesList = ['Facebook Ads', 'Google Search', 'TV Commercial', 'Call Center', 'Affiliate Network'];
  const sources = [];
  for (const name of sourcesList) {
    const src = await prisma.leadSource.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    sources.push(src);
  }

  // 5. Seeding Case Stages
  console.log('Seeding Case Stages...');
  const stagesList = [
    'Investigation',
    'Medical Records Review',
    'Retainer Signed',
    'Discovery Phase',
    'Settlement Negotiation',
    'Settlement Payout',
    'Closed'
  ];
  const caseStages = [];
  for (const name of stagesList) {
    const stage = await prisma.caseStage.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    caseStages.push(stage);
  }

  // 6. Create Vendor, Law Firm and Users
  console.log('Seeding Vendor & Law Firm...');
  const vendor = await prisma.vendor.create({
    data: {
      name: 'Premier Leads LLC',
      email: 'vendor@premierleads.com',
      phone: '8005550199',
      address: '100 Lead Ave, Miami, FL'
    }
  });

  const lawFirm = await prisma.lawFirm.create({
    data: {
      name: 'Morgan & Morgan Partners',
      email: 'morgan@morganlaw.com',
      phone: '8004449999',
      address: '200 Legal Plaza, New York, NY'
    }
  });

  const attorney = await prisma.attorney.create({
    data: {
      name: 'John Morgan Jr.',
      email: 'john.morgan@morganlaw.com',
      phone: '8004449991',
      lawFirmId: lawFirm.id
    }
  });

  // Hashing pass
  const passwordHash = 'mock_password_hash';

  console.log('Seeding Enterprise Users...');

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@masscore.com',
      username: 'superadmin',
      name: 'MassCore Administrator',
      passwordHash,
      roleId: roles['Admin'].id
    }
  });

  const vendorUser = await prisma.user.create({
    data: {
      email: 'user@premierleads.com',
      username: 'vendoruser',
      name: 'Alex Vendor Manager',
      passwordHash,
      vendorId: vendor.id,
      roleId: roles['Vendor'].id
    }
  });

  // 7. Campaigns Seeding
  console.log('Seeding Campaigns...');
  const campaign1 = await prisma.campaign.create({
    data: {
      name: 'Camp Lejeune Clean Water Initiative',
      description: 'Facebook Lead Gen targeting military personnel exposed in North Carolina.',
      budget: 25000.0,
      massTortId: massTorts.find(t => t.name === 'Camp Lejeune')!.id,
      vendorId: vendor.id,
      status: 'ACTIVE'
    }
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      name: 'Roundup Cancer Recall Outreach',
      description: 'Google PPC campaign for agricultural workers diagnosed with NHL.',
      budget: 15000.0,
      massTortId: massTorts.find(t => t.name === 'Roundup')!.id,
      vendorId: vendor.id,
      status: 'ACTIVE'
    }
  });

  // 8. Seeding Leads and Cases
  console.log('Seeding Leads...');
  const lead1 = await prisma.lead.create({
    data: {
      leadId: 'MC-10001',
      firstName: 'David',
      lastName: 'Miller',
      email: 'david.miller@example.com',
      phone: '3055551212',
      state: 'FL',
      status: 'SIGNED_RETAINER',
      priority: 'HIGH',
      leadScore: 95,
      aiSummary: 'AI LEAD PROFILE ANALYSIS:\nDavid Miller exposed at Camp Lejeune from 1982-1985. Diagnosed with renal carcinoma. Retainer signed, law firm assigned.',
      campaignId: campaign1.id,
      vendorId: vendor.id,
      lawFirmId: lawFirm.id,
      intakeAgentId: superAdmin.id,
      sourceId: sources.find(s => s.name === 'Facebook Ads')!.id,
      caseDetails: 'Stationed at Camp Lejeune from June 1982 to December 1985. Experienced water contamination, diagnosed with kidney cancer in 2021.'
    }
  });

  const lead2 = await prisma.lead.create({
    data: {
      leadId: 'MC-10002',
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'sarah.connor@example.com',
      phone: '2135559876',
      state: 'CA',
      status: 'QUALIFIED',
      priority: 'MEDIUM',
      leadScore: 82,
      aiSummary: 'AI LEAD PROFILE ANALYSIS:\nSarah Connor exposed to Roundup herbicide on farming lands. Diagnosed with Non-Hodgkin Lymphoma. Qualified, law firm assignment pending.',
      campaignId: campaign2.id,
      vendorId: vendor.id,
      intakeAgentId: superAdmin.id,
      sourceId: sources.find(s => s.name === 'Google Search')!.id,
      caseDetails: 'Used Roundup on family ranch for 15 years. Diagnosed with lymphoma in 2024.'
    }
  });

  const lead3 = await prisma.lead.create({
    data: {
      leadId: 'MC-10003',
      firstName: 'James',
      lastName: 'Smith',
      email: 'james.smith@example.com',
      phone: '7705553232',
      state: 'GA',
      status: 'NEW',
      priority: 'LOW',
      leadScore: 60,
      aiSummary: 'AI LEAD PROFILE ANALYSIS:\nJames Smith contacted water contamination intake. Evaluation ongoing.',
      campaignId: campaign1.id,
      vendorId: vendor.id,
      sourceId: sources.find(s => s.name === 'TV Commercial')!.id,
      caseDetails: 'Lived near contaminated base. No official medical diagnosis certificate yet.'
    }
  });

  console.log('Seeding Cases...');
  const case1 = await prisma.case.create({
    data: {
      caseNumber: 'CASE-2026-1001',
      leadId: lead1.id,
      attorneyId: attorney.id,
      lawFirmId: lawFirm.id,
      stageId: caseStages.find(s => s.name === 'Discovery Phase')!.id,
      settlementAmount: 180000.0,
      medicalRecordsStatus: 'RECEIVED',
      courtDetails: 'Eastern District of North Carolina, Case #4:26-cv-08321'
    }
  });

  console.log('Seeding Tasks...');
  await prisma.task.create({
    data: {
      title: 'Submit medical history forms',
      description: 'Retrieve military record forms and upload.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      leadId: lead1.id,
      assignedToId: superAdmin.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.task.create({
    data: {
      title: 'Call back Sarah Connor',
      description: 'Request signed Retainer contract.',
      priority: 'HIGH',
      status: 'PENDING',
      leadId: lead2.id,
      assignedToId: superAdmin.id,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    }
  });

  console.log('Seeding Invoices...');
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-1001',
      amount: 4500.0,
      status: 'PAID',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      vendorId: vendor.id,
    }
  });

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-1002',
      amount: 7200.0,
      status: 'UNPAID',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      vendorId: vendor.id,
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
