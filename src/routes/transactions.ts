import express from "express"
import { body, validationResult } from "express-validator"
import { getCategory } from "../services/category_service"
import { getProfile } from "../services/profile_service"
import {
  createTransaction,
  filterTransactions,
  getTransaction,
  updateTransaction,
} from "../services/transaction_service"

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

const initializeTransactionsRoutes = (prisma: any, router: express.Router) => {
  router.get(
    "/:id/transactions",
    async (req: express.Request, res: express.Response) => {
      const profileId = req.params.id
      const profile = await getProfile(prisma, profileId)
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" })
      }

      const { startDate, endDate, offset, limit } = formatInputParams(req)
      const transactions = await filterTransactions(
        prisma,
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

      const transactionDetails: any = req.body

      const profileId = req.params.id
      const profile = await getProfile(prisma, profileId)
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" })
      }

      const categoryId = transactionDetails.categoryId
      if (transactionDetails.categoryId) {
        const category = await getCategory(prisma, categoryId)
        if (!category) {
          return res.status(422).json({ error: "Category not found" })
        }
        delete transactionDetails.categoryId
      }

      const transaction = await createTransaction(
        prisma,
        profileId,
        categoryId,
        transactionDetails
      )
      res.status(200).json(transaction)
    }
  )

  router.put(
    "/:id/transactions/:transaction_id",
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

      const transactionDetails: any = req.body

      const profileId = req.params.id
      const profile = await getProfile(prisma, profileId)
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" })
      }

      const categoryId = transactionDetails.categoryId
      if (categoryId) {
        const category = await getCategory(prisma, categoryId)
        if (!category) {
          return res.status(422).json({ error: "Category not found" })
        }
        delete transactionDetails.categoryId
      }

      const transactionId = req.params.transaction_id
      const transaction = await getTransaction(prisma, transactionId)
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" })
      }

      const updatedTransaction = await updateTransaction(
        prisma,
        profileId,
        categoryId,
        transactionId,
        transactionDetails
      )
      res.status(200).json(updatedTransaction)
    }
  )

  return router
}

export default initializeTransactionsRoutes
