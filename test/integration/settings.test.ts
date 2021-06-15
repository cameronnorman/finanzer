import request from "supertest"
import { createServer } from "../../src/app"
import prisma from "../../src/client"
import {
  createProfile,
  deleteManyProfiles,
} from "../../src/services/profile_service"
import {
  createSettings,
  deleteManySettings,
} from "../../src/services/settings_service"

let profile: any
let settings: any
let server: any
let payload = { payment_day: 21 }

beforeAll(async (done) => {
  server = createServer(prisma)
  let profileDetails = {
    email: "cool_kid@looserville.com",
    balance: 20.59,
    currency: "EUR",
  }
  profile = await createProfile(prisma, profileDetails)
  settings = await createSettings(prisma, profile.id)
  done()
})

afterAll(async (done) => {
  const deleteProfiles = deleteManyProfiles(prisma)
  const deleteSettings = deleteManySettings(prisma)

  await prisma.$transaction([deleteProfiles, deleteSettings])
  await prisma.$disconnect()

  done()
})

describe("PUT /profile/:id/settings/:settings_id", () => {
  test("when the profile does not exist, it returns 404 not found", async (done) => {
    request(server)
      .put(`/profile/66/settings/${settings.id}`)
      .send(payload)
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual({ error: "Profile not found" })
        done()
      })
  })

  test("when the settings do not exist, it returns 404 not found", async (done) => {
    request(server)
      .put(`/profile/${profile.id}/settings/66`)
      .send(payload)
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual({ error: "Settings not found" })
        done()
      })
  })

  test("it updates the settings for a profile", async (done) => {
    request(server)
      .put(`/profile/${profile.id}/settings/${settings.id}`)
      .send(payload)
      .expect(200)
      .then((response) => {
        expect(response.body.data).toEqual({ payment_day: 21 })
        done()
      })
  })
})
