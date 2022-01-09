import express from 'express';
import { remultExpress } from 'remult/remult-express';

const app = express();
app.use(remultExpress());
app.listen(3002, () => console.log("Server started"));
