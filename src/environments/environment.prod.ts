export const environment = {
  production: true,
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  },
  googleApi: {
    clientId: '843374591226-c5hblbj2fqmqem2t7ph9cuqmtc5g64mu.apps.googleusercontent.com',
    scopes: 'https://www.googleapis.com/auth/calendar',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    redirectUri: 'https://pizzacarnevale.com/auth-callback'
  },
  apiUrl: '/api'
}; 