export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  audience: import.meta.env.VITE_AUTH0_AUDIENCE,
  scope: import.meta.env.VITE_AUTH0_SCOPE || 'openid profile email',
  redirectUri: import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin
};

export const isAuth0Configured = Boolean(auth0Config.domain && auth0Config.clientId);
