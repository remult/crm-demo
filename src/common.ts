import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { Remult } from "remult";

export const remult = new Remult(axios);

const AUTH_TOKEN_KEY = "authToken";

export function setAuthToken(token: string | null) {
   if (token) {
      remult.setUser(jwtDecode(token));
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
   }
   else {
      remult.setUser(undefined!);
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
   }
}

// Initialize the auth token from session storage when the application loads
setAuthToken(sessionStorage.getItem(AUTH_TOKEN_KEY));

axios.interceptors.request.use(config => {
   const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
   if (token)
      config.headers!["Authorization"] = "Bearer " + token;
   return config;
});
 