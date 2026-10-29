const { spawn, execSync } = require('child_process');
const os = require('os');

process.env.VITE_CONFIG_NATIVE_IGNORE_WARNING = 'true';

console.log('================================================================');
console.log('  🏛️  Chaitanya (Deemed to be University) — SDRMS Full Stack   ');
console.log('================================================================');
console.log('  Preparing environment and launching systems...');

// Automatically clear any stuck ports on Windows
if (os.platform() === 'win32') {
  [5000, 5173].forEach(port => {
    try {
      execSync(`powershell -Command "Get-Process -Id (Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"`, { stdio: 'ignore' });
    } catch (e) {}
  });
}

console.log('  ➜ Backend Express Server : http://localhost:5000');
console.log('  ➜ Frontend Vite Portal   : http://localhost:5173');
console.log('----------------------------------------------------------------');
console.log('  Default Passwords:');
console.log('  • Faculty   : vinod@gmail.com                 (Vinod@123)');
console.log('  • HOD (CSE) : hod.cse@chaitanya.edu.in        (Hod@123)');
console.log('  • Dean (FET): dean.engineering@chaitanya.edu.in (Dean@123)');
console.log('  • Registrar : registrar@chaitanya.edu.in      (Registrar@123)');
console.log('================================================================\n');

const server = spawn('node', ['server/server.js'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '5000' }
});

const vite = spawn('npx', ['vite', '--host', '--open'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, VITE_CONFIG_NATIVE_IGNORE_WARNING: 'true' }
});

// Automatically launch default browser directly to the website page
setTimeout(() => {
  try {
    if (os.platform() === 'win32') {
      execSync('start http://localhost:5173', { stdio: 'ignore' });
    } else if (os.platform() === 'darwin') {
      execSync('open http://localhost:5173', { stdio: 'ignore' });
    } else {
      execSync('xdg-open http://localhost:5173', { stdio: 'ignore' });
    }
  } catch (e) {}
}, 1200);

let isShuttingDown = false;
function cleanup() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('\nStopping Chaitanya SDRMS servers cleanly...');
  if (os.platform() === 'win32') {
    if (server && server.pid) {
      try { execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: 'ignore' }); } catch (e) {}
    }
    if (vite && vite.pid) {
      try { execSync(`taskkill /pid ${vite.pid} /T /F`, { stdio: 'ignore' }); } catch (e) {}
    }
  } else {
    try { server.kill(); } catch (e) {}
    try { vite.kill(); } catch (e) {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Keep the event loop running
setInterval(() => {}, 1000 * 60 * 60);
