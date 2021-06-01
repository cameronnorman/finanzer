import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import jwt from "express-jwt"
import expressOasGenerator from "express-oas-generator"
import fs from "fs"
import jwksRsa from "jwks-rsa"
import morgan from "morgan"
import healthCheckRouter from "./routes/health_check"
import { createProfilesRouter } from "./routes/profiles"

dotenv.config()

const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),

  // Validate the audience and the issuer.
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
})

const checkAuth = (req: express.Request, res: express.Response, next: any) => {
  if (process.env.NODE_ENV === "test") {
    next()
    return
  }

  checkJwt(req, res, next)
}

export const createServer = (prismaClient: any) => {
  const app = express()

  const openAPIFilePath = "./api-docs/server.json"

  const predefinedSpec = JSON.parse(
    fs.readFileSync(openAPIFilePath, { encoding: "utf-8" })
  )

  expressOasGenerator.handleResponses(app, {
    predefinedSpec: () => predefinedSpec,
    specOutputPath: openAPIFilePath,
    alwaysServeDocs: true,
    ignoredNodeEnvironments: ["test"],
    specOutputFileBehavior: "RECREATE",
  })

  const profilesRouter = createProfilesRouter(prismaClient)
  app.use(express.json())
  app.use(cors())
  app.use(morgan("tiny"))
  app.use("/", healthCheckRouter)
  app.use("/profile", checkAuth, profilesRouter)

  return app
}

export const startServer = (serverInstance: any, port: string) => {
  expressOasGenerator.handleRequests()
  return serverInstance.listen(port, async () => {
    // tslint:disable-next-line:no-console
    console.log(`Server started on port: ${port}`)
  })
}
