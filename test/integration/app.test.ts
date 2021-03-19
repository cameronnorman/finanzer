import http from "http";
import express from "express";
import request from "supertest";

import server from "../../src/app";
import connection from "../../src/connection"
import { Transaction } from "../../src/entity/Transaction";
import { Profile } from "../../src/entity/Profile";
import { getConnection, getRepository, InsertResult } from "typeorm";

beforeAll(async (done) => {
  await connection.create()
  done()
});

afterAll(async (done) => {
  //await connection.close()
  server.close()
  done()
});

describe('GET /check', () => {
  test('it returns OK if the server is running', async (done) => {
    request(server)
      .get('/check')
      .expect(200)
      .then((response) => {
        expect(response.text).toEqual("OK")
        done()
      })
  })
});

describe('Bulk Transactions', () => {
  describe('POST /profile/:id/transactions/bulk', () => {
    let profile: Profile

    beforeAll(async (done) => {
      let profileRepository = await getRepository(Profile)
      let transactionRepository = await getRepository(Transaction)
      let profileDetails = {
        balance: 20.59,
        currency: "euros"
      }
      profile = await profileRepository.save(profileDetails)

      done()
    });

    afterAll(async (done) => {
      const transactionRepository = await getRepository(Transaction)
      const transactions = await transactionRepository.find({})
      const transactionIds = transactions.map((trans) => trans.id)
      await transactionRepository.delete(transactionIds)
      done()
    });

    test('it returns a list of transactions', async (done) => {
      const transactionRepository = await getRepository(Transaction)

      request(server)
        .post(`/profile/${profile.id}/transactions/bulk`)
        .attach('file', 'test/fixtures/transactions.csv')
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({"message": "Success! 2 transaction(s) created"})
          done()
        })
    })

    test('after bulk process, there should be transactions', async (done) => {
      const transactionRepository = await getRepository(Transaction)
      transactionRepository.find({})
        .then((transactions: Transaction[]) => {
          expect(transactions.length).toEqual(2)
          done()
        })
    })
  })
})

describe('Profile Transactions', () => {
  let profile: Profile
  let transaction: Transaction

  beforeAll(async (done) => {
    let profileRepository = await getRepository(Profile)
    let transactionRepository = await getRepository(Transaction)
    let profileDetails = {
      balance: 20.59,
      currency: "euros"
    }
    profile = await profileRepository.save(profileDetails)

    let transactionDetails: any = {
      amount: 10,
      day: 2,
      recurring: true,
      description: "This is a expensive transaction",
      recurringType: "monthly",
      currency: "euros",
    }
    transactionDetails.profile = profile
    transaction = await transactionRepository.save(transactionDetails)

    done()
  });

  describe('GET /profile/:id/transactions', () => {
    test('it returns a list of transactions', async (done) => {
      let transactions: Transaction[] = await getRepository(Transaction).find({
        order: {
          id: 'ASC'
        },
      })

      request(server)
        .get(`/profile/${profile.id}/transactions`)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual([{
            id: transaction.id,
            amount: 10,
            day: 2,
            recurring: true,
            description: "This is a expensive transaction",
            recurringType: "monthly",
            currency: "euros",
          }])
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
        currency: "euros"
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
        currency: "euros"
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
        currency: "euros"
      }
      let profileRepository = getRepository(Profile)
      let profile = await profileRepository.save(profileDetails)

      let payload: any = {
        amount: 10,
        description: "This is a awesome purchase",
        day: 2,
        recurring: true,
        recurringType: "monthly",
        currency: "euros"
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
              balance: 20.59,
              currency: "euros",
            },
            description: "This is a awesome purchase",
            day: 2,
            amount: 10,
            recurring: true,
            recurringType: "monthly",
            currency: "euros"
          })
          done()
        })
    })
  });
})

describe('Profile viewing and updates', () => {
  let lastProfile: Profile

  beforeAll(async (done) => {
    let profileRepository = getRepository(Profile)
    let profileDetails = {
      balance: 20.59,
      currency: "euros"
    }
    lastProfile = await profileRepository.save(profileDetails)
    done()
  });

  describe('GET /profile/:id', () => {
    test('when the profile exists, it returns the relevant profile', async (done) => {
      request(server)
        .get(`/profile/${lastProfile.id}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(lastProfile)
          done()
        })
    })
  });

  describe('GET /profile/:id', () => {
    test('when the profile does not exist, it returns a 404 not found', async (done) => {
      request(server)
        .get(`/profile/20`)
        .expect(404)
        .then((response) => {
          expect(response.body).toEqual({})
          done()
        })
    })
  });

  describe('PUT /profile/:id', () => {
    test('when the profile exists, it updates the profile with the new data', async (done) => {
      let updatedProfileDetails = {
        id: lastProfile.id,
        balance: 60.39,
        currency: "euros"
      }

      request(server)
        .put(`/profile/${lastProfile.id}`)
        .expect(200)
        .send(updatedProfileDetails)
        .then((response) => {
          expect(response.body).toEqual(updatedProfileDetails)
          done()
        })
    })

    test('when the profile exists, and there is a error with the payload, it renders the errors', async (done) => {
      let updatedProfileDetails = {
        id: lastProfile.id,
        currency: "euros"
      }

      request(server)
        .put(`/profile/${lastProfile.id}`)
        .expect(400)
        .send(updatedProfileDetails)
        .then((response) => {
          expect(response.body).toEqual({
            "errors": [{"location": "body", "msg": "Invalid value", "param": "balance"}]
          })
          done()
        })
    })

    test('when the profile does not exist, it does not update the record', async (done) => {
      let updatedProfileDetails = {
        balance: 60.39,
        currency: "euros"
      }

      request(server)
        .put(`/profile/123`)
        .expect(404)
        .send(updatedProfileDetails)
        .then((response) => {
          expect(response.body).toEqual({error: "Not Found"})
          done()
        })
    })
  });
})
