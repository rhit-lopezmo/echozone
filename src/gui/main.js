const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		resizable: false,
		title: "echozone",
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	mainWindow.loadFile(path.join(__dirname, "index.html"));

	// Optional: Uncomment to open DevTools
	mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

// Close the app when all windows are closed
app.on("window-all-closed", () => {
	app.quit();
});

