import express from 'express';
import compression from 'compression';
import expressJwt from 'express-jwt';
import sslRedirect from 'heroku-ssl-redirect'
import swaggerUi from 'swagger-ui-express';
import { getJwtSigningKey } from '../SignIn/SignIn.controller';
import { api } from './api';



const app = express();
app.use(sslRedirect());
//app.use(helmet({ contentSecurityPolicy: false,crossOriginResourcePolicy:false }));
app.use(compression());
app.use(expressJwt({
    secret: getJwtSigningKey(),
    credentialsRequired: false,
    algorithms: ['HS256']
}));

app.use(api);
app.use('/api/docs', swaggerUi.serve,
    swaggerUi.setup(api.openApiDoc({ title: 'remult-react-todo' })));

app.use(express.static('build'));
app.use('/*', async (req, res) => {
    res.sendFile(process.cwd() + '/build/index.html');
});
app.listen(process.env.PORT || 3002, () => console.log("Server started"));
