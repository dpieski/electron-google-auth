const keytar = require('keytar')
const os = require('os')
const path = require('path')
const { google } = require('googleapis')
const fs = require('fs')
const clientSecretPath = path.join(
  `${__dirname}`,
  '/../assets',
  'secrets',
  'credentials.json'
)
const credentials = parseDataFile(clientSecretPath).installed
const oAuth2Client = new google.auth.OAuth2(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uris[1]
)
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
]

const keytarService = 'electron-auth-gsuite'
const keytarAccount = os.userInfo().username

let profile

async function getProfile() {
  console.log('Returning Profile....')
  try {
    const people = google.people('v1')

    var res = await people.people.get({
      resourceName: 'people/me',
      'requestMask.includeField': 'person.names,person.photos',
      auth: oAuth2Client,
    })

    profile = {
      name: res.data.names[0].displayName,
      picture: res.data.photos[0].url,
    }
  } catch (error) {
    console.error('The Profile API encountered an error: ' + err)
  }

  console.debug('Profile is: ')
  console.debug(profile)

  return profile
}

function getAuthenticationURL() {
  console.debug('Getting Authentication URL....')
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })
}

async function loadTokens(callbackURL) {
  console.debug('  Callback url: ' + callbackURL)
  const myURL = new URL(callbackURL)
  const myCode = myURL.searchParams.get('code')

  try {
    // Get the accessToken
    const accessToken = await oAuth2Client.getToken(myCode)
    // Set the oAuth2 credentials using the accessToken
    oAuth2Client.setCredentials(accessToken.tokens)

    // Store the token to keychain for later program executions
    if (oAuth2Client.credentials) {
      console.log('  Saving oAuth2Client Credentials....')
      await keytar.setPassword(
        keytarService,
        keytarAccount,
        JSON.stringify(accessToken.tokens)
      )
    }
    return true
  } catch (err) {
    console.error('Error retrieving access token....', err)
    // Make sure you are logged out if there is an error with getting tokens
    console.warn('LOGGING OUT!')
    await logout()
    throw err
    return false
  }
}

async function logout() {
  console.log('Logging out....')
  console.debug('deleting password from keytar....')
  await keytar.deletePassword(keytarService, keytarAccount)
  accessToken = null
  profile = null
  refreshToken = null
  await oAuth2Client.revokeCredentials()
}

async function refreshTokens() {
  console.log('-Getting token from keytar....')
  const credentials = await keytar.getPassword(keytarService, keytarAccount)
  console.debug('-Loaded credentials: ')
  console.debug(credentials)
  if (credentials) {
    console.log(
      '-Setting oAuth2Client credentials with credentials from keytar....'
    )
    oAuth2Client.setCredentials(JSON.parse(credentials))
    // return credentials
  } else {
    console.error('Error getting credentials from keytar....')
    throw new Error('Error getting credentials from keytar....')
  }
}

function parseDataFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath))
  } catch (err) {
    console.error('Error loading JSON data file: ', err)
    throw err
  }
}

async function listLabels() {
  console.log('Listing Labels....')
  const gmail = google.gmail('v1')
  gmail.users.labels.list(
    {
      userId: 'me',
      auth: oAuth2Client,
    },
    (err, res) => {
      if (err) return console.log('The API returned an error: ' + err)
      const labels = res.data.labels
      if (labels.length) {
        console.log('Labels:')
        labels.forEach((label) => {
          console.log(`- ${label.name}`)
        })
      } else {
        console.log('No labels found.')
      }
    }
  )
}

module.exports = {
  getAuthenticationURL,
  getProfile,
  loadTokens,
  logout,
  refreshTokens,
  listLabels,
  profile,
}
