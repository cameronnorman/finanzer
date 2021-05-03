import http from "http";
import express from "express";
import request from "supertest";

import server from "../../src/app";
import connection from "../../src/connection";
import { Transaction } from "../../src/entity/Transaction";
import { Profile } from "../../src/entity/Profile";
import { getConnection, getRepository, InsertResult } from "typeorm";

beforeAll(async (done) => {
  await connection.create();
  done();
});

afterAll(async (done) => {
  //await connection.close()
  server.close();
  done();
});

describe("GET /check", () => {
  test("it returns OK if the server is running", async (done) => {
    request(server)
      .get("/check")
      .expect(200)
      .then((response) => {
        expect(response.text).toEqual("OK");
        done();
      });
  });
});

describe("Bulk Transactions", () => {
  describe("POST /profile/:id/transactions/bulk", () => {
    let profile: Profile;

    beforeAll(async (done) => {
      let profileRepository = await getRepository(Profile);
      let transactionRepository = await getRepository(Transaction);
      let profileDetails = {
        email: "cool_kid@looserville.com",
        balance: 20.59,
        currency: "EUR",
      };
      profile = await profileRepository.save(profileDetails);

      done();
    });

    afterAll(async (done) => {
      const transactionRepository = await getRepository(Transaction);
      const transactions = await transactionRepository.find({});
      const transactionIds = transactions.map((trans) => trans.id);
      await transactionRepository.delete(transactionIds);
      done();
    });

    test("it returns a list of transactions", async (done) => {
      const transactionRepository = await getRepository(Transaction);

      request(server)
        .post(`/profile/${profile.id}/transactions/bulk`)
        .attach("file", "test/fixtures/transactions.csv")
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({
            message: "Success! 2 transaction(s) created",
          });
          done();
        });
    });

    test("after bulk process, there should be transactions", async (done) => {
      const transactionRepository = await getRepository(Transaction);
      transactionRepository.find({}).then((transactions: Transaction[]) => {
        expect(transactions.length).toEqual(2);
        done();
      });
    });
  });
});

describe("Profile view, create, update", () => {
  let lastProfile: Profile;

  beforeAll(async (done) => {
    let profileRepository = getRepository(Profile);
    let profileDetails = {
      email: "cool_kid@looserville.com",
      balance: 20.59,
      currency: "EUR",
    };
    lastProfile = await profileRepository.save(profileDetails);
    done();
  });

  describe("GET /profile/:id", () => {
    test("when the profile exists, it returns the relevant profile", async (done) => {
      request(server)
        .get(`/profile/${lastProfile.id}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({
            ...lastProfile,
            netBalance: 20.59,
          });
          done();
        });
    });

    test("when the profile exists, and it has transactions, it returns the correct net balance", async (done) => {
      let transactionRepository = getRepository(Transaction);
      let transactions = [
        {
          description: "This is a awesome purchase",
          day: new Date().getDate() + 1,
          amount: 10,
          recurring: true,
          recurringType: "monthly",
          currency: "EUR",
          profile: lastProfile,
        },
        {
          description: "This is a awesome purchase",
          day: new Date().getDate() + 1,
          amount: -5.59,
          recurring: true,
          recurringType: "monthly",
          currency: "EUR",
          profile: lastProfile,
        },
      ];

      let response = await transactionRepository.save(transactions);
      request(server)
        .get(`/profile/${lastProfile.id}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({
            id: lastProfile.id,
            email: "cool_kid@looserville.com",
            netBalance: 25.0,
            balance: 20.59,
            currency: "EUR",
          });
          done();
        });
    });

    test("when the profile does not exist, it returns a 404 not found", async (done) => {
      request(server)
        .get(`/profile/20`)
        .expect(404)
        .then((response) => {
          expect(response.body).toEqual("Profile not found");
          done();
        });
    });
  });

  describe("GET /profile/by_email/:email", () => {
    let profile: Profile;

    beforeAll(async (done) => {
      let profileRepository = getRepository(Profile);
      let profileDetails = {
        email: "cool_kid@looserville.com",
        balance: 20.59,
        currency: "EUR",
      };
      profile = await profileRepository.save(profileDetails);
      done();
    });

    test("when the profile exists, it returns the relevant profile", async (done) => {
      request(server)
        .get(`/profile/by_email/cool_kid@looserville.com`)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({
            id: 1,
            email: "cool_kid@looserville.com",
            balance: 20.59,
            netBalance: 20.59,
            currency: "EUR",
          });
          done();
        });
    });

    test("when the profile does not exist, it returns a 404 not found", async (done) => {
      request(server)
        .get(`/profile/by_email/happy_kid@coolville.com`)
        .expect(404)
        .then((response) => {
          expect(response.body).toEqual({});
          done();
        });
    });
  });

  describe("POST /profile", () => {
    test("when the data is correct, it creates a profile", async (done) => {
      let profileDetails = {
        email: "cool_kid@looserville.com",
      };

      request(server)
        .post(`/profile`)
        .expect(201)
        .send(profileDetails)
        .then((response) => {
          expect(response.body).toEqual({
            id: 4,
            email: "cool_kid@looserville.com",
            balance: 0,
            netBalance: 0,
            currency: "EUR",
          });
          done();
        });
    });
  });

  describe("PUT /profile/:id", () => {
    test("when the profile exists, it updates the profile with the new data", async (done) => {
      let updatedProfileDetails = {
        id: lastProfile.id,
        email: "cool_kid@looserville.com",
        balance: 60.39,
        currency: "EUR",
      };

      request(server)
        .put(`/profile/${lastProfile.id}`)
        .expect(200)
        .send(updatedProfileDetails)
        .then((response) => {
          expect(response.body).toEqual(updatedProfileDetails);
          done();
        });
    });

    test("when the profile exists, and there is a error with the payload, it renders the errors", async (done) => {
      let updatedProfileDetails = {
        id: lastProfile.id,
        email: "cool_kid@looserville.com",
        currency: "EUR",
      };

      request(server)
        .put(`/profile/${lastProfile.id}`)
        .expect(400)
        .send(updatedProfileDetails)
        .then((response) => {
          expect(response.body).toEqual({
            errors: [
              { location: "body", msg: "Invalid value", param: "balance" },
            ],
          });
          done();
        });
    });

    test("when the profile does not exist, it does not update the record", async (done) => {
      let updatedProfileDetails = {
        balance: 60.39,
        email: "cool_kid@looserville.com",
        currency: "EUR",
      };

      request(server)
        .put(`/profile/123`)
        .expect(404)
        .send(updatedProfileDetails)
        .then((response) => {
          expect(response.body).toEqual({ error: "Not Found" });
          done();
        });
    });
  });
});
