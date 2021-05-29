import express from "express"
import { body, validationResult } from "express-validator"
import { getProfile } from "../services/profile_service"

import {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  destroyCategory,
} from "../services/category_service"

const initializeCategoriesRoutes = (prisma: any, router: express.Router) => {
  router.get(
    "/:id/categories",
    async (req: express.Request, res: express.Response) => {
      const profileId = req.params.id
      const profile = await getProfile(prisma, profileId)
      if (!profile) {
        return res.status(404).json("Profile not found")
      }

      try {
        const categories = await getAllCategories(prisma, profileId)
        res.status(200).json(categories)
      } catch (error) {
        res.status(404).json(error.message)
      }
    }
  )

  router.post(
    "/:id/categories",
    body("name").not().isEmpty().trim().escape(),
    async (req: express.Request, res: express.Response) => {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const profileId = req.params.id

      try {
        const category = await createCategory(prisma, profileId, {
          name: req.body.name,
        })
        return res.status(201).json(category)
      } catch (e) {
        return res
          .status(422)
          .json({ error: "Unable to create category. Category already exists" })
      }
    }
  )

  router.put(
    "/:id/categories/:category_id",
    body("name").not().isEmpty().trim().escape(),
    async (req: express.Request, res: express.Response, next: any) => {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const categoryId = req.params.category_id

      try {
        const category = await updateCategory(prisma, categoryId, {
          name: req.body.name,
        })
        res.status(200).json(category)
      } catch (error) {
        next()
      }
    }
  )

  router.delete(
    "/:id/categories/:category_id",
    async (req: express.Request, res: express.Response, next: any) => {
      const categoryId = req.params.category_id
      const category = await getCategory(prisma, categoryId)
      if (!category) {
        return res.status(404).json({ message: "Category not found" })
      }

      await destroyCategory(prisma, categoryId)
      res.status(200).json({ message: "Category successfully deleted" })
    }
  )

  return router
}

export default initializeCategoriesRoutes
