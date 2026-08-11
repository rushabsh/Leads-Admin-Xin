const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, dataRaw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function testFlow() {
  console.log('--- TEST 1: GET Public Form Metadata for Vendor Token ---');
  const metaRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/form/6a5d13c8a31fc3c23211fbd8',
    method: 'GET'
  });
  console.log('Public Form Meta Response Status:', metaRes.status);
  console.log('Vendor Name:', metaRes.data?.vendor?.name);
  console.log('Available Campaigns:', metaRes.data?.campaigns?.length);

  console.log('\n--- TEST 2: POST Public Lead Submission ---');
  const submitRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/public/submit-lead',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    vendorToken: '6a5d13c8a31fc3c23211fbd8',
    submittedByEmployee: 'Employee John (EMP-101)',
    firstName: 'Emily',
    lastName: 'Johnson',
    phoneNumber: '(555) 987-6543',
    email: 'emily.johnson@example.com',
    state: 'TX',
    gender: 'Female',
    type: 'Roblox',
    robloxGamertag: 'EmilyRobloxTX',
    robloxAccountAccess: 'Yes - Full Access',
    incidentType: 'Grooming / Sexual Exploitation',
    diagnosis: 'PTSD (Post-Traumatic Stress Disorder)'
  });

  console.log('Submit Response Status:', submitRes.status);
  console.log('Submit Response Body:', JSON.stringify(submitRes.data, null, 2));

  console.log('\n--- TEST 3: Login to Vendor Portal ---');
  const loginRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    emailOrUsername: 'user@premierleads.com',
    password: 'Password123!'
  });

  console.log('Login Response Status:', loginRes.status);
  console.log('Login Success:', loginRes.data?.success);

  let cookies = loginRes.headers['set-cookie'];
  let cookieHeader = '';
  if (cookies) {
    cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
  }

  console.log('\n--- TEST 4: GET Vendor Leads Table ---');
  const leadsRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/leads',
    method: 'GET',
    headers: {
      'Cookie': cookieHeader
    }
  });

  console.log('Vendor Leads Status:', leadsRes.status);
  console.log('Total Leads Count:', leadsRes.data?.data?.length);

  const foundLead = (leadsRes.data?.data || []).find(
    l => l.firstName === 'Emily' && l.lastName === 'Johnson'
  );

  if (foundLead) {
    console.log('\n✅ SUCCESS: Submitted Lead "Emily Johnson" WAS FOUND in Vendor Portal!');
    console.log('Lead ID:', foundLead.leadId);
    console.log('Vendor ID:', foundLead.vendorId);
    console.log('Case Details Snippet:', foundLead.caseDetails ? foundLead.caseDetails.slice(0, 300) : 'N/A');
  } else {
    console.log('\n⚠️ Lead not found in GET /api/leads list.');
  }
}

testFlow().catch(console.error);
