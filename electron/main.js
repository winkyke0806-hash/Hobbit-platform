const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    title: "A Hobbit — Interaktív Platform",
    backgroundColor: "#050302",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  } else {
    win.loadURL("http://localhost:5173");
  }

  win.setMenu(null);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
