import express from "express";
import { getRepository, createQueryBuilder } from "typeorm";
import { body, validationResult } from "express-validator";

import { Profile } from "../entity/Profile";

import initializeBulkTransactionRoutes from "./bulk_transactions";
import initializeTransactionsRoutes from "./transactions";
import initializeCategoriesRoutes from "./categories";

import { getNetProfileBalance, getProfile } from "../services/profile_service";

let router = express.Router();

router.get(
  "/:id",
  async (req: express.Request, res: express.Response, next: any) => {
    const profileId = req.params.id;
    const profile = await getProfile(profileId);
    if (!profile) {
      return res.status(404).json("Profile not found");
    }

    const netBalance = getNetProfileBalance(profile);
    res.status(200).json({ ...profile, netBalance });
  }
);

router.post(
  "/",
  body("email").not().isEmpty(),
  (req: express.Request, res: express.Response, next: any) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const profileRepository = getRepository(Profile);
    const newProfile = { email: req.body.email, balance: 0, currency: "EUR" };

    profileRepository.save(newProfile).then((profile: Profile) => {
      getNetProfileBalance(profile).then((netBalance: number) => {
        res.status(201).json({ ...profile, netBalance });
        next();
      });
    });
  }
);

router.get(
  "/by_email/:email",
  (req: express.Request, res: express.Response, next: any) => {
    const profileEmail = req.params.email;
    const profileRepository = getRepository(Profile);

    profileRepository
      .findOne({ where: { email: profileEmail } })
      .then((profile: Profile) => {
        if (profile) {
          getNetProfileBalance(profile).then((netBalance: number) => {
            res.status(200).json({ ...profile, netBalance });
            next();
          });
        } else {
          res.status(404);
          next();
        }
      });
  }
);

router.put(
  "/:id",
  body("balance").not().isEmpty(),
  body("currency").isIn(["EUR", "ZAR", "USD"]).not().isEmpty(),
  async (req: express.Request, res: express.Response, next: any) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const profileId = req.params.id;
    const profileRepository = getRepository(Profile);

    const currentProfile: Profile = await profileRepository.findOne({
      where: { id: profileId },
    });
    if (currentProfile === undefined) {
      return res.status(404).json({ error: "Not Found" });
    }

    await profileRepository.update(profileId, {
      balance: req.body.balance,
      currency: req.body.currency,
    });
    const updatedProfile: Profile = await profileRepository.findOne({
      where: { id: profileId },
    });
    res.status(200).json(updatedProfile);
    next();
  }
);

router = initializeCategoriesRoutes(router);
router = initializeBulkTransactionRoutes(router);
router = initializeTransactionsRoutes(router);

export default router;
