import { PUTER_API_BASE, PUTER_AUTH_URL } from "../constants";
import type { PuterUser } from "../types";

export interface PuterAuthResult {
  token: string;
  user: PuterUser;
}

export const puterAuth = {
  /**
   * Get the URL for Puter sign-in popup
   */
  getSignInUrl(): string {
    return `${PUTER_AUTH_URL}/action/sign-in?embedded_in_popup=true`;
  },

  /**
   * Validate a Puter token by calling /whoami
   */
  async validateToken(token: string): Promise<PuterUser | null> {
    try {
      const response = await fetch(`${PUTER_API_BASE}/whoami`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        username: data.username,
        uuid: data.uuid,
        email: data.email,
      };
    } catch (error) {
      console.error("Failed to validate Puter token:", error);
      return null;
    }
  },

  /**
   * JavaScript to inject into WebView to capture auth token
   */
  getWebViewInjectedJS(): string {
    return `
      (function() {
        // Listen for postMessage from Puter auth
        window.addEventListener('message', function(event) {
          if (event.origin === '${PUTER_AUTH_URL}') {
            try {
              const data = typeof event.data === 'string' 
                ? JSON.parse(event.data) 
                : event.data;
              
              if (data.msg === 'puter.token' && data.token) {
                // Send token to React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'puter_auth_success',
                  token: data.token,
                }));
              }
            } catch (e) {
              console.error('Error parsing auth message:', e);
            }
          }
        });

        // Also check for token in URL hash (fallback)
        if (window.location.hash.includes('token=')) {
          const params = new URLSearchParams(window.location.hash.slice(1));
          const token = params.get('token');
          if (token) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'puter_auth_success',
              token: token,
            }));
          }
        }
      })();
      true;
    `;
  },
};
