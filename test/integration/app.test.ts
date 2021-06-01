import request from "supertest"
import { PrismaClient } from "@prisma/client"

import { createServer, startServer } from "../../src/app"

const prisma = new PrismaClient()
let server: any
beforeAll(async (done) => {
  server = createServer(prisma)
  done()
})

afterAll(async (done) => {
  await prisma.$disconnect()
  done()
})

describe("GET /check", () => {
  test("it returns OK if the server is running", async (done) => {
    request(server)
      .get("/check")
      .expect(200)
      .then((response) => {
        expect(response.text).toEqual("OK")
        done()
      })
  })
})

// describe("PUT /profile/:id", () => {
//   test("when the profile exists, it updates the profile with the new data", async (done) => {
//     let updatedProfileDetails = {
//       id: lastProfile.id,
//       email: "cool_kid@looserville.com",
//       balance: 60.39,
//       currency: "EUR",
//     }

//     request(server)
//       .put(`/profile/${lastProfile.id}`)
//       .expect(200)
//       .send(updatedProfileDetails)
//       .then((response) => {
//         expect(response.body).toEqual(updatedProfileDetails)
//         done()
//       })
//   })

// test("when the profile exists, and there is a error with the payload, it renders the errors", async (done) => {
//   let updatedProfileDetails = {
//     id: lastProfile.id,
//     email: "cool_kid@looserville.com",
//     currency: "EUR",
//   }

//   request(server)
//     .put(`/profile/${lastProfile.id}`)
//     .expect(400)
//     .send(updatedProfileDetails)
//     .then((response) => {
//       expect(response.body).toEqual({
//         errors: [
//           { location: "body", msg: "Invalid value", param: "balance" },
//         ],
//       })
//       done()
//     })
// })

// test("when the profile does not exist, it does not update the record", async (done) => {
//   let updatedProfileDetails = {
//     balance: 60.39,
//     email: "cool_kid@looserville.com",
//     currency: "EUR",
//   }

//   request(server)
//     .put(`/profile/123`)
//     .expect(404)
//     .send(updatedProfileDetails)
//     .then((response) => {
//       expect(response.body).toEqual("Profile not found")
//       done()
//     })
// })
// })
// })
