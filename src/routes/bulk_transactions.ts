import csv from "csv-parser"
import express from "express"
import * as fs from "fs"
import multer from "multer"
import { getProfile } from "../services/profile_service"
import { bulkSaveTransactions } from "../services/transaction_service"

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads")
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

const upload = multer({ storage })

const initializeBulkTransactionRoutes = (
  prisma: any,
  router: express.Router
) => {
  router.post(
    "/:id/transactions/bulk",
    upload.single("file"),
    async (req: express.Request, res: express.Response, next) => {
      const profileId = req.params.id

      const profile = await getProfile(prisma, profileId)
      if (profile === undefined) {
        return res.status(404).json({ error: "Not Found" })
      }

      const file = req.file
      if (!file) {
        return res
          .status(400)
          .json({ error: "No file attached. Please upload file" })
      }
      const newTransactions: any[] = []

      fs.createReadStream(file.path)
        .pipe(csv())
        .on("error", (error: any) => {
          return res.status(400).json({ error })
        })
        .on("data", async (row: any) => {
          let amount = row["Amount (EUR)"]
          amount = parseFloat(amount)

          const transactionDetails = {
            description: row.Payee,
            amount,
            recurring: false,
            recurringType: "monthly",
            day: new Date(row.Date).getDate(),
            currency: "euros",
            profileId: profile.id,
          }

          newTransactions.push(transactionDetails)
        })
        .on("end", async () => {
          const transactions = await bulkSaveTransactions(
            prisma,
            newTransactions
          )
          res.status(200).json({
            message: `Success! ${transactions.count} transaction(s) created`,
          })
        })
    }
  )

  return router
}

export default initializeBulkTransactionRoutes
