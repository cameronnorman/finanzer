import express from "express"
import { getRepository, InsertResult } from "typeorm";
import { Transaction } from "../entity/Transaction";
import { body, validationResult } from 'express-validator';

const router = express.Router()

router.get("/transactions", (req: express.Request, res: express.Response, next) => {
  const transactionRepository = getRepository(Transaction)

  transactionRepository.find({})
    .then((transactions: Transaction[]) => {
      return res.status(200).json(transactions)
    })
})

router.post(
  "/transactions",
  body('description').not().isEmpty().trim().escape(),
  body('amount').not().isEmpty(),
  body('recurring').not().isEmpty(),
  body('recurringType').not().isEmpty(),
  body('day').not().isEmpty(),
  body('currency').not().isEmpty(),
  (req: express.Request, res: express.Response, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transactionRepository = getRepository(Transaction)
    transactionRepository.save(req.body)
      .then((transaction: Transaction) => {
        return res.json(transaction)
      })
})

export default router
