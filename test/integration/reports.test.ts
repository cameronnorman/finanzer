import http from "http"
import express from "express"
import request from "supertest"
import { getRepository } from "typeorm"

import server from "../../src/app"
import connection from "../../src/connection"
import { Transaction } from "../../src/entity/Transaction"
import { Profile } from "../../src/entity/Profile"
import { createCategory } from "../factories/category"
import { Category } from "../../src/entity/Category"
import { createTransaction } from "../factories/transaction"

beforeAll(async (done) => {
  await connection.create()
  done()
})

afterAll(async (done) => {
  //await connection.close()
  server.close()
  done()
})

describe("Reports", () => {
  let profile: Profile
  let category: Category
  let transactions: Transaction[]

  const getMonth = () => {
    const month = new Date().getMonth()
    return month
  }

  beforeAll(async (done) => {
    const profileRepository = await getRepository(Profile)
    const profileDetails = {
      email: "cool_kid@looserville.com",
      balance: 20.59,
      currency: "EUR",
    }
    profile = await profileRepository.save(profileDetails)
    const foodCategory = await createCategory("Food", profile)
    const rentCategory = await createCategory("Rent", profile)
    const salaryCategory = await createCategory("Salary", profile)

    transactions = await Promise.all([
      createTransaction(salaryCategory, profile, {
        created: new Date(new Date().getFullYear(), getMonth(), 1),
        amount: 2000,
      }),
      createTransaction(rentCategory, profile, {
        created: new Date(new Date().getFullYear(), getMonth(), 1),
        amount: -1300,
      }),
      createTransaction(foodCategory, profile, {
        created: new Date(new Date().getFullYear(), getMonth(), 1),
        amount: -100,
      }),
      createTransaction(foodCategory, profile, {
        created: new Date(new Date().getFullYear(), getMonth(), 1),
        amount: -100,
      }),
      createTransaction(foodCategory, profile, {
        created: new Date(new Date().getFullYear(), getMonth(), 1),
        amount: -100,
      }),
    ])

    done()
  })

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
              month: getMonth() + 1,
              income: 2000,
              expenses: 1600,
            },
          ])
          done()
        })
    })
  })
})
