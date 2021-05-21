import express from "express"
import { body, validationResult } from "express-validator"

import {
  getAll,
  getCategory,
  create,
  update,
  destroy,
} from "../services/category_service"

const initializeCategoriesRoutes = (router: express.Router) => {
  router.get(
    "/:id/categories",
    (req: express.Request, res: express.Response, next: any) => {
      const profileId = req.params.id

      getAll(profileId)
        .then((categories) => {
          res.status(200).json(categories)
          next()
        })
        .catch((error) => {
          res.status(404).json(error.message)
        })
    }
  )

  router.post(
    "/:id/categories",
    body("name").not().isEmpty().trim().escape(),
    async (req: express.Request, res: express.Response, next: any) => {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const profileId = req.params.id

      try {
        const category = await create(profileId, { name: req.body.name })
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
    (req: express.Request, res: express.Response, next: any) => {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const categoryId = req.params.category_id

      update(categoryId, { name: req.body.name }).then((category) => {
        res.status(200).json(category)
        next()
      })
    }
  )

  router.delete(
    "/:id/categories/:category_id",
    async (req: express.Request, res: express.Response, next: any) => {
      const categoryId = req.params.category_id
      const category = await getCategory(categoryId)
      if (!category) {
        return res.status(404).json({ message: "Category not found" })
      }

      await destroy(categoryId)
      res.status(200).json({ message: "Category successfully deleted" })
    }
  )

  return router
}

export default initializeCategoriesRoutes
