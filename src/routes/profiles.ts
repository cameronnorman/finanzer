import express from "express"
import { getRepository, InsertResult } from "typeorm"
import { Profile } from "../entity/Profile"

const router = express.Router()

router.get("/profile/:id", (req: express.Request, res: express.Response, next) => {
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

router.put("/profile/:id", (req: express.Request, res: express.Response, next) => {
  const profileId = req.params.id

  const profileRepository = getRepository(Profile)
  const updatedProfileDetails = {
    id: profileId,
    ...req.body
  }

  profileRepository.save(updatedProfileDetails)
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

export default router
