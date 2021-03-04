import express from "express"
import { getRepository, InsertResult } from "typeorm";
import { Transaction } from "../entity/Transaction";

const router = express.Router()

router.get("/transactions", (req: express.Request, res: express.Response, next) => {
  const transactionRepository = getRepository(Transaction)

  transactionRepository.find({})
    .then((transactions: Transaction[]) => {
      res.status(200).json(transactions)
      next()
    })
})

router.post("/transactions", (req: express.Request, res: express.Response, next) => {
  const transactionRepository = getRepository(Transaction)

  transactionRepository.save(req.body)
    .then((transaction: Transaction) => {
      res.json(transaction)
      next()
    })
})

export default router
