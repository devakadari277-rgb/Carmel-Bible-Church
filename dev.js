import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to workspace root directory (where manage.py is)
const rootDir = path.resolve(__dirname, '..');

console.log('\n======================================================');
console.log('Starting Carmel Bible Church Development Servers...');
console.log('======================================================\n');

// 1. Start Django Backend Server (python manage.py runserver 8000)
const djangoProcess = spawn('python', ['manage.py', 'runserver', '8000'], {
  cwd: rootDir,
  shell: true,
  stdio: 'inherit'
});

// 2. Start Vite Frontend Server (npx vite)
const viteProcess = spawn('npx', ['vite'], {
  cwd: __dirname,
  shell: true,
  stdio: 'inherit'
});

// Graceful shutdown helper
const cleanExit = () => {
  djangoProcess.kill('SIGTERM');
  viteProcess.kill('SIGTERM');
  process.exit();
};

djangoProcess.on('exit', () => {
  console.log('Django Backend server stopped.');
  cleanExit();
});

viteProcess.on('exit', () => {
  console.log('Vite Frontend server stopped.');
  cleanExit();
});

// Handle terminations
process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
