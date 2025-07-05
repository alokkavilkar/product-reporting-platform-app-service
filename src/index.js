import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import React from 'react'

const root = createRoot(document.getElementById('root'));

root.render(
<Auth0Provider
    domain={process.env.REACT_APP_AUTH0_DOMAIN}
    clientId={process.env.REACT_APP_CLIENT_ID}
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: process.env.REACT_APP_AUDIENCE_NAMESPACE
    }}
    cacheLocation={process.env.REACT_APP_AUTH0_CACHE_LOCATION}
  >
    <App />
  </Auth0Provider>,
);