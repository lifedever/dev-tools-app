const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 验证版本号格式
function isValidVersion(version) {
  const versionRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/;
  return versionRegex.test(version);
}

// 比较版本号
function compareVersions(current, newVersion) {
  const currentParts = current.split('.').map(Number);
  const newParts = newVersion.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if (newParts[i] > currentParts[i]) return true;
    if (newParts[i] < currentParts[i]) return false;
  }
  return false;
}

// 询问版本号
function askForVersion(currentVersion) {
  return new Promise((resolve, reject) => {
    console.log(`\n📦 准备构建应用...`);
    console.log(`当前版本: ${currentVersion}`);
    console.log(`请输入新的版本号 (格式: x.y.z，例如: 1.0.2):`);
    
    rl.question('新版本号: ', (answer) => {
      const newVersion = answer.trim();
      
      if (!newVersion) {
        console.log('❌ 版本号不能为空');
        rl.close();
        reject(new Error('版本号不能为空'));
        return;
      }
      
      if (!isValidVersion(newVersion)) {
        console.log('❌ 版本号格式无效，请使用 x.y.z 格式 (例如: 1.0.2)');
        rl.close();
        reject(new Error('版本号格式无效'));
        return;
      }
      
      if (newVersion === currentVersion) {
        console.log('❌ 新版本号不能与当前版本相同');
        rl.close();
        reject(new Error('版本号相同'));
        return;
      }
      
      if (!compareVersions(currentVersion, newVersion)) {
        console.log('⚠️  警告: 新版本号似乎不比当前版本高');
        rl.question('是否继续? (y/N): ', (confirm) => {
          rl.close();
          if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
            resolve(newVersion);
          } else {
            reject(new Error('用户取消构建'));
          }
        });
      } else {
        rl.close();
        resolve(newVersion);
      }
    });
  });
}

// 更新package.json版本号
function updatePackageVersion(newVersion) {
  const packagePath = path.join(__dirname, '../package.json');
  const packageContent = fs.readFileSync(packagePath, 'utf8');
  const packageJson = JSON.parse(packageContent);
  
  const oldVersion = packageJson.version;
  packageJson.version = newVersion;
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ 版本号已更新: ${oldVersion} → ${newVersion}`);
}

// 运行构建命令
function runBuild() {
  return new Promise((resolve, reject) => {
    console.log('\n🔨 开始构建...');
    
    const buildProcess = spawn('pnpm', ['run', 'build-only'], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Vite构建完成');
        
        // 运行electron-builder
        console.log('📦 开始打包Electron应用...');
        const electronBuilderProcess = spawn('pnpm', ['exec', 'electron-builder'], {
          stdio: 'inherit',
          cwd: path.join(__dirname, '..')
        });
        
        electronBuilderProcess.on('close', (electronCode) => {
          if (electronCode === 0) {
            console.log('🎉 构建完成！');
            resolve();
          } else {
            reject(new Error(`Electron Builder 失败，退出代码: ${electronCode}`));
          }
        });
        
        electronBuilderProcess.on('error', (err) => {
          reject(new Error(`Electron Builder 错误: ${err.message}`));
        });
        
      } else {
        reject(new Error(`Vite构建失败，退出代码: ${code}`));
      }
    });
    
    buildProcess.on('error', (err) => {
      reject(new Error(`构建错误: ${err.message}`));
    });
  });
}

// 主函数
async function main() {
  try {
    // 读取当前版本
    const packagePath = path.join(__dirname, '../package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);
    const currentVersion = packageJson.version;
    
    // 询问新版本号
    const newVersion = await askForVersion(currentVersion);
    
    // 更新版本号
    updatePackageVersion(newVersion);
    
    // 运行构建
    await runBuild();
    
    console.log(`\n🎉 构建成功完成！`);
    console.log(`📦 应用版本: ${newVersion}`);
    console.log(`📁 输出目录: dist-electron/`);
    
  } catch (error) {
    console.error(`\n❌ 构建失败: ${error.message}`);
    process.exit(1);
  }
}

// 处理退出信号
process.on('SIGINT', () => {
  console.log('\n🛑 构建被中断');
  rl.close();
  process.exit(1);
});

// 启动构建流程
main();
