import { Router } from "express";
import { createContract, getMyContracts } from "../controllers/contract.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createContractSchema } from "../validation/schemas.js";

const router = Router();

router.post(
  "/listings/:id/contract",
  requireAuth,
  validate(createContractSchema),
  createContract
);
router.get("/contracts/mine", requireAuth, getMyContracts);

export default router;