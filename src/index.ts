import { createServer, startServer } from "./app"
import prisma from "./client"

const server = createServer(prisma)
startServer(server, process.env.PORT)
