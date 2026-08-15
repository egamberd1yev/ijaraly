import { Router } from "express";
import { signup, login, getMe, updateProfile } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  signupSchema,
  loginSchema,
  updateProfileSchema,
} from "../validation/schemas.js";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, validate(updateProfileSchema), updateProfile);

export default router;
