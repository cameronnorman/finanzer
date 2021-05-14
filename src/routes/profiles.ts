import express from "express"
import { body, validationResult } from "express-validator"

import initializeBulkTransactionRoutes from "./bulk_transactions"
import initializeTransactionsRoutes from "./transactions"
import initializeCategoriesRoutes from "./categories"
import initializeReportsRoutes from "./reports"

import {
  getProfile,
  createProfile,
  getProfileByEmail,
  updateProfile,
} from "../services/profile_service"

let router = express.Router()

router.get(
  "/:id",
  async (req: express.Request, res: express.Response, next: any) => {
    const profileId = req.params.id
    const profile = await getProfile(profileId)
    if (!profile) {
      return res.status(404).json("Profile not found")
    }

    res.status(200).json(profile)
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
      const profile = await createProfile(newProfile)
      return res.status(201).json(profile)
    } catch {
      return res
        .status(422)
        .json({ error: "Unable to create profile. Profile already exists" })
    }
  }
)

router.get(
  "/by_email/:email",
  async (req: express.Request, res: express.Response, next: any) => {
    const profileEmail = req.params.email

    const profile = await getProfileByEmail(profileEmail)
    if (!profile) {
      return res.status(404).json("Profile not found")
    }

    return res.status(200).json(profile)
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

    const profile = await getProfile(profileId)
    if (!profile) {
      return res.status(404).json("Profile not found")
    }

    const profileDetails = req.body
    await updateProfile(profileId, profileDetails)
    const updatedProfile = await getProfile(profileId)

    res.status(200).json(updatedProfile)
  }
)

router = initializeCategoriesRoutes(router)
router = initializeBulkTransactionRoutes(router)
router = initializeTransactionsRoutes(router)
router = initializeReportsRoutes(router)

export default router
