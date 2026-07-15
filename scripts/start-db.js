const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Find mongod executable
let mongodPath = 'mongod'; // Assume in PATH by default

if (process.platform === 'win32') {
  // Check standard Windows path
  const baseDir = 'C:\\Program Files\\MongoDB\\Server';
  if (fs.existsSync(baseDir)) {
    const versions = fs.readdirSync(baseDir);
    // Sort versions to get the latest
    versions.sort((a, b) => parseFloat(b) - parseFloat(a));
    if (versions.length > 0) {
      const latestPath = path.join(baseDir, versions[0], 'bin', 'mongod.exe');
      if (fs.existsSync(latestPath)) {
        mongodPath = latestPath;
      }
    }
  }
}

const dbPath = path.join(__dirname, '..', 'mongodb-data');
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

console.log(`Starting MongoDB using: ${mongodPath}`);
console.log(`Data directory: ${dbPath}`);

const args = [
  '--port', '27018',
  '--dbpath', dbPath,
  '--replSet', 'rs0'
];

const mongod = spawn(mongodPath, args, { stdio: 'inherit' });

mongod.on('error', (err) => {
  console.error('Failed to start mongod:', err.message);
  console.log('\nMake sure MongoDB Server is installed.');
  console.log('You can download it from: https://www.mongodb.com/try/download/community');
  process.exit(1);
});

mongod.on('close', (code) => {
  console.log(`mongod process exited with code ${code}`);
});
