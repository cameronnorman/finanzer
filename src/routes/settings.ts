import express from "express"
import { getProfile } from "../services/profile_service"
import { getSettings, updateSettings } from "../services/settings_service"

const initializeSettingsRoutes = (prisma: any, router: express.Router) => {
  router.put(
    "/:id/settings/:settingsId",
    async (req: express.Request, res: express.Response) => {
      const profileId = req.params.id
      const profile = await getProfile(prisma, profileId)
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" })
      }

      const settingsId = req.params.settingsId
      const settings = await getSettings(prisma, settingsId)
      if (!settings) {
        return res.status(404).json({ error: "Settings not found" })
      }

      const updatedSettings = await updateSettings(prisma, settingsId, {
        data: req.body,
      })

      return res.status(200).json(updatedSettings)
    }
  )

  return router
}

export default initializeSettingsRoutes
