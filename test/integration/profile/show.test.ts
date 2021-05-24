import request from "supertest"
import server from "../../../src/app"

import {
  createProfile,
  deleteProfile,
  deleteManyProfiles,
} from "../../../src/services/profile_service"
import {
  getTransactions,
  deleteTransaction,
  deleteManyTransactions,
  createTransaction,
} from "../../../src/services/transaction_service"

import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

let profile: any
beforeAll(async (done) => {
  let profileDetails = {
    email: "cool_kid@looserville.com",
    balance: 20.59,
    currency: "EUR",
  }
  profile = await createProfile(profileDetails)
  done()
})

afterAll(async (done) => {
  server.close()

  const deleteProfiles = deleteManyProfiles()
  const deleteTransactions = deleteManyTransactions()

  await prisma.$transaction([deleteProfiles, deleteTransactions])
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
        done()
      })
  })
})
