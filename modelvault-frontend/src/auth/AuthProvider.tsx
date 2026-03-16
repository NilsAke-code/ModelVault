import { MsalProvider } from "@azure/msal-react";
import {
  PublicClientApplication,
  EventType,
  type AuthenticationResult,
} from "@azure/msal-browser";
import { msalConfig } from "./authConfig";
import { type ReactNode, useEffect, useState } from "react";

// Skapa MSAL-instansen en gång
const msalInstance = new PublicClientApplication(msalConfig);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState(false);

  useEffect(() => {
    msalInstance
      .initialize()
      .then(() => {
        // Set the first account as active if one exists
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          msalInstance.setActiveAccount(accounts[0]);
        }

        // Listen for login events to set active account
        msalInstance.addEventCallback((event) => {
          if (
            event.eventType === EventType.LOGIN_SUCCESS &&
            event.payload
          ) {
            const result = event.payload as AuthenticationResult;
            msalInstance.setActiveAccount(result.account);
          }
        });

        setIsReady(true);
      })
      .catch((err) => {
        console.warn("MSAL initialization failed (Azure App not configured yet?):", err);
        setInitError(true);
      });
  }, []);

  // If MSAL failed to init (no valid clientId yet), render app without auth
  if (initError) {
    return <>{children}</>;
  }

  // Wait for MSAL to be ready before rendering
  if (!isReady) {
    return null;
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
