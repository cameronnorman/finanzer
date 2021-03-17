import express from "express"
import morgan from "morgan"
import dotenv from "dotenv"
import fs from "fs"
import jwt from "express-jwt";
import jwksRsa from "jwks-rsa";
import expressOasGenerator from "express-oas-generator"
import connection from "./connection"
import transactionsRouter from "./routes/transactions"
import profilesRouter from "./routes/profiles"
import healthCheckRouter from "./routes/health_check"
import cors from "cors"

dotenv.config();

const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

const checkAuth = (req: express.Request, res: express.Response, next: any) => {
  if (process.env.NODE_ENV === "test") {
    next()
    return
  }

  checkJwt(req, res, next)
}

const app = express()
const port: string = process.env.PORT

const openAPIFilePath = './api-docs/server.json'

const predefinedSpec = JSON.parse(
  fs.readFileSync(openAPIFilePath, { encoding: 'utf-8' })
);

expressOasGenerator.handleResponses(app, {
  predefinedSpec: () => predefinedSpec,
  specOutputPath: openAPIFilePath
})

app.use(express.json())
app.use(cors())
app.use(morgan('tiny'))
//app.use('/', healthCheckRouter)
//app.use('/transactions', checkAuth, transactionsRouter)
//app.use('/profile', checkAuth, profilesRouter)

app.use('/', healthCheckRouter)
app.use('/transactions', transactionsRouter)
app.use('/profile', profilesRouter)


expressOasGenerator.handleRequests()

const server = app.listen(port, () => {
  connection.create(process.env.NODE_ENV)
  // tslint:disable-next-line:no-console
  console.log(`Server started on port: ${ port }`)
});

export default server
