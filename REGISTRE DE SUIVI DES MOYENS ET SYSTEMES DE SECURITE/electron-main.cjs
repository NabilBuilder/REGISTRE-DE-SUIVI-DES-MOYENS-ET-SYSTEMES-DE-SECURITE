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
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      webviewTag: false
    },
    autoHideMenuBar: true,
    show: false
  });

  if (isDev) {
    win.loadURL('http://localhost:5174');
  } else {
    const distPath = path.join(__dirname, 'dist');
    protocol.handle('app', (request) => {
      const requestUrl = new URL(request.url);
      let pathname;
      try {
        pathname = decodeURIComponent(requestUrl.pathname);
      } catch {
        return new Response('Not found', { status: 404 });
      }

      let filePath = path.resolve(distPath, `.${pathname}`);
      const relativePath = path.relative(distPath, filePath);
      if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        return new Response('Not found', { status: 404 });
      }

      if (pathname.endsWith('/') || !path.extname(filePath)) {
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
    try {
      const externalUrl = new URL(url);
      if (externalUrl.protocol === 'https:' || externalUrl.protocol === 'mailto:') {
        shell.openExternal(externalUrl.href);
      }
    } catch {
      // Reject malformed or unsupported external URLs.
    }
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    const allowed = isDev
      ? url.startsWith('http://localhost:5174/')
      : url.startsWith('app://');
    if (!allowed) event.preventDefault();
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
