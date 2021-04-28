import express from "express"
import { body, validationResult } from 'express-validator';
import { getRepository, createQueryBuilder } from "typeorm"

import { Profile } from "../entity/Profile"
import { Transaction } from "../entity/Transaction"
import { Category } from "../entity/Category";

import { filterTransactions } from '../services/transaction_service'

const initializeTransactionsRoutes = (router: express.Router) => {
  router.get("/:id/transactions", (req: express.Request, res: express.Response, next: any) => {
    const profileId = req.params.id
    const profileRepository = getRepository(Profile)
    profileRepository.findOne({ where: { id: profileId }, relations: ["transactions"] })
      .then((profile: Profile) => {
        if (profile) {
          const today: Date = new Date()
          const limit: number = Number(req.query.per_page) || 10
          const offset: number = (Number(req.query.page) - 1) || 0
          let startDate: string = `${today.getFullYear()}-01-01`
          let endDate: string = `${today.getFullYear()}-12-31`

          if (req.query.start_date && req.query.end_date) {
            startDate = String(req.query.start_date)
            endDate = String(req.query.end_date)
          }

          filterTransactions(profile.id, startDate, endDate, offset, limit)
            .then((transactions: Transaction[]) => {
              res.status(200).json(transactions)
              next()
            })
        } else {
          res.status(404).json({error: "Not Found"})
          next()
        }
      })
  })

  router.post(
    "/:id/transactions",
    body('description').not().isEmpty().trim().escape(),
    body('amount').not().isEmpty(),
    body('recurring').not().isEmpty(),
    body('recurringType').not().isEmpty(),
    body('day').not().isEmpty(),
    body('currency').isIn(["EUR", "ZAR", "USD"]).not().isEmpty(),
    (req: express.Request, res: express.Response, next: any) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const profileId = req.params.id
      const profileRepository = getRepository(Profile)
      const categoryRepository = getRepository(Category)
      const transactionRepository = getRepository(Transaction)
      const transactionDetails: any = req.body

      profileRepository.findOne({ where: { id: profileId } })
        .then((profile: Profile) => {
          if (profile) {
            categoryRepository.findOne({ where: { id: transactionDetails.categoryId } })
              .then((category: Category) => {
                transactionDetails.profile = profile
                transactionDetails.category = category
                transactionRepository.save(transactionDetails)
                  .then((transaction: Transaction) => {
                    res.status(200).json(transaction)
                    next()
                  })
                })
          } else {
            res.status(404).json({error: "Not Found"})
            next()
          }
      })
  })

  return router
}

export default initializeTransactionsRoutes
