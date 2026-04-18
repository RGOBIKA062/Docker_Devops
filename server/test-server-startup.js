import axios from 'axios';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting server test...\n');

// Start the server
const server = spawn('node', ['index.js'], { cwd: __dirname });

let output = '';
let serverStarted = false;

server.stdout.on('data', (data) => {
  output += data.toString();
  console.log(`[SERVER OUTPUT] ${data}`);
  if (output.includes('listening')) {
    serverStarted = true;
  }
});

server.stderr.on('data', (data) => {
  console.error(`[SERVER ERROR] ${data}`);
});

// Wait 3 seconds then test
setTimeout(async () => {
  console.log('\n✅ Waiting for server to start...');
  
  try {
    const response = await axios.get('http://localhost:5000/health', { timeout: 5000 });
    console.log('✅ Health check passed!');
    console.log(`Response: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.error('❌ Health check failed!');
    console.error(`Error: ${error.message}`);
  }
  
  // Kill server
  server.kill();
  process.exit(0);
}, 3000);

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
