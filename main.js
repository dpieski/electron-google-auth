const { app, BrowserWindow, Menu, ipcMain } = require('electron')

process.env.NODE_ENV = 'development'

global.isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false

const { createAuthWindow } = require('./main/auth-process')
const CreateMainWindow = require('./main/app-process')
const authService = require('./services/auth-service')

let MainWindow

async function showWindow() {
  try {
    console.log('Trying to refresh tokens....')
    await authService.refreshTokens()
    console.log('Creating Main Window....')
    MainWindow = await CreateMainWindow.createMainWindow(isDev)
  } catch (err) {
    console.warn('Cannot refresh tokens so #Creating Auth Window....')
    console.error(err)
    createAuthWindow()
  }
}

app.on('ready', () => {
  showWindow()

  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)
})

const menu = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  {
    role: 'fileMenu',
  },
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' },
          ],
        },
      ]
    : []),
]

ipcMain.on('application:logout', async (event, flag) => {
  console.log("In main IPC 'application:logout'")
  if (MainWindow) {
    await authService.logout()
    app.isQuitting = true
    app.quit()
  }
})

app.on('authenticated', async () => {
  MainWindow = await CreateMainWindow.createMainWindow(isDev)
})

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    MainWindow = await CreateMainWindow.createMainWindow(isDev)
  }
})

app.allowRendererProcessReuse = true
