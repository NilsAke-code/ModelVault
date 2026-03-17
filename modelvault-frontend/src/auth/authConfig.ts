import { type Configuration, LogLevel } from "@azure/msal-browser";


const clientId = import.meta.env.VITE_AZURE_CLIENT_ID ?? "";

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
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
