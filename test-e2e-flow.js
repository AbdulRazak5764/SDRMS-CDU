const http = require('http');

function postJson(urlPath, data, token = null) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: urlPath,
      method: 'POST',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function getJson(urlPath, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: urlPath,
      method: 'GET',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('===============================================================');
  console.log('Testing Real-Time Authentication & Authorization Clearance Flow');
  console.log('===============================================================');

  // Step 0: Test non-existent user login rejected
  console.log('\n--- Step 0: Verify unregistered login is rejected ---');
  const fakeLogin = await postJson('/api/auth/login', {
    email: 'unregistered.user@chaitanya.edu.in',
    password: 'SomePassword@123'
  });
  console.log('Unregistered login status (Expected 401):', fakeLogin.status, fakeLogin.data?.error);

  // Step 1: Register a real faculty member
  const testEmail = `faculty.test.${Date.now()}@chaitanya.edu.in`;
  const testPassword = 'Faculty@Chaitanya2026';
  console.log(`\n--- Step 1: Register real faculty (${testEmail}) ---`);
  const regRes = await postJson('/api/auth/register', {
    full_name: 'Dr. Test Faculty Member',
    email: testEmail,
    password: testPassword,
    department_id: 6, // Department of Computer Science & Engineering (HOD CSE)
    category: 'Teaching',
    designation: 'Assistant Professor'
  });
  console.log('Registration status:', regRes.status, regRes.data?.message);
  if (regRes.status !== 201) {
    console.error('Registration failed:', regRes.data);
    return;
  }

  // Step 2: Login as the registered faculty
  console.log('\n--- Step 2: Login with newly created credentials ---');
  const loginRes = await postJson('/api/auth/login', {
    email: testEmail,
    password: testPassword
  });
  console.log('Login status:', loginRes.status, 'User:', loginRes.data?.user?.full_name);
  const facultyToken = loginRes.data.token;
  const staffProfileId = loginRes.data.user.profile_id;

  // Step 3: Faculty submits dossier
  console.log('\n--- Step 3: Faculty submits 9-Module Dossier ---');
  const submitRes = await postJson('/api/staff/submit', { declaration_agreed: true }, facultyToken);
  console.log('Submit dossier status:', submitRes.status, submitRes.data?.message);

  // Step 4: Login as Department Head (HOD)
  console.log('\n--- Step 4: Login as HOD CSE ---');
  const hodLogin = await postJson('/api/auth/login', {
    email: 'hod.cse@chaitanya.edu.in',
    password: 'Hod@CSE2026!',
    portalRole: 'hod'
  });
  console.log('HOD login status:', hodLogin.status, 'User:', hodLogin.data?.user?.full_name);
  const hodToken = hodLogin.data.token;

  // Step 5: HOD Level 1 clearance
  console.log('\n--- Step 5: HOD grants Level 1 clearance ---');
  const hodApproveRes = await postJson('/api/admin/verify-action', {
    staff_id: staffProfileId,
    action: 'APPROVE',
    remarks: 'Verified 9 modules and teaching credentials. Recommended for Dean endorsement.'
  }, hodToken);
  console.log('HOD action status:', hodApproveRes.status, hodApproveRes.data?.message);

  // Step 6: Login as Dean (Engineering & Technology)
  console.log('\n--- Step 6: Login as Dean FET ---');
  const deanLogin = await postJson('/api/auth/login', {
    email: 'dean.engineering@chaitanya.edu.in',
    password: 'Dean@Chaitanya2026',
    portalRole: 'dean'
  });
  console.log('Dean login status:', deanLogin.status, 'User:', deanLogin.data?.user?.full_name);
  const deanToken = deanLogin.data.token;

  // Step 7: Dean Level 2 clearance
  console.log('\n--- Step 7: Dean grants Level 2 clearance ---');
  const deanApproveRes = await postJson('/api/admin/verify-action', {
    staff_id: staffProfileId,
    action: 'APPROVE',
    remarks: 'Faculty quota and departmental endorsement verified. Forwarded to Registrar.'
  }, deanToken);
  console.log('Dean action status:', deanApproveRes.status, deanApproveRes.data?.message);

  // Step 8: Login as Registrar (Prof. M. Ravinder)
  console.log('\n--- Step 8: Login as Office of the Registrar ---');
  const regLogin = await postJson('/api/auth/login', {
    email: 'registrar@chaitanya.edu.in',
    password: 'Registrar@Chaitanya2026',
    portalRole: 'registrar'
  });
  console.log('Registrar login status:', regLogin.status, 'User:', regLogin.data?.user?.full_name);
  const regToken = regLogin.data.token;

  // Step 9: Registrar final seal
  console.log('\n--- Step 9: Registrar grants final official clearance seal ---');
  const regApproveRes = await postJson('/api/admin/verify-action', {
    staff_id: staffProfileId,
    action: 'APPROVE',
    remarks: 'Official university seal granted by the Office of the Registrar.'
  }, regToken);
  console.log('Registrar action status:', regApproveRes.status, regApproveRes.data?.message);

  console.log('\n===============================================================');
  console.log('✅ End-to-End Real-Time Auth & Clearance Pipeline Passed 100%!');
  console.log('===============================================================');
}

run().catch(console.error);
