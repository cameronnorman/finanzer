import request from "supertest"
import { createServer } from "../../src/app"
import prisma from "../../src/client"
import {
  createProfile,
  deleteManyProfiles
} from "../../src/services/profile_service"
import {
  deleteManyTransactions,
  getTransactions
} from "../../src/services/transaction_service"

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
  const deleteTransactions = deleteManyTransactions(prisma)

  await prisma.$transaction([deleteProfiles, deleteTransactions])
  await prisma.$disconnect()

  done()
})

describe("Bulk Transactions", () => {
  describe("POST /profile/:id/transactions/bulk", () => {
    test("it returns a list of transactions", async (done) => {
      request(server)
        .post(`/profile/${profile.id}/transactions/bulk`)
        .attach("file", "test/fixtures/transactions.csv")
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({
            message: "Success! 2 transaction(s) created",
          })
          done()
        })
    })

    test("after bulk process, there should be transactions", async (done) => {
      const transactions = await getTransactions(prisma)
      expect(transactions.length).toEqual(2)
      done()
    })
  })
})
