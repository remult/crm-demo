import express from 'express'
import compression from 'compression'
import session from 'cookie-session'
import sslRedirect from 'heroku-ssl-redirect'
import swaggerUi from 'swagger-ui-express'
import { api } from './api'
import { auth } from './auth'
import { buildSchema } from 'graphql'
import { graphqlHTTP } from 'express-graphql'
import { remultGraphql } from 'remult/graphql'

const app = express()
app.use(sslRedirect())
//app.use(helmet({ contentSecurityPolicy: false,crossOriginResourcePolicy:false }));//removed because avatar image urls point to a different website
app.use(compression())

app.use(
  '/api',
  session({ secret: process.env['TOKEN_SIGN_KEY'] || 'my secret' })
)
app.use(auth)

app.get('/api/test', (req, res) => res.send('ok'))
app.use(api)

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(api.openApiDoc({ title: 'remult-react-todo' }))
)

app.use(api);
const { schema, rootValue } = remultGraphql(api);
app.use('/api/graphql', (req, res, next) => {
  //Set a dummy user so that graphql will work when signed out - only for demo purposes
  req.session!['user'] = { id: "graphql", name: "graphql" };
  next();
}, graphqlHTTP({
  schema: buildSchema(schema),
  rootValue,
  graphiql: true,
}));

app.use(express.static('dist'))
app.use('/*', async (req, res) => {
  res.sendFile(process.cwd() + '/dist/index.html')
})
app.listen(process.env.PORT || 3002, () => console.log('Server started'))
