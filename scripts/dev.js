const { spawn } = require('child_process');
const { createServer } = require('vite');

async function startDev() {
  console.log('🚀 启动开发环境...');
  
  // 启动Vite开发服务器
  console.log('📦 启动Vite开发服务器...');
  const viteServer = await createServer({
    server: {
      port: 5173
    }
  });
  
  await viteServer.listen();
  console.log('✅ Vite开发服务器启动成功: http://localhost:5173');
  
  // 等待一秒确保Vite完全启动
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 启动Electron
  console.log('⚡ 启动Electron应用...');
  const electronProcess = spawn('pnpm', ['exec', 'electron', 'src/main/main.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  // 监听Electron进程退出
  electronProcess.on('close', (code) => {
    console.log(`\n🔚 Electron进程退出，代码: ${code}`);
    viteServer.close();
    process.exit(code);
  });
  
  // 监听退出信号
  process.on('SIGINT', () => {
    console.log('\n🛑 收到退出信号，正在关闭...');
    electronProcess.kill();
    viteServer.close();
  });
  
  console.log('✅ 开发环境启动完成！');
}

startDev().catch(err => {
  console.error('❌ 启动失败:', err);
  process.exit(1);
});
