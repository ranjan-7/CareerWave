const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function log(message) {
  console.log(`[setup_project] ${message}`);
}

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
}

try {
  log('Starting file migrations...');

  // 1. Copy src/ to frontend/src/
  const srcPath = path.join(__dirname, 'src');
  const destSrcPath = path.join(__dirname, 'frontend', 'src');
  if (fs.existsSync(srcPath)) {
    log('Copying src/ to frontend/src/ ...');
    copyFolderSync(srcPath, destSrcPath);
  }

  // 2. Delete frontend/src/app/api/ (since backend handles API)
  const apiPath = path.join(destSrcPath, 'app', 'api');
  if (fs.existsSync(apiPath)) {
    log('Removing Next.js app/api/ routes from frontend/src/app/api ...');
    deleteFolderRecursive(apiPath);
  }

  // 3. Move configurations to frontend
  const filesToMove = [
    'tailwind.config.js',
    'postcss.config.js',
    'tsconfig.json',
    'next.config.js'
  ];

  filesToMove.forEach(file => {
    const rootFilePath = path.join(__dirname, file);
    const destFilePath = path.join(__dirname, 'frontend', file);
    if (fs.existsSync(rootFilePath)) {
      log(`Moving configuration: ${file} ...`);
      fs.copyFileSync(rootFilePath, destFilePath);
      fs.unlinkSync(rootFilePath);
    }
  });

  // 4. Clean up original src/ and prisma/ from root
  if (fs.existsSync(srcPath)) {
    log('Cleaning up original src/ folder from root...');
    deleteFolderRecursive(srcPath);
  }

  const rootPrismaPath = path.join(__dirname, 'prisma');
  if (fs.existsSync(rootPrismaPath)) {
    log('Cleaning up original prisma/ folder from root...');
    deleteFolderRecursive(rootPrismaPath);
  }

  const powershellPath = path.join(__dirname, 'powershell.ps1');
  if (fs.existsSync(powershellPath)) {
    log('Cleaning up temporary powershell.ps1 wrapper...');
    fs.unlinkSync(powershellPath);
  }

  const verifyPath = path.join(__dirname, 'verify.js');
  if (fs.existsSync(verifyPath)) {
    log('Cleaning up verify.js script...');
    fs.unlinkSync(verifyPath);
  }

  log('✅ File migrations completed successfully!');

  // 5. Run npm install in root, frontend and backend
  log('Installing backend dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });

  log('Installing frontend dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });

  log('Installing root dependencies...');
  execSync('npm install', { cwd: __dirname, stdio: 'inherit' });

  // 6. DB migrations & seeding inside backend
  log('Generating Prisma Client in backend...');
  execSync('npx prisma generate', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });

  log('Pushing database schema in backend...');
  execSync('npx prisma db push', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });

  log('Seeding mock database in backend...');
  execSync('node prisma/seed.js', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });

  log('🎉 ALL SETUPS COMPLETED SUCCESSFULLY!');
  log('You can now start backend and frontend concurrently using "npm run dev".');

} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
