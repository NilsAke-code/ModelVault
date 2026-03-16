import { type Configuration, LogLevel } from "@azure/msal-browser";

// ============================================================
// AZURE APP REGISTRATION — steg-för-steg:
//
// 1. Gå till https://portal.azure.com
// 2. Sök "App registrations" → klicka "New registration"
// 3. Name: "3DModelVault"
// 4. Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
// 5. Redirect URI: Platform = "Single-page application (SPA)", URI = "http://localhost:5173"
// 6. Klicka "Register"
// 7. Kopiera "Application (client) ID" → klistra in nedan som clientId
// 8. Kopiera "Directory (tenant) ID" → klistra in nedan och i appsettings.json
//
// 9. Gå till "Expose an API" i sidomenyn
// 10. Klicka "Add" bredvid Application ID URI → acceptera default (api://<clientId>)
// 11. Klicka "Add a scope": Scope name: "access_as_user", Admin consent display name: "Access 3DModelVault API"
// 12. Klicka "Add scope"
//
// Klistra sedan in ditt clientId nedan:
// ============================================================

const clientId = "YOUR_CLIENT_ID_HERE";
const tenantId = "YOUR_TENANT_ID_HERE";

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: "http://localhost:5173",
    postLogoutRedirectUri: "http://localhost:5173",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      loggerCallback: (level, message) => {
        if (level === LogLevel.Error) console.error(message);
      },
    },
  },
};

// Scopes som frontend begär vid inloggning
export const loginRequest = {
  scopes: [`api://${clientId}/access_as_user`],
};

// Scopes för API-anrop
export const apiRequest = {
  scopes: [`api://${clientId}/access_as_user`],
};
