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
    supertest(server)
      .get('/transactions')
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual([])
        done()
      })
  })
});
