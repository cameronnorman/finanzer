import prisma from "../client"
import { createServer, startServer } from "./app"

const server = createServer(prisma)
startServer(server, process.env.PORT)
