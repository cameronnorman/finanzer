import express from "express"
import { getProfile } from "../services/profile_service"
import { expensesByCategory, incomeExpenses } from "../services/reports_service"

const initializeReportsRoutes = (prisma: any, router: express.Router) => {
  router.get(
    "/:id/reports/expenses_by_category",
    async (req: express.Request, res: express.Response, next: any) => {
      const profile = await getProfile(prisma, req.params.id)
      if (!profile) {
        return res.status(404).json("Profile not found")
      }

      const report = await expensesByCategory(prisma, profile.id)

      return res.status(200).json(report)
    }
  )

  router.get(
    "/:id/reports/income_expenses",
    async (req: express.Request, res: express.Response, next: any) => {
      const profile = await getProfile(prisma, req.params.id)
      if (!profile) {
        return res.status(404).json("Profile not found")
      }

      const report = await incomeExpenses(prisma, profile.id)

      return res.status(200).json(report)
    }
  )

  return router
}

export default initializeReportsRoutes
