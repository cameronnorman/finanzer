import express from "express";

const router = express.Router();

// Health check for server
router.get("/check", (req: express.Request, res: express.Response, next) => {
  return res.send("OK");
});

export default router;
