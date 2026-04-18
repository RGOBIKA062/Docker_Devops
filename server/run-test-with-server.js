// Run server and test in sequence with output file logging
import { spawn } from 'child_process';
import fs from 'fs';

const logFile = './test-run.log';

// Clear the log file
fs.writeFileSync(logFile, '');

console.log('Starting server...');

// Start the server
const server = spawn('node', ['index.js'], {
  cwd: '.',
  stdio: ['inherit', 'pipe', 'pipe'],
  detached: false,
});

// Log server output to file
server.stdout.on('data', (data) => {
  const log = `[SERVER STDOUT] ${data.toString()}`;
  console.log(log);
  fs.appendFileSync(logFile, log + '\n');
});

server.stderr.on('data', (data) => {
  const log = `[SERVER STDERR] ${data.toString()}`;
  console.log(log);
  fs.appendFileSync(logFile, log + '\n');
});

// Wait for server to start
setTimeout(() => {
  console.log('\nServer should be running, starting test...\n');

  // Run the test
  const test = spawn('node', ['test-mentor-flow.js'], {
    cwd: '.',
    stdio: 'inherit',
  });

  test.on('close', (code) => {
    console.log(`\nTest completed with code ${code}`);
    console.log(`Full logs written to ${logFile}`);
    server.kill();
    process.exit(code);
  });
}, 3000);
