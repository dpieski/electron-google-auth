const { app, BrowserWindow } = require('electron')
const path = require('path')
const authService = require(path.join(`${__dirname}`, '/../services', 'auth-service'))

let mainWindow

async function createMainWindow(isDev) {
	console.log('* Creating Main Window....')
	mainWindow = new BrowserWindow({
		title: 'APP NAME',
		width: isDev ? 800 : 500,
		height: 600,
		icon: `${__dirname}/../assets/icons/icon.png`,
		resizable: isDev ? true : false,
		backgroundColor: 'white',
		webPreferences: {
			nodeIntegration: false,
			enableRemoteModule: false,
			allowRunningInsecureContent: false,
			contextIsolation: true,
			sandbox: true,
			preload: path.join(app.getAppPath(), 'preload.js'),
			worldSafeExecuteJavaScript: true,
		},
	})

	if (isDev) {
		mainWindow.webContents.openDevTools()
	}
	console.debug('*Loading index.html')
	mainWindow.loadFile('./app/index.html')

	mainWindow.webContents.on('dom-ready', async () => {
		console.log('Sending....: ')
		const prof = await authService.getProfile()
		mainWindow.webContents.send('receive:profile', JSON.stringify(prof))
	})
	return mainWindow
}

module.exports = { createMainWindow, mainWindow }
