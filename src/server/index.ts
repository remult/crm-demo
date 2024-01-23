import express from 'express'
import compression from 'compression'
import session from 'cookie-session'
import sslRedirect from 'heroku-ssl-redirect'
import swaggerUi from 'swagger-ui-express'
import { api, entities } from './api'
import { auth } from './auth'
import { Remult, remult } from 'remult'
import remultAdmin from 'remult-admin'
import { remultGraphql } from 'remult/graphql'
import { createSchema, createYoga } from 'graphql-yoga'
import fs from 'fs'

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
//@ts-ignore
app.use(api)

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(api.openApiDoc({ title: 'remult-react-todo' }))
)

const { typeDefs, resolvers } = remultGraphql({
  entities,
  removeComments: true
})
fs.writeFileSync('./tmp/x.gql', typeDefs)
const yoga = createYoga({
  graphqlEndpoint: '/api/graphql',
  schema: createSchema({
    typeDefs,
    resolvers
  })
})
app.use(yoga.graphqlEndpoint, api.withRemult, (req, res) => {
  remult.user = { id: 'admin', avatar: '' } //this is a hack to make sure the admin user is logged in
  yoga(req, res)
})

app.get('/api/admin/*', api.withRemult, (_, res) => {
  remult.user = { id: 'admin', avatar: '' } //this is a hack to make sure the admin user is logged in
  res.send(remultAdmin({ entities, baseUrl: '/api/admin' }))
})

app.use(express.static('dist'))
app.use('/*', async (req, res) => {
  res.sendFile(process.cwd() + '/dist/index.html')
})
app.listen(process.env.PORT || 3002, () => console.log('Server started'))
