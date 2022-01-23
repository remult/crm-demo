import express from 'express';
import { remultExpress } from 'remult/remult-express';
import glob from 'glob';
import path from 'path';
import expressJwt from 'express-jwt';
import swaggerUi from 'swagger-ui-express';

import { seed } from './seed';
import { getJwtTokenSignKey } from '../SignIn/AuthService';

let ext = "ts";
let dir = "src";
if (__filename.endsWith("js")) {
    ext = "js";
    dir = "dist";
}

for (const type of ["entity", "controller"]) {
    for (const file of glob.sync(dir + `/**/*.${type}.${ext}`)) {
        require(path.resolve(file))
    }
}

const app = express();
app.use(expressJwt({
    secret: getJwtTokenSignKey(),
    credentialsRequired: false,
    algorithms: ['HS256']
}));
const api = remultExpress({
    initApi: seed
});
app.use(api);
app.use('/api/docs', swaggerUi.serve,
    swaggerUi.setup(api.openApiDoc({ title: 'remult-react-todo' })));

app.listen(3002, () => console.log("Server started"));