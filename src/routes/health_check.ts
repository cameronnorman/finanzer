import express from "express"

let router = express.Router()

// Health check for server
router.get("/check", (req: express.Request, res: express.Response) => {
  res.send("OK");
});

export default router
