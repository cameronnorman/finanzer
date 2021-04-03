import express from "express"
import { body, validationResult } from 'express-validator';

import { getAll, create, update, destroy } from "../services/category_service"

const initializeCategoriesRoutes = (router: express.Router) => {
  router.get("/:id/categories", (req: express.Request, res: express.Response, next: any) => {
    const profileId = req.params.id

    getAll(profileId).then((categories) => {
      res.status(200).json(categories)
      next()
    })
  })

  router.post(
    "/:id/categories",
    body('name').not().isEmpty().trim().escape(),
    (req: express.Request, res: express.Response, next: any) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const profileId = req.params.id

    create(profileId, {name: req.body.name}).then((category) => {
      res.status(201).json(category)
      next()
    })
  })

  router.put(
    "/:id/categories/:category_id",
    body('name').not().isEmpty().trim().escape(),
    (req: express.Request, res: express.Response, next: any) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const categoryId = req.params.category_id

    update(categoryId, {name: req.body.name}).then((category) => {
      res.status(200).json(category)
      next()
    })
  })

  router.delete(
    "/:id/categories/:category_id",
    (req: express.Request, res: express.Response, next: any) => {

    const categoryId = req.params.category_id

    destroy(categoryId).then(() => {
      res.status(200).json({message: "Category successfully deleted"})
      next()
    })
  })

  return router
}

export default initializeCategoriesRoutes
