import http from "http"
import express from "express"
import request from "supertest"
import { getConnection, getRepository, InsertResult } from "typeorm"

import server from "../../src/app"
import connection from "../../src/connection"
import { Category } from "../../src/entity/Category"
import { Profile } from "../../src/entity/Profile"
import { createCategory } from "../factories/category"

beforeAll(async (done) => {
  await connection.create()
  done()
})

afterAll(async (done) => {
  //await connection.close()
  server.close()
  done()
})

describe("Category Management", () => {
  let profile: Profile
  let category: Category

  beforeAll(async (done) => {
    let profileRepository = await getRepository(Profile)
    let profileDetails = {
      balance: 20.59,
      email: "cool_kid@looserville.com",
      currency: "EUR",
    }
    profile = await profileRepository.save(profileDetails)
    category = await createCategory("Category 1", profile)
    done()
  })

  afterAll(async (done) => {
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
          expect(response.body).toEqual([
            {
              id: category.id,
              name: "Category 1",
            },
          ])
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
          expect(response.body).toEqual({
            id: category.id,
            name: "deadly category",
          })
          done()
        })
    })
  })

  describe("DELETE /profile/:id/categories", () => {
    test("deletes a category", async (done) => {
      const newCategory = await createCategory(
        "Category To Be Deleted",
        profile
      )

      request(server)
        .delete(`/profile/${profile.id}/categories/${newCategory.id}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({
            message: "Category successfully deleted",
          })
          done()
        })
    })
  })
})
