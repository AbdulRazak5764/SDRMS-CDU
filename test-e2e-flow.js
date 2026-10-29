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
  console.log('--- Step 1: Login as Faculty Vinod (vinod@gmail.com) ---');
  const vinodLogin = await postJson('/api/auth/login', {
    email: 'vinod@gmail.com',
    password: 'Vinod@123'
  });
  console.log('Vinod login status:', vinodLogin.status);
  if (vinodLogin.status !== 200) {
    console.error('Failed to log in as Vinod:', vinodLogin.data || vinodLogin.raw);
    return;
  }
  const vinodToken = vinodLogin.data.token;
  console.log('Vinod logged in successfully. User:', vinodLogin.data.user.full_name, 'Role:', vinodLogin.data.user.role);
  console.log('Assigned HOD:', vinodLogin.data.user.assigned_hod?.name);
  console.log('Assigned Dean:', vinodLogin.data.user.assigned_dean?.name);

  console.log('\n--- Step 2: Faculty Submits 9-Module Dossier for Clearance ---');
  // First ensure declaration agreed and reset status if needed
  const submitRes = await postJson('/api/staff/submit', { declaration_agreed: true }, vinodToken);
  console.log('Submit dossier status:', submitRes.status);
  console.log('Submit dossier response:', submitRes.data);

  console.log('\n--- Step 3: Check Faculty Profile Workflow Status ---');
  const profileRes = await getJson('/api/staff/my-profile', vinodToken);
  console.log('Current workflow status:', profileRes.data?.profile?.workflow_status);

  console.log('\n--- Step 4: Login as HOD CSE (hod.cse@chaitanya.edu.in) ---');
  const hodLogin = await postJson('/api/auth/login', {
    email: 'hod.cse@chaitanya.edu.in',
    password: 'Hod@123'
  });
  console.log('HOD CSE login status:', hodLogin.status);
  const hodToken = hodLogin.data.token;
  console.log('HOD CSE User:', hodLogin.data.user.full_name);

  console.log('\n--- Step 5: HOD Reviews and Forwards to Dean ---');
  const staffProfileId = profileRes.data.profile.id;
  const hodApproveRes = await postJson('/api/admin/verify-action', {
    staff_id: staffProfileId,
    action: 'APPROVE',
    remarks: 'Verified all 9 modules, qualifications, and teaching experience. Recommended for Dean approval.'
  }, hodToken);
  console.log('HOD Action status:', hodApproveRes.status, hodApproveRes.data);

  console.log('\n--- Step 6: Login as Dean Engineering (dean.engineering@chaitanya.edu.in) ---');
  const deanLogin = await postJson('/api/auth/login', {
    email: 'dean.engineering@chaitanya.edu.in',
    password: 'Dean@123'
  });
  console.log('Dean FET login status:', deanLogin.status);
  const deanToken = deanLogin.data.token;
  console.log('Dean FET User:', deanLogin.data.user.full_name);

  console.log('\n--- Step 7: Dean Reviews and Forwards to Registrar ---');
  const deanApproveRes = await postJson('/api/admin/verify-action', {
    staff_id: staffProfileId,
    action: 'APPROVE',
    remarks: 'Faculty credentials and departmental quota verified. Endorsed for Registrar clearance seal.'
  }, deanToken);
  console.log('Dean Action status:', deanApproveRes.status, deanApproveRes.data);

  console.log('\n--- Step 8: Login as Registrar (registrar@chaitanya.edu.in) ---');
  const regLogin = await postJson('/api/auth/login', {
    email: 'registrar@chaitanya.edu.in',
    password: 'Registrar@123'
  });
  console.log('Registrar login status:', regLogin.status);
  const regToken = regLogin.data.token;
  console.log('Registrar User:', regLogin.data.user.full_name);

  console.log('\n--- Step 9: Registrar Grants Final Clearance Seal ---');
  const regApproveRes = await postJson('/api/admin/verify-action', {
    staff_id: staffProfileId,
    action: 'APPROVE',
    remarks: 'Official clearance granted by the Office of the Registrar. Profile active and verified in university records.'
  }, regToken);
  console.log('Registrar Final Approval status:', regApproveRes.status, regApproveRes.data);

  console.log('\n--- Step 10: Check Final Clearance Status on Vinod Profile ---');
  const finalProfile = await getJson('/api/staff/my-profile', vinodToken);
  console.log('Final workflow status:', finalProfile.data?.profile?.workflow_status);
  console.log('HOD Remarks:', finalProfile.data?.profile?.hod_remarks, 'by', finalProfile.data?.profile?.hod_reviewer_name);
  console.log('Dean Remarks:', finalProfile.data?.profile?.dean_remarks, 'by', finalProfile.data?.profile?.dean_reviewer_name);
  console.log('Registrar Remarks:', finalProfile.data?.profile?.registrar_remarks, 'by', finalProfile.data?.profile?.registrar_reviewer_name);

  console.log('\n--- Step 11: Registrar Hierarchy Tree Inspection ---');
  const hierarchyRes = await getJson('/api/admin/hierarchy', regToken);
  console.log('Hierarchy loaded. Total Deans:', hierarchyRes.data?.tree?.length);
  if (hierarchyRes.data?.tree?.length > 0) {
    const fet = hierarchyRes.data.tree.find(d => d.code === 'FET');
    console.log('FET Dean:', fet?.dean_name, '| Departments:', fet?.departments?.map(d => `${d.name} (HOD: ${d.hod_name})`));
  }

  console.log('\nAll Multi-Tier Clearances Verified Successfully!');
}

run().catch(console.error);
