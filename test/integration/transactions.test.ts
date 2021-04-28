import http from "http";
import express from "express";
import request from "supertest";
import { getRepository } from "typeorm";

import server from "../../src/app";
import connection from "../../src/connection"
import { Transaction } from "../../src/entity/Transaction";
import { Profile } from "../../src/entity/Profile";
import { createCategory } from "../factories/category";
import { Category } from "../../src/entity/Category";
import { createTransaction } from "../factories/transaction";

beforeAll(async (done) => {
  await connection.create()
  done()
});

afterAll(async (done) => {
  //await connection.close()
  server.close()
  done()
});

describe('Profile Transactions', () => {
  let profile: Profile
  let category: Category
  let transactions: Transaction[]

  beforeAll(async (done) => {
    let profileRepository = await getRepository(Profile)
    let transactionRepository = await getRepository(Transaction)
    let profileDetails = {
      email: "cool_kid@looserville.com",
      balance: 20.59,
      currency: "EUR"
    }
    profile = await profileRepository.save(profileDetails)
    category = await createCategory("Category 1", profile)

    transactions = await Promise.all([
      await createTransaction(category, profile, {created: new Date(`${new Date().getFullYear()}-01-01`)}),
      await createTransaction(category, profile, {created: new Date(`${new Date().getFullYear()}-01-01`)}),
      await createTransaction(category, profile, {created: new Date(`${new Date().getFullYear()}-02-01`)}),
      await createTransaction(category, profile, {created: new Date(`${new Date().getFullYear()}-02-01`)})
    ])

    done()
  });

  describe('GET /profile/:id/transactions', () => {
    test('when no pagination provided, it returns a list of max. 10 transactions', async (done) => {
      request(server)
        .get(`/profile/${profile.id}/transactions`)
        .expect(200)
        .then((response) => {
          expect(response.body.length).toEqual(4)
          expect(response.body[0].category.id).toEqual(category.id)
          done()
        })
    })

    test('when pagination exitst, it returns a list of paginated transactions', async (done) => {
      request(server)
        .get(`/profile/${profile.id}/transactions?page=1&per_page=1`)
        .expect(200)
        .then((response) => {
          expect(response.body.length).toEqual(1)
          expect(response.body[0].id).toEqual(5)
          done()
        })
    })

    test('when date ranges exist', async (done) => {
      request(server)
        .get(`/profile/${profile.id}/transactions?start_date=${new Date().getFullYear()}-01-01&end_date=${new Date().getFullYear()}-01-31`)
        .expect(200)
        .then((response) => {
          expect(response.body.length).toEqual(2)
          expect(response.body[0].id).toEqual(5)
          done()
        })
    })
  });

  describe('POST /profile/:id/transactions', () => {
    test('when a required parameter is not specified, it does not create a transaction', async (done) => {
      let payload: any = {
        amount: 10,
        day: 2,
        recurring: true,
        recurringType: "monthly",
        currency: "EUR",
        categoryId: category.id
      }

      request(server)
        .post(`/profile/${profile.id}/transactions`)
        .send(payload)
        .expect(400)
        .then(async (response) => {
          expect(response.body).toEqual({
            "errors": [
              {"location": "body", "msg": "Invalid value", "param": "description"}
            ]})
          done()
        })
    })

    test('when a required parameter is null, it does not create a transaction', async (done) => {
      let payload: any = {
        amount: 10,
        description: null,
        day: 2,
        recurring: true,
        recurringType: "monthly",
        currency: "EUR",
        categoryId: category.id
      }

      request(server)
        .post(`/profile/${profile.id}/transactions`)
        .send(payload)
        .expect(400)
        .then(async (response) => {
          expect(response.body).toEqual({
            "errors": [
              {"location": "body", "msg": "Invalid value", "param": "description", "value": null}
            ]})
          done()
        })
    })

    test('it creates a transaction', async (done) => {
      let profileDetails = {
        balance: 20.59,
        email: "cool_kid@looserville.com",
        currency: "EUR"
      }
      let profileRepository = getRepository(Profile)
      let profile = await profileRepository.save(profileDetails)

      let payload: any = {
        amount: 10,
        description: "This is a awesome purchase",
        day: 2,
        recurring: true,
        recurringType: "monthly",
        currency: "EUR",
        categoryId: category.id
      }

      request(server)
        .post(`/profile/${profile.id}/transactions`)
        .send(payload)
        .expect(200)
        .then(async (response) => {
          let lastTransactionQuery: Transaction[] = await getRepository(Transaction).find({
            order: {
              id: 'DESC'
            },
            take: 1
          })
          let lastTransaction: Transaction = lastTransactionQuery[0]

          expect(response.body).toEqual({
            id: lastTransaction.id,
            profile: {
              id: profile.id,
              email: "cool_kid@looserville.com",
              balance: 20.59,
              currency: "EUR",
            },
            categoryId: category.id,
            category: {
              id: category.id,
              name: "Category 1"
            },
            description: "This is a awesome purchase",
            day: 2,
            amount: 10,
            recurring: true,
            recurringType: "monthly",
            currency: "EUR",
            created: lastTransaction.created.toISOString(),
            updated: lastTransaction.updated.toISOString()
          })
          done()
        })
    })
  });
})

