import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import { remultExpress } from 'remult/remult-express';
import glob from 'glob';
import path from 'path';
import expressJwt from 'express-jwt';
import sslRedirect from 'heroku-ssl-redirect'
import { createPostgresConnection } from 'remult/postgres';
import swaggerUi from 'swagger-ui-express';

import { seed } from './seed';

import { config } from 'dotenv';
import { getJwtSigningKey } from '../SignIn/SignIn.controller';

config();
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
app.use(sslRedirect());
//app.use(helmet({ contentSecurityPolicy: false,crossOriginResourcePolicy:false }));
app.use(compression());
app.use(expressJwt({
    secret: getJwtSigningKey(),
    credentialsRequired: false,
    algorithms: ['HS256']
}));
const api = remultExpress({
    dataProvider: async () => {
        if (process.env.NODE_ENV === "production")
            return createPostgresConnection({ configuration: "heroku" })
        return undefined;
    },
    initApi: seed
});
app.use(api);
app.use('/api/docs', swaggerUi.serve,
    swaggerUi.setup(api.openApiDoc({ title: 'remult-react-todo' })));

app.use(express.static('build'));
app.use('/*', async (req, res) => {
    res.sendFile(process.cwd() + '/build/index.html');
});
app.listen(process.env.PORT || 3002, () => console.log("Server started"));