const { spawn } = require('child_process');
const path = require('path');

console.log('⚡ Starting MongoDB database service...');
// Use double quotes around the script path to support directories with spaces (e.g. "Leads Admin Xin")
const startDbPath = `"${path.join(__dirname, 'start-db.js')}"`;

const dbProcess = spawn('node', [startDbPath], {
  stdio: 'inherit',
  shell: true
});

console.log('⚡ Starting Next.js development server...');
const nextProcess = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Helper function to cleanly shut down both child processes
const cleanup = () => {
  console.log('\n⚡ Shutting down dev services...');
  
  if (dbProcess) {
    try {
      dbProcess.kill('SIGINT');
    } catch (e) {}
  }
  
  if (nextProcess) {
    try {
      nextProcess.kill('SIGINT');
    } catch (e) {}
  }
  
  process.exit();
};

// Handle termination signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
