import express from "express"
import { body, validationResult } from "express-validator"

import {
  filterTransactions,
  createTransaction,
} from "../services/transaction_service"
import { getProfile } from "../services/profile_service"
import { getCategory } from "../services/category_service"

const formatInputParams = (req: express.Request) => {
  const today: Date = new Date()
  const limit: number = Number(req.query.per_page) || 10
  const offset: number = Number(req.query.page) - 1 || 0
  let startDate: string = `${today.getFullYear()}-01-01`
  let endDate: string = `${today.getFullYear()}-12-31`

  if (req.query.start_date && req.query.end_date) {
    startDate = String(req.query.start_date)
    endDate = String(req.query.end_date)
  }

  return { startDate, endDate, offset, limit }
}

const initializeTransactionsRoutes = (router: express.Router) => {
  router.get(
    "/:id/transactions",
    async (req: express.Request, res: express.Response) => {
      const profileId = req.params.id
      const profile = await getProfile(profileId)
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" })
      }

      const { startDate, endDate, offset, limit } = formatInputParams(req)
      const transactions = await filterTransactions(
        profile.id,
        startDate,
        endDate,
        offset,
        limit
      )
      return res.status(200).json(transactions)
    }
  )

  router.post(
    "/:id/transactions",
    body("description").not().isEmpty().trim().escape(),
    body("amount").not().isEmpty(),
    body("recurring").optional(),
    body("recurringType").optional(),
    body("day").optional(),
    body("currency").isIn(["EUR", "ZAR", "USD"]).optional(),
    async (req: express.Request, res: express.Response, next: any) => {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const profileId = req.params.id
      const profile = await getProfile(profileId)
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" })
      }

      const transactionDetails: any = req.body
      const category = await getCategory(transactionDetails.categoryId)
      if (!category) {
        return res.status(422).json({ error: "Category not found" })
      }

      transactionDetails.profileId = profileId
      const transaction = await createTransaction(transactionDetails)
      res.status(200).json(transaction)
    }
  )

  return router
}

export default initializeTransactionsRoutes
