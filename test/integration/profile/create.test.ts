import request from "supertest"
import prisma from "../../../client"
import { createServer } from "../../../src/app"
import { deleteManyProfiles } from "../../../src/services/profile_service"

let server: any
beforeAll(async (done) => {
  server = createServer(prisma)
  done()
})

afterAll(async (done) => {
  const deleteProfiles = deleteManyProfiles(prisma)

  await prisma.$transaction([deleteProfiles])
  await prisma.$disconnect()

  done()
})

describe("POST /profile", () => {
  test("when the data is correct, it creates a profile", async (done) => {
    let profileDetails = {
      email: "cool_kid@looserville.com",
    }

    request(server)
      .post(`/profile`)
      .expect(201)
      .send(profileDetails)
      .then((response) => {
        expect(response.body.email).toEqual("cool_kid@looserville.com")
        expect(response.body.currency).toEqual("EUR")
        expect(response.body.balance).toEqual(0)
        done()
      })
  })
})
