import http from "http";
import express from "express";
import supertest from "supertest";

import server from "../../src/app";
import connection from "../../src/connection"
import { Transaction } from "../../src/entity/Transaction";
import { getRepository, InsertResult } from "typeorm";

beforeAll(async (done) => {
  await connection.create()
  done()
});

afterAll(async (done) => {
  server.close()
  await connection.close()
  done()
});


describe('GET /transactions', () => {
  test('it returns a list of transactions', async (done) => {
    let transactions: Transaction[] = await getRepository(Transaction).find({
      order: {
        id: 'ASC'
      },
    })

    supertest(server)
      .get('/transactions')
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(transactions)
        done()
      })
  })
});

describe('POST /transactions', () => {
  test('it creates a transaction', async (done) => {
    let payload: any = {
      amount: 10,
      description: "test transaction",
      day: 2,
      recurring: true,
      recurring_type: true,
      currency: "euros"
    }

    supertest(server)
      .post('/transactions')
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
          description: "test transaction",
          day: 2,
          amount: 10,
          recurring: true,
          recurring_type: true,
          currency: "euros"
        })
        done()
      })
  })
});
