import express from 'express';
import compression from 'compression';
import session from "cookie-session";
import csrf from "csurf";
import sslRedirect from 'heroku-ssl-redirect'
import swaggerUi from 'swagger-ui-express';
import { api } from './api';
import { auth } from './auth';
import cookieParser from "cookie-parser";

const app = express();
app.use(sslRedirect());
//app.use(helmet({ contentSecurityPolicy: false,crossOriginResourcePolicy:false }));
app.use(compression());


app.use("/api", session({ secret: process.env['TOKEN_SIGN_KEY'] || "my secret" }));
app.use(auth);

app.get('/api/test', (req, res) => res.send("ok"));
app.use(api);



app.use('/api/docs', swaggerUi.serve,
    swaggerUi.setup(api.openApiDoc({ title: 'remult-react-todo' })));

app.use(express.static('build'));
app.use('/*', async (req, res) => {
    res.sendFile(process.cwd() + '/build/index.html');
});
app.listen(process.env.PORT || 3002, () => console.log("Server started"));
