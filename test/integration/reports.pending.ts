import request from "supertest"
import { createServer } from "../../src/app"
import prisma from "../../src/client"
import {
  createCategory,
  deleteManyCategories,
} from "../../src/services/category_service"
import {
  createProfile,
  deleteManyProfiles,
} from "../../src/services/profile_service"
import { deleteManyTransactions } from "../../src/services/transaction_service"
import { createTransactionFactory } from "../factories/transaction"
let profile: any
let server: any

beforeAll(async (done) => {
  server = createServer(prisma)
  let profileDetails = {
    email: "cool_kid@looserville.com",
    balance: 20.59,
    currency: "EUR",
  }
  profile = await createProfile(prisma, profileDetails)
  const foodCategory = await createCategory(prisma, profile.id, {
    name: "Food",
  })
  const rentCategory = await createCategory(prisma, profile.id, {
    name: "Rent",
  })
  const salaryCategory = await createCategory(prisma, profile.id, {
    name: "Salary",
  })

  await Promise.all([
    createTransactionFactory(prisma, salaryCategory, profile, {
      createdAt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      amount: 2000,
    }),
    createTransactionFactory(prisma, rentCategory, profile, {
      createdAt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      amount: -1300,
    }),
    createTransactionFactory(prisma, foodCategory, profile, {
      createdAt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      amount: -100,
    }),
    createTransactionFactory(prisma, foodCategory, profile, {
      createdAt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      amount: -100,
    }),
    createTransactionFactory(prisma, foodCategory, profile, {
      createdAt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      amount: -100,
    }),
  ])
  done()
})

afterAll(async (done) => {
  const deleteProfiles = deleteManyProfiles(prisma)
  const deleteCategories = deleteManyCategories(prisma)
  const deleteTransactions = deleteManyTransactions(prisma)

  await prisma.$transaction([
    deleteProfiles,
    deleteCategories,
    deleteTransactions,
  ])
  await prisma.$disconnect()

  done()
})

describe("Reports", () => {
  describe("GET /profile/:id/reports/expenses_by_category", () => {
    test("", async (done) => {
      request(server)
        .get(`/profile/${profile.id}/reports/expenses_by_category`)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({
            food: 300,
            rent: 1300,
          })
          done()
        })
    })
  })

  describe("GET /profile/:id/reports/income_expenses", () => {
    test("", async (done) => {
      request(server)
        .get(`/profile/${profile.id}/reports/income_expenses`)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual([
            {
              year: new Date().getFullYear(),
              month: new Date().getMonth() + 1,
              income: 2000,
              expenses: 1600,
            },
          ])
          done()
        })
    })
  })
})
