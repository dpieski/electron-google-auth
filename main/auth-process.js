const { BrowserWindow, app } = require('electron')
const path = require('path')
const authService = require(path.join(`${__dirname}`, '/../services', 'auth-service'))

let win

function createAuthWindow() {
	destroyAuthWin()
	console.debug('#Creating Auth Window....')
	win = new BrowserWindow({
		width: 500,
		height: 600,
		webPreferences: {
			nodeIntegration: false,
			enableRemoteModule: false,
			worldSafeExecuteJavaScript: true,
		},
		resizable: true,
		title: 'Authenticating....',
		backgroundColor: 'white',
		center: true,
	})
	win.setMenuBarVisibility(false)
	console.debug('#Loading Auth URL....')
	win.loadURL(authService.getAuthenticationURL())

	const {
		session: { webRequest },
	} = win.webContents

	const filter = {
		urls: ['http://localhost/*'],
	}
	console.debug('URL Filter: ' + filter.urls)

	webRequest.onBeforeRequest(filter, async ({ url }) => {
		console.debug('#Loading Tokens....')
		if (await authService.loadTokens(url)) {
			win.emit('authenticated')
		}
	})

	win.on('authenticated', () => {
		console.log('#Creating Main Window....')
		console.log('#Authenticated!')
		app.emit('authenticated')
		return destroyAuthWin()
	})

	win.on('closed', () => {
		console.log('#Auth Window Closed.')
		win = null
	})
}

function destroyAuthWin() {
	console.log('#Destroying Auth Window....')
	if (!win) return
	win.close()
}

module.exports = {
	createAuthWindow,
}
