const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const distDir = '.next-build';
const distPath = path.join(projectRoot, distDir);
const nextBin = path.join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next');
const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
const originalTsconfig = fs.existsSync(tsconfigPath)
  ? fs.readFileSync(tsconfigPath, 'utf8')
  : null;

fs.rmSync(distPath, { recursive: true, force: true });

const result = spawnSync(process.execPath, [nextBin, 'build'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_DIST_DIR: distDir,
  },
});

if (originalTsconfig !== null) {
  fs.writeFileSync(tsconfigPath, originalTsconfig);
}

process.exit(result.status ?? 1);
