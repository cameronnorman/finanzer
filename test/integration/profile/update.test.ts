import request from "supertest"
import { createServer } from "../../../src/app"
import prisma from "../../../src/client"
import {
  createProfile,
  deleteManyProfiles,
} from "../../../src/services/profile_service"

let server: any
let profile: any
beforeAll(async (done) => {
  server = createServer(prisma)
  let profileDetails = {
    email: "cool_kid@looserville.com",
    balance: 20.59,
    currency: "EUR",
  }
  profile = await createProfile(prisma, profileDetails)
  done()
})

afterAll(async (done) => {
  const deleteProfiles = deleteManyProfiles(prisma)

  await prisma.$transaction([deleteProfiles])
  await prisma.$disconnect()

  done()
})

describe("PUT /profile/:id", () => {
  test("when the profile exists, it updates the profile with the new data", async (done) => {
    let updatedProfileDetails = {
      id: profile.id,
      email: "cool_kid@looserville.com",
      balance: 60.39,
      currency: "EUR",
    }

    request(server)
      .put(`/profile/${profile.id}`)
      .expect(200)
      .send(updatedProfileDetails)
      .then((response) => {
        expect(response.body.balance).toEqual(60.39)
        expect(response.body.currency).toEqual("EUR")
        done()
      })
  })

  test("when the profile exists, and there is a error with the payload, it renders the errors", async (done) => {
    let updatedProfileDetails = {
      id: profile.id,
      email: "cool_kid@looserville.com",
      currency: "EUR",
    }

    request(server)
      .put(`/profile/${profile.id}`)
      .expect(400)
      .send(updatedProfileDetails)
      .then((response) => {
        expect(response.body).toEqual({
          errors: [
            { location: "body", msg: "Invalid value", param: "balance" },
          ],
        })
        done()
      })
  })

  test("when the profile does not exist, it does not update the record", async (done) => {
    let updatedProfileDetails = {
      balance: 60.39,
      email: "cool_kid@looserville.com",
      currency: "EUR",
    }

    request(server)
      .put(`/profile/123`)
      .expect(404)
      .send(updatedProfileDetails)
      .then((response) => {
        expect(response.body).toEqual("Profile not found")
        done()
      })
  })
})
