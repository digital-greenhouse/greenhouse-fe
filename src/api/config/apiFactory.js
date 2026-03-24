import axios from 'axios';



const addAuthToken = (config) => {
  const token = localStorage.getItem('authToken');

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

const handleResponseError = (error) => Promise.reject(error);

const createClient = (withAuth = false) => {
  const client = axios.create({
   
    headers: { 'Content-Type': 'application/json' },
  });

  if (withAuth) {
    client.interceptors.request.use(addAuthToken);
  }

  client.interceptors.response.use(
    (response) => response,
    handleResponseError
  );

  return client;
};

export const publicClient = createClient(false);
export const privateClient = createClient(true);

/**
 * Devuelve el cliente adecuado según autenticación y tipo de contenido.
 *
 * @param {boolean} authenticated - Si la solicitud requiere autenticación.
 * @returns AxiosInstance
 */
export function apiFactory(authenticated = false) {
  return authenticated ? privateClient : publicClient;
}