const { app, BrowserWindow, shell, protocol, net } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

if (!isDev) {
  protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }
  ]);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'public', 'logo.ico'),
    title: 'Registre de Securite — GARDNET SERVICES',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    autoHideMenuBar: true,
    show: false
  });

  if (isDev) {
    win.loadURL('http://localhost:5174');
  } else {
    const distPath = path.join(__dirname, 'dist');
    protocol.handle('app', (request) => {
      let filePath = path.join(distPath, new URL(request.url).pathname);
      if (filePath.endsWith('/') || !path.extname(filePath)) {
        filePath = path.join(distPath, 'index.html');
      }
      return net.fetch('file://' + filePath);
    });
    win.loadURL('app://index.html');
  }

  win.webContents.on('did-fail-load', (e, code, desc) => {
    console.error('Load failed:', code, desc);
  });

  win.webContents.on('console-message', (e, level, msg) => {
    if (level >= 2) console.error('Renderer:', msg);
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  win.setMenu(null);

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
