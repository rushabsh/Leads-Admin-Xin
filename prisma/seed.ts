import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding database...');

  // =========================================================
  // 1. CREATE PERMISSIONS
  // =========================================================

  const permissionsList = [
    {
      name: 'manage:settings',
      description: 'Modify CRM settings, SMTP, and custom torts',
    },
    {
      name: 'manage:users',
      description: 'Create and edit users and permissions',
    },
    {
      name: 'manage:vendors',
      description: 'Add and edit lead generator vendors',
    },
    {
      name: 'manage:lawfirms',
      description: 'Add and edit law firms and attorneys',
    },
    {
      name: 'manage:campaigns',
      description: 'Create and modify marketing campaigns',
    },
    {
      name: 'create:leads',
      description: 'Add new leads to the CRM',
    },
    {
      name: 'read:leads',
      description: 'View lead information',
    },
    {
      name: 'update:leads',
      description: 'Modify lead details',
    },
    {
      name: 'delete:leads',
      description: 'Remove leads from system',
    },
    {
      name: 'assign:leads',
      description: 'Assign leads to intake agents and law firms',
    },
    {
      name: 'create:cases',
      description: 'Convert qualified leads to active cases',
    },
    {
      name: 'read:cases',
      description: 'View litigation cases details',
    },
    {
      name: 'update:cases',
      description: 'Modify active litigation cases',
    },
    {
      name: 'delete:cases',
      description: 'Remove cases',
    },
    {
      name: 'read:reports',
      description: 'View analytics, ROI and financial data',
    },
  ];

  console.log('Seeding Permissions...');

  const permissions: any[] = [];

  for (const perm of permissionsList) {
    const permission = await prisma.permission.upsert({
      where: {
        name: perm.name,
      },

      update: {
        description: perm.description,
      },

      create: perm,
    });

    permissions.push(permission);
  }

  // Helper function for permission IDs
  const permMap = (names: string[]) => {
    return permissions
      .filter((permission) => names.includes(permission.name))
      .map((permission) => permission.id);
  };

  // =========================================================
  // 2. CREATE ROLES
  // =========================================================

  const rolesList = [
    {
      name: 'Admin',
      description: 'Full system authorization',
      permNames: permissionsList.map((permission) => permission.name),
    },

    {
      name: 'Vendor',
      description: 'Lead generation agency access',
      permNames: ['create:leads', 'read:leads', 'read:campaigns'],
    },
  ];

  console.log('Seeding Roles...');

  const roles: Record<string, any> = {};

  for (const roleDef of rolesList) {
    const role = await prisma.role.upsert({
      where: {
        name: roleDef.name,
      },

      update: {
        description: roleDef.description,
        permissionIds: permMap(roleDef.permNames),
      },

      create: {
        name: roleDef.name,
        description: roleDef.description,
        permissionIds: permMap(roleDef.permNames),
      },
    });

    roles[roleDef.name] = role;
  }

  // =========================================================
  // 3. CREATE MASS TORT TYPES
  // =========================================================

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
    'Ride Share Assault',
  ];

  console.log('Seeding Mass Torts...');

  const massTorts: any[] = [];

  for (const tortName of builtInMassTorts) {
    const tort = await prisma.massTort.upsert({
      where: {
        name: tortName,
      },

      update: {},

      create: {
        name: tortName,
        description: `Built-in lawsuit litigation regarding ${tortName}.`,
      },
    });

    massTorts.push(tort);
  }

  // =========================================================
  // 4. CREATE LEAD SOURCES
  // =========================================================

  console.log('Seeding Lead Sources...');

  const sourcesList = [
    'Facebook Ads',
    'Google Search',
    'TV Commercial',
    'Call Center',
    'Affiliate Network',
  ];

  const sources: any[] = [];

  for (const name of sourcesList) {
    const source = await prisma.leadSource.upsert({
      where: {
        name,
      },

      update: {},

      create: {
        name,
      },
    });

    sources.push(source);
  }

  // =========================================================
  // 5. CREATE CASE STAGES
  // =========================================================

  console.log('Seeding Case Stages...');

  const stagesList = [
    'Investigation',
    'Medical Records Review',
    'Retainer Signed',
    'Discovery Phase',
    'Settlement Negotiation',
    'Settlement Payout',
    'Closed',
  ];

  const caseStages: any[] = [];

  for (const name of stagesList) {
    const stage = await prisma.caseStage.upsert({
      where: {
        name,
      },

      update: {},

      create: {
        name,
      },
    });

    caseStages.push(stage);
  }

  // =========================================================
  // 6. CREATE VENDOR
  // =========================================================

  console.log('Seeding Vendor...');

  const vendor = await prisma.vendor.upsert({
    where: {
      email: 'vendor@premierleads.com',
    },

    update: {
      name: 'Premier Leads LLC',
      phone: '8005550199',
      address: '100 Lead Ave, Miami, FL',
    },

    create: {
      name: 'Premier Leads LLC',
      email: 'vendor@premierleads.com',
      phone: '8005550199',
      address: '100 Lead Ave, Miami, FL',
    },
  });

  // =========================================================
  // 7. CREATE LAW FIRM
  // =========================================================

  console.log('Seeding Law Firm...');

  const lawFirm = await prisma.lawFirm.upsert({
    where: {
      email: 'morgan@morganlaw.com',
    },

    update: {
      name: 'Morgan & Morgan Partners',
      phone: '8004449999',
      address: '200 Legal Plaza, New York, NY',
    },

    create: {
      name: 'Morgan & Morgan Partners',
      email: 'morgan@morganlaw.com',
      phone: '8004449999',
      address: '200 Legal Plaza, New York, NY',
    },
  });

  // =========================================================
  // 8. CREATE ATTORNEY
  // =========================================================

  console.log('Seeding Attorney...');

  const attorney = await prisma.attorney.upsert({
    where: {
      email: 'john.morgan@morganlaw.com',
    },

    update: {
      name: 'John Morgan Jr.',
      phone: '8004449991',
      lawFirmId: lawFirm.id,
    },

    create: {
      name: 'John Morgan Jr.',
      email: 'john.morgan@morganlaw.com',
      phone: '8004449991',
      lawFirmId: lawFirm.id,
    },
  });

  // =========================================================
  // 9. HASH PASSWORD
  // =========================================================

  console.log('Generating secure password hash...');

  const plainPassword = 'Password123!';

  const passwordHash = await bcrypt.hash(
    plainPassword,
    10
  );

  // =========================================================
  // 10. CREATE ADMIN USER
  // =========================================================

  console.log('Seeding Admin User...');

  const superAdmin = await prisma.user.upsert({
    where: {
      email: 'admin@masscore.com',
    },

    update: {
      username: 'superadmin',
      name: 'MassCore Administrator',
      passwordHash,
      roleId: roles['Admin'].id,
    },

    create: {
      email: 'admin@masscore.com',
      username: 'superadmin',
      name: 'MassCore Administrator',
      passwordHash,
      roleId: roles['Admin'].id,
    },
  });

  // =========================================================
  // 11. CREATE VENDOR USER
  // =========================================================

  console.log('Seeding Vendor User...');

  const vendorUser = await prisma.user.upsert({
    where: {
      email: 'user@premierleads.com',
    },

    update: {
      username: 'vendoruser',
      name: 'Alex Vendor Manager',
      passwordHash,
      vendorId: vendor.id,
      roleId: roles['Vendor'].id,
    },

    create: {
      email: 'user@premierleads.com',
      username: 'vendoruser',
      name: 'Alex Vendor Manager',
      passwordHash,
      vendorId: vendor.id,
      roleId: roles['Vendor'].id,
    },
  });

  // Avoid unused variable warning
  console.log(`Vendor user ready: ${vendorUser.email}`);

  // =========================================================
  // 12. CREATE CAMPAIGNS
  // =========================================================

  console.log('Seeding Campaigns...');

  // Campaign doesn't appear to have a unique "name" field in
  // the original schema usage, so check before creating.

  let campaign1 = await prisma.campaign.findFirst({
    where: {
      name: 'Camp Lejeune Clean Water Initiative',
    },
  });

  if (!campaign1) {
    campaign1 = await prisma.campaign.create({
      data: {
        name: 'Camp Lejeune Clean Water Initiative',

        description:
          'Facebook Lead Gen targeting military personnel exposed in North Carolina.',

        budget: 25000.0,

        massTortId:
          massTorts.find(
            (tort) => tort.name === 'Camp Lejeune'
          )!.id,

        vendorId: vendor.id,

        status: 'ACTIVE',
      },
    });
  }

  let campaign2 = await prisma.campaign.findFirst({
    where: {
      name: 'Roundup Cancer Recall Outreach',
    },
  });

  if (!campaign2) {
    campaign2 = await prisma.campaign.create({
      data: {
        name: 'Roundup Cancer Recall Outreach',

        description:
          'Google PPC campaign for agricultural workers diagnosed with NHL.',

        budget: 15000.0,

        massTortId:
          massTorts.find(
            (tort) => tort.name === 'Roundup'
          )!.id,

        vendorId: vendor.id,

        status: 'ACTIVE',
      },
    });
  }

  // =========================================================
  // 13. CREATE LEAD 1
  // =========================================================

  console.log('Seeding Leads...');

  const lead1 = await prisma.lead.upsert({
    where: {
      leadId: 'MC-10001',
    },

    update: {},

    create: {
      leadId: 'MC-10001',

      firstName: 'David',

      lastName: 'Miller',

      email: 'david.miller@example.com',

      phone: '3055551212',

      state: 'FL',

      status: 'SIGNED_RETAINER',

      priority: 'HIGH',

      leadScore: 95,

      aiSummary:
        'AI LEAD PROFILE ANALYSIS:\nDavid Miller exposed at Camp Lejeune from 1982-1985. Diagnosed with renal carcinoma. Retainer signed, law firm assigned.',

      campaignId: campaign1.id,

      vendorId: vendor.id,

      lawFirmId: lawFirm.id,

      intakeAgentId: superAdmin.id,

      sourceId:
        sources.find(
          (source) => source.name === 'Facebook Ads'
        )!.id,

      caseDetails:
        'Stationed at Camp Lejeune from June 1982 to December 1985. Experienced water contamination, diagnosed with kidney cancer in 2021.',
    },
  });

  // =========================================================
  // 14. CREATE LEAD 2
  // =========================================================

  const lead2 = await prisma.lead.upsert({
    where: {
      leadId: 'MC-10002',
    },

    update: {},

    create: {
      leadId: 'MC-10002',

      firstName: 'Sarah',

      lastName: 'Connor',

      email: 'sarah.connor@example.com',

      phone: '2135559876',

      state: 'CA',

      status: 'QUALIFIED',

      priority: 'MEDIUM',

      leadScore: 82,

      aiSummary:
        'AI LEAD PROFILE ANALYSIS:\nSarah Connor exposed to Roundup herbicide on farming lands. Diagnosed with Non-Hodgkin Lymphoma. Qualified, law firm assignment pending.',

      campaignId: campaign2.id,

      vendorId: vendor.id,

      intakeAgentId: superAdmin.id,

      sourceId:
        sources.find(
          (source) => source.name === 'Google Search'
        )!.id,

      caseDetails:
        'Used Roundup on family ranch for 15 years. Diagnosed with lymphoma in 2024.',
    },
  });

  // =========================================================
  // 15. CREATE LEAD 3
  // =========================================================

  await prisma.lead.upsert({
    where: {
      leadId: 'MC-10003',
    },

    update: {},

    create: {
      leadId: 'MC-10003',

      firstName: 'James',

      lastName: 'Smith',

      email: 'james.smith@example.com',

      phone: '7705553232',

      state: 'GA',

      status: 'NEW',

      priority: 'LOW',

      leadScore: 60,

      aiSummary:
        'AI LEAD PROFILE ANALYSIS:\nJames Smith contacted water contamination intake. Evaluation ongoing.',

      campaignId: campaign1.id,

      vendorId: vendor.id,

      sourceId:
        sources.find(
          (source) => source.name === 'TV Commercial'
        )!.id,

      caseDetails:
        'Lived near contaminated base. No official medical diagnosis certificate yet.',
    },
  });

  // =========================================================
  // 16. CREATE CASE
  // =========================================================

  console.log('Seeding Cases...');

  const existingCase = await prisma.case.findFirst({
    where: {
      caseNumber: 'CASE-2026-1001',
    },
  });

  if (!existingCase) {
    await prisma.case.create({
      data: {
        caseNumber: 'CASE-2026-1001',

        leadId: lead1.id,

        attorneyId: attorney.id,

        lawFirmId: lawFirm.id,

        stageId:
          caseStages.find(
            (stage) => stage.name === 'Discovery Phase'
          )!.id,

        settlementAmount: 180000.0,

        medicalRecordsStatus: 'RECEIVED',

        courtDetails:
          'Eastern District of North Carolina, Case #4:26-cv-08321',
      },
    });
  }

  // =========================================================
  // 17. CREATE TASKS
  // =========================================================

  console.log('Seeding Tasks...');

  const existingTask1 = await prisma.task.findFirst({
    where: {
      title: 'Submit medical history forms',
      leadId: lead1.id,
    },
  });

  if (!existingTask1) {
    await prisma.task.create({
      data: {
        title: 'Submit medical history forms',

        description:
          'Retrieve military record forms and upload.',

        priority: 'HIGH',

        status: 'IN_PROGRESS',

        leadId: lead1.id,

        assignedToId: superAdmin.id,

        dueDate: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000
        ),
      },
    });
  }

  const existingTask2 = await prisma.task.findFirst({
    where: {
      title: 'Call back Sarah Connor',
      leadId: lead2.id,
    },
  });

  if (!existingTask2) {
    await prisma.task.create({
      data: {
        title: 'Call back Sarah Connor',

        description:
          'Request signed Retainer contract.',

        priority: 'HIGH',

        status: 'PENDING',

        leadId: lead2.id,

        assignedToId: superAdmin.id,

        dueDate: new Date(
          Date.now() + 1 * 24 * 60 * 60 * 1000
        ),
      },
    });
  }

  // =========================================================
  // 18. CREATE INVOICES
  // =========================================================

  console.log('Seeding Invoices...');

  await prisma.invoice.upsert({
    where: {
      invoiceNumber: 'INV-2026-1001',
    },

    update: {},

    create: {
      invoiceNumber: 'INV-2026-1001',

      amount: 4500.0,

      status: 'PAID',

      dueDate: new Date(
        Date.now() - 5 * 24 * 60 * 60 * 1000
      ),

      vendorId: vendor.id,
    },
  });

  await prisma.invoice.upsert({
    where: {
      invoiceNumber: 'INV-2026-1002',
    },

    update: {},

    create: {
      invoiceNumber: 'INV-2026-1002',

      amount: 7200.0,

      status: 'UNPAID',

      dueDate: new Date(
        Date.now() + 10 * 24 * 60 * 60 * 1000
      ),

      vendorId: vendor.id,
    },
  });

  // =========================================================
  // COMPLETED
  // =========================================================

  console.log('');
  console.log('==========================================');
  console.log('Seeding completed successfully!');
  console.log('==========================================');

  console.log('');
  console.log('ADMIN LOGIN');
  console.log('Email: admin@masscore.com');
  console.log('Password: Password123!');

  console.log('');
  console.log('VENDOR LOGIN');
  console.log('Email: user@premierleads.com');
  console.log('Password: Password123!');

  console.log('');
}

// =========================================================
// RUN SEED
// =========================================================

main()
  .catch((error) => {
    console.error('');
    console.error('Seeding failed:');
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });