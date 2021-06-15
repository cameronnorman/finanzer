import { PrismaClient } from "@prisma/client"
import request from "supertest"
import { createServer } from "../../src/app"

const prisma = new PrismaClient()
let server: any
beforeAll(async (done) => {
  server = createServer(prisma)
  done()
})

afterAll(async (done) => {
  await prisma.$disconnect()
  done()
})

describe("GET /check", () => {
  test("it returns OK if the server is running", async (done) => {
    request(server)
      .get("/check")
      .expect(200)
      .then((response) => {
        expect(response.text).toEqual("OK")
        done()
      })
  })
})
