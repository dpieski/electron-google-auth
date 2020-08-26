const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld('app', {
	logout: () => {
		console.log('In the Preload....')
		ipcRenderer.send('application:logout')
	},
	receive: (channel, func) => {
		let validChannels = ['receive:profile']
		if (validChannels.includes(channel)) {
			ipcRenderer.on(channel, (event, ...args) => func(...args))
		}
	},
})
