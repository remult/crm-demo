import axios from 'axios';
import { Remult } from "remult";
import { AuthService } from './SignIn/AuthService';
Remult.apiBaseUrl = '/api';

axios.interceptors.request.use(config => {
    const token = AuthService.fromStorage();
    if (token)
        config.headers!["Authorization"] = "Bearer " + token;
    return config;
});
export const remult = new Remult(axios);

export const auth = new AuthService(remult);
