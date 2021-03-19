import express from "express"
import { getRepository, UpdateResult } from "typeorm"
import { Profile } from "../entity/Profile"
import { Transaction } from "../entity/Transaction"
import { body, validationResult } from 'express-validator';
import initializeBulkTransactionRoutes from './bulk_transactions';

let router = express.Router()

router.get("/:id", (req: express.Request, res: express.Response, next) => {
  const profileId = req.params.id

  const profileRepository = getRepository(Profile)
  profileRepository.findOne({ where: { id: profileId } })
    .then((profile: Profile) => {
      if (profile) {
        res.status(200).json(profile)
        next()
      } else {
        res.status(404)
        next()
      }
  })
})

router.put(
  "/:id",
  body('balance').not().isEmpty(),
  body('currency').not().isEmpty(),
  async (req: express.Request, res: express.Response, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const profileId = req.params.id
    const profileRepository = getRepository(Profile)

    const currentProfile: Profile = await profileRepository.findOne({ where: { id: profileId } })
    if (currentProfile === undefined) {
      return res.status(404).json({error: "Not Found"})
    }

    await profileRepository.update(profileId, { balance: req.body.balance, currency: req.body.currency })
    const updatedProfile: Profile = await profileRepository.findOne({ where: { id: profileId } })
    res.status(200).json(updatedProfile)
    next()
})

router.get("/:id/transactions", (req: express.Request, res: express.Response, next) => {
  const profileId = req.params.id
  const profileRepository = getRepository(Profile)
  profileRepository.findOne({ where: { id: profileId }, relations: ["transactions"] })
    .then((profile: Profile) => {
      if (profile) {
        res.status(200).json(profile.transactions)
        next()
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
  body('currency').not().isEmpty(),
  (req: express.Request, res: express.Response, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const profileId = req.params.id
    const profileRepository = getRepository(Profile)
    const transactionRepository = getRepository(Transaction)
    const transactionDetails: any = req.body

    profileRepository.findOne({ where: { id: profileId } })
      .then((profile: Profile) => {
        if (profile) {
          transactionDetails.profile = profile
          transactionRepository.save(transactionDetails)
            .then((transaction: Transaction) => {
              res.status(200).json(transaction)
              next()
            })
        } else {
          res.status(404).json({error: "Not Found"})
          next()
        }
    })
})

router = initializeBulkTransactionRoutes(router)

export default router
