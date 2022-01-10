import axios from "axios";
import { Remult } from "remult";
Remult.apiBaseUrl = '/api';
export const remult = new Remult(axios); 
