import express from "express"
import { body, validationResult } from "express-validator"
import {
  createProfile,
  getNetProfileBalance,
  getProfile,
  getProfileByEmail,
  updateProfile,
} from "../services/profile_service"
import initializeBulkTransactionRoutes from "./bulk_transactions"
import initializeCategoriesRoutes from "./categories"
import initializeReportsRoutes from "./reports"
import initializeTransactionsRoutes from "./transactions"

export const createProfilesRouter = (prisma: any) => {
  let router = express.Router()

  router.get(
    "/:id",
    async (req: express.Request, res: express.Response, next: any) => {
      const profileId = req.params.id
      const profile = await getProfile(prisma, profileId)
      if (!profile) {
        return res.status(404).json("Profile not found")
      }

      profile.netBalance = await getNetProfileBalance(prisma, profile)

      res.status(200).json(profile)
    }
  )

  router.get(
    "/by_email/:email",
    async (req: express.Request, res: express.Response, next: any) => {
      const profileEmail = req.params.email

      const profile = await getProfileByEmail(prisma, profileEmail)
      if (!profile) {
        return res.status(404).json("Profile not found")
      }

      return res.status(200).json(profile)
    }
  )

  router.post(
    "/",
    body("email").not().isEmpty(),
    async (req: express.Request, res: express.Response, next: any) => {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const newProfile = { email: req.body.email, balance: 0, currency: "EUR" }

      try {
        const profile = await createProfile(prisma, newProfile)
        return res.status(201).json(profile)
      } catch {
        return res
          .status(422)
          .json({ error: "Unable to create profile. Profile already exists" })
      }
    }
  )

  router.put(
    "/:id",
    body("balance").not().isEmpty(),
    body("currency").isIn(["EUR", "ZAR", "USD"]).not().isEmpty(),
    async (req: express.Request, res: express.Response, next: any) => {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const profileId = req.params.id

      const profile = await getProfile(prisma, profileId)
      if (!profile) {
        return res.status(404).json("Profile not found")
      }

      const profileDetails = req.body
      await updateProfile(prisma, profileId, profileDetails)
      const updatedProfile = await getProfile(prisma, profileId)

      res.status(200).json(updatedProfile)
    }
  )

  router = initializeCategoriesRoutes(prisma, router)
  router = initializeTransactionsRoutes(prisma, router)
  router = initializeReportsRoutes(prisma, router)
  router = initializeBulkTransactionRoutes(prisma, router)

  return router
}
