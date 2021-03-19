import express from "express"
import multer from "multer"
import * as fs from 'fs';
import csv from 'csv-parser';

import { getRepository, UpdateResult } from "typeorm"
import { Profile } from "../entity/Profile"
import { Transaction } from "../entity/Transaction"
import { body, validationResult } from 'express-validator';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const initializeBulkTransactionRoutes = (router: express.Router) => {
  router.post("/:id/transactions/bulk", upload.single('file'), async (req: express.Request, res: express.Response, next) => {
    const profileId = req.params.id
    const profileRepository = getRepository(Profile)
    const profile = await profileRepository.findOne({ where: { id: profileId } })
    if (profile === undefined) {
      return res.status(404).json({error: "Not Found"})
    }

    const file = req.file
    if (!file) {
      return res.status(400).json({error: "No file attached. Please upload file"})
    }

    const transactionRepository = getRepository(Transaction)
    const transactions: Transaction[] = []

    fs.createReadStream(file.path)
      .pipe(csv())
      .on('error', (error: any) => { return res.status(400).json({error}) })
      .on('data', async (row: any) => {
        let amount = row["Amount (EUR)"]
        amount = parseFloat(amount)

        const transactionDetails = transactionRepository.create({
          description: row.Payee,
          amount,
          recurring: false,
          recurringType: "monthly",
          day: (new Date(row.Date).getDate()),
          currency: "euros",
        })

        transactionDetails.profile = profile
        transactions.push(transactionDetails)
      })
      .on('end', () => {
        transactionRepository.save(transactions).then(() => {
          res.status(200).json({message: `Success! ${transactions.length} transaction(s) created`})
        })
      });
  })

  return router
}

export default initializeBulkTransactionRoutes
