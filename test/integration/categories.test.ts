import request from "supertest"
import { createServer } from "../../src/app"
import prisma from "../../src/client"
import {
  createCategory,
  deleteManyCategories
} from "../../src/services/category_service"
import {
  createProfile,
  deleteManyProfiles
} from "../../src/services/profile_service"

let profile: any
let category: any
let server: any

beforeAll(async (done) => {
  server = createServer(prisma)
  let profileDetails = {
    email: "cool_kid@looserville.com",
    balance: 20.59,
    currency: "EUR",
  }
  profile = await createProfile(prisma, profileDetails)
  category = await createCategory(prisma, profile.id, { name: "Category 1" })
  done()
})

afterAll(async (done) => {
  const deleteProfiles = deleteManyProfiles(prisma)
  const deleteCategories = deleteManyCategories(prisma)

  await prisma.$transaction([deleteProfiles, deleteCategories])
  await prisma.$disconnect()

  done()
})

describe("GET /profile/:id/categories", () => {
  test("when the profile does not exist, it returns 404 not found", async (done) => {
    request(server)
      .get(`/profile/66/categories`)
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual("Profile not found")
        done()
      })
  })

  test("it returns categories belonging to that profile", async (done) => {
    request(server)
      .get(`/profile/${profile.id}/categories`)
      .expect(200)
      .then((response) => {
        expect(response.body[0].id).toEqual(category.id)
        expect(response.body[0].profileId).toEqual(profile.id)
        expect(response.body[0].name).toEqual("Category 1")
        done()
      })
  })
})

describe("POST /profile/:id/categories", () => {
  test("creates a category", async (done) => {
    const payload: object = {
      name: "cool category",
    }

    request(server)
      .post(`/profile/${profile.id}/categories`)
      .send(payload)
      .expect(201)
      .then((response) => {
        expect(response.body.name).toEqual("cool category")
        done()
      })
  })
})

describe("PUT /profile/:id/categories/:category_id", () => {
  test("updates a category", async (done) => {
    const payload: any = {
      name: "deadly category",
    }

    request(server)
      .put(`/profile/${profile.id}/categories/${category.id}`)
      .send(payload)
      .expect(200)
      .then((response) => {
        expect(response.body.name).toEqual("deadly category")
        done()
      })
  })
})

describe("DELETE /profile/:id/categories", () => {
  test("deletes a category", async (done) => {
    request(server)
      .delete(`/profile/${profile.id}/categories/${category.id}`)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({
          message: "Category successfully deleted",
        })
        done()
      })
  })
})
