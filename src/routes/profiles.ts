import express from "express"
import { getRepository, InsertResult } from "typeorm";
import { Profile } from "../entity/Profile";

let router = express.Router()

router.get("/profile/:id", (req: express.Request, res: express.Response) => {
  const profileId = req.params.id

  const profileRepository = getRepository(Profile)
  profileRepository.findOne({ where: { id: profileId } })
    .then((profile: Profile) => {
      if (profile) {
        res.status(200).json(profile)
      } else {
        res.status(404).json({})
      }
  })
});

router.put("/profile/:id", (req: express.Request, res: express.Response) => {
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
      } else {
        res.status(404).json({})
      }
    })
});

export default router
