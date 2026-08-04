/**
 * scripts/run-android.js
 * Correct one-step launch:
 *   1. Start Metro (expo start) first
 *   2. Wait until Metro is fully ready
 *   3. Set up adb reverse
 *   4. Press 'a' to open on Android emulator
 */
const { spawn, spawnSync } = require('child_process');
const path = require('path');
const os = require('os');

const ANDROID_HOME =
  process.env.ANDROID_HOME ||
  process.env.ANDROID_SDK_ROOT ||
  path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk');

const ADB = path.join(ANDROID_HOME, 'platform-tools', 'adb.exe');

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function main() {
  console.log('🚀 Starting Metro Bundler...\n');

  // Force Metro to use 127.0.0.1 (IPv4) instead of localhost
  // Recent versions of Node.js default to IPv6 (::1) for localhost,
  // but ADB reverse ONLY supports IPv4! This caused a silent mismatch.
  process.env.REACT_NATIVE_PACKAGER_HOSTNAME = '127.0.0.1';

  // Start expo run:android (this actually launches the app on the emulator)
  const metro = spawn('npx', ['expo', 'run:android', '--no-build-cache'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
  });

  let metroReady = false;

  // Pipe all output so user can see it
  metro.stdout.on('data', async (data) => {
    const text = data.toString();
    process.stdout.write(text);

    if (
      !metroReady &&
      (text.includes('Waiting on http://localhost') ||
        text.includes('Metro waiting on') ||
        text.includes('Logs for your project will appear') ||
        text.includes('Starting Metro Bundler'))
    ) {
      metroReady = true;

      // Wait 2s for Metro to fully stabilize
      await sleep(2000);

      // Set up ADB reverse so emulator can reach Metro
      console.log('\n📡 Setting up ADB reverse tunnel...');
      const result = spawnSync(ADB, ['reverse', 'tcp:8081', 'tcp:8081'], {
        encoding: 'utf8',
      });
      if (result.status === 0) {
        console.log('✅ ADB tunnel ready!\n');
      } else {
        console.warn('⚠️  ADB reverse failed — is the emulator running? Output:', result.stderr);
      }
    }
  });

  metro.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  metro.on('close', (code) => {
    process.exit(code || 0);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    metro.kill();
    process.exit(0);
  });
}

main().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
