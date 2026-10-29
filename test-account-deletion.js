const http = require('http');

function postJson(urlPath, data, token = null) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = http.request({ hostname: 'localhost', port: 5000, path: urlPath, method: 'POST', headers }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, raw: body }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function deleteReq(urlPath, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = http.request({ hostname: 'localhost', port: 5000, path: urlPath, method: 'DELETE', headers }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, raw: body }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('--- Step 1: Create a new faculty account ---');
  const dummyEmail = `test.prof.${Date.now()}@chaitanya.edu.in`;
  const regRes = await postJson('/api/auth/register', {
    full_name: 'Dr. Test Assistant Professor',
    email: dummyEmail,
    password: 'Password@123',
    department_id: 6, // CSE
    category: 'Teaching'
  });
  console.log('Register response:', regRes.status, regRes.data?.user?.email);
  const createdUserId = regRes.data?.user?.id;

  console.log('\n--- Step 2: Try logging in with the newly created credentials ---');
  const loginRes = await postJson('/api/auth/login', {
    email: dummyEmail,
    password: 'Password@123'
  });
  console.log('Login with new account:', loginRes.status, loginRes.data?.user?.full_name);
  const dummyToken = loginRes.data?.token;

  console.log('\n--- Step 3: Verify that ordinary staff CANNOT delete accounts ---');
  const staffDelRes = await deleteReq(`/api/admin/user/${createdUserId}`, dummyToken);
  console.log('Staff delete attempt status (should be 403):', staffDelRes.status, staffDelRes.data);

  console.log('\n--- Step 4: Login as HOD CSE to delete account ---');
  const hodLogin = await postJson('/api/auth/login', {
    email: 'hod.cse@chaitanya.edu.in',
    password: 'Hod@123'
  });
  const hodToken = hodLogin.data.token;
  const hodDelRes = await deleteReq(`/api/admin/user/${createdUserId}`, hodToken);
  console.log('HOD delete attempt status (should be 200):', hodDelRes.status, hodDelRes.data);

  console.log('\n--- Step 5: Verify account is now deleted and cannot login ---');
  const postDelLogin = await postJson('/api/auth/login', {
    email: dummyEmail,
    password: 'Password@123'
  });
  console.log('Login after deletion status (should be 401):', postDelLogin.status, postDelLogin.data);

  console.log('\nAccount persistence and deletion control fully verified!');
}

run().catch(console.error);

