import request from "supertest"
import { createServer } from "../../../src/app"
import prisma from "../../../src/client"
import {
  createProfile,
  deleteManyProfiles,
} from "../../../src/services/profile_service"
import {
  createSettings,
  deleteManySettings,
} from "../../../src/services/settings_service"
import {
  createTransaction,
  deleteManyTransactions,
} from "../../../src/services/transaction_service"

let server: any
let profile: any
let settings: any
beforeAll(async (done) => {
  server = createServer(prisma)
  let profileDetails = {
    email: "cool_kid@looserville.com",
    balance: 20.59,
    currency: "EUR",
  }
  profile = await createProfile(prisma, profileDetails)
  settings = await createSettings(prisma, profile.id)

  let transactions = [
    {
      description: "This is a awesome purchase",
      day: new Date().getDate() + 1,
      amount: 10,
      recurring: true,
      recurringType: "monthly",
      currency: "EUR",
      Profile: {
        connect: { id: profile.id },
      },
    },
    {
      description: "This is a awesome purchase",
      day: new Date().getDate() + 1,
      amount: -5.59,
      recurring: true,
      recurringType: "monthly",
      currency: "EUR",
      Profile: {
        connect: { id: profile.id },
      },
    },
  ]

  transactions.map(async (transaction) => {
    await createTransaction(prisma, profile.id, null, transaction)
  })

  done()
})

afterAll(async (done) => {
  const deleteProfiles = deleteManyProfiles(prisma)
  const deleteTransactions = deleteManyTransactions(prisma)
  const deleteSettings = deleteManySettings(prisma)

  await prisma.$transaction([
    deleteProfiles,
    deleteTransactions,
    deleteSettings,
  ])
  await prisma.$disconnect()

  done()
})

describe("GET /profile/:id", () => {
  test("when the profile exists, it returns the relevant profile", async (done) => {
    request(server)
      .get(`/profile/${profile.id}`)
      .expect(200)
      .then((response) => {
        expect(response.body.email).toEqual("cool_kid@looserville.com")
        expect(response.body.balance).toEqual(20.59)
        expect(response.body.currency).toEqual("EUR")
        expect(response.body.settings.data).toEqual({ payment_day: 28 })
        done()
      })
  })
})

describe("Profile view, create, update", () => {
  test("when the profile exists, and it has transactions, it returns the correct net balance", async (done) => {
    request(server)
      .get(`/profile/${profile.id}`)
      .expect(200)
      .then((response) => {
        expect(response.body.netBalance).toEqual(25.0)
        done()
      })
  })

  test("when the profile does not exist, it returns a 404 not found", async (done) => {
    request(server)
      .get(`/profile/20`)
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual("Profile not found")
        done()
      })
  })
})

describe("GET /profile/by_email/:email", () => {
  test("when the profile exists, it returns the relevant profile", async (done) => {
    request(server)
      .get(`/profile/by_email/cool_kid@looserville.com`)
      .expect(200)
      .then((response) => {
        expect(response.body.id).toEqual(profile.id)
        done()
      })
  })

  test("when the profile does not exist, it returns a 404 not found", async (done) => {
    request(server)
      .get(`/profile/by_email/happy_kid@coolville.com`)
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual("Profile not found")
        done()
      })
  })
})
