import request from "supertest"
import { createServer } from "../../src/app"
import prisma from "../../src/client"
import { createCategory } from "../../src/services/category_service"
import {
  createProfile,
  deleteManyProfiles
} from "../../src/services/profile_service"
import {
  deleteManyTransactions,
  getTransactions
} from "../../src/services/transaction_service"
import { createTransactionFactory } from "../factories/transaction"
let server: any
let transactions: any
let category: any
let profile: any

beforeAll(async (done) => {
  server = createServer(prisma)
  let profileDetails = {
    email: "cool_kid@looserville.com",
    balance: 20.59,
    currency: "EUR",
  }
  profile = await createProfile(prisma, profileDetails)
  category = await createCategory(prisma, profile.id, { name: "Category 1" })
  transactions = await Promise.all([
    createTransactionFactory(prisma, category, profile, {
      createdAt: new Date(`${new Date().getFullYear()}-01-01`),
    }),
    createTransactionFactory(prisma, category, profile, {
      createdAt: new Date(`${new Date().getFullYear()}-01-02`),
    }),
    createTransactionFactory(prisma, category, profile, {
      createdAt: new Date(`${new Date().getFullYear()}-02-01`),
    }),
    createTransactionFactory(prisma, category, profile, {
      createdAt: new Date(`${new Date().getFullYear()}-02-02`),
    }),
  ])
  done()
})

afterAll(async (done) => {
  const deleteProfiles = deleteManyProfiles(prisma)
  const deleteTransactions = deleteManyTransactions(prisma)

  await prisma.$transaction([deleteProfiles, deleteTransactions])
  await prisma.$disconnect()

  done()
})

describe("Profile Transactions", () => {
  describe("GET /profile/:id/transactions", () => {
    test("when no pagination provided, it returns a list of max. 10 transactions", async (done) => {
      request(server)
        .get(`/profile/${profile.id}/transactions`)
        .expect(200)
        .then((response) => {
          expect(response.body.length).toEqual(4)
          expect(response.body[0].Category.id).toEqual(category.id)
          done()
        })
    })

    test("when pagination exitst, it returns a list of paginated transactions", async (done) => {
      request(server)
        .get(`/profile/${profile.id}/transactions?page=1&per_page=1`)
        .expect(200)
        .then((response) => {
          expect(response.body.length).toEqual(1)
          expect(response.body[0].id).toEqual(transactions[3].id)
          done()
        })
    })

    test("when date ranges exist", async (done) => {
      request(server)
        .get(
          `/profile/${
            profile.id
          }/transactions?start_date=${new Date().getFullYear()}-01-01&end_date=${new Date().getFullYear()}-01-31`
        )
        .expect(200)
        .then((response) => {
          expect(response.body.length).toEqual(2)
          expect(response.body[0].id).toEqual(transactions[1].id)
          done()
        })
    })
  })

  describe("POST /profile/:id/transactions", () => {
    test("when a required parameter is not specified, it does not create a transaction", async (done) => {
      let payload: any = {
        amount: 10,
        day: 2,
        recurring: true,
        recurringType: "monthly",
        currency: "EUR",
        categoryId: category.id,
      }
      request(server)
        .post(`/profile/${profile.id}/transactions`)
        .send(payload)
        .expect(400)
        .then(async (response) => {
          expect(response.body).toEqual({
            errors: [
              { location: "body", msg: "Invalid value", param: "description" },
            ],
          })
          done()
        })
    })

    test("when a required parameter is null, it does not create a transaction", async (done) => {
      let payload: any = {
        amount: 10,
        description: null,
        day: 2,
        recurring: true,
        recurringType: "monthly",
        currency: "EUR",
        categoryId: category.id,
      }
      request(server)
        .post(`/profile/${profile.id}/transactions`)
        .send(payload)
        .expect(400)
        .then(async (response) => {
          expect(response.body).toEqual({
            errors: [
              {
                location: "body",
                msg: "Invalid value",
                param: "description",
                value: null,
              },
            ],
          })
          done()
        })
    })

    test("it creates a transaction", async (done) => {
      let payload: any = {
        amount: 10,
        description: "This is a awesome purchase",
        day: 2,
        recurring: true,
        recurringType: "monthly",
        currency: "EUR",
        categoryId: category.id,
      }
      request(server)
        .post(`/profile/${profile.id}/transactions`)
        .send(payload)
        .expect(200)
        .then(async (response) => {
          let latestTransactions: any = await getTransactions(prisma)
          let lastTransaction: any = latestTransactions[0]

          expect(response.body.id).toEqual(lastTransaction.id)
          expect(response.body.categoryId).toEqual(category.id)
          expect(response.body.profileId).toEqual(profile.id)
          done()
        })
    })
  })
})
