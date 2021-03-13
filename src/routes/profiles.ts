import express from "express"
import { getRepository, InsertResult } from "typeorm"
import { Profile } from "../entity/Profile"
import { body, validationResult } from 'express-validator';

const router = express.Router()

router.get("/:id", (req: express.Request, res: express.Response, next) => {
  const profileId = req.params.id

  const profileRepository = getRepository(Profile)
  profileRepository.findOne({ where: { id: profileId } })
    .then((profile: Profile) => {
      if (profile) {
        res.status(200).json(profile)
        next()
      } else {
        res.status(404).json({})
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

    const currentProfile = await profileRepository.findOne({ where: { id: profileId } })
    if (currentProfile === undefined) {
      return res.status(404).json({})
    }

    const updatedProfileDetails = {
      id: profileId,
      ...req.body
    }
    profileRepository.save(updatedProfileDetails)
      .then((profile: Profile) => {
        return res.status(200).json(profile)
      })
})

export default router
