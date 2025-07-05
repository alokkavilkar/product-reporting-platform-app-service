export const createApiClient = (auth0) => {
  return async function apiRequest(endpoint, {
    method = 'GET',
    body = null,
    headers = {}
  } = {}) {
    const token = await auth0.getAccessTokenSilently();

    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...headers,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const res = await fetch(endpoint, config);

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`API error: ${res.status} - ${errorBody}`);
    }

    return res.json();
  };
};
