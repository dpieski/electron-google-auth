# electron-google-auth
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

This is an Electron Template for Google Authentication. It also implements contextIsolation - there are no errors or notices in the developer pane. 


## Getting Started
1) Clone the repo to a location on your computer.
2) Setup your Google API for the project. 
    * Navigate to your [Google API Dashboard](https://console.developers.google.com)
    * Create a New project
    * Enable APIS and Services - Enable GMAIL 
    * Create Credentials
      * Download the credentials file to your computer. Rename the credentials file to "credentials.json" and place in the "secrets" folder of the repository.
    * Create OAuth Consent Screen.
      * Include scopes for at least 'gmail.readonly'

3) Navigate to the repository directory and execute `npm i` to install npm and the requisite dependencies.
4) Start the application by executing the command `electron .`

## Considerations
This project uses `contextIsolation: true` to prevent prototype pollution attacks, thus it uses the contextBridge to pass the ipcRenderer to the renderer process with the preload script. Additionally, it uses `worldSafeExecuteJavaScript: true`, which will be enabled by default in Electron 12.

Webpreferences for the Browser window include: 
```javascript
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false,
      allowRunningInsecureContent: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(app.getAppPath(), 'preload.js'),
      worldSafeExecuteJavaScript: true,
    },
```


This template is based, in part, on this comment by [reZach](https://github.com/electron/electron/issues/9920#issuecomment-575839738).
