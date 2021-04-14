import express from "express"
import { getRepository, createQueryBuilder } from "typeorm"
import { body, validationResult } from 'express-validator';

import { Profile } from "../entity/Profile"
import { Transaction } from "../entity/Transaction"
import { Category } from "../entity/Category";
import initializeBulkTransactionRoutes from './bulk_transactions';
import initializeCategoriesRoutes from './categories';
import getNetProfileBalance from '../services/profile_service';

let router = express.Router()

router.get("/:id", (req: express.Request, res: express.Response, next: any) => {
  const profileId = req.params.id

  const profileRepository = getRepository(Profile)
  profileRepository.findOne({ where: { id: profileId } })
    .then((profile: Profile) => {
      if (profile) {
        getNetProfileBalance(profile)
          .then((netBalance: number) => {
            res.status(200).json({ ...profile, netBalance })
            next()
          })
      } else {
        res.status(404)
        next()
      }
  })
})

router.post(
  "/",
  body('email').not().isEmpty(),
  (req: express.Request, res: express.Response, next: any) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const profileRepository = getRepository(Profile)
  const newProfile = {email: req.body.email, balance: 0, currency: "EUR"}

  profileRepository.save(newProfile)
    .then((profile: Profile) => {
      getNetProfileBalance(profile)
        .then((netBalance: number) => {
          res.status(201).json({ ...profile, netBalance })
          next()
        })
    })
})

router.get("/by_email/:email", (req: express.Request, res: express.Response, next: any) => {
  const profileEmail = req.params.email
  const profileRepository = getRepository(Profile)

  profileRepository.findOne({ where: { email: profileEmail } })
    .then((profile: Profile) => {
      if (profile) {
        getNetProfileBalance(profile)
          .then((netBalance: number) => {
            res.status(200).json({ ...profile, netBalance })
            next()
          })
      } else {
        res.status(404)
        next()
      }
  })
})

router.put(
  "/:id",
  body('balance').not().isEmpty(),
  body('currency').isIn(["EUR", "ZAR", "USD"]).not().isEmpty(),
  async (req: express.Request, res: express.Response, next: any) => {
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

router.get("/:id/transactions", (req: express.Request, res: express.Response, next: any) => {
  const profileId = req.params.id
  const profileRepository = getRepository(Profile)
  profileRepository.findOne({ where: { id: profileId }, relations: ["transactions"] })
    .then((profile: Profile) => {
      if (profile) {
        const limit: number = Number(req.query.per_page) || 10
        const offset: number = (Number(req.query.page) - 1) || 0

        getRepository(Transaction)
          .createQueryBuilder("transaction")
          .where("transaction.profileId = :profileId", { profileId: profile.id })
          .limit(limit)
          .offset(offset)
          .getMany()
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

router = initializeCategoriesRoutes(router)
router = initializeBulkTransactionRoutes(router)

export default router
